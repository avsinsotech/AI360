using Microsoft.AspNetCore.Mvc;
using System;
using System.Net.Http;
using System.Threading.Tasks;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TushGptBackend.Data;
using TushGptBackend.Models;
using System.Linq;
using Microsoft.AspNetCore.Authorization;

namespace TushGptBackend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class CibilProxyController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly AppDbContext _db;
        private readonly TushGptBackend.Services.CreditService _credit;
        private const string BaseUrl = "http://192.168.20.151:90";

        public CibilProxyController(IHttpClientFactory httpClientFactory, AppDbContext db, TushGptBackend.Services.CreditService credit)
        {
            _httpClient = httpClientFactory.CreateClient();
            _db = db;
            _credit = credit;
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36");
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetHistory([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();

            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 200) pageSize = 50;

            try
            {
                var query = _db.CibilReports.AsQueryable();
                if (userRole != "SUPER_ADMIN")
                {
                    if (string.IsNullOrEmpty(userClientCode)) return BadRequest(new { message = "ClientCode not found in token." });
                    query = query.Where(r => r.ClientCode == userClientCode);
                }

                var totalCount = await query.CountAsync();
                var history = await query
                    .OrderByDescending(r => r.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(r => new {
                        r.Id,
                        r.FName,
                        r.PAN,
                        r.DOB,
                        r.Phone,
                        r.Address,
                        r.Pincode,
                        r.CibilScore,
                        r.ReferenceId,
                        r.ReportOrderNumber,
                        r.CreatedAt,
                        r.ClientCode,
                        r.OpenAccounts,
                        r.TotalOutstanding,
                        r.OverdueCount,
                        r.SettledAccounts,
                        r.HardEnquiries,
                        r.SoftEnquiries
                        // Explicitly exclude DpdJson and RawJsonResponse here
                    })
                    .ToListAsync();

                return Ok(new { 
                    items = history, 
                    total = totalCount, 
                    page, 
                    pageSize, 
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize) 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Database Error: {ex.Message}");
            }
        }

        [HttpGet("verify")]
        public async Task<IActionResult> Verify(
            [FromQuery] string fname,
            [FromQuery] string phone,
            [FromQuery] string pan,
            [FromQuery] string dob,
            [FromQuery] string address,
            [FromQuery] string pincode)
        {
            if (string.IsNullOrEmpty(pan))
                return BadRequest("PAN number is required.");

            // Credit deduction for multi-tenant users
            var clientCode = HttpContext.Items["ClientCode"]?.ToString();
            if (!string.IsNullOrEmpty(clientCode) && clientCode != "GLOBAL")
            {
                var balance = await _credit.GetBalanceAsync(clientCode);
                if (balance <= 0)
                {
                    return StatusCode(402, new { message = "Insufficient credits. Please add credits to your wallet to use verification services." });
                }

                int? userId = null;
                if (int.TryParse(HttpContext.Items["UserId"]?.ToString(), out var uid)) userId = uid;
                var (success, _, msg) = await _credit.DeductCreditAsync(clientCode, "CIBIL", pan, userId, HttpContext.Connection.RemoteIpAddress?.ToString());
                if (!success)
                    return StatusCode(402, new { message = msg });
            }

            try
            {
                // User provided API URL structure
                var targetUrl = $"{BaseUrl}/OVD/FrmCibil.aspx" +
                               $"?fname={Uri.EscapeDataString(fname ?? "")}" +
                               $"&phone={phone ?? ""}" +
                               $"&pan={pan}" +
                               $"&dob={dob ?? ""}" +
                               $"&address={Uri.EscapeDataString(address ?? "")}" +
                               $"&pincode={pincode ?? ""}";

                var response = await _httpClient.GetAsync(targetUrl);
                var rawJsonString = await response.Content.ReadAsStringAsync();

                // Attempt to parse and extract CibilScore and other metrics
                string score = "N/A";
                string refId = "";
                string orderNo = "";
                bool apiStatus = false;

                int openAccs = 0;
                decimal totalOut = 0;
                int overdue = 0;
                int settled = 0;
                int hardEnq = 0;
                int softEnq = 0;
                string dpdJsonStr = "[]";

                try
                {
                    using (JsonDocument doc = JsonDocument.Parse(rawJsonString))
                    {
                        JsonElement root = doc.RootElement;
                        
                        // Check Status
                        if (root.TryGetProperty("status", out var statusElem))
                            apiStatus = statusElem.ValueKind == JsonValueKind.True;
                        else if (root.TryGetProperty("statuscode", out var codeElem))
                            apiStatus = (codeElem.ValueKind == JsonValueKind.Number && codeElem.GetInt32() == 200) || 
                                       (codeElem.ValueKind == JsonValueKind.String && codeElem.GetString() == "200");

                        // Extract reference_id
                        if (root.TryGetProperty("reference_id", out var refElem))
                            refId = refElem.ToString();
                            
                        // Extract reportOrderNumber
                        if (root.TryGetProperty("reportOrderNumber", out var orderElem))
                            orderNo = orderElem.ToString();

                        // Navigate to report data
                        if (root.TryGetProperty("data", out var data) && 
                            data.TryGetProperty("cCRResponse", out var ccr) &&
                            ccr.TryGetProperty("cIRReportDataLst", out var list) &&
                            list.GetArrayLength() > 0)
                        {
                            var firstReport = list[0];
                            if (firstReport.TryGetProperty("cIRReportData", out var reportData))
                            {
                                // 1. Score Details
                                if (reportData.TryGetProperty("scoreDetails", out var scores) && scores.GetArrayLength() > 0)
                                {
                                    if (scores[0].TryGetProperty("value", out var scoreVal))
                                        score = scoreVal.GetString() ?? scoreVal.ToString();
                                }

                                // 2. Account Details
                                if (reportData.TryGetProperty("retailAccountDetails", out var accounts))
                                {
                                    foreach (var acc in accounts.EnumerateArray())
                                    {
                                        string status = acc.TryGetProperty("accountStatus", out var s) ? s.ToString() : "";
                                        if (status.Contains("Active", StringComparison.OrdinalIgnoreCase) || status == "11") 
                                            openAccs++;
                                        else if (status.Contains("Settled", StringComparison.OrdinalIgnoreCase))
                                            settled++;

                                        if (acc.TryGetProperty("currentBalance", out var bal))
                                        {
                                            if (decimal.TryParse(bal.ToString(), out var b)) totalOut += b;
                                        }

                                        if (acc.TryGetProperty("amountPastDue", out var pd) && decimal.TryParse(pd.ToString(), out var pval) && pval > 0)
                                        {
                                            overdue++;
                                        }
                                    }
                                }

                                // 3. Enquiry Details
                                if (reportData.TryGetProperty("enquiryDetails", out var enquiries))
                                {
                                    hardEnq = enquiries.GetArrayLength();
                                }
                            }
                        }
                    }
                }
                catch (Exception)
                {
                }

                // Check if we should store and return success
                if (!apiStatus || score == "N/A")
                {
                    return BadRequest(new { 
                        message = "Credit Report status is false or CIBIL score is not available.",
                        status = apiStatus,
                        score = score,
                        raw = rawJsonString 
                    });
                }

                // Save to Database
                var reportRecord = new CibilReport
                {
                    FName = fname ?? string.Empty,
                    PAN = pan ?? string.Empty,
                    DOB = dob ?? string.Empty,
                    Phone = phone ?? string.Empty,
                    Address = address ?? string.Empty,
                    Pincode = pincode ?? string.Empty,
                    CibilScore = score,
                    ReferenceId = refId,
                    ReportOrderNumber = orderNo,
                    RawJsonResponse = rawJsonString,
                    
                    OpenAccounts = openAccs,
                    TotalOutstanding = totalOut.ToString("N0"),
                    OverdueCount = overdue,
                    SettledAccounts = settled,
                    HardEnquiries = hardEnq,
                    SoftEnquiries = softEnq,
                    DpdJson = dpdJsonStr,

                    CreatedAt = DateTime.Now,
                    ClientCode = clientCode
                };

                _db.CibilReports.Add(reportRecord);
                await _db.SaveChangesAsync();

                return Ok(new { 
                    report = reportRecord,
                    raw = rawJsonString
                });
            }
            catch (Exception ex)
            {
                return StatusCode(502, $"Proxy/Database Error: {ex.Message}");
            }
        }

        [HttpGet("report/{id}")]
        public async Task<IActionResult> GetReportDetailed(int id)
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();

            var report = await _db.CibilReports.FindAsync(id);
            if (report == null) return NotFound();

            if (userRole != "SUPER_ADMIN" && report.ClientCode != userClientCode)
                return Forbid();

            return Ok(report);
        }

        [HttpGet("trend/{pan}")]
        public async Task<IActionResult> GetScoreTrend(string pan)
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();

            var query = _db.CibilReports.Where(r => r.PAN == pan);
            if (userRole != "SUPER_ADMIN")
            {
                query = query.Where(r => r.ClientCode == userClientCode);
            }

            var trend = await query
                .OrderBy(r => r.CreatedAt)
                .Select(r => new { r.CreatedAt, r.CibilScore })
                .ToListAsync();

            return Ok(trend);
        }
    }
}
