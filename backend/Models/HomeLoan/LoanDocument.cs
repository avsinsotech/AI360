using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TushGptBackend.Models.HomeLoan
{
    [Table("loan_application_documents")]
    public class LoanDocument
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int ApplicationId { get; set; }
        
        [MaxLength(50)]
        public string? LoanType { get; set; } // HomeLoan, VehicleLoan, BusinessLoan, PersonalLoan

        public int DocumentMasterId { get; set; }
        
        [ForeignKey("DocumentMasterId")]
        public virtual DocumentMaster? DocumentMaster { get; set; }

        [MaxLength(255)]
        public string FileName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string FileType { get; set; } = string.Empty; // MIME Type

        [Column(TypeName = "longblob")]
        public byte[] FileContent { get; set; } = Array.Empty<byte>();

        [MaxLength(50)]
        public string Status { get; set; } = "Uploaded"; // Uploaded, Verified, Rejected

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        public DateTime? VerifiedAt { get; set; }
        
        [MaxLength(500)]
        public string? Remarks { get; set; }

        [MaxLength(100)]
        public string? UploadedBy { get; set; }

        [MaxLength(100)]
        public string? VerifiedBy { get; set; }
    }
}
