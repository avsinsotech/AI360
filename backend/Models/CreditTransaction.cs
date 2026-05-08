using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TushGptBackend.Models
{
    [Table("credit_transactions")]
    public class CreditTransaction
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("client_code")]
        [MaxLength(20)]
        public string ClientCode { get; set; } = string.Empty;

        [Required]
        [Column("type")]
        [MaxLength(10)]
        public string Type { get; set; } = string.Empty; // CREDIT or DEBIT

        [Required]
        [Column("amount")]
        public decimal Amount { get; set; }

        [Column("balance_after")]
        public decimal? BalanceAfter { get; set; }

        [Column("category")]
        [MaxLength(100)]
        public string? Category { get; set; }

        [Column("reference_id")]
        [MaxLength(100)]
        public string? ReferenceId { get; set; }

        [Column("description")]
        [MaxLength(255)]
        public string? Description { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
