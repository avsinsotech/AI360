using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TushGptBackend.Models
{
    public class CibilAlertConfig
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(20)]
        public string ClientCode { get; set; } = string.Empty;

        public int ScoreThreshold { get; set; } = 650;

        public bool IsPeriodicPullEnabled { get; set; } = false;

        public bool NotifyOnNewEnquiry { get; set; } = true;

        public DateTime UpdatedAt { get; set; } = DateTime.Now;
    }
}
