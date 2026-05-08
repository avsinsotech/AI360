using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TushGptBackend.Models
{
    [Table("vehicle_loan_new_vehicles")]
    public class VehicleLoanNewVehicle
    {
        [Key]
        public int Id { get; set; }

        public int ApplicationId { get; set; }

        // ── Vehicle Usage ─────────────────────────────────────────────────── 
        public string? VahanaVapar { get; set; }        // Personal / Commercial

        // ── Vehicle Details ─────────────────────────────────────────────────
        public string? CompanyNaav { get; set; }        // Manufacturer Company
        public string? VahanaPrakar { get; set; }       // Vehicle Type
        public string? NirmitVarsh { get; set; }        // Manufacturing Year
        public string? Model { get; set; }              // Model No.
        public string? FuelType { get; set; }           // Diesel/Petrol/CNG/Electric

        // ── Dealer Info ─────────────────────────────────────────────────────
        public string? DealerNaav { get; set; }
        public string? DealerPatta { get; set; }
        public string? DealerMobile { get; set; }
        public string? DealerTel { get; set; }
        public string? DealerEmail { get; set; }

        // ── Price Details ───────────────────────────────────────────────────
        public string? Kimat { get; set; }              // Purchase Price
        public string? Booking { get; set; }            // Booking Amount
        public string? Shillak { get; set; }            // Balance Amount

        // ── 25% Deposit ─────────────────────────────────────────────────────
        public bool? DepositYes { get; set; }
        public string? DepositAmt { get; set; }

        // ── Permit & Parking ────────────────────────────────────────────────
        public string? ParkingThikan { get; set; }
        public string? PermitNo { get; set; }
        public string? PermitRenew { get; set; }

        // ── Other Vehicle ───────────────────────────────────────────────────
        public bool? OtherVehicleYes { get; set; }
        public string? OtherVehicleNo { get; set; }
        public string? OtherVehicleType { get; set; }
        public string? OtherVehicleModel { get; set; }
        public string? OtherVehicleYear { get; set; }

        [ForeignKey("ApplicationId")]
        public VehicleLoanApplication? Application { get; set; }
        public string? ApplicationNo { get; set; }
    }
}