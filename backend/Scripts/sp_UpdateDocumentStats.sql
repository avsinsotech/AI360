DELIMITER //

DROP PROCEDURE IF EXISTS sp_UpdateDocumentStats //

CREATE PROCEDURE sp_UpdateDocumentStats(
    IN p_DocId INT,
    IN p_Status VARCHAR(50),
    IN p_Remarks TEXT,
    IN p_User VARCHAR(100)
)
BEGIN
    DECLARE v_AppId INT;
    DECLARE v_LoanType VARCHAR(100);
    DECLARE v_Total INT DEFAULT 0;
    DECLARE v_Uploaded INT DEFAULT 0;
    DECLARE v_Verified INT DEFAULT 0;
    DECLARE v_Pending INT DEFAULT 0;
    DECLARE v_Pct DECIMAL(18,2) DEFAULT 0;
    DECLARE v_MandatoryCount INT DEFAULT 0;
    DECLARE v_VerifiedMandatory INT DEFAULT 0;
    DECLARE v_DocStatus VARCHAR(50) DEFAULT 'PENDING';

    -- 1. Update the document status
    UPDATE loan_application_documents 
    SET Status = p_Status, 
        Remarks = CASE WHEN p_Status = 'Rejected' THEN p_Remarks ELSE Remarks END,
        VerifiedAt = CASE WHEN p_Status = 'Verified' THEN UTC_TIMESTAMP() ELSE VerifiedAt END,
        VerifiedBy = CASE WHEN p_Status = 'Verified' THEN p_User ELSE VerifiedBy END
    WHERE Id = p_DocId;

    -- 2. Get App Context (Id and LoanType)
    SELECT ApplicationId, LoanType INTO v_AppId, v_LoanType 
    FROM loan_application_documents WHERE Id = p_DocId;

    IF v_AppId IS NOT NULL THEN
        -- 3. Calculate Stats
        SELECT COUNT(*) INTO v_Total FROM document_master WHERE LoanType = v_LoanType;
        
        -- Count distinct uploaded (latest versions)
        SELECT COUNT(DISTINCT DocumentMasterId) INTO v_Uploaded 
        FROM loan_application_documents 
        WHERE ApplicationId = v_AppId AND LoanType = v_LoanType;
                         
        -- Count distinct verified
        SELECT COUNT(DISTINCT DocumentMasterId) INTO v_Verified 
        FROM loan_application_documents 
        WHERE ApplicationId = v_AppId AND LoanType = v_LoanType AND Status = 'Verified';
        
        SET v_Pending = v_Total - v_Uploaded;
        IF v_Pending < 0 THEN SET v_Pending = 0; END IF;
        
        IF v_Total > 0 THEN 
            SET v_Pct = (v_Uploaded / v_Total) * 100; 
        END IF;

        -- 4. Mandatory check for DocumentStatus
        SELECT COUNT(*) INTO v_MandatoryCount FROM document_master WHERE LoanType = v_LoanType AND IsMandatory = 1;
        
        SELECT COUNT(DISTINCT d.DocumentMasterId) INTO v_VerifiedMandatory
        FROM loan_application_documents d
        JOIN document_master m ON d.DocumentMasterId = m.Id
        WHERE d.ApplicationId = v_AppId AND d.LoanType = v_LoanType 
        AND d.Status = 'Verified' AND m.IsMandatory = 1;
                                  
        IF v_VerifiedMandatory = v_MandatoryCount AND v_MandatoryCount > 0 THEN 
            SET v_DocStatus = 'COMPLETED';
        ELSEIF v_Uploaded > 0 THEN
            SET v_DocStatus = 'IN_PROGRESS';
        END IF;

        -- 5. Dynamic Update targeting the correct application table
        IF v_LoanType = 'HomeLoan' THEN
            UPDATE home_loan_applications SET 
                TotalDocuments = v_Total, UploadedDocuments = v_Uploaded, VerifiedDocuments = v_Verified,
                PendingDocuments = v_Pending, DocumentCompletionPercentage = v_Pct, DocumentStatus = v_DocStatus,
                UpdatedAt = UTC_TIMESTAMP()
            WHERE Id = v_AppId;
        ELSEIF v_LoanType = 'VehicleLoan' THEN
            UPDATE vehicle_loan_applications SET 
                TotalDocuments = v_Total, UploadedDocuments = v_Uploaded, VerifiedDocuments = v_Verified,
                PendingDocuments = v_Pending, DocumentCompletionPercentage = v_Pct, DocumentStatus = v_DocStatus,
                UpdatedAt = UTC_TIMESTAMP()
            WHERE Id = v_AppId;
        ELSEIF v_LoanType = 'BusinessLoan' THEN
            UPDATE business_loan_applications SET 
                TotalDocuments = v_Total, UploadedDocuments = v_Uploaded, VerifiedDocuments = v_Verified,
                PendingDocuments = v_Pending, DocumentCompletionPercentage = v_Pct, DocumentStatus = v_DocStatus,
                UpdatedAt = UTC_TIMESTAMP()
            WHERE Id = v_AppId;
        ELSEIF v_LoanType = 'PersonalLoan' THEN
            UPDATE personal_loan_applications SET 
                TotalDocuments = v_Total, UploadedDocuments = v_Uploaded, VerifiedDocuments = v_Verified,
                PendingDocuments = v_Pending, DocumentCompletionPercentage = v_Pct, DocumentStatus = v_DocStatus,
                UpdatedAt = UTC_TIMESTAMP()
            WHERE Id = v_AppId;
        END IF;
    END IF;
END //

DELIMITER ;
