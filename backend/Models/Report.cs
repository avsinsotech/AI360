using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TushGptBackend.Models
{
    [Table("reports")]
    public class Report
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [Column("AppId")]
        [MaxLength(50)]
        public string AppId { get; set; } = string.Empty;

        [Required]
        [Column("MemberName")]
        [MaxLength(255)]
        public string MemberName { get; set; } = string.Empty;

        [Required]
        [Column("ReportDate")]
        public DateTime Date { get; set; } = DateTime.Now;

        [Required]
        [Column("DataJson", TypeName = "longtext")]
        public string DataJson { get; set; } = string.Empty;

        [Column("CreatedBy")]
        public string CreatedBy { get; set; } = string.Empty;

        [Column("ClientCode")]
        [MaxLength(20)]
        public string? ClientCode { get; set; }
    }
}
