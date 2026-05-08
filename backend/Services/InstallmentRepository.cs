using Microsoft.EntityFrameworkCore;
using TushGptBackend.Data;
using TushGptBackend.Models.RocketPay;
using TushGptBackend.Models.RocketPay.Dtos;

namespace TushGptBackend.Services
{
    public class InstallmentRepository
    {
        private readonly AppDbContext _db;

        public InstallmentRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<List<RocketPayInstallment>> GetByMandateAsync(string mandateId, string? clientCode = null)
        {
            var query = _db.RocketPayInstallments.AsQueryable();
            if (!string.IsNullOrEmpty(clientCode))
                query = query.Where(i => i.ClientCode == clientCode);

            return await query
                .Include(i => i.Payer)
                .Include(i => i.Payees)
                .Include(i => i.Transactions)
                .Where(i => i.MandateId == mandateId)
                .OrderByDescending(i => i.LocalCreatedAt)
                .ToListAsync();
        }

        public async Task<RocketPayInstallment?> GetByIdAsync(string id, string? clientCode = null)
        {
            var query = _db.RocketPayInstallments.AsQueryable();
            if (!string.IsNullOrEmpty(clientCode))
                query = query.Where(i => i.ClientCode == clientCode);

            return await query
                .Include(i => i.Payer)
                .Include(i => i.Payees)
                .Include(i => i.Transactions)
                .FirstOrDefaultAsync(i => i.Id == id);
        }

        public async Task UpsertAsync(InstallmentResponseDto dto, string rawJson, string? clientCode = null)
        {
            if (string.IsNullOrEmpty(dto.Id)) return;

            var existing = await _db.RocketPayInstallments
                .Include(i => i.Payer)
                .Include(i => i.Payees)
                .Include(i => i.Transactions)
                .FirstOrDefaultAsync(i => i.Id == dto.Id);

            if (existing == null)
            {
                var installment = MapToEntity(dto, rawJson);
                
                // If clientCode not provided (e.g. webhook), lookup from mandate
                if (string.IsNullOrEmpty(clientCode) && !string.IsNullOrEmpty(dto.MandateId))
                {
                    var mandate = await _db.RocketPayMandates.FirstOrDefaultAsync(m => m.Id == dto.MandateId);
                    clientCode = mandate?.ClientCode;
                }
                
                installment.ClientCode = clientCode;
                await _db.RocketPayInstallments.AddAsync(installment);
            }
            else
            {
                if (string.IsNullOrEmpty(existing.ClientCode))
                {
                    if (!string.IsNullOrEmpty(clientCode))
                    {
                        existing.ClientCode = clientCode;
                    }
                    else if (!string.IsNullOrEmpty(dto.MandateId))
                    {
                        var mandate = await _db.RocketPayMandates.FirstOrDefaultAsync(m => m.Id == dto.MandateId);
                        existing.ClientCode = mandate?.ClientCode;
                    }
                }

                existing.Deleted = dto.Deleted;
                existing.UpdatedAt = dto.UpdatedAt;
                existing.UpdatedBy = dto.UpdatedBy;
                existing.ReferenceId = dto.ReferenceId;
                existing.ReferenceType = dto.ReferenceType;
                existing.MandateId = dto.MandateId;
                existing.DueDate = dto.DueDate;
                existing.ScheduleDate = dto.ScheduleDate;
                existing.TimeZone = dto.TimeZone;
                existing.State = dto.State;
                existing.PaymentOrderId = dto.PaymentOrderId;
                existing.MmsId = dto.MmsId;
                existing.ClientMetaDescription = dto.ClientMeta?.Description;
                existing.RawJson = rawJson;
                existing.LocalUpdatedAt = DateTime.UtcNow;

                if (existing.Payer != null) _db.InstallmentPayers.Remove(existing.Payer);
                if (dto.Payer != null)
                    await _db.InstallmentPayers.AddAsync(MapPayer(dto.Id, dto.Payer));

                _db.InstallmentPayees.RemoveRange(existing.Payees);
                if (dto.Payees != null)
                    foreach (var p in dto.Payees)
                        await _db.InstallmentPayees.AddAsync(MapPayee(dto.Id, p));

                _db.InstallmentTransactions.RemoveRange(existing.Transactions);
                if (dto.Meta?.Txns != null)
                    foreach (var t in dto.Meta.Txns)
                        await _db.InstallmentTransactions.AddAsync(MapTxn(dto.Id, t));
            }

            await _db.SaveChangesAsync();
        }

        private static RocketPayInstallment MapToEntity(InstallmentResponseDto dto, string rawJson)
        {
            var inst = new RocketPayInstallment
            {
                Id = dto.Id!,
                Deleted = dto.Deleted,
                CreatedAt = dto.CreatedAt,
                UpdatedAt = dto.UpdatedAt,
                CreatedBy = dto.CreatedBy,
                UpdatedBy = dto.UpdatedBy,
                ReferenceId = dto.ReferenceId,
                ReferenceType = dto.ReferenceType,
                MandateId = dto.MandateId,
                DueDate = dto.DueDate,
                ScheduleDate = dto.ScheduleDate,
                TimeZone = dto.TimeZone,
                State = dto.State,
                PaymentOrderId = dto.PaymentOrderId,
                MmsId = dto.MmsId,
                ClientMetaDescription = dto.ClientMeta?.Description,
                RawJson = rawJson,
                LocalCreatedAt = DateTime.UtcNow,
                LocalUpdatedAt = DateTime.UtcNow
            };

            if (dto.Payer != null)
                inst.Payer = MapPayer(dto.Id!, dto.Payer);

            if (dto.Payees != null)
                inst.Payees = dto.Payees.Select(p => MapPayee(dto.Id!, p)).ToList();

            if (dto.Meta?.Txns != null)
                inst.Transactions = dto.Meta.Txns.Select(t => MapTxn(dto.Id!, t)).ToList();

            return inst;
        }

        private static InstallmentPayer MapPayer(string installmentId, PartyDto p) => new()
        {
            InstallmentId = installmentId,
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
            AccountHolderName = p.Instrument?.AccountHolderName,
            Vpa = p.Instrument?.Vpa
        };

        private static InstallmentPayee MapPayee(string installmentId, PartyDto p) => new()
        {
            InstallmentId = installmentId,
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
            AccountHolderName = p.Instrument?.AccountHolderName,
            Vpa = p.Instrument?.Vpa
        };

        private static InstallmentTransaction MapTxn(string installmentId, TxnDto t) => new()
        {
            InstallmentId = installmentId,
            TxnId = t.Id,
            Utr = t.Utr,
            State = t.State,
            Medium = t.Medium,
            TxnCreatedAt = t.CreatedAt,
            GenericError = t.GenericError != null ? System.Text.Json.JsonSerializer.Serialize(t.GenericError) : null,
            Umrn = t.Meta?.Umrn,
            SubState = t.Meta?.SubState,
            SubStateReason = t.Meta?.SubStateReason,
            SubStateTimestamp = t.Meta?.SubStateTimestamp
        };
    }
}
