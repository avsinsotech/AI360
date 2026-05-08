using Microsoft.AspNetCore.Mvc;
using TushGptBackend.Models.RocketPay.Dtos;
using TushGptBackend.Services;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace TushGptBackend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/mandates")]
    public class MandateController : ControllerBase
    {
        private readonly TushGptBackend.Services.RocketPayApiService _api;
        private readonly TushGptBackend.Services.MandateRepository _repo;
        private readonly ILogger<MandateController> _logger;
        private readonly TushGptBackend.Services.CreditService _credit;
        private readonly TushGptBackend.Services.AuditService _auditLog;
  
        public MandateController(
            TushGptBackend.Services.RocketPayApiService api, 
            TushGptBackend.Services.MandateRepository repo, 
            ILogger<MandateController> logger, 
            TushGptBackend.Services.CreditService credit, 
            TushGptBackend.Services.AuditService auditLog)
        {
            _api = api;
            _repo = repo;
            _logger = logger;
            _credit = credit;
            _auditLog = auditLog;
        }

        // GET /api/mandates — List all mandates from DB
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();

            // If SUPER_ADMIN, return all or filter by query param if we added one (for now just all)
            // If CLIENT, return only theirs.
            var target = (userRole == "SUPER_ADMIN") ? null : userClientCode;

            var mandates = await _repo.GetAllAsync(target);
            return Ok(mandates);
        }

        // GET /api/mandates/dashboard — Get aggregated real-time metrics
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardMetrics([FromQuery] string timeRange = "7days", [FromQuery] string? clientCode = null)
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();

            var target = (userRole == "SUPER_ADMIN") ? clientCode : userClientCode;

            try
            {
                var metrics = await _repo.GetDashboardMetricsAsync(timeRange, target);
                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching dashboard metrics");
                return StatusCode(500, new { message = "Failed to calculate metrics", details = ex.Message });
            }
        }

        // GET /api/mandates/{id} — Get mandate from DB
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();
            var target = (userRole == "SUPER_ADMIN") ? null : userClientCode;

            var mandate = await _repo.GetByIdAsync(id, target);
            if (mandate == null) return NotFound(new { message = "Mandate not found or access denied." });
            return Ok(mandate);
        }

        // POST /api/mandates — Create mandate via RocketPay, save to DB
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MandateRequestDto dto)
        {
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();
            
            // Credit deduction for multi-tenant users
            if (!string.IsNullOrEmpty(userClientCode) && userClientCode != "GLOBAL")
            {
                int? userId = null;
                if (int.TryParse(HttpContext.Items["UserId"]?.ToString(), out var uid)) userId = uid;
                var (success, _, msg) = await _credit.DeductCreditAsync(userClientCode, "ROCKETPAY", null, userId, HttpContext.Connection.RemoteIpAddress?.ToString());
                if (!success)
                    return StatusCode(402, new { message = msg });
            }

            try
            {
                var (data, raw) = await _api.CreateMandateAsync(dto);
                if (data == null) return StatusCode(502, new { message = "Empty response from RocketPay.", raw_response = "" });
                await _repo.UpsertAsync(data, raw, userClientCode);

                // Audit Mandate Creation
                int? uidRef = null;
                if (int.TryParse(HttpContext.Items["UserId"]?.ToString(), out var ouid)) uidRef = ouid;
                await _auditLog.LogAsync(userClientCode ?? "GLOBAL", uidRef, "MANDATE_CREATE", $"Created mandate for {dto.Customer?.Name}", HttpContext.Connection.RemoteIpAddress?.ToString());

                return Ok(data);
            }
            catch (RocketPayException ex)
            {
                _logger.LogError("RocketPay CreateMandate error HTTP {Code}: {Body}", ex.StatusCode, ex.RawBody);
                return StatusCode(ex.StatusCode, new { message = ex.RawBody, rocketpay_status = ex.StatusCode });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "CreateMandate unexpected error");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // POST /api/mandates/{id}/refresh
        [HttpPost("{id}/refresh")]
        public async Task<IActionResult> Refresh(string id)
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();
            var target = (userRole == "SUPER_ADMIN") ? null : userClientCode;

            try
            {
                var mandate = await _repo.GetByIdAsync(id, target);
                if (mandate == null) return NotFound(new { message = "Mandate not found or access denied." });

                var (data, raw) = await _api.RefreshMandateAsync(id);
                if (data == null) return StatusCode(502, new { message = "Empty response from RocketPay." });
                await _repo.UpsertAsync(data, raw, mandate.ClientCode);

                // Audit Refresh
                int? ruid = null;
                if (int.TryParse(HttpContext.Items["UserId"]?.ToString(), out var ruidVal)) ruid = ruidVal;
                await _auditLog.LogAsync(mandate.ClientCode ?? "GLOBAL", ruid, "MANDATE_REFRESH", $"Refreshed mandate {id}", HttpContext.Connection.RemoteIpAddress?.ToString());

                return Ok(data);
            }
            catch (RocketPayException ex)
            {
                _logger.LogError("RocketPay RefreshMandate error HTTP {Code}: {Body}", ex.StatusCode, ex.RawBody);
                return StatusCode(ex.StatusCode, new { message = ex.RawBody, rocketpay_status = ex.StatusCode });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // DELETE /api/mandates/{id} — Only allowed when state = CREATED
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();
            var target = (userRole == "SUPER_ADMIN") ? null : userClientCode;

            var local = await _repo.GetByIdAsync(id, target);
            if (local == null) return NotFound(new { message = "Mandate not found or access denied." });

            if (local.State != "CREATED")
                return BadRequest(new { message = $"Delete only allowed when state is CREATED. Current: {local.State}" });

            try
            {
                var (data, raw) = await _api.DeleteMandateAsync(id);
                if (data == null) return StatusCode(502, new { message = "Empty response from RocketPay." });
                await _repo.UpsertAsync(data, raw, local.ClientCode);
                return Ok(data);
            }
            catch (RocketPayException ex)
            {
                return StatusCode(ex.StatusCode, new { message = ex.RawBody, rocketpay_status = ex.StatusCode });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // POST /api/mandates/{id}/cancel — Only allowed when state = ACTIVATED
        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> Cancel(string id)
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();
            var target = (userRole == "SUPER_ADMIN") ? null : userClientCode;

            var local = await _repo.GetByIdAsync(id, target);
            if (local == null) return NotFound(new { message = "Mandate not found or access denied." });

            if (local.State != "ACTIVATED")
                return BadRequest(new { message = $"Cancel only allowed when state is ACTIVATED. Current: {local.State}" });

            try
            {
                var (data, raw) = await _api.CancelMandateAsync(id);
                if (data == null) return StatusCode(502, new { message = "Empty response from RocketPay." });
                await _repo.UpsertAsync(data, raw, local.ClientCode);
                return Ok(data);
            }
            catch (RocketPayException ex)
            {
                return StatusCode(ex.StatusCode, new { message = ex.RawBody, rocketpay_status = ex.StatusCode });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // POST /api/mandates/{id}/installment — Create installment for Adhoc mandate
        [HttpPost("{id}/installment")]
        public async Task<IActionResult> CreateInstallment(string id, [FromBody] CreateInstallmentRequestDto dto)
        {
            var mandate = await _repo.GetByIdAsync(id);
            if (mandate != null && dto.Amount >= mandate.ApprovalAmount)
                return BadRequest(new { message = $"Amount ({dto.Amount}) must be less than approval_amount ({mandate.ApprovalAmount})." });

            try
            {
                var (data, raw) = await _api.CreateInstallmentAsync(id, dto);
                if (data == null) return StatusCode(502, new { message = "Empty response from RocketPay." });
                return Ok(data);
            }
            catch (RocketPayException ex)
            {
                return StatusCode(ex.StatusCode, new { message = ex.RawBody, rocketpay_status = ex.StatusCode });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}
