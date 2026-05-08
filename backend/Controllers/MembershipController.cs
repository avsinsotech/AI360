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
    public class MembershipController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MembershipController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateApplication([FromBody] MembershipApplication application)
        {
            if (application == null)
            {
                return BadRequest("Invalid application data.");
            }

            try
            {
                // Ensure table exists (handles out-of-sync migrations)
                await _context.Database.ExecuteSqlRawAsync(@"
                    CREATE TABLE IF NOT EXISTS `membership_applications` (
                        `Id` int NOT NULL AUTO_INCREMENT,
                        `MembershipNo` longtext CHARACTER SET utf8mb4 NULL,
                        `NiNo` longtext CHARACTER SET utf8mb4 NULL,
                        `SavingAccNo` longtext CHARACTER SET utf8mb4 NULL,
                        `ClientId` longtext CHARACTER SET utf8mb4 NULL,
                        `Branch` longtext CHARACTER SET utf8mb4 NULL,
                        `Date` longtext CHARACTER SET utf8mb4 NULL,
                        `FullName` longtext CHARACTER SET utf8mb4 NOT NULL,
                        `Age` longtext CHARACTER SET utf8mb4 NULL,
                        `Dob` longtext CHARACTER SET utf8mb4 NULL,
                        `CurrentAddress` longtext CHARACTER SET utf8mb4 NULL,
                        `PermanentAddress` longtext CHARACTER SET utf8mb4 NULL,
                        `WorkingAddress` longtext CHARACTER SET utf8mb4 NULL,
                        `MonthlyIncome` longtext CHARACTER SET utf8mb4 NULL,
                        `YearlyIncome` longtext CHARACTER SET utf8mb4 NULL,
                        `Phone` longtext CHARACTER SET utf8mb4 NULL,
                        `Mobile` longtext CHARACTER SET utf8mb4 NULL,
                        `Pan` longtext CHARACTER SET utf8mb4 NULL,
                        `Aadhaar` longtext CHARACTER SET utf8mb4 NULL,
                        `Email` longtext CHARACTER SET utf8mb4 NULL,
                        `IsMemberElsewhere` longtext CHARACTER SET utf8mb4 NULL,
                        `OtherExtOrgName` longtext CHARACTER SET utf8mb4 NULL,
                        `OtherExtBranch` longtext CHARACTER SET utf8mb4 NULL,
                        `FeeShare` longtext CHARACTER SET utf8mb4 NULL,
                        `FeeWelfare` longtext CHARACTER SET utf8mb4 NULL,
                        `FeeSavings` longtext CHARACTER SET utf8mb4 NULL,
                        `FeeEntrance` longtext CHARACTER SET utf8mb4 NULL,
                        `FeeOther` longtext CHARACTER SET utf8mb4 NULL,
                        `FeeTotal` longtext CHARACTER SET utf8mb4 NULL,
                        `OfficialMobile` longtext CHARACTER SET utf8mb4 NULL,
                        `DocPhotos` tinyint(1) NOT NULL,
                        `DocIdCard` tinyint(1) NOT NULL,
                        `DocRationCard` tinyint(1) NOT NULL,
                        `DocAadharCard` tinyint(1) NOT NULL,
                        `DocVoterCard` tinyint(1) NOT NULL,
                        `DocPanCard` tinyint(1) NOT NULL,
                        `DocLightBill` tinyint(1) NOT NULL,
                        `DocResidenceCert` tinyint(1) NOT NULL,
                        `DocUtara` tinyint(1) NOT NULL,
                        `NomineeName` longtext CHARACTER SET utf8mb4 NULL,
                        `NomineeAge` longtext CHARACTER SET utf8mb4 NULL,
                        `NomineeDob` longtext CHARACTER SET utf8mb4 NULL,
                        `NomineeRelation` longtext CHARACTER SET utf8mb4 NULL,
                        `NomineeAddress` longtext CHARACTER SET utf8mb4 NULL,
                        `Recommender1Name` longtext CHARACTER SET utf8mb4 NULL,
                        `Recommender1No` longtext CHARACTER SET utf8mb4 NULL,
                        `Recommender2Name` longtext CHARACTER SET utf8mb4 NULL,
                        `Recommender2No` longtext CHARACTER SET utf8mb4 NULL,
                        `AccType` longtext CHARACTER SET utf8mb4 NULL,
                        `AccInitialAmount` longtext CHARACTER SET utf8mb4 NULL,
                        `AccInitialAmountWords` longtext CHARACTER SET utf8mb4 NULL,
                        `Holder2Name` longtext CHARACTER SET utf8mb4 NULL,
                        `Holder2Age` longtext CHARACTER SET utf8mb4 NULL,
                        `OtherInstructions` longtext CHARACTER SET utf8mb4 NULL,
                        `Photo` longtext CHARACTER SET utf8mb4 NULL,
                        `ClientCode` varchar(20) CHARACTER SET utf8mb4 NULL,
                        `CreatedAt` datetime(6) NOT NULL,
                        PRIMARY KEY (`Id`)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
                ");
                
                // Ensure ClientCode column exists (for existing tables)
                await _context.Database.ExecuteSqlRawAsync(@"
                    SET @dbname = DATABASE();
                    SET @tablename = 'membership_applications';
                    SET @columnname = 'ClientCode';
                    SET @preparedStatement = (SELECT IF(
                      (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
                      'SELECT 1',
                      CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(20) NULL')
                    ));
                    PREPARE stmt FROM @preparedStatement;
                    EXECUTE stmt;
                    DEALLOCATE PREPARE stmt;
                ");

                var userRole = HttpContext.Items["UserRole"]?.ToString();
                var userClientCode = HttpContext.Items["ClientCode"]?.ToString();

                // If not SUPER_ADMIN, strictly force the ClientCode from the token
                if (userRole != "SUPER_ADMIN")
                {
                    if (string.IsNullOrEmpty(userClientCode)) return Unauthorized("ClientCode missing from token.");
                    application.ClientCode = userClientCode;
                }
                else if (string.IsNullOrEmpty(application.ClientCode))
                {
                    // For SUPER_ADMIN, use from token if not provided in body
                    application.ClientCode = userClientCode;
                }

                // Check for existing application with same Aadhaar for this client
                var existingApp = await _context.MembershipApplications
                    .FirstOrDefaultAsync(a => a.Aadhaar == application.Aadhaar && a.ClientCode == application.ClientCode);
                
                if (existingApp != null)
                {
                    return BadRequest(new { success = false, message = "A membership application already exists for this Aadhaar number." });
                }

                _context.MembershipApplications.Add(application);
                await _context.SaveChangesAsync();
                return Ok(new { success = true, id = application.Id, message = "Application submitted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetApplication(int id)
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();

            var application = await _context.MembershipApplications.FindAsync(id);
            if (application == null)
            {
                return NotFound("Application not found.");
            }

            if (userRole != "SUPER_ADMIN" && application.ClientCode != userClientCode)
            {
                return NotFound("Application not found or access denied.");
            }

            return Ok(application);
        }

        [HttpGet("by-aadhar/{aadhar}")]
        public async Task<IActionResult> GetByAadhar(string aadhar)
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();

            var query = _context.MembershipApplications.AsQueryable();
            if (userRole != "SUPER_ADMIN")
            {
                if (string.IsNullOrEmpty(userClientCode)) return BadRequest(new { message = "ClientCode not found in token." });
                query = query.Where(a => a.ClientCode == userClientCode);
            }

            var application = await query
                .OrderByDescending(a => a.CreatedAt)
                .FirstOrDefaultAsync(a => a.Aadhaar == aadhar);
            
            if (application == null)
            {
                return NotFound("Application not found.");
            }
            return Ok(application);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllApplications()
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();
            bool isSuperAdmin = userRole == "SUPER_ADMIN";

            if (!isSuperAdmin && string.IsNullOrEmpty(userClientCode))
                return BadRequest(new { message = "ClientCode not found in token." });

            var query = _context.MembershipApplications.AsQueryable();
            if (!isSuperAdmin)
            {
                query = query.Where(a => a.ClientCode == userClientCode);
            }

            var applications = await query.ToListAsync();
            return Ok(applications);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteApplication(int id)
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();

            var application = await _context.MembershipApplications.FindAsync(id);
            if (application == null)
            {
                return NotFound("Application not found.");
            }

            if (userRole != "SUPER_ADMIN" && application.ClientCode != userClientCode)
            {
                return Unauthorized("Access denied.");
            }

            _context.MembershipApplications.Remove(application);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Application deleted successfully." });
        }
    }
}
