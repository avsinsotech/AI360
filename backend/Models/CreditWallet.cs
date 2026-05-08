using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TushGptBackend.Models
{
    [Table("credit_wallet")]
    public class CreditWallet
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("client_code")]
        [MaxLength(20)]
        public string ClientCode { get; set; } = string.Empty;

        [Column("balance")]
        public decimal Balance { get; set; } = 0;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
