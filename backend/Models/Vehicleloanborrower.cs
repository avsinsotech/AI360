using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TushGptBackend.Models
{
    [Table("vehicle_loan_borrowers")]
    public class VehicleLoanBorrower : VehicleLoanPersonBase
    {
        [Key]
        public int Id { get; set; }

        public int ApplicationId { get; set; }

        [ForeignKey("ApplicationId")]
        public VehicleLoanApplication? Application { get; set; }
    }
}