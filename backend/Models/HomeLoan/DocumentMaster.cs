using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TushGptBackend.Models.HomeLoan
{
    [Table("document_master")]
    public class DocumentMaster
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [MaxLength(100)]
        public string Category { get; set; } = string.Empty; // KYC, Income, Property, Banking

        [MaxLength(255)]
        public string DocumentName { get; set; } = string.Empty;

        public bool IsMandatory { get; set; } = false;

        [MaxLength(50)]
        public string LoanType { get; set; } = "HomeLoan";
    }
}
