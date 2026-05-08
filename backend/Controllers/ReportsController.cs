using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TushGptBackend.Data;
using TushGptBackend.Models;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;

namespace TushGptBackend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReportsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Reports
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Report>>> GetReports()
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();

            var query = _context.Reports.AsQueryable();
            if (userRole != "SUPER_ADMIN")
            {
                if (string.IsNullOrEmpty(userClientCode)) return BadRequest(new { message = "ClientCode not found in token." });
                query = query.Where(r => r.ClientCode == userClientCode);
            }

            return await query.OrderByDescending(r => r.Date).ToListAsync();
        }

        // POST: api/Reports
        [HttpPost]
        public async Task<ActionResult<Report>> PostReport(Report report)
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();

            // Set ClientCode for new reports or ensure it's not tampered with
            if (userRole != "SUPER_ADMIN")
            {
                if (string.IsNullOrEmpty(userClientCode)) return Unauthorized(new { message = "ClientCode missing from token." });
                report.ClientCode = userClientCode;
            }
            else if (string.IsNullOrEmpty(report.ClientCode))
            {
                report.ClientCode = userClientCode;
            }

            // Lookup MUST use both AppId and ClientCode for multi-tenant isolation
            var existingReport = await _context.Reports.FirstOrDefaultAsync(r => r.AppId == report.AppId && r.ClientCode == report.ClientCode);
            
            if (existingReport != null)
            {
                // Update existing
                if (userRole != "SUPER_ADMIN" && existingReport.ClientCode != userClientCode)
                {
                    return Unauthorized(new { message = "You do not have permission to update this report." });
                }

                existingReport.MemberName = report.MemberName;
                existingReport.Date = DateTime.Now;
                existingReport.DataJson = report.DataJson;
                existingReport.CreatedBy = report.CreatedBy;
                
                _context.Entry(existingReport).State = EntityState.Modified;
            }
            else
            {
                // Add new (ClientCode is already set above)
                _context.Reports.Add(report);
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                if (ReportExists(report.AppId, report.ClientCode))
                {
                    return Conflict(new { message = $"Application ID '{report.AppId}' already exists for this client." });
                }
                else
                {
                    return BadRequest(new { message = "Database update error: " + ex.InnerException?.Message ?? ex.Message });
                }
            }

            return Ok(report);
        }

        private bool ReportExists(string appId, string? clientCode)
        {
            return _context.Reports.Any(e => e.AppId == appId && e.ClientCode == clientCode);
        }
    }
}
