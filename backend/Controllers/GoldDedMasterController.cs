using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TushGptBackend.Data;
using TushGptBackend.Models;
using Microsoft.AspNetCore.Authorization;

namespace TushGptBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GoldDedMasterController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GoldDedMasterController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/GoldDedMaster
        [HttpGet]
        public async Task<ActionResult<IEnumerable<GoldDedMaster>>> GetGoldDeductions()
        {
            var data = await _context.GoldDedMasters.ToListAsync();
            System.Console.WriteLine($"[GoldDedMaster] Fetched {data.Count} records from DB");
            return data;
        }
    }
}
