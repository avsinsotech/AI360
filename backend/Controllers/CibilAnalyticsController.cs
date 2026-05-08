using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TushGptBackend.Data;
using TushGptBackend.Models;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace TushGptBackend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CibilAnalyticsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public CibilAnalyticsController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet("portfolio-stats")]
        public async Task<IActionResult> GetPortfolioStats()
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var clientCode = HttpContext.Items["ClientCode"]?.ToString();

            IQueryable<CibilReport> query = _db.CibilReports;
            if (userRole != "SUPER_ADMIN")
            {
                if (string.IsNullOrEmpty(clientCode)) return BadRequest("ClientCode not found.");
                query = query.Where(r => r.ClientCode == clientCode);
            }

            // 1. Project only necessary fields to avoid fetching longtext blobs
            var allReportsProjected = await query
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new {
                    r.PAN,
                    r.CibilScore,
                    r.TotalOutstanding,
                    r.OverdueCount,
                    r.CreatedAt,
                    r.FName
                })
                .ToListAsync();

            // 2. Group in-memory (now much faster as we don't have large strings)
            var latestReports = allReportsProjected
                .GroupBy(r => r.PAN)
                .Select(g => g.First())
                .ToList();

            if (!latestReports.Any())
            {
                return Ok(new { 
                    scoreDistribution = new List<object>(), 
                    totalOutstanding = 0,
                    overdueTotal = 0,
                    highRiskCount = 0,
                    totalBorrowers = 0,
                    trendData = new List<object>(),
                    recentActivities = new List<object>()
                });
            }

            // Score Distribution
            var distribution = new List<object>
            {
                new { name = "Poor (<600)", value = latestReports.Count(r => int.Parse(r.CibilScore ?? "300") < 600), color = "#ef4444" },
                new { name = "Fair (600-700)", value = latestReports.Count(r => int.Parse(r.CibilScore ?? "300") >= 600 && int.Parse(r.CibilScore ?? "300") < 700), color = "#f97316" },
                new { name = "Good (700-750)", value = latestReports.Count(r => int.Parse(r.CibilScore ?? "300") >= 700 && int.Parse(r.CibilScore ?? "300") < 750), color = "#eab308" },
                new { name = "Excellent (>750)", value = latestReports.Count(r => int.Parse(r.CibilScore ?? "300") >= 750), color = "#22c55e" }
            };

            // Aggregate Metrics
            double totalOutstanding = latestReports.Sum(r => {
                var clean = r.TotalOutstanding?.Replace(",", "").Replace("₹", "").Trim();
                return double.TryParse(clean, out var val) ? val : 0;
            });

            int totalOverdue = latestReports.Sum(r => r.OverdueCount);
            
            // Get threshold from config or default to 650
            var alertConfig = await _db.CibilAlertConfigs.FirstOrDefaultAsync(c => c.ClientCode == clientCode);
            int threshold = alertConfig?.ScoreThreshold ?? 650;
            
            // Robust parsing for high risk count
            int highRisk = latestReports.Count(r => {
                if (string.IsNullOrEmpty(r.CibilScore)) return true; // Default to risk if missing
                var scoreStr = r.CibilScore.Split('-').Last().Trim(); // Handle prefix if exists (e.g. 000-0750)
                return int.TryParse(scoreStr, out var s) ? s < threshold : true;
            });

            // Last 6 months trend of verifications
            var now = DateTime.Now;
            var trend = new List<object>();
            for (int i = 5; i >= 0; i--)
            {
                var monthDate = now.AddMonths(-i);
                var count = allReportsProjected.Count(r => r.CreatedAt.Month == monthDate.Month && r.CreatedAt.Year == monthDate.Year);
                trend.Add(new { month = monthDate.ToString("MMM"), count });
            }

            return Ok(new
            {
                scoreDistribution = distribution,
                totalOutstanding = totalOutstanding,
                overdueTotal = totalOverdue,
                highRiskCount = highRisk,
                totalBorrowers = latestReports.Count,
                trendData = trend,
                effectiveThreshold = threshold, // Debug field
                recentActivities = latestReports.Take(5).Select(r => new {
                    borrower = r.FName,
                    pan = r.PAN,
                    score = r.CibilScore,
                    date = r.CreatedAt,
                    status = (int.TryParse(r.CibilScore?.Split('-').Last().Trim(), out var s) ? s : 300) < threshold ? "HighRisk" : "Normal"
                })
            });
        }

        [HttpPost("backfill")]
        public async Task<IActionResult> BackfillMetrics()
        {
            // Re-parse RawJsonResponse for all reports that have zero metrics
            var reports = await _db.CibilReports
                .Where(r => r.OpenAccounts == 0 && r.OverdueCount == 0 && r.HardEnquiries == 0)
                .ToListAsync();

            int updated = 0;
            foreach (var report in reports)
            {
                if (string.IsNullOrWhiteSpace(report.RawJsonResponse)) continue;
                try
                {
                    using var doc = System.Text.Json.JsonDocument.Parse(report.RawJsonResponse);
                    var root = doc.RootElement;

                    if (root.TryGetProperty("data", out var data) &&
                        data.TryGetProperty("cCRResponse", out var ccr) &&
                        ccr.TryGetProperty("cIRReportDataLst", out var list) &&
                        list.GetArrayLength() > 0)
                    {
                        var first = list[0];
                        if (first.TryGetProperty("cIRReportData", out var rd))
                        {
                            int openAccs = 0; decimal totalOut = 0; int overdue = 0; int settled = 0; int hardEnq = 0;

                            if (rd.TryGetProperty("retailAccountDetails", out var accs))
                            {
                                foreach (var acc in accs.EnumerateArray())
                                {
                                    string status = acc.TryGetProperty("accountStatus", out var s) ? s.ToString() : "";
                                    if (status.Contains("Active", StringComparison.OrdinalIgnoreCase) || status == "11")
                                        openAccs++;
                                    else if (status.Contains("Settled", StringComparison.OrdinalIgnoreCase))
                                        settled++;

                                    if (acc.TryGetProperty("currentBalance", out var bal) && decimal.TryParse(bal.ToString(), out var b))
                                        totalOut += b;

                                    if (acc.TryGetProperty("amountPastDue", out var pd) && decimal.TryParse(pd.ToString(), out var pv) && pv > 0)
                                        overdue++;
                                }
                            }

                            if (rd.TryGetProperty("enquiryDetails", out var enqs))
                                hardEnq = enqs.GetArrayLength();

                            report.OpenAccounts = openAccs;
                            report.TotalOutstanding = totalOut.ToString("N0");
                            report.OverdueCount = overdue;
                            report.SettledAccounts = settled;
                            report.HardEnquiries = hardEnq;
                            updated++;
                        }
                    }
                }
                catch { /* skip unparseable records */ }
            }

            await _db.SaveChangesAsync();
            return Ok(new { message = $"Backfilled {updated} of {reports.Count} reports." });
        }
    }
}
