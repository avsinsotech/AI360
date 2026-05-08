using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TushGptBackend.Models.HomeLoan
{
    [Table("home_loan_borrowers")]
    public class HomeLoanBorrower
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int HomeLoanRequestId { get; set; }

        [Column(TypeName = "longtext")]
        public string FullName { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string Age { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string MemberNo { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string SharesCount { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string SharesAmount { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string FatherName { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string FatherAge { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string MotherName { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string MotherAge { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string Address { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string OfficeAddress { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string GavchaAddress { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string PinCode { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string Phone { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string Mobile { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string Email { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string ResidenceType { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string StayMonths { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string StayYears { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string MaritalStatus { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string Dependents { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string Company { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CompanyAddress { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CompanyPin { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CompanyTel { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CompanyMobile { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CompanyEmail { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string Department { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string Designation { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string EmployeeCode { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string JobMonths { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string JobYears { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string RetirementDate { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string MonthlySalary { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string Deductions { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string NetSalary { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string AnnualIncome { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string AnnualExpenses { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string NetAnnualIncome { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string FamilyIncome { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string FamilyIncomeType { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string LandOwnerName { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string LandOwnerRelation { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string Village { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string Post { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string Taluka { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string District { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string State { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string VillagePin { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string VillageMobile { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string PrevLoansJson { get; set; } = "[]";

        [Column(TypeName = "longtext")]
        public string GuarantorLoansJson { get; set; } = "[]";

        [Column(TypeName = "longtext")]
        public string OtherBankLoansJson { get; set; } = "[]";

        // Navigation Properties
        [ForeignKey("HomeLoanRequestId")]
        [System.Text.Json.Serialization.JsonIgnore]
        public virtual HomeLoanRequest? Request { get; set; }
    }
}
