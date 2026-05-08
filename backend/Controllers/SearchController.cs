using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TushGptBackend.Data;
using TushGptBackend.Models;
using TushGptBackend.Models.RocketPay;
using System.Linq;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;

namespace TushGptBackend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SearchController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SearchController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GlobalSearch([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q) || q.Length < 2)
            {
                return Ok(new List<object>());
            }

            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString() ?? "";
            bool isSuperAdmin = userRole == "SUPER_ADMIN";

            var results = new List<object>();
            using var command = _context.Database.GetDbConnection().CreateCommand();
            command.CommandText = "CALL sp_GlobalSearch(@p0, @p1, @p2)";
            var p0 = command.CreateParameter(); p0.ParameterName = "@p0"; p0.Value = q; command.Parameters.Add(p0);
            var p1 = command.CreateParameter(); p1.ParameterName = "@p1"; p1.Value = userClientCode; command.Parameters.Add(p1);
            var p2 = command.CreateParameter(); p2.ParameterName = "@p2"; p2.Value = isSuperAdmin; command.Parameters.Add(p2);

            await _context.Database.OpenConnectionAsync();
            try
            {
                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    results.Add(new
                    {
                        id = reader.GetInt32(reader.GetOrdinal("id")),
                        title = reader.IsDBNull(reader.GetOrdinal("title")) ? "" : reader.GetString(reader.GetOrdinal("title")),
                        subtitle = reader.IsDBNull(reader.GetOrdinal("subtitle")) ? "" : reader.GetString(reader.GetOrdinal("subtitle")),
                        type = reader.GetString(reader.GetOrdinal("type")),
                        link = reader.GetString(reader.GetOrdinal("link"))
                    });
                }
            }
            finally
            {
                await _context.Database.CloseConnectionAsync();
            }

            return Ok(results);
        }
    }
}
