using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using TushGptBackend.Data;
using TushGptBackend.Dtos.VehicleLoan;
using TushGptBackend.Models;

namespace TushGptBackend.Controllers
{
    [ApiController]
    [Route("api/vehicle-loan")]
    [Authorize]
    public class VehicleLoanController : ControllerBase
    {
        private readonly AppDbContext _db;

        public VehicleLoanController(AppDbContext db)
        {
            _db = db;
        }

        private string GetClientCode() =>
            HttpContext.Items["ClientCode"]?.ToString() ?? "";

        // POST /api/vehicle-loan/draft
        [HttpPost("draft")]
        public async Task<IActionResult> SaveDraft([FromBody] VehicleLoanDraftDto dto)
        {
            var clientCode = GetClientCode();
            var app = BuildApplication(dto, clientCode, "DRAFT");
            _db.VehicleLoanApplications.Add(app);
            await _db.SaveChangesAsync();
            return Ok(new { success = true, id = app.Id, message = "Draft saved successfully." });
        }

        // PUT /api/vehicle-loan/draft/{id}
        [HttpPut("draft/{id}")]
        public async Task<IActionResult> UpdateDraft(int id, [FromBody] VehicleLoanDraftDto dto)
        {
            var clientCode = GetClientCode();
            var existing = await _db.VehicleLoanApplications
                .Include(a => a.Borrower)
                .Include(a => a.Guarantors)
                .Include(a => a.ExtraGuarantors)
                .Include(a => a.NewVehicle)
                .Include(a => a.OldVehicle)
                .Include(a => a.Insurance)
                .Include(a => a.BusinessInfo)
                .Include(a => a.TaxDetails)
                .FirstOrDefaultAsync(a => a.Id == id && a.ClientCode == clientCode);

            if (existing == null)
                return NotFound(new { success = false, message = "Draft not found." });

            // if (existing.Status != "DRAFT")
            //    return BadRequest(new { success = false, message = "Only DRAFT applications can be updated." });

            RemoveChildRecords(existing);
            await _db.SaveChangesAsync(); 

            MapBasicFields(existing, dto);
            existing.UpdatedAt = DateTime.UtcNow;
            AddChildRecords(existing, dto);

            await _db.SaveChangesAsync();
            return Ok(new { success = true, id = existing.Id, message = "Draft updated." });
        }

        // POST /api/vehicle-loan/submit
        [HttpPost("submit")]
        public async Task<IActionResult> Submit([FromBody] VehicleLoanSubmitDto dto)
        {
            var clientCode = GetClientCode();
            var appNo = GenerateApplicationNo();
            var app = BuildApplication(dto, clientCode, "SUBMITTED", appNo);
            _db.VehicleLoanApplications.Add(app);
            await _db.SaveChangesAsync();
            return Ok(new { success = true, id = app.Id, applicationNo = app.ApplicationNo, message = "Application submitted successfully." });
        }

        // POST /api/vehicle-loan/submit/{draftId}
        [HttpPost("submit/{draftId}")]
        public async Task<IActionResult> SubmitDraft(int draftId, [FromBody] VehicleLoanSubmitDto dto)
        {
            var clientCode = GetClientCode();
            var existing = await _db.VehicleLoanApplications
                .Include(a => a.Borrower)
                .Include(a => a.Guarantors)
                .Include(a => a.ExtraGuarantors)
                .Include(a => a.NewVehicle)
                .Include(a => a.OldVehicle)
                .Include(a => a.Insurance)
                .Include(a => a.BusinessInfo)
                .Include(a => a.TaxDetails)
                .FirstOrDefaultAsync(a => a.Id == draftId && a.ClientCode == clientCode);

            if (existing == null)
                return NotFound(new { success = false, message = "Draft not found." });

            try {
                RemoveChildRecords(existing);
                await _db.SaveChangesAsync();

                MapBasicFields(existing, dto);
                existing.Status = "SUBMITTED";
                existing.UpdatedAt = DateTime.UtcNow;

                if (string.IsNullOrEmpty(existing.ApplicationNo))
                    existing.ApplicationNo = GenerateApplicationNo();

                AddChildRecords(existing, dto, existing.ApplicationNo);

                await _db.SaveChangesAsync();
                return Ok(new { success = true, id = existing.Id, applicationNo = existing.ApplicationNo, message = "Application submitted successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message, detail = ex.ToString() });
            }
        }

        // GET /api/vehicle-loan/stats
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var clientCode = GetClientCode();
            var query = _db.VehicleLoanApplications.Where(a => a.ClientCode == clientCode);

            var list = await query.Select(a => new { a.KarjRakkam, a.Status, a.CreatedAt }).ToListAsync();
            
            var totalVolume = list.Sum(a => {
                decimal.TryParse(a.KarjRakkam, out decimal val);
                return val;
            });

            var stats = new
            {
                totalApplications = list.Count,
                pendingApplications = list.Count(a => a.Status == "SUBMITTED"),
                approvedVolume = totalVolume, // Simplification
                todayCount = list.Count(a => a.CreatedAt >= DateTime.Today)
            };

            return Ok(stats);
        }

        // GET /api/vehicle-loan
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? status,
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            var clientCode = GetClientCode();
            var query = _db.VehicleLoanApplications
                .Include(a => a.Borrower)
                .Where(a => a.ClientCode == clientCode)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
                query = query.Where(a => a.Status == status.ToUpper());

            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                query = query.Where(a =>
                    (a.ArjdarNaav != null && a.ArjdarNaav.ToLower().Contains(search)) ||
                    (a.KarjKhate != null && a.KarjKhate.ToLower().Contains(search)) ||
                    (a.ApplicationNo != null && a.ApplicationNo.ToLower().Contains(search)));
            }

            var total = await query.CountAsync();
            var items = await query
                .OrderByDescending(a => a.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new VehicleLoanListItemDto
                {
                    Id = a.Id,
                    ClientCode = a.ClientCode,
                    ArjdarNaav = a.ArjdarNaav,
                    KarjRakkam = a.KarjRakkam,
                    Shakha = a.Shakha,
                    Status = a.Status,
                    Dinank = a.Dinank,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt,
                    BorrowerMobile = a.Borrower != null ? a.Borrower.Mobile : null
                })
                .ToListAsync();

            return Ok(new
            {
                success = true,
                total,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling(total / (double)pageSize),
                data = items
            });
        }

        // GET /api/vehicle-loan/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var clientCode = GetClientCode();
            try
            {
                Console.WriteLine("--> Starting DB Query for Vehicle Loan ID: " + id);
                var app = await _db.VehicleLoanApplications
                    .Include(a => a.Borrower)
                    .Include(a => a.Guarantors)
                    .Include(a => a.ExtraGuarantors)
                    .Include(a => a.NewVehicle)
                    .Include(a => a.OldVehicle)
                    .Include(a => a.Insurance)
                    .Include(a => a.BusinessInfo)
                    .Include(a => a.TaxDetails)
                    .FirstOrDefaultAsync(a => a.Id == id); // Temporarily bypassed ClientCode check

                if (app == null) {
                    Console.WriteLine($"--> Application NOT FOUND (ID: {id}, ClientCode: {clientCode})");
                    return NotFound(new { success = false, message = "Application not found." });
                }

                Console.WriteLine("--> Query Success. Starting Mapping...");
                var mappedData = MapToDetailDto(app);
                Console.WriteLine("--> Mapping Success. Returning OK.");

                return Ok(new { success = true, data = mappedData });
            }
            catch (Exception ex)
            {
                Console.WriteLine("!!! CRITICAL ERROR !!!");
                Console.WriteLine(ex.ToString());
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var clientCode = GetClientCode();
            var app = await _db.VehicleLoanApplications
                .FirstOrDefaultAsync(a => a.Id == id && a.ClientCode == clientCode);

            if (app == null) return NotFound();

            _db.VehicleLoanApplications.Remove(app);
            await _db.SaveChangesAsync();
            return Ok(new { success = true, message = "Application deleted." });
        }

        // PATCH /api/vehicle-loan/{id}/status
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] VehicleLoanStatusDto dto)
        {
            var clientCode = GetClientCode();
            var app = await _db.VehicleLoanApplications.FirstOrDefaultAsync(a => a.Id == id && a.ClientCode == clientCode);
            if (app == null) return NotFound(new { success = false, message = "Application not found." });

            app.Status = dto.Status.ToUpper();
            app.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return Ok(new { success = true, message = $"Status updated to {app.Status}" });
        }

        private string GenerateApplicationNo()
        {
            var prefix = "VL-" + DateTime.Now.ToString("yyyyMMdd");
            var count = _db.VehicleLoanApplications.Count(a => a.ApplicationNo != null && a.ApplicationNo.StartsWith(prefix));
            return $"{prefix}-{(count + 1):D4}";
        }

        private VehicleLoanApplication BuildApplication(VehicleLoanSubmitDto dto, string clientCode, string status, string? appNo = null)
        {
            var app = new VehicleLoanApplication { ClientCode = clientCode, Status = status, ApplicationNo = appNo };
            MapBasicFields(app, dto);
            AddChildRecords(app, dto, appNo);
            return app;
        }

        private void MapBasicFields(VehicleLoanApplication app, VehicleLoanSubmitDto dto)
        {
            app.Dinank = dto.Dinank;
            app.SaCra = dto.SaCra;
            app.KarjKhate = dto.KarjKhate;
            app.Shakha = dto.Shakha;
            app.ArjdarNaav = dto.ArjdarNaav;
            app.ArjdarVay = dto.ArjdarVay;
            app.KarjRakkam = dto.KarjRakkam;
            app.Akshari = dto.Akshari;
            app.ParatfedKalavadhi = dto.ParatfedKalavadhi;
            app.PahilaHapta = dto.PahilaHapta;
            app.Tarikh = dto.Tarikh;
            app.Karan = dto.Karan;
            app.Vaivahik = dto.Vaivahik;
            app.Avalambun = dto.Avalambun;
            app.VyajDar = dto.VyajDar;
            app.Jameen1Naav = dto.Jameen1Naav;
            app.Jameen1Vay = dto.Jameen1Vay;
            app.Jameen2Naav = dto.Jameen2Naav;
            app.Jameen2Vay = dto.Jameen2Vay;
            app.Jameen3Naav = dto.Jameen3Naav;
            app.Jameen3Vay = dto.Jameen3Vay;
            app.IncTaxPan = dto.IncTaxPan;
            app.IncTaxSinceYear = dto.IncTaxSinceYear;
            app.ProfTaxNo = dto.ProfTaxNo;
            app.ProfTaxSinceYear = dto.ProfTaxSinceYear;
            app.BizExtraInfo = dto.BizExtraInfo;
            app.RawJson = dto.RawJson;
        }

        private void AddChildRecords(VehicleLoanApplication app, VehicleLoanSubmitDto dto, string? appNo = null)
        {
            if (dto.Borrower != null) { app.Borrower = MapPerson<VehicleLoanBorrower>(dto.Borrower); app.Borrower.ApplicationNo = appNo; }
            if (dto.Guarantor1 != null) { var g1 = MapPerson<VehicleLoanGuarantor>(dto.Guarantor1); g1.GuarantorNumber = 1; g1.ApplicationNo = appNo; app.Guarantors.Add(g1); }
            if (dto.Guarantor2 != null) { var g2 = MapPerson<VehicleLoanGuarantor>(dto.Guarantor2); g2.GuarantorNumber = 2; g2.ApplicationNo = appNo; app.Guarantors.Add(g2); }
            if (dto.ExtraGuarantors != null) {
                foreach (var eg in dto.ExtraGuarantors) {
                    var extra = MapPerson<VehicleLoanExtraGuarantor>(eg);
                    extra.FrontendId = eg.FrontendId;
                    extra.GuarantorNumber = eg.GuarantorNumber;
                    extra.ApplicationNo = appNo;
                    app.ExtraGuarantors.Add(extra);
                }
            }
            if (dto.NewVehicle != null) app.NewVehicle = MapNewVehicle(dto.NewVehicle, appNo);
            if (dto.OldVehicle != null) app.OldVehicle = MapOldVehicle(dto.OldVehicle, appNo);
            if (dto.Insurance != null) app.Insurance = MapInsurance(dto.Insurance, appNo);
            if (dto.BusinessInfo != null) app.BusinessInfo = MapBusinessInfo(dto.BusinessInfo, appNo);
            if (dto.IncTaxDetails != null) foreach (var tax in dto.IncTaxDetails) app.TaxDetails.Add(new VehicleLoanTaxDetail { TaxType = "INCOME", Year = tax.Year, Amount = tax.Amount, Date = tax.Date, ApplicationNo = appNo });
            if (dto.ProfTaxDetails != null) foreach (var tax in dto.ProfTaxDetails) app.TaxDetails.Add(new VehicleLoanTaxDetail { TaxType = "PROFESSIONAL", Year = tax.Year, Amount = tax.Amount, Date = tax.Date, ApplicationNo = appNo });
        }

        private void RemoveChildRecords(VehicleLoanApplication app)
        {
            if (app.Borrower != null) _db.VehicleLoanBorrowers.Remove(app.Borrower);
            if (app.Guarantors.Any()) _db.VehicleLoanGuarantors.RemoveRange(app.Guarantors);
            if (app.ExtraGuarantors.Any()) _db.VehicleLoanExtraGuarantors.RemoveRange(app.ExtraGuarantors);
            if (app.NewVehicle != null) _db.VehicleLoanNewVehicles.Remove(app.NewVehicle);
            if (app.OldVehicle != null) _db.VehicleLoanOldVehicles.Remove(app.OldVehicle);
            if (app.Insurance != null) _db.VehicleLoanInsurances.Remove(app.Insurance);
            if (app.BusinessInfo != null) _db.VehicleLoanBusinessInfos.Remove(app.BusinessInfo);
            if (app.TaxDetails.Any()) _db.VehicleLoanTaxDetails.RemoveRange(app.TaxDetails);
        }

        private T MapPerson<T>(VehicleLoanPersonDto d) where T : VehicleLoanPersonBase, new()
        {
            return new T {
                Photo = d.Photo, Naav = d.Naav, Vay = d.Vay, SabasadNo = d.SabasadNo,
                Shares = d.Shares, SharesRakkam = d.SharesRakkam, VadilNaav = d.VadilNaav,
                VadilVay = d.VadilVay, AaiNaav = d.AaiNaav, AaiVay = d.AaiVay, Patta = d.Patta,
                PinKod = d.PinKod, Durdhvani = d.Durdhvani, Mobile = d.Mobile, Email = d.Email,
                JageSwaarupJson = d.JageSwaarup != null ? JsonSerializer.Serialize(d.JageSwaarup) : null,
                Kalavadhi_m = d.Kalavadhi_m, Kalavadhi_v = d.Kalavadhi_v, Vaivahik = d.Vaivahik,
                Avalambun = d.Avalambun, Company = d.Company, CompanyPatta = d.CompanyPatta,
                CompanyPin = d.CompanyPin, CompanyTel = d.CompanyTel, CompanyMobile = d.CompanyMobile,
                CompanyEmail = d.CompanyEmail, Vibhag = d.Vibhag, Hudda = d.Hudda, EmpCode = d.EmpCode,
                Karj_m = d.Karj_m, Karj_v = d.Karj_v, Seva = d.Seva, MonthlyVetan = d.MonthlyVetan,
                Kapat = d.Kapat, Niwal = d.Niwal, Vaarshik = d.Vaarshik, Kharcha = d.Kharcha,
                NiwalVaarshik = d.NiwalVaarshik, Kutumb = d.Kutumb, KutumbType = d.KutumbType,
                ShetiNaav = d.ShetiNaav, ShetiNaate = d.ShetiNaate, GaavMukkam = d.GaavMukkam,
                GaavPost = d.GaavPost, GaavTaluka = d.GaavTaluka, GaavJilha = d.GaavJilha,
                GaavRajya = d.GaavRajya, GaavPin = d.GaavPin, GaavDurdhvani = d.GaavDurdhvani,
                GaavMobile = d.GaavMobile, PurvKarjPrakar = d.PurvKarjPrakar, PurvKhate = d.PurvKhate,
                PurvRakkam = d.PurvRakkam, PurvDin1 = d.PurvDin1, PurvDin2 = d.PurvDin2,
                Jam94aKarjdarNaav = d.Jam94aKarjdarNaav, Jam94aPrakar = d.Jam94aPrakar,
                Jam94aKhate = d.Jam94aKhate, Jam94aRakkam = d.Jam94aRakkam, Jam94aDin1 = d.Jam94aDin1,
                Jam94aDin2 = d.Jam94aDin2, Jam94bKarjdarNaav = d.Jam94bKarjdarNaav,
                Jam94bPrakar = d.Jam94bPrakar, Jam94bKhate = d.Jam94bKhate, Jam94bRakkam = d.Jam94bRakkam,
                Jam94bDin1 = d.Jam94bDin1, Jam94bDin2 = d.Jam94bDin2, Kutumb95Naav = d.Kutumb95Naav,
                Kutumb95Prakar = d.Kutumb95Prakar, Kutumb95Khate = d.Kutumb95Khate,
                Kutumb95Rakkam = d.Kutumb95Rakkam, Kutumb95Din1 = d.Kutumb95Din1,
                Kutumb95Din2 = d.Kutumb95Din2, Bank96Naav = d.Bank96Naav, Bank96Shakha = d.Bank96Shakha,
                Bank96Prakar = d.Bank96Prakar, Bank96Khate = d.Bank96Khate, Bank96Rakkam = d.Bank96Rakkam,
                Bank96Din1 = d.Bank96Din1, Bank96Din2 = d.Bank96Din2, Dinank = d.Dinank, Thikan = d.Thikan
            };
        }

        private VehicleLoanNewVehicle MapNewVehicle(VehicleLoanNewVehicleDto d, string? appNo) => new VehicleLoanNewVehicle {
            ApplicationNo = appNo, VahanaVapar = d.VahanaVapar, CompanyNaav = d.CompanyNaav, VahanaPrakar = d.VahanaPrakar,
            NirmitVarsh = d.NirmitVarsh, Model = d.Model, FuelType = d.FuelType, DealerNaav = d.DealerNaav,
            DealerPatta = d.DealerPatta, DealerMobile = d.DealerMobile, DealerTel = d.DealerTel, DealerEmail = d.DealerEmail,
            Kimat = d.Kimat, Booking = d.Booking, Shillak = d.Shillak, DepositYes = d.DepositYes, DepositAmt = d.DepositAmt,
            ParkingThikan = d.ParkingThikan, PermitNo = d.PermitNo, PermitRenew = d.PermitRenew, OtherVehicleYes = d.OtherVehicleYes,
            OtherVehicleNo = d.OtherVehicleNo, OtherVehicleType = d.OtherVehicleType, OtherVehicleModel = d.OtherVehicleModel,
            OtherVehicleYear = d.OtherVehicleYear
        };

        private VehicleLoanOldVehicle MapOldVehicle(VehicleLoanOldVehicleDto d, string? appNo) => new VehicleLoanOldVehicle {
            ApplicationNo = appNo, VahanaVapar = d.VahanaVapar, DealerNaav = d.DealerNaav, DealerPatta = d.DealerPatta,
            DealerMobile = d.DealerMobile, DealerTel = d.DealerTel, DealerEmail = d.DealerEmail, CompanyNaav = d.CompanyNaav,
            VehicleNo = d.VehicleNo, RTO = d.RTO, VahanaPrakar = d.VahanaPrakar, NirmitVarsh = d.NirmitVarsh,
            EngineNo = d.EngineNo, ChassisNo = d.ChassisNo, Model = d.Model, FuelType = d.FuelType, FitnessNo = d.FitnessNo,
            FitnessRenew = d.FitnessRenew, ParkingThikan = d.ParkingThikan, PermitNo = d.PermitNo, PermitArea = d.PermitArea,
            PermitRenewDate = d.PermitRenewDate, PermitFrom = d.PermitFrom, PermitTo = d.PermitTo, RoadTax = d.RoadTax,
            RoadTaxPeriod = d.RoadTaxPeriod, OtherVehicleYes = d.OtherVehicleYes, OtherVehicleNo = d.OtherVehicleNo,
            OtherVehicleType = d.OtherVehicleType, OtherVehicleModel = d.OtherVehicleModel, OtherVehicleYear = d.OtherVehicleYear
        };

        private VehicleLoanInsurance MapInsurance(VehicleLoanInsuranceDto d, string? appNo) => new VehicleLoanInsurance {
            ApplicationNo = appNo, InsCompanyNaav = d.InsCompanyNaav, InsAddress = d.InsAddress, InsPolicy = d.InsPolicy,
            InsDurFrom = d.InsDurFrom, InsDurTo = d.InsDurTo, InsAmount = d.InsAmount, InsPremium = d.InsPremium,
            OldKimat = d.OldKimat, OldAdvance = d.OldAdvance, OldShillak = d.OldShillak, OldValuationPrice = d.OldValuationPrice,
            OldDepositYes = d.OldDepositYes, OldDepositAmt = d.OldDepositAmt, LifeInsCompany = d.LifeInsCompany,
            LifeInsAddress = d.LifeInsAddress, LifeInsPolicy = d.LifeInsPolicy, LifeInsDurFrom = d.LifeInsDurFrom,
            LifeInsDurTo = d.LifeInsDurTo, LifeInsAmount = d.LifeInsAmount, LifeInsPremium = d.LifeInsPremium,
            LifeInsPremiumType = d.LifeInsPremiumType, LifeInsLoanYes = d.LifeInsLoanYes, LifeInsLoanBank = d.LifeInsLoanBank,
            LifeInsLoanAmount = d.LifeInsLoanAmount, LifeInsLoanDate = d.LifeInsLoanDate, LifeInsLoanBalance = d.LifeInsLoanBalance
        };

        private VehicleLoanBusinessInfo MapBusinessInfo(VehicleLoanBusinessInfoDto d, string? appNo) => new VehicleLoanBusinessInfo {
            ApplicationNo = appNo, BizType = d.BizType, BizCategory = d.BizCategory,
            BizPremisesTypeJson = d.BizPremisesType != null ? JsonSerializer.Serialize(d.BizPremisesType) : null,
            BizArea = d.BizArea, BizAreaUnit = d.BizAreaUnit, BizAreaType = d.BizAreaType, BizName = d.BizName,
            BizAddress = d.BizAddress, BizPin = d.BizPin, BizMobile = d.BizMobile, BizEmail = d.BizEmail, BizPan = d.BizPan,
            BizGumasta = d.BizGumasta, BizSalesTax = d.BizSalesTax, BizVat = d.BizVat, BizServiceTax = d.BizServiceTax,
            BizOtherLicense = d.BizOtherLicense, BizHasLicenses = d.BizHasLicenses, BizLicenseDetails = d.BizLicenseDetails,
            BizIsResidentInZone = d.BizIsResidentInZone, BizStartDate = d.BizStartDate, BizExperience = d.BizExperience,
            BizIncome = d.BizIncome, BizExpense = d.BizExpense, BizNetIncome = d.BizNetIncome, BizCust1Name = d.BizCust1Name,
            BizCust1Address = d.BizCust1Address, BizCust2Name = d.BizCust2Name, BizCust2Address = d.BizCust2Address,
            BizSupplier1Name = d.BizSupplier1Name, BizSupplier1Address = d.BizSupplier1Address, BizSupplier2Name = d.BizSupplier2Name,
            BizSupplier2Address = d.BizSupplier2Address
        };

        private VehicleLoanDetailDto MapToDetailDto(VehicleLoanApplication app) {
            return new VehicleLoanDetailDto {
                Id = app.Id, ClientCode = app.ClientCode, Status = app.Status,
                Dinank = app.Dinank, SaCra = app.SaCra, KarjKhate = app.KarjKhate, Shakha = app.Shakha,
                ArjdarNaav = app.ArjdarNaav, ArjdarVay = app.ArjdarVay, KarjRakkam = app.KarjRakkam,
                Akshari = app.Akshari, ParatfedKalavadhi = app.ParatfedKalavadhi, PahilaHapta = app.PahilaHapta,
                Tarikh = app.Tarikh, Karan = app.Karan, Vaivahik = app.Vaivahik, Avalambun = app.Avalambun,
                VyajDar = app.VyajDar,
                Jameen1Naav = app.Jameen1Naav, Jameen1Vay = app.Jameen1Vay, Jameen2Naav = app.Jameen2Naav,
                Jameen2Vay = app.Jameen2Vay, Jameen3Naav = app.Jameen3Naav, Jameen3Vay = app.Jameen3Vay,
                Borrower = MapPersonToDto(app.Borrower),
                Guarantor1 = MapPersonToDto(app.Guarantors.FirstOrDefault(g => g.GuarantorNumber == 1)),
                Guarantor2 = MapPersonToDto(app.Guarantors.FirstOrDefault(g => g.GuarantorNumber == 2)),
                ExtraGuarantors = app.ExtraGuarantors.Select(eg => new VehicleLoanExtraGuarantorDto {
                    FrontendId = eg.FrontendId, GuarantorNumber = eg.GuarantorNumber, 
                    Naav = eg.Naav, Mobile = eg.Mobile, VadilNaav = eg.VadilNaav, Photo = eg.Photo, Vay = eg.Vay, Patta = eg.Patta // simplified
                }).ToList(),
                NewVehicle = app.NewVehicle != null ? new VehicleLoanNewVehicleDto { VahanaVapar = app.NewVehicle.VahanaVapar, CompanyNaav = app.NewVehicle.CompanyNaav, VahanaPrakar = app.NewVehicle.VahanaPrakar, NirmitVarsh = app.NewVehicle.NirmitVarsh, Model = app.NewVehicle.Model, FuelType = app.NewVehicle.FuelType, DealerNaav = app.NewVehicle.DealerNaav, DealerPatta = app.NewVehicle.DealerPatta, DealerMobile = app.NewVehicle.DealerMobile, DealerTel = app.NewVehicle.DealerTel, DealerEmail = app.NewVehicle.DealerEmail, Kimat = app.NewVehicle.Kimat, Booking = app.NewVehicle.Booking, Shillak = app.NewVehicle.Shillak, DepositYes = app.NewVehicle.DepositYes, DepositAmt = app.NewVehicle.DepositAmt, ParkingThikan = app.NewVehicle.ParkingThikan, PermitNo = app.NewVehicle.PermitNo, PermitRenew = app.NewVehicle.PermitRenew, OtherVehicleYes = app.NewVehicle.OtherVehicleYes, OtherVehicleNo = app.NewVehicle.OtherVehicleNo, OtherVehicleType = app.NewVehicle.OtherVehicleType, OtherVehicleModel = app.NewVehicle.OtherVehicleModel, OtherVehicleYear = app.NewVehicle.OtherVehicleYear } : null,
                OldVehicle = app.OldVehicle != null ? new VehicleLoanOldVehicleDto { VahanaVapar = app.OldVehicle.VahanaVapar, DealerNaav = app.OldVehicle.DealerNaav, DealerPatta = app.OldVehicle.DealerPatta, DealerMobile = app.OldVehicle.DealerMobile, DealerTel = app.OldVehicle.DealerTel, DealerEmail = app.OldVehicle.DealerEmail, CompanyNaav = app.OldVehicle.CompanyNaav, VehicleNo = app.OldVehicle.VehicleNo, RTO = app.OldVehicle.RTO, VahanaPrakar = app.OldVehicle.VahanaPrakar, NirmitVarsh = app.OldVehicle.NirmitVarsh, EngineNo = app.OldVehicle.EngineNo, ChassisNo = app.OldVehicle.ChassisNo, Model = app.OldVehicle.Model, FuelType = app.OldVehicle.FuelType, FitnessNo = app.OldVehicle.FitnessNo, FitnessRenew = app.OldVehicle.FitnessRenew, ParkingThikan = app.OldVehicle.ParkingThikan, PermitNo = app.OldVehicle.PermitNo, PermitArea = app.OldVehicle.PermitArea, PermitRenewDate = app.OldVehicle.PermitRenewDate, PermitFrom = app.OldVehicle.PermitFrom, PermitTo = app.OldVehicle.PermitTo, RoadTax = app.OldVehicle.RoadTax, RoadTaxPeriod = app.OldVehicle.RoadTaxPeriod, OtherVehicleYes = app.OldVehicle.OtherVehicleYes, OtherVehicleNo = app.OldVehicle.OtherVehicleNo, OtherVehicleType = app.OldVehicle.OtherVehicleType, OtherVehicleModel = app.OldVehicle.OtherVehicleModel, OtherVehicleYear = app.OldVehicle.OtherVehicleYear } : null,
                Insurance = app.Insurance != null ? new VehicleLoanInsuranceDto { InsCompanyNaav = app.Insurance.InsCompanyNaav, InsAddress = app.Insurance.InsAddress, InsPolicy = app.Insurance.InsPolicy, InsDurFrom = app.Insurance.InsDurFrom, InsDurTo = app.Insurance.InsDurTo, InsAmount = app.Insurance.InsAmount, InsPremium = app.Insurance.InsPremium, OldKimat = app.Insurance.OldKimat, OldAdvance = app.Insurance.OldAdvance, OldShillak = app.Insurance.OldShillak, OldValuationPrice = app.Insurance.OldValuationPrice, OldDepositYes = app.Insurance.OldDepositYes, OldDepositAmt = app.Insurance.OldDepositAmt, LifeInsCompany = app.Insurance.LifeInsCompany, LifeInsAddress = app.Insurance.LifeInsAddress, LifeInsPolicy = app.Insurance.LifeInsPolicy, LifeInsDurFrom = app.Insurance.LifeInsDurFrom, LifeInsDurTo = app.Insurance.LifeInsDurTo, LifeInsAmount = app.Insurance.LifeInsAmount, LifeInsPremium = app.Insurance.LifeInsPremium, LifeInsPremiumType = app.Insurance.LifeInsPremiumType, LifeInsLoanYes = app.Insurance.LifeInsLoanYes, LifeInsLoanBank = app.Insurance.LifeInsLoanBank, LifeInsLoanAmount = app.Insurance.LifeInsLoanAmount, LifeInsLoanDate = app.Insurance.LifeInsLoanDate, LifeInsLoanBalance = app.Insurance.LifeInsLoanBalance } : null,
                BusinessInfo = app.BusinessInfo != null ? new VehicleLoanBusinessInfoDto { BizType = app.BusinessInfo.BizType, BizCategory = app.BusinessInfo.BizCategory, BizPremisesType = app.BusinessInfo.BizPremisesTypeJson != null ? JsonSerializer.Deserialize<List<string>>(app.BusinessInfo.BizPremisesTypeJson) : null, BizArea = app.BusinessInfo.BizArea, BizAreaUnit = app.BusinessInfo.BizAreaUnit, BizAreaType = app.BusinessInfo.BizAreaType, BizName = app.BusinessInfo.BizName, BizAddress = app.BusinessInfo.BizAddress, BizPin = app.BusinessInfo.BizPin, BizMobile = app.BusinessInfo.BizMobile, BizEmail = app.BusinessInfo.BizEmail, BizPan = app.BusinessInfo.BizPan, BizGumasta = app.BusinessInfo.BizGumasta, BizSalesTax = app.BusinessInfo.BizSalesTax, BizVat = app.BusinessInfo.BizVat, BizServiceTax = app.BusinessInfo.BizServiceTax, BizOtherLicense = app.BusinessInfo.BizOtherLicense, BizHasLicenses = app.BusinessInfo.BizHasLicenses, BizLicenseDetails = app.BusinessInfo.BizLicenseDetails, BizIsResidentInZone = app.BusinessInfo.BizIsResidentInZone, BizStartDate = app.BusinessInfo.BizStartDate, BizExperience = app.BusinessInfo.BizExperience, BizIncome = app.BusinessInfo.BizIncome, BizExpense = app.BusinessInfo.BizExpense, BizNetIncome = app.BusinessInfo.BizNetIncome, BizCust1Name = app.BusinessInfo.BizCust1Name, BizCust1Address = app.BusinessInfo.BizCust1Address, BizCust2Name = app.BusinessInfo.BizCust2Name, BizCust2Address = app.BusinessInfo.BizCust2Address, BizSupplier1Name = app.BusinessInfo.BizSupplier1Name, BizSupplier1Address = app.BusinessInfo.BizSupplier1Address, BizSupplier2Name = app.BusinessInfo.BizSupplier2Name, BizSupplier2Address = app.BusinessInfo.BizSupplier2Address } : null,
                IncTaxPan = app.IncTaxPan, IncTaxSinceYear = app.IncTaxSinceYear,
                ProfTaxNo = app.ProfTaxNo, ProfTaxSinceYear = app.ProfTaxSinceYear,
                BizExtraInfo = app.BizExtraInfo, RawJson = app.RawJson,
                CreatedAt = app.CreatedAt, UpdatedAt = app.UpdatedAt
            };
        }

        private VehicleLoanPersonDto? MapPersonToDto(VehicleLoanPersonBase? p) {
            if (p == null) return null;
            return new VehicleLoanPersonDto {
                Photo = p.Photo, Naav = p.Naav, Vay = p.Vay, SabasadNo = p.SabasadNo, Shares = p.Shares, SharesRakkam = p.SharesRakkam,
                VadilNaav = p.VadilNaav, VadilVay = p.VadilVay, AaiNaav = p.AaiNaav, AaiVay = p.AaiVay, Patta = p.Patta, PinKod = p.PinKod,
                Durdhvani = p.Durdhvani, Mobile = p.Mobile, Email = p.Email,
                JageSwaarup = p.JageSwaarupJson != null ? JsonSerializer.Deserialize<List<string>>(p.JageSwaarupJson) : null,
                Kalavadhi_m = p.Kalavadhi_m, Kalavadhi_v = p.Kalavadhi_v, Vaivahik = p.Vaivahik, Avalambun = p.Avalambun,
                Company = p.Company, CompanyPatta = p.CompanyPatta, CompanyPin = p.CompanyPin, CompanyTel = p.CompanyTel,
                CompanyMobile = p.CompanyMobile, CompanyEmail = p.CompanyEmail, Vibhag = p.Vibhag, Hudda = p.Hudda, EmpCode = p.EmpCode,
                Karj_m = p.Karj_m, Karj_v = p.Karj_v, Seva = p.Seva, MonthlyVetan = p.MonthlyVetan, Kapat = p.Kapat, Niwal = p.Niwal,
                Vaarshik = p.Vaarshik, Kharcha = p.Kharcha, NiwalVaarshik = p.NiwalVaarshik, Kutumb = p.Kutumb, KutumbType = p.KutumbType,
                ShetiNaav = p.ShetiNaav, ShetiNaate = p.ShetiNaate, GaavMukkam = p.GaavMukkam, GaavPost = p.GaavPost,
                GaavTaluka = p.GaavTaluka, GaavJilha = p.GaavJilha, GaavRajya = p.GaavRajya, GaavPin = p.GaavPin,
                GaavDurdhvani = p.GaavDurdhvani, GaavMobile = p.GaavMobile, PurvKarjPrakar = p.PurvKarjPrakar,
                PurvKhate = p.PurvKhate, PurvRakkam = p.PurvRakkam, PurvDin1 = p.PurvDin1, PurvDin2 = p.PurvDin2,
                Jam94aKarjdarNaav = p.Jam94aKarjdarNaav, Jam94aPrakar = p.Jam94aPrakar, Jam94aKhate = p.Jam94aKhate,
                Jam94aRakkam = p.Jam94aRakkam, Jam94aDin1 = p.Jam94aDin1, Jam94aDin2 = p.Jam94aDin2,
                Jam94bKarjdarNaav = p.Jam94bKarjdarNaav, Jam94bPrakar = p.Jam94bPrakar, Jam94bKhate = p.Jam94bKhate,
                Jam94bRakkam = p.Jam94bRakkam, Jam94bDin1 = p.Jam94bDin1, Jam94bDin2 = p.Jam94bDin2,
                Kutumb95Naav = p.Kutumb95Naav, Kutumb95Prakar = p.Kutumb95Prakar, Kutumb95Khate = p.Kutumb95Khate,
                Kutumb95Rakkam = p.Kutumb95Rakkam, Kutumb95Din1 = p.Kutumb95Din1, Kutumb95Din2 = p.Kutumb95Din2,
                Bank96Naav = p.Bank96Naav, Bank96Shakha = p.Bank96Shakha, Bank96Prakar = p.Bank96Prakar,
                Bank96Khate = p.Bank96Khate, Bank96Rakkam = p.Bank96Rakkam, Bank96Din1 = p.Bank96Din1, Bank96Din2 = p.Bank96Din2,
                Dinank = p.Dinank, Thikan = p.Thikan
            };
        }
    }
}