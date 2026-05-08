using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TushGptBackend.Attributes;
using TushGptBackend.Data;
using TushGptBackend.Services;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;

namespace TushGptBackend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class CreditController : ControllerBase
    {
        private readonly CreditService _credit;
        private readonly AppDbContext _context;

        public CreditController(CreditService credit, AppDbContext context)
        {
            _credit = credit;
            _context = context;
        }

        /// <summary>
        /// Add credit to a client's wallet (SUPER_ADMIN only).
        /// </summary>
        [HttpPost("add")]
        [RequirePermission("ADD_CREDIT")]
        public async Task<IActionResult> AddCredit([FromBody] AddCreditRequest request)
        {
            var role = HttpContext.Items["UserRole"]?.ToString();

            // Only SUPER_ADMIN can add credit
            if (role != "SUPER_ADMIN")
                return StatusCode(403, new { message = "Only SUPER_ADMIN can add credit." });

            // SUPER_ADMIN provides target clientCode in the request
            var targetClientCode = request.ClientCode;
            if (string.IsNullOrEmpty(targetClientCode))
                return BadRequest(new { message = "ClientCode is required." });

            if (request.Amount <= 0)
                return BadRequest(new { message = "Amount must be greater than 0." });

            int? userId = null;
            if (int.TryParse(HttpContext.Items["UserId"]?.ToString(), out var uid))
                userId = uid;

            var newBalance = await _credit.AddCreditAsync(
                targetClientCode, request.Amount, request.Description ?? "Manual credit addition",
                userId, HttpContext.Connection.RemoteIpAddress?.ToString());

            return Ok(new { success = true, balance = newBalance, message = "Credit added successfully." });
        }

        /// <summary>
        /// Get current credit balance.
        /// </summary>
        [HttpGet("balance")]
        public async Task<IActionResult> GetBalance([FromQuery] string? clientCode = null)
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();

            // If clientCode is provided by SUPER_ADMIN, use it. Otherwise use own.
            var target = (userRole == "SUPER_ADMIN") ? clientCode : userClientCode;

            if (string.IsNullOrEmpty(target))
            {
                if (userRole == "SUPER_ADMIN") return Ok(new { balance = 0, message = "Specify clientCode to view balance." });
                return BadRequest(new { message = "ClientCode not found." });
            }

            var balance = await _credit.GetBalanceAsync(target);
            return Ok(new { clientCode = target, balance });
        }

        /// <summary>
        /// Get credit transaction history.
        /// </summary>
        [HttpGet("transactions")]
        public async Task<IActionResult> GetTransactions([FromQuery] string? clientCode = null, [FromQuery] int limit = 50)
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();

            var target = (userRole == "SUPER_ADMIN") ? clientCode : userClientCode;

            if (string.IsNullOrEmpty(target))
            {
                // SUPER_ADMIN viewing all transactions across all clients
                if (userRole == "SUPER_ADMIN")
                {
                    var allTxns = await _context.CreditTransactions
                        .OrderByDescending(t => t.CreatedAt)
                        .Take(limit)
                        .ToListAsync();
                    return Ok(allTxns);
                }
                return BadRequest(new { message = "ClientCode not found." });
            }

            var transactions = await _credit.GetTransactionsAsync(target, limit);
            return Ok(transactions);
        }
    }

    public class AddCreditRequest
    {
        public string? ClientCode { get; set; }
        public decimal Amount { get; set; }
        public string? Description { get; set; }
    }
}
