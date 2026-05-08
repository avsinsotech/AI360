using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TushGptBackend.Data;
using BCrypt.Net;
using MySqlConnector;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(opt => {
        opt.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        opt.JsonSerializerOptions.NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.AllowReadingFromString;
        opt.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        opt.JsonSerializerOptions.Converters.Add(new TushGptBackend.Utils.FlexibleStringConverter());
    });
builder.Services.AddHttpClient();

// RocketPay V4 Services
builder.Services.AddHttpClient<TushGptBackend.Services.RocketPayApiService>();
builder.Services.AddScoped<TushGptBackend.Services.MandateRepository>();
builder.Services.AddScoped<TushGptBackend.Services.InstallmentRepository>();

// Enterprise Services
builder.Services.AddScoped<TushGptBackend.Services.AuditService>();
builder.Services.AddScoped<TushGptBackend.Services.CreditService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "TushGPT Backend API", Version = "v1" });
    
    // Add JWT Authentication to Swagger
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. \r\n\r\n Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: \"Bearer 12345abcdef\"",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] { }
        }
    });
});

// DB Context Setup
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// JWT Authentication Setup
var keyStr = builder.Configuration["JwtSettings:Secret"] ?? "SuperSecretKeyWhichIsAtLeast32BytesLong#123!";
var key = Encoding.ASCII.GetBytes(keyStr);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = false, // Setup for simple local dev
            ValidateAudience = false
        };
    });

// CORS Setup
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "TushGPT Backend API V1");
    c.RoutePrefix = "swagger"; 
});

app.UseRouting();
app.UseCors("AllowReactApp");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

// Multi-tenant middleware
app.UseMiddleware<TushGptBackend.Middleware.TenantMiddleware>();
app.MapControllers();

// Startup Migrations
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var conn = db.Database.GetDbConnection();
    await conn.OpenAsync();

    // ── 1. SCHEMA SANITIZATION ────────────────────────────────────────────────
    using (var sanitCmd = conn.CreateCommand())
    {
        sanitCmd.CommandText = @"
            -- Make legacy snake_case columns nullable if they exist (document_master)
            SET @q1 = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'document_master' AND COLUMN_NAME = 'category') > 0, 'ALTER TABLE document_master MODIFY COLUMN category VARCHAR(100) NULL', 'SELECT 1'); PREPARE stmt1 FROM @q1; EXECUTE stmt1; DEALLOCATE PREPARE stmt1;
            SET @q2 = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'document_master' AND COLUMN_NAME = 'document_name') > 0, 'ALTER TABLE document_master MODIFY COLUMN document_name VARCHAR(255) NULL', 'SELECT 1'); PREPARE stmt2 FROM @q2; EXECUTE stmt2; DEALLOCATE PREPARE stmt2;
            SET @q3 = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'document_master' AND COLUMN_NAME = 'loan_type') > 0, 'ALTER TABLE document_master MODIFY COLUMN loan_type VARCHAR(50) NULL', 'SELECT 1'); PREPARE stmt3 FROM @q3; EXECUTE stmt3; DEALLOCATE PREPARE stmt3;

            -- Make legacy snake_case columns nullable (loan_application_documents)
            SET @q4 = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'loan_application_documents' AND COLUMN_NAME = 'application_id') > 0, 'ALTER TABLE loan_application_documents MODIFY COLUMN application_id INT NULL', 'SELECT 1'); PREPARE stmt4 FROM @q4; EXECUTE stmt4; DEALLOCATE PREPARE stmt4;
            SET @q5 = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'loan_application_documents' AND COLUMN_NAME = 'document_master_id') > 0, 'ALTER TABLE loan_application_documents MODIFY COLUMN document_master_id INT NULL', 'SELECT 1'); PREPARE stmt5 FROM @q5; EXECUTE stmt5; DEALLOCATE PREPARE stmt5;
            SET @q6 = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'loan_application_documents' AND COLUMN_NAME = 'file_name') > 0, 'ALTER TABLE loan_application_documents MODIFY COLUMN file_name VARCHAR(255) NULL', 'SELECT 1'); PREPARE stmt6 FROM @q6; EXECUTE stmt6; DEALLOCATE PREPARE stmt6;
            SET @q7 = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'loan_application_documents' AND COLUMN_NAME = 'file_type') > 0, 'ALTER TABLE loan_application_documents MODIFY COLUMN file_type VARCHAR(100) NULL', 'SELECT 1'); PREPARE stmt7 FROM @q7; EXECUTE stmt7; DEALLOCATE PREPARE stmt7;
            SET @q8 = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'loan_application_documents' AND COLUMN_NAME = 'file_content') > 0, 'ALTER TABLE loan_application_documents MODIFY COLUMN file_content LONGBLOB NULL', 'SELECT 1'); PREPARE stmt8 FROM @q8; EXECUTE stmt8; DEALLOCATE PREPARE stmt8;
        ";
        try { await sanitCmd.ExecuteNonQueryAsync(); } catch { /* Ignore */ }
    }

    using (var cmd = conn.CreateCommand())
    {
        cmd.CommandText = @"
            CREATE TABLE IF NOT EXISTS `document_master` (
                `Id` INT AUTO_INCREMENT PRIMARY KEY,
                `Category` VARCHAR(100) NOT NULL,
                `DocumentName` VARCHAR(255) NOT NULL,
                `IsMandatory` TINYINT(1) DEFAULT 0,
                `LoanType` VARCHAR(50) DEFAULT 'HomeLoan',
                INDEX `idx_doc_cat` (`Category`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

            CREATE TABLE IF NOT EXISTS `loan_application_documents` (
                `Id` INT AUTO_INCREMENT PRIMARY KEY,
                `ApplicationId` INT NOT NULL,
                `DocumentMasterId` INT NOT NULL,
                `FileName` VARCHAR(255) NOT NULL,
                `FileType` VARCHAR(100) NOT NULL,
                `FileContent` LONGBLOB NOT NULL,
                `Status` VARCHAR(50) DEFAULT 'Uploaded',
                `Remarks` VARCHAR(500) NULL,
                `UploadedBy` VARCHAR(100) NULL,
                `VerifiedBy` VARCHAR(100) NULL,
                `UploadedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
                `VerifiedAt` DATETIME NULL,
                INDEX `idx_lad_app` (`ApplicationId`),
                INDEX `idx_lad_status` (`Status`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ";
        await cmd.ExecuteNonQueryAsync();
    }

    // RBAC & Document Seeding
    using (var seedCmd = conn.CreateCommand())
    {
        seedCmd.CommandText = @"
            -- Roles
            INSERT IGNORE INTO `roles` (`role_name`, `description`) VALUES 
                ('SUPER_ADMIN', 'System owner — full access'),
                ('ADMIN', 'Legacy admin role'),
                ('CLIENT', 'Bank/Society user — view-only access'),
                ('BANK_ADMIN', 'Admin (Bank Manager)'),
                ('OPERATOR', 'Operator (Data Entry)'),
                ('AUDITOR', 'Auditor'),
                ('VIEWER', 'Viewer');
        ";
        await seedCmd.ExecuteNonQueryAsync();
    }

    // Seed HomeLoan docs if missing
    using (var checkCmd = conn.CreateCommand()) { checkCmd.CommandText = "SELECT COUNT(*) FROM document_master WHERE LoanType = 'HomeLoan';"; 
        if (Convert.ToInt32(await checkCmd.ExecuteScalarAsync()) == 0) {
            using var inst = conn.CreateCommand();
            inst.CommandText = @"INSERT INTO `document_master` (`Category`, `DocumentName`, `IsMandatory`, `LoanType`) VALUES 
                ('KYC', 'Aadhaar Card', 1, 'HomeLoan'),
                ('KYC', 'PAN Card', 1, 'HomeLoan'),
                ('KYC', 'Passport / Driving License / Voter ID', 0, 'HomeLoan'),
                ('KYC', 'Passport Size Photographs', 0, 'HomeLoan'),
                ('Income (Salaried)', 'Salary Slips (3–6 months)', 1, 'HomeLoan'),
                ('Income (Salaried)', 'Bank Statement (Salary Account - 6 months)', 1, 'HomeLoan'),
                ('Income (Salaried)', 'Form 16 (2 years)', 1, 'HomeLoan'),
                ('Income (Salaried)', 'Employment ID / Offer Letter', 0, 'HomeLoan'),
                ('Income (Self-Employed)', 'ITR (2–3 years)', 1, 'HomeLoan'),
                ('Income (Self-Employed)', 'Balance Sheet & Profit and Loss', 1, 'HomeLoan'),
                ('Income (Self-Employed)', 'GST Registration', 0, 'HomeLoan'),
                ('Income (Self-Employed)', 'Business Proof (Shop Act / Registration)', 1, 'HomeLoan'),
                ('Banking', 'Bank Statement (6–12 months)', 1, 'HomeLoan'),
                ('Banking', 'Existing Loan Details', 0, 'HomeLoan'),
                ('Banking', 'Credit Card Statements', 0, 'HomeLoan'),
                ('Property', 'Agreement to Sale / Sale Deed', 1, 'HomeLoan'),
                ('Property', 'Title Deed (Ownership Proof)', 1, 'HomeLoan'),
                ('Property', '7/12 Extract / Property Card', 1, 'HomeLoan'),
                ('Property', 'Approved Building Plan', 1, 'HomeLoan'),
                ('Property', 'NA Order', 0, 'HomeLoan'),
                ('Property', 'Occupancy / Completion Certificate', 1, 'HomeLoan'),
                ('Property', 'Property Tax Receipts', 1, 'HomeLoan'),
                ('Builder', 'Builder-Buyer Agreement', 1, 'HomeLoan'),
                ('Builder', 'RERA Registration Details', 1, 'HomeLoan'),
                ('Builder', 'Project Approval Documents', 1, 'HomeLoan'),
                ('Builder', 'Payment Schedule', 1, 'HomeLoan'),
                ('Other', 'Processing Fee Cheque', 0, 'HomeLoan'),
                ('Other', 'Loan Application Form', 1, 'HomeLoan'),
                ('Other', 'Signature Verification', 1, 'HomeLoan'),
                ('Other', 'Guarantor Documents', 0, 'HomeLoan');";
            await inst.ExecuteNonQueryAsync();
        }
    }

    // Seed PersonalLoan docs if missing
    using (var checkCmd = conn.CreateCommand()) { checkCmd.CommandText = "SELECT COUNT(*) FROM document_master WHERE LoanType = 'PersonalLoan';"; 
        if (Convert.ToInt32(await checkCmd.ExecuteScalarAsync()) == 0) {
            using var inst = conn.CreateCommand();
            inst.CommandText = @"INSERT INTO `document_master` (`Category`, `DocumentName`, `IsMandatory`, `LoanType`) VALUES 
                ('KYC', 'Aadhaar Card', 1, 'PersonalLoan'),
                ('KYC', 'PAN Card', 1, 'PersonalLoan'),
                ('KYC', 'Passport / Driving License / Voter ID', 0, 'PersonalLoan'),
                ('KYC', 'Passport Size Photographs', 0, 'PersonalLoan'),
                ('Income (Salaried)', 'Last 3 Months Salary Slips', 1, 'PersonalLoan'),
                ('Income (Salaried)', 'Last 6 Months Bank Statement', 1, 'PersonalLoan'),
                ('Income (Salaried)', 'Form 16', 1, 'PersonalLoan'),
                ('Income (Salaried)', 'Employment ID / Offer Letter', 0, 'PersonalLoan'),
                ('Income (Self-Employed)', 'ITR (Last 2-3 Years)', 1, 'PersonalLoan'),
                ('Income (Self-Employed)', 'Balance Sheet & Profit and Loss', 1, 'PersonalLoan'),
                ('Income (Self-Employed)', 'GST Registration (if applicable)', 0, 'PersonalLoan'),
                ('Income (Self-Employed)', 'Business Proof (Shop Act / Registration)', 1, 'PersonalLoan'),
                ('Banking', 'Last 6-12 Months Bank Statement', 1, 'PersonalLoan'),
                ('Banking', 'Existing Loan Details', 0, 'PersonalLoan'),
                ('Banking', 'Credit Card Statements (if required)', 0, 'PersonalLoan'),
                ('Other', 'Loan Application Form', 1, 'PersonalLoan'),
                ('Other', 'Processing Fee Cheque', 0, 'PersonalLoan'),
                ('Other', 'Signature Verification', 1, 'PersonalLoan'),
                ('Other', 'Guarantor Documents (if required)', 0, 'PersonalLoan');";
            await inst.ExecuteNonQueryAsync();
        }
    }

    // Seed VehicleLoan docs if missing
    using (var checkCmd = conn.CreateCommand()) { checkCmd.CommandText = "SELECT COUNT(*) FROM document_master WHERE LoanType = 'VehicleLoan';"; 
        if (Convert.ToInt32(await checkCmd.ExecuteScalarAsync()) == 0) {
            using var inst = conn.CreateCommand();
            inst.CommandText = @"INSERT INTO `document_master` (`Category`, `DocumentName`, `IsMandatory`, `LoanType`) VALUES 
                ('KYC', 'Aadhaar Card', 1, 'VehicleLoan'),
                ('KYC', 'PAN Card', 1, 'VehicleLoan'),
                ('KYC', 'Driving License', 0, 'VehicleLoan'),
                ('KYC', 'Passport / Voter ID', 0, 'VehicleLoan'),
                ('KYC', 'Passport Size Photographs', 0, 'VehicleLoan'),
                ('Income (Salaried)', 'Last 3 Months Salary Slips', 1, 'VehicleLoan'),
                ('Income (Salaried)', 'Last 6 Months Bank Statement', 1, 'VehicleLoan'),
                ('Income (Salaried)', 'Form 16 / ITR', 1, 'VehicleLoan'),
                ('Income (Salaried)', 'Employment ID / Offer Letter', 0, 'VehicleLoan'),
                ('Income (Self-Employed)', 'ITR (Last 2-3 Years)', 1, 'VehicleLoan'),
                ('Income (Self-Employed)', 'Balance Sheet & Profit and Loss', 1, 'VehicleLoan'),
                ('Income (Self-Employed)', 'GST Registration', 0, 'VehicleLoan'),
                ('Income (Self-Employed)', 'Business Proof (Shop Act / Registration)', 1, 'VehicleLoan'),
                ('Banking', 'Last 6 Months Bank Statement', 1, 'VehicleLoan'),
                ('Banking', 'Existing Loan Details', 0, 'VehicleLoan'),
                ('Banking', 'Credit Card Statement (if required)', 0, 'VehicleLoan'),
                ('Vehicle', 'Vehicle Quotation / Proforma Invoice', 1, 'VehicleLoan'),
                ('Vehicle', 'RC Copy (for used vehicle)', 0, 'VehicleLoan'),
                ('Vehicle', 'Insurance Copy', 1, 'VehicleLoan'),
                ('Vehicle', 'Invoice Copy (post disbursement)', 0, 'VehicleLoan'),
                ('Other', 'Loan Application Form', 1, 'VehicleLoan'),
                ('Other', 'Processing Fee Cheque', 0, 'VehicleLoan'),
                ('Other', 'Guarantor Documents (if required)', 0, 'VehicleLoan'),
                ('Other', 'ECS / NACH Mandate', 1, 'VehicleLoan');";
            await inst.ExecuteNonQueryAsync();
        }
    }
    
    // Update legacy columns just in case
    using (var legacyCmd = conn.CreateCommand()) { legacyCmd.CommandText = "UPDATE document_master SET category = Category, document_name = DocumentName, loan_type = LoanType, is_mandatory = IsMandatory;"; await legacyCmd.ExecuteNonQueryAsync(); }

    // ── FIX ORPHANED DOCUMENT REFERENCES ────────────────────────────────────
    // If document_master IDs were reassigned (due to DELETE+INSERT on past restarts),
    // uploaded documents may reference stale master IDs. Remap by positional offset.
    try
    {
        foreach (var lt in new[] { "HomeLoan", "PersonalLoan", "VehicleLoan", "BusinessLoan" })
        {
            // Get the current minimum master ID for this loan type
            using var minCmd = conn.CreateCommand();
            minCmd.CommandText = $"SELECT MIN(Id) FROM document_master WHERE LoanType = '{lt}';";
            var minObj = await minCmd.ExecuteScalarAsync();
            if (minObj == null || minObj == DBNull.Value) continue;
            int currentMinId = Convert.ToInt32(minObj);

            // Get orphaned docs for this loan type (referencing IDs not in current master)
            using var orphanCmd = conn.CreateCommand();
            orphanCmd.CommandText = $@"
                SELECT DISTINCT lad.DocumentMasterId 
                FROM loan_application_documents lad
                WHERE lad.LoanType = '{lt}' 
                  AND lad.DocumentMasterId NOT IN (SELECT Id FROM document_master WHERE LoanType = '{lt}')
                ORDER BY lad.DocumentMasterId;";
            var orphanIds = new List<int>();
            using (var reader = await orphanCmd.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync()) orphanIds.Add(reader.GetInt32(0));
            }

            if (orphanIds.Count == 0) continue;

            // Get the ordered list of current valid master IDs
            using var masterCmd = conn.CreateCommand();
            masterCmd.CommandText = $"SELECT Id FROM document_master WHERE LoanType = '{lt}' ORDER BY Id;";
            var masterIds = new List<int>();
            using (var reader = await masterCmd.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync()) masterIds.Add(reader.GetInt32(0));
            }

            // Calculate offset: old min orphan → current min master
            int oldMinId = orphanIds.Min();
            
            // Remap each orphan: position = oldId - oldMin, newId = masterIds[position]
            foreach (var oldId in orphanIds)
            {
                int position = oldId - oldMinId;
                if (position >= 0 && position < masterIds.Count)
                {
                    int newId = masterIds[position];
                    using var updateCmd = conn.CreateCommand();
                    updateCmd.CommandText = $"UPDATE loan_application_documents SET DocumentMasterId = {newId} WHERE LoanType = '{lt}' AND DocumentMasterId = {oldId};";
                    await updateCmd.ExecuteNonQueryAsync();
                }
            }
        }
    }
    catch { /* Ignore migration errors */ }

    // 3. SET MAX PACKET (for large blobs)
    using (var pktCmd = conn.CreateCommand())
    {
        pktCmd.CommandText = "SET GLOBAL max_allowed_packet = 67108864;"; // 64MB
        try { await pktCmd.ExecuteNonQueryAsync(); } catch { /* Likely no permission — ignore */ }
    }

    await conn.CloseAsync();
}

app.Run();

// Migration Helpers
async Task AddColumnIfNotExists(System.Data.Common.DbConnection conn, string table, string column, string definition)
{
    using var checkCmd = conn.CreateCommand();
    checkCmd.CommandText = $@"
        SELECT COUNT(*) FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '{table}' AND COLUMN_NAME = '{column}';";
    var count = Convert.ToInt32(await checkCmd.ExecuteScalarAsync());
    if (count == 0)
    {
        using var alterCmd = conn.CreateCommand();
        alterCmd.CommandText = $"ALTER TABLE `{table}` ADD COLUMN `{column}` {definition};";
        await alterCmd.ExecuteNonQueryAsync();
    }
}
