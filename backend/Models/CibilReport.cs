using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TushGptBackend.Models
{
    public class CibilReport
    {
        [Key]
        public int Id { get; set; }

        public string FName { get; set; } = string.Empty;
        public string PAN { get; set; } = string.Empty;
        public string DOB { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Pincode { get; set; } = string.Empty;

        public string CibilScore { get; set; } = string.Empty;
        public string ReferenceId { get; set; } = string.Empty;
        public string ReportOrderNumber { get; set; } = string.Empty;

        // Detailed Metrics
        public int OpenAccounts { get; set; }
        public string TotalOutstanding { get; set; } = "0";
        public int OverdueCount { get; set; }
        public int SettledAccounts { get; set; }
        public int HardEnquiries { get; set; }
        public int SoftEnquiries { get; set; }

        [Column(TypeName = "longtext")]
        public string? DpdJson { get; set; }

        [Column(TypeName = "longtext")]
        public string RawJsonResponse { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [System.ComponentModel.DataAnnotations.MaxLength(20)]
        public string? ClientCode { get; set; }
    }
}
