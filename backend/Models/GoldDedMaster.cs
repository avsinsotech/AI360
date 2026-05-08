using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TushGptBackend.Models
{
    [Table("GoldDedmaster")]
    public class GoldDedMaster
    {
        [Column("BRCD")]
        public string? BRCD { get; set; }

        [Column("SRNO")]
        public string? SRNO { get; set; }

        [Column("SUBGLCODE")]
        public string? SUBGLCODE { get; set; }

        [Column("DEDTYPE")]
        public string? DEDTYPE { get; set; }

        [Column("DTYPE")]
        public int? DTYPE { get; set; }

        [Column("PER")]
        public decimal? PER { get; set; }

        [Column("CHARGES")]
        public decimal? CHARGES { get; set; }

        [Column("FROMAMT")]
        public decimal? FROMAMT { get; set; }

        [Column("TOAMT")]
        public decimal? TOAMT { get; set; }

        [Column("STAGE")]
        public string? STAGE { get; set; }

        [Column("EFFECTDATE")]
        public DateTime? EFFECTDATE { get; set; }

        [Column("MID")]
        public string? MID { get; set; }

        [Column("CID")]
        public string? CID { get; set; }

        [Column("VID")]
        public string? VID { get; set; }

        [Column("DedEnable")]
        public string? DedEnable { get; set; }

        [Column("MINVALUE")]
        public int? MINVALUE { get; set; }

        [Column("MAXVALUE")]
        public int? MAXVALUE { get; set; }
    }
}
