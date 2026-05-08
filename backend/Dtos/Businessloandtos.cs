using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TushGptBackend.Dtos
{
    // ─── Shared Person DTO (used for borrower + guarantors) ──────────────────
    public class PersonInfoDto
    {
        public string? PhotoBase64 { get; set; }
        public string? FullName { get; set; }
        public int? Age { get; set; }
        public string? MemberNo { get; set; }
        public int? SharesCount { get; set; }
        public decimal? SharesAmount { get; set; }

        public string? FatherHusbandName { get; set; }
        public int? FatherHusbandAge { get; set; }
        public string? MotherName { get; set; }
        public int? MotherAge { get; set; }

        public string? ResidentialAddress { get; set; }
        public string? PinCode { get; set; }
        public string? Telephone { get; set; }
        public string? Mobile { get; set; }
        public string? Email { get; set; }
        public List<string> PropertyTypes { get; set; } = new();
        public int? ResidenceMonths { get; set; }
        public int? ResidenceYears { get; set; }
        public string? MaritalStatus { get; set; }
        public int? Dependents { get; set; }
        public string? OfficeAddress { get; set; }
        public string? GavchaAddress { get; set; }

        public string? CompanyName { get; set; }
        public string? CompanyAddress { get; set; }
        public string? CompanyPinCode { get; set; }
        public string? CompanyTelephone { get; set; }
        public string? CompanyMobile { get; set; }
        public string? CompanyEmail { get; set; }
        public string? Department { get; set; }
        public string? Designation { get; set; }
        public string? EmployeeCode { get; set; }
        public int? EmploymentMonths { get; set; }
        public int? EmploymentYears { get; set; }
        public string? RetirementDate { get; set; }  // ISO string from frontend date input

        public decimal? MonthlySalary { get; set; }
        public decimal? Deductions { get; set; }
        public decimal? NetSalary { get; set; }
        public decimal? AnnualBusinessIncome { get; set; }
        public decimal? TotalExpenses { get; set; }
        public decimal? NetAnnualIncome { get; set; }
        public decimal? FamilyIncome { get; set; }
        public string? FamilyIncomeType { get; set; }

        public string? PropertyOwnerName { get; set; }
        public string? PropertyOwnerRelation { get; set; }
        public string? VillageMukkam { get; set; }
        public string? VillagePost { get; set; }
        public string? VillageTaluka { get; set; }
        public string? VillageDistrict { get; set; }
        public string? VillageState { get; set; }
        public string? VillagePinCode { get; set; }
        public string? VillageTelephone { get; set; }
        public string? VillageMobile { get; set; }

        // 93
        public string? PrevLoanType { get; set; }
        public string? PrevLoanAccountNo { get; set; }
        public decimal? PrevLoanAmount { get; set; }
        public string? PrevLoanTakenDate { get; set; }
        public string? PrevLoanRepaidDate { get; set; }

        // 94a
        public string? Guar94aBorrowerName { get; set; }
        public string? Guar94aLoanType { get; set; }
        public string? Guar94aAccountNo { get; set; }
        public decimal? Guar94aAmount { get; set; }
        public string? Guar94aTakenDate { get; set; }
        public string? Guar94aRepaidDate { get; set; }

        // 94b
        public string? Guar94bBorrowerName { get; set; }
        public string? Guar94bLoanType { get; set; }
        public string? Guar94bAccountNo { get; set; }
        public decimal? Guar94bAmount { get; set; }
        public string? Guar94bTakenDate { get; set; }
        public string? Guar94bRepaidDate { get; set; }

        // 95
        public string? FamilyLoanMemberName { get; set; }
        public string? FamilyLoanType { get; set; }
        public string? FamilyLoanAccountNo { get; set; }
        public decimal? FamilyLoanAmount { get; set; }
        public string? FamilyLoanTakenDate { get; set; }
        public string? FamilyLoanRepaidDate { get; set; }

        // 96
        public string? OtherBankName { get; set; }
        public string? OtherBankBranch { get; set; }
        public string? OtherBankLoanType { get; set; }
        public string? OtherBankAccountNo { get; set; }
        public decimal? OtherBankLoanAmount { get; set; }
        public string? OtherBankLoanTakenDate { get; set; }
        public string? OtherBankLoanRepaidDate { get; set; }

        public string? PlaceOfSign { get; set; }
        public string? DateOfSign { get; set; }
    }

    // ─── Extra Guarantor DTO ─────────────────────────────────────────────────
    public class ExtraGuarantorDto : PersonInfoDto
    {
        public string? FrontendId { get; set; }  // React timestamp id
        public int GuarantorNumber { get; set; }
    }

    // ─── Step 1 — Basic Info ─────────────────────────────────────────────────
    public class BlStep1Dto
    {
        public string? ApplicationDate { get; set; }
        public string? MemberNo { get; set; }
        public string? LoanAccountNo { get; set; }
        public string? Branch { get; set; }

        [Required] public string ApplicantName { get; set; } = "";
        public int? ApplicantAge { get; set; }

        public decimal? LoanAmount { get; set; }
        public string? LoanAmountInWords { get; set; }
        public int? RepaymentMonths { get; set; }
        public int? FirstInstallmentAfterMonths { get; set; }
        public int? InstallmentDate { get; set; }
        public string? Purpose { get; set; }
        public string? MaritalStatus { get; set; }
        public int? Dependents { get; set; }

        public string? Guarantor1Name { get; set; }
        public int? Guarantor1Age { get; set; }
        public string? Guarantor2Name { get; set; }
        public int? Guarantor2Age { get; set; }
        public string? Guarantor3Name { get; set; }
        public int? Guarantor3Age { get; set; }

        // Extra guarantors summary (name + age only for page 1 display)
        public List<ExtraGuarantorSummaryDto> ExtraGuarantors { get; set; } = new();
    }

    public class ExtraGuarantorSummaryDto
    {
        public string? FrontendId { get; set; }
        public string? Name { get; set; }
        public int? Age { get; set; }
        public int GuarantorNumber { get; set; }
    }

    // ─── Step 2 — Borrower ──────────────────────────────────────────────────
    public class BlStep2Dto : PersonInfoDto { }

    // ─── Step 3 — Guarantor 1 ───────────────────────────────────────────────
    public class BlStep3Dto : PersonInfoDto { }

    // ─── Step 4 — Guarantor 2 ───────────────────────────────────────────────
    public class BlStep4Dto : PersonInfoDto { }

    // ─── Step 5 — Business Info ──────────────────────────────────────────────
    public class BlStep5Dto
    {
        public string? BusinessNature { get; set; }
        public string? BusinessType { get; set; }
        public string? BusinessPropertyType { get; set; }
        public decimal? FloorArea { get; set; }

        public string? FirmName { get; set; }
        public string? Address { get; set; }
        public string? Address2 { get; set; }
        public string? PinCode { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }

        public string? PanCardNo { get; set; }
        public string? GumastaLicenseNo { get; set; }
        public string? SalesTaxNo { get; set; }
        public string? VatNo { get; set; }
        public string? ServiceTaxNo { get; set; }
        public string? OtherLicense { get; set; }
        public bool? AllLicensesAvailable { get; set; }
        public bool? IsSmallIndustryResident { get; set; }

        public string? SinceWhen { get; set; }
        public string? Experience { get; set; }

        public decimal? TotalAnnualIncome { get; set; }
        public decimal? TotalAnnualExpenses { get; set; }
        public decimal? NetAnnualIncome { get; set; }

        public string? Customer1Name { get; set; }
        public string? Customer1Address { get; set; }
        public string? Customer2Name { get; set; }
        public string? Customer2Address { get; set; }
        public string? Supplier1Name { get; set; }
        public string? Supplier1Address { get; set; }
        public string? Supplier2Name { get; set; }
        public string? Supplier2Address { get; set; }

        public string? Extra1 { get; set; }
        public string? Extra2 { get; set; }
        public string? Extra3 { get; set; }
        public string? Extra4 { get; set; }
    }

    // ─── Step 6 — Insurance & Tax ────────────────────────────────────────────
    public class BlStep6Dto
    {
        public string? InsuranceCompanyName { get; set; }
        public string? InsuranceAddress { get; set; }
        public string? InsurancePolicyNo { get; set; }
        public string? InsuranceFrom { get; set; }
        public string? InsuranceTo { get; set; }
        public decimal? InsuranceAmount { get; set; }
        public decimal? InsurancePremium { get; set; }
        public string? InsurancePremiumFrequency { get; set; }

        public bool? HasPolicyLoan { get; set; }
        public string? PolicyLoanBankName { get; set; }
        public string? PolicyLoanBankAddress { get; set; }
        public decimal? PolicyLoanAmount { get; set; }
        public string? PolicyLoanDate { get; set; }
        public decimal? PolicyLoanBalance { get; set; }

        public string? PanCardNo { get; set; }
        public string? IncomeTaxSince { get; set; }
        public string? ItYear1From { get; set; }
        public string? ItYear1To { get; set; }
        public decimal? ItAmount1 { get; set; }
        public string? ItDate1 { get; set; }
        public string? ItYear2From { get; set; }
        public string? ItYear2To { get; set; }
        public decimal? ItAmount2 { get; set; }
        public string? ItDate2 { get; set; }
        public string? ItYear3From { get; set; }
        public string? ItYear3To { get; set; }
        public decimal? ItAmount3 { get; set; }
        public string? ItDate3 { get; set; }

        public string? ProTaxNo { get; set; }
        public string? ProTaxSince { get; set; }
        public string? PtYear1From { get; set; }
        public string? PtYear1To { get; set; }
        public decimal? PtAmount1 { get; set; }
        public string? PtDate1 { get; set; }
        public string? PtYear2From { get; set; }
        public string? PtYear2To { get; set; }
        public decimal? PtAmount2 { get; set; }
        public string? PtDate2 { get; set; }
        public string? PtYear3From { get; set; }
        public string? PtYear3To { get; set; }
        public decimal? PtAmount3 { get; set; }
        public string? PtDate3 { get; set; }
    }

    // ─── Step 7 — Collateral ─────────────────────────────────────────────────
    public class BlStep7Dto
    {
        public string? PropertyType { get; set; }
        public string? PropertyTypeOther { get; set; }
        public string? PropertyAddress { get; set; }
        public string? PropertyAddress2 { get; set; }
        public string? PropertyPinCode { get; set; }
        public string? PropertyTelephone { get; set; }
        public string? PropertyMobile { get; set; }

        public decimal? GalaArea { get; set; }
        public string? BuildingConstructionYear { get; set; }
        public string? CitySurveyNo { get; set; }
        public string? PlotNo { get; set; }
        public string? WardNo { get; set; }
        public string? CompletionCertDate { get; set; }
        public string? OcDate { get; set; }
        public string? ConveyanceDeedDate { get; set; }
        public string? HousingSocietyRegNo { get; set; }
        public string? MemberNo { get; set; }

        public string? LandArea { get; set; }
        public string? NaOrderDate { get; set; }
        public string? LandCitySurveyNo { get; set; }
        public string? LandPlotNo { get; set; }
        public string? LandWardNo { get; set; }
        public string? GutNo { get; set; }
        public string? HissaNo { get; set; }
        public string? EastBoundary { get; set; }
        public string? WestBoundary { get; set; }
        public string? SouthBoundary { get; set; }
        public string? NorthBoundary { get; set; }

        public decimal? GovtValuation { get; set; }
        public decimal? MarketValue { get; set; }

        public string? InsuranceCompanyName { get; set; }
        public string? InsuranceAddress { get; set; }
        public string? InsuranceAddress2 { get; set; }
        public string? InsurancePolicyNo { get; set; }
        public string? InsuranceFrom { get; set; }
        public string? InsuranceTo { get; set; }
        public decimal? InsuranceAmount { get; set; }
        public decimal? InsurancePremium { get; set; }
    }

    // ─── Full Submit DTO (all steps combined) ─────────────────────────────────
    public class BlFullSubmitDto
    {
        public BlStep1Dto Step1 { get; set; } = new();
        public BlStep2Dto Step2 { get; set; } = new();
        public BlStep3Dto Step3 { get; set; } = new();
        public BlStep4Dto Step4 { get; set; } = new();
        public List<ExtraGuarantorDto> ExtraGuarantors { get; set; } = new();
        public BlStep5Dto Step5 { get; set; } = new();
        public BlStep6Dto Step6 { get; set; } = new();
        public BlStep7Dto Step7 { get; set; } = new();
    }

    // ─── Response DTOs ────────────────────────────────────────────────────────
    public class BlApplicationResponse
    {
        public int Id { get; set; }
        public string Status { get; set; } = "";
        public string Message { get; set; } = "";
        public string? ApplicationNo { get; set; }
    }

    public class BlListItemDto
    {
        public int Id { get; set; }
        public string? ApplicantName { get; set; }
        public decimal? LoanAmount { get; set; }
        public string? Branch { get; set; }
        public string Status { get; set; } = "";
        public DateTime CreatedAt { get; set; }
        public string? MemberNo { get; set; }
        public string? LoanAccountNo { get; set; }
        public string? ApplicationNo { get; set; }
    }
}