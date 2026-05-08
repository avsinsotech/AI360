using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TushGptBackend.Services;
using TushGptBackend.Models;
using System.Security.Claims;

namespace TushGptBackend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AuditController : ControllerBase
    {
        private readonly AuditService _auditService;

        public AuditController(AuditService auditService)
        {
            _auditService = auditService;
        }

        [HttpGet]
        public async Task<IActionResult> GetLogs([FromQuery] int limit = 100, [FromQuery] string? filterClient = null)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userClientCode = User.FindFirst("ClientCode")?.Value;

            // RBAC Logic
            string? searchClientCode = null;

            if (userRole == "SUPER_ADMIN")
            {
                // SuperAdmin can see everything or filter by client
                searchClientCode = filterClient;
            }
            else
            {
                // Regular clients only see their own logs
                searchClientCode = userClientCode;
            }

            var logs = await _auditService.GetLogsAsync(searchClientCode, limit);
            return Ok(logs);
        }
    }
}
