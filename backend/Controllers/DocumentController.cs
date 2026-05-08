using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TushGptBackend.Data;
using TushGptBackend.Models.HomeLoan;
using TushGptBackend.Models;

namespace TushGptBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DocumentController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DocumentController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Document/master
        [HttpGet("master")]
        public async Task<ActionResult<IEnumerable<DocumentMaster>>> GetDocumentMaster([FromQuery] string loanType = "HomeLoan")
        {
            return await _context.DocumentMasters
                .Where(d => d.LoanType == loanType)
                .ToListAsync();
        }

        // GET: api/Document/recent-applications
        [HttpGet("recent-applications")]
        public async Task<ActionResult<IEnumerable<object>>> GetRecentApplications()
        {
            var clientCode = HttpContext.Items["ClientCode"]?.ToString() ?? "";
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            bool isSuperAdmin = userRole == "SUPER_ADMIN";

            var results = new List<object>();
            using var command = _context.Database.GetDbConnection().CreateCommand();
            command.CommandText = "CALL sp_GetDocumentRecentApps(@p0, @p1)";
            var p0 = command.CreateParameter(); p0.ParameterName = "@p0"; p0.Value = clientCode; command.Parameters.Add(p0);
            var p1 = command.CreateParameter(); p1.ParameterName = "@p1"; p1.Value = isSuperAdmin; command.Parameters.Add(p1);

            await _context.Database.OpenConnectionAsync();
            try
            {
                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    results.Add(new
                    {
                        Id = reader.GetInt32(reader.GetOrdinal("Id")),
                        ApplicationNo = reader.IsDBNull(reader.GetOrdinal("ApplicationNo")) ? "" : reader.GetString(reader.GetOrdinal("ApplicationNo")),
                        ApplicantName = reader.IsDBNull(reader.GetOrdinal("ApplicantName")) ? "" : reader.GetString(reader.GetOrdinal("ApplicantName")),
                        LoanAmountNum = reader.IsDBNull(reader.GetOrdinal("LoanAmountNum")) ? "0" : reader.GetString(reader.GetOrdinal("LoanAmountNum")),
                        Status = reader.IsDBNull(reader.GetOrdinal("Status")) ? "" : reader.GetString(reader.GetOrdinal("Status")),
                        DocumentCompletionPercentage = reader.IsDBNull(reader.GetOrdinal("DocumentCompletionPercentage")) ? 0m : reader.GetDecimal(reader.GetOrdinal("DocumentCompletionPercentage")),
                        CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                        LoanType = reader.GetString(reader.GetOrdinal("LoanType"))
                    });
                }
            }
            finally
            {
                await _context.Database.CloseConnectionAsync();
            }

            return Ok(results);
        }

        // GET: api/Document/diagnose/{idOrNo}
        [HttpGet("diagnose/{idOrNo}")]
        public async Task<ActionResult<object>> DiagnoseApplication(string idOrNo)
        {
            // Filter-free lookup for diagnosis
            object? app = await _context.HomeLoanApplications.FirstOrDefaultAsync(a => a.ApplicationNo == idOrNo);
            string loanType = "HomeLoan";
            
            if (app == null) {
                app = await _context.VehicleLoanApplications.FirstOrDefaultAsync(a => a.ApplicationNo == idOrNo);
                loanType = "VehicleLoan";
            }
            if (app == null) {
                app = await _context.BusinessLoanApplications.FirstOrDefaultAsync(a => a.ApplicationNo == idOrNo);
                loanType = "BusinessLoan";
            }
            if (app == null) {
                app = await _context.PersonalLoans.FirstOrDefaultAsync(a => a.ApplicationNo == idOrNo);
                loanType = "PersonalLoan";
            }

            if (app == null) return NotFound(new { message = "App not found even in filter-free search" });

            dynamic dApp = app;
            int appId = dApp.Id;

            var docs = await _context.LoanDocuments
                .Where(d => d.ApplicationId == appId)
                .Select(d => new { d.Id, d.ApplicationId, d.LoanType, d.FileName, d.DocumentMasterId, d.Status })
                .ToListAsync();

            var masterDocs = await _context.DocumentMasters
                .Where(m => m.LoanType == loanType)
                .Select(m => new { m.Id, m.DocumentName, m.Category })
                .ToListAsync();

            var formId = masterDocs.FirstOrDefault(m => m.DocumentName.Contains("Form") || m.DocumentName.Contains("Arj"))?.Id;

            return Ok(new {
                ApplicationId = appId,
                ApplicationNo = dApp.ApplicationNo,
                ModelLoanType = loanType,
                CurrentMasterCount = masterDocs.Count,
                SuggestedFormId = formId,
                MasterSample = masterDocs.Take(10).ToList(),
                OrphanedDocuments = docs.Where(d => !masterDocs.Any(m => m.Id == d.DocumentMasterId)).ToList()
            });
        }

        // GET: api/Document/list-all
        [AllowAnonymous]
        [HttpGet("list-all")]
        public async Task<ActionResult<object>> ListAllApps()
        {
            var h = await _context.HomeLoanApplications.Select(a => a.ApplicationNo).ToListAsync();
            var v = await _context.VehicleLoanApplications.Select(a => a.ApplicationNo).ToListAsync();
            var b = await _context.BusinessLoanApplications.Select(a => a.ApplicationNo).ToListAsync();
            var p = await _context.PersonalLoans.Select(a => a.ApplicationNo).ToListAsync();

            return Ok(new { Home = h, Vehicle = v, Business = b, Personal = p });
        }
        [AllowAnonymous]
        [HttpGet("fix-orphans/{idOrNo}")]
        public async Task<ActionResult<object>> FixOrphanedDocuments(string idOrNo)
        {
            // Filter-free lookup for recovery
            object? app = await _context.HomeLoanApplications.FirstOrDefaultAsync(a => a.ApplicationNo == idOrNo);
            string loanType = "HomeLoan";
            
            if (app == null) {
                app = await _context.VehicleLoanApplications.FirstOrDefaultAsync(a => a.ApplicationNo == idOrNo);
                loanType = "VehicleLoan";
            }
            if (app == null) {
                app = await _context.BusinessLoanApplications.FirstOrDefaultAsync(a => a.ApplicationNo == idOrNo);
                loanType = "BusinessLoan";
            }
            if (app == null) {
                app = await _context.PersonalLoans.FirstOrDefaultAsync(a => a.ApplicationNo == idOrNo);
                loanType = "PersonalLoan";
            }

            if (app == null) return NotFound(new { message = "App not found even in filter-free search" });

            dynamic dApp = app;
            int appId = dApp.Id;

            var masterDocs = await _context.DocumentMasters
                .Where(m => m.LoanType == loanType)
                .ToListAsync();

            var docs = await _context.LoanDocuments
                .Where(d => d.ApplicationId == appId)
                .ToListAsync();

            int fixedCount = 0;
            foreach (var doc in docs)
            {
                bool changed = false;
                
                // 1. Repair LoanType mismatch
                if (doc.LoanType != loanType) {
                    doc.LoanType = loanType;
                    changed = true;
                }

                // 2. Repair Master ID mismatch/orphan
                if (!masterDocs.Any(m => m.Id == doc.DocumentMasterId))
                {
                    // Find correct master by name match
                    var matchingMaster = masterDocs.FirstOrDefault(m => 
                        doc.FileName != null && m.DocumentName != null && 
                        (doc.FileName.Contains(m.DocumentName) || m.DocumentName.Contains(doc.FileName.Replace(".pdf", "").Replace(".jpg", ""))));

                    if (matchingMaster == null) {
                        // Special check for "Form" documents
                        if (doc.FileName != null && (doc.FileName.Contains("Form") || doc.FileName.Contains("Arj"))) {
                            matchingMaster = masterDocs.FirstOrDefault(m => m.DocumentName.Contains("Form") || m.DocumentName.Contains("Arj"));
                        }
                    }

                    if (matchingMaster != null) {
                        doc.DocumentMasterId = matchingMaster.Id;
                        changed = true;
                    }
                    else {
                        // Fallback: Map to first available slot or generic "Form" slot
                        var formMaster = masterDocs.FirstOrDefault(m => m.DocumentName.Contains("Form") || m.DocumentName.Contains("Arj"));
                        if (formMaster != null) {
                            doc.DocumentMasterId = formMaster.Id;
                            changed = true;
                        }
                    }
                }

                if (changed) fixedCount++;
            }

            if (fixedCount > 0)
            {
                await _context.SaveChangesAsync();
                await UpdateApplicationStats(appId, loanType);
            }

            return Ok(new { message = $"Data recovery complete. Fixed {fixedCount} orphaned document mappings.", applicationId = appId, loanType = loanType });
        }

        // GET: api/Document/count-all-docs
        [AllowAnonymous]
        [HttpGet("count-all-docs")]
        public async Task<ActionResult<object>> CountAllDocs()
        {
            var count = await _context.LoanDocuments.CountAsync();
            var samples = await _context.LoanDocuments.Take(10).Select(d => new { d.Id, d.ApplicationId, d.LoanType, d.FileName }).ToListAsync();
            return Ok(new { TotalDocuments = count, Samples = samples });
        }
        [AllowAnonymous]
        [HttpGet("debug-id/{idOrNo}")]
        public async Task<ActionResult<object>> DebugApplicationId(string idOrNo)
        {
            var (app, loanType) = await FindApplication(idOrNo);
            if (app == null) return NotFound(new { message = "App not found" });

            dynamic dApp = app;
            int appId = dApp.Id;

            var docs = await _context.LoanDocuments
                .Where(d => d.ApplicationId == appId)
                .Select(d => new { d.Id, d.FileName, d.DocumentMasterId, d.LoanType })
                .ToListAsync();

            string resolvedLoanType = loanType ?? (string)dApp.LoanType;
            var masterDocs = await _context.DocumentMasters
                .Where(m => m.LoanType == resolvedLoanType)
                .Select(m => new { m.Id, m.DocumentName })
                .ToListAsync();

            return Ok(new {
                ApplicationId = appId,
                AppLoanType = loanType,
                Documents = docs,
                MasterList = masterDocs
            });
        }

        // GET: api/Document/sync-all-stats
        [HttpGet("sync-all-stats")]
        [AllowAnonymous]
        public async Task<IActionResult> SyncAllStats()
        {
            try
            {
                var home = await _context.HomeLoanApplications.Select(a => new { a.Id, Type = "HomeLoan" }).ToListAsync();
                var vehicle = await _context.VehicleLoanApplications.Select(a => new { a.Id, Type = "VehicleLoan" }).ToListAsync();
                var business = await _context.BusinessLoanApplications.Select(a => new { a.Id, Type = "BusinessLoan" }).ToListAsync();
                var personal = await _context.PersonalLoans.Select(a => new { a.Id, Type = "PersonalLoan" }).ToListAsync();

                var all = home.Concat(vehicle).Concat(business).Concat(personal).ToList();
                int total = all.Count;

                foreach (var app in all)
                {
                    await UpdateApplicationStats(app.Id, app.Type);
                }

                return Ok(new { message = $"Synchronized statistics for {total} applications." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Sync failed", error = ex.Message });
            }
        }

        [AllowAnonymous]
        [HttpGet("application/{idOrNo}")]
        public async Task<ActionResult<object>> GetApplicationDocuments(string idOrNo)
        {
            var (app, loanType) = await FindApplication(idOrNo, includeDetails: true);
            if (app == null) return NotFound(new { message = "Application not found" });

            dynamic dApp = app;
            int applicationId = dApp.Id;

            // Fetch only metadata from the database (SKIP FileContent byte blob)
            var docsMetadata = await _context.LoanDocuments
                .Where(d => d.ApplicationId == applicationId && d.LoanType == loanType)
                .Select(d => new {
                    d.Id,
                    d.DocumentMasterId,
                    d.FileName,
                    d.FileType,
                    d.Status,
                    d.UploadedAt,
                    d.VerifiedAt,
                    d.Remarks,
                    d.UploadedBy,
                    d.VerifiedBy
                })
                .ToListAsync();

            var masterDocs = await _context.DocumentMasters
                .Where(m => m.LoanType == loanType)
                .ToListAsync();

            var masterIds = masterDocs.Select(m => m.Id).ToHashSet();

            // CRITICAL FIX: Only return documents that belong to the CURRENT master list
            var distinctDocs = docsMetadata
                .Where(d => masterIds.Contains(d.DocumentMasterId))
                .GroupBy(d => d.DocumentMasterId)
                .Select(g => g.OrderByDescending(d => d.UploadedAt).First())
                .ToList();

            string applicantName = loanType == "VehicleLoan" ? dApp.ArjdarNaav : dApp.ApplicantName;

            int totalDocs = masterDocs.Count;
            int uploadedDocs = distinctDocs.Count;
            int verifiedDocs = distinctDocs.Count(d => d.Status == "Verified");
            int pendingDocs = totalDocs - uploadedDocs;
            decimal completionPct = totalDocs > 0 ? Math.Round((decimal)uploadedDocs / totalDocs * 100, 2) : 0;

            return Ok(new {
                Application = new {
                    dApp.Id,
                    dApp.ApplicationNo,
                    ApplicantName = applicantName,
                    TotalDocuments = totalDocs,
                    UploadedDocuments = uploadedDocs,
                    VerifiedDocuments = verifiedDocs,
                    PendingDocuments = pendingDocs < 0 ? 0 : pendingDocs,
                    DocumentStatus = uploadedDocs == 0 ? "PENDING" : (verifiedDocs == totalDocs && totalDocs > 0 ? "COMPLETED" : "IN_PROGRESS"),
                    DocumentCompletionPercentage = completionPct,
                    LoanType = loanType,
                    Details = app
                },
                Documents = distinctDocs,
                MasterList = masterDocs
            });
        }

        // POST: api/Document/upload
        [HttpPost("upload")]
        public async Task<IActionResult> UploadDocument([FromForm] int applicationId, [FromForm] int documentMasterId, [FromForm] IFormFile file, [FromForm] string? loanType)
        {
            try
            {
                if (file == null || file.Length == 0) return BadRequest(new { message = "No file uploaded" });
                if (file.Length > 10 * 1024 * 1024) return BadRequest(new { message = "File size exceeds 10MB limit" });

                if (string.IsNullOrEmpty(loanType))
                {
                    var result = await FindApplication(applicationId.ToString());
                    loanType = result.loanType;
                }

                if (string.IsNullOrEmpty(loanType)) return BadRequest(new { message = "Determine loan type context failed" });

                var master = await _context.DocumentMasters.FindAsync(documentMasterId);
                if (master == null) return BadRequest(new { message = "Invalid document type" });

                using var ms = new MemoryStream();
                await file.CopyToAsync(ms);
                byte[] content = ms.ToArray();

                var existingDoc = await _context.LoanDocuments
                    .FirstOrDefaultAsync(d => d.ApplicationId == applicationId && d.DocumentMasterId == documentMasterId && d.LoanType == loanType);

                if (existingDoc != null)
                {
                    existingDoc.FileName = file.FileName;
                    existingDoc.FileType = file.ContentType;
                    existingDoc.FileContent = content;
                    existingDoc.Status = "Uploaded";
                    existingDoc.UploadedAt = DateTime.UtcNow;
                    existingDoc.Remarks = null;
                    _context.LoanDocuments.Update(existingDoc);
                }
                else
                {
                    var doc = new LoanDocument
                    {
                        ApplicationId = applicationId,
                        DocumentMasterId = documentMasterId,
                        LoanType = loanType,
                        FileName = file.FileName,
                        FileType = file.ContentType,
                        FileContent = content,
                        Status = "Uploaded",
                        UploadedAt = DateTime.UtcNow,
                        UploadedBy = User.Identity?.Name ?? "System"
                    };
                    _context.LoanDocuments.Add(doc);
                }

                await _context.SaveChangesAsync();
                await UpdateApplicationStats(applicationId, loanType);

                return Ok(new { message = "Document uploaded successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Server error during upload", details = ex.Message });
            }
        }

        // GET: api/Document/view/{id}
        [HttpGet("view/{id}")]
        public async Task<IActionResult> ViewDocument(int id)
        {
            var doc = await _context.LoanDocuments
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.Id == id);
            
            if (doc == null) return NotFound();

            return File(doc.FileContent, doc.FileType);
        }


        // PUT: api/Document/verify/{id}
        [HttpPut("verify/{id}")]
        public async Task<IActionResult> VerifyDocument(int id, [FromBody] string? remarks)
        {
            var user = User.Identity?.Name ?? "System";
            await _context.Database.ExecuteSqlRawAsync("CALL sp_UpdateDocumentStats({0}, {1}, {2}, {3})", 
                id, "Verified", remarks, user);

            return Ok(new { message = "Document verified" });
        }


        // PUT: api/Document/reject/{id}
        [HttpPut("reject/{id}")]
        public async Task<IActionResult> RejectDocument(int id, [FromBody] string? remarks)
        {
            var user = User.Identity?.Name ?? "System";
            await _context.Database.ExecuteSqlRawAsync("CALL sp_UpdateDocumentStats({0}, {1}, {2}, {3})", 
                id, "Rejected", remarks, user);

            return Ok(new { message = "Document rejected" });
        }


        // DELETE: api/Document/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDocument(int id)
        {
            var doc = await _context.LoanDocuments.FindAsync(id);
            if (doc == null) return NotFound();

            int appId = doc.ApplicationId;
            string lType = doc.LoanType ?? "HomeLoan";
            _context.LoanDocuments.Remove(doc);
            await _context.SaveChangesAsync();
            
            // Fast SP-based recount
            await _context.Database.ExecuteSqlRawAsync("CALL sp_RecalculateAppStats({0}, {1})", appId, lType);

            return Ok(new { message = "Document eliminated" });
        }


        private async Task<(object? app, string loanType)> FindApplication(string idOrNo, bool includeDetails = false)
        {
            var clientCode = HttpContext.Items["ClientCode"]?.ToString();
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            bool isSuperAdmin = userRole == "SUPER_ADMIN";

            var bypass = string.IsNullOrEmpty(clientCode);

            // Helpers to add includes if requested
            IQueryable<HomeLoanApplication> ApplyHomeIncludes(IQueryable<HomeLoanApplication> query) => 
                query; // HomeLoanApplication primarily uses RawJson for details

            IQueryable<VehicleLoanApplication> ApplyVehicleIncludes(IQueryable<VehicleLoanApplication> query) => 
                includeDetails ? query.Include(a => a.Borrower).Include(a => a.NewVehicle).Include(a => a.OldVehicle).Include(a => a.Insurance).Include(a => a.Guarantors).Include(a => a.BusinessInfo).Include(a => a.TaxDetails) : query;

            IQueryable<BusinessLoanApplication> ApplyBusinessIncludes(IQueryable<BusinessLoanApplication> query) => 
                includeDetails ? query.Include(a => a.Borrower).Include(a => a.Guarantors).Include(a => a.ExtraGuarantors).Include(a => a.BusinessInfo).Include(a => a.InsuranceTaxInfo).Include(a => a.Collateral) : query;

            IQueryable<PersonalLoan> ApplyPersonalIncludes(IQueryable<PersonalLoan> query) => 
                includeDetails ? query.Include(a => a.Borrower).Include(a => a.Guarantor1).Include(a => a.Guarantor2).Include(a => a.Office) : query;

            // 1. ApplicationNo lookup takes precedence
            var h2Q = _context.HomeLoanApplications.Where(a => a.ApplicationNo == idOrNo && (bypass || isSuperAdmin || a.ClientCode == clientCode));
            var h2 = await ApplyHomeIncludes(h2Q).FirstOrDefaultAsync();
            if (h2 != null) return (h2, "HomeLoan");
            
            var v2Q = _context.VehicleLoanApplications.Where(a => a.ApplicationNo == idOrNo && (bypass || isSuperAdmin || a.ClientCode == clientCode));
            var v2 = await ApplyVehicleIncludes(v2Q).FirstOrDefaultAsync();
            if (v2 != null) return (v2, "VehicleLoan");
            
            var b2Q = _context.BusinessLoanApplications.Where(a => a.ApplicationNo == idOrNo && (bypass || isSuperAdmin || a.ClientCode == clientCode));
            var b2 = await ApplyBusinessIncludes(b2Q).FirstOrDefaultAsync();
            if (b2 != null) return (b2, "BusinessLoan");
            
            var p2Query = _context.PersonalLoans.Where(a => a.ApplicationNo == idOrNo && (bypass || isSuperAdmin || a.ClientCode == clientCode));
            var p2 = await ApplyPersonalIncludes(p2Query).FirstOrDefaultAsync();
            if (p2 != null) return (p2, "PersonalLoan");

            // 2. ID lookup as fallback
            if (int.TryParse(idOrNo, out int id))
            {
                var hQ = _context.HomeLoanApplications.Where(a => a.Id == id && (isSuperAdmin || a.ClientCode == clientCode));
                var h = await ApplyHomeIncludes(hQ).FirstOrDefaultAsync();
                if (h != null) return (h, "HomeLoan");
                
                var vQ = _context.VehicleLoanApplications.Where(a => a.Id == id && (isSuperAdmin || a.ClientCode == clientCode));
                var v = await ApplyVehicleIncludes(vQ).FirstOrDefaultAsync();
                if (v != null) return (v, "VehicleLoan");
                
                var bQ = _context.BusinessLoanApplications.Where(a => a.Id == id && (isSuperAdmin || a.ClientCode == clientCode));
                var b = await ApplyBusinessIncludes(bQ).FirstOrDefaultAsync();
                if (b != null) return (b, "BusinessLoan");
                
                var pQuery = _context.PersonalLoans.Where(a => a.Id == id && (isSuperAdmin || a.ClientCode == clientCode));
                var p = await ApplyPersonalIncludes(pQuery).FirstOrDefaultAsync();
                if (p != null) return (p, "PersonalLoan");
            }

            return (null, "");
        }

        private async Task UpdateApplicationStats(int applicationId, string loanType)
        {
            // Call the high-performance Stored Procedure for sub-second statistics recalculation
            await _context.Database.ExecuteSqlRawAsync("CALL sp_RecalculateAppStats({0}, {1})", applicationId, loanType);
        }
    }
}
