using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TushGptBackend.Models
{
    public class PersonalLoan
    {
        [Key]
        public int Id { get; set; }

        public string? ApplicationDate { get; set; }
        public string? ApplicationNo { get; set; }
        public string? ClientCode { get; set; }
        public string? MemberNumber { get; set; }
        public string? LoanAccountNumber { get; set; }
        public string? BranchName { get; set; }
        public string? ApplicantName { get; set; }
        public long? Age { get; set; }
        public decimal? LoanAmount { get; set; }
        public string? AmountInWords { get; set; }
        public long? RepaymentPeriodMonths { get; set; }
        public long? FirstInstallmentAfterMonths { get; set; }
        public long? InstallmentDay { get; set; }
        public string? LoanPurpose { get; set; }
        public string? MaritalStatus { get; set; }
        public long? DependentsCount { get; set; }
        public decimal? InterestRate { get; set; }
        
        public string? Guarantor1NameSummary { get; set; }
        public long? Guarantor1AgeSummary { get; set; }
        public string? Guarantor2NameSummary { get; set; }
        public long? Guarantor2AgeSummary { get; set; }
        public string? Guarantor3NameSummary { get; set; }
        public long? Guarantor3AgeSummary { get; set; }

        // Navigation Properties
        public virtual BorrowerInfo? Borrower { get; set; }
        public virtual Guarantor1Info? Guarantor1 { get; set; }
        public virtual Guarantor2Info? Guarantor2 { get; set; }
        public virtual OfficeInfo? Office { get; set; }

        public string? CoApplicantName { get; set; }
        public long? CoApplicantAge { get; set; }
        public string? ExtraGuarantorsJson { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }

        // ── Document Summary ──
        public int TotalDocuments { get; set; } = 0;
        public int UploadedDocuments { get; set; } = 0;
        public int VerifiedDocuments { get; set; } = 0;
        public int PendingDocuments { get; set; } = 0;
        public string? DocumentStatus { get; set; } = "PENDING";
        public decimal DocumentCompletionPercentage { get; set; } = 0;
    }

    public class BorrowerInfo
    {
        [Key]
        public int Id { get; set; }
        public int PersonalLoanId { get; set; }
        public string? ApplicationNo { get; set; }
        public string? ClientCode { get; set; }

        [Column(TypeName = "longtext")]
        public string? Photo { get; set; } 
        public string? FullName { get; set; }
        public long? Age { get; set; }
        public string? MemberNumber { get; set; }
        public long? SharesCount { get; set; }
        public decimal? SharesAmount { get; set; }
        public string? FatherHusbandName { get; set; }
        public long? FatherHusbandAge { get; set; }
        public string? MotherName { get; set; }
        public long? MotherAge { get; set; }
        public string? ResidentialAddressLine1 { get; set; }
        public string? ResidentialAddressLine2 { get; set; }
        public string? PinCode { get; set; }
        public string? Telephone { get; set; }
        public string? Mobile { get; set; }
        public string? Email { get; set; }
        public string? NatureOfResidence { get; set; } 
        public long? DurationMonths { get; set; }
        public long? DurationYears { get; set; }
        public string? MaritalStatus { get; set; }
        public long? DependentsCount { get; set; }
        public string? CompanyName { get; set; }
        public string? CompanyAddressLine1 { get; set; }
        public string? CompanyAddressLine2 { get; set; }
        public string? CompanyPinCode { get; set; }
        public string? CompanyTelephone { get; set; }
        public string? CompanyMobile { get; set; }
        public string? CompanyEmail { get; set; }
        public string? Department { get; set; }
        public string? Designation { get; set; }
        public string? EmployeeCode { get; set; }
        public long? ServiceMonths { get; set; }
        public long? ServiceYears { get; set; }
        public string? ServiceDateDay { get; set; }
        public string? ServiceDateMonth { get; set; }
        public string? ServiceDateYear { get; set; }

        // KYC Fields
        public string? AadharNo { get; set; }
        public string? Dob { get; set; }
        public string? PanNo { get; set; }

        public decimal? MonthlySalary { get; set; }
        public decimal? TotalDeductions { get; set; }
        public decimal? NetSalary { get; set; }
        public decimal? AnnualIncome { get; set; }
        public decimal? TotalExpenses { get; set; }
        public decimal? NetAnnualIncome { get; set; }
        public decimal? NetFamilyIncome { get; set; }
        public string? IncomeType { get; set; }
        public string? PropertyOwnerName { get; set; }
        public string? RelationWithApplicant { get; set; }
        public string? VillageAddress { get; set; }
        public string? VillageMukkam { get; set; }
        public string? VillagePost { get; set; }
        public string? VillageTaluka { get; set; }
        public string? VillageDistrict { get; set; }
        public string? VillageState { get; set; }
        public string? VillagePinCode { get; set; }
        public string? VillageTelephone { get; set; }
        public string? VillageMobile { get; set; }
        public string? PreviousLoanType { get; set; }
        public string? PreviousLoanAccountNo { get; set; }
        public decimal? PreviousLoanAmount { get; set; }
        public string? PreviousLoanTakenDate { get; set; }
        public string? PreviousLoanRepaymentDate { get; set; }
        public string? GuaranteedLoan1BorrowerName { get; set; }
        public string? GuaranteedLoan1Type { get; set; }
        public string? GuaranteedLoan1AccountNo { get; set; }
        public decimal? GuaranteedLoan1Amount { get; set; }
        public string? GuaranteedLoan1TakenDate { get; set; }
        public string? GuaranteedLoan1RepaymentDate { get; set; }
        public string? GuaranteedLoan2BorrowerName { get; set; }
        public string? GuaranteedLoan2Type { get; set; }
        public string? GuaranteedLoan2AccountNo { get; set; }
        public decimal? GuaranteedLoan2Amount { get; set; }
        public string? GuaranteedLoan2TakenDate { get; set; }
        public string? GuaranteedLoan2RepaymentDate { get; set; }
        public string? OtherBankLoanInstitutionName { get; set; }
        public string? OtherBankLoanBranchName { get; set; }
        public string? OtherBankLoanType { get; set; }
        public string? OtherBankLoanAccountNo { get; set; }
        public decimal? OtherBankLoanAmount { get; set; }
        public string? OtherBankLoanTakenDate { get; set; }
        public string? OtherBankLoanRepaymentDate { get; set; }
        public string? Place { get; set; }
        public string? Date { get; set; }

        // Added fields
        public string? EmploymentType { get; set; }
        public string? FamilyLoanBorrowerName { get; set; }
        public string? FamilyLoanType { get; set; }
        public string? FamilyLoanAccountNo { get; set; }
        public decimal? FamilyLoanAmount { get; set; }
        public string? FamilyLoanTakenDate { get; set; }
        public string? FamilyLoanRepaymentDate { get; set; }

        public string? OfficeAddress { get; set; }
        public string? GavchaAddress { get; set; }
    }

    public class Guarantor1Info
    {
        [Key]
        public int Id { get; set; }
        public int PersonalLoanId { get; set; }
        public string? ApplicationNo { get; set; }
        public string? ClientCode { get; set; }

        [Column(TypeName = "longtext")]
        public string? Photo { get; set; }
        public string? FullName { get; set; }
        public long? Age { get; set; }
        public string? MemberNumber { get; set; }
        public long? SharesCount { get; set; }
        public decimal? SharesAmount { get; set; }
        public string? FatherHusbandName { get; set; }
        public long? FatherHusbandAge { get; set; }
        public string? MotherName { get; set; }
        public long? MotherAge { get; set; }
        public string? ResidentialAddressLine1 { get; set; }
        public string? ResidentialAddressLine2 { get; set; }
        public string? PinCode { get; set; }
        public string? Telephone { get; set; }
        public string? Mobile { get; set; }
        public string? Email { get; set; }
        public string? NatureOfResidence { get; set; }
        public long? DurationMonths { get; set; }
        public long? DurationYears { get; set; }
        public string? MaritalStatus { get; set; }
        public long? DependentsCount { get; set; }
        public string? CompanyName { get; set; }
        public string? CompanyAddressLine1 { get; set; }
        public string? CompanyAddressLine2 { get; set; }
        public string? CompanyPinCode { get; set; }
        public string? CompanyTelephone { get; set; }
        public string? CompanyMobile { get; set; }
        public string? CompanyEmail { get; set; }
        public string? Department { get; set; }
        public string? Designation { get; set; }
        public string? EmployeeCode { get; set; }
        public long? ServiceMonths { get; set; }
        public long? ServiceYears { get; set; }
        public string? ServiceDateDay { get; set; }
        public string? ServiceDateMonth { get; set; }
        public string? ServiceDateYear { get; set; }
        public decimal? MonthlySalary { get; set; }
        public decimal? TotalDeductions { get; set; }
        public decimal? NetSalary { get; set; }
        public decimal? AnnualIncome { get; set; }
        public decimal? TotalExpenses { get; set; }
        public decimal? NetAnnualIncome { get; set; }
        public decimal? NetFamilyIncome { get; set; }
        public string? IncomeType { get; set; }
        public string? PropertyOwnerName { get; set; }
        public string? RelationWithApplicant { get; set; }
        public string? VillageAddress { get; set; }
        public string? VillageMukkam { get; set; }
        public string? VillagePost { get; set; }
        public string? VillageTaluka { get; set; }
        public string? VillageDistrict { get; set; }
        public string? VillageState { get; set; }
        public string? VillagePinCode { get; set; }
        public string? VillageTelephone { get; set; }
        public string? VillageMobile { get; set; }
        public string? PreviousLoanType { get; set; }
        public string? PreviousLoanAccountNo { get; set; }
        public decimal? PreviousLoanAmount { get; set; }
        public string? PreviousLoanTakenDate { get; set; }
        public string? PreviousLoanRepaymentDate { get; set; }
        public string? GuaranteedLoan1BorrowerName { get; set; }
        public string? GuaranteedLoan1Type { get; set; }
        public string? GuaranteedLoan1AccountNo { get; set; }
        public decimal? GuaranteedLoan1Amount { get; set; }
        public string? GuaranteedLoan1TakenDate { get; set; }
        public string? GuaranteedLoan1RepaymentDate { get; set; }
        public string? GuaranteedLoan2BorrowerName { get; set; }
        public string? GuaranteedLoan2Type { get; set; }
        public string? GuaranteedLoan2AccountNo { get; set; }
        public decimal? GuaranteedLoan2Amount { get; set; }
        public string? GuaranteedLoan2TakenDate { get; set; }
        public string? GuaranteedLoan2RepaymentDate { get; set; }
        public string? OtherBankLoanInstitutionName { get; set; }
        public string? OtherBankLoanBranchName { get; set; }
        public string? OtherBankLoanType { get; set; }
        public string? OtherBankLoanAccountNo { get; set; }
        public decimal? OtherBankLoanAmount { get; set; }
        public string? OtherBankLoanTakenDate { get; set; }
        public string? OtherBankLoanRepaymentDate { get; set; }
        public string? Place { get; set; }
        public string? Date { get; set; }

        // Added fields
        public string? EmploymentType { get; set; }
        public string? FamilyLoanBorrowerName { get; set; }
        public string? FamilyLoanType { get; set; }
        public string? FamilyLoanAccountNo { get; set; }
        public decimal? FamilyLoanAmount { get; set; }
        public string? FamilyLoanTakenDate { get; set; }
        public string? FamilyLoanRepaymentDate { get; set; }
    }

    public class Guarantor2Info
    {
        [Key]
        public int Id { get; set; }
        public int PersonalLoanId { get; set; }
        public string? ApplicationNo { get; set; }
        public string? ClientCode { get; set; }

        [Column(TypeName = "longtext")]
        public string? Photo { get; set; }
        public string? FullName { get; set; }
        public long? Age { get; set; }
        public string? MemberNumber { get; set; }
        public long? SharesCount { get; set; }
        public decimal? SharesAmount { get; set; }
        public string? FatherHusbandName { get; set; }
        public long? FatherHusbandAge { get; set; }
        public string? MotherName { get; set; }
        public long? MotherAge { get; set; }
        public string? ResidentialAddressLine1 { get; set; }
        public string? ResidentialAddressLine2 { get; set; }
        public string? PinCode { get; set; }
        public string? Telephone { get; set; }
        public string? Mobile { get; set; }
        public string? Email { get; set; }
        public string? NatureOfResidence { get; set; }
        public long? DurationMonths { get; set; }
        public long? DurationYears { get; set; }
        public string? MaritalStatus { get; set; }
        public long? DependentsCount { get; set; }
        public string? CompanyName { get; set; }
        public string? CompanyAddressLine1 { get; set; }
        public string? CompanyAddressLine2 { get; set; }
        public string? CompanyPinCode { get; set; }
        public string? CompanyTelephone { get; set; }
        public string? CompanyMobile { get; set; }
        public string? CompanyEmail { get; set; }
        public string? Department { get; set; }
        public string? Designation { get; set; }
        public string? EmployeeCode { get; set; }
        public int? ServiceMonths { get; set; }
        public int? ServiceYears { get; set; }
        public string? ServiceDateDay { get; set; }
        public string? ServiceDateMonth { get; set; }
        public string? ServiceDateYear { get; set; }
        public decimal? MonthlySalary { get; set; }
        public decimal? TotalDeductions { get; set; }
        public decimal? NetSalary { get; set; }
        public decimal? AnnualIncome { get; set; }
        public decimal? TotalExpenses { get; set; }
        public decimal? NetAnnualIncome { get; set; }
        public decimal? NetFamilyIncome { get; set; }
        public string? IncomeType { get; set; }
        public string? PropertyOwnerName { get; set; }
        public string? RelationWithApplicant { get; set; }
        public string? VillageAddress { get; set; }
        public string? VillageMukkam { get; set; }
        public string? VillagePost { get; set; }
        public string? VillageTaluka { get; set; }
        public string? VillageDistrict { get; set; }
        public string? VillageState { get; set; }
        public string? VillagePinCode { get; set; }
        public string? VillageTelephone { get; set; }
        public string? VillageMobile { get; set; }
        public string? PreviousLoanType { get; set; }
        public string? PreviousLoanAccountNo { get; set; }
        public decimal? PreviousLoanAmount { get; set; }
        public string? PreviousLoanTakenDate { get; set; }
        public string? PreviousLoanRepaymentDate { get; set; }
        public string? GuaranteedLoan1BorrowerName { get; set; }
        public string? GuaranteedLoan1Type { get; set; }
        public string? GuaranteedLoan1AccountNo { get; set; }
        public decimal? GuaranteedLoan1Amount { get; set; }
        public string? GuaranteedLoan1TakenDate { get; set; }
        public string? GuaranteedLoan1RepaymentDate { get; set; }
        public string? GuaranteedLoan2BorrowerName { get; set; }
        public string? GuaranteedLoan2Type { get; set; }
        public string? GuaranteedLoan2AccountNo { get; set; }
        public decimal? GuaranteedLoan2Amount { get; set; }
        public string? GuaranteedLoan2TakenDate { get; set; }
        public string? GuaranteedLoan2RepaymentDate { get; set; }
        public string? OtherBankLoanInstitutionName { get; set; }
        public string? OtherBankLoanBranchName { get; set; }
        public string? OtherBankLoanType { get; set; }
        public string? OtherBankLoanAccountNo { get; set; }
        public decimal? OtherBankLoanAmount { get; set; }
        public string? OtherBankLoanTakenDate { get; set; }
        public string? OtherBankLoanRepaymentDate { get; set; }
        public string? Place { get; set; }
        public string? Date { get; set; }

        // Added fields
        public string? EmploymentType { get; set; }
        public string? FamilyLoanBorrowerName { get; set; }
        public string? FamilyLoanType { get; set; }
        public string? FamilyLoanAccountNo { get; set; }
        public decimal? FamilyLoanAmount { get; set; }
        public string? FamilyLoanTakenDate { get; set; }
        public string? FamilyLoanRepaymentDate { get; set; }
    }

    public class OfficeInfo
    {
        [Key]
        public int Id { get; set; }
        public int PersonalLoanId { get; set; }
        public string? ApplicationNo { get; set; }
        public string? ClientCode { get; set; }

        public string? Place { get; set; }
        public string? ApplicationDay { get; set; }
        public string? ApplicationMonth { get; set; }
        public string? ApplicationYear { get; set; }

        public string? MemberAccountNumber { get; set; } 

        // Niyam Fields
        public string? NiyamApplicantName { get; set; }
        public string? NiyamGuarantor1Name { get; set; }
        public string? NiyamGuarantor2Name { get; set; }
        public string? NiyamGuarantor3Name { get; set; }
        public string? NiyamPlace { get; set; }
        public string? NiyamDate { get; set; }

        // Office Use Fields
        public string? OfficeApplicantName { get; set; }
        public string? OfficeApplicationNumber { get; set; }
        public string? OfficeRemark { get; set; }
        public string? OfficeDate { get; set; }
    }

    public class PersonalLoanRequest
    {
        public int? id { get; set; }
        public string? applicationNo { get; set; }
        public string? clientCode { get; set; }
        public string? dinank { get; set; }
        public string? sabasadCrNo { get; set; }
        public string? saCra { get; set; }
        public string? karjKhate { get; set; }
        public string? shakha { get; set; }
        public string? arjdarNaav { get; set; }
        public int? arjdarVay { get; set; }
        public string? saharjdarNaav { get; set; }
        public int? saharjdarVay { get; set; }
        public decimal? karjRakkam { get; set; }
        public string? akshari { get; set; }
        public long? paratfedKalavadhi { get; set; }
        public long? pahilaHapta { get; set; }
        public long? tarikh { get; set; }
        public string? karan { get; set; }
        public decimal? vyajDar { get; set; }
        public string? vaivahik { get; set; }
        public long? avalambun { get; set; }
        public string? jameen1Naav { get; set; }
        public long? jameen1Vay { get; set; }
        public string? jameen2Naav { get; set; }
        public long? jameen2Vay { get; set; }
        public string? jameen3Naav { get; set; }
        public long? jameen3Vay { get; set; }

        // Borrower
        public string? bPhoto { get; set; }
        public string? bNaav { get; set; }
        public long? bVay { get; set; }
        public string? bSabasadNo { get; set; }
        public long? bShares { get; set; }
        public decimal? bSharesRakkam { get; set; }
        public string? bVadilNaav { get; set; }
        public long? bVadilVay { get; set; }
        public string? bAaiNaav { get; set; }
        public long? bAaiVay { get; set; }
        public string? bPatta { get; set; }
        public string? bPatta2 { get; set; }
        public string? bPinKod { get; set; }
        public string? bDurdhvani { get; set; }
        public string? bMobile { get; set; }
        public string? bEmail { get; set; }
        public object? bJageSwaarup { get; set; } // Changed to object to handle string or array
        public long? bKalavadhi_m { get; set; }
        public long? bKalavadhi_v { get; set; }
        public string? bVaivahik { get; set; }
        public long? bAvalambun { get; set; }
        public string? bEmpType { get; set; } // Missing
        public string? bCompany { get; set; }
        public string? bCompanyPatta { get; set; }
        public string? bCompanyPatta2 { get; set; }
        public string? bCompanyPin { get; set; }
        public string? bCompanyTel { get; set; }
        public string? bCompanyMobile { get; set; }
        public string? bCompanyEmail { get; set; }
        public string? bVibhag { get; set; }
        public string? bHudda { get; set; }
        public string? bEmpCode { get; set; }
        public int? bKarj_m { get; set; }
        public int? bKarj_v { get; set; }
        public string? bSeva { get; set; }
        public string? bSeva_d { get; set; }
        public string? bSeva_m { get; set; }
        public string? bSeva_y { get; set; }
        public decimal? bMonthlyVetan { get; set; }
        public decimal? bKapat { get; set; }
        public decimal? bNiwal { get; set; }
        public decimal? bVaarshik { get; set; }
        public decimal? bKharcha { get; set; }
        public decimal? bNiwalVaarshik { get; set; }
        public decimal? bKutumb { get; set; }
        public string? bKutumbType { get; set; }
        public string? bShetiNaav { get; set; }
        public string? bShetiNaate { get; set; }
        public string? bGaavPatta { get; set; }
        public string? bGaavMukkam { get; set; }
        public string? bGaavPost { get; set; }
        public string? bGaavTaluka { get; set; }
        public string? bGaavJilha { get; set; }
        public string? bGaavRajya { get; set; }
        public string? bGaavPin { get; set; }
        public string? bGaavDurdhvani { get; set; }
        public string? bGaavMobile { get; set; }
        public string? bPurvKarjPrakar { get; set; }
        public string? bPurvKhate { get; set; }
        public decimal? bPurvRakkam { get; set; }
        public string? bPurvDin1 { get; set; }
        public string? bPurvDin2 { get; set; }
        public string? bJam94aKarjdarNaav { get; set; }
        public string? bJam94aPrakar { get; set; }
        public string? bJam94aKhate { get; set; }
        public decimal? bJam94aRakkam { get; set; }
        public string? bJam94aDin1 { get; set; }
        public string? bJam94aDin2 { get; set; }
        public string? bJam94bKarjdarNaav { get; set; }
        public string? bJam94bPrakar { get; set; }
        public string? bJam94bKhate { get; set; }
        public decimal? bJam94bRakkam { get; set; }
        public string? bJam94bDin1 { get; set; }
        public string? bJam94bDin2 { get; set; }
        public string? bKutumb95Naav { get; set; } // Missing
        public string? bKutumb95Prakar { get; set; } // Missing
        public string? bKutumb95Khate { get; set; } // Missing
        public decimal? bKutumb95Rakkam { get; set; } // Missing
        public string? bKutumb95Din1 { get; set; } // Missing
        public string? bKutumb95Din2 { get; set; } // Missing

        // KYC Fields
        public string? bAadhar { get; set; }
        public string? bDob { get; set; }
        public string? bPan { get; set; }

        public string? bBank96Naav { get; set; }
        public string? bBank96Shakha { get; set; }
        public string? bBank96Prakar { get; set; }
        public string? bBank96Khate { get; set; }
        public decimal? bBank96Rakkam { get; set; }
        public string? bBank96Din1 { get; set; }
        public string? bBank96Din2 { get; set; }
        public string? bThikan { get; set; }
        public string? bDinank { get; set; }
        public string? bOfficeAddress { get; set; }
        public string? bGavchaAddress { get; set; }

        // Guarantor 1
        public string? g1Photo { get; set; }
        public string? g1Naav { get; set; }
        public int? g1Vay { get; set; }
        public string? g1SabasadNo { get; set; }
        public int? g1Shares { get; set; }
        public decimal? g1SharesRakkam { get; set; }
        public string? g1VadilNaav { get; set; }
        public int? g1VadilVay { get; set; }
        public string? g1AaiNaav { get; set; }
        public int? g1AaiVay { get; set; }
        public string? g1Patta { get; set; }
        public string? g1Patta2 { get; set; }
        public string? g1PinKod { get; set; }
        public string? g1Durdhvani { get; set; }
        public string? g1Mobile { get; set; }
        public string? g1Email { get; set; }
        public object? g1JageSwaarup { get; set; } // Changed
        public int? g1Kalavadhi_m { get; set; }
        public int? g1Kalavadhi_v { get; set; }
        public string? g1Vaivahik { get; set; }
        public int? g1Avalambun { get; set; }
        public string? g1EmpType { get; set; } // Missing
        public string? g1Company { get; set; }
        public string? g1CompanyPatta { get; set; }
        public string? g1CompanyPatta2 { get; set; }
        public string? g1CompanyPin { get; set; }
        public string? g1CompanyTel { get; set; }
        public string? g1CompanyMobile { get; set; }
        public string? g1CompanyEmail { get; set; }
        public string? g1Vibhag { get; set; }
        public string? g1Hudda { get; set; }
        public string? g1EmpCode { get; set; }
        public int? g1Karj_m { get; set; }
        public int? g1Karj_v { get; set; }
        public string? g1Seva { get; set; }
        public string? g1Seva_d { get; set; }
        public string? g1Seva_m { get; set; }
        public string? g1Seva_y { get; set; }
        public decimal? g1MonthlyVetan { get; set; }
        public decimal? g1Kapat { get; set; }
        public decimal? g1Niwal { get; set; }
        public decimal? g1Vaarshik { get; set; }
        public decimal? g1Kharcha { get; set; }
        public decimal? g1NiwalVaarshik { get; set; }
        public decimal? g1Kutumb { get; set; }
        public string? g1KutumbType { get; set; }
        public string? g1ShetiNaav { get; set; }
        public string? g1ShetiNaate { get; set; }
        public string? g1GaavPatta { get; set; }
        public string? g1GaavMukkam { get; set; }
        public string? g1GaavPost { get; set; }
        public string? g1GaavTaluka { get; set; }
        public string? g1GaavJilha { get; set; }
        public string? g1GaavRajya { get; set; }
        public string? g1GaavPin { get; set; }
        public string? g1GaavDurdhvani { get; set; }
        public string? g1GaavMobile { get; set; }
        public string? g1PurvKarjPrakar { get; set; }
        public string? g1PurvKhate { get; set; }
        public decimal? g1PurvRakkam { get; set; }
        public string? g1PurvDin1 { get; set; }
        public string? g1PurvDin2 { get; set; }
        public string? g1Jam94aKarjdarNaav { get; set; }
        public string? g1Jam94aPrakar { get; set; }
        public string? g1Jam94aKhate { get; set; }
        public decimal? g1Jam94aRakkam { get; set; }
        public string? g1Jam94aDin1 { get; set; }
        public string? g1Jam94aDin2 { get; set; }
        public string? g1Jam94bKarjdarNaav { get; set; }
        public string? g1Jam94bPrakar { get; set; }
        public string? g1Jam94bKhate { get; set; }
        public decimal? g1Jam94bRakkam { get; set; }
        public string? g1Jam94bDin1 { get; set; }
        public string? g1Jam94bDin2 { get; set; }
        public string? g1Kutumb95Naav { get; set; } // Missing
        public string? g1Kutumb95Prakar { get; set; } // Missing
        public string? g1Kutumb95Khate { get; set; } // Missing
        public decimal? g1Kutumb95Rakkam { get; set; } // Missing
        public string? g1Kutumb95Din1 { get; set; } // Missing
        public string? g1Kutumb95Din2 { get; set; } // Missing
        public string? g1Bank96Naav { get; set; }
        public string? g1Bank96Shakha { get; set; }
        public string? g1Bank96Prakar { get; set; }
        public string? g1Bank96Khate { get; set; }
        public decimal? g1Bank96Rakkam { get; set; }
        public string? g1Bank96Din1 { get; set; }
        public string? g1Bank96Din2 { get; set; }
        public string? g1Thikan { get; set; }
        public string? g1Dinank { get; set; }

        // Guarantor 2
        public string? g2Photo { get; set; }
        public string? g2Naav { get; set; }
        public int? g2Vay { get; set; }
        public string? g2SabasadNo { get; set; }
        public int? g2Shares { get; set; }
        public decimal? g2SharesRakkam { get; set; }
        public string? g2VadilNaav { get; set; }
        public int? g2VadilVay { get; set; }
        public string? g2AaiNaav { get; set; }
        public int? g2AaiVay { get; set; }
        public string? g2Patta { get; set; }
        public string? g2Patta2 { get; set; }
        public string? g2PinKod { get; set; }
        public string? g2Durdhvani { get; set; }
        public string? g2Mobile { get; set; }
        public string? g2Email { get; set; }
        public object? g2JageSwaarup { get; set; } // Changed
        public int? g2Kalavadhi_m { get; set; }
        public int? g2Kalavadhi_v { get; set; }
        public string? g2Vaivahik { get; set; }
        public int? g2Avalambun { get; set; }
        public string? g2EmpType { get; set; } // Missing
        public string? g2Company { get; set; }
        public string? g2CompanyPatta { get; set; }
        public string? g2CompanyPatta2 { get; set; }
        public string? g2CompanyPin { get; set; }
        public string? g2CompanyTel { get; set; }
        public string? g2CompanyMobile { get; set; }
        public string? g2CompanyEmail { get; set; }
        public string? g2Vibhag { get; set; }
        public string? g2Hudda { get; set; }
        public string? g2EmpCode { get; set; }
        public int? g2Karj_m { get; set; }
        public int? g2Karj_v { get; set; }
        public string? g2Seva { get; set; }
        public string? g2Seva_d { get; set; }
        public string? g2Seva_m { get; set; }
        public string? g2Seva_y { get; set; }
        public decimal? g2MonthlyVetan { get; set; }
        public decimal? g2Kapat { get; set; }
        public decimal? g2Niwal { get; set; }
        public decimal? g2Vaarshik { get; set; }
        public decimal? g2Kharcha { get; set; }
        public decimal? g2NiwalVaarshik { get; set; }
        public decimal? g2Kutumb { get; set; }
        public string? g2KutumbType { get; set; }
        public string? g2ShetiNaav { get; set; }
        public string? g2ShetiNaate { get; set; }
        public string? g2GaavPatta { get; set; }
        public string? g2GaavMukkam { get; set; }
        public string? g2GaavPost { get; set; }
        public string? g2GaavTaluka { get; set; }
        public string? g2GaavJilha { get; set; }
        public string? g2GaavRajya { get; set; }
        public string? g2GaavPin { get; set; }
        public string? g2GaavDurdhvani { get; set; }
        public string? g2GaavMobile { get; set; }
        public string? g2PurvKarjPrakar { get; set; }
        public string? g2PurvKhate { get; set; }
        public decimal? g2PurvRakkam { get; set; }
        public string? g2PurvDin1 { get; set; }
        public string? g2PurvDin2 { get; set; }
        public string? g2Jam94aKarjdarNaav { get; set; }
        public string? g2Jam94aPrakar { get; set; }
        public string? g2Jam94aKhate { get; set; }
        public decimal? g2Jam94aRakkam { get; set; }
        public string? g2Jam94aDin1 { get; set; }
        public string? g2Jam94aDin2 { get; set; }
        public string? g2Jam94bKarjdarNaav { get; set; }
        public string? g2Jam94bPrakar { get; set; }
        public string? g2Jam94bKhate { get; set; }
        public decimal? g2Jam94bRakkam { get; set; }
        public string? g2Jam94bDin1 { get; set; }
        public string? g2Jam94bDin2 { get; set; }
        public string? g2Kutumb95Naav { get; set; } // Missing
        public string? g2Kutumb95Prakar { get; set; } // Missing
        public string? g2Kutumb95Khate { get; set; } // Missing
        public decimal? g2Kutumb95Rakkam { get; set; } // Missing
        public string? g2Kutumb95Din1 { get; set; } // Missing
        public string? g2Kutumb95Din2 { get; set; } // Missing
        public string? g2Bank96Naav { get; set; }
        public string? g2Bank96Shakha { get; set; }
        public string? g2Bank96Prakar { get; set; }
        public string? g2Bank96Khate { get; set; }
        public decimal? g2Bank96Rakkam { get; set; }
        public string? g2Bank96Din1 { get; set; }
        public string? g2Bank96Din2 { get; set; }
        public string? g2Thikan { get; set; }
        public string? g2Dinank { get; set; }

        // Office
        public string? thikan { get; set; }
        public string? dinank_d { get; set; }
        public string? dinank_m { get; set; }
        public string? dinank_y { get; set; }
        public string? niyamArjdarNaav { get; set; }
        public string? niyamJam1Naav { get; set; }
        public string? niyamJam2Naav { get; set; }
        public string? niyamJam3Naav { get; set; }
        public string? niyamTikaan { get; set; }
        public string? niyamDinank { get; set; }
        public string? officeArjdarNaav { get; set; }
        public string? officeArjCr { get; set; }
        public string? officeKaran { get; set; }
        public string? officeDinank { get; set; }

        // Handle arrays from frontend state
        public object? extraGuarantors { get; set; }
    }
}