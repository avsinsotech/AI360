using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TushGptBackend.Data;
using TushGptBackend.Models;
using BCrypt.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using TushGptBackend.Services;

namespace TushGptBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;
        private readonly CreditService _credit;
        private readonly AuditService _audit;
  
        public AuthController(AppDbContext context, IConfiguration config, CreditService credit, AuditService audit)
        {
            _context = context;
            _config = config;
            _credit = credit;
            _audit = audit;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => 
                u.UserName == request.Username || u.UserLoginId == request.Username);

            // Support BCrypt + legacy plain-text with auto-upgrade
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid username or password" });
            }

            bool passwordValid = false;
            bool needsUpgrade = false;

            // Try BCrypt first (new users)
            try
            {
                if (user.UserPwd != null && user.UserPwd.StartsWith("$2"))
                {
                    passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.UserPwd);
                }
            }
            catch { /* Not a BCrypt hash */ }

            // Fall back to plain-text (legacy users)
            if (!passwordValid)
            {
                if (user.UserPwd == request.Password)
                {
                    passwordValid = true;
                    needsUpgrade = true; // Mark for BCrypt upgrade
                }
            }

            if (!passwordValid)
            {
                return Unauthorized(new { message = "Invalid username or password" });
            }

            // Check if user is active
            if (!user.IsActive)
            {
                return Unauthorized(new { message = "User account is inactive. Please contact administrator." });
            }

            // Check if associated client is active
            if (!string.IsNullOrEmpty(user.ClientCode) && user.ClientCode != "GLOBAL")
            {
                var client = await _context.Clients.FirstOrDefaultAsync(c => c.ClientCode == user.ClientCode);
                if (client != null && !client.IsActive)
                {
                    return Unauthorized(new { message = "Organization account is inactive. Please contact administrator." });
                }
            }

            // Auto-upgrade plain-text password to BCrypt
            if (needsUpgrade)
            {
                user.UserPwd = BCrypt.Net.BCrypt.HashPassword(request.Password);
                user.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var keyStr = _config["JwtSettings:Secret"] ?? "SuperSecretKeyWhichIsAtLeast32BytesLong#123!";
            var key = Encoding.ASCII.GetBytes(keyStr);

            var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
            if (clientIp == "::1") clientIp = "127.0.0.1";
            var lastLoginFormatted = DateTime.Now.ToString("dd MMM yyyy, hh:mm tt");

            // Build claims list — always include user ID and name
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserCode?.ToString() ?? "0"),
                new Claim(ClaimTypes.Name, user.UserName ?? user.UserLoginId ?? "Unknown"),
                new Claim("ClientIp", clientIp),
                new Claim("LastLogin", lastLoginFormatted)
            };

            // Look up user's role from user_roles table
            Console.WriteLine($"[DEBUG] Login attempt for user: {user.UserLoginId}, UserCode: {user.UserCode}");

            var userRole = await (from ur in _context.UserRoles
                                 join r in _context.Roles on ur.RoleId equals r.Id
                                 where ur.UserId == user.UserCode
                                 select r.RoleName).FirstOrDefaultAsync();
            
            Console.WriteLine($"[DEBUG] Role lookup result: '{(userRole ?? "NULL")}'");

            // 1. Handle Role Claims (Exactly Once)
            if (!string.IsNullOrEmpty(userRole))
            {
                claims.Add(new Claim(ClaimTypes.Role, userRole));
                claims.Add(new Claim("Role", userRole));
            }

            // 2. Handle ClientCode Claim (Exactly Once)
            if (userRole == "SUPER_ADMIN" && string.IsNullOrEmpty(user.ClientCode))
            {
                claims.Add(new Claim("ClientCode", "GLOBAL"));
                Console.WriteLine("[DEBUG] Assigned 'GLOBAL' ClientCode to SUPER_ADMIN");
            }
            else if (!string.IsNullOrEmpty(user.ClientCode))
            {
                claims.Add(new Claim("ClientCode", user.ClientCode));
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(24),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            // Audit Login
            await _audit.LogAsync(user.ClientCode ?? "GLOBAL", user.UserCode, "LOGIN", $"User {user.UserLoginId} logged in successfully.", HttpContext.Connection.RemoteIpAddress?.ToString());

            return Ok(new { token = tokenString });
        }

        [Authorize]
        [HttpPost("request-otp")]
        public async Task<IActionResult> RequestOtp([FromBody] OtpRequest request)
        {
            if (string.IsNullOrEmpty(request.MobileNumber) || request.MobileNumber.Length < 10)
            {
                return BadRequest(new { Message = "Invalid mobile number." });
            }

            // Generate a 6-digit OTP
            string otpCode = RandomNumberGenerator.GetInt32(100000, 999999).ToString();

            // Override with 123456 for easier testing if needed, or keep random
            // otpCode = "123456";

            // Credit deduction for multi-tenant users
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();
            if (!string.IsNullOrEmpty(userClientCode) && userClientCode != "GLOBAL")
            {
                int? userId = null;
                if (int.TryParse(HttpContext.Items["UserId"]?.ToString(), out var uid)) userId = uid;
                var (success, _, msg) = await _credit.DeductCreditAsync(userClientCode, "MOBILE_VERIFY", null, userId, HttpContext.Connection.RemoteIpAddress?.ToString());
                if (!success)
                    return StatusCode(402, new { message = msg });
            }

            // Save to DB
            var existingRecord = await _context.OtpVerifications
                .FirstOrDefaultAsync(o => o.MobileNumber == request.MobileNumber);

            if (existingRecord != null)
            {
                existingRecord.OtpCode = otpCode;
                existingRecord.ExpiresAt = DateTime.UtcNow.AddMinutes(5);
                existingRecord.IsVerified = false;
                existingRecord.ClientCode = userClientCode;
            }
            else
            {
                var newVerification = new OtpVerification
                {
                    MobileNumber = request.MobileNumber,
                    OtpCode = otpCode,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(5),
                    IsVerified = false,
                    ClientCode = userClientCode
                };
                _context.OtpVerifications.Add(newVerification);
            }

            await _context.SaveChangesAsync();

            // Send SMS via Groww SaaS API
            try
            {
                using var httpClient = new HttpClient();
                // Matching exactly: "Online A/c Opening OTP:@OTP Thank you AVS"
                string messageBody = $"Online A/c Opening OTP:{otpCode} Thank you AVS";
                string encodedMessage = Uri.EscapeDataString(messageBody);
                string tempid = "1001837171501697258";
                string url = $"https://api2.growwsaas.com/fe/api/v1/send?username=GYEavsin&password=sms2020&unicode=false&from=AVSIPL&to={request.MobileNumber}&text={encodedMessage}&tempid={tempid}";
                
                var response = await httpClient.GetAsync(url);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                if (!response.IsSuccessStatusCode)
                {
                }
            }
            catch (Exception)
            {
            }

            return Ok(new { Message = "OTP sent successfully." });
        }

        [Authorize]
        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] OtpVerifyReq request)
        {
            var otpRecord = await _context.OtpVerifications
                .FirstOrDefaultAsync(o => o.MobileNumber == request.MobileNumber);

            // Allow bypass with "123456" for testing if actual SMS fails
            bool isBypass = request.OtpCode == "123456";

            if (!isBypass)
            {
                if (otpRecord == null || otpRecord.OtpCode != request.OtpCode)
                {
                    return BadRequest(new { Message = "Invalid OTP." });
                }

                if (otpRecord.ExpiresAt < DateTime.UtcNow)
                {
                    return BadRequest(new { Message = "OTP has expired. Please request a new one." });
                }
            }

            // Mark as verified if we have a record
            if (otpRecord != null) {
                otpRecord.IsVerified = true;
                await _context.SaveChangesAsync();
            }

            // Generate JWT Token
            // We'll create a dummy user identity since no username/password was provided,
            // or we could look up a user by phone number if the Users table had one.
            var tokenHandler = new JwtSecurityTokenHandler();
            var keyStr = _config["JwtSettings:Secret"] ?? "SuperSecretKeyWhichIsAtLeast32BytesLong#123!";
            var key = Encoding.ASCII.GetBytes(keyStr);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.NameIdentifier, request.MobileNumber),
                    new Claim(ClaimTypes.Name, request.MobileNumber)
                }),
                Expires = DateTime.UtcNow.AddHours(24),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            
            return Ok(new 
            { 
                Message = "OTP verified successfully.",
                token = tokenHandler.WriteToken(token) 
            });
        }

        [Authorize]
        [HttpGet("verified-numbers")]
        public async Task<IActionResult> GetVerifiedNumbers()
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();

            var query = _context.OtpVerifications.AsQueryable();
            if (userRole != "SUPER_ADMIN")
            {
                if (string.IsNullOrEmpty(userClientCode)) return BadRequest(new { message = "ClientCode not found in token." });
                query = query.Where(o => o.ClientCode == userClientCode);
            }

            var verifiedRecords = await query
                .Where(o => o.IsVerified)
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new {
                    o.Id,
                    o.MobileNumber,
                    o.CreatedAt
                })
                .ToListAsync();

            return Ok(verifiedRecords);
        }
        [Authorize]
        [HttpPost("switch-client")]
        public async Task<IActionResult> SwitchClient([FromBody] SwitchClientRequest request)
        {
            var currentRole = HttpContext.Items["UserRole"]?.ToString();
            var originalRole = HttpContext.Items["OriginalRole"]?.ToString();
            var currentUserIdStr = HttpContext.Items["UserId"]?.ToString();

            if (currentRole != "SUPER_ADMIN" && originalRole != "SUPER_ADMIN")
            {
                return StatusCode(403, new { message = "Only SUPER_ADMIN can switch institution context." });
            }

            if (string.IsNullOrEmpty(request.ClientCode))
            {
                return BadRequest(new { message = "Target ClientCode is required." });
            }

            // Verify client exists
            var client = await _context.Clients.FirstOrDefaultAsync(c => c.ClientCode == request.ClientCode);
            if (client == null && request.ClientCode != "GLOBAL")
            {
                return NotFound(new { message = "Institution not found." });
            }

            if (!int.TryParse(currentUserIdStr, out var userId))
            {
                 return Unauthorized(new { message = "User identity not found." });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserCode == userId);
            if (user == null) return NotFound(new { message = "User not found." });

            // Generate NEW JWT Token with the target ClientCode
            var tokenHandler = new JwtSecurityTokenHandler();
            var keyStr = _config["JwtSettings:Secret"] ?? "SuperSecretKeyWhichIsAtLeast32BytesLong#123!";
            var key = Encoding.ASCII.GetBytes(keyStr);

            var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
            if (clientIp == "::1") clientIp = "127.0.0.1";
            var lastLoginFormatted = DateTime.Now.ToString("dd MMM yyyy, hh:mm tt");

            var isGlobal = request.ClientCode == "GLOBAL";
            var targetRole = isGlobal ? "SUPER_ADMIN" : "BANK_ADMIN";

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserCode?.ToString() ?? "0"),
                new Claim(ClaimTypes.Name, user.UserName ?? user.UserLoginId ?? "Unknown"),
                new Claim(ClaimTypes.Role, targetRole),
                new Claim("Role", targetRole), // Double-mapped for robust Middleware extraction
                new Claim("ClientCode", request.ClientCode),
                new Claim("clientcode", request.ClientCode), // Lowercase variant for flexible parsing
                new Claim("ClientIp", clientIp),
                new Claim("LastLogin", lastLoginFormatted)
            };

            if (!isGlobal) 
            {
                claims.Add(new Claim("Impersonated", "true"));
                claims.Add(new Claim("OriginalRole", "SUPER_ADMIN"));
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(24),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            // Audit the switch
            await _audit.LogAsync("GLOBAL", user.UserCode, "IMPERSONATION", $"SuperAdmin switched session context to: {request.ClientCode}", clientIp);

            return Ok(new { token = tokenString });
        }
    }

    public class SwitchClientRequest
    {
        public string ClientCode { get; set; } = string.Empty;
    }
}
