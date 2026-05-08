using System.Text.Json;
using System.Text.Json.Serialization;

namespace TushGptBackend.Models.HomeLoan
{
    /// <summary>
    /// Incoming DTO — accepts the EXACT same JSON the frontend sends.
    /// Nested objects are captured as raw JsonElement so we can serialize them into raw_json.
    /// </summary>
    public class HomeLoanSubmissionDto
    {
        // ── Flat searchable fields (extracted into columns) ──
        [JsonPropertyName("ClientCode")]
        public string ClientCode { get; set; } = string.Empty;

        [JsonPropertyName("ApplicationDate")]
        public string ApplicationDate { get; set; } = string.Empty;

        [JsonPropertyName("Branch")]
        public string Branch { get; set; } = string.Empty;

        [JsonPropertyName("MemberNo")]
        public string MemberNo { get; set; } = string.Empty;

        [JsonPropertyName("LoanAccountNo")]
        public string LoanAccountNo { get; set; } = string.Empty;

        [JsonPropertyName("ApplicantName")]
        public string ApplicantName { get; set; } = string.Empty;

        [JsonPropertyName("ApplicantAge")]
        public string ApplicantAge { get; set; } = string.Empty;

        [JsonPropertyName("CoApplicantName")]
        public string CoApplicantName { get; set; } = string.Empty;

        [JsonPropertyName("CoApplicantAge")]
        public string CoApplicantAge { get; set; } = string.Empty;

        [JsonPropertyName("LoanAmountNum")]
        public string LoanAmountNum { get; set; } = string.Empty;

        [JsonPropertyName("LoanAmountWords")]
        public string LoanAmountWords { get; set; } = string.Empty;

        [JsonPropertyName("RepaymentMonths")]
        public string RepaymentMonths { get; set; } = string.Empty;

        [JsonPropertyName("FirstInstalment")]
        public string FirstInstalment { get; set; } = string.Empty;

        [JsonPropertyName("InstalmentDate")]
        public string InstalmentDate { get; set; } = string.Empty;

        [JsonPropertyName("LoanPurpose")]
        public string LoanPurpose { get; set; } = string.Empty;

        [JsonPropertyName("MaritalStatus")]
        public string MaritalStatus { get; set; } = string.Empty;

        [JsonPropertyName("DependentCount")]
        public string DependentCount { get; set; } = string.Empty;

        [JsonPropertyName("Guarantor1Name")]
        public string Guarantor1Name { get; set; } = string.Empty;

        [JsonPropertyName("Guarantor1Age")]
        public string Guarantor1Age { get; set; } = string.Empty;

        [JsonPropertyName("Guarantor2Name")]
        public string Guarantor2Name { get; set; } = string.Empty;

        [JsonPropertyName("Guarantor2Age")]
        public string Guarantor2Age { get; set; } = string.Empty;

        [JsonPropertyName("Guarantor3Name")]
        public string Guarantor3Name { get; set; } = string.Empty;

        [JsonPropertyName("Guarantor3Age")]
        public string Guarantor3Age { get; set; } = string.Empty;

        // ── Nested objects — kept as raw JSON for storage ──
        [JsonPropertyName("Borrower")]
        public JsonElement? Borrower { get; set; }

        [JsonPropertyName("Guarantors")]
        public JsonElement? Guarantors { get; set; }

        [JsonPropertyName("Property")]
        public JsonElement? Property { get; set; }

        [JsonPropertyName("Business")]
        public JsonElement? Business { get; set; }

        [JsonPropertyName("Insurance")]
        public JsonElement? Insurance { get; set; }
    }

    /// <summary>
    /// Response DTO for GET /api/HomeLoan/{id}
    /// </summary>
    public class HomeLoanResponseDto
    {
        public int Id { get; set; }
        public string ApplicationNo { get; set; } = string.Empty;
        public string ClientCode { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string ApplicationDate { get; set; } = string.Empty;
        public string Branch { get; set; } = string.Empty;
        public string MemberNo { get; set; } = string.Empty;
        public string LoanAccountNo { get; set; } = string.Empty;
        public string ApplicantName { get; set; } = string.Empty;
        public string ApplicantAge { get; set; } = string.Empty;
        public string CoApplicantName { get; set; } = string.Empty;
        public string CoApplicantAge { get; set; } = string.Empty;
        public string LoanAmountNum { get; set; } = string.Empty;
        public string LoanAmountWords { get; set; } = string.Empty;
        public string RepaymentMonths { get; set; } = string.Empty;
        public string FirstInstalment { get; set; } = string.Empty;
        public string InstalmentDate { get; set; } = string.Empty;
        public string LoanPurpose { get; set; } = string.Empty;
        public string MaritalStatus { get; set; } = string.Empty;
        public string DependentCount { get; set; } = string.Empty;
        public string Guarantor1Name { get; set; } = string.Empty;
        public string Guarantor1Age { get; set; } = string.Empty;
        public string Guarantor2Name { get; set; } = string.Empty;
        public string Guarantor2Age { get; set; } = string.Empty;
        public string Guarantor3Name { get; set; } = string.Empty;
        public string Guarantor3Age { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        /// <summary>
        /// The complete form data deserialized from raw_json.
        /// Contains ALL nested objects: Borrower, Guarantors, Property, Business, Insurance.
        /// </summary>
        public JsonElement? FormData { get; set; }
    }

    /// <summary>
    /// Lightweight DTO for list views — excludes raw_json for performance.
    /// </summary>
    public class HomeLoanListItemDto
    {
        public int Id { get; set; }
        public string ApplicationNo { get; set; } = string.Empty;
        public string ClientCode { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string ApplicationDate { get; set; } = string.Empty;
        public string Branch { get; set; } = string.Empty;
        public string ApplicantName { get; set; } = string.Empty;
        public string LoanAmountNum { get; set; } = string.Empty;
        public string LoanPurpose { get; set; } = string.Empty;
        public string MemberNo { get; set; } = string.Empty;
        public string LoanAccountNo { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
