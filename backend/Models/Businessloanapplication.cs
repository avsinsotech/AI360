// using System;
// using System.Collections.Generic;
// using System.ComponentModel.DataAnnotations;
// using System.ComponentModel.DataAnnotations.Schema;

// namespace TushGptBackend.Models
// {
//     // ── Main Application (Page 1 / Basic Info) ──────────────────────────────
//     [Table("business_loan_applications")]
//     public class BusinessLoanApplication
//     {
//         [Key] public int Id { get; set; }
//         public string? ClientCode { get; set; }
//         public DateTime? ApplicationDate { get; set; }
//         public string? MemberNo { get; set; }
//         public string? LoanAccountNo { get; set; }
//         public string? Branch { get; set; }

//         [Required] public string ApplicantName { get; set; } = "";
//         public int? ApplicantAge { get; set; }

//         public decimal? LoanAmount { get; set; }
//         public string? LoanAmountInWords { get; set; }
//         public int? RepaymentMonths { get; set; }
//         public int? FirstInstallmentAfterMonths { get; set; }
//         public int? InstallmentDate { get; set; }
//         public string? Purpose { get; set; }
//         public string? MaritalStatus { get; set; }
//         public int? Dependents { get; set; }

//         // Fixed guarantors (name/age on page 1)
//         public string? Guarantor1Name { get; set; }
//         public int? Guarantor1Age { get; set; }
//         public string? Guarantor2Name { get; set; }
//         public int? Guarantor2Age { get; set; }
//         public string? Guarantor3Name { get; set; }
//         public int? Guarantor3Age { get; set; }

//         public string Status { get; set; } = "Draft"; // Draft | Submitted
//         public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
//         public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
//         public int? CreatedByUserId { get; set; }

//         // Navigation
//         public BusinessLoanBorrower? Borrower { get; set; }
//         // public int Guarantor1Id { get; set; }
//         // public BusinessLoanGuarantor? Guarantor1 { get; set; }
//         // public int Guarantor2Id { get; set; }
//         // public BusinessLoanGuarantor? Guarantor2 { get; set; }
//         public List<BusinessLoanGuarantor> Guarantors { get; set; }
//         public ICollection<BusinessLoanExtraGuarantor> ExtraGuarantors { get; set; } = new List<BusinessLoanExtraGuarantor>();
//         public BusinessLoanBusinessInfo? BusinessInfo { get; set; }
//         public BusinessLoanInsuranceTaxInfo? InsuranceTaxInfo { get; set; }
//         public BusinessLoanCollateral? Collateral { get; set; }
//     }

//     // ── Person Info (shared shape for Borrower & Guarantors) ────────────────
//     // Borrower — prefix "b"
//     [Table("business_loan_borrowers")]
//     public class BusinessLoanBorrower
//     {
//         [Key] public int Id { get; set; }
//         public int ApplicationId { get; set; }

//         public string? PhotoBase64 { get; set; }
//         public string? FullName { get; set; }
//         public int? Age { get; set; }
//         public string? MemberNo { get; set; }
//         public int? SharesCount { get; set; }
//         public decimal? SharesAmount { get; set; }

//         public string? FatherHusbandName { get; set; }
//         public int? FatherHusbandAge { get; set; }
//         public string? MotherName { get; set; }
//         public int? MotherAge { get; set; }

//         public string? ResidentialAddress { get; set; }
//         public string? PinCode { get; set; }
//         public string? Telephone { get; set; }
//         public string? Mobile { get; set; }
//         public string? Email { get; set; }
//         public string? PropertyTypes { get; set; }   // comma-separated checkboxes
//         public int? ResidenceMonths { get; set; }
//         public int? ResidenceYears { get; set; }
//         public string? MaritalStatus { get; set; }
//         public int? Dependents { get; set; }

//         public string? CompanyName { get; set; }
//         public string? CompanyAddress { get; set; }
//         public string? CompanyPinCode { get; set; }
//         public string? CompanyTelephone { get; set; }
//         public string? CompanyMobile { get; set; }
//         public string? CompanyEmail { get; set; }
//         public string? Department { get; set; }
//         public string? Designation { get; set; }
//         public string? EmployeeCode { get; set; }
//         public int? EmploymentMonths { get; set; }
//         public int? EmploymentYears { get; set; }
//         public DateTime? RetirementDate { get; set; }

//         public decimal? MonthlySalary { get; set; }
//         public decimal? Deductions { get; set; }
//         public decimal? NetSalary { get; set; }
//         public decimal? AnnualBusinessIncome { get; set; }
//         public decimal? TotalExpenses { get; set; }
//         public decimal? NetAnnualIncome { get; set; }
//         public decimal? FamilyIncome { get; set; }
//         public string? FamilyIncomeType { get; set; }

//         public string? PropertyOwnerName { get; set; }
//         public string? PropertyOwnerRelation { get; set; }
//         public string? VillageMukkam { get; set; }
//         public string? VillagePost { get; set; }
//         public string? VillageTaluka { get; set; }
//         public string? VillageDistrict { get; set; }
//         public string? VillageState { get; set; }
//         public string? VillagePinCode { get; set; }
//         public string? VillageTelephone { get; set; }
//         public string? VillageMobile { get; set; }

//         // 93 – Previous loan
//         public string? PrevLoanType { get; set; }
//         public string? PrevLoanAccountNo { get; set; }
//         public decimal? PrevLoanAmount { get; set; }
//         public DateTime? PrevLoanTakenDate { get; set; }
//         public DateTime? PrevLoanRepaidDate { get; set; }

//         // 94a – Guarantor details
//         public string? Guar94aBorrowerName { get; set; }
//         public string? Guar94aLoanType { get; set; }
//         public string? Guar94aAccountNo { get; set; }
//         public decimal? Guar94aAmount { get; set; }
//         public DateTime? Guar94aTakenDate { get; set; }
//         public DateTime? Guar94aRepaidDate { get; set; }

//         // 94b
//         public string? Guar94bBorrowerName { get; set; }
//         public string? Guar94bLoanType { get; set; }
//         public string? Guar94bAccountNo { get; set; }
//         public decimal? Guar94bAmount { get; set; }
//         public DateTime? Guar94bTakenDate { get; set; }
//         public DateTime? Guar94bRepaidDate { get; set; }

//         // 95 – Family member loans
//         public string? FamilyLoanMemberName { get; set; }
//         public string? FamilyLoanType { get; set; }
//         public string? FamilyLoanAccountNo { get; set; }
//         public decimal? FamilyLoanAmount { get; set; }
//         public DateTime? FamilyLoanTakenDate { get; set; }
//         public DateTime? FamilyLoanRepaidDate { get; set; }

//         // 96 – Other bank loans
//         public string? OtherBankName { get; set; }
//         public string? OtherBankBranch { get; set; }
//         public string? OtherBankLoanType { get; set; }
//         public string? OtherBankAccountNo { get; set; }
//         public decimal? OtherBankLoanAmount { get; set; }
//         public DateTime? OtherBankLoanTakenDate { get; set; }
//         public DateTime? OtherBankLoanRepaidDate { get; set; }

//         public string? PlaceOfSign { get; set; }
//         public DateTime? DateOfSign { get; set; }

//         public BusinessLoanApplication? Application { get; set; }
//     }

//     // ── Fixed Guarantors (g1 and g2) — stored with GuarantorNumber 1 or 2 ──
//     [Table("business_loan_guarantors")]
//     public class BusinessLoanGuarantor
//     {
//         [Key] public int Id { get; set; }
//         public int ApplicationId { get; set; }
//         public int GuarantorNumber { get; set; }  // 1 or 2

//         public string? PhotoBase64 { get; set; }
//         public string? FullName { get; set; }
//         public int? Age { get; set; }
//         public string? MemberNo { get; set; }
//         public int? SharesCount { get; set; }
//         public decimal? SharesAmount { get; set; }

//         public string? FatherHusbandName { get; set; }
//         public int? FatherHusbandAge { get; set; }
//         public string? MotherName { get; set; }
//         public int? MotherAge { get; set; }

//         public string? ResidentialAddress { get; set; }
//         public string? PinCode { get; set; }
//         public string? Telephone { get; set; }
//         public string? Mobile { get; set; }
//         public string? Email { get; set; }
//         public string? PropertyTypes { get; set; }
//         public int? ResidenceMonths { get; set; }
//         public int? ResidenceYears { get; set; }
//         public string? MaritalStatus { get; set; }
//         public int? Dependents { get; set; }

//         public string? CompanyName { get; set; }
//         public string? CompanyAddress { get; set; }
//         public string? CompanyPinCode { get; set; }
//         public string? CompanyTelephone { get; set; }
//         public string? CompanyMobile { get; set; }
//         public string? CompanyEmail { get; set; }
//         public string? Department { get; set; }
//         public string? Designation { get; set; }
//         public string? EmployeeCode { get; set; }
//         public int? EmploymentMonths { get; set; }
//         public int? EmploymentYears { get; set; }
//         public DateTime? RetirementDate { get; set; }

//         public decimal? MonthlySalary { get; set; }
//         public decimal? Deductions { get; set; }
//         public decimal? NetSalary { get; set; }
//         public decimal? AnnualBusinessIncome { get; set; }
//         public decimal? TotalExpenses { get; set; }
//         public decimal? NetAnnualIncome { get; set; }
//         public decimal? FamilyIncome { get; set; }
//         public string? FamilyIncomeType { get; set; }

//         public string? PropertyOwnerName { get; set; }
//         public string? PropertyOwnerRelation { get; set; }
//         public string? VillageMukkam { get; set; }
//         public string? VillagePost { get; set; }
//         public string? VillageTaluka { get; set; }
//         public string? VillageDistrict { get; set; }
//         public string? VillageState { get; set; }
//         public string? VillagePinCode { get; set; }
//         public string? VillageTelephone { get; set; }
//         public string? VillageMobile { get; set; }

//         public string? PrevLoanType { get; set; }
//         public string? PrevLoanAccountNo { get; set; }
//         public decimal? PrevLoanAmount { get; set; }
//         public DateTime? PrevLoanTakenDate { get; set; }
//         public DateTime? PrevLoanRepaidDate { get; set; }

//         public string? Guar94aBorrowerName { get; set; }
//         public string? Guar94aLoanType { get; set; }
//         public string? Guar94aAccountNo { get; set; }
//         public decimal? Guar94aAmount { get; set; }
//         public DateTime? Guar94aTakenDate { get; set; }
//         public DateTime? Guar94aRepaidDate { get; set; }

//         public string? Guar94bBorrowerName { get; set; }
//         public string? Guar94bLoanType { get; set; }
//         public string? Guar94bAccountNo { get; set; }
//         public decimal? Guar94bAmount { get; set; }
//         public DateTime? Guar94bTakenDate { get; set; }
//         public DateTime? Guar94bRepaidDate { get; set; }

//         public string? FamilyLoanMemberName { get; set; }
//         public string? FamilyLoanType { get; set; }
//         public string? FamilyLoanAccountNo { get; set; }
//         public decimal? FamilyLoanAmount { get; set; }
//         public DateTime? FamilyLoanTakenDate { get; set; }
//         public DateTime? FamilyLoanRepaidDate { get; set; }

//         public string? OtherBankName { get; set; }
//         public string? OtherBankBranch { get; set; }
//         public string? OtherBankLoanType { get; set; }
//         public string? OtherBankAccountNo { get; set; }
//         public decimal? OtherBankLoanAmount { get; set; }
//         public DateTime? OtherBankLoanTakenDate { get; set; }
//         public DateTime? OtherBankLoanRepaidDate { get; set; }

//         public string? PlaceOfSign { get; set; }
//         public DateTime? DateOfSign { get; set; }

//         public BusinessLoanApplication? Application { get; set; }
//     }

//     // ── Extra Guarantors (added dynamically) ────────────────────────────────
//     [Table("business_loan_extra_guarantors")]
//     public class BusinessLoanExtraGuarantor
//     {
//         [Key] public int Id { get; set; }
//         public int ApplicationId { get; set; }
//         public int GuarantorNumber { get; set; }  // 3, 4, 5 ...
//         public string? FrontendId { get; set; }   // stores the React timestamp id

//         public string? PhotoBase64 { get; set; }
//         public string? FullName { get; set; }
//         public int? Age { get; set; }
//         public string? MemberNo { get; set; }
//         public int? SharesCount { get; set; }
//         public decimal? SharesAmount { get; set; }

//         public string? FatherHusbandName { get; set; }
//         public int? FatherHusbandAge { get; set; }
//         public string? MotherName { get; set; }
//         public int? MotherAge { get; set; }

//         public string? ResidentialAddress { get; set; }
//         public string? PinCode { get; set; }
//         public string? Telephone { get; set; }
//         public string? Mobile { get; set; }
//         public string? Email { get; set; }
//         public string? PropertyTypes { get; set; }
//         public int? ResidenceMonths { get; set; }
//         public int? ResidenceYears { get; set; }
//         public string? MaritalStatus { get; set; }
//         public int? Dependents { get; set; }

//         public string? CompanyName { get; set; }
//         public string? CompanyAddress { get; set; }
//         public string? CompanyPinCode { get; set; }
//         public string? CompanyTelephone { get; set; }
//         public string? CompanyMobile { get; set; }
//         public string? CompanyEmail { get; set; }
//         public string? Department { get; set; }
//         public string? Designation { get; set; }
//         public string? EmployeeCode { get; set; }
//         public int? EmploymentMonths { get; set; }
//         public int? EmploymentYears { get; set; }
//         public DateTime? RetirementDate { get; set; }

//         public decimal? MonthlySalary { get; set; }
//         public decimal? Deductions { get; set; }
//         public decimal? NetSalary { get; set; }
//         public decimal? AnnualBusinessIncome { get; set; }
//         public decimal? TotalExpenses { get; set; }
//         public decimal? NetAnnualIncome { get; set; }
//         public decimal? FamilyIncome { get; set; }
//         public string? FamilyIncomeType { get; set; }

//         public string? PropertyOwnerName { get; set; }
//         public string? PropertyOwnerRelation { get; set; }
//         public string? VillageMukkam { get; set; }
//         public string? VillagePost { get; set; }
//         public string? VillageTaluka { get; set; }
//         public string? VillageDistrict { get; set; }
//         public string? VillageState { get; set; }
//         public string? VillagePinCode { get; set; }
//         public string? VillageTelephone { get; set; }
//         public string? VillageMobile { get; set; }

//         public string? PrevLoanType { get; set; }
//         public string? PrevLoanAccountNo { get; set; }
//         public decimal? PrevLoanAmount { get; set; }
//         public DateTime? PrevLoanTakenDate { get; set; }
//         public DateTime? PrevLoanRepaidDate { get; set; }

//         public string? Guar94aBorrowerName { get; set; }
//         public string? Guar94aLoanType { get; set; }
//         public string? Guar94aAccountNo { get; set; }
//         public decimal? Guar94aAmount { get; set; }
//         public DateTime? Guar94aTakenDate { get; set; }
//         public DateTime? Guar94aRepaidDate { get; set; }

//         public string? Guar94bBorrowerName { get; set; }
//         public string? Guar94bLoanType { get; set; }
//         public string? Guar94bAccountNo { get; set; }
//         public decimal? Guar94bAmount { get; set; }
//         public DateTime? Guar94bTakenDate { get; set; }
//         public DateTime? Guar94bRepaidDate { get; set; }

//         public string? FamilyLoanMemberName { get; set; }
//         public string? FamilyLoanType { get; set; }
//         public string? FamilyLoanAccountNo { get; set; }
//         public decimal? FamilyLoanAmount { get; set; }
//         public DateTime? FamilyLoanTakenDate { get; set; }
//         public DateTime? FamilyLoanRepaidDate { get; set; }

//         public string? OtherBankName { get; set; }
//         public string? OtherBankBranch { get; set; }
//         public string? OtherBankLoanType { get; set; }
//         public string? OtherBankAccountNo { get; set; }
//         public decimal? OtherBankLoanAmount { get; set; }
//         public DateTime? OtherBankLoanTakenDate { get; set; }
//         public DateTime? OtherBankLoanRepaidDate { get; set; }

//         public string? PlaceOfSign { get; set; }
//         public DateTime? DateOfSign { get; set; }

//         public BusinessLoanApplication? Application { get; set; }
//     }

//     // ── Business Info (Page 5) ───────────────────────────────────────────────
//     [Table("business_loan_business_info")]
//     public class BusinessLoanBusinessInfo
//     {
//         [Key] public int Id { get; set; }
//         public int ApplicationId { get; set; }

//         public string? BusinessNature { get; set; }
//         public string? BusinessType { get; set; }
//         public string? BusinessPropertyType { get; set; }
//         public decimal? FloorArea { get; set; }

//         public string? FirmName { get; set; }
//         public string? Address { get; set; }
//         public string? Address2 { get; set; }
//         public string? PinCode { get; set; }
//         public string? Phone { get; set; }
//         public string? Email { get; set; }

//         public string? PanCardNo { get; set; }
//         public string? GumastaLicenseNo { get; set; }
//         public string? SalesTaxNo { get; set; }
//         public string? VatNo { get; set; }
//         public string? ServiceTaxNo { get; set; }
//         public string? OtherLicense { get; set; }
//         public bool? AllLicensesAvailable { get; set; }
//         public bool? IsSmallIndustryResident { get; set; }

//         public string? SinceWhen { get; set; }
//         public string? Experience { get; set; }

//         public decimal? TotalAnnualIncome { get; set; }
//         public decimal? TotalAnnualExpenses { get; set; }
//         public decimal? NetAnnualIncome { get; set; }

//         public string? Customer1Name { get; set; }
//         public string? Customer1Address { get; set; }
//         public string? Customer2Name { get; set; }
//         public string? Customer2Address { get; set; }
//         public string? Supplier1Name { get; set; }
//         public string? Supplier1Address { get; set; }
//         public string? Supplier2Name { get; set; }
//         public string? Supplier2Address { get; set; }

//         public string? Extra1 { get; set; }
//         public string? Extra2 { get; set; }
//         public string? Extra3 { get; set; }
//         public string? Extra4 { get; set; }

//         public BusinessLoanApplication? Application { get; set; }
//     }

//     // ── Insurance & Tax Info (Page 6) ────────────────────────────────────────
//     [Table("business_loan_insurance_tax")]
//     public class BusinessLoanInsuranceTaxInfo
//     {
//         [Key] public int Id { get; set; }
//         public int ApplicationId { get; set; }

//         // Life Insurance
//         public string? InsuranceCompanyName { get; set; }
//         public string? InsuranceAddress { get; set; }
//         public string? InsurancePolicyNo { get; set; }
//         public DateTime? InsuranceFrom { get; set; }
//         public DateTime? InsuranceTo { get; set; }
//         public decimal? InsuranceAmount { get; set; }
//         public decimal? InsurancePremium { get; set; }
//         public string? InsurancePremiumFrequency { get; set; }

//         // Policy Loan
//         public bool? HasPolicyLoan { get; set; }
//         public string? PolicyLoanBankName { get; set; }
//         public string? PolicyLoanBankAddress { get; set; }
//         public decimal? PolicyLoanAmount { get; set; }
//         public DateTime? PolicyLoanDate { get; set; }
//         public decimal? PolicyLoanBalance { get; set; }

//         // Income Tax
//         public string? PanCardNo { get; set; }
//         public string? IncomeTaxSince { get; set; }
//         public string? ItYear1From { get; set; }
//         public string? ItYear1To { get; set; }
//         public decimal? ItAmount1 { get; set; }
//         public DateTime? ItDate1 { get; set; }
//         public string? ItYear2From { get; set; }
//         public string? ItYear2To { get; set; }
//         public decimal? ItAmount2 { get; set; }
//         public DateTime? ItDate2 { get; set; }
//         public string? ItYear3From { get; set; }
//         public string? ItYear3To { get; set; }
//         public decimal? ItAmount3 { get; set; }
//         public DateTime? ItDate3 { get; set; }

//         // Professional Tax
//         public string? ProTaxNo { get; set; }
//         public string? ProTaxSince { get; set; }
//         public string? PtYear1From { get; set; }
//         public string? PtYear1To { get; set; }
//         public decimal? PtAmount1 { get; set; }
//         public DateTime? PtDate1 { get; set; }
//         public string? PtYear2From { get; set; }
//         public string? PtYear2To { get; set; }
//         public decimal? PtAmount2 { get; set; }
//         public DateTime? PtDate2 { get; set; }
//         public string? PtYear3From { get; set; }
//         public string? PtYear3To { get; set; }
//         public decimal? PtAmount3 { get; set; }
//         public DateTime? PtDate3 { get; set; }

//         public BusinessLoanApplication? Application { get; set; }
//     }

//     // ── Collateral Property (Page 7) ─────────────────────────────────────────
//     [Table("business_loan_collateral")]
//     public class BusinessLoanCollateral
//     {
//         [Key] public int Id { get; set; }
//         public int ApplicationId { get; set; }

//         public string? PropertyType { get; set; }
//         public string? PropertyTypeOther { get; set; }
//         public string? PropertyAddress { get; set; }
//         public string? PropertyAddress2 { get; set; }
//         public string? PropertyPinCode { get; set; }
//         public string? PropertyTelephone { get; set; }
//         public string? PropertyMobile { get; set; }

//         // Shop/Flat details
//         public decimal? GalaArea { get; set; }
//         public string? BuildingConstructionYear { get; set; }
//         public string? CitySurveyNo { get; set; }
//         public string? PlotNo { get; set; }
//         public string? WardNo { get; set; }
//         public DateTime? CompletionCertDate { get; set; }
//         public DateTime? OcDate { get; set; }
//         public DateTime? ConveyanceDeedDate { get; set; }
//         public string? HousingSocietyRegNo { get; set; }
//         public string? MemberNo { get; set; }

//         // Land details
//         public string? LandArea { get; set; }
//         public DateTime? NaOrderDate { get; set; }
//         public string? LandCitySurveyNo { get; set; }
//         public string? LandPlotNo { get; set; }
//         public string? LandWardNo { get; set; }
//         public string? GutNo { get; set; }
//         public string? HissaNo { get; set; }
//         public string? EastBoundary { get; set; }
//         public string? WestBoundary { get; set; }
//         public string? SouthBoundary { get; set; }
//         public string? NorthBoundary { get; set; }

//         // Valuation
//         public decimal? GovtValuation { get; set; }
//         public decimal? MarketValue { get; set; }

//         // Property Insurance
//         public string? InsuranceCompanyName { get; set; }
//         public string? InsuranceAddress { get; set; }
//         public string? InsuranceAddress2 { get; set; }
//         public string? InsurancePolicyNo { get; set; }
//         public DateTime? InsuranceFrom { get; set; }
//         public DateTime? InsuranceTo { get; set; }
//         public decimal? InsuranceAmount { get; set; }
//         public decimal? InsurancePremium { get; set; }

//         public BusinessLoanApplication? Application { get; set; }
//     }
// }
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TushGptBackend.Models
{
    // ── Main Application ─────────────────────────────────────────────────────
    [Table("business_loan_applications")]
    public class BusinessLoanApplication
    {
        [Key] public int Id { get; set; }
        public string? ClientCode { get; set; }
        public DateTime? ApplicationDate { get; set; }
        public string? MemberNo { get; set; }
        public string? LoanAccountNo { get; set; }
        public string? Branch { get; set; }
        public string? ApplicationNo { get; set; }

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

        // Fixed guarantors summary (name/age from page 1)
        public string? Guarantor1Name { get; set; }
        public int? Guarantor1Age { get; set; }
        public string? Guarantor2Name { get; set; }
        public int? Guarantor2Age { get; set; }
        public string? Guarantor3Name { get; set; }
        public int? Guarantor3Age { get; set; }

        public string Status { get; set; } = "Draft";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public int? CreatedByUserId { get; set; }

        // ── Document Summary ──
        public int TotalDocuments { get; set; } = 0;
        public int UploadedDocuments { get; set; } = 0;
        public int VerifiedDocuments { get; set; } = 0;
        public int PendingDocuments { get; set; } = 0;
        public string? DocumentStatus { get; set; } = "PENDING";
        public decimal DocumentCompletionPercentage { get; set; } = 0;

        // Navigation properties
        public BusinessLoanBorrower? Borrower { get; set; }
        public List<BusinessLoanGuarantor> Guarantors { get; set; } = new List<BusinessLoanGuarantor>();
        public ICollection<BusinessLoanExtraGuarantor> ExtraGuarantors { get; set; } = new List<BusinessLoanExtraGuarantor>();
        public BusinessLoanBusinessInfo? BusinessInfo { get; set; }
        public BusinessLoanInsuranceTaxInfo? InsuranceTaxInfo { get; set; }
        public BusinessLoanCollateral? Collateral { get; set; }
    }

    // ── Borrower ─────────────────────────────────────────────────────────────
    [Table("business_loan_borrowers")]
    public class BusinessLoanBorrower
    {
        [Key] public int Id { get; set; }
        public int ApplicationId { get; set; }
        public string? ApplicationNo { get; set; }
        public string? ClientCode { get; set; }

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
        public string? PropertyTypes { get; set; }
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
        public DateTime? RetirementDate { get; set; }
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
        public string? PrevLoanType { get; set; }
        public string? PrevLoanAccountNo { get; set; }
        public decimal? PrevLoanAmount { get; set; }
        public DateTime? PrevLoanTakenDate { get; set; }
        public DateTime? PrevLoanRepaidDate { get; set; }
        public string? Guar94aBorrowerName { get; set; }
        public string? Guar94aLoanType { get; set; }
        public string? Guar94aAccountNo { get; set; }
        public decimal? Guar94aAmount { get; set; }
        public DateTime? Guar94aTakenDate { get; set; }
        public DateTime? Guar94aRepaidDate { get; set; }
        public string? Guar94bBorrowerName { get; set; }
        public string? Guar94bLoanType { get; set; }
        public string? Guar94bAccountNo { get; set; }
        public decimal? Guar94bAmount { get; set; }
        public DateTime? Guar94bTakenDate { get; set; }
        public DateTime? Guar94bRepaidDate { get; set; }
        public string? FamilyLoanMemberName { get; set; }
        public string? FamilyLoanType { get; set; }
        public string? FamilyLoanAccountNo { get; set; }
        public decimal? FamilyLoanAmount { get; set; }
        public DateTime? FamilyLoanTakenDate { get; set; }
        public DateTime? FamilyLoanRepaidDate { get; set; }
        public string? OtherBankName { get; set; }
        public string? OtherBankBranch { get; set; }
        public string? OtherBankLoanType { get; set; }
        public string? OtherBankAccountNo { get; set; }
        public decimal? OtherBankLoanAmount { get; set; }
        public DateTime? OtherBankLoanTakenDate { get; set; }
        public DateTime? OtherBankLoanRepaidDate { get; set; }
        public string? PlaceOfSign { get; set; }
        public DateTime? DateOfSign { get; set; }

        public BusinessLoanApplication? Application { get; set; }
    }

    // ── Fixed Guarantors (GuarantorNumber 1 or 2) ───────────────────────────
    [Table("business_loan_guarantors")]
    public class BusinessLoanGuarantor
    {
        [Key] public int Id { get; set; }
        public int ApplicationId { get; set; }
        public string? ApplicationNo { get; set; }
        public string? ClientCode { get; set; }
        public int GuarantorNumber { get; set; }

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
        public string? PropertyTypes { get; set; }
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
        public DateTime? RetirementDate { get; set; }
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
        public string? PrevLoanType { get; set; }
        public string? PrevLoanAccountNo { get; set; }
        public decimal? PrevLoanAmount { get; set; }
        public DateTime? PrevLoanTakenDate { get; set; }
        public DateTime? PrevLoanRepaidDate { get; set; }
        public string? Guar94aBorrowerName { get; set; }
        public string? Guar94aLoanType { get; set; }
        public string? Guar94aAccountNo { get; set; }
        public decimal? Guar94aAmount { get; set; }
        public DateTime? Guar94aTakenDate { get; set; }
        public DateTime? Guar94aRepaidDate { get; set; }
        public string? Guar94bBorrowerName { get; set; }
        public string? Guar94bLoanType { get; set; }
        public string? Guar94bAccountNo { get; set; }
        public decimal? Guar94bAmount { get; set; }
        public DateTime? Guar94bTakenDate { get; set; }
        public DateTime? Guar94bRepaidDate { get; set; }
        public string? FamilyLoanMemberName { get; set; }
        public string? FamilyLoanType { get; set; }
        public string? FamilyLoanAccountNo { get; set; }
        public decimal? FamilyLoanAmount { get; set; }
        public DateTime? FamilyLoanTakenDate { get; set; }
        public DateTime? FamilyLoanRepaidDate { get; set; }
        public string? OtherBankName { get; set; }
        public string? OtherBankBranch { get; set; }
        public string? OtherBankLoanType { get; set; }
        public string? OtherBankAccountNo { get; set; }
        public decimal? OtherBankLoanAmount { get; set; }
        public DateTime? OtherBankLoanTakenDate { get; set; }
        public DateTime? OtherBankLoanRepaidDate { get; set; }
        public string? PlaceOfSign { get; set; }
        public DateTime? DateOfSign { get; set; }

        public BusinessLoanApplication? Application { get; set; }
    }

    // ── Extra Guarantors (GuarantorNumber 3, 4, 5...) ───────────────────────
    [Table("business_loan_extra_guarantors")]
    public class BusinessLoanExtraGuarantor
    {
        [Key] public int Id { get; set; }
        public int ApplicationId { get; set; }
        public string? ApplicationNo { get; set; }
        public string? ClientCode { get; set; }
        public int GuarantorNumber { get; set; }
        public string? FrontendId { get; set; }

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
        public string? PropertyTypes { get; set; }
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
        public DateTime? RetirementDate { get; set; }
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
        public string? PrevLoanType { get; set; }
        public string? PrevLoanAccountNo { get; set; }
        public decimal? PrevLoanAmount { get; set; }
        public DateTime? PrevLoanTakenDate { get; set; }
        public DateTime? PrevLoanRepaidDate { get; set; }
        public string? Guar94aBorrowerName { get; set; }
        public string? Guar94aLoanType { get; set; }
        public string? Guar94aAccountNo { get; set; }
        public decimal? Guar94aAmount { get; set; }
        public DateTime? Guar94aTakenDate { get; set; }
        public DateTime? Guar94aRepaidDate { get; set; }
        public string? Guar94bBorrowerName { get; set; }
        public string? Guar94bLoanType { get; set; }
        public string? Guar94bAccountNo { get; set; }
        public decimal? Guar94bAmount { get; set; }
        public DateTime? Guar94bTakenDate { get; set; }
        public DateTime? Guar94bRepaidDate { get; set; }
        public string? FamilyLoanMemberName { get; set; }
        public string? FamilyLoanType { get; set; }
        public string? FamilyLoanAccountNo { get; set; }
        public decimal? FamilyLoanAmount { get; set; }
        public DateTime? FamilyLoanTakenDate { get; set; }
        public DateTime? FamilyLoanRepaidDate { get; set; }
        public string? OtherBankName { get; set; }
        public string? OtherBankBranch { get; set; }
        public string? OtherBankLoanType { get; set; }
        public string? OtherBankAccountNo { get; set; }
        public decimal? OtherBankLoanAmount { get; set; }
        public DateTime? OtherBankLoanTakenDate { get; set; }
        public DateTime? OtherBankLoanRepaidDate { get; set; }
        public string? PlaceOfSign { get; set; }
        public DateTime? DateOfSign { get; set; }

        public BusinessLoanApplication? Application { get; set; }
    }

    // ── Business Info ────────────────────────────────────────────────────────
    [Table("business_loan_business_info")]
    public class BusinessLoanBusinessInfo
    {
        [Key] public int Id { get; set; }
        public int ApplicationId { get; set; }
        public string? ApplicationNo { get; set; }
        public string? ClientCode { get; set; }
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

        public BusinessLoanApplication? Application { get; set; }
    }

    // ── Insurance & Tax Info ─────────────────────────────────────────────────
    [Table("business_loan_insurance_tax")]
    public class BusinessLoanInsuranceTaxInfo
    {
        [Key] public int Id { get; set; }
        public int ApplicationId { get; set; }
        public string? ApplicationNo { get; set; }
        public string? ClientCode { get; set; }
        public string? InsuranceCompanyName { get; set; }
        public string? InsuranceAddress { get; set; }
        public string? InsurancePolicyNo { get; set; }
        public DateTime? InsuranceFrom { get; set; }
        public DateTime? InsuranceTo { get; set; }
        public decimal? InsuranceAmount { get; set; }
        public decimal? InsurancePremium { get; set; }
        public string? InsurancePremiumFrequency { get; set; }
        public bool? HasPolicyLoan { get; set; }
        public string? PolicyLoanBankName { get; set; }
        public string? PolicyLoanBankAddress { get; set; }
        public decimal? PolicyLoanAmount { get; set; }
        public DateTime? PolicyLoanDate { get; set; }
        public decimal? PolicyLoanBalance { get; set; }
        public string? PanCardNo { get; set; }
        public string? IncomeTaxSince { get; set; }
        public string? ItYear1From { get; set; }
        public string? ItYear1To { get; set; }
        public decimal? ItAmount1 { get; set; }
        public DateTime? ItDate1 { get; set; }
        public string? ItYear2From { get; set; }
        public string? ItYear2To { get; set; }
        public decimal? ItAmount2 { get; set; }
        public DateTime? ItDate2 { get; set; }
        public string? ItYear3From { get; set; }
        public string? ItYear3To { get; set; }
        public decimal? ItAmount3 { get; set; }
        public DateTime? ItDate3 { get; set; }
        public string? ProTaxNo { get; set; }
        public string? ProTaxSince { get; set; }
        public string? PtYear1From { get; set; }
        public string? PtYear1To { get; set; }
        public decimal? PtAmount1 { get; set; }
        public DateTime? PtDate1 { get; set; }
        public string? PtYear2From { get; set; }
        public string? PtYear2To { get; set; }
        public decimal? PtAmount2 { get; set; }
        public DateTime? PtDate2 { get; set; }
        public string? PtYear3From { get; set; }
        public string? PtYear3To { get; set; }
        public decimal? PtAmount3 { get; set; }
        public DateTime? PtDate3 { get; set; }

        public BusinessLoanApplication? Application { get; set; }
    }

    // ── Collateral ───────────────────────────────────────────────────────────
    [Table("business_loan_collateral")]
    public class BusinessLoanCollateral
    {
        [Key] public int Id { get; set; }
        public int ApplicationId { get; set; }
        public string? ApplicationNo { get; set; }
        public string? ClientCode { get; set; }
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
        public DateTime? CompletionCertDate { get; set; }
        public DateTime? OcDate { get; set; }
        public DateTime? ConveyanceDeedDate { get; set; }
        public string? HousingSocietyRegNo { get; set; }
        public string? MemberNo { get; set; }
        public string? LandArea { get; set; }
        public DateTime? NaOrderDate { get; set; }
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
        public DateTime? InsuranceFrom { get; set; }
        public DateTime? InsuranceTo { get; set; }
        public decimal? InsuranceAmount { get; set; }
        public decimal? InsurancePremium { get; set; }

        public BusinessLoanApplication? Application { get; set; }
    }
}