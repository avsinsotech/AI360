using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TushGptBackend.Models
{
    [Table("verified_pans")]
    public class VerifiedPan
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("pan_no")]
        [MaxLength(20)]
        public string PanNo { get; set; } = string.Empty;

        [Column("name")]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Column("verified_at")]
        public DateTime VerifiedAt { get; set; } = DateTime.Now;

        [Column("client_code")]
        [MaxLength(20)]
        public string? ClientCode { get; set; }

        [Column("dob")]
        [MaxLength(20)]
        public string? Dob { get; set; }

        [Column("pan_type")]
        [MaxLength(50)]
        public string? PanType { get; set; }

        [Column("raw_response", TypeName = "TEXT")]
        public string? RawResponse { get; set; }
    }
}
