using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TushGptBackend.Attributes;
using TushGptBackend.Data;
using TushGptBackend.Models;
using TushGptBackend.Services;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Threading.Tasks;

namespace TushGptBackend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class RateController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly AuditService _audit;

        public RateController(AppDbContext context, AuditService audit)
        {
            _context = context;
            _audit = audit;
        }

        /// <summary>
        /// Set a rate for a service category (SUPER_ADMIN only).
        /// </summary>
        [HttpPost]
        [RequirePermission("MANAGE_RATES")]
        public async Task<IActionResult> SetRate([FromBody] SetRateRequest request)
        {
            var role = HttpContext.Items["UserRole"]?.ToString();

            // Only SUPER_ADMIN can set rates
            if (role != "SUPER_ADMIN")
                return StatusCode(403, new { message = "Only SUPER_ADMIN can manage rates." });

            var clientCode = request.ClientCode;
            if (string.IsNullOrEmpty(clientCode))
                return BadRequest(new { message = "ClientCode is required." });

            if (string.IsNullOrWhiteSpace(request.Category))
                return BadRequest(new { message = "Category is required." });

            if (request.Rate < 0)
                return BadRequest(new { message = "Rate must be non-negative." });

            var effectiveDate = request.EffectiveFrom?.Date ?? DateTime.UtcNow.Date;
            var categoryUpper = request.Category.ToUpper();

            Console.WriteLine($"[DEBUG] Rate Update Attempt: Bank={clientCode}, Svc={categoryUpper}, NewRate={request.Rate}, Date={effectiveDate:yyyy-MM-dd}");

            // Look for any record on THIS CALENDAR DAY regardless of time
            var existingRate = await _context.ServiceRates
                .Where(r => r.ClientCode == clientCode && r.Category == categoryUpper)
                .ToListAsync();
            
            // Filter in memory for maximum reliability across DB providers
            var targetRate = existingRate.FirstOrDefault(r => r.EffectiveFrom.Date == effectiveDate.Date);

            string action = "Set";
            if (targetRate != null)
            {
                Console.WriteLine($"[DEBUG] Found existing ID={targetRate.Id} with Rate={targetRate.Rate}. Overwriting with {request.Rate}");
                targetRate.Rate = request.Rate;
                _context.ServiceRates.Update(targetRate);
                action = "Updated";
            }
            else
            {
                Console.WriteLine($"[DEBUG] No record found for {effectiveDate:yyyy-MM-dd}. Creating new entry.");
                var rate = new ServiceRate
                {
                    ClientCode = clientCode,
                    Category = categoryUpper,
                    Rate = request.Rate,
                    EffectiveFrom = effectiveDate,
                    CreatedAt = DateTime.UtcNow
                };
                _context.ServiceRates.Add(rate);
            }
            await _context.SaveChangesAsync();

            int? userId = null;
            if (int.TryParse(HttpContext.Items["UserId"]?.ToString(), out var uid))
                userId = uid;

            await _audit.LogAsync(clientCode, userId, "RATE_CHANGED",
                $"{action} rate for {categoryUpper}: {request.Rate:F2} effective {effectiveDate:yyyy-MM-dd}",
                HttpContext.Connection.RemoteIpAddress?.ToString());

            return Ok(new { success = true, message = $"Rate {action.ToLower()} successfully." });
        }

        /// <summary>
        /// Get all rates for the authenticated client.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetRates([FromQuery] string? clientCode = null)
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();

            var target = (userRole == "SUPER_ADMIN") ? clientCode : userClientCode;

            if (string.IsNullOrEmpty(target))
            {
                if (userRole == "SUPER_ADMIN")
                {
                    return Ok(await _context.ServiceRates.OrderByDescending(r => r.CreatedAt).ToListAsync());
                }
                return BadRequest(new { message = "ClientCode not found." });
            }

            var rates = await _context.ServiceRates
                .Where(r => r.ClientCode == target)
                .OrderByDescending(r => r.EffectiveFrom)
                .ToListAsync();

            return Ok(rates);
        }

        /// <summary>
        /// Get the current effective rate for a specific category.
        /// </summary>
        [HttpGet("{category}")]
        public async Task<IActionResult> GetCurrentRate(string category)
        {
            var clientCode = HttpContext.Items["ClientCode"]?.ToString();
            if (string.IsNullOrEmpty(clientCode))
                return BadRequest(new { message = "ClientCode not found in token." });

            var rate = await _context.ServiceRates
                .Where(r => r.ClientCode == clientCode && r.Category == category.ToUpper() && r.EffectiveFrom <= DateTime.UtcNow)
                .OrderByDescending(r => r.EffectiveFrom)
                .FirstOrDefaultAsync();

            if (rate == null)
                return NotFound(new { message = $"No rate configured for {category}." });

            return Ok(rate);
        }
    }

    public class SetRateRequest
    {
        public string? ClientCode { get; set; }
        public string Category { get; set; } = string.Empty;
        public decimal Rate { get; set; }
        public DateTime? EffectiveFrom { get; set; }
    }
}
