using System.Text.Json.Serialization;

namespace TushGptBackend.Models.RocketPay.Dtos
{
    // ── Mandate Request DTOs (exact RocketPay JSON shape) ──────────────────────

    public class MandateRequestDto
    {
        [JsonPropertyName("customer")]
        public CustomerDto? Customer { get; set; }

        [JsonPropertyName("client_meta")]
        public ClientMetaDto? ClientMeta { get; set; }

        [JsonPropertyName("mode")]
        public string? Mode { get; set; }

        [JsonPropertyName("schedule")]
        public ScheduleDto? Schedule { get; set; }

        [JsonPropertyName("reference_id")]
        public string? ReferenceId { get; set; }

        [JsonPropertyName("reference_type")]
        public string? ReferenceType { get; set; }
    }

    public class CustomerDto
    {
        [JsonPropertyName("mobile_number")]
        public string? MobileNumber { get; set; }

        [JsonPropertyName("name")]
        public string? Name { get; set; }
    }

    public class ClientMetaDto
    {
        [JsonPropertyName("description")]
        public string? Description { get; set; }
    }

    public class ScheduleDto
    {
        [JsonPropertyName("frequency")]
        public string? Frequency { get; set; }

        [JsonPropertyName("time_zone")]
        public string? TimeZone { get; set; }

        [JsonPropertyName("advance_amount")]
        public double? AdvanceAmount { get; set; }

        // Regular schedule fields
        [JsonPropertyName("amount")]
        public double? Amount { get; set; }

        [JsonPropertyName("installment_count")]
        public int? InstallmentCount { get; set; }

        [JsonPropertyName("start_date")]
        public string? StartDate { get; set; }

        // Adhoc (approval) fields
        [JsonPropertyName("approval_amount")]
        public double? ApprovalAmount { get; set; }

        [JsonPropertyName("end_date")]
        public string? EndDate { get; set; }

        // Custom/variable schedule items
        [JsonPropertyName("items")]
        public List<ScheduleItemDto>? Items { get; set; }
    }

    public class ScheduleItemDto
    {
        [JsonPropertyName("installment_amount")]
        public double InstallmentAmount { get; set; }

        [JsonPropertyName("due_date")]
        public string? DueDate { get; set; }

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("reference_id")]
        public string? ReferenceId { get; set; }
    }

    // ── Mandate Response DTO (mirrors RocketPay JSON exactly) ──────────────────

    public class MandateResponseDto
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("deleted")]
        public bool Deleted { get; set; }

        [JsonPropertyName("created_at")]
        public long CreatedAt { get; set; }

        [JsonPropertyName("updated_at")]
        public long UpdatedAt { get; set; }

        [JsonPropertyName("created_by")]
        public string? CreatedBy { get; set; }

        [JsonPropertyName("updated_by")]
        public string? UpdatedBy { get; set; }

        [JsonPropertyName("reference_id")]
        public string? ReferenceId { get; set; }

        [JsonPropertyName("reference_type")]
        public string? ReferenceType { get; set; }

        [JsonPropertyName("approval_amount")]
        public double ApprovalAmount { get; set; }

        [JsonPropertyName("advance_amount")]
        public double AdvanceAmount { get; set; }

        [JsonPropertyName("frequency")]
        public string? Frequency { get; set; }

        [JsonPropertyName("start_date")]
        public string? StartDate { get; set; }

        [JsonPropertyName("end_date")]
        public string? EndDate { get; set; }

        [JsonPropertyName("time_zone")]
        public string? TimeZone { get; set; }

        [JsonPropertyName("installment_count")]
        public int InstallmentCount { get; set; }

        [JsonPropertyName("state")]
        public string? State { get; set; }

        [JsonPropertyName("payment_order_id")]
        public string? PaymentOrderId { get; set; }

        [JsonPropertyName("mms_id")]
        public string? MmsId { get; set; }

        [JsonPropertyName("client_meta")]
        public ClientMetaDto? ClientMeta { get; set; }

        [JsonPropertyName("payer")]
        public PartyDto? Payer { get; set; }

        [JsonPropertyName("payees")]
        public List<PartyDto>? Payees { get; set; }

        [JsonPropertyName("meta")]
        public MandateMetaDto? Meta { get; set; }
    }

    public class PartyDto
    {
        [JsonPropertyName("tag")]
        public string? Tag { get; set; }

        [JsonPropertyName("mode")]
        public string? Mode { get; set; }

        [JsonPropertyName("amount")]
        public AmountDto? Amount { get; set; }

        [JsonPropertyName("account_id")]
        public string? AccountId { get; set; }

        [JsonPropertyName("account")]
        public AccountDto? Account { get; set; }

        [JsonPropertyName("instrument_id")]
        public string? InstrumentId { get; set; }

        [JsonPropertyName("instrument")]
        public InstrumentDto? Instrument { get; set; }
    }

    public class AmountDto
    {
        [JsonPropertyName("value")]
        public double Value { get; set; }

        [JsonPropertyName("currency")]
        public string? Currency { get; set; }
    }

    public class AccountDto
    {
        [JsonPropertyName("mobile_number")]
        public string? MobileNumber { get; set; }

        [JsonPropertyName("name")]
        public string? Name { get; set; }
    }

    public class InstrumentDto
    {
        [JsonPropertyName("ifsc")]
        public string? Ifsc { get; set; }

        [JsonPropertyName("bank_code")]
        public string? BankCode { get; set; }

        [JsonPropertyName("branch_name")]
        public string? BranchName { get; set; }

        [JsonPropertyName("account_number")]
        public string? AccountNumber { get; set; }

        [JsonPropertyName("account_holder_name_at_bank")]
        public string? AccountHolderNameAtBank { get; set; }

        [JsonPropertyName("account_holder_name")]
        public string? AccountHolderName { get; set; }

        // UPI VPA field
        [JsonPropertyName("vpa")]
        public string? Vpa { get; set; }
    }

    public class MandateMetaDto
    {
        [JsonPropertyName("txns")]
        public List<TxnDto>? Txns { get; set; }

        [JsonPropertyName("mandate_auth_checkout_url")]
        public string? MandateAuthCheckoutUrl { get; set; }

        [JsonPropertyName("enterprise_id")]
        public string? EnterpriseId { get; set; }

        [JsonPropertyName("enterprise_handler_entity")]
        public string? EnterpriseHandlerEntity { get; set; }
    }

    public class TxnDto
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("utr")]
        public string? Utr { get; set; }

        [JsonPropertyName("state")]
        public string? State { get; set; }

        [JsonPropertyName("medium")]
        public string? Medium { get; set; }

        [JsonPropertyName("created_at")]
        public long? CreatedAt { get; set; }

        [JsonPropertyName("generic_error")]
        public object? GenericError { get; set; }

        [JsonPropertyName("meta")]
        public TxnMetaDto? Meta { get; set; }
    }

    public class TxnMetaDto
    {
        [JsonPropertyName("umrn")]
        public string? Umrn { get; set; }

        [JsonPropertyName("medium")]
        public string? Medium { get; set; }

        [JsonPropertyName("sub_state")]
        public string? SubState { get; set; }

        [JsonPropertyName("gateway_name")]
        public string? GatewayName { get; set; }

        [JsonPropertyName("gateway_reference_id")]
        public string? GatewayReferenceId { get; set; }

        [JsonPropertyName("sub_state_reason")]
        public string? SubStateReason { get; set; }

        [JsonPropertyName("sub_state_timestamp")]
        public string? SubStateTimestamp { get; set; }
    }

    // ── Installment Response DTO ────────────────────────────────────────────────

    public class InstallmentResponseDto
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("deleted")]
        public bool Deleted { get; set; }

        [JsonPropertyName("created_at")]
        public long CreatedAt { get; set; }

        [JsonPropertyName("updated_at")]
        public long UpdatedAt { get; set; }

        [JsonPropertyName("created_by")]
        public string? CreatedBy { get; set; }

        [JsonPropertyName("updated_by")]
        public string? UpdatedBy { get; set; }

        [JsonPropertyName("reference_id")]
        public string? ReferenceId { get; set; }

        [JsonPropertyName("reference_type")]
        public string? ReferenceType { get; set; }

        [JsonPropertyName("mandate_id")]
        public string? MandateId { get; set; }

        [JsonPropertyName("due_date")]
        public string? DueDate { get; set; }

        [JsonPropertyName("schedule_date")]
        public string? ScheduleDate { get; set; }

        [JsonPropertyName("time_zone")]
        public string? TimeZone { get; set; }

        [JsonPropertyName("state")]
        public string? State { get; set; }

        [JsonPropertyName("payment_order_id")]
        public string? PaymentOrderId { get; set; }

        [JsonPropertyName("mms_id")]
        public string? MmsId { get; set; }

        [JsonPropertyName("client_meta")]
        public ClientMetaDto? ClientMeta { get; set; }

        [JsonPropertyName("meta")]
        public InstallmentMetaDto? Meta { get; set; }

        [JsonPropertyName("payer")]
        public PartyDto? Payer { get; set; }

        [JsonPropertyName("payees")]
        public List<PartyDto>? Payees { get; set; }
    }

    public class InstallmentMetaDto
    {
        [JsonPropertyName("txns")]
        public List<TxnDto>? Txns { get; set; }
    }

    // ── Create / Retry Installment Request DTOs ────────────────────────────────

    public class CreateInstallmentRequestDto
    {
        [JsonPropertyName("amount")]
        public double Amount { get; set; }

        [JsonPropertyName("due_date")]
        public string? DueDate { get; set; }

        [JsonPropertyName("reference_id")]
        public string? ReferenceId { get; set; }

        [JsonPropertyName("description")]
        public string? Description { get; set; }
    }

    public class RetryInstallmentRequestDto
    {
        [JsonPropertyName("schedule_date")]
        public string? ScheduleDate { get; set; }
    }

    // ── Dashboard Metrics DTOs ──────────────────────────────────────────────

    public class DashboardMetricsDto
    {
        public double TotalExpectedCollection { get; set; }
        public double ExpectedThisMonth { get; set; }
        public double CollectedThisMonth { get; set; }
        public double CollectedLastMonth { get; set; }
        public double FailedThisMonth { get; set; }
        public double FailedLastMonth { get; set; }
        
        public double ExpectedToday { get; set; }
        public double CollectedYesterday { get; set; }
        public double FailedYesterday { get; set; }

        public int TotalActiveMandates { get; set; }
        public int TotalCustomers { get; set; }

        public List<ChartDataPointDto> ChartData { get; set; } = new();
    }

    public class ChartDataPointDto
    {
        public string Day { get; set; } = "";
        public double Value { get; set; }
    }
}
