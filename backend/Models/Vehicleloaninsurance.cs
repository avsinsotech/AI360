using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TushGptBackend.Models
{
    [Table("vehicle_loan_insurance")]
    public class VehicleLoanInsurance
    {
        [Key]
        public int Id { get; set; }

        public int ApplicationId { get; set; }

        // ── Vehicle Insurance ───────────────────────────────────────────────
        public string? InsCompanyNaav { get; set; }
        public string? InsAddress { get; set; }
        public string? InsPolicy { get; set; }
        public string? InsDurFrom { get; set; }
        public string? InsDurTo { get; set; }
        public string? InsAmount { get; set; }
        public string? InsPremium { get; set; }

        // ── Vehicle Valuation ───────────────────────────────────────────────
        public string? OldKimat { get; set; }
        public string? OldAdvance { get; set; }
        public string? OldShillak { get; set; }
        public string? OldValuationPrice { get; set; }

        // ── 50% Deposit ─────────────────────────────────────────────────────
        public bool? OldDepositYes { get; set; }
        public string? OldDepositAmt { get; set; }

        // ── Life Insurance ──────────────────────────────────────────────────
        public string? LifeInsCompany { get; set; }
        public string? LifeInsAddress { get; set; }
        public string? LifeInsPolicy { get; set; }
        public string? LifeInsDurFrom { get; set; }
        public string? LifeInsDurTo { get; set; }
        public string? LifeInsAmount { get; set; }
        public string? LifeInsPremium { get; set; }
        public string? LifeInsPremiumType { get; set; } // Monthly/Quarterly/Half-yearly/Yearly

        // ── Loan Against Policy ─────────────────────────────────────────────
        public bool? LifeInsLoanYes { get; set; }
        public string? LifeInsLoanBank { get; set; }
        public string? LifeInsLoanAmount { get; set; }
        public string? LifeInsLoanDate { get; set; }
        public string? LifeInsLoanAddress { get; set; } // Missing in previous version
        public string? LifeInsLoanBalance { get; set; }

        [ForeignKey("ApplicationId")]
        public VehicleLoanApplication? Application { get; set; }
        public string? ApplicationNo { get; set; }
    }
}