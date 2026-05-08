using TushGptBackend.Data;
using TushGptBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace TushGptBackend.Services
{
    public class CreditService
    {
        private readonly AppDbContext _context;
        private readonly AuditService _audit;

        public CreditService(AppDbContext context, AuditService audit)
        {
            _context = context;
            _audit = audit;
        }

        /// <summary>
        /// Get current credit balance for a client.
        /// </summary>
        public async Task<decimal> GetBalanceAsync(string clientCode)
        {
            var wallet = await _context.CreditWallets
                .FirstOrDefaultAsync(w => w.ClientCode == clientCode);
            return wallet?.Balance ?? 0;
        }

        /// <summary>
        /// Add credit to a client's wallet. Returns new balance.
        /// </summary>
        public async Task<decimal> AddCreditAsync(string clientCode, decimal amount, string description, int? userId = null, string? ip = null)
        {
            var wallet = await _context.CreditWallets
                .FirstOrDefaultAsync(w => w.ClientCode == clientCode);

            if (wallet == null)
            {
                wallet = new CreditWallet { ClientCode = clientCode, Balance = 0 };
                _context.CreditWallets.Add(wallet);
                await _context.SaveChangesAsync();
            }

            wallet.Balance += amount;
            wallet.UpdatedAt = DateTime.UtcNow;

            var txn = new CreditTransaction
            {
                ClientCode = clientCode,
                Type = "CREDIT",
                Amount = amount,
                BalanceAfter = wallet.Balance,
                Description = description,
                CreatedAt = DateTime.UtcNow
            };
            _context.CreditTransactions.Add(txn);
            await _context.SaveChangesAsync();

            await _audit.LogAsync(clientCode, userId, "CREDIT_ADDED", $"Added {amount:F2} credit. New balance: {wallet.Balance:F2}", ip);

            return wallet.Balance;
        }

        /// <summary>
        /// Deduct credit for a service usage. Returns true if successful, false if insufficient balance.
        /// </summary>
        public async Task<(bool Success, decimal BalanceAfter, string Message)> DeductCreditAsync(
            string clientCode, string category, string? referenceId = null, int? userId = null, string? ip = null)
        {
            // Get the latest applicable rate for this category
            var rate = await _context.ServiceRates
                .Where(r => r.ClientCode == clientCode && r.Category == category && r.EffectiveFrom <= DateTime.UtcNow)
                .OrderByDescending(r => r.EffectiveFrom)
                .FirstOrDefaultAsync();

            if (rate == null)
            {
                // No rate configured — allow usage for free (backward compatible)
                return (true, await GetBalanceAsync(clientCode), "No rate configured, service is free.");
            }

            var wallet = await _context.CreditWallets
                .FirstOrDefaultAsync(w => w.ClientCode == clientCode);

            if (wallet == null || wallet.Balance < rate.Rate)
            {
                return (false, wallet?.Balance ?? 0, $"Insufficient credit. Required: {rate.Rate:F2}, Available: {wallet?.Balance ?? 0:F2}");
            }

            wallet.Balance -= rate.Rate;
            wallet.UpdatedAt = DateTime.UtcNow;

            var txn = new CreditTransaction
            {
                ClientCode = clientCode,
                Type = "DEBIT",
                Amount = rate.Rate,
                BalanceAfter = wallet.Balance,
                Category = category,
                ReferenceId = referenceId,
                Description = $"{category} service usage",
                CreatedAt = DateTime.UtcNow
            };
            _context.CreditTransactions.Add(txn);
            await _context.SaveChangesAsync();

            await _audit.LogAsync(clientCode, userId, "CREDIT_DEDUCTED",
                $"Deducted {rate.Rate:F2} for {category}. Balance: {wallet.Balance:F2}", ip);

            return (true, wallet.Balance, "Credit deducted successfully.");
        }

        /// <summary>
        /// Get transaction history for a client.
        /// </summary>
        public async Task<List<CreditTransaction>> GetTransactionsAsync(string clientCode, int limit = 50)
        {
            return await _context.CreditTransactions
                .Where(t => t.ClientCode == clientCode)
                .OrderByDescending(t => t.CreatedAt)
                .Take(limit)
                .ToListAsync();
        }
    }
}
