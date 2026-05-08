using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TushGptBackend.Models
{
    [Table("vehicle_loan_business_info")]
    public class VehicleLoanBusinessInfo
    {
        [Key]
        public int Id { get; set; }

        public int ApplicationId { get; set; }

        public string? BizType { get; set; }           // Business Nature (Public Ltd, Pvt Ltd, etc.)
        public string? BizCategory { get; set; }       // Business Category
        public string? BizPremisesTypeJson { get; set; } // Array of premises types stored as JSON string
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
        
        // Customers
        public string? BizCust1Name { get; set; }
        public string? BizCust1Address { get; set; }
        public string? BizCust2Name { get; set; }
        public string? BizCust2Address { get; set; }
        
        // Suppliers
        public string? BizSupplier1Name { get; set; }
        public string? BizSupplier1Address { get; set; }
        public string? BizSupplier2Name { get; set; }
        public string? BizSupplier2Address { get; set; }

        [ForeignKey("ApplicationId")]
        public VehicleLoanApplication? Application { get; set; }
        public string? ApplicationNo { get; set; }
    }
}