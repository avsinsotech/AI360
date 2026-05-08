using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TushGptBackend.Models.HomeLoan
{
    [Table("home_loan_insurances")]
    public class HomeLoanInsurance
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int HomeLoanRequestId { get; set; }

        [Column(TypeName = "longtext")]
        public string InsuranceCompany { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string InsuranceAddress { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string InsurancePolicyNo { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string InsuranceFrom { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string InsuranceTo { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string InsuranceAmount { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string InsurancePremium { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string InsurancePremiumType { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string PolicyLoan { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string PolicyLoanBank { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string PolicyLoanAddress { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string PolicyLoanAmount { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string PolicyLoanDate { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string PolicyLoanBalance { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string PanNo { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string IncomeTaxSince { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string TaxRowsJson { get; set; } = "[]";

        [Column(TypeName = "longtext")]
        public string ProfTaxNo { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string ProfTaxSince { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string ProfTaxRowsJson { get; set; } = "[]";

        [Column(TypeName = "longtext")]
        public string InsuranceDetails { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string OtherDetails { get; set; } = string.Empty;

        // Navigation Properties
        [ForeignKey("HomeLoanRequestId")]
        [System.Text.Json.Serialization.JsonIgnore]
        public virtual HomeLoanRequest? Request { get; set; }
    }
}
