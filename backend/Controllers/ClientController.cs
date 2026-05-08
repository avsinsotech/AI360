using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TushGptBackend.Attributes;
using TushGptBackend.Data;
using TushGptBackend.Models;
using TushGptBackend.Services;
using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Threading.Tasks;

namespace TushGptBackend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ClientController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly AuditService _audit;

        public ClientController(AppDbContext context, AuditService audit)
        {
            _context = context;
            _audit = audit;
        }

        /// <summary>
        /// Register a new Bank/Society. Creates client, admin user, and credit wallet.
        /// </summary>
        [AllowAnonymous]
        [HttpPost("signup")]
        public async Task<IActionResult> Signup([FromBody] ClientSignupRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                return BadRequest(new { message = "Institution name is required." });

            // Generate unique client code: AVS-XXXX (4 random alphanumeric chars)
            string clientCode;
            do
            {
                clientCode = "AVS-" + Guid.NewGuid().ToString("N")[..6].ToUpper();
            } while (await _context.Clients.AnyAsync(c => c.ClientCode == clientCode));

            // 1. Create client record
            var client = new Client
            {
                ClientCode = clientCode,
                Name = request.Name,
                Email = request.Email,
                Phone = request.Phone,
                Address = request.Address,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            _context.Clients.Add(client);
            await _context.SaveChangesAsync();

            // 2. Create default CLIENT user (NOT admin)
            var adminUsername = clientCode + "-admin";
            var adminPassword = Guid.NewGuid().ToString("N")[..8]; // 8-char random password
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(adminPassword);

            var adminUser = new User
            {
                UserName = request.Name + " Admin",
                UserLoginId = adminUsername,
                UserPwd = hashedPassword, // BCrypt hashed
                ClientCode = clientCode,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.Users.Add(adminUser);
            await _context.SaveChangesAsync();

            // 3. Initialize credit wallet (balance = 0)
            var wallet = new CreditWallet
            {
                ClientCode = clientCode,
                Balance = 0,
                UpdatedAt = DateTime.UtcNow
            };
            _context.CreditWallets.Add(wallet);
            await _context.SaveChangesAsync();

            // 4. Assign BANK_ADMIN role
            var clientRole = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "BANK_ADMIN");
            if (clientRole != null && adminUser.UserCode.HasValue)
            {
                _context.UserRoles.Add(new UserRole
                {
                    UserId = adminUser.UserCode.Value,
                    RoleId = clientRole.Id
                });
                await _context.SaveChangesAsync();
            }

            // 5. Audit log
            await _audit.LogAsync(clientCode, adminUser.UserCode, "CLIENT_SIGNUP",
                $"New client registered: {request.Name} ({clientCode})",
                HttpContext.Connection.RemoteIpAddress?.ToString());

            return Ok(new
            {
                success = true,
                clientCode,
                adminUsername,
                adminPassword,
                message = $"Client '{request.Name}' registered successfully. Use the admin credentials to login."
            });
        }

        /// <summary>
        /// Get client details by client code.
        /// </summary>
        [HttpGet("{clientCode}")]
        public async Task<IActionResult> GetClient(string clientCode)
        {
            var reqClientCode = HttpContext.Items["ClientCode"]?.ToString();
            var role = HttpContext.Items["UserRole"]?.ToString();

            // SUPER_ADMIN can view any client
            // CLIENT can only view their own
            if (role != "SUPER_ADMIN" && reqClientCode != clientCode)
                return StatusCode(403, new { message = "Access denied." });

            var client = await _context.Clients.FirstOrDefaultAsync(c => c.ClientCode == clientCode);
            if (client == null)
                return NotFound(new { message = "Client not found." });

            return Ok(client);
        }

        /// <summary>
        /// List all clients (super admin only).
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllClients()
        {
            var role = HttpContext.Items["UserRole"]?.ToString();
            if (role != "SUPER_ADMIN")
                return StatusCode(403, new { message = "Only SUPER_ADMIN can list all clients." });

            var clients = await _context.Clients
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            return Ok(clients);
        }

        /// <summary>
        /// Toggle client active status (super admin only).
        /// </summary>
        [HttpPatch("{clientCode}/toggle-active")]
        public async Task<IActionResult> ToggleClientActive(string clientCode)
        {
            var role = HttpContext.Items["UserRole"]?.ToString();
            if (role != "SUPER_ADMIN")
                return StatusCode(403, new { message = "Only SUPER_ADMIN can manage client status." });

            var client = await _context.Clients.FirstOrDefaultAsync(c => c.ClientCode == clientCode);
            if (client == null)
                return NotFound(new { message = "Client not found." });

            client.IsActive = !client.IsActive;
            await _context.SaveChangesAsync();

            int? auditUserId = null;
            if (int.TryParse(HttpContext.Items["UserId"]?.ToString(), out var uid)) auditUserId = uid;

            await _audit.LogAsync(clientCode, auditUserId, "CLIENT_STATUS_TOGGLE",
                $"Client {clientCode} status changed to {(client.IsActive ? "Active" : "Inactive")}",
                HttpContext.Connection.RemoteIpAddress?.ToString());

            return Ok(new { success = true, isActive = client.IsActive });
        }

        /// <summary>
        /// Get all users for a specific client (super admin only).
        /// </summary>
        [HttpGet("{clientCode}/users")]
        public async Task<IActionResult> GetClientUsers(string clientCode)
        {
            var role = HttpContext.Items["UserRole"]?.ToString();
            if (role != "SUPER_ADMIN")
                return StatusCode(403, new { message = "Only SUPER_ADMIN can view all users." });

            var users = await (from u in _context.Users
                              join ur in _context.UserRoles on u.UserCode equals ur.UserId into urGroup
                              from ur in urGroup.DefaultIfEmpty()
                              join r in _context.Roles on ur.RoleId equals r.Id into rGroup
                              from r in rGroup.DefaultIfEmpty()
                              where u.ClientCode == clientCode
                              orderby u.CreatedAt descending
                              select new
                              {
                                  u.UserCode,
                                  u.UserName,
                                  u.UserLoginId,
                                  u.IsActive,
                                  u.CreatedAt,
                                  RoleName = r != null ? r.RoleName : "No Role"
                              }).ToListAsync();

            return Ok(users);
        }

        /// <summary>
        /// Toggle user active status (super admin only).
        /// </summary>
        [HttpPatch("users/{userId:int}/toggle-active")]
        public async Task<IActionResult> ToggleUserActive(int userId)
        {
            var role = HttpContext.Items["UserRole"]?.ToString();
            if (role != "SUPER_ADMIN")
                return StatusCode(403, new { message = "Only SUPER_ADMIN can manage user status." });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserCode == userId);
            if (user == null)
                return NotFound(new { message = "User not found." });

            user.IsActive = !user.IsActive;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            int? auditUserId = null;
            if (int.TryParse(HttpContext.Items["UserId"]?.ToString(), out var uid)) auditUserId = uid;

            await _audit.LogAsync(user.ClientCode ?? "SYSTEM", auditUserId, "USER_STATUS_TOGGLE",
                $"User {user.UserLoginId} status changed to {(user.IsActive ? "Active" : "Inactive")}",
                HttpContext.Connection.RemoteIpAddress?.ToString());

            return Ok(new { success = true, isActive = user.IsActive });
        }

        /// <summary>
        /// Update client profile details.
        /// </summary>
        [HttpPatch("{clientCode}")]
        [HttpPut("{clientCode}")]
        public async Task<IActionResult> UpdateClient(string clientCode, [FromBody] ClientUpdateRequest request)
        {
            var reqClientCode = HttpContext.Items["ClientCode"]?.ToString();
            var role = HttpContext.Items["UserRole"]?.ToString();

            // SUPER_ADMIN can update any client
            // CLIENT/BANK_ADMIN can only update their own
            if (role != "SUPER_ADMIN" && reqClientCode != clientCode)
                return StatusCode(403, new { message = "Access denied." });

            var client = await _context.Clients.FirstOrDefaultAsync(c => c.ClientCode == clientCode);
            if (client == null)
                return NotFound(new { message = "Client not found." });

            client.Name = request.Name ?? client.Name;
            client.Email = request.Email;
            client.Phone = request.Phone;
            client.Address = request.Address;
            if (request.LogoUrl != null) client.LogoUrl = request.LogoUrl;

            await _context.SaveChangesAsync();

            int? auditUserId = null;
            if (int.TryParse(HttpContext.Items["UserId"]?.ToString(), out var uid)) auditUserId = uid;

            await _audit.LogAsync(clientCode, auditUserId, "CLIENT_PROFILE_UPDATE",
                $"Profile updated for {clientCode}",
                HttpContext.Connection.RemoteIpAddress?.ToString());

            return Ok(new { success = true, message = "Profile updated successfully.", client });
        }
    }

    public class ClientUpdateRequest
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? LogoUrl { get; set; }
    }

    public class ClientSignupRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
    }
}
