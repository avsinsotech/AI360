using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TushGptBackend.Migrations
{
    public partial class FixCollationInUniversalSPs : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Fix collation mismatch in UNION ALL by adding COLLATE utf8mb4_unicode_ci
            
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS sp_GetRecentApplications;");
            migrationBuilder.Sql(@"
                CREATE PROCEDURE sp_GetRecentApplications(
                    IN p_ClientCode VARCHAR(50),
                    IN p_IsSuperAdmin BOOLEAN
                )
                BEGIN
                    SELECT * FROM (
                        SELECT 
                            Id,
                            ApplicationNo COLLATE utf8mb4_unicode_ci AS ApplicationNo,
                            ApplicantName COLLATE utf8mb4_unicode_ci AS ApplicantName,
                            'Home Loan' AS LoanType,
                            CAST(COALESCE(LoanAmountNum, '0') AS DECIMAL(18,2)) AS Amount,
                            CASE WHEN Status = 'DRAFT' THEN 'Draft' ELSE COALESCE(Status, 'Draft') END COLLATE utf8mb4_unicode_ci AS Status,
                            ROUND(DocumentCompletionPercentage, 2) AS DocumentCompletionPercentage,
                            CreatedAt
                        FROM home_loan_applications
                        WHERE (ApplicationNo IS NOT NULL AND ApplicationNo != '' AND ApplicationNo != 'N/A')
                          AND Status != 'DRAFT' AND Status != 'Draft'
                          AND (p_IsSuperAdmin = TRUE OR ClientCode COLLATE utf8mb4_unicode_ci = p_ClientCode)

                        UNION ALL

                        SELECT 
                            Id,
                            ApplicationNo COLLATE utf8mb4_unicode_ci AS ApplicationNo,
                            ApplicantName COLLATE utf8mb4_unicode_ci AS ApplicantName,
                            'Personal Loan' AS LoanType,
                            COALESCE(LoanAmount, 0) AS Amount,
                            CASE WHEN ApplicationNo IS NOT NULL AND ApplicationNo != '' THEN 'Submitted' ELSE 'Draft' END AS Status,
                            ROUND(DocumentCompletionPercentage, 2) AS DocumentCompletionPercentage,
                            CreatedAt
                        FROM personal_loan_applications
                        WHERE (ApplicationNo IS NOT NULL AND ApplicationNo != '' AND ApplicationNo != 'N/A')
                          AND (p_IsSuperAdmin = TRUE OR ClientCode COLLATE utf8mb4_unicode_ci = p_ClientCode)

                        UNION ALL

                        SELECT 
                            Id,
                            ApplicationNo COLLATE utf8mb4_unicode_ci AS ApplicationNo,
                            ApplicantName COLLATE utf8mb4_unicode_ci AS ApplicantName,
                            'Business Loan' AS LoanType,
                            COALESCE(LoanAmount, 0) AS Amount,
                            CASE 
                                WHEN ApplicationNo IS NULL OR ApplicationNo = '' THEN 'Draft'
                                WHEN Status IS NULL OR Status = '' OR Status = 'DRAFT' THEN 'Submitted'
                                ELSE COALESCE(Status, 'Draft')
                            END COLLATE utf8mb4_unicode_ci AS Status,
                            ROUND(DocumentCompletionPercentage, 2) AS DocumentCompletionPercentage,
                            CreatedAt
                        FROM business_loan_applications
                        WHERE (ApplicationNo IS NOT NULL AND ApplicationNo != '' AND ApplicationNo != 'N/A')
                          AND (Status = 'Submitted' OR Status = 'SUBMITTED' OR Status IS NULL OR Status = '')
                          AND (p_IsSuperAdmin = TRUE OR ClientCode COLLATE utf8mb4_unicode_ci = p_ClientCode)

                        UNION ALL

                        SELECT 
                            Id,
                            ApplicationNo COLLATE utf8mb4_unicode_ci AS ApplicationNo,
                            ArjdarNaav COLLATE utf8mb4_unicode_ci AS ApplicantName,
                            'Vehicle Loan' AS LoanType,
                            CAST(REPLACE(COALESCE(KarjRakkam, '0'), ',', '') AS DECIMAL(18,2)) AS Amount,
                            CASE 
                                WHEN ApplicationNo IS NULL OR ApplicationNo = '' THEN 'Draft'
                                WHEN Status IS NULL OR Status = '' OR Status = 'DRAFT' THEN 'Submitted'
                                ELSE COALESCE(Status, 'Draft')
                            END COLLATE utf8mb4_unicode_ci AS Status,
                            ROUND(DocumentCompletionPercentage, 2) AS DocumentCompletionPercentage,
                            CreatedAt
                        FROM vehicle_loan_applications
                        WHERE (ApplicationNo IS NOT NULL AND ApplicationNo != '' AND ApplicationNo != 'N/A')
                          AND (Status = 'SUBMITTED' OR Status = 'Submitted')
                          AND (p_IsSuperAdmin = TRUE OR ClientCode COLLATE utf8mb4_unicode_ci = p_ClientCode)
                    ) AS combined
                    ORDER BY CreatedAt DESC;
                END
            ");

            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS sp_GetDocumentRecentApps;");
            migrationBuilder.Sql(@"
                CREATE PROCEDURE sp_GetDocumentRecentApps(
                    IN p_ClientCode VARCHAR(50),
                    IN p_IsSuperAdmin BOOLEAN
                )
                BEGIN
                    SELECT * FROM (
                        SELECT 
                            Id,
                            ApplicationNo COLLATE utf8mb4_unicode_ci AS ApplicationNo,
                            ApplicantName COLLATE utf8mb4_unicode_ci AS ApplicantName,
                            CAST(COALESCE(LoanAmountNum, '0') AS CHAR) COLLATE utf8mb4_unicode_ci AS LoanAmountNum,
                            Status COLLATE utf8mb4_unicode_ci AS Status,
                            ROUND(DocumentCompletionPercentage, 2) AS DocumentCompletionPercentage,
                            CreatedAt,
                            'HomeLoan' AS LoanType
                        FROM home_loan_applications
                        WHERE Status = 'SUBMITTED'
                          AND ApplicationNo IS NOT NULL AND ApplicationNo != ''
                          AND (p_IsSuperAdmin = TRUE OR ClientCode COLLATE utf8mb4_unicode_ci = p_ClientCode)

                        UNION ALL

                        SELECT 
                            Id,
                            ApplicationNo COLLATE utf8mb4_unicode_ci AS ApplicationNo,
                            ArjdarNaav COLLATE utf8mb4_unicode_ci AS ApplicantName,
                            COALESCE(KarjRakkam, '0') COLLATE utf8mb4_unicode_ci AS LoanAmountNum,
                            Status COLLATE utf8mb4_unicode_ci AS Status,
                            ROUND(DocumentCompletionPercentage, 2) AS DocumentCompletionPercentage,
                            CreatedAt,
                            'VehicleLoan' AS LoanType
                        FROM vehicle_loan_applications
                        WHERE Status = 'SUBMITTED'
                          AND ApplicationNo IS NOT NULL AND ApplicationNo != ''
                          AND (p_IsSuperAdmin = TRUE OR ClientCode COLLATE utf8mb4_unicode_ci = p_ClientCode)

                        UNION ALL

                        SELECT 
                            Id,
                            ApplicationNo COLLATE utf8mb4_unicode_ci AS ApplicationNo,
                            ApplicantName COLLATE utf8mb4_unicode_ci AS ApplicantName,
                            CAST(COALESCE(LoanAmount, 0) AS CHAR) COLLATE utf8mb4_unicode_ci AS LoanAmountNum,
                            Status COLLATE utf8mb4_unicode_ci AS Status,
                            ROUND(DocumentCompletionPercentage, 2) AS DocumentCompletionPercentage,
                            CreatedAt,
                            'BusinessLoan' AS LoanType
                        FROM business_loan_applications
                        WHERE (Status = 'Submitted' OR Status = 'SUBMITTED')
                          AND ApplicationNo IS NOT NULL AND ApplicationNo != ''
                          AND (p_IsSuperAdmin = TRUE OR ClientCode COLLATE utf8mb4_unicode_ci = p_ClientCode)

                        UNION ALL

                        SELECT 
                            Id,
                            ApplicationNo COLLATE utf8mb4_unicode_ci AS ApplicationNo,
                            ApplicantName COLLATE utf8mb4_unicode_ci AS ApplicantName,
                            CAST(COALESCE(LoanAmount, 0) AS CHAR) COLLATE utf8mb4_unicode_ci AS LoanAmountNum,
                            'SUBMITTED' AS Status,
                            ROUND(DocumentCompletionPercentage, 2) AS DocumentCompletionPercentage,
                            CreatedAt,
                            'PersonalLoan' AS LoanType
                        FROM personal_loan_applications
                        WHERE ApplicationNo IS NOT NULL AND ApplicationNo != ''
                          AND (p_IsSuperAdmin = TRUE OR ClientCode COLLATE utf8mb4_unicode_ci = p_ClientCode)
                    ) AS combined
                    ORDER BY CreatedAt DESC;
                END
            ");

            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS sp_GlobalSearch;");
            migrationBuilder.Sql(@"
                CREATE PROCEDURE sp_GlobalSearch(
                    IN p_Query VARCHAR(255),
                    IN p_ClientCode VARCHAR(50),
                    IN p_IsSuperAdmin BOOLEAN
                )
                BEGIN
                    SET @q = LOWER(p_Query);

                    SELECT * FROM (
                        (SELECT Id AS id, Name COLLATE utf8mb4_unicode_ci AS title, AadhaarNo COLLATE utf8mb4_unicode_ci AS subtitle, 'Aadhaar' AS type, '/verification/aadhar' AS link
                         FROM verified_aadhars
                         WHERE (p_IsSuperAdmin = TRUE OR ClientCode COLLATE utf8mb4_unicode_ci = p_ClientCode)
                           AND (LOWER(Name) LIKE CONCAT('%', @q, '%') OR AadhaarNo LIKE CONCAT('%', @q, '%'))
                         LIMIT 5)

                        UNION ALL

                        (SELECT Id AS id, Name COLLATE utf8mb4_unicode_ci AS title, PanNo COLLATE utf8mb4_unicode_ci AS subtitle, 'PAN' AS type, '/verification/pan' AS link
                         FROM verified_pans
                         WHERE (p_IsSuperAdmin = TRUE OR ClientCode COLLATE utf8mb4_unicode_ci = p_ClientCode)
                           AND (LOWER(Name) LIKE CONCAT('%', @q, '%') OR LOWER(PanNo) LIKE CONCAT('%', @q, '%'))
                         LIMIT 5)

                        UNION ALL

                        (SELECT Id AS id, Name COLLATE utf8mb4_unicode_ci AS title, UdyamNo COLLATE utf8mb4_unicode_ci AS subtitle, 'Udyam' AS type, '/verification/udyam' AS link
                         FROM verified_udyams
                         WHERE (p_IsSuperAdmin = TRUE OR ClientCode COLLATE utf8mb4_unicode_ci = p_ClientCode)
                           AND (LOWER(Name) LIKE CONCAT('%', @q, '%') OR LOWER(UdyamNo) LIKE CONCAT('%', @q, '%'))
                         LIMIT 5)

                        UNION ALL

                        (SELECT Id AS id, Name COLLATE utf8mb4_unicode_ci AS title, Gstin COLLATE utf8mb4_unicode_ci AS subtitle, 'GST' AS type, '/verification/gst' AS link
                         FROM verified_gsts
                         WHERE (p_IsSuperAdmin = TRUE OR ClientCode COLLATE utf8mb4_unicode_ci = p_ClientCode)
                           AND (LOWER(Name) LIKE CONCAT('%', @q, '%') OR LOWER(Gstin) LIKE CONCAT('%', @q, '%'))
                         LIMIT 5)

                        UNION ALL

                        (SELECT Id AS id, FullName COLLATE utf8mb4_unicode_ci AS title, COALESCE(MembershipNo, '') COLLATE utf8mb4_unicode_ci AS subtitle, 'Membership' AS type, '/saarthi' AS link
                         FROM membership_applications
                         WHERE (p_IsSuperAdmin = TRUE OR ClientCode COLLATE utf8mb4_unicode_ci = p_ClientCode)
                           AND (LOWER(FullName) LIKE CONCAT('%', @q, '%') OR LOWER(COALESCE(MembershipNo,'')) LIKE CONCAT('%', @q, '%'))
                         LIMIT 5)

                        UNION ALL

                        (SELECT Id AS id, MemberName COLLATE utf8mb4_unicode_ci AS title, AppId COLLATE utf8mb4_unicode_ci AS subtitle, 'Report' AS type, '/saarthi/report' AS link
                         FROM reports
                         WHERE (p_IsSuperAdmin = TRUE OR ClientCode COLLATE utf8mb4_unicode_ci = p_ClientCode)
                           AND (LOWER(MemberName) LIKE CONCAT('%', @q, '%') OR LOWER(AppId) LIKE CONCAT('%', @q, '%'))
                         LIMIT 5)
                    ) AS search_results;
                END
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Previous versions will be restored by rolling back to prior migration
        }
    }
}
