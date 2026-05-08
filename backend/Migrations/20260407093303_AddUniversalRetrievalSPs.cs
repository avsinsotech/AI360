using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TushGptBackend.Migrations
{
    public partial class AddUniversalRetrievalSPs : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ============================================================
            // SP 1: sp_GetRecentApplications
            // Unified dashboard feed across all 4 loan types
            // ============================================================
            migrationBuilder.Sql(@"
                DROP PROCEDURE IF EXISTS sp_GetRecentApplications;
            ");
            migrationBuilder.Sql(@"
                CREATE PROCEDURE sp_GetRecentApplications(
                    IN p_ClientCode VARCHAR(50),
                    IN p_IsSuperAdmin BOOLEAN
                )
                BEGIN
                    SELECT * FROM (
                        SELECT 
                            Id, ApplicationNo, ApplicantName,
                            'Home Loan' AS LoanType,
                            CAST(COALESCE(LoanAmountNum, '0') AS DECIMAL(18,2)) AS Amount,
                            CASE WHEN Status = 'DRAFT' THEN 'Draft' ELSE Status END AS Status,
                            ROUND(DocumentCompletionPercentage, 2) AS DocumentCompletionPercentage,
                            CreatedAt
                        FROM home_loan_applications
                        WHERE (ApplicationNo IS NOT NULL AND ApplicationNo != '' AND ApplicationNo != 'N/A')
                          AND Status != 'DRAFT' AND Status != 'Draft'
                          AND (p_IsSuperAdmin = TRUE OR ClientCode = p_ClientCode)

                        UNION ALL

                        SELECT 
                            Id, ApplicationNo, ApplicantName,
                            'Personal Loan' AS LoanType,
                            COALESCE(LoanAmount, 0) AS Amount,
                            CASE WHEN ApplicationNo IS NOT NULL AND ApplicationNo != '' THEN 'Submitted' ELSE 'Draft' END AS Status,
                            ROUND(DocumentCompletionPercentage, 2) AS DocumentCompletionPercentage,
                            CreatedAt
                        FROM personal_loan_applications
                        WHERE (ApplicationNo IS NOT NULL AND ApplicationNo != '' AND ApplicationNo != 'N/A')
                          AND (p_IsSuperAdmin = TRUE OR ClientCode = p_ClientCode)

                        UNION ALL

                        SELECT 
                            Id, ApplicationNo, ApplicantName,
                            'Business Loan' AS LoanType,
                            COALESCE(LoanAmount, 0) AS Amount,
                            CASE 
                                WHEN ApplicationNo IS NULL OR ApplicationNo = '' THEN 'Draft'
                                WHEN Status IS NULL OR Status = '' OR Status = 'DRAFT' THEN 'Submitted'
                                ELSE Status 
                            END AS Status,
                            ROUND(DocumentCompletionPercentage, 2) AS DocumentCompletionPercentage,
                            CreatedAt
                        FROM business_loan_applications
                        WHERE (ApplicationNo IS NOT NULL AND ApplicationNo != '' AND ApplicationNo != 'N/A')
                          AND (Status = 'Submitted' OR Status = 'SUBMITTED' OR Status IS NULL OR Status = '')
                          AND (p_IsSuperAdmin = TRUE OR ClientCode = p_ClientCode)

                        UNION ALL

                        SELECT 
                            Id, ApplicationNo, ArjdarNaav AS ApplicantName,
                            'Vehicle Loan' AS LoanType,
                            CAST(REPLACE(COALESCE(KarjRakkam, '0'), ',', '') AS DECIMAL(18,2)) AS Amount,
                            CASE 
                                WHEN ApplicationNo IS NULL OR ApplicationNo = '' THEN 'Draft'
                                WHEN Status IS NULL OR Status = '' OR Status = 'DRAFT' THEN 'Submitted'
                                ELSE Status 
                            END AS Status,
                            ROUND(DocumentCompletionPercentage, 2) AS DocumentCompletionPercentage,
                            CreatedAt
                        FROM vehicle_loan_applications
                        WHERE (ApplicationNo IS NOT NULL AND ApplicationNo != '' AND ApplicationNo != 'N/A')
                          AND (Status = 'SUBMITTED' OR Status = 'Submitted')
                          AND (p_IsSuperAdmin = TRUE OR ClientCode = p_ClientCode)
                    ) AS combined
                    ORDER BY CreatedAt DESC;
                END
            ");

            // ============================================================
            // SP 2: sp_GlobalSearch
            // Atomic search across all verification & loan tables
            // ============================================================
            migrationBuilder.Sql(@"
                DROP PROCEDURE IF EXISTS sp_GlobalSearch;
            ");
            migrationBuilder.Sql(@"
                CREATE PROCEDURE sp_GlobalSearch(
                    IN p_Query VARCHAR(255),
                    IN p_ClientCode VARCHAR(50),
                    IN p_IsSuperAdmin BOOLEAN
                )
                BEGIN
                    SET @q = LOWER(p_Query);

                    SELECT * FROM (
                        (SELECT Id AS id, Name AS title, AadhaarNo AS subtitle, 'Aadhaar' AS type, '/verification/aadhar' AS link
                         FROM verified_aadhars
                         WHERE (p_IsSuperAdmin = TRUE OR ClientCode = p_ClientCode)
                           AND (LOWER(Name) LIKE CONCAT('%', @q, '%') OR AadhaarNo LIKE CONCAT('%', @q, '%'))
                         LIMIT 5)

                        UNION ALL

                        (SELECT Id AS id, Name AS title, PanNo AS subtitle, 'PAN' AS type, '/verification/pan' AS link
                         FROM verified_pans
                         WHERE (p_IsSuperAdmin = TRUE OR ClientCode = p_ClientCode)
                           AND (LOWER(Name) LIKE CONCAT('%', @q, '%') OR LOWER(PanNo) LIKE CONCAT('%', @q, '%'))
                         LIMIT 5)

                        UNION ALL

                        (SELECT Id AS id, Name AS title, UdyamNo AS subtitle, 'Udyam' AS type, '/verification/udyam' AS link
                         FROM verified_udyams
                         WHERE (p_IsSuperAdmin = TRUE OR ClientCode = p_ClientCode)
                           AND (LOWER(Name) LIKE CONCAT('%', @q, '%') OR LOWER(UdyamNo) LIKE CONCAT('%', @q, '%'))
                         LIMIT 5)

                        UNION ALL

                        (SELECT Id AS id, Name AS title, Gstin AS subtitle, 'GST' AS type, '/verification/gst' AS link
                         FROM verified_gsts
                         WHERE (p_IsSuperAdmin = TRUE OR ClientCode = p_ClientCode)
                           AND (LOWER(Name) LIKE CONCAT('%', @q, '%') OR LOWER(Gstin) LIKE CONCAT('%', @q, '%'))
                         LIMIT 5)

                        UNION ALL

                        (SELECT Id AS id, FullName AS title, MembershipNo AS subtitle, 'Membership' AS type, '/saarthi' AS link
                         FROM membership_applications
                         WHERE (p_IsSuperAdmin = TRUE OR ClientCode = p_ClientCode)
                           AND (LOWER(FullName) LIKE CONCAT('%', @q, '%') OR LOWER(MembershipNo) LIKE CONCAT('%', @q, '%'))
                         LIMIT 5)

                        UNION ALL

                        (SELECT Id AS id, MemberName AS title, AppId AS subtitle, 'Report' AS type, '/saarthi/report' AS link
                         FROM reports
                         WHERE (p_IsSuperAdmin = TRUE OR ClientCode = p_ClientCode)
                           AND (LOWER(MemberName) LIKE CONCAT('%', @q, '%') OR LOWER(AppId) LIKE CONCAT('%', @q, '%'))
                         LIMIT 5)
                    ) AS search_results;
                END
            ");

            // ============================================================
            // SP 3: sp_GetApplicationDocuments
            // Fetches document checklist + uploaded docs for scrutiny
            // ============================================================
            migrationBuilder.Sql(@"
                DROP PROCEDURE IF EXISTS sp_GetApplicationDocuments;
            ");
            migrationBuilder.Sql(@"
                CREATE PROCEDURE sp_GetApplicationDocuments(
                    IN p_ApplicationId INT,
                    IN p_LoanType VARCHAR(50)
                )
                BEGIN
                    -- Return uploaded documents metadata (no FileContent blob)
                    SELECT 
                        d.Id, d.DocumentMasterId, d.FileName, d.FileType,
                        d.Status, d.UploadedAt, d.VerifiedAt, d.Remarks,
                        d.UploadedBy, d.VerifiedBy
                    FROM loan_application_documents d
                    WHERE d.ApplicationId = p_ApplicationId 
                      AND d.LoanType = p_LoanType;

                    -- Return master document checklist
                    SELECT Id, DocumentName, Category, IsRequired, LoanType
                    FROM document_master
                    WHERE LoanType = p_LoanType;

                    -- Return summary counts
                    SELECT
                        (SELECT COUNT(*) FROM document_master WHERE LoanType = p_LoanType) AS TotalRequired,
                        (SELECT COUNT(DISTINCT DocumentMasterId) FROM loan_application_documents 
                         WHERE ApplicationId = p_ApplicationId AND LoanType = p_LoanType) AS Uploaded,
                        (SELECT COUNT(DISTINCT DocumentMasterId) FROM loan_application_documents 
                         WHERE ApplicationId = p_ApplicationId AND LoanType = p_LoanType AND Status = 'Verified') AS Verified;
                END
            ");

            // ============================================================
            // SP 4: sp_GetUsers
            // User management listing with role join
            // ============================================================
            migrationBuilder.Sql(@"
                DROP PROCEDURE IF EXISTS sp_GetUsers;
            ");
            migrationBuilder.Sql(@"
                CREATE PROCEDURE sp_GetUsers(
                    IN p_ClientCode VARCHAR(50),
                    IN p_IsSuperAdmin BOOLEAN
                )
                BEGIN
                    SELECT 
                        u.UserCode, u.UserName, u.UserLoginId,
                        u.IsActive, u.CreatedAt, u.ClientCode,
                        COALESCE(r.RoleName, 'No Role') AS RoleName
                    FROM users u
                    LEFT JOIN user_roles ur ON u.UserCode = ur.UserId
                    LEFT JOIN roles r ON ur.RoleId = r.Id
                    WHERE (p_IsSuperAdmin = TRUE OR u.ClientCode = p_ClientCode)
                    ORDER BY u.CreatedAt DESC;
                END
            ");

            // ============================================================
            // SP 5: sp_GetClients
            // Client/institution listing for super admin
            // ============================================================
            migrationBuilder.Sql(@"
                DROP PROCEDURE IF EXISTS sp_GetClients;
            ");
            migrationBuilder.Sql(@"
                CREATE PROCEDURE sp_GetClients()
                BEGIN
                    SELECT 
                        Id, ClientCode, Name, Email, Phone, Address,
                        IsActive, CreatedAt
                    FROM clients
                    ORDER BY CreatedAt DESC;
                END
            ");

            // ============================================================
            // SP 6: sp_GetClientUsers
            // Users for a specific client (super admin view)
            // ============================================================
            migrationBuilder.Sql(@"
                DROP PROCEDURE IF EXISTS sp_GetClientUsers;
            ");
            migrationBuilder.Sql(@"
                CREATE PROCEDURE sp_GetClientUsers(
                    IN p_ClientCode VARCHAR(50)
                )
                BEGIN
                    SELECT 
                        u.UserCode, u.UserName, u.UserLoginId,
                        u.IsActive, u.CreatedAt,
                        COALESCE(r.RoleName, 'No Role') AS RoleName
                    FROM users u
                    LEFT JOIN user_roles ur ON u.UserCode = ur.UserId
                    LEFT JOIN roles r ON ur.RoleId = r.Id
                    WHERE u.ClientCode = p_ClientCode
                    ORDER BY u.CreatedAt DESC;
                END
            ");

            // ============================================================
            // SP 7: sp_GetMembershipApplications
            // Saarthi membership listing
            // ============================================================
            migrationBuilder.Sql(@"
                DROP PROCEDURE IF EXISTS sp_GetMembershipApplications;
            ");
            migrationBuilder.Sql(@"
                CREATE PROCEDURE sp_GetMembershipApplications(
                    IN p_ClientCode VARCHAR(50),
                    IN p_IsSuperAdmin BOOLEAN
                )
                BEGIN
                    SELECT *
                    FROM membership_applications
                    WHERE (p_IsSuperAdmin = TRUE OR ClientCode = p_ClientCode)
                    ORDER BY CreatedAt DESC;
                END
            ");

            // ============================================================
            // SP 8: sp_GetKycStats
            // KYC analytics dashboard stats
            // ============================================================
            migrationBuilder.Sql(@"
                DROP PROCEDURE IF EXISTS sp_GetKycStats;
            ");
            migrationBuilder.Sql(@"
                CREATE PROCEDURE sp_GetKycStats(
                    IN p_ClientCode VARCHAR(50),
                    IN p_IsSuperAdmin BOOLEAN
                )
                BEGIN
                    -- Verified counts
                    SELECT 
                        (SELECT COUNT(*) FROM verified_aadhars 
                         WHERE p_IsSuperAdmin = TRUE OR ClientCode = p_ClientCode) AS VerifiedAadhar,
                        (SELECT COUNT(*) FROM otp_verifications 
                         WHERE IsVerified = TRUE AND (p_IsSuperAdmin = TRUE OR ClientCode = p_ClientCode)) AS VerifiedMobile,
                        (SELECT COUNT(*) FROM otp_verifications 
                         WHERE IsVerified = FALSE AND ExpiresAt > UTC_TIMESTAMP() AND (p_IsSuperAdmin = TRUE OR ClientCode = p_ClientCode)) AS PendingMobile,
                        (SELECT COUNT(*) FROM otp_verifications 
                         WHERE IsVerified = FALSE AND ExpiresAt <= UTC_TIMESTAMP() AND (p_IsSuperAdmin = TRUE OR ClientCode = p_ClientCode)) AS FailedMobile;
                END
            ");

            // ============================================================
            // SP 9: sp_GetDocumentRecentApps
            // For Document module's recent applications feed
            // ============================================================
            migrationBuilder.Sql(@"
                DROP PROCEDURE IF EXISTS sp_GetDocumentRecentApps;
            ");
            migrationBuilder.Sql(@"
                CREATE PROCEDURE sp_GetDocumentRecentApps(
                    IN p_ClientCode VARCHAR(50),
                    IN p_IsSuperAdmin BOOLEAN
                )
                BEGIN
                    SELECT * FROM (
                        SELECT 
                            Id, ApplicationNo, ApplicantName,
                            CAST(COALESCE(LoanAmountNum, '0') AS CHAR) AS LoanAmountNum,
                            Status, ROUND(DocumentCompletionPercentage, 2) AS DocumentCompletionPercentage,
                            CreatedAt, 'HomeLoan' AS LoanType
                        FROM home_loan_applications
                        WHERE Status = 'SUBMITTED'
                          AND ApplicationNo IS NOT NULL AND ApplicationNo != ''
                          AND (p_IsSuperAdmin = TRUE OR ClientCode = p_ClientCode)

                        UNION ALL

                        SELECT 
                            Id, ApplicationNo, ArjdarNaav AS ApplicantName,
                            COALESCE(KarjRakkam, '0') AS LoanAmountNum,
                            Status, ROUND(DocumentCompletionPercentage, 2) AS DocumentCompletionPercentage,
                            CreatedAt, 'VehicleLoan' AS LoanType
                        FROM vehicle_loan_applications
                        WHERE Status = 'SUBMITTED'
                          AND ApplicationNo IS NOT NULL AND ApplicationNo != ''
                          AND (p_IsSuperAdmin = TRUE OR ClientCode = p_ClientCode)

                        UNION ALL

                        SELECT 
                            Id, ApplicationNo, ApplicantName,
                            CAST(COALESCE(LoanAmount, 0) AS CHAR) AS LoanAmountNum,
                            Status, ROUND(DocumentCompletionPercentage, 2) AS DocumentCompletionPercentage,
                            CreatedAt, 'BusinessLoan' AS LoanType
                        FROM business_loan_applications
                        WHERE (Status = 'Submitted' OR Status = 'SUBMITTED')
                          AND ApplicationNo IS NOT NULL AND ApplicationNo != ''
                          AND (p_IsSuperAdmin = TRUE OR ClientCode = p_ClientCode)

                        UNION ALL

                        SELECT 
                            Id, ApplicationNo, ApplicantName,
                            CAST(COALESCE(LoanAmount, 0) AS CHAR) AS LoanAmountNum,
                            'SUBMITTED' AS Status, ROUND(DocumentCompletionPercentage, 2) AS DocumentCompletionPercentage,
                            CreatedAt, 'PersonalLoan' AS LoanType
                        FROM personal_loan_applications
                        WHERE ApplicationNo IS NOT NULL AND ApplicationNo != ''
                          AND (p_IsSuperAdmin = TRUE OR ClientCode = p_ClientCode)
                    ) AS combined
                    ORDER BY CreatedAt DESC;
                END
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS sp_GetRecentApplications;");
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS sp_GlobalSearch;");
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS sp_GetApplicationDocuments;");
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS sp_GetUsers;");
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS sp_GetClients;");
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS sp_GetClientUsers;");
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS sp_GetMembershipApplications;");
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS sp_GetKycStats;");
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS sp_GetDocumentRecentApps;");
        }
    }
}
