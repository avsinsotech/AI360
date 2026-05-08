using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TushGptBackend.Models.HomeLoan
{
    [Table("home_loan_requests")]
    public class HomeLoanRequest
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [MaxLength(255)]
        public string ClientCode { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string ApplicationDate { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string Branch { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string MemberNo { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string LoanAccountNo { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string ApplicantName { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string ApplicantAge { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CoApplicantName { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CoApplicantAge { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string LoanAmountNum { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string LoanAmountWords { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string RepaymentMonths { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string FirstInstalment { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string InstalmentDate { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string LoanPurpose { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string MaritalStatus { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string DependentCount { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string Guarantor1Name { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string Guarantor1Age { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string Guarantor2Name { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string Guarantor2Age { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string Guarantor3Name { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string Guarantor3Age { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigation Properties
        public virtual HomeLoanBorrower? Borrower { get; set; }
        public virtual List<HomeLoanGuarantor> Guarantors { get; set; } = new();
        public virtual HomeLoanProperty? Property { get; set; }
        public virtual HomeLoanBusiness? Business { get; set; }
        public virtual HomeLoanInsurance? Insurance { get; set; }
    }
}
