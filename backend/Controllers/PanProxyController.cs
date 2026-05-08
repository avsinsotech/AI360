using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using TushGptBackend.Models;

namespace TushGptBackend.Controllers
{
    public class PanVerifyDto
    {
        public string? Dob { get; set; }
        public string? PanType { get; set; }
        public string? Name { get; set; }
    }

    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class PanProxyController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly TushGptBackend.Data.AppDbContext _db;
        private readonly TushGptBackend.Services.CreditService _credit;
        private const string BaseUrl = "http://192.168.20.151:90";

        public PanProxyController(IHttpClientFactory httpClientFactory, TushGptBackend.Data.AppDbContext db, TushGptBackend.Services.CreditService credit)
        {
            _httpClient = httpClientFactory.CreateClient();
            _db = db;
            _credit = credit;
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/437.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/437.36");
        }

        [HttpGet("test-db")]
        [AllowAnonymous]
        public async Task<IActionResult> TestDb()
        {
            try {
                var items = await _db.VerifiedPans.OrderByDescending(x => x.VerifiedAt).Take(5).ToListAsync();
                return Ok(new { success = true, items });
            } catch (System.Exception ex) {
                return Ok(new { success = false, message = ex.Message, inner = ex.InnerException?.Message, stackTrace = ex.StackTrace });
            }
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetHistory([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();

            var query = _db.VerifiedPans.AsQueryable();
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
        public async Task<IActionResult> VerifyPan([FromQuery] string pan, [FromBody] PanVerifyDto? data)
        {
            if (string.IsNullOrEmpty(pan))
                return BadRequest("PAN number is required.");

            // Credit deduction
            var clientCode = HttpContext.Items["ClientCode"]?.ToString();
            
            // Check if already verified for this client
            var existing = await _db.VerifiedPans
                .FirstOrDefaultAsync(p => p.PanNo == pan && p.ClientCode == clientCode);
            if (existing != null)
            {
                return StatusCode(409, new { message = "Warning: This PAN has already been successfully verified by your organization." });
            }

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
                string bankName = clientCode ?? "TushGPT";
                string userId = HttpContext.Items["UserId"]?.ToString() ?? "0";

                if (!string.IsNullOrEmpty(clientCode) && clientCode != "GLOBAL")
                {
                    var client = await _db.Clients.FirstOrDefaultAsync(c => c.ClientCode == clientCode);
                    if (client != null) bankName = client.Name;
                }

                var targetUrl = $"{BaseUrl}/ovd/FrmPAN.aspx?PAN={pan}&BankName={System.Uri.EscapeDataString(bankName)}&ClientId={userId}";
                var response = await _httpClient.GetAsync(targetUrl);
                var content = await response.Content.ReadAsStringAsync();

                // Determine true success to prevent storing invalid PANs - Strictly enforcing 200
                bool isSuccess = false;
                int? statusCodeFromApi = null;
                try {
                    var json = System.Text.Json.JsonDocument.Parse(content);
                    
                    // Check various status code fields (case-insensitive)
                    if (json.RootElement.TryGetProperty("status_code", out var sc)) statusCodeFromApi = sc.GetInt32();
                    else if (json.RootElement.TryGetProperty("statuscode", out var sc2)) statusCodeFromApi = sc2.GetInt32();
                    else if (json.RootElement.TryGetProperty("statusCode", out var sc3)) statusCodeFromApi = sc3.GetInt32();
                    
                    if (statusCodeFromApi.HasValue) {
                        isSuccess = statusCodeFromApi.Value == 200 || statusCodeFromApi.Value == 1 || statusCodeFromApi.Value == 101;
                    } else if (json.RootElement.TryGetProperty("status", out var st)) {
                        var stVal = st.ToString().ToLower();
                        isSuccess = st.ValueKind != System.Text.Json.JsonValueKind.False && stVal != "false" && stVal != "failed";
                    } else {
                        // Fallback only if NO status field exists at all
                        isSuccess = json.RootElement.TryGetProperty("data", out _);
                    }
                } catch {
                    isSuccess = false;
                }

                if (isSuccess)
                {
                    // Save to database
                    string extractedName = ExtractNameFromRaw(content);
                    if (string.IsNullOrEmpty(extractedName) || extractedName == "N/A") extractedName = data?.Name ?? "N/A";

                    var record = new VerifiedPan {
                        PanNo = pan,
                        Name = extractedName,
                        Dob = data?.Dob,
                        PanType = data?.PanType,
                        VerifiedAt = System.DateTime.Now,
                        ClientCode = clientCode,
                        };
                    // DEBIT ONLY ON SUCCESS
                    if (!string.IsNullOrEmpty(clientCode) && clientCode != "GLOBAL")
                    {
                        int? uid = null;
                        if (int.TryParse(HttpContext.Items["UserId"]?.ToString(), out var parsedUid)) uid = parsedUid;
                        await _credit.DeductCreditAsync(clientCode, "PAN", pan, uid, HttpContext.Connection.RemoteIpAddress?.ToString());
                    }
                    
                    _db.VerifiedPans.Add(record);
                    await _db.SaveChangesAsync();
                    
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
                return StatusCode(502, $"Proxy Error: {ex.Message}");
            }
        }

        private string ExtractNameFromRaw(string content)
        {
            // The content is likely a JSON string from the provider.
            // Simplified: we'll try to parse it as JSON if possible.
            try {
                var json = System.Text.Json.JsonDocument.Parse(content);
                if (json.RootElement.TryGetProperty("name", out var nameProp)) return nameProp.GetString() ?? "N/A";
                if (json.RootElement.TryGetProperty("data", out var data) && data.TryGetProperty("full_name", out var fn)) return fn.GetString() ?? "N/A";
            } catch { }
            return "N/A";
        }
    }
}
