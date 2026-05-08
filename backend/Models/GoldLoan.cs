using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TushGptBackend.Models
{
    public class GoldLoan
    {
        [Key]
        public int Id { get; set; }

        public string? ApplicationNo { get; set; }
        public string? ClientCode { get; set; }
        
        // Basic Details
        public string? CustomerName { get; set; }
        public string? Scheme { get; set; }
        public string? SanctionDate { get; set; }
        public string? GoldBagNo { get; set; }
        public string? SbAcNo { get; set; }
        public string? Branch { get; set; }
        public string? SbName { get; set; }
        public decimal? Balance { get; set; }
        // Hidden Identity Details
        public string? AadhaarNo { get; set; }
        public string? MobileNo { get; set; }
        public string? Address { get; set; }
        public string? PanNo { get; set; }
        public int? Age { get; set; }

        // Loan Config Details
        public string? ValuerReceiptNo { get; set; }
        public int? Tenure { get; set; }
        public string? RepaymentDate { get; set; }

        // Sanction Details
        public decimal? LoanLimit { get; set; }
        public decimal? LoanSanction { get; set; }
        public decimal? TotalTransferVoucher { get; set; }
        public decimal? TotalDeductionVoucher { get; set; }
        public decimal? TotalPayableAmount { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }

        [Column("valuation_doc", TypeName = "longtext")]
        public string? ValuationDoc { get; set; }

        // Navigation Properties
        public virtual ICollection<GoldLoanOrnament> Ornaments { get; set; } = new List<GoldLoanOrnament>();
        public virtual ICollection<GoldLoanDeduction> Deductions { get; set; } = new List<GoldLoanDeduction>();
        public virtual ICollection<GoldLoanImage> Images { get; set; } = new List<GoldLoanImage>();
    }

    public class GoldLoanOrnament
    {
        [Key]
        public int Id { get; set; }
        
        public int GoldLoanId { get; set; }
        public virtual GoldLoan? GoldLoan { get; set; }

        public int RowOrder { get; set; }
        public string? Particular { get; set; }
        public decimal? Qty { get; set; }
        public decimal? GrossWt { get; set; }
        public decimal? NetWt { get; set; }
        public decimal? Rate { get; set; }
        public decimal? Price { get; set; }
        public decimal? ValuerPrice { get; set; }
    }

    public class GoldLoanDeduction
    {
        [Key]
        public int Id { get; set; }
        
        public int GoldLoanId { get; set; }
        public virtual GoldLoan? GoldLoan { get; set; }

        public int RowOrder { get; set; }
        public string? Name { get; set; }
        public decimal? Per { get; set; }
        public decimal? Charges { get; set; }
        public decimal? DeductionAmount { get; set; }
    }

    public class GoldLoanImage
    {
        [Key]
        public int Id { get; set; }
        
        public int GoldLoanId { get; set; }
        public virtual GoldLoan? GoldLoan { get; set; }

        // Determine if it's an 'ornament' picture or 'bag' picture
        public string? Type { get; set; } 

        [Column(TypeName = "longtext")]
        public string? Base64Data { get; set; }
    }
}
