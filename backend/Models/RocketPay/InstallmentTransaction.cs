using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace TushGptBackend.Models.RocketPay
{
    [Table("installment_transactions")]
    public class InstallmentTransaction
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("installment_id")]
        [MaxLength(100)]
        public string InstallmentId { get; set; } = string.Empty;

        [Column("txn_id")]
        [MaxLength(100)]
        public string? TxnId { get; set; }

        [Column("utr")]
        [MaxLength(200)]
        public string? Utr { get; set; }

        [Column("state")]
        [MaxLength(50)]
        public string? State { get; set; }

        [Column("medium")]
        [MaxLength(50)]
        public string? Medium { get; set; }

        [Column("txn_created_at")]
        public long? TxnCreatedAt { get; set; }

        [Column("generic_error")]
        [MaxLength(500)]
        public string? GenericError { get; set; }

        // Meta sub-fields
        [Column("umrn")]
        [MaxLength(100)]
        public string? Umrn { get; set; }

        [Column("sub_state")]
        [MaxLength(100)]
        public string? SubState { get; set; }

        [Column("sub_state_reason")]
        [MaxLength(500)]
        public string? SubStateReason { get; set; }

        [Column("sub_state_timestamp")]
        [MaxLength(100)]
        public string? SubStateTimestamp { get; set; }

        [ForeignKey("InstallmentId")]
        [JsonIgnore]
        public RocketPayInstallment? Installment { get; set; }
    }
}
