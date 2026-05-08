using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using TushGptBackend.Data;
using TushGptBackend.Models.HomeLoan;

namespace TushGptBackend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class HomeLoanController : ControllerBase
    {
        private readonly AppDbContext _context;
        private static readonly JsonSerializerOptions _jsonOpts = new()
        {
            PropertyNamingPolicy = null,
            WriteIndented = false
        };

        public HomeLoanController(AppDbContext context)
        {
            _context = context;
        }

        // ── Helper: Map entity → response DTO ──
        private static HomeLoanResponseDto ToResponseDto(HomeLoanApplication r, JsonElement? formData)
        {
            return new HomeLoanResponseDto
            {
                Id = r.Id,
                ApplicationNo = r.ApplicationNo ?? "",
                ClientCode = r.ClientCode ?? "",
                Status = r.Status ?? "",
                ApplicationDate = r.ApplicationDate ?? "",
                Branch = r.Branch ?? "",
                MemberNo = r.MemberNo ?? "",
                LoanAccountNo = r.LoanAccountNo ?? "",
                ApplicantName = r.ApplicantName ?? "",
                ApplicantAge = r.ApplicantAge ?? "",
                CoApplicantName = r.CoApplicantName ?? "",
                CoApplicantAge = r.CoApplicantAge ?? "",
                LoanAmountNum = r.LoanAmountNum ?? "",
                LoanAmountWords = r.LoanAmountWords ?? "",
                RepaymentMonths = r.RepaymentMonths ?? "",
                FirstInstalment = r.FirstInstalment ?? "",
                InstalmentDate = r.InstalmentDate ?? "",
                LoanPurpose = r.LoanPurpose ?? "",
                MaritalStatus = r.MaritalStatus ?? "",
                DependentCount = r.DependentCount ?? "",
                Guarantor1Name = r.Guarantor1Name ?? "",
                Guarantor1Age = r.Guarantor1Age ?? "",
                Guarantor2Name = r.Guarantor2Name ?? "",
                Guarantor2Age = r.Guarantor2Age ?? "",
                Guarantor3Name = r.Guarantor3Name ?? "",
                Guarantor3Age = r.Guarantor3Age ?? "",
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt,
                FormData = formData
            };
        }

        // ── Helper: Parse raw_json into JsonElement ──
        private static JsonElement? ParseRawJson(string? rawJson)
        {
            if (string.IsNullOrWhiteSpace(rawJson)) return null;
            try
            {
                using var doc = JsonDocument.Parse(rawJson);
                return doc.RootElement.Clone();
            }
            catch { return null; }
        }

        /// <summary>
        /// GET: api/HomeLoan — List all (lightweight, no raw_json)
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<HomeLoanListItemDto>>> GetRequests()
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();

            var query = _context.HomeLoanApplications.AsQueryable();
            if (userRole != "SUPER_ADMIN")
            {
                if (string.IsNullOrEmpty(userClientCode))
                    return BadRequest(new { message = "ClientCode not found in token." });
                query = query.Where(r => r.ClientCode == userClientCode);
            }

            var results = await query
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new HomeLoanListItemDto
                {
                    Id = r.Id,
                    ApplicationNo = r.ApplicationNo ?? "",
                    ClientCode = r.ClientCode ?? "",
                    Status = r.Status ?? "",
                    ApplicationDate = r.ApplicationDate ?? "",
                    Branch = r.Branch ?? "",
                    ApplicantName = r.ApplicantName ?? "",
                    LoanAmountNum = r.LoanAmountNum ?? "",
                    LoanPurpose = r.LoanPurpose ?? "",
                    MemberNo = r.MemberNo ?? "",
                    LoanAccountNo = r.LoanAccountNo ?? "",
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();

            return Ok(results);
        }

        /// <summary>
        /// GET: api/HomeLoan/5 — Full record with deserialized formData
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<HomeLoanResponseDto>> GetRequest(int id)
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();

            var record = await _context.HomeLoanApplications.FindAsync(id);
            if (record == null) return NotFound();

            if (userRole != "SUPER_ADMIN" && record.ClientCode != userClientCode)
                return Unauthorized(new { message = "You do not have permission to access this record." });

            return Ok(ToResponseDto(record, ParseRawJson(record.RawJson)));
        }

        /// <summary>
        /// POST: api/HomeLoan — Store full payload in raw_json + extract searchable fields
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<HomeLoanResponseDto>> PostRequest([FromBody] JsonElement rawPayload)
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();

            try
            {
                string rawJsonString = rawPayload.GetRawText();

                var submission = JsonSerializer.Deserialize<HomeLoanSubmissionDto>(rawJsonString, _jsonOpts);
                if (submission == null)
                    return BadRequest(new { message = "Invalid JSON payload." });

                // Apply multi-tenant ClientCode
                if (userRole != "SUPER_ADMIN")
                {
                    if (string.IsNullOrEmpty(userClientCode))
                        return Unauthorized(new { message = "ClientCode missing from token." });
                    submission.ClientCode = userClientCode;
                }
                else if (string.IsNullOrEmpty(submission.ClientCode))
                {
                    submission.ClientCode = userClientCode ?? "SYSTEM";
                }

                // Inject ClientCode into raw JSON
                var dict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(rawJsonString);
                if (dict != null)
                {
                    dict["ClientCode"] = JsonSerializer.SerializeToElement(submission.ClientCode);
                    rawJsonString = JsonSerializer.Serialize(dict, _jsonOpts);
                }

                // Generate unique ApplicationNo
                string applicationNo = $"HL-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";

                Console.WriteLine($"[HomeLoan] POST: Applicant='{submission.ApplicantName}', AppNo='{applicationNo}', JSON={rawJsonString.Length} bytes");

                var entity = new HomeLoanApplication
                {
                    ApplicationNo = applicationNo,
                    ClientCode = submission.ClientCode,
                    Status = "SUBMITTED",
                    ApplicationDate = submission.ApplicationDate,
                    Branch = submission.Branch,
                    MemberNo = submission.MemberNo,
                    LoanAccountNo = submission.LoanAccountNo,
                    ApplicantName = submission.ApplicantName,
                    ApplicantAge = submission.ApplicantAge,
                    CoApplicantName = submission.CoApplicantName,
                    CoApplicantAge = submission.CoApplicantAge,
                    LoanAmountNum = submission.LoanAmountNum,
                    LoanAmountWords = submission.LoanAmountWords,
                    RepaymentMonths = submission.RepaymentMonths,
                    FirstInstalment = submission.FirstInstalment,
                    InstalmentDate = submission.InstalmentDate,
                    LoanPurpose = submission.LoanPurpose,
                    MaritalStatus = submission.MaritalStatus,
                    DependentCount = submission.DependentCount,
                    Guarantor1Name = submission.Guarantor1Name,
                    Guarantor1Age = submission.Guarantor1Age,
                    Guarantor2Name = submission.Guarantor2Name,
                    Guarantor2Age = submission.Guarantor2Age,
                    Guarantor3Name = submission.Guarantor3Name,
                    Guarantor3Age = submission.Guarantor3Age,
                    RawJson = rawJsonString,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.HomeLoanApplications.Add(entity);
                await _context.SaveChangesAsync();

                Console.WriteLine($"[HomeLoan] Saved ID={entity.Id}, AppNo={applicationNo}");

                return CreatedAtAction(nameof(GetRequest), new { id = entity.Id },
                    ToResponseDto(entity, ParseRawJson(rawJsonString)));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[HomeLoan] Error: {ex.Message}\n{ex.InnerException?.Message}");
                return BadRequest(new { message = "Error saving: " + ex.Message, detail = ex.InnerException?.Message });
            }
        }

        /// <summary>
        /// PUT: api/HomeLoan/5
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<HomeLoanResponseDto>> UpdateRequest(int id, [FromBody] JsonElement rawPayload)
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();

            var existing = await _context.HomeLoanApplications.FindAsync(id);
            if (existing == null) return NotFound();

            if (userRole != "SUPER_ADMIN" && existing.ClientCode != userClientCode)
                return Unauthorized(new { message = "You do not have permission to update this record." });

            try
            {
                string rawJsonString = rawPayload.GetRawText();
                var submission = JsonSerializer.Deserialize<HomeLoanSubmissionDto>(rawJsonString, _jsonOpts);
                if (submission == null) return BadRequest(new { message = "Invalid JSON payload." });

                existing.ApplicationDate = submission.ApplicationDate;
                existing.Branch = submission.Branch;
                existing.MemberNo = submission.MemberNo;
                existing.LoanAccountNo = submission.LoanAccountNo;
                existing.ApplicantName = submission.ApplicantName;
                existing.ApplicantAge = submission.ApplicantAge;
                existing.CoApplicantName = submission.CoApplicantName;
                existing.CoApplicantAge = submission.CoApplicantAge;
                existing.LoanAmountNum = submission.LoanAmountNum;
                existing.LoanAmountWords = submission.LoanAmountWords;
                existing.RepaymentMonths = submission.RepaymentMonths;
                existing.FirstInstalment = submission.FirstInstalment;
                existing.InstalmentDate = submission.InstalmentDate;
                existing.LoanPurpose = submission.LoanPurpose;
                existing.MaritalStatus = submission.MaritalStatus;
                existing.DependentCount = submission.DependentCount;
                existing.Guarantor1Name = submission.Guarantor1Name;
                existing.Guarantor1Age = submission.Guarantor1Age;
                existing.Guarantor2Name = submission.Guarantor2Name;
                existing.Guarantor2Age = submission.Guarantor2Age;
                existing.Guarantor3Name = submission.Guarantor3Name;
                existing.Guarantor3Age = submission.Guarantor3Age;
                existing.RawJson = rawJsonString;
                existing.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(ToResponseDto(existing, ParseRawJson(rawJsonString)));
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error updating: " + ex.Message });
            }
        }

        /// <summary>
        /// DELETE: api/HomeLoan/5
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRequest(int id)
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();

            var record = await _context.HomeLoanApplications.FindAsync(id);
            if (record == null) return NotFound();

            if (userRole != "SUPER_ADMIN" && record.ClientCode != userClientCode)
                return Unauthorized(new { message = "You do not have permission to delete this record." });

            _context.HomeLoanApplications.Remove(record);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
