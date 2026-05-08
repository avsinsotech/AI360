using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace TushGptBackend.Models
{
    public class MembershipApplication
    {
        [Key]
        public int Id { get; set; }

        [JsonPropertyName("membership_no")]
        public string? MembershipNo { get; set; }

        [JsonPropertyName("institution_name")]
        public string? InstitutionName { get; set; }

        [JsonPropertyName("ni_no")]
        public string? NiNo { get; set; }

        [JsonPropertyName("saving_acc_no")]
        public string? SavingAccNo { get; set; }

        [JsonPropertyName("client_id")]
        public string? ClientId { get; set; }

        [JsonPropertyName("branch")]
        public string? Branch { get; set; }

        [JsonPropertyName("date")]
        public string? Date { get; set; }
        
        [JsonPropertyName("full_name")]
        public string FullName { get; set; } = string.Empty;

        [JsonPropertyName("age")]
        public string? Age { get; set; }

        [JsonPropertyName("dob")]
        public string? Dob { get; set; }

        [JsonPropertyName("current_address")]
        public string? CurrentAddress { get; set; }

        [JsonPropertyName("permanent_address")]
        public string? PermanentAddress { get; set; }

        [JsonPropertyName("working_address")]
        public string? WorkingAddress { get; set; }
        
        [JsonPropertyName("monthly_income")]
        public string? MonthlyIncome { get; set; }

        [JsonPropertyName("yearly_income")]
        public string? YearlyIncome { get; set; }

        [JsonPropertyName("phone")]
        public string? Phone { get; set; }

        [JsonPropertyName("mobile")]
        public string? Mobile { get; set; }

        [JsonPropertyName("pan")]
        public string? Pan { get; set; }

        [JsonPropertyName("aadhaar")]
        public string? Aadhaar { get; set; }

        [JsonPropertyName("email")]
        public string? Email { get; set; }
        
        [JsonPropertyName("is_member_elsewhere")]
        public string? IsMemberElsewhere { get; set; }

        [JsonPropertyName("other_ext_org_name")]
        public string? OtherExtOrgName { get; set; }

        [JsonPropertyName("other_ext_branch")]
        public string? OtherExtBranch { get; set; }
        
        [JsonPropertyName("fee_share")]
        public string? FeeShare { get; set; }

        [JsonPropertyName("fee_welfare")]
        public string? FeeWelfare { get; set; }

        [JsonPropertyName("fee_savings")]
        public string? FeeSavings { get; set; }

        [JsonPropertyName("fee_entrance")]
        public string? FeeEntrance { get; set; }

        [JsonPropertyName("fee_other")]
        public string? FeeOther { get; set; }

        [JsonPropertyName("fee_total")]
        public string? FeeTotal { get; set; }

        [JsonPropertyName("official_mobile")]
        public string? OfficialMobile { get; set; }
        
        // Document Checklists (Already mapped in handleSubmit)
        [JsonPropertyName("doc_photos")]
        public bool DocPhotos { get; set; }
        [JsonPropertyName("doc_id_card")]
        public bool DocIdCard { get; set; }
        [JsonPropertyName("doc_ration_card")]
        public bool DocRationCard { get; set; }
        [JsonPropertyName("doc_aadhar_card")]
        public bool DocAadharCard { get; set; }
        [JsonPropertyName("doc_voter_card")]
        public bool DocVoterCard { get; set; }
        [JsonPropertyName("doc_pan_card")]
        public bool DocPanCard { get; set; }
        [JsonPropertyName("doc_light_bill")]
        public bool DocLightBill { get; set; }
        [JsonPropertyName("doc_residence_cert")]
        public bool DocResidenceCert { get; set; }
        [JsonPropertyName("doc_utara")]
        public bool DocUtara { get; set; }

        [JsonPropertyName("nominee_name")]
        public string? NomineeName { get; set; }

        [JsonPropertyName("nominee_age")]
        public string? NomineeAge { get; set; }

        [JsonPropertyName("nominee_dob")]
        public string? NomineeDob { get; set; }

        [JsonPropertyName("nominee_relation")]
        public string? NomineeRelation { get; set; }

        [JsonPropertyName("nominee_address")]
        public string? NomineeAddress { get; set; }

        [JsonPropertyName("recommender1_name")]
        public string? Recommender1Name { get; set; }

        [JsonPropertyName("recommender1_no")]
        public string? Recommender1No { get; set; }

        [JsonPropertyName("recommender2_name")]
        public string? Recommender2Name { get; set; }

        [JsonPropertyName("recommender2_no")]
        public string? Recommender2No { get; set; }

        [JsonPropertyName("acc_type")]
        public string? AccType { get; set; }

        [JsonPropertyName("acc_initial_amount")]
        public string? AccInitialAmount { get; set; }

        [JsonPropertyName("acc_initial_amount_words")]
        public string? AccInitialAmountWords { get; set; }

        [JsonPropertyName("holder2_name")]
        public string? Holder2Name { get; set; }

        [JsonPropertyName("holder2_age")]
        public string? Holder2Age { get; set; }

        [JsonPropertyName("other_instructions")]
        public string? OtherInstructions { get; set; }
        
        [JsonPropertyName("photo")]
        public string? Photo { get; set; }

        [JsonPropertyName("client_code")]
        [MaxLength(20)]
        public string? ClientCode { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
