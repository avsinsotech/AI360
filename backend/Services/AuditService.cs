using TushGptBackend.Data;
using TushGptBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace TushGptBackend.Services
{
    public class AuditService
    {
        private readonly AppDbContext _context;

        public AuditService(AppDbContext context)
        {
            _context = context;
        }

        public async Task LogAsync(string? clientCode, int? userId, string action, string description, string? ipAddress = null)
        {
            var log = new AuditLog
            {
                ClientCode = clientCode,
                UserId = userId,
                Action = action,
                Description = description,
                IpAddress = ipAddress,
                CreatedAt = DateTime.UtcNow
            };

            _context.AuditLogs.Add(log);
            await _context.SaveChangesAsync();
        }

        public async Task<List<AuditLog>> GetLogsAsync(string? clientCode = null, int limit = 100)
        {
            var query = _context.AuditLogs.AsQueryable();
            
            if (!string.IsNullOrEmpty(clientCode))
            {
                query = query.Where(l => l.ClientCode == clientCode);
            }

            return await query
                .OrderByDescending(l => l.CreatedAt)
                .Take(limit)
                .ToListAsync();
        }
    }
}
