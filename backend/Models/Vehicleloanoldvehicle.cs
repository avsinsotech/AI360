using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TushGptBackend.Models
{
    [Table("vehicle_loan_old_vehicles")]
    public class VehicleLoanOldVehicle
    {
        [Key]
        public int Id { get; set; }

        public int ApplicationId { get; set; }

        // ── Vehicle Usage ───────────────────────────────────────────────────
        public string? VahanaVapar { get; set; }

        // ── Dealer / Seller Info ────────────────────────────────────────────
        public string? DealerNaav { get; set; }
        public string? DealerPatta { get; set; }
        public string? DealerMobile { get; set; }
        public string? DealerTel { get; set; }
        public string? DealerEmail { get; set; }

        // ── Vehicle Details ─────────────────────────────────────────────────
        public string? CompanyNaav { get; set; }
        public string? VehicleNo { get; set; }
        public string? RTO { get; set; }
        public string? VahanaPrakar { get; set; }
        public string? NirmitVarsh { get; set; }
        public string? EngineNo { get; set; }
        public string? ChassisNo { get; set; }
        public string? Model { get; set; }
        public string? FuelType { get; set; }

        // ── Fitness, Permit & Parking ───────────────────────────────────────
        public string? FitnessNo { get; set; }
        public string? FitnessRenew { get; set; }
        public string? ParkingThikan { get; set; }

        public string? PermitNo { get; set; }
        public string? PermitArea { get; set; }         // Local / State / National
        public string? PermitRenewDate { get; set; }
        public string? PermitFrom { get; set; }
        public string? PermitTo { get; set; }

        public string? RoadTax { get; set; }
        public string? RoadTaxPeriod { get; set; }

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