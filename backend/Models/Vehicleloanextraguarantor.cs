using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TushGptBackend.Models
{
    [Table("vehicle_loan_extra_guarantors")]
    public class VehicleLoanExtraGuarantor : VehicleLoanPersonBase
    {
        [Key]
        public int Id { get; set; }

        public int ApplicationId { get; set; }

        /// <summary>Frontend-generated unique ID for this extra guarantor</summary>
        public string? FrontendId { get; set; }

        /// <summary>Guarantor number: 3, 4, 5, ...</summary>
        public int GuarantorNumber { get; set; }

        [ForeignKey("ApplicationId")]
        public VehicleLoanApplication? Application { get; set; }
    }
}