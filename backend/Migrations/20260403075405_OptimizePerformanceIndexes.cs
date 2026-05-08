using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TushGptBackend.Migrations
{
    /// <inheritdoc />
    public partial class OptimizePerformanceIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "DocumentStatus",
                table: "vehicle_loan_applications",
                type: "longtext",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "DocumentStatus",
                table: "personal_loan_applications",
                type: "varchar(255)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "ClientCode",
                table: "personal_loan_applications",
                type: "varchar(255)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "ApplicationNo",
                table: "personal_loan_applications",
                type: "varchar(255)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "DocumentStatus",
                table: "home_loan_applications",
                type: "longtext",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "DocumentStatus",
                table: "business_loan_applications",
                type: "longtext",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_personal_loan_applications_ApplicationNo",
                table: "personal_loan_applications",
                column: "ApplicationNo");

            migrationBuilder.CreateIndex(
                name: "IX_personal_loan_applications_ClientCode",
                table: "personal_loan_applications",
                column: "ClientCode");

            migrationBuilder.CreateIndex(
                name: "IX_personal_loan_applications_CreatedAt",
                table: "personal_loan_applications",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_personal_loan_applications_DocumentStatus",
                table: "personal_loan_applications",
                column: "DocumentStatus");

            migrationBuilder.CreateIndex(
                name: "IX_loan_application_documents_ApplicationId_LoanType",
                table: "loan_application_documents",
                columns: new[] { "ApplicationId", "LoanType" });

            migrationBuilder.CreateIndex(
                name: "IX_home_loan_applications_ApplicationNo",
                table: "home_loan_applications",
                column: "ApplicationNo");

            migrationBuilder.CreateIndex(
                name: "IX_home_loan_applications_Status",
                table: "home_loan_applications",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_personal_loan_applications_ApplicationNo",
                table: "personal_loan_applications");

            migrationBuilder.DropIndex(
                name: "IX_personal_loan_applications_ClientCode",
                table: "personal_loan_applications");

            migrationBuilder.DropIndex(
                name: "IX_personal_loan_applications_CreatedAt",
                table: "personal_loan_applications");

            migrationBuilder.DropIndex(
                name: "IX_personal_loan_applications_DocumentStatus",
                table: "personal_loan_applications");

            migrationBuilder.DropIndex(
                name: "IX_loan_application_documents_ApplicationId_LoanType",
                table: "loan_application_documents");

            migrationBuilder.DropIndex(
                name: "IX_home_loan_applications_ApplicationNo",
                table: "home_loan_applications");

            migrationBuilder.DropIndex(
                name: "IX_home_loan_applications_Status",
                table: "home_loan_applications");

            migrationBuilder.UpdateData(
                table: "vehicle_loan_applications",
                keyColumn: "DocumentStatus",
                keyValue: null,
                column: "DocumentStatus",
                value: "");

            migrationBuilder.AlterColumn<string>(
                name: "DocumentStatus",
                table: "vehicle_loan_applications",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.UpdateData(
                table: "personal_loan_applications",
                keyColumn: "DocumentStatus",
                keyValue: null,
                column: "DocumentStatus",
                value: "");

            migrationBuilder.AlterColumn<string>(
                name: "DocumentStatus",
                table: "personal_loan_applications",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(255)",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "ClientCode",
                table: "personal_loan_applications",
                type: "longtext",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(255)",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "ApplicationNo",
                table: "personal_loan_applications",
                type: "longtext",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(255)",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.UpdateData(
                table: "home_loan_applications",
                keyColumn: "DocumentStatus",
                keyValue: null,
                column: "DocumentStatus",
                value: "");

            migrationBuilder.AlterColumn<string>(
                name: "DocumentStatus",
                table: "home_loan_applications",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.UpdateData(
                table: "business_loan_applications",
                keyColumn: "DocumentStatus",
                keyValue: null,
                column: "DocumentStatus",
                value: "");

            migrationBuilder.AlterColumn<string>(
                name: "DocumentStatus",
                table: "business_loan_applications",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");
        }
    }
}
