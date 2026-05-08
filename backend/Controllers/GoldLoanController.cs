using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TushGptBackend.Data;
using TushGptBackend.Models;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;

namespace TushGptBackend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class GoldLoanController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GoldLoanController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/GoldLoan
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetLoans()
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();

            var query = _context.GoldLoans.AsQueryable();

            if (userRole != "SUPER_ADMIN")
            {
                if (string.IsNullOrEmpty(userClientCode)) return BadRequest(new { message = "ClientCode not found in token." });
                query = query.Where(l => l.ClientCode == userClientCode);
            }

            var loans = await query
                .OrderByDescending(x => x.CreatedAt)
                .Select(l => new 
                {
                    id = l.Id,
                    applicationNo = l.ApplicationNo,
                    customerName = l.CustomerName,
                    scheme = l.Scheme,
                    loanSanction = l.LoanSanction,
                    createdAt = l.CreatedAt,
                    valuationDoc = l.ValuationDoc
                })
                .ToListAsync();

            return Ok(loans);
        }

        // GET: api/GoldLoan/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetLoan(int id, [FromQuery] bool excludeImages = false)
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();

            IQueryable<GoldLoan> query = _context.GoldLoans
                .Include(g => g.Ornaments.OrderBy(o => o.RowOrder))
                .Include(g => g.Deductions.OrderBy(d => d.RowOrder));

            if (!excludeImages)
            {
                query = query.Include(g => g.Images);
            }

            var loan = await query.FirstOrDefaultAsync(p => p.Id == id);
            if (loan == null) return NotFound();

            if (userRole != "SUPER_ADMIN" && loan.ClientCode != userClientCode)
                return Unauthorized(new { message = "You do not have permission to access this record." });

            // Detect if photos exist even if not currently included in the 'loan' object
            bool hasImages = !excludeImages 
                ? (loan.Images != null && loan.Images.Any()) 
                : await _context.GoldLoanImages.AnyAsync(i => i.GoldLoanId == id);

            // Lookup customer photo 
            var aadhar = await _context.VerifiedAadhars.OrderByDescending(a => a.VerifiedAt).FirstOrDefaultAsync(a => a.AadhaarNo == loan.AadhaarNo);
            string? customerPhoto = aadhar?.Photo;

            return Ok(FlattenLoanForFrontend(loan, hasImages, customerPhoto));
        }

        // POST: api/GoldLoan
        [HttpPost]
        public async Task<ActionResult<object>> PostLoan([FromBody] GoldLoanRequest req)
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();

            if (userRole != "SUPER_ADMIN")
            {
                if (string.IsNullOrEmpty(userClientCode))
                    return Unauthorized(new { message = "ClientCode missing from token." });
            }

            try
            {
                if (req == null) return BadRequest("Invalid data");
                int? id = req.id;
                GoldLoan? loan = null;

                if (id.HasValue && id > 0)
                {
                    loan = await _context.GoldLoans
                        .Include(g => g.Ornaments)
                        .Include(g => g.Deductions)
                        .Include(g => g.Images)
                        .FirstOrDefaultAsync(l => l.Id == id.Value);
                }

                string? appNo = loan?.ApplicationNo;
                string? clientCode = userClientCode ?? req.clientCode;

                if (string.IsNullOrEmpty(appNo))
                {
                    // GL-YYYYMMDD-XXXXXX
                    appNo = $"GL-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
                }

                if (loan == null)
                {
                    loan = new GoldLoan 
                    { 
                        CreatedAt = DateTime.Now,
                        ApplicationNo = appNo,
                        ClientCode = clientCode
                    };
                    _context.GoldLoans.Add(loan);
                }
                else
                {
                    if (userRole == "SUPER_ADMIN")
                    {
                        if (!string.IsNullOrEmpty(req.applicationNo)) appNo = req.applicationNo;
                        if (!string.IsNullOrEmpty(req.clientCode)) clientCode = req.clientCode;
                    }
                    loan.ApplicationNo = appNo;
                    loan.ClientCode = clientCode;
                    loan.UpdatedAt = DateTime.Now;
                }

                // Map Basic Details
                loan.CustomerName = req.customerName;
                loan.Scheme = req.scheme;
                loan.SanctionDate = req.sanctionDate;
                loan.GoldBagNo = req.goldBagNo;
                loan.SbAcNo = req.sbAcNo;
                loan.Branch = req.branch;
                loan.SbName = req.sbName;
                loan.Balance = req.balance;

                // Map Identity & Config (Hidden fields / autofilled)
                loan.AadhaarNo = req.aadhaarNo;
                loan.MobileNo = req.mobileNo;
                loan.Address = req.address;
                loan.PanNo = req.panNo;
                loan.Age = req.age;
                loan.ValuerReceiptNo = req.valuerReceiptNo;
                loan.Tenure = req.tenure;
                loan.RepaymentDate = req.repaymentDate;

                // Map Sanction Details
                loan.LoanLimit = req.loanLimit;
                loan.LoanSanction = req.loanSanction;
                loan.TotalTransferVoucher = req.totalTransferVoucher;
                loan.TotalDeductionVoucher = req.totalDeduction;
                loan.TotalPayableAmount = req.totalPayable;

                // Handle Ornaments (Clear existing and rebuild based on order)
                if (loan.Id > 0) _context.GoldLoanOrnaments.RemoveRange(loan.Ornaments);
                loan.Ornaments.Clear();

                if (req.ornaments != null)
                {
                    for (int i = 0; i < req.ornaments.Count; i++)
                    {
                        var o = req.ornaments[i];
                        if (string.IsNullOrEmpty(o.particular) && (o.qty ?? 0) == 0 && (o.grossWt ?? 0) == 0) continue; // Skip empty rows
                        
                        loan.Ornaments.Add(new GoldLoanOrnament
                        {
                            RowOrder = i,
                            Particular = o.particular,
                            Qty = o.qty,
                            GrossWt = o.grossWt,
                            NetWt = o.netWt,
                            Rate = o.rate,
                            Price = o.price,
                            ValuerPrice = o.valuerPrice
                        });
                    }
                }

                // Handle Deductions 
                if (loan.Id > 0) _context.GoldLoanDeductions.RemoveRange(loan.Deductions);
                loan.Deductions.Clear();

                if (req.deductions != null)
                {
                    for (int i = 0; i < req.deductions.Count; i++)
                    {
                        var d = req.deductions[i];
                        if (string.IsNullOrEmpty(d.name) && (d.per ?? 0) == 0 && (d.charges ?? 0) == 0 && (d.deduction ?? 0) == 0) continue;
                        
                        loan.Deductions.Add(new GoldLoanDeduction
                        {
                            RowOrder = i,
                            Name = d.name,
                            Per = d.per,
                            Charges = d.charges,
                            DeductionAmount = d.deduction
                        });
                    }
                }

                // Handle Images (Since images can be large, we replace entirely or you could do delta updates if IDs are passed)
                if (loan.Id > 0) _context.GoldLoanImages.RemoveRange(loan.Images);
                loan.Images.Clear();

                if (req.goldImages != null)
                {
                    foreach (var img in req.goldImages)
                    {
                        loan.Images.Add(new GoldLoanImage { Type = "ornament", Base64Data = img });
                    }
                }
                
                if (req.goldBagImages != null)
                {
                    foreach (var img in req.goldBagImages)
                    {
                        loan.Images.Add(new GoldLoanImage { Type = "bag", Base64Data = img });
                    }
                }

                await _context.SaveChangesAsync();

                // Calculate if images exist for the response
                bool hasAnyImages = (req.goldImages != null && req.goldImages.Any()) || (req.goldBagImages != null && req.goldBagImages.Any());

                // Lookup customer photo for response
                var aadharRes = await _context.VerifiedAadhars.OrderByDescending(a => a.VerifiedAt).FirstOrDefaultAsync(a => a.AadhaarNo == loan.AadhaarNo);
                string? customerPhotoRes = aadharRes?.Photo;

                return CreatedAtAction(nameof(GetLoan), new { id = loan.Id }, FlattenLoanForFrontend(loan, hasAnyImages, customerPhotoRes));
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/GoldLoan/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLoan(int id)
        {
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userClientCode = HttpContext.Items["ClientCode"]?.ToString();

            var loan = await _context.GoldLoans.FindAsync(id);
            if (loan == null) return NotFound();

            if (userRole != "SUPER_ADMIN" && loan.ClientCode != userClientCode)
                return Unauthorized(new { message = "You do not have permission to delete this record." });

            _context.GoldLoans.Remove(loan);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private object FlattenLoanForFrontend(GoldLoan loan, bool hasImages, string? customerPhoto = null)
        {
            // Detect if the images are actually present in the 'loan' object or just known to exist
            bool imagesFetched = loan.Images != null && loan.Images.Any() && !string.IsNullOrEmpty(loan.Images.First().Base64Data);

            return new 
            {
                id = loan.Id,
                hasImages = hasImages,
                imagesFetched = imagesFetched,
                applicationNo = loan.ApplicationNo,
                clientCode = loan.ClientCode,
                
                basic = new {
                    customerName = loan.CustomerName,
                    scheme = loan.Scheme,
                    sanctionDate = loan.SanctionDate,
                    goldBagNo = loan.GoldBagNo,
                    sbAcNo = loan.SbAcNo,
                    branch = loan.Branch,
                    sbName = loan.SbName,
                    balance = loan.Balance,
                    aadhaarNo = loan.AadhaarNo,
                    mobileNo = loan.MobileNo,
                    address = loan.Address,
                    panNo = loan.PanNo,
                    age = loan.Age,
                    valuerReceiptNo = loan.ValuerReceiptNo,
                    tenure = loan.Tenure,
                    repaymentDate = loan.RepaymentDate
                },
                
                loanSummary = new {
                    loanLimit = loan.LoanLimit,
                    loanSanction = loan.LoanSanction,
                    totalTransferVoucher = loan.TotalTransferVoucher,
                    totalDeduction = loan.TotalDeductionVoucher,
                    totalPayable = loan.TotalPayableAmount
                },

                ornaments = loan.Ornaments.Select(o => new {
                    id = o.RowOrder + 1,
                    particular = o.Particular,
                    qty = o.Qty,
                    grossWt = o.GrossWt,
                    netWt = o.NetWt,
                    rate = o.Rate,
                    price = o.Price,
                    valuerPrice = o.ValuerPrice
                }).ToList(),

                deductions = loan.Deductions.Select(d => new {
                    id = d.RowOrder + 1,
                    name = d.Name,
                    per = d.Per,
                    charges = d.Charges,
                    deduction = d.DeductionAmount
                }).ToList(),

                goldImages = loan.Images.Where(i => i.Type == "ornament").Select(i => i.Base64Data).ToList(),
                goldBagImages = loan.Images.Where(i => i.Type == "bag").Select(i => i.Base64Data).ToList(),
                
                valuationDoc = loan.ValuationDoc,
                customerPhoto = customerPhoto,
                createdAt = loan.CreatedAt
            };
        }

        [HttpPost("upload-doc/{id}")]
        public async Task<IActionResult> UploadDoc(int id, [FromBody] GoldLoanDocUploadRequest request)
        {
            var loan = await _context.GoldLoans.FindAsync(id);
            if (loan == null) return NotFound();
            loan.ValuationDoc = request.Doc;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Document uploaded successfully" });
        }

        public class GoldLoanDocUploadRequest {
            public string Doc { get; set; } = string.Empty;
        }
    }

    // DTOs
    public class GoldLoanRequest
    {
        public int? id { get; set; }
        public string? applicationNo { get; set; }
        public string? clientCode { get; set; }

        // Basic
        public string? customerName { get; set; }
        public string? scheme { get; set; }
        public string? sanctionDate { get; set; }
        public string? goldBagNo { get; set; }
        public string? sbAcNo { get; set; }
        public string? branch { get; set; }
        public string? sbName { get; set; }
        public decimal? balance { get; set; }

        public string? aadhaarNo { get; set; }
        public string? mobileNo { get; set; }
        public string? address { get; set; }
        public string? panNo { get; set; }
        public int? age { get; set; }
        public string? valuerReceiptNo { get; set; }
        public int? tenure { get; set; }
        public string? repaymentDate { get; set; }

        // Loan Summary
        public decimal? loanLimit { get; set; }
        public decimal? loanSanction { get; set; }
        public decimal? totalTransferVoucher { get; set; }
        public decimal? totalDeduction { get; set; }
        public decimal? totalPayable { get; set; }

        // Lists
        public List<OrnamentDTO>? ornaments { get; set; }
        public List<DeductionDTO>? deductions { get; set; }
        public List<string>? goldImages { get; set; }
        public List<string>? goldBagImages { get; set; }
    }

    public class OrnamentDTO
    {
        public string? particular { get; set; }
        public decimal? qty { get; set; }
        public decimal? grossWt { get; set; }
        public decimal? netWt { get; set; }
        public decimal? rate { get; set; }
        public decimal? price { get; set; }
        public decimal? valuerPrice { get; set; }
    }

    public class DeductionDTO
    {
        public string? name { get; set; }
        public decimal? per { get; set; }
        public decimal? charges { get; set; }
        public decimal? deduction { get; set; }
    }
}
