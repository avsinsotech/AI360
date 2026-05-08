using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TushGptBackend.Data;
using TushGptBackend.Models;
using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TushGptBackend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UserManagementController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly TushGptBackend.Services.AuditService _audit;

        public UserManagementController(AppDbContext context, TushGptBackend.Services.AuditService audit)
        {
            _context = context;
            _audit = audit;
        }

        private string? GetClientCode() => HttpContext.Items["ClientCode"]?.ToString();
        private string? GetUserRole() => HttpContext.Items["UserRole"]?.ToString();
        private int? GetCurrentUserId() => int.TryParse(HttpContext.Items["UserId"]?.ToString(), out var id) ? id : null;

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var clientCode = GetClientCode();
            var role = GetUserRole();

            if (string.IsNullOrEmpty(clientCode))
                return BadRequest(new { message = "ClientCode required." });

            if (role != "BANK_ADMIN" && role != "SUPER_ADMIN" && role != "ADMIN" && role != "CLIENT")
                return StatusCode(403, new { message = "Access denied." });

            var query = from u in _context.Users
                        join ur in _context.UserRoles on u.UserCode equals ur.UserId into urGroup
                        from ur in urGroup.DefaultIfEmpty()
                        join r in _context.Roles on ur.RoleId equals r.Id into rGroup
                        from r in rGroup.DefaultIfEmpty()
                        where role == "SUPER_ADMIN" || u.ClientCode == clientCode
                        select new
                        {
                            u.UserCode,
                            u.UserName,
                            u.UserLoginId,
                            u.IsActive,
                            u.CreatedAt,
                            u.ClientCode,
                            RoleName = r != null ? r.RoleName : "No Role"
                        };

            return Ok(await query.OrderByDescending(x => x.CreatedAt).ToListAsync());
        }

        [HttpGet("roles")]
        public IActionResult GetAvailableRoles()
        {
            // Restricted to bank-level roles for this module
            var bankRoles = new[] { "BANK_ADMIN", "OPERATOR", "AUDITOR", "VIEWER" };
            var roles = _context.Roles
                .Where(r => bankRoles.Contains(r.RoleName))
                .Select(r => new { r.Id, r.RoleName, r.Description })
                .ToList();

            return Ok(roles);
        }

        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] UserCreateRequest request)
        {
            var clientCode = GetClientCode();
            var currentRole = GetUserRole();

            if (currentRole != "BANK_ADMIN" && currentRole != "SUPER_ADMIN" && currentRole != "CLIENT")
                return StatusCode(403, new { message = "Only admins can create users." });

            if (await _context.Users.AnyAsync(u => u.UserLoginId == request.UserLoginId))
                return BadRequest(new { message = "Login ID already exists." });

            var newUser = new User
            {
                UserName = request.UserName,
                UserLoginId = request.UserLoginId,
                UserPwd = BCrypt.Net.BCrypt.HashPassword(request.Password),
                ClientCode = clientCode,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            // Assign Role
            var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == request.Role);
            if (role != null)
            {
                _context.UserRoles.Add(new UserRole
                {
                    UserId = newUser.UserCode,
                    RoleId = role.Id
                });
                await _context.SaveChangesAsync();
            }

            await _audit.LogAsync(clientCode ?? "SYSTEM", GetCurrentUserId(), "USER_CREATE", 
                $"Created user {request.UserLoginId} with role {request.Role}", 
                HttpContext.Connection.RemoteIpAddress?.ToString());

            return Ok(new { success = true, userCode = newUser.UserCode });
        }

        [HttpPut("users/{id:int}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UserUpdateRequest request)
        {
            var clientCode = GetClientCode();
            var currentRole = GetUserRole();

            if (currentRole != "BANK_ADMIN" && currentRole != "SUPER_ADMIN" && currentRole != "CLIENT")
                return StatusCode(403, new { message = "Access denied." });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserCode == id && (currentRole == "SUPER_ADMIN" || u.ClientCode == clientCode));
            if (user == null) return NotFound(new { message = "User not found." });

            // Update role if provided
            if (!string.IsNullOrWhiteSpace(request.Role))
            {
                var existingUserRole = await _context.UserRoles.FirstOrDefaultAsync(ur => ur.UserId == id);
                var newRole = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == request.Role);
                if (newRole != null)
                {
                    if (existingUserRole != null)
                    {
                        existingUserRole.RoleId = newRole.Id;
                    }
                    else
                    {
                        _context.UserRoles.Add(new UserRole { UserId = id, RoleId = newRole.Id });
                    }
                }
            }

            // Update password if provided
            if (!string.IsNullOrWhiteSpace(request.NewPassword))
            {
                if (request.NewPassword.Length < 6)
                    return BadRequest(new { message = "Password must be at least 6 characters." });
                user.UserPwd = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            }

            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            await _audit.LogAsync(clientCode ?? "SYSTEM", GetCurrentUserId(), "USER_UPDATE",
                $"Updated user {user.UserLoginId} — Role: {request.Role ?? "unchanged"}, Password: {(string.IsNullOrWhiteSpace(request.NewPassword) ? "unchanged" : "changed")}",
                HttpContext.Connection.RemoteIpAddress?.ToString());

            return Ok(new { success = true, message = "User updated successfully." });
        }

        [HttpPatch("users/{id:int}/toggle-active")]
        public async Task<IActionResult> ToggleUser(int id)
        {
            var clientCode = GetClientCode();
            var currentRole = GetUserRole();

            if (currentRole != "BANK_ADMIN" && currentRole != "SUPER_ADMIN" && currentRole != "CLIENT")
                return StatusCode(403, new { message = "Access denied." });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserCode == id && (currentRole == "SUPER_ADMIN" || u.ClientCode == clientCode));
            if (user == null) return NotFound();

            user.IsActive = !user.IsActive;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            await _audit.LogAsync(clientCode ?? "SYSTEM", GetCurrentUserId(), "USER_TOGGLE", 
                $"Toggled user {user.UserLoginId} status to {user.IsActive}", 
                HttpContext.Connection.RemoteIpAddress?.ToString());

            return Ok(new { success = true, isActive = user.IsActive });
        }

        [HttpPatch("users/{id:int}/change-password")]
        public async Task<IActionResult> ChangePassword(int id, [FromBody] ChangePasswordRequest request)
        {
            var clientCode = GetClientCode();
            var currentRole = GetUserRole();

            if (currentRole != "BANK_ADMIN" && currentRole != "SUPER_ADMIN" && currentRole != "CLIENT")
                return StatusCode(403, new { message = "Access denied." });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserCode == id && (currentRole == "SUPER_ADMIN" || u.ClientCode == clientCode));
            if (user == null) return NotFound(new { message = "User not found." });

            if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
                return BadRequest(new { message = "Password must be at least 6 characters." });

            user.UserPwd = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            await _audit.LogAsync(clientCode ?? "SYSTEM", GetCurrentUserId(), "USER_PASSWORD_CHANGE",
                $"Password changed for user {user.UserLoginId}",
                HttpContext.Connection.RemoteIpAddress?.ToString());

            return Ok(new { success = true, message = "Password updated successfully." });
        }
    }

    public class UserCreateRequest
    {
        public string UserName { get; set; } = string.Empty;
        public string UserLoginId { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "OPERATOR";
    }

    public class ChangePasswordRequest
    {
        public string NewPassword { get; set; } = string.Empty;
    }

    public class UserUpdateRequest
    {
        public string? Role { get; set; }
        public string? NewPassword { get; set; }
    }
}
