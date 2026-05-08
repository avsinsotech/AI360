using System;
using System.ComponentModel.DataAnnotations;

namespace TushGptBackend.Models
{
    /// <summary>
    /// All personal/job/income/address fields shared by Borrower and Guarantors.
    /// Borrower is in vehicle_loan_borrowers; Guarantors in vehicle_loan_guarantors.
    /// </summary>
    public abstract class VehicleLoanPersonBase
    {
        // ── Personal ────────────────────────────────────────────────────────
        public string? Photo { get; set; }              // base64 or URL
        public string? Naav { get; set; }               // Full Name
        public string? Vay { get; set; }                // Age
        public string? SabasadNo { get; set; }          // Member Number
        public string? Shares { get; set; }             // Shares Count
        public string? SharesRakkam { get; set; }       // Shares Amount

        public string? VadilNaav { get; set; }          // Father/Husband Name
        public string? VadilVay { get; set; }
        public string? AaiNaav { get; set; }            // Mother Name
        public string? AaiVay { get; set; }

        public string? Patta { get; set; }              // Residential Address
        public string? PinKod { get; set; }
        public string? Durdhvani { get; set; }          // Telephone
        public string? Mobile { get; set; }
        public string? Email { get; set; }

        // JageSwaarup is a multi-check — stored as comma-separated string
        public string? JageSwaarupJson { get; set; }    // JSON array string

        public string? Kalavadhi_m { get; set; }        // Residence duration months
        public string? Kalavadhi_v { get; set; }        // Residence duration years
        public string? Vaivahik { get; set; }           // Marital status
        public string? Avalambun { get; set; }          // Dependents

        // ── Job / Business ──────────────────────────────────────────────────
        public string? Company { get; set; }
        public string? CompanyPatta { get; set; }
        public string? CompanyPin { get; set; }
        public string? CompanyTel { get; set; }
        public string? CompanyMobile { get; set; }
        public string? CompanyEmail { get; set; }
        public string? Vibhag { get; set; }             // Department
        public string? Hudda { get; set; }              // Designation
        public string? EmpCode { get; set; }
        public string? Karj_m { get; set; }             // Work duration months
        public string? Karj_v { get; set; }             // Work duration years
        public string? Seva { get; set; }               // Retirement date

        // ── Income ──────────────────────────────────────────────────────────
        public string? MonthlyVetan { get; set; }       // Monthly salary
        public string? Kapat { get; set; }              // Deductions
        public string? Niwal { get; set; }              // Net salary
        public string? Vaarshik { get; set; }           // Annual income
        public string? Kharcha { get; set; }            // Total expenses
        public string? NiwalVaarshik { get; set; }      // Net annual income
        public string? Kutumb { get; set; }             // Family net income
        public string? KutumbType { get; set; }         // Monthly/Yearly

        // ── Property / Village ──────────────────────────────────────────────
        public string? ShetiNaav { get; set; }          // Property owner name
        public string? ShetiNaate { get; set; }         // Relation

        public string? GaavMukkam { get; set; }
        public string? GaavPost { get; set; }
        public string? GaavTaluka { get; set; }
        public string? GaavJilha { get; set; }
        public string? GaavRajya { get; set; }
        public string? GaavPin { get; set; }
        public string? GaavDurdhvani { get; set; }
        public string? GaavMobile { get; set; }

        // ── Previous Loan (93) ──────────────────────────────────────────────
        public string? PurvKarjPrakar { get; set; }
        public string? PurvKhate { get; set; }
        public string? PurvRakkam { get; set; }
        public string? PurvDin1 { get; set; }
        public string? PurvDin2 { get; set; }

        // ── Guarantor Details (94a) ─────────────────────────────────────────
        public string? Jam94aKarjdarNaav { get; set; }
        public string? Jam94aPrakar { get; set; }
        public string? Jam94aKhate { get; set; }
        public string? Jam94aRakkam { get; set; }
        public string? Jam94aDin1 { get; set; }
        public string? Jam94aDin2 { get; set; }

        // ── Guarantor Details (94b) ─────────────────────────────────────────
        public string? Jam94bKarjdarNaav { get; set; }
        public string? Jam94bPrakar { get; set; }
        public string? Jam94bKhate { get; set; }
        public string? Jam94bRakkam { get; set; }
        public string? Jam94bDin1 { get; set; }
        public string? Jam94bDin2 { get; set; }

        // ── Family Member Loans (95) ────────────────────────────────────────
        public string? Kutumb95Naav { get; set; }
        public string? Kutumb95Prakar { get; set; }
        public string? Kutumb95Khate { get; set; }
        public string? Kutumb95Rakkam { get; set; }
        public string? Kutumb95Din1 { get; set; }
        public string? Kutumb95Din2 { get; set; }

        // ── Other Bank Loans (96) ───────────────────────────────────────────
        public string? Bank96Naav { get; set; }
        public string? Bank96Shakha { get; set; }
        public string? Bank96Prakar { get; set; }
        public string? Bank96Khate { get; set; }
        public string? Bank96Rakkam { get; set; }
        public string? Bank96Din1 { get; set; }
        public string? Bank96Din2 { get; set; }

        // ── Signature ───────────────────────────────────────────────────────
        public string? Dinank { get; set; }
        public string? Thikan { get; set; }
        public string? ApplicationNo { get; set; }
    }
}