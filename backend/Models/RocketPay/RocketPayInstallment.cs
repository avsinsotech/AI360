using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TushGptBackend.Models.RocketPay
{
    [Table("rocketpay_installments")]
    public class RocketPayInstallment
    {
        [Key]
        [Column("id")]
        [MaxLength(100)]
        public string Id { get; set; } = string.Empty;

        [Column("deleted")]
        public bool Deleted { get; set; }

        [Column("created_at")]
        public long CreatedAt { get; set; }

        [Column("updated_at")]
        public long UpdatedAt { get; set; }

        [Column("created_by")]
        [MaxLength(100)]
        public string? CreatedBy { get; set; }

        [Column("updated_by")]
        [MaxLength(100)]
        public string? UpdatedBy { get; set; }

        [Column("reference_id")]
        [MaxLength(200)]
        public string? ReferenceId { get; set; }

        [Column("reference_type")]
        [MaxLength(100)]
        public string? ReferenceType { get; set; }

        [Column("mandate_id")]
        [MaxLength(100)]
        public string? MandateId { get; set; }

        [Column("due_date")]
        [MaxLength(20)]
        public string? DueDate { get; set; }

        [Column("schedule_date")]
        [MaxLength(20)]
        public string? ScheduleDate { get; set; }

        [Column("time_zone")]
        [MaxLength(100)]
        public string? TimeZone { get; set; }

        [Column("state")]
        [MaxLength(50)]
        public string? State { get; set; }

        [Column("payment_order_id")]
        [MaxLength(100)]
        public string? PaymentOrderId { get; set; }

        [Column("mms_id")]
        [MaxLength(100)]
        public string? MmsId { get; set; }

        [Column("client_meta_description")]
        [MaxLength(500)]
        public string? ClientMetaDescription { get; set; }

        [Column("raw_json", TypeName = "longtext")]
        public string? RawJson { get; set; }

        [Column("local_created_at")]
        public DateTime LocalCreatedAt { get; set; } = DateTime.UtcNow;

        [Column("local_updated_at")]
        public DateTime LocalUpdatedAt { get; set; } = DateTime.UtcNow;

        [Column("client_code")]
        [MaxLength(20)]
        public string? ClientCode { get; set; }

        // Navigation properties
        public InstallmentPayer? Payer { get; set; }
        public List<InstallmentPayee> Payees { get; set; } = new();
        public List<InstallmentTransaction> Transactions { get; set; } = new();
    }
}
