using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TushGptBackend.Models
{
    [Table("verified_aadhars")]
    public class VerifiedAadhar
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(20)]
        public string AadhaarNo { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Dob { get; set; } = string.Empty;

        [MaxLength(20)]
        public string Gender { get; set; } = string.Empty;

        [Column(TypeName = "TEXT")]
        public string Address { get; set; } = string.Empty;

        [Column(TypeName = "LONGTEXT")]
        public string Photo { get; set; } = string.Empty;

        public DateTime VerifiedAt { get; set; } = DateTime.Now;

        [MaxLength(15)]
        public string MobileNo { get; set; } = string.Empty;

        [Column(TypeName = "LONGTEXT")]
        public string? CapturedPhoto { get; set; }

        [MaxLength(20)]
        public string? ClientCode { get; set; }

        [Column("raw_response", TypeName = "TEXT")]
        public string? RawResponse { get; set; }

        [MaxLength(20)]
        [Column("pan_no")]
        public string? PanNo { get; set; }

        [Column(TypeName = "LONGTEXT")]
        public string? LocationInfo { get; set; }

        [Column("valuation_doc", TypeName = "LONGTEXT")]
        public string? ValuationDoc { get; set; }
    }
}
