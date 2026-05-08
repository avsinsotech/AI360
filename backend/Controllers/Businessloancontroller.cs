// using Microsoft.AspNetCore.Mvc;
// using Microsoft.EntityFrameworkCore;
// using TushGptBackend.Data;
// using TushGptBackend.Dtos;
// using TushGptBackend.Models;

// namespace TushGptBackend.Controllers
// {
//     [ApiController]
//     [Route("api/business-loan")]
//     public class BusinessLoanController : ControllerBase
//     {
//         private readonly AppDbContext _db;

//         public BusinessLoanController(AppDbContext db)
//         {
//             _db = db;
//         }

//         // ── Helper: safe date parse ───────────────────────────────────────────
//         private static DateTime? ParseDate(string? s)
//         {
//             if (string.IsNullOrWhiteSpace(s)) return null;
//             return DateTime.TryParse(s, out var d) ? DateTime.SpecifyKind(d, DateTimeKind.Utc) : null;
//         }

//         // ── Helper: map PersonInfoDto → BusinessLoanBorrower ─────────────────
//         private static void MapPersonToBorrower(PersonInfoDto dto, BusinessLoanBorrower b)
//         {
//             b.PhotoBase64 = dto.PhotoBase64;
//             b.FullName = dto.FullName;
//             b.Age = dto.Age;
//             b.MemberNo = dto.MemberNo;
//             b.SharesCount = dto.SharesCount;
//             b.SharesAmount = dto.SharesAmount;
//             b.FatherHusbandName = dto.FatherHusbandName;
//             b.FatherHusbandAge = dto.FatherHusbandAge;
//             b.MotherName = dto.MotherName;
//             b.MotherAge = dto.MotherAge;
//             b.ResidentialAddress = dto.ResidentialAddress;
//             b.PinCode = dto.PinCode;
//             b.Telephone = dto.Telephone;
//             b.Mobile = dto.Mobile;
//             b.Email = dto.Email;
//             b.PropertyTypes = dto.PropertyTypes != null ? string.Join(",", dto.PropertyTypes) : null;
//             b.ResidenceMonths = dto.ResidenceMonths;
//             b.ResidenceYears = dto.ResidenceYears;
//             b.MaritalStatus = dto.MaritalStatus;
//             b.Dependents = dto.Dependents;
//             b.CompanyName = dto.CompanyName;
//             b.CompanyAddress = dto.CompanyAddress;
//             b.CompanyPinCode = dto.CompanyPinCode;
//             b.CompanyTelephone = dto.CompanyTelephone;
//             b.CompanyMobile = dto.CompanyMobile;
//             b.CompanyEmail = dto.CompanyEmail;
//             b.Department = dto.Department;
//             b.Designation = dto.Designation;
//             b.EmployeeCode = dto.EmployeeCode;
//             b.EmploymentMonths = dto.EmploymentMonths;
//             b.EmploymentYears = dto.EmploymentYears;
//             b.RetirementDate = ParseDate(dto.RetirementDate);
//             b.MonthlySalary = dto.MonthlySalary;
//             b.Deductions = dto.Deductions;
//             b.NetSalary = dto.NetSalary;
//             b.AnnualBusinessIncome = dto.AnnualBusinessIncome;
//             b.TotalExpenses = dto.TotalExpenses;
//             b.NetAnnualIncome = dto.NetAnnualIncome;
//             b.FamilyIncome = dto.FamilyIncome;
//             b.FamilyIncomeType = dto.FamilyIncomeType;
//             b.PropertyOwnerName = dto.PropertyOwnerName;
//             b.PropertyOwnerRelation = dto.PropertyOwnerRelation;
//             b.VillageMukkam = dto.VillageMukkam;
//             b.VillagePost = dto.VillagePost;
//             b.VillageTaluka = dto.VillageTaluka;
//             b.VillageDistrict = dto.VillageDistrict;
//             b.VillageState = dto.VillageState;
//             b.VillagePinCode = dto.VillagePinCode;
//             b.VillageTelephone = dto.VillageTelephone;
//             b.VillageMobile = dto.VillageMobile;
//             b.PrevLoanType = dto.PrevLoanType;
//             b.PrevLoanAccountNo = dto.PrevLoanAccountNo;
//             b.PrevLoanAmount = dto.PrevLoanAmount;
//             b.PrevLoanTakenDate = ParseDate(dto.PrevLoanTakenDate);
//             b.PrevLoanRepaidDate = ParseDate(dto.PrevLoanRepaidDate);
//             b.Guar94aBorrowerName = dto.Guar94aBorrowerName;
//             b.Guar94aLoanType = dto.Guar94aLoanType;
//             b.Guar94aAccountNo = dto.Guar94aAccountNo;
//             b.Guar94aAmount = dto.Guar94aAmount;
//             b.Guar94aTakenDate = ParseDate(dto.Guar94aTakenDate);
//             b.Guar94aRepaidDate = ParseDate(dto.Guar94aRepaidDate);
//             b.Guar94bBorrowerName = dto.Guar94bBorrowerName;
//             b.Guar94bLoanType = dto.Guar94bLoanType;
//             b.Guar94bAccountNo = dto.Guar94bAccountNo;
//             b.Guar94bAmount = dto.Guar94bAmount;
//             b.Guar94bTakenDate = ParseDate(dto.Guar94bTakenDate);
//             b.Guar94bRepaidDate = ParseDate(dto.Guar94bRepaidDate);
//             b.FamilyLoanMemberName = dto.FamilyLoanMemberName;
//             b.FamilyLoanType = dto.FamilyLoanType;
//             b.FamilyLoanAccountNo = dto.FamilyLoanAccountNo;
//             b.FamilyLoanAmount = dto.FamilyLoanAmount;
//             b.FamilyLoanTakenDate = ParseDate(dto.FamilyLoanTakenDate);
//             b.FamilyLoanRepaidDate = ParseDate(dto.FamilyLoanRepaidDate);
//             b.OtherBankName = dto.OtherBankName;
//             b.OtherBankBranch = dto.OtherBankBranch;
//             b.OtherBankLoanType = dto.OtherBankLoanType;
//             b.OtherBankAccountNo = dto.OtherBankAccountNo;
//             b.OtherBankLoanAmount = dto.OtherBankLoanAmount;
//             b.OtherBankLoanTakenDate = ParseDate(dto.OtherBankLoanTakenDate);
//             b.OtherBankLoanRepaidDate = ParseDate(dto.OtherBankLoanRepaidDate);
//             b.PlaceOfSign = dto.PlaceOfSign;
//             b.DateOfSign = ParseDate(dto.DateOfSign);
//         }

//         // ── Helper: map PersonInfoDto → BusinessLoanGuarantor ────────────────
//         private static void MapPersonToGuarantor(PersonInfoDto dto, BusinessLoanGuarantor g)
//         {
//             g.PhotoBase64 = dto.PhotoBase64;
//             g.FullName = dto.FullName;
//             g.Age = dto.Age;
//             g.MemberNo = dto.MemberNo;
//             g.SharesCount = dto.SharesCount;
//             g.SharesAmount = dto.SharesAmount;
//             g.FatherHusbandName = dto.FatherHusbandName;
//             g.FatherHusbandAge = dto.FatherHusbandAge;
//             g.MotherName = dto.MotherName;
//             g.MotherAge = dto.MotherAge;
//             g.ResidentialAddress = dto.ResidentialAddress;
//             g.PinCode = dto.PinCode;
//             g.Telephone = dto.Telephone;
//             g.Mobile = dto.Mobile;
//             g.Email = dto.Email;
//             g.PropertyTypes = dto.PropertyTypes != null ? string.Join(",", dto.PropertyTypes) : null;
//             g.ResidenceMonths = dto.ResidenceMonths;
//             g.ResidenceYears = dto.ResidenceYears;
//             g.MaritalStatus = dto.MaritalStatus;
//             g.Dependents = dto.Dependents;
//             g.CompanyName = dto.CompanyName;
//             g.CompanyAddress = dto.CompanyAddress;
//             g.CompanyPinCode = dto.CompanyPinCode;
//             g.CompanyTelephone = dto.CompanyTelephone;
//             g.CompanyMobile = dto.CompanyMobile;
//             g.CompanyEmail = dto.CompanyEmail;
//             g.Department = dto.Department;
//             g.Designation = dto.Designation;
//             g.EmployeeCode = dto.EmployeeCode;
//             g.EmploymentMonths = dto.EmploymentMonths;
//             g.EmploymentYears = dto.EmploymentYears;
//             g.RetirementDate = ParseDate(dto.RetirementDate);
//             g.MonthlySalary = dto.MonthlySalary;
//             g.Deductions = dto.Deductions;
//             g.NetSalary = dto.NetSalary;
//             g.AnnualBusinessIncome = dto.AnnualBusinessIncome;
//             g.TotalExpenses = dto.TotalExpenses;
//             g.NetAnnualIncome = dto.NetAnnualIncome;
//             g.FamilyIncome = dto.FamilyIncome;
//             g.FamilyIncomeType = dto.FamilyIncomeType;
//             g.PropertyOwnerName = dto.PropertyOwnerName;
//             g.PropertyOwnerRelation = dto.PropertyOwnerRelation;
//             g.VillageMukkam = dto.VillageMukkam;
//             g.VillagePost = dto.VillagePost;
//             g.VillageTaluka = dto.VillageTaluka;
//             g.VillageDistrict = dto.VillageDistrict;
//             g.VillageState = dto.VillageState;
//             g.VillagePinCode = dto.VillagePinCode;
//             g.VillageTelephone = dto.VillageTelephone;
//             g.VillageMobile = dto.VillageMobile;
//             g.PrevLoanType = dto.PrevLoanType;
//             g.PrevLoanAccountNo = dto.PrevLoanAccountNo;
//             g.PrevLoanAmount = dto.PrevLoanAmount;
//             g.PrevLoanTakenDate = ParseDate(dto.PrevLoanTakenDate);
//             g.PrevLoanRepaidDate = ParseDate(dto.PrevLoanRepaidDate);
//             g.Guar94aBorrowerName = dto.Guar94aBorrowerName;
//             g.Guar94aLoanType = dto.Guar94aLoanType;
//             g.Guar94aAccountNo = dto.Guar94aAccountNo;
//             g.Guar94aAmount = dto.Guar94aAmount;
//             g.Guar94aTakenDate = ParseDate(dto.Guar94aTakenDate);
//             g.Guar94aRepaidDate = ParseDate(dto.Guar94aRepaidDate);
//             g.Guar94bBorrowerName = dto.Guar94bBorrowerName;
//             g.Guar94bLoanType = dto.Guar94bLoanType;
//             g.Guar94bAccountNo = dto.Guar94bAccountNo;
//             g.Guar94bAmount = dto.Guar94bAmount;
//             g.Guar94bTakenDate = ParseDate(dto.Guar94bTakenDate);
//             g.Guar94bRepaidDate = ParseDate(dto.Guar94bRepaidDate);
//             g.FamilyLoanMemberName = dto.FamilyLoanMemberName;
//             g.FamilyLoanType = dto.FamilyLoanType;
//             g.FamilyLoanAccountNo = dto.FamilyLoanAccountNo;
//             g.FamilyLoanAmount = dto.FamilyLoanAmount;
//             g.FamilyLoanTakenDate = ParseDate(dto.FamilyLoanTakenDate);
//             g.FamilyLoanRepaidDate = ParseDate(dto.FamilyLoanRepaidDate);
//             g.OtherBankName = dto.OtherBankName;
//             g.OtherBankBranch = dto.OtherBankBranch;
//             g.OtherBankLoanType = dto.OtherBankLoanType;
//             g.OtherBankAccountNo = dto.OtherBankAccountNo;
//             g.OtherBankLoanAmount = dto.OtherBankLoanAmount;
//             g.OtherBankLoanTakenDate = ParseDate(dto.OtherBankLoanTakenDate);
//             g.OtherBankLoanRepaidDate = ParseDate(dto.OtherBankLoanRepaidDate);
//             g.PlaceOfSign = dto.PlaceOfSign;
//             g.DateOfSign = ParseDate(dto.DateOfSign);
//         }

//         // ── Helper: map PersonInfoDto → BusinessLoanExtraGuarantor ───────────
//         private static void MapPersonToExtra(ExtraGuarantorDto dto, BusinessLoanExtraGuarantor eg)
//         {
//             eg.FrontendId = dto.FrontendId;
//             eg.GuarantorNumber = dto.GuarantorNumber;
//             eg.PhotoBase64 = dto.PhotoBase64;
//             eg.FullName = dto.FullName;
//             eg.Age = dto.Age;
//             eg.MemberNo = dto.MemberNo;
//             eg.SharesCount = dto.SharesCount;
//             eg.SharesAmount = dto.SharesAmount;
//             eg.FatherHusbandName = dto.FatherHusbandName;
//             eg.FatherHusbandAge = dto.FatherHusbandAge;
//             eg.MotherName = dto.MotherName;
//             eg.MotherAge = dto.MotherAge;
//             eg.ResidentialAddress = dto.ResidentialAddress;
//             eg.PinCode = dto.PinCode;
//             eg.Telephone = dto.Telephone;
//             eg.Mobile = dto.Mobile;
//             eg.Email = dto.Email;
//             eg.PropertyTypes = dto.PropertyTypes != null ? string.Join(",", dto.PropertyTypes) : null;
//             eg.ResidenceMonths = dto.ResidenceMonths;
//             eg.ResidenceYears = dto.ResidenceYears;
//             eg.MaritalStatus = dto.MaritalStatus;
//             eg.Dependents = dto.Dependents;
//             eg.CompanyName = dto.CompanyName;
//             eg.CompanyAddress = dto.CompanyAddress;
//             eg.CompanyPinCode = dto.CompanyPinCode;
//             eg.CompanyTelephone = dto.CompanyTelephone;
//             eg.CompanyMobile = dto.CompanyMobile;
//             eg.CompanyEmail = dto.CompanyEmail;
//             eg.Department = dto.Department;
//             eg.Designation = dto.Designation;
//             eg.EmployeeCode = dto.EmployeeCode;
//             eg.EmploymentMonths = dto.EmploymentMonths;
//             eg.EmploymentYears = dto.EmploymentYears;
//             eg.RetirementDate = ParseDate(dto.RetirementDate);
//             eg.MonthlySalary = dto.MonthlySalary;
//             eg.Deductions = dto.Deductions;
//             eg.NetSalary = dto.NetSalary;
//             eg.AnnualBusinessIncome = dto.AnnualBusinessIncome;
//             eg.TotalExpenses = dto.TotalExpenses;
//             eg.NetAnnualIncome = dto.NetAnnualIncome;
//             eg.FamilyIncome = dto.FamilyIncome;
//             eg.FamilyIncomeType = dto.FamilyIncomeType;
//             eg.PropertyOwnerName = dto.PropertyOwnerName;
//             eg.PropertyOwnerRelation = dto.PropertyOwnerRelation;
//             eg.VillageMukkam = dto.VillageMukkam;
//             eg.VillagePost = dto.VillagePost;
//             eg.VillageTaluka = dto.VillageTaluka;
//             eg.VillageDistrict = dto.VillageDistrict;
//             eg.VillageState = dto.VillageState;
//             eg.VillagePinCode = dto.VillagePinCode;
//             eg.VillageTelephone = dto.VillageTelephone;
//             eg.VillageMobile = dto.VillageMobile;
//             eg.PrevLoanType = dto.PrevLoanType;
//             eg.PrevLoanAccountNo = dto.PrevLoanAccountNo;
//             eg.PrevLoanAmount = dto.PrevLoanAmount;
//             eg.PrevLoanTakenDate = ParseDate(dto.PrevLoanTakenDate);
//             eg.PrevLoanRepaidDate = ParseDate(dto.PrevLoanRepaidDate);
//             eg.Guar94aBorrowerName = dto.Guar94aBorrowerName;
//             eg.Guar94aLoanType = dto.Guar94aLoanType;
//             eg.Guar94aAccountNo = dto.Guar94aAccountNo;
//             eg.Guar94aAmount = dto.Guar94aAmount;
//             eg.Guar94aTakenDate = ParseDate(dto.Guar94aTakenDate);
//             eg.Guar94aRepaidDate = ParseDate(dto.Guar94aRepaidDate);
//             eg.Guar94bBorrowerName = dto.Guar94bBorrowerName;
//             eg.Guar94bLoanType = dto.Guar94bLoanType;
//             eg.Guar94bAccountNo = dto.Guar94bAccountNo;
//             eg.Guar94bAmount = dto.Guar94bAmount;
//             eg.Guar94bTakenDate = ParseDate(dto.Guar94bTakenDate);
//             eg.Guar94bRepaidDate = ParseDate(dto.Guar94bRepaidDate);
//             eg.FamilyLoanMemberName = dto.FamilyLoanMemberName;
//             eg.FamilyLoanType = dto.FamilyLoanType;
//             eg.FamilyLoanAccountNo = dto.FamilyLoanAccountNo;
//             eg.FamilyLoanAmount = dto.FamilyLoanAmount;
//             eg.FamilyLoanTakenDate = ParseDate(dto.FamilyLoanTakenDate);
//             eg.FamilyLoanRepaidDate = ParseDate(dto.FamilyLoanRepaidDate);
//             eg.OtherBankName = dto.OtherBankName;
//             eg.OtherBankBranch = dto.OtherBankBranch;
//             eg.OtherBankLoanType = dto.OtherBankLoanType;
//             eg.OtherBankAccountNo = dto.OtherBankAccountNo;
//             eg.OtherBankLoanAmount = dto.OtherBankLoanAmount;
//             eg.OtherBankLoanTakenDate = ParseDate(dto.OtherBankLoanTakenDate);
//             eg.OtherBankLoanRepaidDate = ParseDate(dto.OtherBankLoanRepaidDate);
//             eg.PlaceOfSign = dto.PlaceOfSign;
//             eg.DateOfSign = ParseDate(dto.DateOfSign);
//         }

//         // ════════════════════════════════════════════════════════════════════
//         //  STEP APIs — called on "Save & Next" for each page
//         // ════════════════════════════════════════════════════════════════════

//         /// <summary>
//         /// STEP 1 — Basic Info. Creates a new application (or returns existing id).
//         /// Call this on "Save & Next" from Page 1. Returns applicationId for all subsequent calls.
//         /// </summary>
//         [HttpPost("step1")]
//         public async Task<IActionResult> SaveStep1([FromBody] BlStep1Dto dto)
//         {
//             if (!ModelState.IsValid) return BadRequest(ModelState);

//             var clientCode = HttpContext.Items["ClientCode"] as string;

//             var app = new BusinessLoanApplication
//             {
//                 ClientCode = clientCode,
//                 ApplicationDate = ParseDate(dto.ApplicationDate) ?? DateTime.UtcNow,
//                 MemberNo = dto.MemberNo,
//                 LoanAccountNo = dto.LoanAccountNo,
//                 Branch = dto.Branch,
//                 ApplicantName = dto.ApplicantName,
//                 ApplicantAge = dto.ApplicantAge,
//                 LoanAmount = dto.LoanAmount,
//                 LoanAmountInWords = dto.LoanAmountInWords,
//                 RepaymentMonths = dto.RepaymentMonths,
//                 FirstInstallmentAfterMonths = dto.FirstInstallmentAfterMonths,
//                 InstallmentDate = dto.InstallmentDate,
//                 Purpose = dto.Purpose,
//                 MaritalStatus = dto.MaritalStatus,
//                 Dependents = dto.Dependents,
//                 Guarantor1Name = dto.Guarantor1Name,
//                 Guarantor1Age = dto.Guarantor1Age,
//                 Guarantor2Name = dto.Guarantor2Name,
//                 Guarantor2Age = dto.Guarantor2Age,
//                 Guarantor3Name = dto.Guarantor3Name,
//                 Guarantor3Age = dto.Guarantor3Age,
//                 Status = "Draft",
//                 CreatedAt = DateTime.UtcNow,
//                 UpdatedAt = DateTime.UtcNow
//             };

//             // Save extra guarantor summaries
//             if (dto.ExtraGuarantors?.Any() == true)
//             {
//                 app.ExtraGuarantors = dto.ExtraGuarantors.Select((eg, idx) => new BusinessLoanExtraGuarantor
//                 {
//                     FrontendId = eg.FrontendId,
//                     GuarantorNumber = idx + 3,
//                     FullName = eg.Name,
//                     Age = eg.Age
//                 }).ToList();
//             }

//             _db.BusinessLoanApplications.Add(app);
//             await _db.SaveChangesAsync();

//             return Ok(new BlApplicationResponse { Id = app.Id, Status = app.Status, Message = "Step 1 saved." });
//         }

//         /// <summary>
//         /// STEP 1 — Update existing application basic info.
//         /// </summary>
//         [HttpPut("step1/{id}")]
//         public async Task<IActionResult> UpdateStep1(int id, [FromBody] BlStep1Dto dto)
//         {
//             var app = await _db.BusinessLoanApplications
//                 .Include(a => a.ExtraGuarantors)
//                 .FirstOrDefaultAsync(a => a.Id == id);

//             if (app == null) return NotFound(new { Message = "Application not found." });
//             if (app.Status == "Submitted") return BadRequest(new { Message = "Cannot edit a submitted application." });

//             app.ApplicationDate = ParseDate(dto.ApplicationDate) ?? app.ApplicationDate;
//             app.MemberNo = dto.MemberNo;
//             app.LoanAccountNo = dto.LoanAccountNo;
//             app.Branch = dto.Branch;
//             app.ApplicantName = dto.ApplicantName;
//             app.ApplicantAge = dto.ApplicantAge;
//             app.LoanAmount = dto.LoanAmount;
//             app.LoanAmountInWords = dto.LoanAmountInWords;
//             app.RepaymentMonths = dto.RepaymentMonths;
//             app.FirstInstallmentAfterMonths = dto.FirstInstallmentAfterMonths;
//             app.InstallmentDate = dto.InstallmentDate;
//             app.Purpose = dto.Purpose;
//             app.MaritalStatus = dto.MaritalStatus;
//             app.Dependents = dto.Dependents;
//             app.Guarantor1Name = dto.Guarantor1Name;
//             app.Guarantor1Age = dto.Guarantor1Age;
//             app.Guarantor2Name = dto.Guarantor2Name;
//             app.Guarantor2Age = dto.Guarantor2Age;
//             app.Guarantor3Name = dto.Guarantor3Name;
//             app.Guarantor3Age = dto.Guarantor3Age;
//             app.UpdatedAt = DateTime.UtcNow;

//             // Sync extra guarantor summaries (name/age only from step1)
//             var existingExtras = app.ExtraGuarantors.ToList();
//             _db.BusinessLoanExtraGuarantors.RemoveRange(existingExtras.Where(e =>
//                 dto.ExtraGuarantors == null || !dto.ExtraGuarantors.Any(d => d.FrontendId == e.FrontendId)));

//             if (dto.ExtraGuarantors?.Any() == true)
//             {
//                 foreach (var eg in dto.ExtraGuarantors)
//                 {
//                     var existing = existingExtras.FirstOrDefault(e => e.FrontendId == eg.FrontendId);
//                     if (existing != null)
//                     {
//                         existing.FullName = eg.Name;
//                         existing.Age = eg.Age;
//                         existing.GuarantorNumber = eg.GuarantorNumber > 0 ? eg.GuarantorNumber : existingExtras.IndexOf(existing) + 3;
//                     }
//                     else
//                     {
//                         app.ExtraGuarantors.Add(new BusinessLoanExtraGuarantor
//                         {
//                             FrontendId = eg.FrontendId,
//                             GuarantorNumber = eg.GuarantorNumber > 0 ? eg.GuarantorNumber : dto.ExtraGuarantors.IndexOf(eg) + 3,
//                             FullName = eg.Name,
//                             Age = eg.Age
//                         });
//                     }
//                 }
//             }

//             await _db.SaveChangesAsync();
//             return Ok(new BlApplicationResponse { Id = app.Id, Status = app.Status, Message = "Step 1 updated." });
//         }

//         /// <summary>
//         /// STEP 2 — Borrower's detailed information.
//         /// </summary>
//         [HttpPut("step2/{id}")]
//         public async Task<IActionResult> SaveStep2(int id, [FromBody] BlStep2Dto dto)
//         {
//             var app = await _db.BusinessLoanApplications
//                 .Include(a => a.Borrower)
//                 .FirstOrDefaultAsync(a => a.Id == id);

//             if (app == null) return NotFound(new { Message = "Application not found." });
//             if (app.Status == "Submitted") return BadRequest(new { Message = "Cannot edit a submitted application." });

//             if (app.Borrower == null)
//             {
//                 app.Borrower = new BusinessLoanBorrower { ApplicationId = id };
//                 _db.BusinessLoanBorrowers.Add(app.Borrower);
//             }

//             MapPersonToBorrower(dto, app.Borrower);
//             app.UpdatedAt = DateTime.UtcNow;
//             await _db.SaveChangesAsync();

//             return Ok(new BlApplicationResponse { Id = id, Status = app.Status, Message = "Step 2 (Borrower) saved." });
//         }

//         /// <summary>
//         /// STEP 3 — Guarantor No. 1 detailed information.
//         /// </summary>
//         [HttpPut("step3/{id}")]
//         public async Task<IActionResult> SaveStep3(int id, [FromBody] BlStep3Dto dto)
//         {
//             var app = await _db.BusinessLoanApplications
//                 .Include(a => a.Guarantor1)
//                 .FirstOrDefaultAsync(a => a.Id == id);

//             if (app == null) return NotFound(new { Message = "Application not found." });
//             if (app.Status == "Submitted") return BadRequest(new { Message = "Cannot edit a submitted application." });

//             // var g1 = app.Guarantor1 ?? await _db.BusinessLoanGuarantors
//             //     .FirstOrDefaultAsync(g => g.ApplicationId == id && g.GuarantorNumber == 1);
// var g1 = application.Guarantors.FirstOrDefault(g => g.GuarantorNumber == 1);
//             if (g1 == null)
//             {
//                 g1 = new BusinessLoanGuarantor { ApplicationId = id, GuarantorNumber = 1 };
//                 _db.BusinessLoanGuarantors.Add(g1);
//             }

//             MapPersonToGuarantor(dto, g1);
//             app.UpdatedAt = DateTime.UtcNow;
//             await _db.SaveChangesAsync();

//             return Ok(new BlApplicationResponse { Id = id, Status = app.Status, Message = "Step 3 (Guarantor 1) saved." });
//         }

//         /// <summary>
//         /// STEP 4 — Guarantor No. 2 detailed information.
//         /// </summary>
//         [HttpPut("step4/{id}")]
//         public async Task<IActionResult> SaveStep4(int id, [FromBody] BlStep4Dto dto)
//         {
//             var app = await _db.BusinessLoanApplications
//                 .Include(a => a.Guarantor2)
//                 .FirstOrDefaultAsync(a => a.Id == id);

//             if (app == null) return NotFound(new { Message = "Application not found." });
//             if (app.Status == "Submitted") return BadRequest(new { Message = "Cannot edit a submitted application." });

//             // var g2 = app.Guarantor2 ?? await _db.BusinessLoanGuarantors
//             //     .FirstOrDefaultAsync(g => g.ApplicationId == id && g.GuarantorNumber == 2);
//             var g2 = application.Guarantors.FirstOrDefault(g => g.GuarantorNumber == 2);

//             if (g2 == null)
//             {
//                 g2 = new BusinessLoanGuarantor { ApplicationId = id, GuarantorNumber = 2 };
//                 _db.BusinessLoanGuarantors.Add(g2);
//             }

//             MapPersonToGuarantor(dto, g2);
//             app.UpdatedAt = DateTime.UtcNow;
//             await _db.SaveChangesAsync();

//             return Ok(new BlApplicationResponse { Id = id, Status = app.Status, Message = "Step 4 (Guarantor 2) saved." });
//         }

//         /// <summary>
//         /// STEP Extra — Save/update a single extra guarantor's full details.
//         /// Pass the frontendId (React timestamp string) to identify the guarantor.
//         /// </summary>
//         [HttpPut("step-extra-guarantor/{id}/{frontendId}")]
//         public async Task<IActionResult> SaveExtraGuarantor(int id, string frontendId, [FromBody] ExtraGuarantorDto dto)
//         {
//             var app = await _db.BusinessLoanApplications.FindAsync(id);
//             if (app == null) return NotFound(new { Message = "Application not found." });
//             if (app.Status == "Submitted") return BadRequest(new { Message = "Cannot edit a submitted application." });

//             var eg = await _db.BusinessLoanExtraGuarantors
//                 .FirstOrDefaultAsync(e => e.ApplicationId == id && e.FrontendId == frontendId);

//             if (eg == null)
//             {
//                 eg = new BusinessLoanExtraGuarantor { ApplicationId = id, FrontendId = frontendId };
//                 _db.BusinessLoanExtraGuarantors.Add(eg);
//             }

//             MapPersonToExtra(dto, eg);
//             app.UpdatedAt = DateTime.UtcNow;
//             await _db.SaveChangesAsync();

//             return Ok(new BlApplicationResponse { Id = id, Status = app.Status, Message = $"Extra guarantor {frontendId} saved." });
//         }

//         /// <summary>
//         /// STEP 5 — Business Information.
//         /// </summary>
//         [HttpPut("step5/{id}")]
//         public async Task<IActionResult> SaveStep5(int id, [FromBody] BlStep5Dto dto)
//         {
//             var app = await _db.BusinessLoanApplications
//                 .Include(a => a.BusinessInfo)
//                 .FirstOrDefaultAsync(a => a.Id == id);

//             if (app == null) return NotFound(new { Message = "Application not found." });
//             if (app.Status == "Submitted") return BadRequest(new { Message = "Cannot edit a submitted application." });

//             if (app.BusinessInfo == null)
//             {
//                 app.BusinessInfo = new BusinessLoanBusinessInfo { ApplicationId = id };
//                 _db.BusinessLoanBusinessInfos.Add(app.BusinessInfo);
//             }

//             var b = app.BusinessInfo;
//             b.BusinessNature = dto.BusinessNature;
//             b.BusinessType = dto.BusinessType;
//             b.BusinessPropertyType = dto.BusinessPropertyType;
//             b.FloorArea = dto.FloorArea;
//             b.FirmName = dto.FirmName;
//             b.Address = dto.Address;
//             b.Address2 = dto.Address2;
//             b.PinCode = dto.PinCode;
//             b.Phone = dto.Phone;
//             b.Email = dto.Email;
//             b.PanCardNo = dto.PanCardNo;
//             b.GumastaLicenseNo = dto.GumastaLicenseNo;
//             b.SalesTaxNo = dto.SalesTaxNo;
//             b.VatNo = dto.VatNo;
//             b.ServiceTaxNo = dto.ServiceTaxNo;
//             b.OtherLicense = dto.OtherLicense;
//             b.AllLicensesAvailable = dto.AllLicensesAvailable;
//             b.IsSmallIndustryResident = dto.IsSmallIndustryResident;
//             b.SinceWhen = dto.SinceWhen;
//             b.Experience = dto.Experience;
//             b.TotalAnnualIncome = dto.TotalAnnualIncome;
//             b.TotalAnnualExpenses = dto.TotalAnnualExpenses;
//             b.NetAnnualIncome = dto.NetAnnualIncome;
//             b.Customer1Name = dto.Customer1Name;
//             b.Customer1Address = dto.Customer1Address;
//             b.Customer2Name = dto.Customer2Name;
//             b.Customer2Address = dto.Customer2Address;
//             b.Supplier1Name = dto.Supplier1Name;
//             b.Supplier1Address = dto.Supplier1Address;
//             b.Supplier2Name = dto.Supplier2Name;
//             b.Supplier2Address = dto.Supplier2Address;
//             b.Extra1 = dto.Extra1;
//             b.Extra2 = dto.Extra2;
//             b.Extra3 = dto.Extra3;
//             b.Extra4 = dto.Extra4;

//             app.UpdatedAt = DateTime.UtcNow;
//             await _db.SaveChangesAsync();

//             return Ok(new BlApplicationResponse { Id = id, Status = app.Status, Message = "Step 5 (Business Info) saved." });
//         }

//         /// <summary>
//         /// STEP 6 — Insurance & Tax Information.
//         /// </summary>
//         [HttpPut("step6/{id}")]
//         public async Task<IActionResult> SaveStep6(int id, [FromBody] BlStep6Dto dto)
//         {
//             var app = await _db.BusinessLoanApplications
//                 .Include(a => a.InsuranceTaxInfo)
//                 .FirstOrDefaultAsync(a => a.Id == id);

//             if (app == null) return NotFound(new { Message = "Application not found." });
//             if (app.Status == "Submitted") return BadRequest(new { Message = "Cannot edit a submitted application." });

//             if (app.InsuranceTaxInfo == null)
//             {
//                 app.InsuranceTaxInfo = new BusinessLoanInsuranceTaxInfo { ApplicationId = id };
//                 _db.BusinessLoanInsuranceTaxInfos.Add(app.InsuranceTaxInfo);
//             }

//             var t = app.InsuranceTaxInfo;
//             t.InsuranceCompanyName = dto.InsuranceCompanyName;
//             t.InsuranceAddress = dto.InsuranceAddress;
//             t.InsurancePolicyNo = dto.InsurancePolicyNo;
//             t.InsuranceFrom = ParseDate(dto.InsuranceFrom);
//             t.InsuranceTo = ParseDate(dto.InsuranceTo);
//             t.InsuranceAmount = dto.InsuranceAmount;
//             t.InsurancePremium = dto.InsurancePremium;
//             t.InsurancePremiumFrequency = dto.InsurancePremiumFrequency;
//             t.HasPolicyLoan = dto.HasPolicyLoan;
//             t.PolicyLoanBankName = dto.PolicyLoanBankName;
//             t.PolicyLoanBankAddress = dto.PolicyLoanBankAddress;
//             t.PolicyLoanAmount = dto.PolicyLoanAmount;
//             t.PolicyLoanDate = ParseDate(dto.PolicyLoanDate);
//             t.PolicyLoanBalance = dto.PolicyLoanBalance;
//             t.PanCardNo = dto.PanCardNo;
//             t.IncomeTaxSince = dto.IncomeTaxSince;
//             t.ItYear1From = dto.ItYear1From; t.ItYear1To = dto.ItYear1To;
//             t.ItAmount1 = dto.ItAmount1; t.ItDate1 = ParseDate(dto.ItDate1);
//             t.ItYear2From = dto.ItYear2From; t.ItYear2To = dto.ItYear2To;
//             t.ItAmount2 = dto.ItAmount2; t.ItDate2 = ParseDate(dto.ItDate2);
//             t.ItYear3From = dto.ItYear3From; t.ItYear3To = dto.ItYear3To;
//             t.ItAmount3 = dto.ItAmount3; t.ItDate3 = ParseDate(dto.ItDate3);
//             t.ProTaxNo = dto.ProTaxNo;
//             t.ProTaxSince = dto.ProTaxSince;
//             t.PtYear1From = dto.PtYear1From; t.PtYear1To = dto.PtYear1To;
//             t.PtAmount1 = dto.PtAmount1; t.PtDate1 = ParseDate(dto.PtDate1);
//             t.PtYear2From = dto.PtYear2From; t.PtYear2To = dto.PtYear2To;
//             t.PtAmount2 = dto.PtAmount2; t.PtDate2 = ParseDate(dto.PtDate2);
//             t.PtYear3From = dto.PtYear3From; t.PtYear3To = dto.PtYear3To;
//             t.PtAmount3 = dto.PtAmount3; t.PtDate3 = ParseDate(dto.PtDate3);

//             app.UpdatedAt = DateTime.UtcNow;
//             await _db.SaveChangesAsync();

//             return Ok(new BlApplicationResponse { Id = id, Status = app.Status, Message = "Step 6 (Insurance & Tax) saved." });
//         }

//         /// <summary>
//         /// STEP 7 — Collateral Property Information.
//         /// </summary>
//         [HttpPut("step7/{id}")]
//         public async Task<IActionResult> SaveStep7(int id, [FromBody] BlStep7Dto dto)
//         {
//             var app = await _db.BusinessLoanApplications
//                 .Include(a => a.Collateral)
//                 .FirstOrDefaultAsync(a => a.Id == id);

//             if (app == null) return NotFound(new { Message = "Application not found." });
//             if (app.Status == "Submitted") return BadRequest(new { Message = "Cannot edit a submitted application." });

//             if (app.Collateral == null)
//             {
//                 app.Collateral = new BusinessLoanCollateral { ApplicationId = id };
//                 _db.BusinessLoanCollaterals.Add(app.Collateral);
//             }

//             var c = app.Collateral;
//             c.PropertyType = dto.PropertyType;
//             c.PropertyTypeOther = dto.PropertyTypeOther;
//             c.PropertyAddress = dto.PropertyAddress;
//             c.PropertyAddress2 = dto.PropertyAddress2;
//             c.PropertyPinCode = dto.PropertyPinCode;
//             c.PropertyTelephone = dto.PropertyTelephone;
//             c.PropertyMobile = dto.PropertyMobile;
//             c.GalaArea = dto.GalaArea;
//             c.BuildingConstructionYear = dto.BuildingConstructionYear;
//             c.CitySurveyNo = dto.CitySurveyNo;
//             c.PlotNo = dto.PlotNo;
//             c.WardNo = dto.WardNo;
//             c.CompletionCertDate = ParseDate(dto.CompletionCertDate);
//             c.OcDate = ParseDate(dto.OcDate);
//             c.ConveyanceDeedDate = ParseDate(dto.ConveyanceDeedDate);
//             c.HousingSocietyRegNo = dto.HousingSocietyRegNo;
//             c.MemberNo = dto.MemberNo;
//             c.LandArea = dto.LandArea;
//             c.NaOrderDate = ParseDate(dto.NaOrderDate);
//             c.LandCitySurveyNo = dto.LandCitySurveyNo;
//             c.LandPlotNo = dto.LandPlotNo;
//             c.LandWardNo = dto.LandWardNo;
//             c.GutNo = dto.GutNo;
//             c.HissaNo = dto.HissaNo;
//             c.EastBoundary = dto.EastBoundary;
//             c.WestBoundary = dto.WestBoundary;
//             c.SouthBoundary = dto.SouthBoundary;
//             c.NorthBoundary = dto.NorthBoundary;
//             c.GovtValuation = dto.GovtValuation;
//             c.MarketValue = dto.MarketValue;
//             c.InsuranceCompanyName = dto.InsuranceCompanyName;
//             c.InsuranceAddress = dto.InsuranceAddress;
//             c.InsuranceAddress2 = dto.InsuranceAddress2;
//             c.InsurancePolicyNo = dto.InsurancePolicyNo;
//             c.InsuranceFrom = ParseDate(dto.InsuranceFrom);
//             c.InsuranceTo = ParseDate(dto.InsuranceTo);
//             c.InsuranceAmount = dto.InsuranceAmount;
//             c.InsurancePremium = dto.InsurancePremium;

//             app.UpdatedAt = DateTime.UtcNow;
//             await _db.SaveChangesAsync();

//             return Ok(new BlApplicationResponse { Id = id, Status = app.Status, Message = "Step 7 (Collateral) saved." });
//         }

//         // ════════════════════════════════════════════════════════════════════
//         //  SUBMIT — Final submit (marks as Submitted)
//         // ════════════════════════════════════════════════════════════════════

//         /// <summary>
//         /// Final Submit — marks the application as Submitted.
//         /// Call this when user clicks Submit on the Review page.
//         /// </summary>
//         [HttpPost("submit/{id}")]
//         public async Task<IActionResult> Submit(int id)
//         {
//             var app = await _db.BusinessLoanApplications.FindAsync(id);
//             if (app == null) return NotFound(new { Message = "Application not found." });
//             if (app.Status == "Submitted") return BadRequest(new { Message = "Already submitted." });

//             app.Status = "Submitted";
//             app.UpdatedAt = DateTime.UtcNow;
//             await _db.SaveChangesAsync();

//             return Ok(new BlApplicationResponse { Id = id, Status = "Submitted", Message = "Application submitted successfully." });
//         }

//         /// <summary>
//         /// Full Submit — saves all steps at once and marks as Submitted.
//         /// Use this if you want to save everything in one call (alternative to step-by-step).
//         /// </summary>
//         [HttpPost("submit-full")]
//         public async Task<IActionResult> SubmitFull([FromBody] BlFullSubmitDto dto)
//         {
//             if (!ModelState.IsValid) return BadRequest(ModelState);

//             var clientCode = HttpContext.Items["ClientCode"] as string;

//             // 1. Create main application
//             var app = new BusinessLoanApplication
//             {
//                 ClientCode = clientCode,
//                 ApplicationDate = ParseDate(dto.Step1.ApplicationDate) ?? DateTime.UtcNow,
//                 MemberNo = dto.Step1.MemberNo,
//                 LoanAccountNo = dto.Step1.LoanAccountNo,
//                 Branch = dto.Step1.Branch,
//                 ApplicantName = dto.Step1.ApplicantName,
//                 ApplicantAge = dto.Step1.ApplicantAge,
//                 LoanAmount = dto.Step1.LoanAmount,
//                 LoanAmountInWords = dto.Step1.LoanAmountInWords,
//                 RepaymentMonths = dto.Step1.RepaymentMonths,
//                 FirstInstallmentAfterMonths = dto.Step1.FirstInstallmentAfterMonths,
//                 InstallmentDate = dto.Step1.InstallmentDate,
//                 Purpose = dto.Step1.Purpose,
//                 MaritalStatus = dto.Step1.MaritalStatus,
//                 Dependents = dto.Step1.Dependents,
//                 Guarantor1Name = dto.Step1.Guarantor1Name,
//                 Guarantor1Age = dto.Step1.Guarantor1Age,
//                 Guarantor2Name = dto.Step1.Guarantor2Name,
//                 Guarantor2Age = dto.Step1.Guarantor2Age,
//                 Guarantor3Name = dto.Step1.Guarantor3Name,
//                 Guarantor3Age = dto.Step1.Guarantor3Age,
//                 Status = "Submitted",
//                 CreatedAt = DateTime.UtcNow,
//                 UpdatedAt = DateTime.UtcNow
//             };

//             _db.BusinessLoanApplications.Add(app);
//             await _db.SaveChangesAsync();

//             // 2. Borrower
//             var borrower = new BusinessLoanBorrower { ApplicationId = app.Id };
//             MapPersonToBorrower(dto.Step2, borrower);
//             _db.BusinessLoanBorrowers.Add(borrower);

//             // 3. Guarantor 1
//             var g1 = new BusinessLoanGuarantor { ApplicationId = app.Id, GuarantorNumber = 1 };
//             MapPersonToGuarantor(dto.Step3, g1);
//             _db.BusinessLoanGuarantors.Add(g1);

//             // 4. Guarantor 2
//             var g2 = new BusinessLoanGuarantor { ApplicationId = app.Id, GuarantorNumber = 2 };
//             MapPersonToGuarantor(dto.Step4, g2);
//             _db.BusinessLoanGuarantors.Add(g2);

//             // 5. Extra Guarantors
//             foreach (var egDto in dto.ExtraGuarantors)
//             {
//                 var eg = new BusinessLoanExtraGuarantor { ApplicationId = app.Id };
//                 MapPersonToExtra(egDto, eg);
//                 _db.BusinessLoanExtraGuarantors.Add(eg);
//             }

//             // 6. Business Info
//             var biz = new BusinessLoanBusinessInfo { ApplicationId = app.Id };
//             var s5 = dto.Step5;
//             biz.BusinessNature = s5.BusinessNature; biz.BusinessType = s5.BusinessType;
//             biz.BusinessPropertyType = s5.BusinessPropertyType; biz.FloorArea = s5.FloorArea;
//             biz.FirmName = s5.FirmName; biz.Address = s5.Address; biz.Address2 = s5.Address2;
//             biz.PinCode = s5.PinCode; biz.Phone = s5.Phone; biz.Email = s5.Email;
//             biz.PanCardNo = s5.PanCardNo; biz.GumastaLicenseNo = s5.GumastaLicenseNo;
//             biz.SalesTaxNo = s5.SalesTaxNo; biz.VatNo = s5.VatNo; biz.ServiceTaxNo = s5.ServiceTaxNo;
//             biz.OtherLicense = s5.OtherLicense; biz.AllLicensesAvailable = s5.AllLicensesAvailable;
//             biz.IsSmallIndustryResident = s5.IsSmallIndustryResident;
//             biz.SinceWhen = s5.SinceWhen; biz.Experience = s5.Experience;
//             biz.TotalAnnualIncome = s5.TotalAnnualIncome; biz.TotalAnnualExpenses = s5.TotalAnnualExpenses;
//             biz.NetAnnualIncome = s5.NetAnnualIncome;
//             biz.Customer1Name = s5.Customer1Name; biz.Customer1Address = s5.Customer1Address;
//             biz.Customer2Name = s5.Customer2Name; biz.Customer2Address = s5.Customer2Address;
//             biz.Supplier1Name = s5.Supplier1Name; biz.Supplier1Address = s5.Supplier1Address;
//             biz.Supplier2Name = s5.Supplier2Name; biz.Supplier2Address = s5.Supplier2Address;
//             biz.Extra1 = s5.Extra1; biz.Extra2 = s5.Extra2; biz.Extra3 = s5.Extra3; biz.Extra4 = s5.Extra4;
//             _db.BusinessLoanBusinessInfos.Add(biz);

//             // 7. Insurance & Tax
//             var ins = new BusinessLoanInsuranceTaxInfo { ApplicationId = app.Id };
//             var s6 = dto.Step6;
//             ins.InsuranceCompanyName = s6.InsuranceCompanyName; ins.InsuranceAddress = s6.InsuranceAddress;
//             ins.InsurancePolicyNo = s6.InsurancePolicyNo;
//             ins.InsuranceFrom = ParseDate(s6.InsuranceFrom); ins.InsuranceTo = ParseDate(s6.InsuranceTo);
//             ins.InsuranceAmount = s6.InsuranceAmount; ins.InsurancePremium = s6.InsurancePremium;
//             ins.InsurancePremiumFrequency = s6.InsurancePremiumFrequency;
//             ins.HasPolicyLoan = s6.HasPolicyLoan; ins.PolicyLoanBankName = s6.PolicyLoanBankName;
//             ins.PolicyLoanBankAddress = s6.PolicyLoanBankAddress; ins.PolicyLoanAmount = s6.PolicyLoanAmount;
//             ins.PolicyLoanDate = ParseDate(s6.PolicyLoanDate); ins.PolicyLoanBalance = s6.PolicyLoanBalance;
//             ins.PanCardNo = s6.PanCardNo; ins.IncomeTaxSince = s6.IncomeTaxSince;
//             ins.ItYear1From = s6.ItYear1From; ins.ItYear1To = s6.ItYear1To;
//             ins.ItAmount1 = s6.ItAmount1; ins.ItDate1 = ParseDate(s6.ItDate1);
//             ins.ItYear2From = s6.ItYear2From; ins.ItYear2To = s6.ItYear2To;
//             ins.ItAmount2 = s6.ItAmount2; ins.ItDate2 = ParseDate(s6.ItDate2);
//             ins.ItYear3From = s6.ItYear3From; ins.ItYear3To = s6.ItYear3To;
//             ins.ItAmount3 = s6.ItAmount3; ins.ItDate3 = ParseDate(s6.ItDate3);
//             ins.ProTaxNo = s6.ProTaxNo; ins.ProTaxSince = s6.ProTaxSince;
//             ins.PtYear1From = s6.PtYear1From; ins.PtYear1To = s6.PtYear1To;
//             ins.PtAmount1 = s6.PtAmount1; ins.PtDate1 = ParseDate(s6.PtDate1);
//             ins.PtYear2From = s6.PtYear2From; ins.PtYear2To = s6.PtYear2To;
//             ins.PtAmount2 = s6.PtAmount2; ins.PtDate2 = ParseDate(s6.PtDate2);
//             ins.PtYear3From = s6.PtYear3From; ins.PtYear3To = s6.PtYear3To;
//             ins.PtAmount3 = s6.PtAmount3; ins.PtDate3 = ParseDate(s6.PtDate3);
//             _db.BusinessLoanInsuranceTaxInfos.Add(ins);

//             // 8. Collateral
//             var col = new BusinessLoanCollateral { ApplicationId = app.Id };
//             var s7 = dto.Step7;
//             col.PropertyType = s7.PropertyType; col.PropertyTypeOther = s7.PropertyTypeOther;
//             col.PropertyAddress = s7.PropertyAddress; col.PropertyAddress2 = s7.PropertyAddress2;
//             col.PropertyPinCode = s7.PropertyPinCode; col.PropertyTelephone = s7.PropertyTelephone;
//             col.PropertyMobile = s7.PropertyMobile; col.GalaArea = s7.GalaArea;
//             col.BuildingConstructionYear = s7.BuildingConstructionYear;
//             col.CitySurveyNo = s7.CitySurveyNo; col.PlotNo = s7.PlotNo; col.WardNo = s7.WardNo;
//             col.CompletionCertDate = ParseDate(s7.CompletionCertDate); col.OcDate = ParseDate(s7.OcDate);
//             col.ConveyanceDeedDate = ParseDate(s7.ConveyanceDeedDate);
//             col.HousingSocietyRegNo = s7.HousingSocietyRegNo; col.MemberNo = s7.MemberNo;
//             col.LandArea = s7.LandArea; col.NaOrderDate = ParseDate(s7.NaOrderDate);
//             col.LandCitySurveyNo = s7.LandCitySurveyNo; col.LandPlotNo = s7.LandPlotNo; col.LandWardNo = s7.LandWardNo;
//             col.GutNo = s7.GutNo; col.HissaNo = s7.HissaNo;
//             col.EastBoundary = s7.EastBoundary; col.WestBoundary = s7.WestBoundary;
//             col.SouthBoundary = s7.SouthBoundary; col.NorthBoundary = s7.NorthBoundary;
//             col.GovtValuation = s7.GovtValuation; col.MarketValue = s7.MarketValue;
//             col.InsuranceCompanyName = s7.InsuranceCompanyName; col.InsuranceAddress = s7.InsuranceAddress;
//             col.InsuranceAddress2 = s7.InsuranceAddress2; col.InsurancePolicyNo = s7.InsurancePolicyNo;
//             col.InsuranceFrom = ParseDate(s7.InsuranceFrom); col.InsuranceTo = ParseDate(s7.InsuranceTo);
//             col.InsuranceAmount = s7.InsuranceAmount; col.InsurancePremium = s7.InsurancePremium;
//             _db.BusinessLoanCollaterals.Add(col);

//             await _db.SaveChangesAsync();

//             return Ok(new BlApplicationResponse { Id = app.Id, Status = "Submitted", Message = "Application submitted successfully." });
//         }

//         // ════════════════════════════════════════════════════════════════════
//         //  READ APIs
//         // ════════════════════════════════════════════════════════════════════

//         /// <summary>
//         /// Get all business loan applications (list view).
//         /// </summary>
//         [HttpGet]
//         public async Task<IActionResult> GetAll(
//             [FromQuery] string? status = null,
//             [FromQuery] int page = 1,
//             [FromQuery] int pageSize = 20)
//         {
//             var clientCode = HttpContext.Items["ClientCode"] as string;

//             var query = _db.BusinessLoanApplications.AsQueryable();

//             if (!string.IsNullOrEmpty(clientCode))
//                 query = query.Where(a => a.ClientCode == clientCode);

//             if (!string.IsNullOrEmpty(status))
//                 query = query.Where(a => a.Status == status);

//             var total = await query.CountAsync();
//             var items = await query
//                 .OrderByDescending(a => a.CreatedAt)
//                 .Skip((page - 1) * pageSize)
//                 .Take(pageSize)
//                 .Select(a => new BlListItemDto
//                 {
//                     Id = a.Id,
//                     ApplicantName = a.ApplicantName,
//                     LoanAmount = a.LoanAmount,
//                     Branch = a.Branch,
//                     Status = a.Status,
//                     CreatedAt = a.CreatedAt,
//                     MemberNo = a.MemberNo,
//                     LoanAccountNo = a.LoanAccountNo
//                 })
//                 .ToListAsync();

//             return Ok(new { Total = total, Page = page, PageSize = pageSize, Items = items });
//         }

//         /// <summary>
//         /// Get full details of one application (all sub-tables joined).
//         /// </summary>
//         [HttpGet("{id}")]
//         public async Task<IActionResult> GetById(int id)
//         {
//             var app = await _db.BusinessLoanApplications
//                 .Include(a => a.Borrower)
//                 .Include(a => a.Guarantor1)
//                 .Include(a => a.Guarantor2)
//                 .Include(a => a.ExtraGuarantors)
//                 .Include(a => a.BusinessInfo)
//                 .Include(a => a.InsuranceTaxInfo)
//                 .Include(a => a.Collateral)
//                 .FirstOrDefaultAsync(a => a.Id == id);

//             if (app == null) return NotFound(new { Message = "Application not found." });
//             return Ok(app);
//         }

//         /// <summary>
//         /// Get just the basic info (Step 1) of an application.
//         /// </summary>
//         [HttpGet("{id}/step1")]
//         public async Task<IActionResult> GetStep1(int id)
//         {
//             var app = await _db.BusinessLoanApplications
//                 .Include(a => a.ExtraGuarantors)
//                 .FirstOrDefaultAsync(a => a.Id == id);
//             if (app == null) return NotFound();
//             return Ok(app);
//         }

//         /// <summary>
//         /// Get borrower info (Step 2).
//         /// </summary>
//         [HttpGet("{id}/step2")]
//         public async Task<IActionResult> GetStep2(int id)
//         {
//             var borrower = await _db.BusinessLoanBorrowers.FirstOrDefaultAsync(b => b.ApplicationId == id);
//             if (borrower == null) return NotFound();
//             return Ok(borrower);
//         }

//         /// <summary>
//         /// Get Guarantor 1 info (Step 3).
//         /// </summary>
//         [HttpGet("{id}/step3")]
//         public async Task<IActionResult> GetStep3(int id)
//         {
//             var g = await _db.BusinessLoanGuarantors
//                 .FirstOrDefaultAsync(g => g.ApplicationId == id && g.GuarantorNumber == 1);
//             if (g == null) return NotFound();
//             return Ok(g);
//         }

//         /// <summary>
//         /// Get Guarantor 2 info (Step 4).
//         /// </summary>
//         [HttpGet("{id}/step4")]
//         public async Task<IActionResult> GetStep4(int id)
//         {
//             var g = await _db.BusinessLoanGuarantors
//                 .FirstOrDefaultAsync(g => g.ApplicationId == id && g.GuarantorNumber == 2);
//             if (g == null) return NotFound();
//             return Ok(g);
//         }

//         /// <summary>
//         /// Get all extra guarantors for an application.
//         /// </summary>
//         [HttpGet("{id}/extra-guarantors")]
//         public async Task<IActionResult> GetExtraGuarantors(int id)
//         {
//             var list = await _db.BusinessLoanExtraGuarantors
//                 .Where(e => e.ApplicationId == id)
//                 .OrderBy(e => e.GuarantorNumber)
//                 .ToListAsync();
//             return Ok(list);
//         }

//         /// <summary>
//         /// Get a specific extra guarantor by frontendId.
//         /// </summary>
//         [HttpGet("{id}/extra-guarantors/{frontendId}")]
//         public async Task<IActionResult> GetExtraGuarantor(int id, string frontendId)
//         {
//             var eg = await _db.BusinessLoanExtraGuarantors
//                 .FirstOrDefaultAsync(e => e.ApplicationId == id && e.FrontendId == frontendId);
//             if (eg == null) return NotFound();
//             return Ok(eg);
//         }

//         /// <summary>
//         /// Get business info (Step 5).
//         /// </summary>
//         [HttpGet("{id}/step5")]
//         public async Task<IActionResult> GetStep5(int id)
//         {
//             var biz = await _db.BusinessLoanBusinessInfos.FirstOrDefaultAsync(b => b.ApplicationId == id);
//             if (biz == null) return NotFound();
//             return Ok(biz);
//         }

//         /// <summary>
//         /// Get insurance & tax info (Step 6).
//         /// </summary>
//         [HttpGet("{id}/step6")]
//         public async Task<IActionResult> GetStep6(int id)
//         {
//             var ins = await _db.BusinessLoanInsuranceTaxInfos.FirstOrDefaultAsync(i => i.ApplicationId == id);
//             if (ins == null) return NotFound();
//             return Ok(ins);
//         }

//         /// <summary>
//         /// Get collateral info (Step 7).
//         /// </summary>
//         [HttpGet("{id}/step7")]
//         public async Task<IActionResult> GetStep7(int id)
//         {
//             var col = await _db.BusinessLoanCollaterals.FirstOrDefaultAsync(c => c.ApplicationId == id);
//             if (col == null) return NotFound();
//             return Ok(col);
//         }

//         // ════════════════════════════════════════════════════════════════════
//         //  DELETE / STATUS APIs
//         // ════════════════════════════════════════════════════════════════════

//         /// <summary>
//         /// Delete a draft application.
//         /// </summary>
//         [HttpDelete("{id}")]
//         public async Task<IActionResult> Delete(int id)
//         {
//             var app = await _db.BusinessLoanApplications.FindAsync(id);
//             if (app == null) return NotFound();
//             if (app.Status == "Submitted") return BadRequest(new { Message = "Cannot delete a submitted application." });

//             _db.BusinessLoanApplications.Remove(app);
//             await _db.SaveChangesAsync();
//             return Ok(new { Message = "Application deleted." });
//         }

//         /// <summary>
//         /// Update application status (e.g., Approved, Rejected).
//         /// </summary>
//         [HttpPatch("{id}/status")]
//         public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
//         {
//             var validStatuses = new[] { "Draft", "Submitted", "UnderReview", "Approved", "Rejected" };
//             if (!validStatuses.Contains(status))
//                 return BadRequest(new { Message = $"Invalid status. Valid: {string.Join(", ", validStatuses)}" });

//             var app = await _db.BusinessLoanApplications.FindAsync(id);
//             if (app == null) return NotFound();

//             app.Status = status;
//             app.UpdatedAt = DateTime.UtcNow;
//             await _db.SaveChangesAsync();

//             return Ok(new BlApplicationResponse { Id = id, Status = status, Message = "Status updated." });
//         }

//         /// <summary>
//         /// Delete a specific extra guarantor.
//         /// </summary>
//         [HttpDelete("{id}/extra-guarantors/{frontendId}")]
//         public async Task<IActionResult> DeleteExtraGuarantor(int id, string frontendId)
//         {
//             var eg = await _db.BusinessLoanExtraGuarantors
//                 .FirstOrDefaultAsync(e => e.ApplicationId == id && e.FrontendId == frontendId);
//             if (eg == null) return NotFound();

//             _db.BusinessLoanExtraGuarantors.Remove(eg);
//             await _db.SaveChangesAsync();
//             return Ok(new { Message = "Extra guarantor removed." });
//         }
//     }
// }
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TushGptBackend.Data;
using TushGptBackend.Dtos;
using TushGptBackend.Models;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TushGptBackend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/business-loan")]
    public class BusinessLoanController : ControllerBase
    {
        private readonly AppDbContext _db;

        public BusinessLoanController(AppDbContext db)
        {
            _db = db;
        }

        // ── Helper: safe date parse ───────────────────────────────────────────
        private static DateTime? ParseDate(string? s)
        {
            if (string.IsNullOrWhiteSpace(s)) return null;
            return DateTime.TryParse(s, out var d) ? DateTime.SpecifyKind(d, DateTimeKind.Utc) : null;
        }

        // ── Helper: map PersonInfoDto → BusinessLoanBorrower ─────────────────
        private static void MapPersonToBorrower(PersonInfoDto dto, BusinessLoanBorrower b)
        {
            b.PhotoBase64 = dto.PhotoBase64;
            b.FullName = dto.FullName;
            b.Age = dto.Age;
            b.MemberNo = dto.MemberNo;
            b.SharesCount = dto.SharesCount;
            b.SharesAmount = dto.SharesAmount;
            b.FatherHusbandName = dto.FatherHusbandName;
            b.FatherHusbandAge = dto.FatherHusbandAge;
            b.MotherName = dto.MotherName;
            b.MotherAge = dto.MotherAge;
            b.ResidentialAddress = dto.ResidentialAddress;
            b.PinCode = dto.PinCode;
            b.Telephone = dto.Telephone;
            b.Mobile = dto.Mobile;
            b.Email = dto.Email;
            b.PropertyTypes = dto.PropertyTypes != null ? string.Join(",", dto.PropertyTypes) : null;
            b.ResidenceMonths = dto.ResidenceMonths;
            b.ResidenceYears = dto.ResidenceYears;
            b.MaritalStatus = dto.MaritalStatus;
            b.Dependents = dto.Dependents;
            b.OfficeAddress = dto.OfficeAddress;
            b.GavchaAddress = dto.GavchaAddress;
            b.CompanyName = dto.CompanyName;
            b.CompanyAddress = dto.CompanyAddress;
            b.CompanyPinCode = dto.CompanyPinCode;
            b.CompanyTelephone = dto.CompanyTelephone;
            b.CompanyMobile = dto.CompanyMobile;
            b.CompanyEmail = dto.CompanyEmail;
            b.Department = dto.Department;
            b.Designation = dto.Designation;
            b.EmployeeCode = dto.EmployeeCode;
            b.EmploymentMonths = dto.EmploymentMonths;
            b.EmploymentYears = dto.EmploymentYears;
            b.RetirementDate = ParseDate(dto.RetirementDate);
            b.MonthlySalary = dto.MonthlySalary;
            b.Deductions = dto.Deductions;
            b.NetSalary = dto.NetSalary;
            b.AnnualBusinessIncome = dto.AnnualBusinessIncome;
            b.TotalExpenses = dto.TotalExpenses;
            b.NetAnnualIncome = dto.NetAnnualIncome;
            b.FamilyIncome = dto.FamilyIncome;
            b.FamilyIncomeType = dto.FamilyIncomeType;
            b.PropertyOwnerName = dto.PropertyOwnerName;
            b.PropertyOwnerRelation = dto.PropertyOwnerRelation;
            b.VillageMukkam = dto.VillageMukkam;
            b.VillagePost = dto.VillagePost;
            b.VillageTaluka = dto.VillageTaluka;
            b.VillageDistrict = dto.VillageDistrict;
            b.VillageState = dto.VillageState;
            b.VillagePinCode = dto.VillagePinCode;
            b.VillageTelephone = dto.VillageTelephone;
            b.VillageMobile = dto.VillageMobile;
            b.PrevLoanType = dto.PrevLoanType;
            b.PrevLoanAccountNo = dto.PrevLoanAccountNo;
            b.PrevLoanAmount = dto.PrevLoanAmount;
            b.PrevLoanTakenDate = ParseDate(dto.PrevLoanTakenDate);
            b.PrevLoanRepaidDate = ParseDate(dto.PrevLoanRepaidDate);
            b.Guar94aBorrowerName = dto.Guar94aBorrowerName;
            b.Guar94aLoanType = dto.Guar94aLoanType;
            b.Guar94aAccountNo = dto.Guar94aAccountNo;
            b.Guar94aAmount = dto.Guar94aAmount;
            b.Guar94aTakenDate = ParseDate(dto.Guar94aTakenDate);
            b.Guar94aRepaidDate = ParseDate(dto.Guar94aRepaidDate);
            b.Guar94bBorrowerName = dto.Guar94bBorrowerName;
            b.Guar94bLoanType = dto.Guar94bLoanType;
            b.Guar94bAccountNo = dto.Guar94bAccountNo;
            b.Guar94bAmount = dto.Guar94bAmount;
            b.Guar94bTakenDate = ParseDate(dto.Guar94bTakenDate);
            b.Guar94bRepaidDate = ParseDate(dto.Guar94bRepaidDate);
            b.FamilyLoanMemberName = dto.FamilyLoanMemberName;
            b.FamilyLoanType = dto.FamilyLoanType;
            b.FamilyLoanAccountNo = dto.FamilyLoanAccountNo;
            b.FamilyLoanAmount = dto.FamilyLoanAmount;
            b.FamilyLoanTakenDate = ParseDate(dto.FamilyLoanTakenDate);
            b.FamilyLoanRepaidDate = ParseDate(dto.FamilyLoanRepaidDate);
            b.OtherBankName = dto.OtherBankName;
            b.OtherBankBranch = dto.OtherBankBranch;
            b.OtherBankLoanType = dto.OtherBankLoanType;
            b.OtherBankAccountNo = dto.OtherBankAccountNo;
            b.OtherBankLoanAmount = dto.OtherBankLoanAmount;
            b.OtherBankLoanTakenDate = ParseDate(dto.OtherBankLoanTakenDate);
            b.OtherBankLoanRepaidDate = ParseDate(dto.OtherBankLoanRepaidDate);
            b.PlaceOfSign = dto.PlaceOfSign;
            b.DateOfSign = ParseDate(dto.DateOfSign);
        }

        // ── Helper: map PersonInfoDto → BusinessLoanGuarantor ────────────────
        private static void MapPersonToGuarantor(PersonInfoDto dto, BusinessLoanGuarantor g)
        {
            g.PhotoBase64 = dto.PhotoBase64;
            g.FullName = dto.FullName;
            g.Age = dto.Age;
            g.MemberNo = dto.MemberNo;
            g.SharesCount = dto.SharesCount;
            g.SharesAmount = dto.SharesAmount;
            g.FatherHusbandName = dto.FatherHusbandName;
            g.FatherHusbandAge = dto.FatherHusbandAge;
            g.MotherName = dto.MotherName;
            g.MotherAge = dto.MotherAge;
            g.ResidentialAddress = dto.ResidentialAddress;
            g.PinCode = dto.PinCode;
            g.Telephone = dto.Telephone;
            g.Mobile = dto.Mobile;
            g.Email = dto.Email;
            g.PropertyTypes = dto.PropertyTypes != null ? string.Join(",", dto.PropertyTypes) : null;
            g.ResidenceMonths = dto.ResidenceMonths;
            g.ResidenceYears = dto.ResidenceYears;
            g.MaritalStatus = dto.MaritalStatus;
            g.Dependents = dto.Dependents;
            g.OfficeAddress = dto.OfficeAddress;
            g.GavchaAddress = dto.GavchaAddress;
            g.CompanyName = dto.CompanyName;
            g.CompanyAddress = dto.CompanyAddress;
            g.CompanyPinCode = dto.CompanyPinCode;
            g.CompanyTelephone = dto.CompanyTelephone;
            g.CompanyMobile = dto.CompanyMobile;
            g.CompanyEmail = dto.CompanyEmail;
            g.Department = dto.Department;
            g.Designation = dto.Designation;
            g.EmployeeCode = dto.EmployeeCode;
            g.EmploymentMonths = dto.EmploymentMonths;
            g.EmploymentYears = dto.EmploymentYears;
            g.RetirementDate = ParseDate(dto.RetirementDate);
            g.MonthlySalary = dto.MonthlySalary;
            g.Deductions = dto.Deductions;
            g.NetSalary = dto.NetSalary;
            g.AnnualBusinessIncome = dto.AnnualBusinessIncome;
            g.TotalExpenses = dto.TotalExpenses;
            g.NetAnnualIncome = dto.NetAnnualIncome;
            g.FamilyIncome = dto.FamilyIncome;
            g.FamilyIncomeType = dto.FamilyIncomeType;
            g.PropertyOwnerName = dto.PropertyOwnerName;
            g.PropertyOwnerRelation = dto.PropertyOwnerRelation;
            g.VillageMukkam = dto.VillageMukkam;
            g.VillagePost = dto.VillagePost;
            g.VillageTaluka = dto.VillageTaluka;
            g.VillageDistrict = dto.VillageDistrict;
            g.VillageState = dto.VillageState;
            g.VillagePinCode = dto.VillagePinCode;
            g.VillageTelephone = dto.VillageTelephone;
            g.VillageMobile = dto.VillageMobile;
            g.PrevLoanType = dto.PrevLoanType;
            g.PrevLoanAccountNo = dto.PrevLoanAccountNo;
            g.PrevLoanAmount = dto.PrevLoanAmount;
            g.PrevLoanTakenDate = ParseDate(dto.PrevLoanTakenDate);
            g.PrevLoanRepaidDate = ParseDate(dto.PrevLoanRepaidDate);
            g.Guar94aBorrowerName = dto.Guar94aBorrowerName;
            g.Guar94aLoanType = dto.Guar94aLoanType;
            g.Guar94aAccountNo = dto.Guar94aAccountNo;
            g.Guar94aAmount = dto.Guar94aAmount;
            g.Guar94aTakenDate = ParseDate(dto.Guar94aTakenDate);
            g.Guar94aRepaidDate = ParseDate(dto.Guar94aRepaidDate);
            g.Guar94bBorrowerName = dto.Guar94bBorrowerName;
            g.Guar94bLoanType = dto.Guar94bLoanType;
            g.Guar94bAccountNo = dto.Guar94bAccountNo;
            g.Guar94bAmount = dto.Guar94bAmount;
            g.Guar94bTakenDate = ParseDate(dto.Guar94bTakenDate);
            g.Guar94bRepaidDate = ParseDate(dto.Guar94bRepaidDate);
            g.FamilyLoanMemberName = dto.FamilyLoanMemberName;
            g.FamilyLoanType = dto.FamilyLoanType;
            g.FamilyLoanAccountNo = dto.FamilyLoanAccountNo;
            g.FamilyLoanAmount = dto.FamilyLoanAmount;
            g.FamilyLoanTakenDate = ParseDate(dto.FamilyLoanTakenDate);
            g.FamilyLoanRepaidDate = ParseDate(dto.FamilyLoanRepaidDate);
            g.OtherBankName = dto.OtherBankName;
            g.OtherBankBranch = dto.OtherBankBranch;
            g.OtherBankLoanType = dto.OtherBankLoanType;
            g.OtherBankAccountNo = dto.OtherBankAccountNo;
            g.OtherBankLoanAmount = dto.OtherBankLoanAmount;
            g.OtherBankLoanTakenDate = ParseDate(dto.OtherBankLoanTakenDate);
            g.OtherBankLoanRepaidDate = ParseDate(dto.OtherBankLoanRepaidDate);
            g.PlaceOfSign = dto.PlaceOfSign;
            g.DateOfSign = ParseDate(dto.DateOfSign);
        }

        // ── Helper: map ExtraGuarantorDto → BusinessLoanExtraGuarantor ───────
        private static void MapPersonToExtra(ExtraGuarantorDto dto, BusinessLoanExtraGuarantor eg)
        {
            eg.FrontendId = dto.FrontendId;
            eg.GuarantorNumber = dto.GuarantorNumber;
            eg.PhotoBase64 = dto.PhotoBase64;
            eg.FullName = dto.FullName;
            eg.Age = dto.Age;
            eg.MemberNo = dto.MemberNo;
            eg.SharesCount = dto.SharesCount;
            eg.SharesAmount = dto.SharesAmount;
            eg.FatherHusbandName = dto.FatherHusbandName;
            eg.FatherHusbandAge = dto.FatherHusbandAge;
            eg.MotherName = dto.MotherName;
            eg.MotherAge = dto.MotherAge;
            eg.ResidentialAddress = dto.ResidentialAddress;
            eg.PinCode = dto.PinCode;
            eg.Telephone = dto.Telephone;
            eg.Mobile = dto.Mobile;
            eg.Email = dto.Email;
            eg.PropertyTypes = dto.PropertyTypes != null ? string.Join(",", dto.PropertyTypes) : null;
            eg.ResidenceMonths = dto.ResidenceMonths;
            eg.ResidenceYears = dto.ResidenceYears;
            eg.MaritalStatus = dto.MaritalStatus;
            eg.Dependents = dto.Dependents;
            eg.OfficeAddress = dto.OfficeAddress;
            eg.GavchaAddress = dto.GavchaAddress;
            eg.CompanyName = dto.CompanyName;
            eg.CompanyAddress = dto.CompanyAddress;
            eg.CompanyPinCode = dto.CompanyPinCode;
            eg.CompanyTelephone = dto.CompanyTelephone;
            eg.CompanyMobile = dto.CompanyMobile;
            eg.CompanyEmail = dto.CompanyEmail;
            eg.Department = dto.Department;
            eg.Designation = dto.Designation;
            eg.EmployeeCode = dto.EmployeeCode;
            eg.EmploymentMonths = dto.EmploymentMonths;
            eg.EmploymentYears = dto.EmploymentYears;
            eg.RetirementDate = ParseDate(dto.RetirementDate);
            eg.MonthlySalary = dto.MonthlySalary;
            eg.Deductions = dto.Deductions;
            eg.NetSalary = dto.NetSalary;
            eg.AnnualBusinessIncome = dto.AnnualBusinessIncome;
            eg.TotalExpenses = dto.TotalExpenses;
            eg.NetAnnualIncome = dto.NetAnnualIncome;
            eg.FamilyIncome = dto.FamilyIncome;
            eg.FamilyIncomeType = dto.FamilyIncomeType;
            eg.PropertyOwnerName = dto.PropertyOwnerName;
            eg.PropertyOwnerRelation = dto.PropertyOwnerRelation;
            eg.VillageMukkam = dto.VillageMukkam;
            eg.VillagePost = dto.VillagePost;
            eg.VillageTaluka = dto.VillageTaluka;
            eg.VillageDistrict = dto.VillageDistrict;
            eg.VillageState = dto.VillageState;
            eg.VillagePinCode = dto.VillagePinCode;
            eg.VillageTelephone = dto.VillageTelephone;
            eg.VillageMobile = dto.VillageMobile;
            eg.PrevLoanType = dto.PrevLoanType;
            eg.PrevLoanAccountNo = dto.PrevLoanAccountNo;
            eg.PrevLoanAmount = dto.PrevLoanAmount;
            eg.PrevLoanTakenDate = ParseDate(dto.PrevLoanTakenDate);
            eg.PrevLoanRepaidDate = ParseDate(dto.PrevLoanRepaidDate);
            eg.Guar94aBorrowerName = dto.Guar94aBorrowerName;
            eg.Guar94aLoanType = dto.Guar94aLoanType;
            eg.Guar94aAccountNo = dto.Guar94aAccountNo;
            eg.Guar94aAmount = dto.Guar94aAmount;
            eg.Guar94aTakenDate = ParseDate(dto.Guar94aTakenDate);
            eg.Guar94aRepaidDate = ParseDate(dto.Guar94aRepaidDate);
            eg.Guar94bBorrowerName = dto.Guar94bBorrowerName;
            eg.Guar94bLoanType = dto.Guar94bLoanType;
            eg.Guar94bAccountNo = dto.Guar94bAccountNo;
            eg.Guar94bAmount = dto.Guar94bAmount;
            eg.Guar94bTakenDate = ParseDate(dto.Guar94bTakenDate);
            eg.Guar94bRepaidDate = ParseDate(dto.Guar94bRepaidDate);
            eg.FamilyLoanMemberName = dto.FamilyLoanMemberName;
            eg.FamilyLoanType = dto.FamilyLoanType;
            eg.FamilyLoanAccountNo = dto.FamilyLoanAccountNo;
            eg.FamilyLoanAmount = dto.FamilyLoanAmount;
            eg.FamilyLoanTakenDate = ParseDate(dto.FamilyLoanTakenDate);
            eg.FamilyLoanRepaidDate = ParseDate(dto.FamilyLoanRepaidDate);
            eg.OtherBankName = dto.OtherBankName;
            eg.OtherBankBranch = dto.OtherBankBranch;
            eg.OtherBankLoanType = dto.OtherBankLoanType;
            eg.OtherBankAccountNo = dto.OtherBankAccountNo;
            eg.OtherBankLoanAmount = dto.OtherBankLoanAmount;
            eg.OtherBankLoanTakenDate = ParseDate(dto.OtherBankLoanTakenDate);
            eg.OtherBankLoanRepaidDate = ParseDate(dto.OtherBankLoanRepaidDate);
            eg.PlaceOfSign = dto.PlaceOfSign;
            eg.DateOfSign = ParseDate(dto.DateOfSign);
        }

        // ════════════════════════════════════════════════════════════════════
        //  STEP APIs
        // ════════════════════════════════════════════════════════════════════

        /// <summary>STEP 1 — Basic Info. Creates a new application.</summary>
        [HttpPost("step1")]
        public async Task<IActionResult> SaveStep1([FromBody] BlStep1Dto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var clientCode = HttpContext.Items["ClientCode"] as string;

            var app = new BusinessLoanApplication
            {
                ClientCode = clientCode,
                ApplicationNo = string.IsNullOrEmpty(dto.LoanAccountNo) // If you need a fallback, but let's just use BL- format
                    ? $"BL-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}" 
                    : $"BL-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}",
                ApplicationDate = ParseDate(dto.ApplicationDate) ?? DateTime.UtcNow,
                MemberNo = dto.MemberNo,
                LoanAccountNo = dto.LoanAccountNo,
                Branch = dto.Branch,
                ApplicantName = dto.ApplicantName,
                ApplicantAge = dto.ApplicantAge,
                LoanAmount = dto.LoanAmount,
                LoanAmountInWords = dto.LoanAmountInWords,
                RepaymentMonths = dto.RepaymentMonths,
                FirstInstallmentAfterMonths = dto.FirstInstallmentAfterMonths,
                InstallmentDate = dto.InstallmentDate,
                Purpose = dto.Purpose,
                MaritalStatus = dto.MaritalStatus,
                Dependents = dto.Dependents,
                Guarantor1Name = dto.Guarantor1Name,
                Guarantor1Age = dto.Guarantor1Age,
                Guarantor2Name = dto.Guarantor2Name,
                Guarantor2Age = dto.Guarantor2Age,
                Guarantor3Name = dto.Guarantor3Name,
                Guarantor3Age = dto.Guarantor3Age,
                Status = "Draft",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Save extra guarantor summaries (name/age only for step 1)
            if (dto.ExtraGuarantors?.Any() == true)
            {
                app.ExtraGuarantors = dto.ExtraGuarantors.Select((eg, idx) => new BusinessLoanExtraGuarantor
                {
                    ApplicationNo = app.ApplicationNo,
                    ClientCode = app.ClientCode,
                    FrontendId = eg.FrontendId,
                    GuarantorNumber = eg.GuarantorNumber > 0 ? eg.GuarantorNumber : idx + 3,
                    FullName = eg.Name,
                    Age = eg.Age
                }).ToList();
            }

            _db.BusinessLoanApplications.Add(app);
            await _db.SaveChangesAsync();

            return Ok(new BlApplicationResponse { Id = app.Id, Status = app.Status, Message = "Step 1 saved." });
        }

        /// <summary>STEP 1 — Update existing application basic info.</summary>
        [HttpPut("step1/{id}")]
        public async Task<IActionResult> UpdateStep1(int id, [FromBody] BlStep1Dto dto)
        {
            var app = await _db.BusinessLoanApplications
                .Include(a => a.ExtraGuarantors)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (app == null) return NotFound(new { Message = "Application not found." });
            // if (app.Status == "Submitted") return BadRequest(new { Message = "Already submitted." });

            app.ApplicationDate = ParseDate(dto.ApplicationDate) ?? app.ApplicationDate;
            app.MemberNo = dto.MemberNo;
            app.LoanAccountNo = dto.LoanAccountNo;
            app.Branch = dto.Branch;
            app.ApplicantName = dto.ApplicantName;
            app.ApplicantAge = dto.ApplicantAge;
            app.LoanAmount = dto.LoanAmount;
            app.LoanAmountInWords = dto.LoanAmountInWords;
            app.RepaymentMonths = dto.RepaymentMonths;
            app.FirstInstallmentAfterMonths = dto.FirstInstallmentAfterMonths;
            app.InstallmentDate = dto.InstallmentDate;
            app.Purpose = dto.Purpose;
            app.MaritalStatus = dto.MaritalStatus;
            app.Dependents = dto.Dependents;
            app.Guarantor1Name = dto.Guarantor1Name;
            app.Guarantor1Age = dto.Guarantor1Age;
            app.Guarantor2Name = dto.Guarantor2Name;
            app.Guarantor2Age = dto.Guarantor2Age;
            app.Guarantor3Name = dto.Guarantor3Name;
            app.Guarantor3Age = dto.Guarantor3Age;
            app.UpdatedAt = DateTime.UtcNow;

            // Sync extra guarantor summaries
            var existingExtras = app.ExtraGuarantors.ToList();

            // Remove extras no longer in the DTO
            var incomingIds = dto.ExtraGuarantors?.Select(e => e.FrontendId).ToHashSet() ?? new HashSet<string?>();
            var toRemove = existingExtras.Where(e => !incomingIds.Contains(e.FrontendId)).ToList();
            _db.BusinessLoanExtraGuarantors.RemoveRange(toRemove);

            if (dto.ExtraGuarantors?.Any() == true)
            {
                for (int i = 0; i < dto.ExtraGuarantors.Count; i++)
                {
                    var eg = dto.ExtraGuarantors[i];
                    var existing = existingExtras.FirstOrDefault(e => e.FrontendId == eg.FrontendId);
                    if (existing != null)
                    {
                        existing.FullName = eg.Name;
                        existing.Age = eg.Age;
                        existing.GuarantorNumber = eg.GuarantorNumber > 0 ? eg.GuarantorNumber : i + 3;
                    }
                    else
                    {
                        app.ExtraGuarantors.Add(new BusinessLoanExtraGuarantor
                        {
                            ApplicationNo = app.ApplicationNo,
                            ClientCode = app.ClientCode,
                            FrontendId = eg.FrontendId,
                            GuarantorNumber = eg.GuarantorNumber > 0 ? eg.GuarantorNumber : i + 3,
                            FullName = eg.Name,
                            Age = eg.Age
                        });
                    }
                }
            }

            await _db.SaveChangesAsync();
            return Ok(new BlApplicationResponse { Id = app.Id, Status = app.Status, Message = "Step 1 updated." });
        }

        /// <summary>STEP 2 — Borrower's detailed information.</summary>
        [HttpPut("step2/{id}")]
        public async Task<IActionResult> SaveStep2(int id, [FromBody] BlStep2Dto dto)
        {
            var app = await _db.BusinessLoanApplications
                .Include(a => a.Borrower)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (app == null) return NotFound(new { Message = "Application not found." });
            // if (app.Status == "Submitted") return BadRequest(new { Message = "Cannot edit a submitted application." });

            if (app.Borrower == null)
            {
                app.Borrower = new BusinessLoanBorrower 
                { 
                    ApplicationId = id,
                    ApplicationNo = app.ApplicationNo,
                    ClientCode = app.ClientCode
                };
                _db.BusinessLoanBorrowers.Add(app.Borrower);
            }

            MapPersonToBorrower(dto, app.Borrower);
            app.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return Ok(new BlApplicationResponse { Id = id, Status = app.Status, Message = "Step 2 (Borrower) saved." });
        }

        /// <summary>STEP 3 — Guarantor No. 1 detailed information.</summary>
        [HttpPut("step3/{id}")]
        public async Task<IActionResult> SaveStep3(int id, [FromBody] BlStep3Dto dto)
        {
            var app = await _db.BusinessLoanApplications
                .Include(a => a.Guarantors)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (app == null) return NotFound(new { Message = "Application not found." });
            // if (app.Status == "Submitted") return BadRequest(new { Message = "Cannot edit a submitted application." });

            var g1 = app.Guarantors.FirstOrDefault(g => g.GuarantorNumber == 1);
            if (g1 == null)
            {
                g1 = new BusinessLoanGuarantor 
                { 
                    ApplicationId = id, 
                    GuarantorNumber = 1,
                    ApplicationNo = app.ApplicationNo,
                    ClientCode = app.ClientCode
                };
                _db.BusinessLoanGuarantors.Add(g1);
            }

            MapPersonToGuarantor(dto, g1);
            app.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return Ok(new BlApplicationResponse { Id = id, Status = app.Status, Message = "Step 3 (Guarantor 1) saved." });
        }

        /// <summary>STEP 4 — Guarantor No. 2 detailed information.</summary>
        [HttpPut("step4/{id}")]
        public async Task<IActionResult> SaveStep4(int id, [FromBody] BlStep4Dto dto)
        {
            var app = await _db.BusinessLoanApplications
                .Include(a => a.Guarantors)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (app == null) return NotFound(new { Message = "Application not found." });
            // if (app.Status == "Submitted") return BadRequest(new { Message = "Cannot edit a submitted application." });

            var g2 = app.Guarantors.FirstOrDefault(g => g.GuarantorNumber == 2);
            if (g2 == null)
            {
                g2 = new BusinessLoanGuarantor 
                { 
                    ApplicationId = id, 
                    GuarantorNumber = 2,
                    ApplicationNo = app.ApplicationNo,
                    ClientCode = app.ClientCode
                };
                _db.BusinessLoanGuarantors.Add(g2);
            }

            MapPersonToGuarantor(dto, g2);
            app.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return Ok(new BlApplicationResponse { Id = id, Status = app.Status, Message = "Step 4 (Guarantor 2) saved." });
        }

        /// <summary>STEP Extra — Save/update a single extra guarantor's full details.</summary>
        [HttpPut("step-extra-guarantor/{id}/{frontendId}")]
        public async Task<IActionResult> SaveExtraGuarantor(int id, string frontendId, [FromBody] ExtraGuarantorDto dto)
        {
            var app = await _db.BusinessLoanApplications.FindAsync(id);
            if (app == null) return NotFound(new { Message = "Application not found." });
            // if (app.Status == "Submitted") return BadRequest(new { Message = "Cannot edit a submitted application." });

            var eg = await _db.BusinessLoanExtraGuarantors
                .FirstOrDefaultAsync(e => e.ApplicationId == id && e.FrontendId == frontendId);

            if (eg == null)
            {
                eg = new BusinessLoanExtraGuarantor 
                { 
                    ApplicationId = id, 
                    FrontendId = frontendId,
                    ApplicationNo = app.ApplicationNo,
                    ClientCode = app.ClientCode
                };
                _db.BusinessLoanExtraGuarantors.Add(eg);
            }

            MapPersonToExtra(dto, eg);
            app.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return Ok(new BlApplicationResponse { Id = id, Status = app.Status, Message = $"Extra guarantor {frontendId} saved." });
        }

        [HttpPut("step5/{id}")]
        public async Task<IActionResult> SaveStep5(int id, [FromBody] BlStep5Dto dto)
        {
            Console.WriteLine($"--> SaveStep5 called with ID: {id}");

            var app = await _db.BusinessLoanApplications
                .Include(a => a.BusinessInfo)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (app == null) return NotFound(new { Message = "Application not found." });
            // if (app.Status == "Submitted") return BadRequest(new { Message = "Cannot edit a submitted application." });

            if (app.BusinessInfo == null)
            {
                app.BusinessInfo = new BusinessLoanBusinessInfo 
                { 
                    ApplicationId = id,
                    ApplicationNo = app.ApplicationNo,
                    ClientCode = app.ClientCode
                };
                _db.BusinessLoanBusinessInfos.Add(app.BusinessInfo);
            }

            var b = app.BusinessInfo;
            b.BusinessNature = dto.BusinessNature;
            b.BusinessType = dto.BusinessType;
            b.BusinessPropertyType = dto.BusinessPropertyType;
            b.FloorArea = dto.FloorArea;
            b.FirmName = dto.FirmName;
            b.Address = dto.Address;
            b.Address2 = dto.Address2;
            b.PinCode = dto.PinCode;
            b.Phone = dto.Phone;
            b.Email = dto.Email;
            b.PanCardNo = dto.PanCardNo;
            b.GumastaLicenseNo = dto.GumastaLicenseNo;
            b.SalesTaxNo = dto.SalesTaxNo;
            b.VatNo = dto.VatNo;
            b.ServiceTaxNo = dto.ServiceTaxNo;
            b.OtherLicense = dto.OtherLicense;
            b.AllLicensesAvailable = dto.AllLicensesAvailable;
            b.IsSmallIndustryResident = dto.IsSmallIndustryResident;
            b.SinceWhen = dto.SinceWhen;
            b.Experience = dto.Experience;
            b.TotalAnnualIncome = dto.TotalAnnualIncome;
            b.TotalAnnualExpenses = dto.TotalAnnualExpenses;
            b.NetAnnualIncome = dto.NetAnnualIncome;
            b.Customer1Name = dto.Customer1Name;
            b.Customer1Address = dto.Customer1Address;
            b.Customer2Name = dto.Customer2Name;
            b.Customer2Address = dto.Customer2Address;
            b.Supplier1Name = dto.Supplier1Name;
            b.Supplier1Address = dto.Supplier1Address;
            b.Supplier2Name = dto.Supplier2Name;
            b.Supplier2Address = dto.Supplier2Address;
            b.Extra1 = dto.Extra1;
            b.Extra2 = dto.Extra2;
            b.Extra3 = dto.Extra3;
            b.Extra4 = dto.Extra4;

            app.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return Ok(new BlApplicationResponse { Id = id, Status = app.Status, Message = "Step 5 (Business Info) saved." });
        }

        [HttpPut("step6/{id}")]
        public async Task<IActionResult> SaveStep6(int id, [FromBody] BlStep6Dto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                Console.WriteLine("!!! VALIDATION FAILED in SaveStep6: " + string.Join(", ", errors));
                return BadRequest(ModelState);
            }

            var app = await _db.BusinessLoanApplications
                .Include(a => a.InsuranceTaxInfo)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (app == null) return NotFound(new { Message = "Application not found." });
            // if (app.Status == "Submitted") return BadRequest(new { Message = "Cannot edit a submitted application." });

            if (app.InsuranceTaxInfo == null)
            {
                app.InsuranceTaxInfo = new BusinessLoanInsuranceTaxInfo 
                { 
                    ApplicationId = id,
                    ApplicationNo = app.ApplicationNo,
                    ClientCode = app.ClientCode
                };
                _db.BusinessLoanInsuranceTaxInfos.Add(app.InsuranceTaxInfo);
            }

            var t = app.InsuranceTaxInfo;
            t.InsuranceCompanyName = dto.InsuranceCompanyName;
            t.InsuranceAddress = dto.InsuranceAddress;
            t.InsurancePolicyNo = dto.InsurancePolicyNo;
            t.InsuranceFrom = ParseDate(dto.InsuranceFrom);
            t.InsuranceTo = ParseDate(dto.InsuranceTo);
            t.InsuranceAmount = dto.InsuranceAmount;
            t.InsurancePremium = dto.InsurancePremium;
            t.InsurancePremiumFrequency = dto.InsurancePremiumFrequency;
            t.HasPolicyLoan = dto.HasPolicyLoan;
            t.PolicyLoanBankName = dto.PolicyLoanBankName;
            t.PolicyLoanBankAddress = dto.PolicyLoanBankAddress;
            t.PolicyLoanAmount = dto.PolicyLoanAmount;
            t.PolicyLoanDate = ParseDate(dto.PolicyLoanDate);
            t.PolicyLoanBalance = dto.PolicyLoanBalance;
            t.PanCardNo = dto.PanCardNo;
            t.IncomeTaxSince = dto.IncomeTaxSince;
            t.ItYear1From = dto.ItYear1From; t.ItYear1To = dto.ItYear1To;
            t.ItAmount1 = dto.ItAmount1; t.ItDate1 = ParseDate(dto.ItDate1);
            t.ItYear2From = dto.ItYear2From; t.ItYear2To = dto.ItYear2To;
            t.ItAmount2 = dto.ItAmount2; t.ItDate2 = ParseDate(dto.ItDate2);
            t.ItYear3From = dto.ItYear3From; t.ItYear3To = dto.ItYear3To;
            t.ItAmount3 = dto.ItAmount3; t.ItDate3 = ParseDate(dto.ItDate3);
            t.ProTaxNo = dto.ProTaxNo;
            t.ProTaxSince = dto.ProTaxSince;
            t.PtYear1From = dto.PtYear1From; t.PtYear1To = dto.PtYear1To;
            t.PtAmount1 = dto.PtAmount1; t.PtDate1 = ParseDate(dto.PtDate1);
            t.PtYear2From = dto.PtYear2From; t.PtYear2To = dto.PtYear2To;
            t.PtAmount2 = dto.PtAmount2; t.PtDate2 = ParseDate(dto.PtDate2);
            t.PtYear3From = dto.PtYear3From; t.PtYear3To = dto.PtYear3To;
            t.PtAmount3 = dto.PtAmount3; t.PtDate3 = ParseDate(dto.PtDate3);

            app.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return Ok(new BlApplicationResponse { Id = id, Status = app.Status, Message = "Step 6 (Insurance & Tax) saved." });
        }

        [HttpPut("step7/{id}")]
        public async Task<IActionResult> SaveStep7(int id, [FromBody] BlStep7Dto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                Console.WriteLine("!!! VALIDATION FAILED in SaveStep7: " + string.Join(", ", errors));
                return BadRequest(ModelState);
            }

            var app = await _db.BusinessLoanApplications
                .Include(a => a.Collateral)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (app == null) return NotFound(new { Message = "Application not found." });
            // if (app.Status == "Submitted") return BadRequest(new { Message = "Cannot edit a submitted application." });

            if (app.Collateral == null)
            {
                app.Collateral = new BusinessLoanCollateral 
                { 
                    ApplicationId = id,
                    ApplicationNo = app.ApplicationNo,
                    ClientCode = app.ClientCode
                };
                _db.BusinessLoanCollaterals.Add(app.Collateral);
            }

            var c = app.Collateral;
            c.PropertyType = dto.PropertyType;
            c.PropertyTypeOther = dto.PropertyTypeOther;
            c.PropertyAddress = dto.PropertyAddress;
            c.PropertyAddress2 = dto.PropertyAddress2;
            c.PropertyPinCode = dto.PropertyPinCode;
            c.PropertyTelephone = dto.PropertyTelephone;
            c.PropertyMobile = dto.PropertyMobile;
            c.GalaArea = dto.GalaArea;
            c.BuildingConstructionYear = dto.BuildingConstructionYear;
            c.CitySurveyNo = dto.CitySurveyNo;
            c.PlotNo = dto.PlotNo;
            c.WardNo = dto.WardNo;
            c.CompletionCertDate = ParseDate(dto.CompletionCertDate);
            c.OcDate = ParseDate(dto.OcDate);
            c.ConveyanceDeedDate = ParseDate(dto.ConveyanceDeedDate);
            c.HousingSocietyRegNo = dto.HousingSocietyRegNo;
            c.MemberNo = dto.MemberNo;
            c.LandArea = dto.LandArea;
            c.NaOrderDate = ParseDate(dto.NaOrderDate);
            c.LandCitySurveyNo = dto.LandCitySurveyNo;
            c.LandPlotNo = dto.LandPlotNo;
            c.LandWardNo = dto.LandWardNo;
            c.GutNo = dto.GutNo;
            c.HissaNo = dto.HissaNo;
            c.EastBoundary = dto.EastBoundary;
            c.WestBoundary = dto.WestBoundary;
            c.SouthBoundary = dto.SouthBoundary;
            c.NorthBoundary = dto.NorthBoundary;
            c.GovtValuation = dto.GovtValuation;
            c.MarketValue = dto.MarketValue;
            c.InsuranceCompanyName = dto.InsuranceCompanyName;
            c.InsuranceAddress = dto.InsuranceAddress;
            c.InsuranceAddress2 = dto.InsuranceAddress2;
            c.InsurancePolicyNo = dto.InsurancePolicyNo;
            c.InsuranceFrom = ParseDate(dto.InsuranceFrom);
            c.InsuranceTo = ParseDate(dto.InsuranceTo);
            c.InsuranceAmount = dto.InsuranceAmount;
            c.InsurancePremium = dto.InsurancePremium;

            app.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return Ok(new BlApplicationResponse { Id = id, Status = app.Status, Message = "Step 7 (Collateral) saved." });
        }

        // ════════════════════════════════════════════════════════════════════
        //  SUBMIT
        // ════════════════════════════════════════════════════════════════════

        /// <summary>Final Submit — marks the application as Submitted.</summary>
        [HttpPost("submit/{id}")]
        public async Task<IActionResult> Submit(int id)
        {
            var app = await _db.BusinessLoanApplications.FindAsync(id);
            if (app == null) return NotFound(new { Message = "Application not found." });
            // if (app.Status == "Submitted") return BadRequest(new { Message = "Already submitted." });

            app.Status = "Submitted";
            app.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return Ok(new BlApplicationResponse { Id = id, Status = "Submitted", Message = "Application submitted successfully." });
        }

        /// <summary>Full Submit — saves all steps at once and marks as Submitted.</summary>
        [HttpPost("submit-full")]
        public async Task<IActionResult> SubmitFull([FromBody] BlFullSubmitDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var clientCode = HttpContext.Items["ClientCode"] as string;

            var app = new BusinessLoanApplication
            {
                ClientCode = clientCode,
                ApplicationNo = $"BL-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}",
                ApplicationDate = ParseDate(dto.Step1.ApplicationDate) ?? DateTime.UtcNow,
                MemberNo = dto.Step1.MemberNo,
                LoanAccountNo = dto.Step1.LoanAccountNo,
                Branch = dto.Step1.Branch,
                ApplicantName = dto.Step1.ApplicantName,
                ApplicantAge = dto.Step1.ApplicantAge,
                LoanAmount = dto.Step1.LoanAmount,
                LoanAmountInWords = dto.Step1.LoanAmountInWords,
                RepaymentMonths = dto.Step1.RepaymentMonths,
                FirstInstallmentAfterMonths = dto.Step1.FirstInstallmentAfterMonths,
                InstallmentDate = dto.Step1.InstallmentDate,
                Purpose = dto.Step1.Purpose,
                MaritalStatus = dto.Step1.MaritalStatus,
                Dependents = dto.Step1.Dependents,
                Guarantor1Name = dto.Step1.Guarantor1Name,
                Guarantor1Age = dto.Step1.Guarantor1Age,
                Guarantor2Name = dto.Step1.Guarantor2Name,
                Guarantor2Age = dto.Step1.Guarantor2Age,
                Guarantor3Name = dto.Step1.Guarantor3Name,
                Guarantor3Age = dto.Step1.Guarantor3Age,
                Status = "Submitted",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.BusinessLoanApplications.Add(app);
            await _db.SaveChangesAsync();

            // Borrower
            var borrower = new BusinessLoanBorrower { ApplicationId = app.Id };
            MapPersonToBorrower(dto.Step2, borrower);
            _db.BusinessLoanBorrowers.Add(borrower);

            // Guarantor 1
            var g1 = new BusinessLoanGuarantor { ApplicationId = app.Id, GuarantorNumber = 1 };
            MapPersonToGuarantor(dto.Step3, g1);
            _db.BusinessLoanGuarantors.Add(g1);

            // Guarantor 2
            var g2 = new BusinessLoanGuarantor { ApplicationId = app.Id, GuarantorNumber = 2 };
            MapPersonToGuarantor(dto.Step4, g2);
            _db.BusinessLoanGuarantors.Add(g2);

            // Extra Guarantors
            if (dto.ExtraGuarantors?.Any() == true)
            {
                foreach (var egDto in dto.ExtraGuarantors)
                {
                    var eg = new BusinessLoanExtraGuarantor { ApplicationId = app.Id };
                    MapPersonToExtra(egDto, eg);
                    _db.BusinessLoanExtraGuarantors.Add(eg);
                }
            }

            // Business Info
            var biz = new BusinessLoanBusinessInfo { ApplicationId = app.Id };
            var s5 = dto.Step5;
            biz.BusinessNature = s5.BusinessNature; biz.BusinessType = s5.BusinessType;
            biz.BusinessPropertyType = s5.BusinessPropertyType; biz.FloorArea = s5.FloorArea;
            biz.FirmName = s5.FirmName; biz.Address = s5.Address; biz.Address2 = s5.Address2;
            biz.PinCode = s5.PinCode; biz.Phone = s5.Phone; biz.Email = s5.Email;
            biz.PanCardNo = s5.PanCardNo; biz.GumastaLicenseNo = s5.GumastaLicenseNo;
            biz.SalesTaxNo = s5.SalesTaxNo; biz.VatNo = s5.VatNo; biz.ServiceTaxNo = s5.ServiceTaxNo;
            biz.OtherLicense = s5.OtherLicense; biz.AllLicensesAvailable = s5.AllLicensesAvailable;
            biz.IsSmallIndustryResident = s5.IsSmallIndustryResident;
            biz.SinceWhen = s5.SinceWhen; biz.Experience = s5.Experience;
            biz.TotalAnnualIncome = s5.TotalAnnualIncome; biz.TotalAnnualExpenses = s5.TotalAnnualExpenses;
            biz.NetAnnualIncome = s5.NetAnnualIncome;
            biz.Customer1Name = s5.Customer1Name; biz.Customer1Address = s5.Customer1Address;
            biz.Customer2Name = s5.Customer2Name; biz.Customer2Address = s5.Customer2Address;
            biz.Supplier1Name = s5.Supplier1Name; biz.Supplier1Address = s5.Supplier1Address;
            biz.Supplier2Name = s5.Supplier2Name; biz.Supplier2Address = s5.Supplier2Address;
            biz.Extra1 = s5.Extra1; biz.Extra2 = s5.Extra2; biz.Extra3 = s5.Extra3; biz.Extra4 = s5.Extra4;
            _db.BusinessLoanBusinessInfos.Add(biz);

            // Insurance & Tax
            var ins = new BusinessLoanInsuranceTaxInfo { ApplicationId = app.Id };
            var s6 = dto.Step6;
            ins.InsuranceCompanyName = s6.InsuranceCompanyName; ins.InsuranceAddress = s6.InsuranceAddress;
            ins.InsurancePolicyNo = s6.InsurancePolicyNo;
            ins.InsuranceFrom = ParseDate(s6.InsuranceFrom); ins.InsuranceTo = ParseDate(s6.InsuranceTo);
            ins.InsuranceAmount = s6.InsuranceAmount; ins.InsurancePremium = s6.InsurancePremium;
            ins.InsurancePremiumFrequency = s6.InsurancePremiumFrequency;
            ins.HasPolicyLoan = s6.HasPolicyLoan; ins.PolicyLoanBankName = s6.PolicyLoanBankName;
            ins.PolicyLoanBankAddress = s6.PolicyLoanBankAddress; ins.PolicyLoanAmount = s6.PolicyLoanAmount;
            ins.PolicyLoanDate = ParseDate(s6.PolicyLoanDate); ins.PolicyLoanBalance = s6.PolicyLoanBalance;
            ins.PanCardNo = s6.PanCardNo; ins.IncomeTaxSince = s6.IncomeTaxSince;
            ins.ItYear1From = s6.ItYear1From; ins.ItYear1To = s6.ItYear1To;
            ins.ItAmount1 = s6.ItAmount1; ins.ItDate1 = ParseDate(s6.ItDate1);
            ins.ItYear2From = s6.ItYear2From; ins.ItYear2To = s6.ItYear2To;
            ins.ItAmount2 = s6.ItAmount2; ins.ItDate2 = ParseDate(s6.ItDate2);
            ins.ItYear3From = s6.ItYear3From; ins.ItYear3To = s6.ItYear3To;
            ins.ItAmount3 = s6.ItAmount3; ins.ItDate3 = ParseDate(s6.ItDate3);
            ins.ProTaxNo = s6.ProTaxNo; ins.ProTaxSince = s6.ProTaxSince;
            ins.PtYear1From = s6.PtYear1From; ins.PtYear1To = s6.PtYear1To;
            ins.PtAmount1 = s6.PtAmount1; ins.PtDate1 = ParseDate(s6.PtDate1);
            ins.PtYear2From = s6.PtYear2From; ins.PtYear2To = s6.PtYear2To;
            ins.PtAmount2 = s6.PtAmount2; ins.PtDate2 = ParseDate(s6.PtDate2);
            ins.PtYear3From = s6.PtYear3From; ins.PtYear3To = s6.PtYear3To;
            ins.PtAmount3 = s6.PtAmount3; ins.PtDate3 = ParseDate(s6.PtDate3);
            _db.BusinessLoanInsuranceTaxInfos.Add(ins);

            // Collateral
            var col = new BusinessLoanCollateral { ApplicationId = app.Id };
            var s7 = dto.Step7;
            col.PropertyType = s7.PropertyType; col.PropertyTypeOther = s7.PropertyTypeOther;
            col.PropertyAddress = s7.PropertyAddress; col.PropertyAddress2 = s7.PropertyAddress2;
            col.PropertyPinCode = s7.PropertyPinCode; col.PropertyTelephone = s7.PropertyTelephone;
            col.PropertyMobile = s7.PropertyMobile; col.GalaArea = s7.GalaArea;
            col.BuildingConstructionYear = s7.BuildingConstructionYear;
            col.CitySurveyNo = s7.CitySurveyNo; col.PlotNo = s7.PlotNo; col.WardNo = s7.WardNo;
            col.CompletionCertDate = ParseDate(s7.CompletionCertDate); col.OcDate = ParseDate(s7.OcDate);
            col.ConveyanceDeedDate = ParseDate(s7.ConveyanceDeedDate);
            col.HousingSocietyRegNo = s7.HousingSocietyRegNo; col.MemberNo = s7.MemberNo;
            col.LandArea = s7.LandArea; col.NaOrderDate = ParseDate(s7.NaOrderDate);
            col.LandCitySurveyNo = s7.LandCitySurveyNo; col.LandPlotNo = s7.LandPlotNo; col.LandWardNo = s7.LandWardNo;
            col.GutNo = s7.GutNo; col.HissaNo = s7.HissaNo;
            col.EastBoundary = s7.EastBoundary; col.WestBoundary = s7.WestBoundary;
            col.SouthBoundary = s7.SouthBoundary; col.NorthBoundary = s7.NorthBoundary;
            col.GovtValuation = s7.GovtValuation; col.MarketValue = s7.MarketValue;
            col.InsuranceCompanyName = s7.InsuranceCompanyName; col.InsuranceAddress = s7.InsuranceAddress;
            col.InsuranceAddress2 = s7.InsuranceAddress2; col.InsurancePolicyNo = s7.InsurancePolicyNo;
            col.InsuranceFrom = ParseDate(s7.InsuranceFrom); col.InsuranceTo = ParseDate(s7.InsuranceTo);
            col.InsuranceAmount = s7.InsuranceAmount; col.InsurancePremium = s7.InsurancePremium;
            _db.BusinessLoanCollaterals.Add(col);

            await _db.SaveChangesAsync();

            return Ok(new BlApplicationResponse 
            { 
                Id = app.Id, 
                ApplicationNo = app.ApplicationNo,
                Status = "Submitted", 
                Message = "Application submitted successfully." 
            });
        }

        // ════════════════════════════════════════════════════════════════════
        //  READ APIs
        // ════════════════════════════════════════════════════════════════════

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? status = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var clientCode = HttpContext.Items["ClientCode"] as string;

            var query = _db.BusinessLoanApplications.AsQueryable();

            if (!string.IsNullOrEmpty(clientCode))
                query = query.Where(a => a.ClientCode == clientCode);

            if (!string.IsNullOrEmpty(status))
                query = query.Where(a => a.Status == status);

            var total = await query.CountAsync();
            var items = await query
                .OrderByDescending(a => a.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new BlListItemDto
                {
                    Id = a.Id,
                    ApplicantName = a.ApplicantName,
                    LoanAmount = a.LoanAmount,
                    Branch = a.Branch,
                    Status = a.Status,
                    CreatedAt = a.CreatedAt,
                    MemberNo = a.MemberNo,
                    LoanAccountNo = a.LoanAccountNo,
                    ApplicationNo = a.ApplicationNo
                })
                .ToListAsync();

            return Ok(new { Total = total, Page = page, PageSize = pageSize, Items = items });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var app = await _db.BusinessLoanApplications
                .Include(a => a.Borrower)
                .Include(a => a.Guarantors)
                .Include(a => a.ExtraGuarantors)
                .Include(a => a.BusinessInfo)
                .Include(a => a.InsuranceTaxInfo)
                .Include(a => a.Collateral)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (app == null) return NotFound(new { Message = "Application not found." });
            return Ok(app);
        }

        [HttpGet("{id}/step1")]
        public async Task<IActionResult> GetStep1(int id)
        {
            var app = await _db.BusinessLoanApplications
                .Include(a => a.ExtraGuarantors)
                .FirstOrDefaultAsync(a => a.Id == id);
            if (app == null) return NotFound();
            return Ok(app);
        }

        [HttpGet("{id}/step2")]
        public async Task<IActionResult> GetStep2(int id)
        {
            var borrower = await _db.BusinessLoanBorrowers.FirstOrDefaultAsync(b => b.ApplicationId == id);
            if (borrower == null) return NotFound();
            return Ok(borrower);
        }

        [HttpGet("{id}/step3")]
        public async Task<IActionResult> GetStep3(int id)
        {
            var g = await _db.BusinessLoanGuarantors
                .FirstOrDefaultAsync(g => g.ApplicationId == id && g.GuarantorNumber == 1);
            if (g == null) return NotFound();
            return Ok(g);
        }

        [HttpGet("{id}/step4")]
        public async Task<IActionResult> GetStep4(int id)
        {
            var g = await _db.BusinessLoanGuarantors
                .FirstOrDefaultAsync(g => g.ApplicationId == id && g.GuarantorNumber == 2);
            if (g == null) return NotFound();
            return Ok(g);
        }

        [HttpGet("{id}/extra-guarantors")]
        public async Task<IActionResult> GetExtraGuarantors(int id)
        {
            var list = await _db.BusinessLoanExtraGuarantors
                .Where(e => e.ApplicationId == id)
                .OrderBy(e => e.GuarantorNumber)
                .ToListAsync();
            return Ok(list);
        }

        [HttpGet("{id}/extra-guarantors/{frontendId}")]
        public async Task<IActionResult> GetExtraGuarantor(int id, string frontendId)
        {
            var eg = await _db.BusinessLoanExtraGuarantors
                .FirstOrDefaultAsync(e => e.ApplicationId == id && e.FrontendId == frontendId);
            if (eg == null) return NotFound();
            return Ok(eg);
        }

        [HttpGet("{id}/step5")]
        public async Task<IActionResult> GetStep5(int id)
        {
            var biz = await _db.BusinessLoanBusinessInfos.FirstOrDefaultAsync(b => b.ApplicationId == id);
            if (biz == null) return NotFound();
            return Ok(biz);
        }

        [HttpGet("{id}/step6")]
        public async Task<IActionResult> GetStep6(int id)
        {
            var ins = await _db.BusinessLoanInsuranceTaxInfos.FirstOrDefaultAsync(i => i.ApplicationId == id);
            if (ins == null) return NotFound();
            return Ok(ins);
        }

        [HttpGet("{id}/step7")]
        public async Task<IActionResult> GetStep7(int id)
        {
            var col = await _db.BusinessLoanCollaterals.FirstOrDefaultAsync(c => c.ApplicationId == id);
            if (col == null) return NotFound();
            return Ok(col);
        }

        // ════════════════════════════════════════════════════════════════════
        //  DELETE / STATUS APIs
        // ════════════════════════════════════════════════════════════════════

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var app = await _db.BusinessLoanApplications.FindAsync(id);
            if (app == null) return NotFound();
            if (app.Status == "Submitted") return BadRequest(new { Message = "Cannot delete a submitted application." });

            _db.BusinessLoanApplications.Remove(app);
            await _db.SaveChangesAsync();
            return Ok(new { Message = "Application deleted." });
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
        {
            var validStatuses = new[] { "Draft", "Submitted", "UnderReview", "Approved", "Rejected" };
            if (!validStatuses.Contains(status))
                return BadRequest(new { Message = $"Invalid status. Valid: {string.Join(", ", validStatuses)}" });

            var app = await _db.BusinessLoanApplications.FindAsync(id);
            if (app == null) return NotFound();

            app.Status = status;
            app.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return Ok(new BlApplicationResponse { Id = id, Status = status, Message = "Status updated." });
        }

        [HttpDelete("{id}/extra-guarantors/{frontendId}")]
        public async Task<IActionResult> DeleteExtraGuarantor(int id, string frontendId)
        {
            var eg = await _db.BusinessLoanExtraGuarantors
                .FirstOrDefaultAsync(e => e.ApplicationId == id && e.FrontendId == frontendId);
            if (eg == null) return NotFound();

            _db.BusinessLoanExtraGuarantors.Remove(eg);
            await _db.SaveChangesAsync();
            return Ok(new { Message = "Extra guarantor removed." });
        }
    }
}