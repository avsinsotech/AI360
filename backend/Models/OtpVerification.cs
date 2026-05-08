using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TushGptBackend.Models
{
    [Table("otp_verifications")]
    public class OtpVerification
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("mobile_number")]
        [StringLength(15)]
        public string MobileNumber { get; set; } = string.Empty;

        [Required]
        [Column("otp_code")]
        [StringLength(6)]
        public string OtpCode { get; set; } = string.Empty;

        [Column("expires_at")]
        public DateTime ExpiresAt { get; set; }

        [Column("is_verified")]
        public bool IsVerified { get; set; } = false;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("client_code")]
        [StringLength(20)]
        public string? ClientCode { get; set; }
    }
}
