using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TushGptBackend.Models
{
    [Table("vehicle_loan_guarantors")]
    public class VehicleLoanGuarantor : VehicleLoanPersonBase
    {
        [Key]
        public int Id { get; set; }

        public int ApplicationId { get; set; }

        /// <summary>1 = Guarantor 1, 2 = Guarantor 2</summary>
        public int GuarantorNumber { get; set; }

        [ForeignKey("ApplicationId")]
        public VehicleLoanApplication? Application { get; set; }
    }
}