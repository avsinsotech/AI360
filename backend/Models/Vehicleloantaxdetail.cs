using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TushGptBackend.Models
{
    [Table("vehicle_loan_tax_details")]
    public class VehicleLoanTaxDetail
    {
        [Key]
        public int Id { get; set; }

        public int ApplicationId { get; set; }

        public string? TaxType { get; set; } // "INCOME" or "PROFESSIONAL"
        public string? Year { get; set; }
        public string? Amount { get; set; }
        public string? Date { get; set; }

        [ForeignKey("ApplicationId")]
        public VehicleLoanApplication? Application { get; set; }
        public string? ApplicationNo { get; set; }
    }
}