using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TushGptBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddRecalculateStatsSP : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var spRecalc = @"
DROP PROCEDURE IF EXISTS sp_RecalculateAppStats;
CREATE PROCEDURE sp_RecalculateAppStats(
    IN p_AppId INT,
    IN p_LoanType VARCHAR(100)
)
BEGIN
    DECLARE v_Total INT DEFAULT 0;
    DECLARE v_Uploaded INT DEFAULT 0;
    DECLARE v_Verified INT DEFAULT 0;
    DECLARE v_Pending INT DEFAULT 0;
    DECLARE v_Pct DECIMAL(18,2) DEFAULT 0;
    DECLARE v_MandatoryCount INT DEFAULT 0;
    DECLARE v_VerifiedMandatory INT DEFAULT 0;
    DECLARE v_DocStatus VARCHAR(50) DEFAULT 'PENDING';

    -- Calculate Stats
    SELECT COUNT(*) INTO v_Total FROM document_master WHERE LoanType = p_LoanType;
    
    -- Count distinct uploaded documents
    SELECT COUNT(DISTINCT DocumentMasterId) INTO v_Uploaded 
    FROM loan_application_documents 
    WHERE ApplicationId = p_AppId AND LoanType = p_LoanType;
                     
    -- Count distinct verified documents
    SELECT COUNT(DISTINCT DocumentMasterId) INTO v_Verified 
    FROM loan_application_documents 
    WHERE ApplicationId = p_AppId AND LoanType = p_LoanType AND Status = 'Verified';
    
    SET v_Pending = v_Total - v_Uploaded;
    IF v_Pending < 0 THEN SET v_Pending = 0; END IF;
    
    IF v_Total > 0 THEN 
        SET v_Pct = (v_Uploaded * 100.0) / v_Total; 
    END IF;

    -- Mandatory check for DocumentStatus
    SELECT COUNT(*) INTO v_MandatoryCount FROM document_master WHERE LoanType = p_LoanType AND IsMandatory = 1;
    
    SELECT COUNT(DISTINCT d.DocumentMasterId) INTO v_VerifiedMandatory
    FROM loan_application_documents d
    JOIN document_master m ON d.DocumentMasterId = m.Id
    WHERE d.ApplicationId = p_AppId AND d.LoanType = p_LoanType 
    AND d.Status = 'Verified' AND m.IsMandatory = 1;
                              
    IF v_VerifiedMandatory = v_MandatoryCount AND v_MandatoryCount > 0 THEN 
        SET v_DocStatus = 'COMPLETED';
    ELSEIF v_Uploaded > 0 THEN
        SET v_DocStatus = 'IN_PROGRESS';
    END IF;

    -- Update correct application table
    IF p_LoanType = 'HomeLoan' THEN
        UPDATE home_loan_applications SET 
            TotalDocuments = v_Total, UploadedDocuments = v_Uploaded, VerifiedDocuments = v_Verified,
            PendingDocuments = v_Pending, DocumentCompletionPercentage = v_Pct, DocumentStatus = v_DocStatus,
            UpdatedAt = UTC_TIMESTAMP()
        WHERE Id = p_AppId;
    ELSEIF p_LoanType = 'VehicleLoan' THEN
        UPDATE vehicle_loan_applications SET 
            TotalDocuments = v_Total, UploadedDocuments = v_Uploaded, VerifiedDocuments = v_Verified,
            PendingDocuments = v_Pending, DocumentCompletionPercentage = v_Pct, DocumentStatus = v_DocStatus,
            UpdatedAt = UTC_TIMESTAMP()
        WHERE Id = p_AppId;
    ELSEIF p_LoanType = 'BusinessLoan' THEN
        UPDATE business_loan_applications SET 
            TotalDocuments = v_Total, UploadedDocuments = v_Uploaded, VerifiedDocuments = v_Verified,
            PendingDocuments = v_Pending, DocumentCompletionPercentage = v_Pct, DocumentStatus = v_DocStatus,
            UpdatedAt = UTC_TIMESTAMP()
        WHERE Id = p_AppId;
    ELSEIF p_LoanType = 'PersonalLoan' THEN
        UPDATE personal_loan_applications SET 
            TotalDocuments = v_Total, UploadedDocuments = v_Uploaded, VerifiedDocuments = v_Verified,
            PendingDocuments = v_Pending, DocumentCompletionPercentage = v_Pct, DocumentStatus = v_DocStatus,
            UpdatedAt = UTC_TIMESTAMP()
        WHERE Id = p_AppId;
    END IF;
END;";
            migrationBuilder.Sql(spRecalc);

            var spUpdate = @"
DROP PROCEDURE IF EXISTS sp_UpdateDocumentStats;
CREATE PROCEDURE sp_UpdateDocumentStats(
    IN p_DocId INT,
    IN p_Status VARCHAR(50),
    IN p_Remarks TEXT,
    IN p_User VARCHAR(100)
)
BEGIN
    DECLARE v_AppId INT;
    DECLARE v_LoanType VARCHAR(100);

    -- 1. Update the document status
    UPDATE loan_application_documents 
    SET Status = p_Status, 
        Remarks = CASE WHEN p_Status = 'Rejected' THEN p_Remarks ELSE Remarks END,
        VerifiedAt = CASE WHEN p_Status = 'Verified' THEN UTC_TIMESTAMP() ELSE VerifiedAt END,
        VerifiedBy = CASE WHEN p_Status = 'Verified' THEN p_User ELSE VerifiedBy END
    WHERE Id = p_DocId;

    -- 2. Get App Context
    SELECT ApplicationId, LoanType INTO v_AppId, v_LoanType 
    FROM loan_application_documents WHERE Id = p_DocId;

    -- 3. Recalculate stats
    IF v_AppId IS NOT NULL THEN
        CALL sp_RecalculateAppStats(v_AppId, v_LoanType);
    END IF;
END;";
            migrationBuilder.Sql(spUpdate);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS sp_RecalculateAppStats;");
        }

    }
}
