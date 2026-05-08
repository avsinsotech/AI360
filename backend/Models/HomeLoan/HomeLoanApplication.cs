using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TushGptBackend.Models.HomeLoan
{
    /// <summary>
    /// Single master table for Home Loan applications.
    /// Matches the EXACT schema of home_loan_applications in MySQL.
    /// </summary>
    [Table("home_loan_applications")]
    public class HomeLoanApplication
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [MaxLength(30)]
        public string ApplicationNo { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? ClientCode { get; set; }

        [MaxLength(255)]
        public string Status { get; set; } = "DRAFT";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // ── Document Summary ──
        public int TotalDocuments { get; set; } = 0;
        public int UploadedDocuments { get; set; } = 0;
        public int VerifiedDocuments { get; set; } = 0;
        public int PendingDocuments { get; set; } = 0;
        public string? DocumentStatus { get; set; } = "PENDING";
        public decimal DocumentCompletionPercentage { get; set; } = 0;

        // ── Searchable fields (longtext in DB) ──
        [Column(TypeName = "longtext")]
        public string? ApplicationDate { get; set; }

        [Column(TypeName = "longtext")]
        public string? Branch { get; set; }

        [Column(TypeName = "longtext")]
        public string? MemberNo { get; set; }

        [Column(TypeName = "longtext")]
        public string? LoanAccountNo { get; set; }

        [MaxLength(255)]
        public string? ApplicantName { get; set; }

        [Column(TypeName = "longtext")]
        public string? ApplicantAge { get; set; }

        [Column(TypeName = "longtext")]
        public string? CoApplicantName { get; set; }

        [Column(TypeName = "longtext")]
        public string? CoApplicantAge { get; set; }

        [Column(TypeName = "longtext")]
        public string? LoanAmountNum { get; set; }

        [Column(TypeName = "longtext")]
        public string? LoanAmountWords { get; set; }

        [Column(TypeName = "longtext")]
        public string? RepaymentMonths { get; set; }

        [Column(TypeName = "longtext")]
        public string? FirstInstalment { get; set; }

        [Column(TypeName = "longtext")]
        public string? InstalmentDate { get; set; }

        [Column(TypeName = "longtext")]
        public string? LoanPurpose { get; set; }

        [Column(TypeName = "longtext")]
        public string? MaritalStatus { get; set; }

        [Column(TypeName = "longtext")]
        public string? DependentCount { get; set; }

        [Column(TypeName = "longtext")]
        public string? Guarantor1Name { get; set; }

        [Column(TypeName = "longtext")]
        public string? Guarantor1Age { get; set; }

        [Column(TypeName = "longtext")]
        public string? Guarantor2Name { get; set; }

        [Column(TypeName = "longtext")]
        public string? Guarantor2Age { get; set; }

        [Column(TypeName = "longtext")]
        public string? Guarantor3Name { get; set; }

        [Column(TypeName = "longtext")]
        public string? Guarantor3Age { get; set; }

        // ── Board / Sanction fields ──
        [Column(TypeName = "longtext")]
        public string? BoardMeetingDate { get; set; }

        [Column(TypeName = "longtext")]
        public string? BoardMeetingNo { get; set; }

        [Column(TypeName = "longtext")]
        public string? BoardResolutionNo { get; set; }

        [Column(TypeName = "longtext")]
        public string? SanctionedAmount { get; set; }

        [Column(TypeName = "longtext")]
        public string? SanctionedAmountWords { get; set; }

        [Column(TypeName = "longtext")]
        public string? OfficerSignedBy { get; set; }

        [Column(TypeName = "longtext")]
        public string? OfficerSignedAt { get; set; }

        // ── The raw_json column: stores the ENTIRE form payload ──
        [Column("raw_json", TypeName = "json")]
        public string? RawJson { get; set; }
    }
}
