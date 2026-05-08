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
    public class GstProxyController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly TushGptBackend.Data.AppDbContext _db;
        private readonly TushGptBackend.Services.CreditService _credit;
        private const string BaseUrl = "http://192.168.20.151:90";

        public GstProxyController(IHttpClientFactory httpClientFactory, TushGptBackend.Data.AppDbContext db, TushGptBackend.Services.CreditService credit)
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

            var query = _db.VerifiedGsts.AsQueryable();
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
        public async Task<IActionResult> VerifyGst([FromQuery] string gst)
        {
            if (string.IsNullOrEmpty(gst))
                return BadRequest("GSTIN is required.");

            var clientCode = HttpContext.Items["ClientCode"]?.ToString();
            var userId = HttpContext.Items["UserId"]?.ToString() ?? "0";

            // Check if already verified for this client
            var existing = await _db.VerifiedGsts
                .FirstOrDefaultAsync(g => g.Gstin == gst && g.ClientCode == clientCode);
            if (existing != null)
            {
                return StatusCode(409, new { message = "Warning: This GSTIN has already been successfully verified by your organization." });
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
                // Fetch client name for BankName parameter
                string bankName = clientCode ?? "TushGPT";
                if (!string.IsNullOrEmpty(clientCode) && clientCode != "GLOBAL")
                {
                    var client = await _db.Clients.FirstOrDefaultAsync(c => c.ClientCode == clientCode);
                    if (client != null) bankName = client.Name;
                }

                var targetUrl = $"{BaseUrl}/ovd/FrmGST.aspx?GST={gst}&BankName={System.Uri.EscapeDataString(bankName)}&ClientId={userId}";
                Console.WriteLine($"[GST DEBUG] Calling: {targetUrl}");

                var response = await _httpClient.GetAsync(targetUrl);
                var content = await response.Content.ReadAsStringAsync();

                Console.WriteLine($"[GST DEBUG] HTTP Status: {response.StatusCode}");
                Console.WriteLine($"[GST DEBUG] Response length: {content.Length}");
                if (content.Length > 0)
                    Console.WriteLine($"[GST DEBUG] Response preview: {content.Substring(0, System.Math.Min(content.Length, 500))}");

                // If upstream returned error status
                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"[GST DEBUG] External API returned HTTP {(int)response.StatusCode}");
                    return StatusCode(502, new { message = $"External GST API returned error ({(int)response.StatusCode}). The GSTIN may be invalid." });
                }

                // Determine true success
                bool isSuccess = false;
                string apiMessage = "GST verification failed.";
                try {
                    var json = System.Text.Json.JsonDocument.Parse(content);
                    
                    bool hasExplicitFailure = false;
                    
                    if (json.RootElement.TryGetProperty("message", out var msgNode)) {
                        if (msgNode.ValueKind == System.Text.Json.JsonValueKind.String)
                            apiMessage = msgNode.GetString() ?? apiMessage;
                        var mVal = apiMessage.ToLower();
                        if (mVal.Contains("invalid") || mVal.Contains("not found") || mVal.Contains("no record") || mVal.Contains("error") || mVal.Contains("fail")) {
                            hasExplicitFailure = true;
                        }
                    }

                    if (json.RootElement.TryGetProperty("statuscode", out var sc) || json.RootElement.TryGetProperty("statusCode", out sc) || json.RootElement.TryGetProperty("StatusCode", out sc)) {
                        if (sc.ValueKind == System.Text.Json.JsonValueKind.Number && sc.GetInt32() != 200 && sc.GetInt32() != 201)
                            hasExplicitFailure = true;
                        else if (sc.ValueKind == System.Text.Json.JsonValueKind.String && sc.GetString() != "200" && sc.GetString() != "201")
                            hasExplicitFailure = true;
                    }

                    if (json.RootElement.TryGetProperty("status", out var st)) {
                        var stVal = st.ToString().ToLower();
                        if (st.ValueKind == System.Text.Json.JsonValueKind.False || stVal == "false" || stVal == "failed" || stVal == "error") {
                            hasExplicitFailure = true;
                        }
                        if (stVal.Contains("invalid") || stVal.Contains("not found"))
                            hasExplicitFailure = true;
                    }
                    if (json.RootElement.TryGetProperty("error", out var errNode)) {
                        hasExplicitFailure = true;
                        if (errNode.ValueKind == System.Text.Json.JsonValueKind.String && (apiMessage == "GST verification failed." || apiMessage.Contains("error")))
                            apiMessage = errNode.GetString() ?? apiMessage;
                    }
                    
                    isSuccess = !hasExplicitFailure;
                    Console.WriteLine($"[GST DEBUG] Valid JSON, hasExplicitFailure={hasExplicitFailure}, isSuccess={isSuccess}");
                } catch {
                    Console.WriteLine("[GST DEBUG] Response is NOT valid JSON — treating as failure");
                    isSuccess = false;
                    if (content.Contains("<html", System.StringComparison.OrdinalIgnoreCase) || content.Contains("<!DOCTYPE", System.StringComparison.OrdinalIgnoreCase))
                    {
                        apiMessage = "GST verification failed: Provider returned an error page. The GSTIN may be invalid.";
                    }
                }

                if (!isSuccess) {
                    return StatusCode(400, new { message = apiMessage, raw = content });
                }

                if (isSuccess)
                {
                    string extractedName = ExtractNameFromRaw(content);
                    Console.WriteLine($"[GST DEBUG] Extracted name: {extractedName}");

                    // DEBIT ONLY ON SUCCESS
                    if (!string.IsNullOrEmpty(clientCode) && clientCode != "GLOBAL")
                    {
                        int? uid = null;
                        if (int.TryParse(userId, out var parsedUid)) uid = parsedUid;
                        await _credit.DeductCreditAsync(clientCode, "GST", gst, uid, HttpContext.Connection.RemoteIpAddress?.ToString());
                    }

                    var record = new VerifiedGst {
                        Gstin = gst,
                        Name = extractedName,
                        VerifiedAt = System.DateTime.Now,
                        ClientCode = clientCode,
                        RawResponse = content
                    };
                    _db.VerifiedGsts.Add(record);
                    await _db.SaveChangesAsync();
                    Console.WriteLine("[GST DEBUG] Record saved to DB successfully");
                }

                return Content(content, "application/json");
            }
            catch (System.Exception ex)
            {
                Console.WriteLine($"[GST DEBUG] Exception: {ex.Message}");
                return StatusCode(502, new { message = $"Proxy Error: {ex.Message}" });
            }
        }

        private string ExtractNameFromRaw(string content)
        {
            try {
                var json = System.Text.Json.JsonDocument.Parse(content);
                if (json.RootElement.TryGetProperty("trade_name", out var tn)) return tn.GetString() ?? "N/A";
                if (json.RootElement.TryGetProperty("legal_name", out var ln)) return ln.GetString() ?? "N/A";
                if (json.RootElement.TryGetProperty("name", out var nameProp)) return nameProp.GetString() ?? "N/A";
                if (json.RootElement.TryGetProperty("data", out var data)) {
                    if (data.TryGetProperty("trade_name", out var tn2)) return tn2.GetString() ?? "N/A";
                    if (data.TryGetProperty("legal_name", out var ln2)) return ln2.GetString() ?? "N/A";
                    if (data.TryGetProperty("name", out var fn)) return fn.GetString() ?? "N/A";
                    if (data.TryGetProperty("Name", out var fn2)) return fn2.GetString() ?? "N/A";
                }
            } catch { }
            return "N/A";
        }
    }
}
