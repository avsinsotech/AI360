using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using TushGptBackend.Models;

namespace TushGptBackend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UdyamProxyController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly TushGptBackend.Data.AppDbContext _db;
        private readonly TushGptBackend.Services.CreditService _credit;
        private const string BaseUrl = "http://192.168.20.151:90";

        public UdyamProxyController(IHttpClientFactory httpClientFactory, TushGptBackend.Data.AppDbContext db, TushGptBackend.Services.CreditService credit)
        {
            _httpClient = httpClientFactory.CreateClient();
            _db = db;
            _credit = credit;
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/437.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/437.36");
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetHistory([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();

            var query = _db.VerifiedUdyams.AsQueryable();
            if (userRole != "SUPER_ADMIN")
            {
                if (string.IsNullOrEmpty(userClientCode)) return BadRequest(new { message = "ClientCode not found in token." });
                query = query.Where(a => a.ClientCode == userClientCode);
            }

            var total = await query.CountAsync();
            var items = await query
                .OrderByDescending(x => x.VerifiedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new {
                items,
                total,
                page,
                pageSize,
                totalPages = (int)System.Math.Ceiling(total / (double)pageSize)
            });
        }

        [HttpPost("verify")]
        public async Task<IActionResult> VerifyUdyam([FromQuery] string udyam)
        {
            if (string.IsNullOrEmpty(udyam))
                return BadRequest("Udyam registration number is required.");

            var clientCode = HttpContext.Items["ClientCode"]?.ToString();

            // Check if already verified for this client
            var existing = await _db.VerifiedUdyams
                .FirstOrDefaultAsync(u => u.UdyamNo == udyam && u.ClientCode == clientCode);
            if (existing != null)
            {
                return StatusCode(409, new { message = "Warning: This Udyam number has already been successfully verified by your organization." });
            }

            // INITIAL BALANCE CHECK ONLY
            if (!string.IsNullOrEmpty(clientCode) && clientCode != "GLOBAL")
            {
                var balance = await _credit.GetBalanceAsync(clientCode);
                if (balance <= 0)
                {
                    return StatusCode(402, new { message = "Insufficient credits. Please add credits to your wallet to use verification services." });
                }
            }

            try
            {
                var targetUrl = $"{BaseUrl}/ovd/FrmUdyam.aspx?UAdhar={udyam}&BankName={clientCode ?? "TushGPT"}&ClientId={clientCode ?? "TushGPT"}";
                Console.WriteLine($"[UDYAM DEBUG] Calling: {targetUrl}");
                
                var response = await _httpClient.GetAsync(targetUrl);
                var content = await response.Content.ReadAsStringAsync();

                Console.WriteLine($"[UDYAM DEBUG] HTTP Status: {response.StatusCode}");
                Console.WriteLine($"[UDYAM DEBUG] Response length: {content.Length}");
                if (content.Length > 0)
                    Console.WriteLine($"[UDYAM DEBUG] Response preview: {content.Substring(0, System.Math.Min(content.Length, 500))}");

                // If upstream returned error status, check if it's HTML (error page) vs JSON
                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"[UDYAM DEBUG] External API returned HTTP {(int)response.StatusCode}");
                    return StatusCode(502, new { message = $"External Udyam API returned error ({(int)response.StatusCode}). The Udyam number may be invalid." });
                }

                // Determine true success to prevent storing invalid Udyams - Strictly enforcing 200
                bool isSuccess = false;
                int? statusCodeFromApi = null;
                try {
                    var json = System.Text.Json.JsonDocument.Parse(content);
                    
                    // Check various status code fields (case-insensitive)
                    if (json.RootElement.TryGetProperty("status_code", out var sc)) statusCodeFromApi = sc.GetInt32();
                    else if (json.RootElement.TryGetProperty("statuscode", out var sc2)) statusCodeFromApi = sc2.GetInt32();
                    else if (json.RootElement.TryGetProperty("statusCode", out var sc3)) statusCodeFromApi = sc3.GetInt32();
                    
                    if (statusCodeFromApi.HasValue) {
                        // For Udyam, we strictly accept 200 as SUCCESS
                        isSuccess = statusCodeFromApi.Value == 200;
                    } else if (json.RootElement.TryGetProperty("status", out var st)) {
                        var stVal = st.ToString().ToLower();
                        isSuccess = st.ValueKind != System.Text.Json.JsonValueKind.False && stVal != "false" && stVal != "failed" && stVal != "error";
                    } else {
                        // Fallback only if NO status field exists at all but data is present
                        isSuccess = json.RootElement.TryGetProperty("data", out _);
                    }
                    
                    Console.WriteLine($"[UDYAM DEBUG] API Status={statusCodeFromApi}, isSuccess={isSuccess}");
                } catch {
                    isSuccess = false;
                }

                if (isSuccess)
                {
                    string extractedName = ExtractNameFromRaw(content);
                    Console.WriteLine($"[UDYAM DEBUG] Extracted name: {extractedName}");

                    var record = new VerifiedUdyam {
                        UdyamNo = udyam,
                        Name = extractedName,
                        VerifiedAt = System.DateTime.Now,
                        ClientCode = clientCode,
                        RawResponse = content
                    };
                    // DEBIT ONLY ON SUCCESS
                    if (!string.IsNullOrEmpty(clientCode) && clientCode != "GLOBAL")
                    {
                        int? userId = null;
                        if (int.TryParse(HttpContext.Items["UserId"]?.ToString(), out var uid)) userId = uid;
                        await _credit.DeductCreditAsync(clientCode, "UDYAM", udyam, userId, HttpContext.Connection.RemoteIpAddress?.ToString());
                    }
                    
                    return Content(content, "application/json");
                }
                else 
                {
                    // Return failure status code to let frontend handle error
                    int failureCode = (statusCodeFromApi.HasValue && statusCodeFromApi.Value > 0) ? statusCodeFromApi.Value : 422;
                    if (failureCode == 200) failureCode = 422; // Safeguard
                    
                    return StatusCode(failureCode, content);
                }
            }
            catch (System.Exception ex)
            {
                Console.WriteLine($"[UDYAM DEBUG] Exception: {ex.Message}");
                return StatusCode(502, new { message = $"Proxy Error: {ex.Message}" });
            }
        }

        private string ExtractNameFromRaw(string content)
        {
            try {
                var json = System.Text.Json.JsonDocument.Parse(content);
                var root = json.RootElement;

                // Try the specific schema provided by the user
                if (root.TryGetProperty("data", out var data)) {
                    if (data.TryGetProperty("enterprise_data", out var ed)) {
                        if (ed.TryGetProperty("name", out var n)) return n.GetString() ?? "N/A";
                    }
                    if (data.TryGetProperty("enterprise_name", out var en)) return en.GetString() ?? "N/A";
                    if (data.TryGetProperty("name", out var nameProp)) return nameProp.GetString() ?? "N/A";
                }

                // Fallbacks for other possible structures
                if (root.TryGetProperty("enterprise_name", out var en2)) return en2.GetString() ?? "N/A";
                if (root.TryGetProperty("name", out var nameProp2)) return nameProp2.GetString() ?? "N/A";
            } catch { }
            return "N/A";
        }
    }
}
