using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TushGptBackend.Data;
using TushGptBackend.Models;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;

namespace TushGptBackend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PersonalLoanController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PersonalLoanController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/PersonalLoan
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetLoans()
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();

            var query = _context.PersonalLoans.AsQueryable();

            if (userRole != "SUPER_ADMIN")
            {
                if (string.IsNullOrEmpty(userClientCode)) return BadRequest(new { message = "ClientCode not found in token." });
                query = query.Where(l => l.ClientCode == userClientCode);
            }

            var loans = await query
                .Include(p => p.Borrower)
                .Include(p => p.Guarantor1)
                .Include(p => p.Guarantor2)
                .Include(p => p.Office)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();

            return Ok(loans.Select(l => FlattenLoan(l)));
        }

        // GET: api/PersonalLoan/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetLoan(int id)
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();

            var loan = await _context.PersonalLoans
                .Include(p => p.Borrower)
                .Include(p => p.Guarantor1)
                .Include(p => p.Guarantor2)
                .Include(p => p.Office)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (loan == null) return NotFound();

            if (userRole != "SUPER_ADMIN" && loan.ClientCode != userClientCode)
                return Unauthorized(new { message = "You do not have permission to access this record." });

            return Ok(FlattenLoan(loan));
        }

        private string? JoinJsonArray(object? val)
        {
            if (val == null) return null;
            if (val is string s) return s;
            if (val is System.Text.Json.JsonElement je)
            {
                if (je.ValueKind == System.Text.Json.JsonValueKind.Array)
                {
                    return string.Join(", ", je.EnumerateArray().Select(x => x.ToString()));
                }
                if (je.ValueKind == System.Text.Json.JsonValueKind.String) return je.GetString();
                return je.ToString();
            }
            return val.ToString();
        }

        // POST: api/PersonalLoan
        [HttpPost]
        public async Task<ActionResult<object>> PostLoan([FromBody] PersonalLoanRequest req)
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();

            if (userRole != "SUPER_ADMIN")
            {
                if (string.IsNullOrEmpty(userClientCode))
                    return Unauthorized(new { message = "ClientCode missing from token." });
            }

            try
            {
                if (req == null) return BadRequest("Invalid data");
                int? id = req.id;
                PersonalLoan? loan = null;

                if (id.HasValue && id > 0)
                {
                    loan = await _context.PersonalLoans
                        .Include(p => p.Borrower)
                        .Include(p => p.Guarantor1)
                        .Include(p => p.Guarantor2)
                        .Include(p => p.Office)
                        .FirstOrDefaultAsync(l => l.Id == id.Value);
                }

                string? appNo = loan?.ApplicationNo;
                string? clientCode = userClientCode ?? req.clientCode;

                if (string.IsNullOrEmpty(appNo))
                {
                    appNo = $"PL-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
                }

                if (loan == null)
                {
                    loan = new PersonalLoan { 
                        CreatedAt = DateTime.Now,
                        ApplicationNo = appNo,
                        ClientCode = clientCode
                    };
                    _context.PersonalLoans.Add(loan);
                }
                else
                {
                    // If updating, keep existing appNo/clientCode or update if super admin provided them
                    if (userRole == "SUPER_ADMIN")
                    {
                        if (!string.IsNullOrEmpty(req.applicationNo)) appNo = req.applicationNo;
                        if (!string.IsNullOrEmpty(req.clientCode)) clientCode = req.clientCode;
                    }
                    loan.ApplicationNo = appNo;
                    loan.ClientCode = clientCode;
                }

                // 1. Map Main Loan Entity
                loan.ApplicationDate = req.dinank;
                loan.MemberNumber = req.saCra ?? req.sabasadCrNo;
                loan.LoanAccountNumber = req.karjKhate;
                loan.BranchName = req.shakha;
                loan.ApplicantName = req.arjdarNaav;
                loan.Age = req.arjdarVay;
                loan.LoanAmount = req.karjRakkam;
                loan.AmountInWords = req.akshari;
                loan.RepaymentPeriodMonths = req.paratfedKalavadhi;
                loan.FirstInstallmentAfterMonths = req.pahilaHapta;
                loan.InstallmentDay = req.tarikh;
                loan.LoanPurpose = req.karan;
                loan.InterestRate = req.vyajDar;
                loan.MaritalStatus = req.vaivahik;
                loan.DependentsCount = req.avalambun;
                loan.Guarantor1NameSummary = req.jameen1Naav;
                loan.Guarantor1AgeSummary = req.jameen1Vay;
                loan.Guarantor2NameSummary = req.jameen2Naav;
                loan.Guarantor2AgeSummary = req.jameen2Vay;
                loan.Guarantor3NameSummary = req.jameen3Naav;
                loan.Guarantor3AgeSummary = req.jameen3Vay;
                loan.CoApplicantName = req.saharjdarNaav;
                loan.CoApplicantAge = req.saharjdarVay;
                loan.ExtraGuarantorsJson = req.extraGuarantors != null ? System.Text.Json.JsonSerializer.Serialize(req.extraGuarantors) : loan.ExtraGuarantorsJson;

                // 2. Map Borrower Entity
                if (loan.Borrower == null) loan.Borrower = new BorrowerInfo();
                var b = loan.Borrower;
                b.ApplicationNo = loan.ApplicationNo;
                b.ClientCode = loan.ClientCode;
                b.Photo = req.bPhoto ?? b.Photo;
                b.FullName = req.bNaav;
                b.Age = req.bVay;
                b.MemberNumber = req.bSabasadNo;
                b.SharesCount = req.bShares;
                b.SharesAmount = req.bSharesRakkam;
                b.FatherHusbandName = req.bVadilNaav;
                b.FatherHusbandAge = req.bVadilVay;
                b.MotherName = req.bAaiNaav;
                b.MotherAge = req.bAaiVay;
                b.ResidentialAddressLine1 = req.bPatta;
                b.ResidentialAddressLine2 = req.bPatta2;
                b.PinCode = req.bPinKod;
                b.Telephone = req.bDurdhvani;
                b.Mobile = req.bMobile;
                b.Email = req.bEmail;
                b.NatureOfResidence = JoinJsonArray(req.bJageSwaarup) ?? b.NatureOfResidence;
                b.DurationMonths = req.bKalavadhi_m;
                b.DurationYears = req.bKalavadhi_v;
                b.MaritalStatus = req.bVaivahik;
                b.DependentsCount = req.bAvalambun;
                b.CompanyName = req.bCompany;
                b.CompanyAddressLine1 = req.bCompanyPatta;
                b.CompanyAddressLine2 = req.bCompanyPatta2;
                b.CompanyPinCode = req.bCompanyPin;
                b.CompanyTelephone = req.bCompanyTel;
                b.CompanyMobile = req.bCompanyMobile;
                b.CompanyEmail = req.bCompanyEmail;
                b.Department = req.bVibhag;
                b.Designation = req.bHudda;
                b.EmployeeCode = req.bEmpCode;
                b.ServiceMonths = req.bKarj_m;
                b.ServiceYears = req.bKarj_v;
                b.EmploymentType = req.bEmpType;
                b.FamilyLoanBorrowerName = req.bKutumb95Naav;
                b.FamilyLoanType = req.bKutumb95Prakar;
                b.FamilyLoanAccountNo = req.bKutumb95Khate;
                b.FamilyLoanAmount = req.bKutumb95Rakkam;
                b.FamilyLoanTakenDate = req.bKutumb95Din1;
                b.FamilyLoanRepaymentDate = req.bKutumb95Din2;
                b.OfficeAddress = req.bOfficeAddress;
                b.GavchaAddress = req.bGavchaAddress;

                // Date Parsing
                b.ServiceDateDay = (req.bSeva?.Contains("-") == true) ? req.bSeva.Split('-')[2] : (req.bSeva_d ?? b.ServiceDateDay);
                b.ServiceDateMonth = (req.bSeva?.Contains("-") == true) ? req.bSeva.Split('-')[1] : (req.bSeva_m ?? b.ServiceDateMonth);
                b.ServiceDateYear = (req.bSeva?.Contains("-") == true) ? req.bSeva.Split('-')[0] : (req.bSeva_y ?? b.ServiceDateYear);

                b.MonthlySalary = req.bMonthlyVetan ?? b.MonthlySalary;
                b.TotalDeductions = req.bKapat ?? b.TotalDeductions;
                b.NetSalary = req.bNiwal ?? b.NetSalary;
                b.AnnualIncome = req.bVaarshik ?? b.AnnualIncome;
                b.TotalExpenses = req.bKharcha ?? b.TotalExpenses;
                b.NetAnnualIncome = req.bNiwalVaarshik ?? b.NetAnnualIncome;
                b.NetFamilyIncome = req.bKutumb ?? b.NetFamilyIncome;
                b.IncomeType = req.bKutumbType ?? b.IncomeType;
                b.PropertyOwnerName = req.bShetiNaav ?? b.PropertyOwnerName;
                b.RelationWithApplicant = req.bShetiNaate ?? b.RelationWithApplicant;
                b.VillageAddress = req.bGaavPatta ?? b.VillageAddress;
                b.VillageMukkam = req.bGaavMukkam ?? b.VillageMukkam;
                b.VillagePost = req.bGaavPost ?? b.VillagePost;
                b.VillageTaluka = req.bGaavTaluka ?? b.VillageTaluka;
                b.VillageDistrict = req.bGaavJilha ?? b.VillageDistrict;
                b.VillageState = req.bGaavRajya ?? b.VillageState;
                b.VillagePinCode = req.bGaavPin ?? b.VillagePinCode;
                b.VillageTelephone = req.bGaavDurdhvani ?? b.VillageTelephone;
                b.VillageMobile = req.bGaavMobile ?? b.VillageMobile;

                b.PreviousLoanType = req.bPurvKarjPrakar ?? b.PreviousLoanType;
                b.PreviousLoanAccountNo = req.bPurvKhate ?? b.PreviousLoanAccountNo;
                b.PreviousLoanAmount = req.bPurvRakkam ?? b.PreviousLoanAmount;
                b.PreviousLoanTakenDate = req.bPurvDin1 ?? b.PreviousLoanTakenDate;
                b.PreviousLoanRepaymentDate = req.bPurvDin2 ?? b.PreviousLoanRepaymentDate;

                b.GuaranteedLoan1BorrowerName = req.bJam94aKarjdarNaav ?? b.GuaranteedLoan1BorrowerName;
                b.GuaranteedLoan1Type = req.bJam94aPrakar ?? b.GuaranteedLoan1Type;
                b.GuaranteedLoan1AccountNo = req.bJam94aKhate ?? b.GuaranteedLoan1AccountNo;
                b.GuaranteedLoan1Amount = req.bJam94aRakkam ?? b.GuaranteedLoan1Amount;
                b.GuaranteedLoan1TakenDate = req.bJam94aDin1 ?? b.GuaranteedLoan1TakenDate;
                b.GuaranteedLoan1RepaymentDate = req.bJam94aDin2 ?? b.GuaranteedLoan1RepaymentDate;

                b.GuaranteedLoan2BorrowerName = req.bJam94bKarjdarNaav ?? b.GuaranteedLoan2BorrowerName;
                b.GuaranteedLoan2Type = req.bJam94bPrakar ?? b.GuaranteedLoan2Type;
                b.GuaranteedLoan2AccountNo = req.bJam94bKhate ?? b.GuaranteedLoan2AccountNo;
                b.GuaranteedLoan2Amount = req.bJam94bRakkam ?? b.GuaranteedLoan2Amount;
                b.GuaranteedLoan2TakenDate = req.bJam94bDin1 ?? b.GuaranteedLoan2TakenDate;
                b.GuaranteedLoan2RepaymentDate = req.bJam94bDin2 ?? b.GuaranteedLoan2RepaymentDate;

                b.OtherBankLoanInstitutionName = req.bBank96Naav ?? b.OtherBankLoanInstitutionName;
                b.OtherBankLoanBranchName = req.bBank96Shakha ?? b.OtherBankLoanBranchName;
                b.OtherBankLoanType = req.bBank96Prakar ?? b.OtherBankLoanType;
                b.OtherBankLoanAccountNo = req.bBank96Khate ?? b.OtherBankLoanAccountNo;
                b.OtherBankLoanAmount = req.bBank96Rakkam ?? b.OtherBankLoanAmount;
                b.OtherBankLoanTakenDate = req.bBank96Din1 ?? b.OtherBankLoanTakenDate;
                b.OtherBankLoanRepaymentDate = req.bBank96Din2 ?? b.OtherBankLoanRepaymentDate;
                b.Place = req.bThikan ?? b.Place;
                b.Date = req.bDinank ?? b.Date;
                b.AadharNo = req.bAadhar ?? b.AadharNo;
                b.Dob = req.bDob ?? b.Dob;
                b.PanNo = req.bPan ?? b.PanNo;

                // 3. Map Guarantor 1 Entity
                if (loan.Guarantor1 == null) loan.Guarantor1 = new Guarantor1Info();
                var g1 = loan.Guarantor1;
                g1.ApplicationNo = loan.ApplicationNo;
                g1.ClientCode = loan.ClientCode;
                g1.Photo = req.g1Photo ?? g1.Photo;
                g1.FullName = req.g1Naav;
                g1.Age = req.g1Vay;
                g1.MemberNumber = req.g1SabasadNo;
                g1.SharesCount = req.g1Shares;
                g1.SharesAmount = req.g1SharesRakkam;
                g1.FatherHusbandName = req.g1VadilNaav;
                g1.FatherHusbandAge = req.g1VadilVay;
                g1.MotherName = req.g1AaiNaav;
                g1.MotherAge = req.g1AaiVay;
                g1.ResidentialAddressLine1 = req.g1Patta;
                g1.ResidentialAddressLine2 = req.g1Patta2;
                g1.PinCode = req.g1PinKod;
                g1.Telephone = req.g1Durdhvani;
                g1.Mobile = req.g1Mobile;
                g1.Email = req.g1Email;
                g1.NatureOfResidence = JoinJsonArray(req.g1JageSwaarup) ?? g1.NatureOfResidence;
                g1.DurationMonths = req.g1Kalavadhi_m;
                g1.DurationYears = req.g1Kalavadhi_v;
                g1.MaritalStatus = req.g1Vaivahik;
                g1.DependentsCount = req.g1Avalambun;
                g1.CompanyName = req.g1Company;
                g1.CompanyAddressLine1 = req.g1CompanyPatta;
                g1.CompanyAddressLine2 = req.g1CompanyPatta2;
                g1.CompanyPinCode = req.g1CompanyPin;
                g1.CompanyTelephone = req.g1CompanyTel;
                g1.CompanyMobile = req.g1CompanyMobile;
                g1.CompanyEmail = req.g1CompanyEmail;
                g1.Department = req.g1Vibhag;
                g1.Designation = req.g1Hudda;
                g1.EmployeeCode = req.g1EmpCode;
                g1.ServiceMonths = req.g1Karj_m;
                g1.ServiceYears = req.g1Karj_v;
                g1.EmploymentType = req.g1EmpType;
                g1.FamilyLoanBorrowerName = req.g1Kutumb95Naav;
                g1.FamilyLoanType = req.g1Kutumb95Prakar;
                g1.FamilyLoanAccountNo = req.g1Kutumb95Khate;
                g1.FamilyLoanAmount = req.g1Kutumb95Rakkam;
                g1.FamilyLoanTakenDate = req.g1Kutumb95Din1;
                g1.FamilyLoanRepaymentDate = req.g1Kutumb95Din2;

                g1.ServiceDateDay = (req.g1Seva?.Contains("-") == true) ? req.g1Seva.Split('-')[2] : (req.g1Seva_d ?? g1.ServiceDateDay);
                g1.ServiceDateMonth = (req.g1Seva?.Contains("-") == true) ? req.g1Seva.Split('-')[1] : (req.g1Seva_m ?? g1.ServiceDateMonth);
                g1.ServiceDateYear = (req.g1Seva?.Contains("-") == true) ? req.g1Seva.Split('-')[0] : (req.g1Seva_y ?? g1.ServiceDateYear);

                g1.MonthlySalary = req.g1MonthlyVetan;
                g1.TotalDeductions = req.g1Kapat;
                g1.NetSalary = req.g1Niwal;
                g1.AnnualIncome = req.g1Vaarshik;
                g1.TotalExpenses = req.g1Kharcha;
                g1.NetAnnualIncome = req.g1NiwalVaarshik;
                g1.NetFamilyIncome = req.g1Kutumb;
                g1.IncomeType = req.g1KutumbType;
                g1.PropertyOwnerName = req.g1ShetiNaav;
                g1.RelationWithApplicant = req.g1ShetiNaate;
                g1.VillageAddress = req.g1GaavPatta;
                g1.VillageMukkam = req.g1GaavMukkam;
                g1.VillagePost = req.g1GaavPost;
                g1.VillageTaluka = req.g1GaavTaluka;
                g1.VillageDistrict = req.g1GaavJilha;
                g1.VillageState = req.g1GaavRajya;
                g1.VillagePinCode = req.g1GaavPin;
                g1.VillageTelephone = req.g1GaavDurdhvani;
                g1.VillageMobile = req.g1GaavMobile;

                g1.PreviousLoanType = req.g1PurvKarjPrakar;
                g1.PreviousLoanAccountNo = req.g1PurvKhate;
                g1.PreviousLoanAmount = req.g1PurvRakkam;
                g1.PreviousLoanTakenDate = req.g1PurvDin1;
                g1.PreviousLoanRepaymentDate = req.g1PurvDin2;

                g1.GuaranteedLoan1BorrowerName = req.g1Jam94aKarjdarNaav;
                g1.GuaranteedLoan1Type = req.g1Jam94aPrakar;
                g1.GuaranteedLoan1AccountNo = req.g1Jam94aKhate;
                g1.GuaranteedLoan1Amount = req.g1Jam94aRakkam;
                g1.GuaranteedLoan1TakenDate = req.g1Jam94aDin1;
                g1.GuaranteedLoan1RepaymentDate = req.g1Jam94aDin2;

                g1.GuaranteedLoan2BorrowerName = req.g1Jam94bKarjdarNaav;
                g1.GuaranteedLoan2Type = req.g1Jam94bPrakar;
                g1.GuaranteedLoan2AccountNo = req.g1Jam94bKhate;
                g1.GuaranteedLoan2Amount = req.g1Jam94bRakkam;
                g1.GuaranteedLoan2TakenDate = req.g1Jam94bDin1;
                g1.GuaranteedLoan2RepaymentDate = req.g1Jam94bDin2;

                g1.OtherBankLoanInstitutionName = req.g1Bank96Naav;
                g1.OtherBankLoanBranchName = req.g1Bank96Shakha;
                g1.OtherBankLoanType = req.g1Bank96Prakar;
                g1.OtherBankLoanAccountNo = req.g1Bank96Khate;
                g1.OtherBankLoanAmount = req.g1Bank96Rakkam;
                g1.OtherBankLoanTakenDate = req.g1Bank96Din1;
                g1.OtherBankLoanRepaymentDate = req.g1Bank96Din2;
                g1.Place = req.g1Thikan;
                g1.Date = req.g1Dinank;

                // 4. Map Guarantor 2 Entity
                if (loan.Guarantor2 == null) loan.Guarantor2 = new Guarantor2Info();
                var g2 = loan.Guarantor2;
                g2.ApplicationNo = loan.ApplicationNo;
                g2.ClientCode = loan.ClientCode;
                g2.Photo = req.g2Photo ?? g2.Photo;
                g2.FullName = req.g2Naav;
                g2.Age = req.g2Vay;
                g2.MemberNumber = req.g2SabasadNo;
                g2.SharesCount = req.g2Shares;
                g2.SharesAmount = req.g2SharesRakkam;
                g2.FatherHusbandName = req.g2VadilNaav;
                g2.FatherHusbandAge = req.g2VadilVay;
                g2.MotherName = req.g2AaiNaav;
                g2.MotherAge = req.g2AaiVay;
                g2.ResidentialAddressLine1 = req.g2Patta;
                g2.ResidentialAddressLine2 = req.g2Patta2;
                g2.PinCode = req.g2PinKod;
                g2.Telephone = req.g2Durdhvani;
                g2.Mobile = req.g2Mobile;
                g2.Email = req.g2Email;
                g2.NatureOfResidence = JoinJsonArray(req.g2JageSwaarup) ?? g2.NatureOfResidence;
                g2.DurationMonths = req.g2Kalavadhi_m;
                g2.DurationYears = req.g2Kalavadhi_v;
                g2.MaritalStatus = req.g2Vaivahik;
                g2.DependentsCount = req.g2Avalambun;
                g2.CompanyName = req.g2Company;
                g2.CompanyAddressLine1 = req.g2CompanyPatta;
                g2.CompanyAddressLine2 = req.g2CompanyPatta2;
                g2.CompanyPinCode = req.g2CompanyPin;
                g2.CompanyTelephone = req.g2CompanyTel;
                g2.CompanyMobile = req.g2CompanyMobile;
                g2.CompanyEmail = req.g2CompanyEmail;
                g2.Department = req.g2Vibhag;
                g2.Designation = req.g2Hudda;
                g2.EmployeeCode = req.g2EmpCode;
                g2.ServiceMonths = req.g2Karj_m;
                g2.ServiceYears = req.g2Karj_v;
                g2.EmploymentType = req.g2EmpType;
                g2.FamilyLoanBorrowerName = req.g2Kutumb95Naav;
                g2.FamilyLoanType = req.g2Kutumb95Prakar;
                g2.FamilyLoanAccountNo = req.g2Kutumb95Khate;
                g2.FamilyLoanAmount = req.g2Kutumb95Rakkam;
                g2.FamilyLoanTakenDate = req.g2Kutumb95Din1;
                g2.FamilyLoanRepaymentDate = req.g2Kutumb95Din2;

                g2.ServiceDateDay = (req.g2Seva?.Contains("-") == true) ? req.g2Seva.Split('-')[2] : (req.g2Seva_d ?? g2.ServiceDateDay);
                g2.ServiceDateMonth = (req.g2Seva?.Contains("-") == true) ? req.g2Seva.Split('-')[1] : (req.g2Seva_m ?? g2.ServiceDateMonth);
                g2.ServiceDateYear = (req.g2Seva?.Contains("-") == true) ? req.g2Seva.Split('-')[0] : (req.g2Seva_y ?? g2.ServiceDateYear);

                g2.MonthlySalary = req.g2MonthlyVetan ?? g2.MonthlySalary;
                g2.TotalDeductions = req.g2Kapat ?? g2.TotalDeductions;
                g2.NetSalary = req.g2Niwal ?? g2.NetSalary;
                g2.AnnualIncome = req.g2Vaarshik ?? g2.AnnualIncome;
                g2.TotalExpenses = req.g2Kharcha ?? g2.TotalExpenses;
                g2.NetAnnualIncome = req.g2NiwalVaarshik ?? g2.NetAnnualIncome;
                g2.NetFamilyIncome = req.g2Kutumb ?? g2.NetFamilyIncome;
                g2.IncomeType = req.g2KutumbType ?? g2.IncomeType;
                g2.PropertyOwnerName = req.g2ShetiNaav ?? g2.PropertyOwnerName;
                g2.RelationWithApplicant = req.g2ShetiNaate ?? g2.RelationWithApplicant;
                g2.VillageAddress = req.g2GaavPatta ?? g2.VillageAddress;
                g2.VillageMukkam = req.g2GaavMukkam ?? g2.VillageMukkam;
                g2.VillagePost = req.g2GaavPost ?? g2.VillagePost;
                g2.VillageTaluka = req.g2GaavTaluka ?? g2.VillageTaluka;
                g2.VillageDistrict = req.g2GaavJilha ?? g2.VillageDistrict;
                g2.VillageState = req.g2GaavRajya ?? g2.VillageState;
                g2.VillagePinCode = req.g2GaavPin ?? g2.VillagePinCode;
                g2.VillageTelephone = req.g2GaavDurdhvani ?? g2.VillageTelephone;
                g2.VillageMobile = req.g2GaavMobile;
                g2.PreviousLoanType = req.g2PurvKarjPrakar;
                g2.PreviousLoanAccountNo = req.g2PurvKhate;
                g2.PreviousLoanAmount = req.g2PurvRakkam;
                g2.PreviousLoanTakenDate = req.g2PurvDin1;
                g2.PreviousLoanRepaymentDate = req.g2PurvDin2;

                g2.GuaranteedLoan1BorrowerName = req.g2Jam94aKarjdarNaav;
                g2.GuaranteedLoan1Type = req.g2Jam94aPrakar;
                g2.GuaranteedLoan1AccountNo = req.g2Jam94aKhate;
                g2.GuaranteedLoan1Amount = req.g2Jam94aRakkam;
                g2.GuaranteedLoan1TakenDate = req.g2Jam94aDin1;
                g2.GuaranteedLoan1RepaymentDate = req.g2Jam94aDin2;

                g2.GuaranteedLoan2BorrowerName = req.g2Jam94bKarjdarNaav;
                g2.GuaranteedLoan2Type = req.g2Jam94bPrakar;
                g2.GuaranteedLoan2AccountNo = req.g2Jam94bKhate;
                g2.GuaranteedLoan2Amount = req.g2Jam94bRakkam;
                g2.GuaranteedLoan2TakenDate = req.g2Jam94bDin1;
                g2.GuaranteedLoan2RepaymentDate = req.g2Jam94bDin2;

                g2.OtherBankLoanInstitutionName = req.g2Bank96Naav;
                g2.OtherBankLoanBranchName = req.g2Bank96Shakha;
                g2.OtherBankLoanType = req.g2Bank96Prakar;
                g2.OtherBankLoanAccountNo = req.g2Bank96Khate;
                g2.OtherBankLoanAmount = req.g2Bank96Rakkam;
                g2.OtherBankLoanTakenDate = req.g2Bank96Din1;
                g2.OtherBankLoanRepaymentDate = req.g2Bank96Din2;
                g2.Place = req.g2Thikan;
                g2.Date = req.g2Dinank;

                // 5. Map Office Entity
                if (loan.Office == null) loan.Office = new OfficeInfo();
                var o = loan.Office;
                o.ApplicationNo = loan.ApplicationNo;
                o.ClientCode = loan.ClientCode;
                o.Place = req.thikan;
                o.ApplicationDay = req.dinank_d;
                o.ApplicationMonth = req.dinank_m;
                o.ApplicationYear = req.dinank_y;
                o.MemberAccountNumber = req.saCra ?? req.sabasadCrNo;
                o.NiyamApplicantName = req.niyamArjdarNaav;
                o.NiyamGuarantor1Name = req.niyamJam1Naav;
                o.NiyamGuarantor2Name = req.niyamJam2Naav;
                o.NiyamGuarantor3Name = req.niyamJam3Naav;
                o.NiyamPlace = req.niyamTikaan;
                o.NiyamDate = req.niyamDinank;
                o.OfficeApplicantName = req.officeArjdarNaav;
                o.OfficeApplicationNumber = req.officeArjCr;
                o.OfficeRemark = req.officeKaran;
                o.OfficeDate = req.officeDinank;

                loan.UpdatedAt = DateTime.Now;
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetLoan), new { id = loan.Id }, FlattenLoan(loan));
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/PersonalLoan/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLoan(int id)
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();

            var loan = await _context.PersonalLoans.FindAsync(id);
            if (loan == null) return NotFound();

            if (userRole != "SUPER_ADMIN" && loan.ClientCode != userClientCode)
                return Unauthorized(new { message = "You do not have permission to delete this record." });

            _context.PersonalLoans.Remove(loan);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // Helper to flatten the relational structure for the frontend print component
        private object FlattenLoan(PersonalLoan loan)
        {
            var r = new Dictionary<string, object>();
            if (loan == null) return r;

            // Step 1: Core Fields (Retaining frontend keys for compatibility)
            r["id"] = loan.Id;
            r["applicationNo"] = loan.ApplicationNo ?? "";
            r["clientCode"] = loan.ClientCode ?? "";
            r["dinank"] = loan.ApplicationDate ?? "";
            r["sabasadCrNo"] = loan.MemberNumber ?? "";
            r["karjKhate"] = loan.LoanAccountNumber ?? "";
            r["shakha"] = loan.BranchName ?? "";
            r["arjdarNaav"] = loan.ApplicantName ?? "";
            r["arjdarVay"] = loan.Age ?? 0;
            r["karjRakkam"] = loan.LoanAmount ?? 0;
            r["akshari"] = loan.AmountInWords ?? "";
            r["paratfedKalavadhi"] = loan.RepaymentPeriodMonths ?? 0;
            r["pahilaHapta"] = loan.FirstInstallmentAfterMonths ?? 0;
            r["tarikh"] = loan.InstallmentDay ?? 0;
            r["karan"] = loan.LoanPurpose ?? "";
            r["vyajDar"] = loan.InterestRate ?? 0;
            r["vaivahik"] = loan.MaritalStatus ?? "";
            r["avalambun"] = loan.DependentsCount ?? 0;
            r["jameen1Naav"] = loan.Guarantor1NameSummary ?? "";
            r["jameen1Vay"] = loan.Guarantor1AgeSummary ?? 0;
            r["jameen2Naav"] = loan.Guarantor2NameSummary ?? "";
            r["jameen2Vay"] = loan.Guarantor2AgeSummary ?? 0;
            r["jameen3Naav"] = loan.Guarantor3NameSummary ?? "";
            r["jameen3Vay"] = loan.Guarantor3AgeSummary ?? 0;
            r["saharjdarNaav"] = loan.CoApplicantName ?? "";
            r["saharjdarVay"] = loan.CoApplicantAge ?? 0;
            r["extraGuarantors"] = loan.ExtraGuarantorsJson ?? "[]";
            r["createdAt"] = loan.CreatedAt;

            // Step 2: Borrower
            if (loan.Borrower != null)
            {
                var b = loan.Borrower;
                r["bPhoto"] = b.Photo ?? "";
                r["bNaav"] = b.FullName ?? "";
                r["bVay"] = b.Age ?? 0;
                r["bSabasadNo"] = b.MemberNumber ?? "";
                r["bShares"] = b.SharesCount ?? 0;
                r["bSharesRakkam"] = b.SharesAmount ?? 0;
                r["bVadilNaav"] = b.FatherHusbandName ?? "";
                r["bVadilVay"] = b.FatherHusbandAge ?? 0;
                r["bAaiNaav"] = b.MotherName ?? "";
                r["bAaiVay"] = b.MotherAge ?? 0;
                r["bPatta"] = b.ResidentialAddressLine1 ?? "";
                r["bPatta2"] = b.ResidentialAddressLine2 ?? "";
                r["bPinKod"] = b.PinCode ?? "";
                r["bDurdhvani"] = b.Telephone ?? "";
                r["bMobile"] = b.Mobile ?? "";
                r["bEmail"] = b.Email ?? "";
                r["bJageSwaarup"] = b.NatureOfResidence ?? "";
                r["bKalavadhi_m"] = b.DurationMonths;
                r["bKalavadhi_v"] = b.DurationYears;
                r["bVaivahik"] = b.MaritalStatus ?? "";
                r["bAvalambun"] = b.DependentsCount;
                r["bCompany"] = b.CompanyName ?? "";
                r["bCompanyPatta"] = b.CompanyAddressLine1 ?? "";
                r["bCompanyPatta2"] = b.CompanyAddressLine2 ?? "";
                r["bCompanyPin"] = b.CompanyPinCode ?? "";
                r["bCompanyTel"] = b.CompanyTelephone ?? "";
                r["bCompanyMobile"] = b.CompanyMobile ?? "";
                r["bCompanyEmail"] = b.CompanyEmail ?? "";
                r["bVibhag"] = b.Department ?? "";
                r["bHudda"] = b.Designation ?? "";
                r["bEmpCode"] = b.EmployeeCode ?? "";
                r["bKarj_m"] = b.ServiceMonths;
                r["bKarj_v"] = b.ServiceYears;
                r["bSeva_d"] = b.ServiceDateDay ?? "";
                r["bSeva_m"] = b.ServiceDateMonth ?? "";
                r["bSeva_y"] = b.ServiceDateYear ?? "";
                r["bMonthlyVetan"] = b.MonthlySalary;
                r["bKapat"] = b.TotalDeductions;
                r["bNiwal"] = b.NetSalary;
                r["bVaarshik"] = b.AnnualIncome;
                r["bKharcha"] = b.TotalExpenses;
                r["bNiwalVaarshik"] = b.NetAnnualIncome;
                r["bKutumb"] = b.NetFamilyIncome;
                r["bKutumbType"] = b.IncomeType ?? "";
                r["bShetiNaav"] = b.PropertyOwnerName ?? "";
                r["bShetiNaate"] = b.RelationWithApplicant ?? "";
                r["bGaavPatta"] = b.VillageAddress ?? "";
                r["bGaavMukkam"] = b.VillageMukkam ?? "";
                r["bGaavPost"] = b.VillagePost ?? "";
                r["bGaavTaluka"] = b.VillageTaluka ?? "";
                r["bGaavJilha"] = b.VillageDistrict ?? "";
                r["bGaavRajya"] = b.VillageState ?? "";
                r["bGaavPin"] = b.VillagePinCode ?? "";
                r["bGaavDurdhvani"] = b.VillageTelephone ?? "";
                r["bGaavMobile"] = b.VillageMobile ?? "";
                r["bPurvKarjPrakar"] = b.PreviousLoanType ?? "";
                r["bPurvKhate"] = b.PreviousLoanAccountNo ?? "";
                r["bPurvRakkam"] = b.PreviousLoanAmount;
                r["bPurvDin1"] = b.PreviousLoanTakenDate ?? "";
                r["bPurvDin2"] = b.PreviousLoanRepaymentDate ?? "";
                r["bJam94aKarjdarNaav"] = b.GuaranteedLoan1BorrowerName ?? "";
                r["bJam94aPrakar"] = b.GuaranteedLoan1Type ?? "";
                r["bJam94aKhate"] = b.GuaranteedLoan1AccountNo ?? "";
                r["bJam94aRakkam"] = b.GuaranteedLoan1Amount;
                r["bJam94aDin1"] = b.GuaranteedLoan1TakenDate ?? "";
                r["bJam94aDin2"] = b.GuaranteedLoan1RepaymentDate ?? "";
                r["bJam94bKarjdarNaav"] = b.GuaranteedLoan2BorrowerName ?? "";
                r["bJam94bPrakar"] = b.GuaranteedLoan2Type ?? "";
                r["bJam94bKhate"] = b.GuaranteedLoan2AccountNo ?? "";
                r["bJam94bRakkam"] = b.GuaranteedLoan2Amount;
                r["bJam94bDin1"] = b.GuaranteedLoan2TakenDate ?? "";
                r["bJam94bDin2"] = b.GuaranteedLoan2RepaymentDate ?? "";
                r["bBank96Naav"] = b.OtherBankLoanInstitutionName ?? "";
                r["bBank96Shakha"] = b.OtherBankLoanBranchName ?? "";
                r["bBank96Prakar"] = b.OtherBankLoanType ?? "";
                r["bBank96Rakkam"] = b.OtherBankLoanAmount;
                r["bBank96Din1"] = b.OtherBankLoanTakenDate ?? "";
                r["bBank96Din2"] = b.OtherBankLoanRepaymentDate ?? "";
                r["bThikan"] = b.Place ?? "";
                r["bDinank"] = string.IsNullOrEmpty(b.Date) ? (loan.ApplicationDate ?? "") : b.Date;
                r["bEmpType"] = b.EmploymentType ?? "नोकरी";
                r["bSeva"] = (string.IsNullOrEmpty(b.ServiceDateYear) || string.IsNullOrEmpty(b.ServiceDateMonth) || string.IsNullOrEmpty(b.ServiceDateDay)) 
                    ? "" : $"{b.ServiceDateYear}-{b.ServiceDateMonth}-{b.ServiceDateDay}";
                r["bKutumb95Naav"] = b.FamilyLoanBorrowerName ?? "";
                r["bKutumb95Prakar"] = b.FamilyLoanType ?? "";
                r["bKutumb95Khate"] = b.FamilyLoanAccountNo ?? "";
                r["bKutumb95Rakkam"] = b.FamilyLoanAmount;
                r["bKutumb95Din1"] = b.FamilyLoanTakenDate ?? "";
                r["bKutumb95Din2"] = b.FamilyLoanRepaymentDate ?? "";

                // KYC Fields
                r["bAadhar"] = b.AadharNo ?? "";
                r["bDob"] = b.Dob ?? "";
                r["bPan"] = b.PanNo ?? "";
                r["bOfficeAddress"] = b.OfficeAddress ?? "";
                r["bGavchaAddress"] = b.GavchaAddress ?? "";
            }

            // Step 3: Guarantor 1
            if (loan.Guarantor1 != null)
            {
                var g = loan.Guarantor1;
                r["g1Photo"] = g.Photo ?? "";
                r["g1Naav"] = g.FullName ?? "";
                r["g1Vay"] = g.Age ?? 0;
                r["g1SabasadNo"] = g.MemberNumber ?? "";
                r["g1Shares"] = g.SharesCount ?? 0;
                r["g1SharesRakkam"] = g.SharesAmount ?? 0;
                r["g1VadilNaav"] = g.FatherHusbandName ?? "";
                r["g1VadilVay"] = g.FatherHusbandAge ?? 0;
                r["g1AaiNaav"] = g.MotherName ?? "";
                r["g1AaiVay"] = g.MotherAge ?? 0;
                r["g1Patta"] = g.ResidentialAddressLine1 ?? "";
                r["g1Patta2"] = g.ResidentialAddressLine2 ?? "";
                r["g1PinKod"] = g.PinCode ?? "";
                r["g1Durdhvani"] = g.Telephone ?? "";
                r["g1Mobile"] = g.Mobile ?? "";
                r["g1Email"] = g.Email ?? "";
                r["g1JageSwaarup"] = g.NatureOfResidence ?? "";
                r["g1Kalavadhi_m"] = g.DurationMonths;
                r["g1Kalavadhi_v"] = g.DurationYears;
                r["g1Vaivahik"] = g.MaritalStatus ?? "";
                r["g1Avalambun"] = g.DependentsCount;
                r["g1Company"] = g.CompanyName ?? "";
                r["g1CompanyPatta"] = g.CompanyAddressLine1 ?? "";
                r["g1CompanyPatta2"] = g.CompanyAddressLine2 ?? "";
                r["g1CompanyPin"] = g.CompanyPinCode ?? "";
                r["g1CompanyTel"] = g.CompanyTelephone ?? "";
                r["g1CompanyMobile"] = g.CompanyMobile ?? "";
                r["g1CompanyEmail"] = g.CompanyEmail ?? "";
                r["g1Vibhag"] = g.Department ?? "";
                r["g1Hudda"] = g.Designation ?? "";
                r["g1EmpCode"] = g.EmployeeCode ?? "";
                r["g1Karj_m"] = g.ServiceMonths;
                r["g1Karj_v"] = g.ServiceYears;
                r["g1Seva_d"] = g.ServiceDateDay ?? "";
                r["g1Seva_m"] = g.ServiceDateMonth ?? "";
                r["g1Seva_y"] = g.ServiceDateYear ?? "";
                r["g1MonthlyVetan"] = g.MonthlySalary;
                r["g1Kapat"] = g.TotalDeductions;
                r["g1Niwal"] = g.NetSalary;
                r["g1Vaarshik"] = g.AnnualIncome;
                r["g1Kharcha"] = g.TotalExpenses;
                r["g1NiwalVaarshik"] = g.NetAnnualIncome;
                r["g1Kutumb"] = g.NetFamilyIncome;
                r["g1KutumbType"] = g.IncomeType ?? "";
                r["g1ShetiNaav"] = g.PropertyOwnerName ?? "";
                r["g1ShetiNaate"] = g.RelationWithApplicant ?? "";
                r["g1GaavPatta"] = g.VillageAddress ?? "";
                r["g1GaavMukkam"] = g.VillageMukkam ?? "";
                r["g1GaavPost"] = g.VillagePost ?? "";
                r["g1GaavTaluka"] = g.VillageTaluka ?? "";
                r["g1GaavJilha"] = g.VillageDistrict ?? "";
                r["g1GaavRajya"] = g.VillageState ?? "";
                r["g1GaavPin"] = g.VillagePinCode ?? "";
                r["g1GaavDurdhvani"] = g.VillageTelephone ?? "";
                r["g1GaavMobile"] = g.VillageMobile ?? "";
                r["g1PurvKarjPrakar"] = g.PreviousLoanType ?? "";
                r["g1PurvKhate"] = g.PreviousLoanAccountNo ?? "";
                r["g1PurvRakkam"] = g.PreviousLoanAmount;
                r["g1PurvDin1"] = g.PreviousLoanTakenDate ?? "";
                r["g1PurvDin2"] = g.PreviousLoanRepaymentDate ?? "";
                r["g1Jam94aKarjdarNaav"] = g.GuaranteedLoan1BorrowerName ?? "";
                r["g1Jam94aPrakar"] = g.GuaranteedLoan1Type ?? "";
                r["g1Jam94aKhate"] = g.GuaranteedLoan1AccountNo ?? "";
                r["g1Jam94aRakkam"] = g.GuaranteedLoan1Amount;
                r["g1Jam94aDin1"] = g.GuaranteedLoan1TakenDate ?? "";
                r["g1Jam94aDin2"] = g.GuaranteedLoan1RepaymentDate ?? "";
                r["g1Jam94bKarjdarNaav"] = g.GuaranteedLoan2BorrowerName ?? "";
                r["g1Jam94bPrakar"] = g.GuaranteedLoan2Type ?? "";
                r["g1Jam94bKhate"] = g.GuaranteedLoan2AccountNo ?? "";
                r["g1Jam94bRakkam"] = g.GuaranteedLoan2Amount;
                r["g1Jam94bDin1"] = g.GuaranteedLoan2TakenDate ?? "";
                r["g1Jam94bDin2"] = g.GuaranteedLoan2RepaymentDate ?? "";
                r["g1Bank96Naav"] = g.OtherBankLoanInstitutionName ?? "";
                r["g1Bank96Shakha"] = g.OtherBankLoanBranchName ?? "";
                r["g1Bank96Prakar"] = g.OtherBankLoanType ?? "";
                r["g1Bank96Khate"] = g.OtherBankLoanAccountNo ?? "";
                r["g1Bank96Rakkam"] = g.OtherBankLoanAmount;
                r["g1Bank96Din1"] = g.OtherBankLoanTakenDate ?? "";
                r["g1Bank96Din2"] = g.OtherBankLoanRepaymentDate ?? "";
                r["g1Thikan"] = g.Place ?? "";
                r["g1Dinank"] = string.IsNullOrEmpty(g.Date) ? (loan.ApplicationDate ?? "") : g.Date;
                r["g1EmpType"] = g.EmploymentType ?? "नोकरी";
                r["g1Seva"] = (string.IsNullOrEmpty(g.ServiceDateYear) || string.IsNullOrEmpty(g.ServiceDateMonth) || string.IsNullOrEmpty(g.ServiceDateDay)) 
                    ? "" : $"{g.ServiceDateYear}-{g.ServiceDateMonth}-{g.ServiceDateDay}";
                r["g1Kutumb95Naav"] = g.FamilyLoanBorrowerName ?? "";
                r["g1Kutumb95Prakar"] = g.FamilyLoanType ?? "";
                r["g1Kutumb95Khate"] = g.FamilyLoanAccountNo ?? "";
                r["g1Kutumb95Rakkam"] = g.FamilyLoanAmount;
                r["g1Kutumb95Din1"] = g.FamilyLoanTakenDate ?? "";
                r["g1Kutumb95Din2"] = g.FamilyLoanRepaymentDate ?? "";
            }

            // Step 4: Guarantor 2
            if (loan.Guarantor2 != null)
            {
                var g = loan.Guarantor2;
                r["g2Photo"] = g.Photo ?? "";
                r["g2Naav"] = g.FullName ?? "";
                r["g2Vay"] = g.Age ?? 0;
                r["g2SabasadNo"] = g.MemberNumber ?? "";
                r["g2Shares"] = g.SharesCount ?? 0;
                r["g2SharesRakkam"] = g.SharesAmount ?? 0;
                r["g2VadilNaav"] = g.FatherHusbandName ?? "";
                r["g2VadilVay"] = g.FatherHusbandAge ?? 0;
                r["g2AaiNaav"] = g.MotherName ?? "";
                r["g2AaiVay"] = g.MotherAge ?? 0;
                r["g2Patta"] = g.ResidentialAddressLine1 ?? "";
                r["g2Patta2"] = g.ResidentialAddressLine2 ?? "";
                r["g2PinKod"] = g.PinCode ?? "";
                r["g2Durdhvani"] = g.Telephone ?? "";
                r["g2Mobile"] = g.Mobile ?? "";
                r["g2Email"] = g.Email ?? "";
                r["g2JageSwaarup"] = g.NatureOfResidence ?? "";
                r["g2Kalavadhi_m"] = g.DurationMonths;
                r["g2Kalavadhi_v"] = g.DurationYears;
                r["g2Vaivahik"] = g.MaritalStatus ?? "";
                r["g2Avalambun"] = g.DependentsCount;
                r["g2Company"] = g.CompanyName ?? "";
                r["g2CompanyPatta"] = g.CompanyAddressLine1 ?? "";
                r["g2CompanyPatta2"] = g.CompanyAddressLine2 ?? "";
                r["g2CompanyPin"] = g.CompanyPinCode ?? "";
                r["g2CompanyTel"] = g.CompanyTelephone ?? "";
                r["g2CompanyMobile"] = g.CompanyMobile ?? "";
                r["g2CompanyEmail"] = g.CompanyEmail ?? "";
                r["g2Vibhag"] = g.Department ?? "";
                r["g2Hudda"] = g.Designation ?? "";
                r["g2EmpCode"] = g.EmployeeCode ?? "";
                r["g2Karj_m"] = g.ServiceMonths;
                r["g2Karj_v"] = g.ServiceYears;
                r["g2Seva_d"] = g.ServiceDateDay ?? "";
                r["g2Seva_m"] = g.ServiceDateMonth ?? "";
                r["g2Seva_y"] = g.ServiceDateYear ?? "";
                r["g2MonthlySalary"] = g.MonthlySalary;
                r["g2TotalDeductions"] = g.TotalDeductions;
                r["g2NetSalary"] = g.NetSalary;
                r["g2AnnualIncome"] = g.AnnualIncome;
                r["g2TotalExpenses"] = g.TotalExpenses;
                r["g2NetAnnualIncome"] = g.NetAnnualIncome;
                r["g2NetFamilyIncome"] = g.NetFamilyIncome;
                r["g2IncomeType"] = g.IncomeType ?? "";
                r["g2PropertyOwnerName"] = g.PropertyOwnerName ?? "";
                r["g2RelationWithApplicant"] = g.RelationWithApplicant ?? "";
                r["g2GaavPatta"] = g.VillageAddress ?? "";
                r["g2GaavMukkam"] = g.VillageMukkam ?? "";
                r["g2GaavPost"] = g.VillagePost ?? "";
                r["g2GaavTaluka"] = g.VillageTaluka ?? "";
                r["g2GaavJilha"] = g.VillageDistrict ?? "";
                r["g2GaavRajya"] = g.VillageState ?? "";
                r["g2GaavPin"] = g.VillagePinCode ?? "";
                r["g2GaavDurdhvani"] = g.VillageTelephone ?? "";
                r["g2GaavMobile"] = g.VillageMobile ?? "";
                r["g2PurvKarjPrakar"] = g.PreviousLoanType ?? "";
                r["g2PurvKhate"] = g.PreviousLoanAccountNo ?? "";
                r["g2PurvRakkam"] = g.PreviousLoanAmount;
                r["g2PurvDin1"] = g.PreviousLoanTakenDate ?? "";
                r["g2PurvDin2"] = g.PreviousLoanRepaymentDate ?? "";
                r["g2Jam94aKarjdarNaav"] = g.GuaranteedLoan1BorrowerName ?? "";
                r["g2Jam94aPrakar"] = g.GuaranteedLoan1Type ?? "";
                r["g2Jam94aKhate"] = g.GuaranteedLoan1AccountNo ?? "";
                r["g2Jam94aRakkam"] = g.GuaranteedLoan1Amount;
                r["g2Jam94aDin1"] = g.GuaranteedLoan1TakenDate ?? "";
                r["g2Jam94aDin2"] = g.GuaranteedLoan1RepaymentDate ?? "";
                r["g2Jam94bKarjdarNaav"] = g.GuaranteedLoan2BorrowerName ?? "";
                r["g2Jam94bPrakar"] = g.GuaranteedLoan2Type ?? "";
                r["g2Jam94bKhate"] = g.GuaranteedLoan2AccountNo ?? "";
                r["g2Jam94bRakkam"] = g.GuaranteedLoan2Amount;
                r["g2Jam94bDin1"] = g.GuaranteedLoan2TakenDate ?? "";
                r["g2Jam94bDin2"] = g.GuaranteedLoan2RepaymentDate ?? "";
                r["g2Bank96Naav"] = g.OtherBankLoanInstitutionName ?? "";
                r["g2Bank96Shakha"] = g.OtherBankLoanBranchName ?? "";
                r["g2Bank96Prakar"] = g.OtherBankLoanType ?? "";
                r["g2Bank96Khate"] = g.OtherBankLoanAccountNo ?? "";
                r["g2Bank96Rakkam"] = g.OtherBankLoanAmount;
                r["g2Bank96Din1"] = g.OtherBankLoanTakenDate ?? "";
                r["g2Bank96Din2"] = g.OtherBankLoanRepaymentDate ?? "";
                r["g2Thikan"] = g.Place ?? "";
                r["g2Dinank"] = string.IsNullOrEmpty(g.Date) ? (loan.ApplicationDate ?? "") : g.Date;
                r["g2EmpType"] = g.EmploymentType ?? "नोकरी";
                r["g2Seva"] = (string.IsNullOrEmpty(g.ServiceDateYear) || string.IsNullOrEmpty(g.ServiceDateMonth) || string.IsNullOrEmpty(g.ServiceDateDay)) 
                    ? "" : $"{g.ServiceDateYear}-{g.ServiceDateMonth}-{g.ServiceDateDay}";
                r["g2Kutumb95Naav"] = g.FamilyLoanBorrowerName ?? "";
                r["g2Kutumb95Prakar"] = g.FamilyLoanType ?? "";
                r["g2Kutumb95Khate"] = g.FamilyLoanAccountNo ?? "";
                r["g2Kutumb95Rakkam"] = g.FamilyLoanAmount;
                r["g2Kutumb95Din1"] = g.FamilyLoanTakenDate ?? "";
                r["g2Kutumb95Din2"] = g.FamilyLoanRepaymentDate ?? "";
            }

            // Step 5: Office Use
            if (loan.Office != null)
            {
                var o = loan.Office;
                r["thikan"] = o.Place ?? "";
                r["dinank_d"] = o.ApplicationDay ?? "";
                r["dinank_m"] = o.ApplicationMonth ?? "";
                r["dinank_y"] = o.ApplicationYear ?? "";
                r["niyamArjdarNaav"] = o.NiyamApplicantName ?? "";
                r["niyamJam1Naav"] = o.NiyamGuarantor1Name ?? "";
                r["niyamJam2Naav"] = o.NiyamGuarantor2Name ?? "";
                r["niyamJam3Naav"] = o.NiyamGuarantor3Name ?? "";
                r["niyamTikaan"] = o.NiyamPlace ?? "";
                r["niyamDinank"] = o.NiyamDate ?? "";
                r["officeArjdarNaav"] = o.OfficeApplicantName ?? "";
                r["officeArjCr"] = o.OfficeApplicationNumber ?? "";
                r["officeKaran"] = o.OfficeRemark ?? "";
                r["officeDinank"] = o.OfficeDate ?? "";
            }

            return r;
        }
    }
}