using Microsoft.EntityFrameworkCore;
using TushGptBackend.Models.RocketPay;
using TushGptBackend.Models.HomeLoan;
using TushGptBackend.Models;

namespace TushGptBackend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) 
        {
            Database.SetCommandTimeout(300);
        }

        public DbSet<Models.User> Users { get; set; }
        public DbSet<Models.Report> Reports { get; set; }
        public DbSet<Models.VerifiedAadhar> VerifiedAadhars { get; set; }
        public DbSet<Models.VerifiedPan> VerifiedPans { get; set; }
        public DbSet<Models.VerifiedUdyam> VerifiedUdyams { get; set; }
        public DbSet<Models.VerifiedGst> VerifiedGsts { get; set; }
        public DbSet<Models.VerifiedPassport> VerifiedPassports { get; set; }
        public DbSet<Models.VerifiedVoter> VerifiedVoters { get; set; }
        public DbSet<Models.CibilReport> CibilReports { get; set; }
        public DbSet<Models.CibilAlertConfig> CibilAlertConfigs { get; set; }
        public DbSet<Models.OtpVerification> OtpVerifications { get; set; }
        public DbSet<Models.MembershipApplication> MembershipApplications { get; set; }

        // Enterprise: Multi-Tenant & Credit
        public DbSet<Models.Client> Clients { get; set; }
        public DbSet<Models.CreditWallet> CreditWallets { get; set; }
        public DbSet<Models.CreditTransaction> CreditTransactions { get; set; }
        public DbSet<Models.ServiceRate> ServiceRates { get; set; }
        public DbSet<Models.AuditLog> AuditLogs { get; set; }

        // Enterprise: RBAC
        public DbSet<Models.Role> Roles { get; set; }
        public DbSet<Models.Permission> Permissions { get; set; }
        public DbSet<Models.UserRole> UserRoles { get; set; }
        public DbSet<Models.RolePermission> RolePermissions { get; set; }

        // RocketPay Mandate V4
        public DbSet<RocketPayMandate> RocketPayMandates { get; set; }
        public DbSet<MandatePayer> MandatePayers { get; set; }
        public DbSet<MandatePayee> MandatePayees { get; set; }
        public DbSet<MandateTransaction> MandateTransactions { get; set; }
        public DbSet<RocketPayInstallment> RocketPayInstallments { get; set; }
        public DbSet<InstallmentPayer> InstallmentPayers { get; set; }
        public DbSet<InstallmentPayee> InstallmentPayees { get; set; }
        public DbSet<InstallmentTransaction> InstallmentTransactions { get; set; }

        // Home Loan Module (Legacy — multi-table)
        public DbSet<HomeLoanRequest> HomeLoanRequests { get; set; }
        public DbSet<HomeLoanBorrower> HomeLoanBorrowers { get; set; }
        public DbSet<HomeLoanGuarantor> HomeLoanGuarantors { get; set; }
        public DbSet<HomeLoanProperty> HomeLoanProperties { get; set; }
        public DbSet<HomeLoanBusiness> HomeLoanBusinesses { get; set; }
        public DbSet<HomeLoanInsurance> HomeLoanInsurances { get; set; }

        // Home Loan Module (New — single-table with raw_json)
        public DbSet<HomeLoanApplication> HomeLoanApplications { get; set; }
        public DbSet<DocumentMaster> DocumentMasters { get; set; }
        public DbSet<LoanDocument> LoanDocuments { get; set; }

        public DbSet<PersonalLoan> PersonalLoans { get; set; }
        public DbSet<BorrowerInfo> Borrowers { get; set; }
        public DbSet<Guarantor1Info> Guarantor1s { get; set; }
        public DbSet<Guarantor2Info> Guarantor2s { get; set; }
        public DbSet<OfficeInfo> Offices { get; set; }


        public DbSet<BusinessLoanApplication> BusinessLoanApplications { get; set; }
    public DbSet<BusinessLoanBorrower> BusinessLoanBorrowers { get; set; }
    public DbSet<BusinessLoanGuarantor> BusinessLoanGuarantors { get; set; }
    public DbSet<BusinessLoanExtraGuarantor> BusinessLoanExtraGuarantors { get; set; }
    public DbSet<BusinessLoanBusinessInfo> BusinessLoanBusinessInfos { get; set; }
    public DbSet<BusinessLoanInsuranceTaxInfo> BusinessLoanInsuranceTaxInfos { get; set; }
    public DbSet<BusinessLoanCollateral> BusinessLoanCollaterals { get; set; }


    public DbSet<VehicleLoanApplication> VehicleLoanApplications { get; set; }
        public DbSet<VehicleLoanBorrower> VehicleLoanBorrowers { get; set; }
        public DbSet<VehicleLoanGuarantor> VehicleLoanGuarantors { get; set; }
        public DbSet<VehicleLoanExtraGuarantor> VehicleLoanExtraGuarantors { get; set; }
        public DbSet<VehicleLoanNewVehicle> VehicleLoanNewVehicles { get; set; }
        public DbSet<VehicleLoanOldVehicle> VehicleLoanOldVehicles { get; set; }
        public DbSet<VehicleLoanInsurance> VehicleLoanInsurances { get; set; }
        public DbSet<VehicleLoanTaxDetail> VehicleLoanTaxDetails { get; set; }
        public DbSet<VehicleLoanBusinessInfo> VehicleLoanBusinessInfos { get; set; }

        // Gold Loan Module
        public DbSet<GoldLoan> GoldLoans { get; set; }
        public DbSet<GoldLoanOrnament> GoldLoanOrnaments { get; set; }
        public DbSet<GoldLoanDeduction> GoldLoanDeductions { get; set; }
        public DbSet<GoldLoanImage> GoldLoanImages { get; set; }
        public DbSet<GoldDedMaster> GoldDedMasters { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Global DateTime UTC Converter
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                foreach (var property in entityType.GetProperties())
                {
                    if (property.ClrType == typeof(DateTime))
                    {
                        property.SetValueConverter(new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<DateTime, DateTime>(
                            v => v.Kind == DateTimeKind.Utc ? v : v.ToUniversalTime(),
                            v => DateTime.SpecifyKind(v, DateTimeKind.Utc)
                        ));
                    }
                    else if (property.ClrType == typeof(DateTime?))
                    {
                        property.SetValueConverter(new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<DateTime?, DateTime?>(
                            v => v.HasValue ? (v.Value.Kind == DateTimeKind.Utc ? v : v.Value.ToUniversalTime()) : v,
                            v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v
                        ));
                    }
                }
            }

            modelBuilder.Entity<Models.User>().ToTable("users");

            modelBuilder.Entity<Models.Report>(entity => {
                entity.ToTable("reports");
                entity.HasIndex(e => new { e.AppId, e.ClientCode }).IsUnique();
            });

            modelBuilder.Entity<Models.VerifiedAadhar>(entity => {
                entity.ToTable("verified_aadhars");
                entity.HasIndex(e => e.VerifiedAt);
            });

            modelBuilder.Entity<Models.VerifiedPan>(entity => {
                entity.ToTable("verified_pans");
                entity.HasIndex(e => e.VerifiedAt);
                entity.HasIndex(e => e.PanNo);
            });

            modelBuilder.Entity<Models.VerifiedUdyam>(entity => {
                entity.ToTable("verified_udyams");
                entity.HasIndex(e => e.VerifiedAt);
                entity.HasIndex(e => e.UdyamNo);
            });

            modelBuilder.Entity<Models.VerifiedGst>(entity => {
                entity.ToTable("verified_gsts");
                entity.HasIndex(e => e.VerifiedAt);
                entity.HasIndex(e => e.Gstin);
            });

            modelBuilder.Entity<Models.VerifiedPassport>(entity => {
                entity.ToTable("verified_passports");
                entity.HasIndex(e => e.VerifiedAt);
                entity.HasIndex(e => e.PassportNo);
            });

            modelBuilder.Entity<Models.VerifiedVoter>(entity => {
                entity.ToTable("verified_voters");
                entity.HasIndex(e => e.VerifiedAt);
                entity.HasIndex(e => e.VoterId);
            });

            modelBuilder.Entity<Models.CibilReport>(entity => {
                entity.ToTable("cibil_reports");
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.ClientCode);
            });
            modelBuilder.Entity<Models.CibilAlertConfig>(entity => {
                entity.ToTable("cibil_alert_configs");
                entity.HasIndex(e => e.ClientCode);
            });

            modelBuilder.Entity<Models.OtpVerification>(entity => {
                entity.ToTable("otp_verifications");
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.IsVerified);
            });

            modelBuilder.Entity<Models.MembershipApplication>().ToTable("membership_applications");

            // Enterprise tables
            modelBuilder.Entity<Models.Client>(entity => {
                entity.ToTable("clients");
                entity.HasIndex(e => e.ClientCode).IsUnique();
            });

            modelBuilder.Entity<Models.CreditWallet>(entity => {
                entity.ToTable("credit_wallet");
                entity.HasIndex(e => e.ClientCode).IsUnique();
            });

            modelBuilder.Entity<Models.CreditTransaction>(entity => {
                entity.ToTable("credit_transactions");
                entity.HasIndex(e => e.ClientCode);
            });

            modelBuilder.Entity<Models.ServiceRate>(entity => {
                entity.ToTable("service_rates");
                entity.HasIndex(e => new { e.ClientCode, e.Category, e.EffectiveFrom });
            });

            modelBuilder.Entity<Models.AuditLog>(entity => {
                entity.ToTable("audit_logs");
                entity.HasIndex(e => e.ClientCode);
            });

            modelBuilder.Entity<Models.Role>(entity => {
                entity.ToTable("roles");
                entity.HasIndex(e => e.RoleName).IsUnique();
            });

            modelBuilder.Entity<Models.Permission>(entity => {
                entity.ToTable("permissions");
                entity.HasIndex(e => e.PermissionName).IsUnique();
            });

            modelBuilder.Entity<Models.UserRole>().ToTable("user_roles");
            modelBuilder.Entity<Models.RolePermission>().ToTable("role_permissions");

            // RocketPay V4 relationships
            modelBuilder.Entity<RocketPayMandate>()
                .HasOne(m => m.Payer)
                .WithOne(p => p.Mandate)
                .HasForeignKey<MandatePayer>(p => p.MandateId);

            modelBuilder.Entity<RocketPayMandate>()
                .HasMany(m => m.Payees)
                .WithOne(p => p.Mandate)
                .HasForeignKey(p => p.MandateId);

            modelBuilder.Entity<RocketPayMandate>()
                .HasMany(m => m.Transactions)
                .WithOne(t => t.Mandate)
                .HasForeignKey(t => t.MandateId);

            modelBuilder.Entity<RocketPayInstallment>()
                .HasOne(i => i.Payer)
                .WithOne(p => p.Installment)
                .HasForeignKey<InstallmentPayer>(p => p.InstallmentId);

            modelBuilder.Entity<RocketPayInstallment>()
                .HasMany(i => i.Payees)
                .WithOne(p => p.Installment)
                .HasForeignKey(p => p.InstallmentId);

            modelBuilder.Entity<RocketPayInstallment>()
                .HasMany(i => i.Transactions)
                .WithOne(t => t.Installment)
                .HasForeignKey(t => t.InstallmentId);

            // Home Loan Relationships
            modelBuilder.Entity<HomeLoanRequest>(entity => {
                entity.ToTable("home_loan_requests");
                entity.HasIndex(e => e.ClientCode);
            });

            modelBuilder.Entity<HomeLoanBorrower>(entity => {
                entity.ToTable("home_loan_borrowers");
                entity.HasOne(b => b.Request)
                    .WithOne(r => r.Borrower)
                    .HasForeignKey<HomeLoanBorrower>(b => b.HomeLoanRequestId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<HomeLoanGuarantor>(entity => {
                entity.ToTable("home_loan_guarantors");
                entity.HasOne(g => g.Request)
                    .WithMany(r => r.Guarantors)
                    .HasForeignKey(g => g.HomeLoanRequestId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<HomeLoanProperty>(entity => {
                entity.ToTable("home_loan_properties");
                entity.HasOne(p => p.Request)
                    .WithOne(r => r.Property)
                    .HasForeignKey<HomeLoanProperty>(p => p.HomeLoanRequestId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<HomeLoanBusiness>(entity => {
                entity.ToTable("home_loan_businesses");
                entity.HasOne(b => b.Request)
                    .WithOne(r => r.Business)
                    .HasForeignKey<HomeLoanBusiness>(b => b.HomeLoanRequestId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<HomeLoanInsurance>(entity => {
                entity.ToTable("home_loan_insurances");
                entity.HasOne(i => i.Request)
                    .WithOne(r => r.Insurance)
                    .HasForeignKey<HomeLoanInsurance>(i => i.HomeLoanRequestId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // New single-table Home Loan
            modelBuilder.Entity<HomeLoanApplication>(entity => {
                entity.ToTable("home_loan_applications");
                entity.HasIndex(e => e.ClientCode);
                entity.HasIndex(e => e.ApplicantName);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.ApplicationNo);
            });

            modelBuilder.Entity<DocumentMaster>(entity => {
                entity.ToTable("document_master");
                entity.HasIndex(e => e.Category);
            });

            modelBuilder.Entity<LoanDocument>(entity => {
                entity.ToTable("loan_application_documents");
                entity.HasIndex(e => e.ApplicationId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => new { e.ApplicationId, e.LoanType });
            });

            modelBuilder.Entity<PersonalLoan>(entity => {
                entity.ToTable("personal_loan_applications");
                entity.HasAnnotation("MySql:RowFormat", "Dynamic");
                entity.HasIndex(e => e.ClientCode);
                entity.HasIndex(e => e.ApplicationNo);
                entity.HasIndex(e => e.DocumentStatus);
                entity.HasIndex(e => e.CreatedAt);
            });

            modelBuilder.Entity<BorrowerInfo>(entity => {
                entity.ToTable("personal_loan_borrower_info");
                entity.HasAnnotation("MySql:RowFormat", "Dynamic");
            });

            modelBuilder.Entity<Guarantor1Info>(entity => {
                entity.ToTable("personal_loan_guarantor1_info");
                entity.HasAnnotation("MySql:RowFormat", "Dynamic");
            });

            modelBuilder.Entity<Guarantor2Info>(entity => {
                entity.ToTable("personal_loan_guarantor2_info");
                entity.HasAnnotation("MySql:RowFormat", "Dynamic");
            });

            modelBuilder.Entity<OfficeInfo>(entity => {
                entity.ToTable("personal_loan_office_info");
                entity.HasAnnotation("MySql:RowFormat", "Dynamic");
            });




            modelBuilder.Entity<BusinessLoanApplication>(entity => {
        entity.ToTable("business_loan_applications");
        entity.HasIndex(e => e.ClientCode);
        entity.HasIndex(e => e.Status);
        entity.HasIndex(e => e.CreatedAt);
    });
 
    modelBuilder.Entity<BusinessLoanBorrower>(entity => {
        entity.ToTable("business_loan_borrowers");
        entity.HasOne(b => b.Application)
              .WithOne(a => a.Borrower)
              .HasForeignKey<BusinessLoanBorrower>(b => b.ApplicationId);
    });
 
    // modelBuilder.Entity<BusinessLoanGuarantor>(entity => {
    //     entity.ToTable("business_loan_guarantors");
    //     entity.HasIndex(e => new { e.ApplicationId, e.GuarantorNumber });
    //     // g1 and g2 are stored here with GuarantorNumber 1 and 2
    //     // Application.Guarantor1 and Guarantor2 are NOT navigation properties
    //     // (they are convenience lookups), so we configure the collection relationship:
    // });
    modelBuilder.Entity<BusinessLoanGuarantor>(entity => {
    entity.ToTable("business_loan_guarantors");

    entity.HasIndex(e => new { e.ApplicationId, e.GuarantorNumber });

    entity.HasOne(g => g.Application)
          .WithMany(a => a.Guarantors)
          .HasForeignKey(g => g.ApplicationId)
          .OnDelete(DeleteBehavior.Cascade);
});
 
    modelBuilder.Entity<BusinessLoanExtraGuarantor>(entity => {
        entity.ToTable("business_loan_extra_guarantors");
        entity.HasOne(e => e.Application)
              .WithMany(a => a.ExtraGuarantors)
              .HasForeignKey(e => e.ApplicationId);
    });
 
    modelBuilder.Entity<BusinessLoanBusinessInfo>(entity => {
        entity.ToTable("business_loan_business_info");
        entity.HasOne(b => b.Application)
              .WithOne(a => a.BusinessInfo)
              .HasForeignKey<BusinessLoanBusinessInfo>(b => b.ApplicationId);
    });
 
    modelBuilder.Entity<BusinessLoanInsuranceTaxInfo>(entity => {
        entity.ToTable("business_loan_insurance_tax");
        entity.HasOne(i => i.Application)
              .WithOne(a => a.InsuranceTaxInfo)
              .HasForeignKey<BusinessLoanInsuranceTaxInfo>(i => i.ApplicationId);
    });
 
    modelBuilder.Entity<BusinessLoanCollateral>(entity => {
        entity.ToTable("business_loan_collateral");
        entity.HasOne(c => c.Application)
              .WithOne(a => a.Collateral)
              .HasForeignKey<BusinessLoanCollateral>(c => c.ApplicationId);
    });

    // ── Vehicle Loan Relationships ────────────────────────────────────
            modelBuilder.Entity<VehicleLoanApplication>(entity =>
            {
                entity.ToTable("vehicle_loan_applications");
                entity.HasIndex(e => e.ClientCode);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.ArjdarNaav);
            });

            modelBuilder.Entity<VehicleLoanBorrower>(entity =>
            {
                entity.ToTable("vehicle_loan_borrowers");
                entity.HasOne(b => b.Application)
                      .WithOne(a => a.Borrower)
                      .HasForeignKey<VehicleLoanBorrower>(b => b.ApplicationId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // FIX: Use WithMany + collection (Guarantors) instead of two HasOne/WithOne.
            // Guarantor1 and Guarantor2 are distinguished by GuarantorNumber column (1 or 2).
            // The [NotMapped] helpers on VehicleLoanApplication expose them as Guarantor1/Guarantor2.
            modelBuilder.Entity<VehicleLoanGuarantor>(entity =>
            {
                entity.ToTable("vehicle_loan_guarantors");
                entity.HasIndex(e => new { e.ApplicationId, e.GuarantorNumber });
                entity.HasOne(g => g.Application)
                      .WithMany(a => a.Guarantors)
                      .HasForeignKey(g => g.ApplicationId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<VehicleLoanExtraGuarantor>(entity =>
            {
                entity.ToTable("vehicle_loan_extra_guarantors");
                entity.HasIndex(e => new { e.ApplicationId, e.GuarantorNumber });
                entity.HasOne(e => e.Application)
                      .WithMany(a => a.ExtraGuarantors)
                      .HasForeignKey(e => e.ApplicationId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<VehicleLoanNewVehicle>(entity =>
            {
                entity.ToTable("vehicle_loan_new_vehicles");
                entity.HasOne(v => v.Application)
                      .WithOne(a => a.NewVehicle)
                      .HasForeignKey<VehicleLoanNewVehicle>(v => v.ApplicationId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<VehicleLoanOldVehicle>(entity =>
            {
                entity.ToTable("vehicle_loan_old_vehicles");
                entity.HasOne(v => v.Application)
                      .WithOne(a => a.OldVehicle)
                      .HasForeignKey<VehicleLoanOldVehicle>(v => v.ApplicationId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<VehicleLoanInsurance>(entity =>
            {
                entity.ToTable("vehicle_loan_insurance");
                entity.HasOne(i => i.Application)
                      .WithOne(a => a.Insurance)
                      .HasForeignKey<VehicleLoanInsurance>(i => i.ApplicationId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<VehicleLoanTaxDetail>(entity =>
            {
                entity.ToTable("vehicle_loan_tax_details");
                entity.HasOne(t => t.Application)
                      .WithMany(a => a.TaxDetails)
                      .HasForeignKey(t => t.ApplicationId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<VehicleLoanBusinessInfo>(entity =>
            {
                entity.ToTable("vehicle_loan_business_info");
                entity.HasOne(b => b.Application)
                      .WithOne(a => a.BusinessInfo)
                      .HasForeignKey<VehicleLoanBusinessInfo>(b => b.ApplicationId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // 1:1 Relationship for Borrower
            modelBuilder.Entity<PersonalLoan>()
                .HasOne(p => p.Borrower)
                .WithOne()
                .HasForeignKey<BorrowerInfo>(b => b.PersonalLoanId);

            // 1:1 Relationship for Guarantor 1
            modelBuilder.Entity<PersonalLoan>()
                .HasOne(p => p.Guarantor1)
                .WithOne()
                .HasForeignKey<Guarantor1Info>(g => g.PersonalLoanId);

            // 1:1 Relationship for Guarantor 2
            modelBuilder.Entity<PersonalLoan>()
                .HasOne(p => p.Guarantor2)
                .WithOne()
                .HasForeignKey<Guarantor2Info>(g => g.PersonalLoanId);

            // 1:1 Relationship for Office
            modelBuilder.Entity<PersonalLoan>()
                .HasOne(p => p.Office)
                .WithOne()
                .HasForeignKey<OfficeInfo>(o => o.PersonalLoanId);

            // ── Gold Loan Relationships ───────────────────────────────────────
            modelBuilder.Entity<GoldLoan>(entity =>
            {
                entity.ToTable("gold_loan_applications");
                entity.HasIndex(e => e.ClientCode);
                entity.HasIndex(e => e.ApplicationNo);
                entity.HasIndex(e => e.CreatedAt);
            });

            modelBuilder.Entity<GoldLoanOrnament>(entity =>
            {
                entity.ToTable("gold_loan_ornaments");
                entity.HasOne(o => o.GoldLoan)
                      .WithMany(g => g.Ornaments)
                      .HasForeignKey(o => o.GoldLoanId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<GoldLoanDeduction>(entity =>
            {
                entity.ToTable("gold_loan_deductions");
                entity.HasOne(d => d.GoldLoan)
                      .WithMany(g => g.Deductions)
                      .HasForeignKey(d => d.GoldLoanId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<GoldLoanImage>(entity =>
            {
                entity.ToTable("gold_loan_images");
                entity.HasOne(i => i.GoldLoan)
                      .WithMany(g => g.Images)
                      .HasForeignKey(i => i.GoldLoanId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<GoldDedMaster>(entity =>
            {
                entity.HasKey(e => new { e.BRCD, e.SRNO, e.SUBGLCODE, e.DEDTYPE });
            });
                
        }
    }
}
