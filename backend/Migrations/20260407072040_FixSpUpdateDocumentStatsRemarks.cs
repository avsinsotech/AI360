using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TushGptBackend.Migrations
{
    /// <inheritdoc />
    public partial class FixSpUpdateDocumentStatsRemarks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

    -- 1. Update the document status and clear Remarks if not Rejected
    UPDATE loan_application_documents 
    SET Status = p_Status, 
        Remarks = CASE WHEN p_Status = 'Rejected' THEN p_Remarks ELSE NULL END,
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
            // Revert is complex without keeping old SP code, so we just drop it or leave it as is for now
            // Usually, we'd restore the previous version of the SP here if needed.
        }

    }
}
