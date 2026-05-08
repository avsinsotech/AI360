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
    public class VoterProxyController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly TushGptBackend.Data.AppDbContext _db;
        private readonly TushGptBackend.Services.CreditService _credit;
        private const string BaseUrl = "http://192.168.20.151:90";

        public VoterProxyController(IHttpClientFactory httpClientFactory, TushGptBackend.Data.AppDbContext db, TushGptBackend.Services.CreditService credit)
        {
            _httpClient = httpClientFactory.CreateClient();
            _db = db;
            _credit = credit;
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/437.36");
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetHistory([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();

            var query = _db.VerifiedVoters.AsQueryable();
            if (userRole != "SUPER_ADMIN")
            {
                if (string.IsNullOrEmpty(userClientCode)) return BadRequest(new { message = "ClientCode not found in token." });
                query = query.Where(a => a.ClientCode == userClientCode);
            }

            var total = await query.CountAsync();
            var items = await query.OrderByDescending(x => x.VerifiedAt).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            return Ok(new { items, total, page, pageSize, totalPages = (int)System.Math.Ceiling(total / (double)pageSize) });
        }

        [HttpPost("verify")]
        public async Task<IActionResult> VerifyVoter([FromQuery] string voterId)
        {
            if (string.IsNullOrEmpty(voterId)) return BadRequest("Voter ID is required.");

            var clientCode = HttpContext.Items["ClientCode"]?.ToString();
            var userId = HttpContext.Items["UserId"]?.ToString() ?? "0";

            // Duplicate check
            var existing = await _db.VerifiedVoters.FirstOrDefaultAsync(v => v.VoterId == voterId && v.ClientCode == clientCode);
            if (existing != null)
                return StatusCode(409, new { message = "Warning: This Voter ID has already been successfully verified by your organization." });

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
                string bankName = clientCode ?? "TushGPT";
                if (!string.IsNullOrEmpty(clientCode) && clientCode != "GLOBAL")
                {
                    var client = await _db.Clients.FirstOrDefaultAsync(c => c.ClientCode == clientCode);
                    if (client != null) bankName = client.Name;
                }

                var targetUrl = $"{BaseUrl}/ovd/FrmVoterAPI.aspx?Voter={voterId}&BankName={System.Uri.EscapeDataString(bankName)}&ClientId={userId}";
                Console.WriteLine($"[VOTER DEBUG] Calling: {targetUrl}");

                var response = await _httpClient.GetAsync(targetUrl);
                var content = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"[VOTER DEBUG] HTTP {response.StatusCode}, len={content.Length}");

                if (!response.IsSuccessStatusCode)
                    return StatusCode(502, new { message = $"External Voter API returned error ({(int)response.StatusCode})." });

                bool isSuccess = false;
                string apiMessage = "Voter verification failed.";
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
                        if (st.ValueKind == System.Text.Json.JsonValueKind.False || stVal == "false" || stVal == "failed" || stVal == "error" || stVal == "404" || stVal == "0")
                            hasExplicitFailure = true;
                        if (stVal.Contains("invalid") || stVal.Contains("not found"))
                            hasExplicitFailure = true;
                    }

                    if (json.RootElement.TryGetProperty("error", out var errNode)) {
                        hasExplicitFailure = true;
                        if (errNode.ValueKind == System.Text.Json.JsonValueKind.String && (apiMessage == "Voter verification failed." || apiMessage.Contains("error")))
                            apiMessage = errNode.GetString() ?? apiMessage;
                    }
                    
                    isSuccess = !hasExplicitFailure;
                } catch {
                    isSuccess = false;
                    if (content.Contains("<html", System.StringComparison.OrdinalIgnoreCase) || content.Contains("<!DOCTYPE", System.StringComparison.OrdinalIgnoreCase))
                        apiMessage = "Voter verification failed: Provider returned an error page.";
                }

                if (!isSuccess) {
                    return StatusCode(400, new { message = apiMessage, raw = content });
                }

                if (isSuccess)
                {
                    string extractedName = ExtractNameFromRaw(content);
                    var record = new VerifiedVoter {
                        VoterId = voterId,
                        Name = extractedName,
                        VerifiedAt = System.DateTime.Now,
                        ClientCode = clientCode,
                        RawResponse = content
                    };
                    // DEBIT ONLY ON SUCCESS
                    if (!string.IsNullOrEmpty(clientCode) && clientCode != "GLOBAL")
                    {
                        int? uid = null;
                        if (int.TryParse(userId, out var parsedUid)) uid = parsedUid;
                        await _credit.DeductCreditAsync(clientCode, "VOTER", voterId, uid, HttpContext.Connection.RemoteIpAddress?.ToString());
                    }

                    _db.VerifiedVoters.Add(record);
                    await _db.SaveChangesAsync();
                    Console.WriteLine("[VOTER DEBUG] Saved to DB");
                }

                return Content(content, "application/json");
            }
            catch (System.Exception ex)
            {
                Console.WriteLine($"[VOTER DEBUG] Exception: {ex.Message}");
                return StatusCode(502, new { message = $"Proxy Error: {ex.Message}" });
            }
        }

        private string ExtractNameFromRaw(string content)
        {
            try {
                var json = System.Text.Json.JsonDocument.Parse(content);
                if (json.RootElement.TryGetProperty("name", out var n)) return n.GetString() ?? "N/A";
                if (json.RootElement.TryGetProperty("fullName", out var fn)) return fn.GetString() ?? "N/A";
                if (json.RootElement.TryGetProperty("data", out var data)) {
                    if (data.TryGetProperty("name", out var n2)) return n2.GetString() ?? "N/A";
                    if (data.TryGetProperty("fullName", out var fn2)) return fn2.GetString() ?? "N/A";
                    if (data.TryGetProperty("voterName", out var vn)) return vn.GetString() ?? "N/A";
                    if (data.TryGetProperty("name_v1", out var nv1)) return nv1.GetString() ?? "N/A";
                    if (data.TryGetProperty("name_v2", out var nv2)) return nv2.GetString() ?? "N/A";
                }
            } catch { }
            return "N/A";
        }
    }
}
