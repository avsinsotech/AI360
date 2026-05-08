using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TushGptBackend.Data;
using TushGptBackend.Models;
using System.Linq;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Threading.Tasks;

namespace TushGptBackend.Controllers
{
    public class RecentApplicationDto
    {
        public int Id { get; set; }
        public string ApplicationNo { get; set; } = string.Empty;
        public string ApplicantName { get; set; } = string.Empty;
        public string LoanType { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Status { get; set; } = "DRAFT";
        public DateTime CreatedAt { get; set; }
    }

    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AnalyticsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AnalyticsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("recent-applications")]
        public async Task<IActionResult> GetRecentApplications()
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString() ?? "";
            bool isSuperAdmin = userRole == "SUPER_ADMIN";

            if (!isSuperAdmin && string.IsNullOrEmpty(userClientCode))
                return BadRequest(new { message = "ClientCode not found in token." });

            var results = new List<RecentApplicationDto>();
            using var command = _context.Database.GetDbConnection().CreateCommand();
            command.CommandText = "CALL sp_GetRecentApplications(@p0, @p1)";
            var p0 = command.CreateParameter(); p0.ParameterName = "@p0"; p0.Value = userClientCode; command.Parameters.Add(p0);
            var p1 = command.CreateParameter(); p1.ParameterName = "@p1"; p1.Value = isSuperAdmin; command.Parameters.Add(p1);

            await _context.Database.OpenConnectionAsync();
            try
            {
                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    results.Add(new RecentApplicationDto
                    {
                        Id = reader.GetInt32(reader.GetOrdinal("Id")),
                        ApplicationNo = reader.IsDBNull(reader.GetOrdinal("ApplicationNo")) ? "N/A" : reader.GetString(reader.GetOrdinal("ApplicationNo")),
                        ApplicantName = reader.IsDBNull(reader.GetOrdinal("ApplicantName")) ? "N/A" : reader.GetString(reader.GetOrdinal("ApplicantName")),
                        LoanType = reader.GetString(reader.GetOrdinal("LoanType")),
                        Amount = reader.IsDBNull(reader.GetOrdinal("Amount")) ? 0 : reader.GetDecimal(reader.GetOrdinal("Amount")),
                        Status = reader.IsDBNull(reader.GetOrdinal("Status")) ? "Draft" : reader.GetString(reader.GetOrdinal("Status")),
                        CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
                    });
                }
            }
            finally
            {
                await _context.Database.CloseConnectionAsync();
            }

            // --- FAIL-PROOF GOLD LOAN FETCH (LINQ) ---
            var goldQuery = _context.GoldLoans.AsQueryable();
            if (!isSuperAdmin)
            {
                goldQuery = goldQuery.Where(l => l.ClientCode == userClientCode);
            }

            var goldResults = await goldQuery
                .OrderByDescending(x => x.CreatedAt)
                .Take(50)
                .Select(l => new RecentApplicationDto
                {
                    Id = l.Id,
                    ApplicationNo = l.ApplicationNo ?? "PENDING",
                    ApplicantName = l.CustomerName ?? "Gold Applicant",
                    LoanType = "Gold Loan",
                    Amount = l.LoanSanction ?? 0,
                    Status = "Submitted",
                    CreatedAt = l.CreatedAt
                })
                .ToListAsync();

            results.AddRange(goldResults);
            results = results.OrderByDescending(x => x.CreatedAt).ToList();

            return Ok(results);
        }

        [HttpGet("kyc-stats")]
        public async Task<IActionResult> GetKycStats()
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();

            IQueryable<VerifiedAadhar> aadharQuery = _context.VerifiedAadhars;
            IQueryable<OtpVerification> otpQuery = _context.OtpVerifications;

            if (userRole != "SUPER_ADMIN")
            {
                if (string.IsNullOrEmpty(userClientCode)) return BadRequest(new { message = "ClientCode not found in token." });
                aadharQuery = aadharQuery.Where(a => a.ClientCode == userClientCode);
                otpQuery = otpQuery.Where(o => o.ClientCode == userClientCode);
            }

            // DbContext is not thread-safe, so we must await these sequentially
            var verifiedAadharCount = await aadharQuery.CountAsync();
            var verifiedMobileCount = await otpQuery.CountAsync(o => o.IsVerified);
            
            var nowUtc = DateTime.UtcNow;
            
            var pendingMobileCount = await otpQuery.CountAsync(o => !o.IsVerified && o.ExpiresAt > nowUtc);
            var failedMobileCount = await otpQuery.CountAsync(o => !o.IsVerified && o.ExpiresAt <= nowUtc);

            var totalVerified = verifiedAadharCount + verifiedMobileCount;
            var totalPending = pendingMobileCount;
            var totalFailed = failedMobileCount;

            // Trend Data Optimization: Fetch all in 2 queries instead of 10
            var nowLocal = DateTime.Now;
            var fiveMonthsAgoLocal = new DateTime(nowLocal.Year, nowLocal.Month, 1).AddMonths(-4);
            var fiveMonthsAgoUtc = fiveMonthsAgoLocal.ToUniversalTime();

            // Fetch Aadhaar dates (minimal projection)
            var aadharDates = await aadharQuery
                .Where(a => a.VerifiedAt >= fiveMonthsAgoLocal)
                .Select(a => a.VerifiedAt)
                .ToListAsync();

            // Fetch Mobile dates
            var mobileDates = await otpQuery
                .Where(o => o.IsVerified && o.CreatedAt >= fiveMonthsAgoUtc)
                .Select(o => o.CreatedAt)
                .ToListAsync();

            var trendData = new List<object>();
            for (int i = 4; i >= 0; i--)
            {
                var monthDate = nowLocal.AddMonths(-i);
                
                var aadharInMonth = aadharDates.Count(d => d.Month == monthDate.Month && d.Year == monthDate.Year);
                
                // For mobile, we need to compare using local time parts for consistent grouping if that's what's expected
                var mobileInMonth = mobileDates.Count(d => {
                    var local = d.ToLocalTime();
                    return local.Month == monthDate.Month && local.Year == monthDate.Year;
                });

                trendData.Add(new
                {
                    name = monthDate.ToString("MMM"),
                    value = aadharInMonth + mobileInMonth
                });
            }

            return Ok(new
            {
                pieData = new[]
                {
                    new { name = "Verified", value = totalVerified, color = "#10b981" },
                    new { name = "Pending", value = totalPending, color = "#f59e0b" },
                    new { name = "Failed", value = totalFailed, color = "#ef4444" }
                },
                stats = new
                {
                    totalVerified = totalVerified,
                    averageTime = "12 mins", 
                    averageTrend = 42
                },
                trendData = trendData
            });
        }
    }
}
