namespace TushGptBackend.Models.RocketPay
{
    public enum PaymentMode
    {
        UPI_AUTO_PAY,
        NACH
    }

    public enum PaymentInstrumentType
    {
        BANK_ACCOUNT,
        VPA
    }

    public enum MandateFrequency
    {
        ONCE,
        DAILY,
        WEEKLY,
        MONTHLY,
        YEARLY,
        ADHOC
    }

    public enum PartyTag
    {
        CUSTOMER_COLLECTION,
        MERCHANT_SETTLEMENT,
        CUSTOMER_CHARGE_COLLECTION,
        MERCHANT_CHARGE_COLLECTION
    }

    public enum MandateState
    {
        CREATED,
        ACCEPTED,
        ACTIVATED,
        PAUSED,
        HALTED,
        CANCELLED,
        TERMINATED,
        DELETED,
        COMPLETED
    }

    public enum InstallmentState
    {
        CREATED,
        TERMINATED,
        COLLECTION_INITIATED,
        COLLECTION_SUCCESS,
        COLLECTION_FAILED,
        SETTLEMENT_INITIATED,
        SETTLEMENT_SUCCESS,
        SETTLEMENT_FAILED
    }
}
