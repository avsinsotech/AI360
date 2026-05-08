using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TushGptBackend.Models
{
    [Table("audit_logs")]
    public class AuditLog
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("client_code")]
        [MaxLength(20)]
        public string? ClientCode { get; set; }

        [Column("user_id")]
        public int? UserId { get; set; }

        [Column("action")]
        [MaxLength(100)]
        public string? Action { get; set; }

        [Column("description")]
        public string? Description { get; set; }

        [Column("ip_address")]
        [MaxLength(50)]
        public string? IpAddress { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
