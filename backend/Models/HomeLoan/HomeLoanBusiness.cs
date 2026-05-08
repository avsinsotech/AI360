using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TushGptBackend.Models.HomeLoan
{
    [Table("home_loan_businesses")]
    public class HomeLoanBusiness
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int HomeLoanRequestId { get; set; }

        [Column(TypeName = "longtext")]
        public string BusinessNature { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string BusinessType { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string BusinessPremisesType { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string BusinessArea { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string BusinessFirmName { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string BusinessAddress { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string BusinessPin { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string BusinessPhone { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string BusinessEmail { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string BusinessPan { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string GumastaNo { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string SalesTaxNo { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string VatNo { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string ServiceTaxNo { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string OtherLicense { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string LicenseObtained { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string LicenseDetails { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string ResidentStatus { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string TaxRegistered { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string BusinessStartDate { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string BusinessExperience { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string BusinessAnnualIncome { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string BusinessAnnualExpenses { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string BusinessNetIncome { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CustomersJson { get; set; } = "[]";

        [Column(TypeName = "longtext")]
        public string SuppliersJson { get; set; } = "[]";

        // Navigation Properties
        [ForeignKey("HomeLoanRequestId")]
        [System.Text.Json.Serialization.JsonIgnore]
        public virtual HomeLoanRequest? Request { get; set; }
    }
}