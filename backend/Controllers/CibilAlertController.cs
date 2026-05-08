using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TushGptBackend.Data;
using TushGptBackend.Models;
using Microsoft.AspNetCore.Authorization;

namespace TushGptBackend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class CibilAlertController : ControllerBase
    {
        private readonly AppDbContext _db;

        public CibilAlertController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetConfig()
        {
            var clientCode = HttpContext.Items["ClientCode"]?.ToString();
            if (string.IsNullOrEmpty(clientCode)) return BadRequest("ClientCode not found.");

            var config = await _db.CibilAlertConfigs.FirstOrDefaultAsync(c => c.ClientCode == clientCode);
            if (config == null)
            {
                config = new CibilAlertConfig { ClientCode = clientCode };
                _db.CibilAlertConfigs.Add(config);
                await _db.SaveChangesAsync();
            }
            return Ok(config);
        }

        [HttpPost]
        public async Task<IActionResult> SaveConfig([FromBody] CibilAlertConfig updated)
        {
            var clientCode = HttpContext.Items["ClientCode"]?.ToString();
            if (string.IsNullOrEmpty(clientCode)) return BadRequest("ClientCode not found.");

            var config = await _db.CibilAlertConfigs.FirstOrDefaultAsync(c => c.ClientCode == clientCode);
            if (config == null)
            {
                updated.ClientCode = clientCode;
                _db.CibilAlertConfigs.Add(updated);
            }
            else
            {
                config.ScoreThreshold = updated.ScoreThreshold;
                config.IsPeriodicPullEnabled = updated.IsPeriodicPullEnabled;
                config.NotifyOnNewEnquiry = updated.NotifyOnNewEnquiry;
                config.UpdatedAt = DateTime.Now;
            }

            await _db.SaveChangesAsync();
            return Ok(config ?? updated);
        }
    }
}
