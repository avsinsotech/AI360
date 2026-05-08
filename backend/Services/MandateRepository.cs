using Microsoft.EntityFrameworkCore;
using TushGptBackend.Data;
using TushGptBackend.Models.RocketPay;
using TushGptBackend.Models.RocketPay.Dtos;

namespace TushGptBackend.Services
{
    public class MandateRepository
    {
        private readonly AppDbContext _db;

        public MandateRepository(AppDbContext db)
        {
            _db = db;
        }


        public async Task<List<RocketPayMandate>> GetAllAsync(string? clientCode = null)
        {
            var query = _db.RocketPayMandates.AsQueryable();
            if (!string.IsNullOrEmpty(clientCode))
                query = query.Where(m => m.ClientCode == clientCode);

            return await query
                .Include(m => m.Payer)
                .Include(m => m.Payees)
                .Include(m => m.Transactions)
                .OrderByDescending(m => m.LocalCreatedAt)
                .ToListAsync();
        }

        public async Task<RocketPayMandate?> GetByIdAsync(string id, string? clientCode = null)
        {
            var query = _db.RocketPayMandates.AsQueryable();
            if (!string.IsNullOrEmpty(clientCode))
                query = query.Where(m => m.ClientCode == clientCode);

            return await query
                .Include(m => m.Payer)
                .Include(m => m.Payees)
                .Include(m => m.Transactions)
                .FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task UpsertAsync(MandateResponseDto dto, string rawJson, string? clientCode = null)
        {
            if (string.IsNullOrEmpty(dto.Id)) return;

            var existing = await _db.RocketPayMandates
                .Include(m => m.Payer)
                .Include(m => m.Payees)
                .Include(m => m.Transactions)
                .FirstOrDefaultAsync(m => m.Id == dto.Id);

            if (existing == null)
            {
                var mandate = MapToEntity(dto, rawJson);
                mandate.ClientCode = clientCode;
                await _db.RocketPayMandates.AddAsync(mandate);
            }
            else
            {
                // Update scalar fields
                existing.Deleted = dto.Deleted;
                existing.UpdatedAt = dto.UpdatedAt;
                existing.UpdatedBy = dto.UpdatedBy;
                existing.ReferenceId = dto.ReferenceId;
                existing.ReferenceType = dto.ReferenceType;
                existing.ApprovalAmount = dto.ApprovalAmount;
                existing.AdvanceAmount = dto.AdvanceAmount;
                existing.Frequency = dto.Frequency;
                existing.StartDate = dto.StartDate;
                existing.EndDate = dto.EndDate;
                existing.TimeZone = dto.TimeZone;
                existing.InstallmentCount = dto.InstallmentCount;
                existing.State = dto.State;
                existing.PaymentOrderId = dto.PaymentOrderId;
                existing.MmsId = dto.MmsId;
                existing.ClientMetaDescription = dto.ClientMeta?.Description;
                existing.MandateAuthCheckoutUrl = dto.Meta?.MandateAuthCheckoutUrl;
                existing.EnterpriseId = dto.Meta?.EnterpriseId;
                existing.EnterpriseHandlerEntity = dto.Meta?.EnterpriseHandlerEntity;
                existing.RawJson = rawJson;
                existing.LocalUpdatedAt = DateTime.UtcNow;

                // Replace payer
                if (existing.Payer != null) _db.MandatePayers.Remove(existing.Payer);
                if (dto.Payer != null)
                {
                    await _db.MandatePayers.AddAsync(MapPayer(dto.Id, dto.Payer));
                }

                // Replace payees
                _db.MandatePayees.RemoveRange(existing.Payees);
                if (dto.Payees != null)
                {
                    foreach (var p in dto.Payees)
                        await _db.MandatePayees.AddAsync(MapPayee(dto.Id, p));
                }

                if (dto.Meta?.Txns != null)
                {
                    foreach (var t in dto.Meta.Txns)
                        await _db.MandateTransactions.AddAsync(MapTxn(dto.Id, t));
                }

                if (string.IsNullOrEmpty(existing.ClientCode) && !string.IsNullOrEmpty(clientCode))
                    existing.ClientCode = clientCode;
            }

            await _db.SaveChangesAsync();
        }

        private static RocketPayMandate MapToEntity(MandateResponseDto dto, string rawJson)
        {
            var mandate = new RocketPayMandate
            {
                Id = dto.Id!,
                Deleted = dto.Deleted,
                CreatedAt = dto.CreatedAt,
                UpdatedAt = dto.UpdatedAt,
                CreatedBy = dto.CreatedBy,
                UpdatedBy = dto.UpdatedBy,
                ReferenceId = dto.ReferenceId,
                ReferenceType = dto.ReferenceType,
                ApprovalAmount = dto.ApprovalAmount,
                AdvanceAmount = dto.AdvanceAmount,
                Frequency = dto.Frequency,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                TimeZone = dto.TimeZone,
                InstallmentCount = dto.InstallmentCount,
                State = dto.State,
                PaymentOrderId = dto.PaymentOrderId,
                MmsId = dto.MmsId,
                ClientMetaDescription = dto.ClientMeta?.Description,
                MandateAuthCheckoutUrl = dto.Meta?.MandateAuthCheckoutUrl,
                EnterpriseId = dto.Meta?.EnterpriseId,
                EnterpriseHandlerEntity = dto.Meta?.EnterpriseHandlerEntity,
                RawJson = rawJson,
                LocalCreatedAt = DateTime.UtcNow,
                LocalUpdatedAt = DateTime.UtcNow
            };

            if (dto.Payer != null)
                mandate.Payer = MapPayer(dto.Id!, dto.Payer);

            if (dto.Payees != null)
                mandate.Payees = dto.Payees.Select(p => MapPayee(dto.Id!, p)).ToList();

            if (dto.Meta?.Txns != null)
                mandate.Transactions = dto.Meta.Txns.Select(t => MapTxn(dto.Id!, t)).ToList();

            return mandate;
        }

        private static MandatePayer MapPayer(string mandateId, PartyDto p) => new()
        {
            MandateId = mandateId,
            Tag = p.Tag,
            Mode = p.Mode,
            AmountValue = p.Amount?.Value ?? 0,
            AmountCurrency = p.Amount?.Currency,
            AccountId = p.AccountId,
            MobileNumber = p.Account?.MobileNumber,
            Name = p.Account?.Name,
            InstrumentId = p.InstrumentId,
            Ifsc = p.Instrument?.Ifsc,
            BankCode = p.Instrument?.BankCode,
            BranchName = p.Instrument?.BranchName,
            AccountNumber = p.Instrument?.AccountNumber,
            AccountHolderNameAtBank = p.Instrument?.AccountHolderNameAtBank,
            AccountHolderName = p.Instrument?.AccountHolderName
        };

        private static MandatePayee MapPayee(string mandateId, PartyDto p) => new()
        {
            MandateId = mandateId,
            Tag = p.Tag,
            Mode = p.Mode,
            AmountValue = p.Amount?.Value ?? 0,
            AmountCurrency = p.Amount?.Currency,
            AccountId = p.AccountId,
            MobileNumber = p.Account?.MobileNumber,
            Name = p.Account?.Name,
            InstrumentId = p.InstrumentId,
            Ifsc = p.Instrument?.Ifsc,
            BankCode = p.Instrument?.BankCode,
            BranchName = p.Instrument?.BranchName,
            AccountNumber = p.Instrument?.AccountNumber,
            AccountHolderNameAtBank = p.Instrument?.AccountHolderNameAtBank,
            AccountHolderName = p.Instrument?.AccountHolderName
        };

        private static MandateTransaction MapTxn(string mandateId, TxnDto t) => new()
        {
            MandateId = mandateId,
            TxnId = t.Id,
            Utr = t.Utr,
            State = t.State,
            Medium = t.Medium,
            TxnCreatedAt = t.CreatedAt,
            GenericError = t.GenericError != null ? System.Text.Json.JsonSerializer.Serialize(t.GenericError) : null,
            Umrn = t.Meta?.Umrn,
            SubState = t.Meta?.SubState,
            GatewayName = t.Meta?.GatewayName,
            GatewayReferenceId = t.Meta?.GatewayReferenceId
        };

        // ── Real-Time Dashboard Aggregations ────────────────────────
        public async Task<DashboardMetricsDto> GetDashboardMetricsAsync(string timeRange, string? clientCode = null)
        {
            var todayStr = DateTime.Now.ToString("yyyy-MM-dd");
            var yesterdayStr = DateTime.Now.AddDays(-1).ToString("yyyy-MM-dd");
            var thisMonthStart = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1).ToString("yyyy-MM-dd");
            var lastMonthStart = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1).AddMonths(-1).ToString("yyyy-MM-dd");
            var lastMonthEnd = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1).AddDays(-1).ToString("yyyy-MM-dd");

            // Base query for active mandates to estimate expected collections
            var mandatesQuery = _db.RocketPayMandates.Where(m => !m.Deleted);
            if (!string.IsNullOrEmpty(clientCode))
                mandatesQuery = mandatesQuery.Where(m => m.ClientCode == clientCode);

            var activeMandates = await mandatesQuery
                .Where(m => m.State == "ACTIVATED")
                .ToListAsync();

            var totalExpected = activeMandates.Sum(m => m.ApprovalAmount);
            var activeCount = activeMandates.Count;

            // Base query for unique customers
            var payersQuery = _db.MandatePayers.AsQueryable();
            if (!string.IsNullOrEmpty(clientCode))
                payersQuery = payersQuery.Where(p => _db.RocketPayMandates.Any(m => m.Id == p.MandateId && m.ClientCode == clientCode));

            var allMobileNumbers = await payersQuery
                .Select(p => p.MobileNumber)
                .Distinct()
                .ToListAsync();
            var customerCount = allMobileNumbers.Count(m => !string.IsNullOrEmpty(m));

            // Base query for all installments to calculate collected/failed/expected metrics
            var installmentsQuery = _db.RocketPayInstallments
                .Include(i => i.Payer)
                .Where(i => !i.Deleted);
            
            if (!string.IsNullOrEmpty(clientCode))
                installmentsQuery = installmentsQuery.Where(i => i.ClientCode == clientCode);

            var installments = await installmentsQuery.ToListAsync();

            var metrics = new DashboardMetricsDto
            {
                TotalExpectedCollection = totalExpected,
                TotalActiveMandates = activeCount,
                TotalCustomers = customerCount
            };

            // Today / Yesterday logic
            metrics.ExpectedToday = installments
                .Where(i => (i.ScheduleDate == todayStr || i.DueDate == todayStr) && i.State != "TERMINATED")
                .Sum(i => i.Payer?.AmountValue ?? 0);

            metrics.CollectedYesterday = installments
                .Where(i => (i.ScheduleDate == yesterdayStr || i.DueDate == yesterdayStr) && (i.State == "COLLECTION_SUCCESS" || i.State == "SETTLEMENT_INITIATED" || i.State == "SETTLEMENT_SUCCESS"))
                .Sum(i => i.Payer?.AmountValue ?? 0);

            metrics.FailedYesterday = installments
                .Where(i => (i.ScheduleDate == yesterdayStr || i.DueDate == yesterdayStr) && i.State == "COLLECTION_FAILED")
                .Sum(i => i.Payer?.AmountValue ?? 0);

            // Month logic
            metrics.ExpectedThisMonth = installments
                .Where(i => string.Compare(i.DueDate, thisMonthStart) >= 0 && i.State != "TERMINATED")
                .Sum(i => i.Payer?.AmountValue ?? 0);

            metrics.CollectedThisMonth = installments
                .Where(i => string.Compare(i.DueDate, thisMonthStart) >= 0 && (i.State == "COLLECTION_SUCCESS" || i.State == "SETTLEMENT_INITIATED" || i.State == "SETTLEMENT_SUCCESS"))
                .Sum(i => i.Payer?.AmountValue ?? 0);

            metrics.FailedThisMonth = installments
                .Where(i => string.Compare(i.DueDate, thisMonthStart) >= 0 && i.State == "COLLECTION_FAILED")
                .Sum(i => i.Payer?.AmountValue ?? 0);

            metrics.CollectedLastMonth = installments
                .Where(i => string.Compare(i.DueDate, lastMonthStart) >= 0 && string.Compare(i.DueDate, lastMonthEnd) <= 0 && (i.State == "COLLECTION_SUCCESS" || i.State == "SETTLEMENT_INITIATED" || i.State == "SETTLEMENT_SUCCESS"))
                .Sum(i => i.Payer?.AmountValue ?? 0);

            metrics.FailedLastMonth = installments
                .Where(i => string.Compare(i.DueDate, lastMonthStart) >= 0 && string.Compare(i.DueDate, lastMonthEnd) <= 0 && i.State == "COLLECTION_FAILED")
                .Sum(i => i.Payer?.AmountValue ?? 0);

            // Chart Data specific to timeRange (3months, 30days, 7days)
            var daysToLookBack = timeRange switch
            {
                "3months" => 90,
                "30days" => 30,
                _ => 7 // default 7days
            };

            var chartData = new List<ChartDataPointDto>();
            for (int i = daysToLookBack - 1; i >= 0; i--)
            {
                var dt = DateTime.Now.AddDays(-i);
                var dtStr = dt.ToString("yyyy-MM-dd");
                
                // Calculate success collections for that day
                var dailySum = installments
                    .Where(inst => (inst.ScheduleDate == dtStr || inst.DueDate == dtStr) && 
                            (inst.State == "COLLECTION_SUCCESS" || inst.State == "SETTLEMENT_INITIATED" || inst.State == "SETTLEMENT_SUCCESS"))
                    .Sum(inst => inst.Payer?.AmountValue ?? 0);

                chartData.Add(new ChartDataPointDto 
                { 
                    Day = daysToLookBack <= 7 ? dt.ToString("ddd") : dt.ToString("MMM dd"), 
                    Value = dailySum 
                });
            }
            metrics.ChartData = chartData;

            return metrics;
        }
    }
}
