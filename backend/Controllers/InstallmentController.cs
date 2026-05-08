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
    [Route("api/installments")]
    public class InstallmentController : ControllerBase
    {
        private readonly RocketPayApiService _api;
        private readonly InstallmentRepository _repo;
        private readonly ILogger<InstallmentController> _logger;

        public InstallmentController(RocketPayApiService api, InstallmentRepository repo, ILogger<InstallmentController> logger)
        {
            _api = api;
            _repo = repo;
            _logger = logger;
        }

        // GET /api/installments?mandate_id=xxx
        [HttpGet]
        public async Task<IActionResult> GetByMandate([FromQuery] string mandate_id)
        {
            if (string.IsNullOrEmpty(mandate_id))
                return BadRequest(new { message = "mandate_id query parameter is required." });

            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();
            var target = (userRole == "SUPER_ADMIN") ? null : userClientCode;

            var installments = await _repo.GetByMandateAsync(mandate_id, target);
            return Ok(installments);
        }

        // GET /api/installments/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();
            var target = (userRole == "SUPER_ADMIN") ? null : userClientCode;

            var inst = await _repo.GetByIdAsync(id, target);
            if (inst == null) return NotFound(new { message = "Installment not found or access denied." });
            return Ok(inst);
        }

        // POST /api/installments/{id}/refresh
        [HttpPost("{id}/refresh")]
        public async Task<IActionResult> Refresh(string id)
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();
            var target = (userRole == "SUPER_ADMIN") ? null : userClientCode;

            try
            {
                var inst = await _repo.GetByIdAsync(id, target);
                if (inst == null) return NotFound(new { message = "Installment not found or access denied." });

                var (data, raw) = await _api.RefreshInstallmentAsync(id);
                if (data == null) return StatusCode(502, new { message = "Empty response from RocketPay." });
                await _repo.UpsertAsync(data, raw, inst.ClientCode);
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

        // POST /api/installments/{id}/skip
        [HttpPost("{id}/skip")]
        public async Task<IActionResult> Skip(string id)
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();
            var target = (userRole == "SUPER_ADMIN") ? null : userClientCode;

            var local = await _repo.GetByIdAsync(id, target);
            if (local == null) return NotFound(new { message = "Installment not found or access denied." });

            if (!string.IsNullOrEmpty(local.DueDate))
            {
                if (DateTime.TryParse(local.DueDate, out var due))
                {
                    if ((due.Date - DateTime.UtcNow.Date).TotalDays < 2)
                        return BadRequest(new { message = "Skip is only allowed at least 2 days before the due date." });
                }
            }

            try
            {
                var (data, raw) = await _api.SkipInstallmentAsync(id);
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

        // POST /api/installments/{id}/retry
        [HttpPost("{id}/retry")]
        public async Task<IActionResult> Retry(string id, [FromBody] RetryInstallmentRequestDto dto)
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();
            var target = (userRole == "SUPER_ADMIN") ? null : userClientCode;

            var local = await _repo.GetByIdAsync(id, target);
            if (local == null) return NotFound(new { message = "Installment not found or access denied." });

            if (local.State != "COLLECTION_FAILED")
                return BadRequest(new { message = $"Retry only allowed when state is COLLECTION_FAILED. Current: {local.State}" });

            try
            {
                var (data, raw) = await _api.RetryInstallmentAsync(id, dto);
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
    }
}
