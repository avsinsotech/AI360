using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace TushGptBackend.Models.RocketPay
{
    [Table("installment_payees")]
    public class InstallmentPayee
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("installment_id")]
        [MaxLength(100)]
        public string InstallmentId { get; set; } = string.Empty;

        [Column("tag")]
        [MaxLength(100)]
        public string? Tag { get; set; }

        [Column("mode")]
        [MaxLength(50)]
        public string? Mode { get; set; }

        [Column("amount_value")]
        public double AmountValue { get; set; }

        [Column("amount_currency")]
        [MaxLength(10)]
        public string? AmountCurrency { get; set; }

        [Column("account_id")]
        [MaxLength(100)]
        public string? AccountId { get; set; }

        [Column("mobile_number")]
        [MaxLength(20)]
        public string? MobileNumber { get; set; }

        [Column("name")]
        [MaxLength(200)]
        public string? Name { get; set; }

        [Column("instrument_id")]
        [MaxLength(100)]
        public string? InstrumentId { get; set; }

        [Column("ifsc")]
        [MaxLength(20)]
        public string? Ifsc { get; set; }

        [Column("bank_code")]
        [MaxLength(20)]
        public string? BankCode { get; set; }

        [Column("branch_name")]
        [MaxLength(200)]
        public string? BranchName { get; set; }

        [Column("account_number")]
        [MaxLength(100)]
        public string? AccountNumber { get; set; }

        [Column("account_holder_name_at_bank")]
        [MaxLength(200)]
        public string? AccountHolderNameAtBank { get; set; }

        [Column("account_holder_name")]
        [MaxLength(200)]
        public string? AccountHolderName { get; set; }

        [Column("vpa")]
        [MaxLength(200)]
        public string? Vpa { get; set; }

        [ForeignKey("InstallmentId")]
        [JsonIgnore]
        public RocketPayInstallment? Installment { get; set; }
    }
}
