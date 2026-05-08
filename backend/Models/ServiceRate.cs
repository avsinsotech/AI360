using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TushGptBackend.Models
{
    [Table("service_rates")]
    public class ServiceRate
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("client_code")]
        [MaxLength(20)]
        public string ClientCode { get; set; } = string.Empty;

        [Required]
        [Column("category")]
        [MaxLength(100)]
        public string Category { get; set; } = string.Empty; // AADHAAR, CIBIL, MOBILE_VERIFY, ROCKETPAY

        [Required]
        [Column("rate")]
        public decimal Rate { get; set; }

        [Required]
        [Column("effective_from")]
        public DateTime EffectiveFrom { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
