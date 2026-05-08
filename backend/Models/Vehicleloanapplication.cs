using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;

namespace TushGptBackend.Models
{
    [Table("vehicle_loan_applications")]
    public class VehicleLoanApplication
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(20)]
        public string ClientCode { get; set; } = "";

        public string Status { get; set; } = "DRAFT"; // DRAFT, SUBMITTED, APPROVED, REJECTED

        // ── Page 1: Basic Info ──────────────────────────────────────────────
        public string? Dinank { get; set; }             // Application Date
        public string? SaCra { get; set; }              // Member No.
        public string? KarjKhate { get; set; }          // Loan A/C No.
        public string? Shakha { get; set; }             // Branch

        public string? ArjdarNaav { get; set; }         // Applicant Name
        public string? ArjdarVay { get; set; }          // Applicant Age
        public string? KarjRakkam { get; set; }         // Loan Amount (numeric string)
        public string? Akshari { get; set; }            // Loan Amount in words
        public string? ParatfedKalavadhi { get; set; }  // Repayment Period (months)
        public string? PahilaHapta { get; set; }        // First Installment after (months)
        public string? Tarikh { get; set; }             // Installment date (day of month)
        public string? Karan { get; set; }              // Loan Purpose/Reason
        public string? Vaivahik { get; set; }           // Marital Status
        public string? Avalambun { get; set; }          // Dependents
        public string? VyajDar { get; set; }           // Interest Rate (%)

        // Fixed 3 guarantors (summary on page 1)
        public string? Jameen1Naav { get; set; }
        public string? Jameen1Vay { get; set; }
        public string? Jameen2Naav { get; set; }
        public string? Jameen2Vay { get; set; }
        public string? Jameen3Naav { get; set; }
        public string? Jameen3Vay { get; set; }
        
        // ── Step 8: Additional fields ──────────────────────────────────────
        public string? IncTaxPan { get; set; }          // Step 8: IT PAN
        public string? IncTaxSinceYear { get; set; }
        public string? ProfTaxNo { get; set; }          // Step 8: PT Number
        public string? ProfTaxSinceYear { get; set; }
        public string? BizExtraInfo { get; set; }       // Step 8: Extra Info
        public string? ApplicationNo { get; set; }      // Auto-generated Application Number

        // ── Raw JSON (full form state for all dynamic fields) ───────────────
        public string? RawJson { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // ── Document Summary ──
        public int TotalDocuments { get; set; } = 0;
        public int UploadedDocuments { get; set; } = 0;
        public int VerifiedDocuments { get; set; } = 0;
        public int PendingDocuments { get; set; } = 0;
        public string? DocumentStatus { get; set; } = "PENDING";
        public decimal DocumentCompletionPercentage { get; set; } = 0;

        // ── Navigation Properties ───────────────────────────────────────────
        public VehicleLoanBorrower? Borrower { get; set; }

        // Guarantor1 and Guarantor2 are stored in vehicle_loan_guarantors
        // distinguished by GuarantorNumber (1 or 2).
        // EF cannot do filtered HasOne, so we use a collection + [NotMapped] helpers.
        public ICollection<VehicleLoanGuarantor> Guarantors { get; set; } = new List<VehicleLoanGuarantor>();

        [NotMapped]
        public VehicleLoanGuarantor? Guarantor1 => Guarantors.FirstOrDefault(g => g.GuarantorNumber == 1);

        [NotMapped]
        public VehicleLoanGuarantor? Guarantor2 => Guarantors.FirstOrDefault(g => g.GuarantorNumber == 2);

        public ICollection<VehicleLoanExtraGuarantor> ExtraGuarantors { get; set; } = new List<VehicleLoanExtraGuarantor>();
        public VehicleLoanNewVehicle? NewVehicle { get; set; }
        public VehicleLoanOldVehicle? OldVehicle { get; set; }
        public VehicleLoanInsurance? Insurance { get; set; }
        public VehicleLoanBusinessInfo? BusinessInfo { get; set; }
        public ICollection<VehicleLoanTaxDetail> TaxDetails { get; set; } = new List<VehicleLoanTaxDetail>();
    }
}