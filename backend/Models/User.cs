using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace TushGptBackend.Models
{
    [Table("users")]
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("UserCode")]
        public int? UserCode { get; set; }

        [Column("UserName")]
        public string? UserName { get; set; }

        [Column("UserLoginId")]
        public string? UserLoginId { get; set; }

        [Column("UserPwd")]
        public string? UserPwd { get; set; }

        [Column("ClientCode")]
        [System.ComponentModel.DataAnnotations.MaxLength(20)]
        public string? ClientCode { get; set; }

        [Column("IsActive")]
        public bool IsActive { get; set; } = true;

        [Column("CreatedAt")]
        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("UpdatedAt")]
        public DateTime? UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
