using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text.Json.Nodes;
using TushGptBackend.Models.RocketPay.Dtos;
using TushGptBackend.Services;

namespace TushGptBackend.Controllers
{
    [ApiController]
    [Route("api/webhook")]
    public class WebhookController : ControllerBase
    {
        private readonly MandateRepository _mandateRepo;
        private readonly InstallmentRepository _installmentRepo;
        private readonly ILogger<WebhookController> _logger;

        private static readonly JsonSerializerOptions _jsonOptions = new()
        {
            PropertyNameCaseInsensitive = true,
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
        };

        public WebhookController(
            MandateRepository mandateRepo,
            InstallmentRepository installmentRepo,
            ILogger<WebhookController> logger)
        {
            _mandateRepo = mandateRepo;
            _installmentRepo = installmentRepo;
            _logger = logger;
        }

        // POST /api/webhook/rocketpay
        [HttpPost("rocketpay")]
        public async Task<IActionResult> HandleWebhook()
        {
            string raw;
            using (var reader = new StreamReader(Request.Body))
            {
                raw = await reader.ReadToEndAsync();
            }

            _logger.LogInformation("RocketPay webhook received: {Raw}", raw);

            if (string.IsNullOrWhiteSpace(raw))
                return BadRequest(new { message = "Empty payload." });

            try
            {
                var node = JsonNode.Parse(raw);
                if (node == null)
                    return BadRequest(new { message = "Invalid JSON." });

                // Detect payload type — installments have a mandate_id field; mandates do not
                bool isInstallment = node["mandate_id"] != null;

                if (isInstallment)
                {
                    var dto = JsonSerializer.Deserialize<InstallmentResponseDto>(raw, _jsonOptions);
                    if (dto != null)
                    {
                        await _installmentRepo.UpsertAsync(dto, raw);
                        _logger.LogInformation("Webhook: updated installment {Id}", dto.Id);
                    }
                }
                else
                {
                    var dto = JsonSerializer.Deserialize<MandateResponseDto>(raw, _jsonOptions);
                    if (dto != null)
                    {
                        await _mandateRepo.UpsertAsync(dto, raw);
                        _logger.LogInformation("Webhook: updated mandate {Id}", dto.Id);
                    }
                }

                return Ok(new { received = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Webhook processing error");
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}
