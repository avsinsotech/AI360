using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TushGptBackend.Models
{
    [Table("verified_voters")]
    public class VerifiedVoter
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("voter_id")]
        [MaxLength(30)]
        public string VoterId { get; set; } = string.Empty;

        [Column("name")]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Column("verified_at")]
        public DateTime VerifiedAt { get; set; } = DateTime.Now;

        [Column("client_code")]
        [MaxLength(20)]
        public string? ClientCode { get; set; }

        [Column("raw_response", TypeName = "TEXT")]
        public string? RawResponse { get; set; }
    }
}
