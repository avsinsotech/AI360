using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace TushGptBackend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AadharProxyController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly TushGptBackend.Data.AppDbContext _db;
        private readonly TushGptBackend.Services.CreditService _credit;
        private readonly string BaseUrl;

        public AadharProxyController(IHttpClientFactory httpClientFactory, TushGptBackend.Data.AppDbContext db, TushGptBackend.Services.CreditService credit, IConfiguration config)
        {
            _httpClient = httpClientFactory.CreateClient();
            _db = db;
            _credit = credit;
            BaseUrl = config["ExternalServices:ProxyBaseUrl"] ?? "http://192.168.20.151:90";
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36");
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetHistory([FromQuery] string? aadhaarNo)
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();

            var query = _db.VerifiedAadhars.AsQueryable();
            if (userRole != "SUPER_ADMIN")
            {
                if (string.IsNullOrEmpty(userClientCode)) return BadRequest(new { message = "ClientCode not found in token." });
                query = query.Where(a => a.ClientCode == userClientCode);
            }

            if (!string.IsNullOrEmpty(aadhaarNo))
            {
                query = query.Where(a => a.AadhaarNo == aadhaarNo);
            }

            var history = await query
                .OrderByDescending(a => a.VerifiedAt)
                .Select(a => new {
                    a.Id,
                    a.AadhaarNo,
                    a.Name,
                    a.MobileNo,
                    a.VerifiedAt,
                    a.Dob,
                    a.Gender,
                    a.Address,
                    Photo = string.IsNullOrEmpty(a.Photo) ? a.CapturedPhoto : a.Photo,
                    a.RawResponse,
                    a.PanNo,
                    a.LocationInfo,
                    a.ValuationDoc,
                    a.ClientCode
                })
                .ToListAsync();

            var filtered = history.Where(a => !string.IsNullOrEmpty(a.AadhaarNo)).ToList();
            return Ok(filtered);
        }

        [HttpGet("history/{id}")]
        public async Task<IActionResult> GetHistoryDetail(int id)
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();

            var record = await _db.VerifiedAadhars.FirstOrDefaultAsync(a => a.Id == id);
            if (record == null) return NotFound();

            if (userRole != "SUPER_ADMIN" && record.ClientCode != userClientCode)
            {
                return Unauthorized("You do not have permission to view this record.");
            }

            return Ok(record);
        }

        [HttpPost("save")]
        public async Task<IActionResult> SaveRecord([FromBody] Models.VerifiedAadhar record)
        {
            if (record == null) return BadRequest("Invalid record data");
            
            try 
            {
                var userRole = HttpContext.Items["UserRole"]?.ToString();
                var userClientCode = HttpContext.Items["ClientCode"]?.ToString();

                if (userRole != "SUPER_ADMIN")
                {
                    if (string.IsNullOrEmpty(userClientCode)) return Unauthorized("ClientCode missing from token.");
                    record.ClientCode = userClientCode;
                }
                else if (string.IsNullOrEmpty(record.ClientCode))
                {
                    record.ClientCode = userClientCode;
                }

                record.VerifiedAt = System.DateTime.Now;
                
                var cleanAadhaar = record.AadhaarNo?.Trim() ?? "";
                var cleanClient = record.ClientCode?.Trim() ?? "";

                var existing = await _db.VerifiedAadhars
                    .FirstOrDefaultAsync(a => (a.AadhaarNo ?? "").Trim() == cleanAadhaar 
                                         && (a.ClientCode ?? "").Trim() == cleanClient);

                if (existing != null)
                {
                    existing.Name = record.Name;
                    existing.Dob = record.Dob;
                    existing.Gender = record.Gender;
                    existing.Address = record.Address;
                    existing.Photo = record.Photo;
                    existing.RawResponse = record.RawResponse;
                    if (!string.IsNullOrEmpty(record.CapturedPhoto)) existing.CapturedPhoto = record.CapturedPhoto;
                    if (!string.IsNullOrEmpty(record.PanNo)) existing.PanNo = record.PanNo;
                    if (!string.IsNullOrEmpty(record.LocationInfo)) existing.LocationInfo = record.LocationInfo;
                    
                    _db.VerifiedAadhars.Update(existing);
                    await _db.SaveChangesAsync();
                    return Ok(existing);
                }
                else
                {
                    _db.VerifiedAadhars.Add(record);
                    await _db.SaveChangesAsync();
                    return Ok(record);
                }
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, $"Database Error: {ex.Message}");
            }
        }

        [HttpGet("send-otp")]
        public async Task<IActionResult> SendOtp([FromQuery] string adharNo)
        {
            if (string.IsNullOrEmpty(adharNo))
                return BadRequest("Aadhaar number is required.");

            // Initial Credit Check (Before sending OTP)
            var clientCode = HttpContext.Items["ClientCode"]?.ToString();
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
                var targetUrl = $"{BaseUrl}/OVD_L/Frm.aspx?adharNo={adharNo}";
                var response = await _httpClient.GetAsync(targetUrl);
                var content = await response.Content.ReadAsStringAsync();
                
                return Content(content, response.Content.Headers.ContentType?.ToString() ?? "application/json");
            }
            catch (System.Exception ex)
            {
                return StatusCode(502, $"Proxy Error: {ex.Message}");
            }
        }

        [HttpGet("verify-otp")]
        public async Task<IActionResult> VerifyOtp()
        {
            var clientCode = HttpContext.Items["ClientCode"]?.ToString();
            
            // 1. Initial Balance Check
            if (!string.IsNullOrEmpty(clientCode) && clientCode != "GLOBAL")
            {
                var balance = await _credit.GetBalanceAsync(clientCode);
                if (balance <= 0)
                {
                    return StatusCode(402, new { message = "Insufficient credits. Please add credits to your wallet to use verification services." });
                }
            }

            var queryString = Request.QueryString.Value;
            try
            {
                var targetUrl = $"{BaseUrl}/OVD/FrmVerifyOTP.aspx{queryString}";
                var response = await _httpClient.GetAsync(targetUrl);
                var content = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    // 2. Check if the verification actually SUCCEEDED in the JSON
                    bool isSuccess = false;
                    try {
                        var json = System.Text.Json.JsonDocument.Parse(content);
                        if (json.RootElement.TryGetProperty("status", out var st)) {
                            var stVal = st.ToString().ToLower();
                            isSuccess = st.ValueKind != System.Text.Json.JsonValueKind.False && stVal != "false" && stVal != "failed";
                        } else {
                            // Fallback if status is missing but we have data
                            isSuccess = json.RootElement.TryGetProperty("data", out _);
                        }
                    } catch { isSuccess = false; }

                    // 3. Debit ONLY ON SUCCESS
                    if (isSuccess && !string.IsNullOrEmpty(clientCode) && clientCode != "GLOBAL")
                    {
                        int? userId = null;
                        if (int.TryParse(HttpContext.Items["UserId"]?.ToString(), out var uid)) userId = uid;
                        await _credit.DeductCreditAsync(clientCode, "AADHAAR", null, userId, HttpContext.Connection.RemoteIpAddress?.ToString());
                    }
                }

                return Content(content, response.Content.Headers.ContentType?.ToString() ?? "application/json");
            }
            catch (System.Exception ex)
            {
                return StatusCode(502, $"Proxy Error: {ex.Message}");
            }
        }

        [HttpGet("check-pan-match")]
        public async Task<IActionResult> CheckPanMatch([FromQuery] string? pan, [FromQuery] string name)
        {
            if (string.IsNullOrEmpty(name)) return BadRequest("Name is required.");

            var clientCode = HttpContext.Items["ClientCode"]?.ToString();
            
            // Normalize incoming Aadhaar name
            string n1 = name.Trim().ToLower().Replace("  ", " ");
            Models.VerifiedPan? existingPan = null;

            if (!string.IsNullOrEmpty(pan)) {
                // Try specific PAN match first
                existingPan = await _db.VerifiedPans
                    .Where(p => p.PanNo == pan)
                    .OrderByDescending(p => p.VerifiedAt)
                    .FirstOrDefaultAsync();
            }

            if (existingPan == null) {
                // Fallback: Search by NAME ONLY across the table
                var candidates = await _db.VerifiedPans.OrderByDescending(p => p.VerifiedAt).ToListAsync();
                var parts1 = n1.Split(' ', System.StringSplitOptions.RemoveEmptyEntries);

                foreach(var p in candidates) {
                    string n2 = p.Name.Trim().ToLower().Replace("  ", " ");
                    bool isMatch = n1 == n2;

                    if (isMatch) {
                        existingPan = p;
                        break;
                    }
                }
            }

            if (existingPan == null) return Ok(new { isMatch = false, message = "No matching PAN record found in history for this name." });

            return Ok(new { isMatch = true, panNo = existingPan.PanNo, matchedName = existingPan.Name });
        }

        [HttpPost("upload-doc/{id}")]
        public async Task<IActionResult> UploadDoc(int id, [FromBody] DocUploadRequest request)
        {
            var record = await _db.VerifiedAadhars.FindAsync(id);
            if (record == null) return NotFound();
            record.ValuationDoc = request.Doc;
            await _db.SaveChangesAsync();
            return Ok(new { message = "Document uploaded successfully" });
        }

        public class DocUploadRequest {
            public string Doc { get; set; } = string.Empty;
        }
    }
}
