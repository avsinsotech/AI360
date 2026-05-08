using System;
using System.Collections.Generic;

namespace TushGptBackend.Dtos.VehicleLoan
{
    // ── Person DTO (shared by Borrower, Guarantor 1, Guarantor 2, Extra Guarantors) ──
    public class VehicleLoanPersonDto
    {
        public string? Photo { get; set; }
        public string? Naav { get; set; }
        public string? Vay { get; set; }
        public string? SabasadNo { get; set; }
        public string? Shares { get; set; }
        public string? SharesRakkam { get; set; }
        public string? VadilNaav { get; set; }
        public string? VadilVay { get; set; }
        public string? AaiNaav { get; set; }
        public string? AaiVay { get; set; }
        public string? Patta { get; set; }
        public string? PinKod { get; set; }
        public string? Durdhvani { get; set; }
        public string? Mobile { get; set; }
        public string? Email { get; set; }
        public List<string>? JageSwaarup { get; set; }
        public string? Kalavadhi_m { get; set; }
        public string? Kalavadhi_v { get; set; }
        public string? Vaivahik { get; set; }
        public string? Avalambun { get; set; }
        public string? Company { get; set; }
        public string? CompanyPatta { get; set; }
        public string? CompanyPin { get; set; }
        public string? CompanyTel { get; set; }
        public string? CompanyMobile { get; set; }
        public string? CompanyEmail { get; set; }
        public string? Vibhag { get; set; }
        public string? Hudda { get; set; }
        public string? EmpCode { get; set; }
        public string? Karj_m { get; set; }
        public string? Karj_v { get; set; }
        public string? Seva { get; set; }
        public string? MonthlyVetan { get; set; }
        public string? Kapat { get; set; }
        public string? Niwal { get; set; }
        public string? Vaarshik { get; set; }
        public string? Kharcha { get; set; }
        public string? NiwalVaarshik { get; set; }
        public string? Kutumb { get; set; }
        public string? KutumbType { get; set; }
        public string? ShetiNaav { get; set; }
        public string? ShetiNaate { get; set; }
        public string? GaavMukkam { get; set; }
        public string? GaavPost { get; set; }
        public string? GaavTaluka { get; set; }
        public string? GaavJilha { get; set; }
        public string? GaavRajya { get; set; }
        public string? GaavPin { get; set; }
        public string? GaavDurdhvani { get; set; }
        public string? GaavMobile { get; set; }
        public string? OfficeAddress { get; set; }
        public string? GavchaAddress { get; set; }
        public string? PurvKarjPrakar { get; set; }
        public string? PurvKhate { get; set; }
        public string? PurvRakkam { get; set; }
        public string? PurvDin1 { get; set; }
        public string? PurvDin2 { get; set; }
        public string? Jam94aKarjdarNaav { get; set; }
        public string? Jam94aPrakar { get; set; }
        public string? Jam94aKhate { get; set; }
        public string? Jam94aRakkam { get; set; }
        public string? Jam94aDin1 { get; set; }
        public string? Jam94aDin2 { get; set; }
        public string? Jam94bKarjdarNaav { get; set; }
        public string? Jam94bPrakar { get; set; }
        public string? Jam94bKhate { get; set; }
        public string? Jam94bRakkam { get; set; }
        public string? Jam94bDin1 { get; set; }
        public string? Jam94bDin2 { get; set; }
        public string? Kutumb95Naav { get; set; }
        public string? Kutumb95Prakar { get; set; }
        public string? Kutumb95Khate { get; set; }
        public string? Kutumb95Rakkam { get; set; }
        public string? Kutumb95Din1 { get; set; }
        public string? Kutumb95Din2 { get; set; }
        public string? Bank96Naav { get; set; }
        public string? Bank96Shakha { get; set; }
        public string? Bank96Prakar { get; set; }
        public string? Bank96Khate { get; set; }
        public string? Bank96Rakkam { get; set; }
        public string? Bank96Din1 { get; set; }
        public string? Bank96Din2 { get; set; }
        public string? Dinank { get; set; }
        public string? Thikan { get; set; }
    }

    // ── Extra Guarantor DTO ──────────────────────────────────────────────────
    public class VehicleLoanExtraGuarantorDto : VehicleLoanPersonDto
    {
        public string? FrontendId { get; set; }  // timestamp-based ID from frontend
        public int GuarantorNumber { get; set; }
    }

    // ── New Vehicle DTO ──────────────────────────────────────────────────────
    public class VehicleLoanNewVehicleDto
    {
        public string? VahanaVapar { get; set; }
        public string? CompanyNaav { get; set; }
        public string? VahanaPrakar { get; set; }
        public string? NirmitVarsh { get; set; }
        public string? Model { get; set; }
        public string? FuelType { get; set; }
        public string? DealerNaav { get; set; }
        public string? DealerPatta { get; set; }
        public string? DealerMobile { get; set; }
        public string? DealerTel { get; set; }
        public string? DealerEmail { get; set; }
        public string? Kimat { get; set; }
        public string? Booking { get; set; }
        public string? Shillak { get; set; }
        public bool? DepositYes { get; set; }
        public string? DepositAmt { get; set; }
        public string? ParkingThikan { get; set; }
        public string? PermitNo { get; set; }
        public string? PermitRenew { get; set; }
        public bool? OtherVehicleYes { get; set; }
        public string? OtherVehicleNo { get; set; }
        public string? OtherVehicleType { get; set; }
        public string? OtherVehicleModel { get; set; }
        public string? OtherVehicleYear { get; set; }
    }

    // ── Old Vehicle DTO ──────────────────────────────────────────────────────
    public class VehicleLoanOldVehicleDto
    {
        public string? VahanaVapar { get; set; }
        public string? DealerNaav { get; set; }
        public string? DealerPatta { get; set; }
        public string? DealerMobile { get; set; }
        public string? DealerTel { get; set; }
        public string? DealerEmail { get; set; }
        public string? CompanyNaav { get; set; }
        public string? VehicleNo { get; set; }
        public string? RTO { get; set; }
        public string? VahanaPrakar { get; set; }
        public string? NirmitVarsh { get; set; }
        public string? EngineNo { get; set; }
        public string? ChassisNo { get; set; }
        public string? Model { get; set; }
        public string? FuelType { get; set; }
        public string? FitnessNo { get; set; }
        public string? FitnessRenew { get; set; }
        public string? ParkingThikan { get; set; }
        public string? PermitNo { get; set; }
        public string? PermitArea { get; set; }
        public string? PermitRenewDate { get; set; }
        public string? PermitFrom { get; set; }
        public string? PermitTo { get; set; }
        public string? RoadTax { get; set; }
        public string? RoadTaxPeriod { get; set; }
        public bool? OtherVehicleYes { get; set; }
        public string? OtherVehicleNo { get; set; }
        public string? OtherVehicleType { get; set; }
        public string? OtherVehicleModel { get; set; }
        public string? OtherVehicleYear { get; set; }
    }

    // ── Insurance DTO ────────────────────────────────────────────────────────
    public class VehicleLoanInsuranceDto
    {
        public string? InsCompanyNaav { get; set; }
        public string? InsAddress { get; set; }
        public string? InsPolicy { get; set; }
        public string? InsDurFrom { get; set; }
        public string? InsDurTo { get; set; }
        public string? InsAmount { get; set; }
        public string? InsPremium { get; set; }
        public string? OldKimat { get; set; }
        public string? OldAdvance { get; set; }
        public string? OldShillak { get; set; }
        public string? OldValuationPrice { get; set; }
        public bool? OldDepositYes { get; set; }
        public string? OldDepositAmt { get; set; }
        public string? LifeInsCompany { get; set; }
        public string? LifeInsAddress { get; set; }
        public string? LifeInsPolicy { get; set; }
        public string? LifeInsDurFrom { get; set; }
        public string? LifeInsDurTo { get; set; }
        public string? LifeInsAmount { get; set; }
        public string? LifeInsPremium { get; set; }
        public string? LifeInsPremiumType { get; set; }
        public bool? LifeInsLoanYes { get; set; }
        public string? LifeInsLoanBank { get; set; }
        public string? LifeInsLoanAmount { get; set; }
        public string? LifeInsLoanDate { get; set; }
        public string? LifeInsLoanAddress { get; set; }
        public string? LifeInsLoanBalance { get; set; }
    }

    // ── Business Info DTO (Step 7) ───────────────────────────────────────────
    public class VehicleLoanBusinessInfoDto
    {
        public string? BizType { get; set; }
        public string? BizCategory { get; set; }
        public List<string>? BizPremisesType { get; set; }
        public string? BizArea { get; set; }
        public string? BizAreaUnit { get; set; }
        public string? BizAreaType { get; set; }
        public string? BizName { get; set; }
        public string? BizAddress { get; set; }
        public string? BizPin { get; set; }
        public string? BizMobile { get; set; }
        public string? BizEmail { get; set; }
        public string? BizPan { get; set; }
        public string? BizGumasta { get; set; }
        public string? BizSalesTax { get; set; }
        public string? BizVat { get; set; }
        public string? BizServiceTax { get; set; }
        public string? BizOtherLicense { get; set; }
        public bool? BizHasLicenses { get; set; }
        public string? BizLicenseDetails { get; set; }
        public bool? BizIsResidentInZone { get; set; }
        public string? BizStartDate { get; set; }
        public string? BizExperience { get; set; }
        public string? BizIncome { get; set; }
        public string? BizExpense { get; set; }
        public string? BizNetIncome { get; set; }
        public string? BizCust1Name { get; set; }
        public string? BizCust1Address { get; set; }
        public string? BizCust2Name { get; set; }
        public string? BizCust2Address { get; set; }
        public string? BizSupplier1Name { get; set; }
        public string? BizSupplier1Address { get; set; }
        public string? BizSupplier2Name { get; set; }
        public string? BizSupplier2Address { get; set; }
    }

    // ── Tax Detail DTO (Step 8) ──────────────────────────────────────────────
    public class VehicleLoanTaxDetailDto
    {
        public string? Year { get; set; }
        public string? Amount { get; set; }
        public string? Date { get; set; }
    }

    // ── Main Submit DTO (full form state from frontend) ──────────────────────
    public class VehicleLoanSubmitDto
    {
        // Basic Info (Step 1)
        public string? Dinank { get; set; }
        public string? SaCra { get; set; }
        public string? KarjKhate { get; set; }
        public string? Shakha { get; set; }
        public string? ArjdarNaav { get; set; }
        public string? ArjdarVay { get; set; }
        public string? KarjRakkam { get; set; }
        public string? Akshari { get; set; }
        public string? ParatfedKalavadhi { get; set; }
        public string? PahilaHapta { get; set; }
        public string? Tarikh { get; set; }
        public string? Karan { get; set; }
        public string? Vaivahik { get; set; }
        public string? Avalambun { get; set; }
        public string? VyajDar { get; set; }
        public string? Jameen1Naav { get; set; }
        public string? Jameen1Vay { get; set; }
        public string? Jameen2Naav { get; set; }
        public string? Jameen2Vay { get; set; }
        public string? Jameen3Naav { get; set; }
        public string? Jameen3Vay { get; set; }

        // Persons
        public VehicleLoanPersonDto? Borrower { get; set; }
        public VehicleLoanPersonDto? Guarantor1 { get; set; }
        public VehicleLoanPersonDto? Guarantor2 { get; set; }
        public List<VehicleLoanExtraGuarantorDto>? ExtraGuarantors { get; set; }

        // Vehicles
        public VehicleLoanNewVehicleDto? NewVehicle { get; set; }
        public VehicleLoanOldVehicleDto? OldVehicle { get; set; }

        // Insurance & Valuation
        public VehicleLoanInsuranceDto? Insurance { get; set; }

        // Step 7: Business Info
        public VehicleLoanBusinessInfoDto? BusinessInfo { get; set; }

        // Step 8: Tax & Partner Info
        public string? IncTaxPan { get; set; }
        public string? IncTaxSinceYear { get; set; }
        public List<VehicleLoanTaxDetailDto>? IncTaxDetails { get; set; }
        public string? ProfTaxNo { get; set; }
        public string? ProfTaxSinceYear { get; set; }
        public List<VehicleLoanTaxDetailDto>? ProfTaxDetails { get; set; }
        public string? BizExtraInfo { get; set; }

        // Full raw JSON snapshot (for audit / print re-generation)
        public string? RawJson { get; set; }
    }

    // ── Save Draft DTO (same fields, used for PATCH/PUT on draft) ────────────
    public class VehicleLoanDraftDto : VehicleLoanSubmitDto { }

    // ── Status Update DTO ────────────────────────────────────────────────────
    public class VehicleLoanStatusDto
    {
        public string Status { get; set; } = "SUBMITTED";
        public string? Remarks { get; set; }
    }

    // ── List Item DTO (for GET list) ─────────────────────────────────────────
    public class VehicleLoanListItemDto
    {
        public int Id { get; set; }
        public string? ClientCode { get; set; }
        public string? ArjdarNaav { get; set; }
        public string? KarjRakkam { get; set; }
        public string? Shakha { get; set; }
        public string? Status { get; set; }
        public string? Dinank { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? BorrowerMobile { get; set; }
    }

    // ── Detail Response DTO ──────────────────────────────────────────────────
    public class VehicleLoanDetailDto
    {
        public int Id { get; set; }
        public string? ClientCode { get; set; }
        public string? Status { get; set; }

        // Basic
        public string? Dinank { get; set; }
        public string? SaCra { get; set; }
        public string? KarjKhate { get; set; }
        public string? Shakha { get; set; }
        public string? ArjdarNaav { get; set; }
        public string? ArjdarVay { get; set; }
        public string? KarjRakkam { get; set; }
        public string? Akshari { get; set; }
        public string? ParatfedKalavadhi { get; set; }
        public string? PahilaHapta { get; set; }
        public string? Tarikh { get; set; }
        public string? Karan { get; set; }
        public string? Vaivahik { get; set; }
        public string? Avalambun { get; set; }
        public string? VyajDar { get; set; }
        public string? Jameen1Naav { get; set; }
        public string? Jameen1Vay { get; set; }
        public string? Jameen2Naav { get; set; }
        public string? Jameen2Vay { get; set; }
        public string? Jameen3Naav { get; set; }
        public string? Jameen3Vay { get; set; }

        // Persons
        public VehicleLoanPersonDto? Borrower { get; set; }
        public VehicleLoanPersonDto? Guarantor1 { get; set; }
        public VehicleLoanPersonDto? Guarantor2 { get; set; }
        public List<VehicleLoanExtraGuarantorDto>? ExtraGuarantors { get; set; }

        // Vehicles
        public VehicleLoanNewVehicleDto? NewVehicle { get; set; }
        public VehicleLoanOldVehicleDto? OldVehicle { get; set; }

        // Insurance
        public VehicleLoanInsuranceDto? Insurance { get; set; }

        // Step 7: Business Info
        public VehicleLoanBusinessInfoDto? BusinessInfo { get; set; }

        // Step 8: Tax & Partner Info
        public string? IncTaxPan { get; set; }
        public string? IncTaxSinceYear { get; set; }
        public List<VehicleLoanTaxDetailDto>? IncTaxDetails { get; set; }
        public string? ProfTaxNo { get; set; }
        public string? ProfTaxSinceYear { get; set; }
        public List<VehicleLoanTaxDetailDto>? ProfTaxDetails { get; set; }
        public string? BizExtraInfo { get; set; }

        public string? RawJson { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}