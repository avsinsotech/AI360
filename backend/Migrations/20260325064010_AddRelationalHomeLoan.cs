using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TushGptBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddRelationalHomeLoan : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_home_loan_applications_ApplicantName",
                table: "home_loan_applications");

            migrationBuilder.DropIndex(
                name: "IX_home_loan_applications_ApplicationNo",
                table: "home_loan_applications");

            migrationBuilder.DropIndex(
                name: "IX_home_loan_applications_ClientCode",
                table: "home_loan_applications");

            migrationBuilder.DropIndex(
                name: "IX_home_loan_applications_CreatedAt",
                table: "home_loan_applications");

            migrationBuilder.DropIndex(
                name: "IX_home_loan_applications_Status",
                table: "home_loan_applications");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "home_loan_applications",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(255)")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "ApplicantName",
                table: "home_loan_applications",
                type: "longtext",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(255)",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "home_loan_applications",
                type: "varchar(255)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "ApplicantName",
                table: "home_loan_applications",
                type: "varchar(255)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_home_loan_applications_ApplicantName",
                table: "home_loan_applications",
                column: "ApplicantName");

            migrationBuilder.CreateIndex(
                name: "IX_home_loan_applications_ApplicationNo",
                table: "home_loan_applications",
                column: "ApplicationNo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_home_loan_applications_ClientCode",
                table: "home_loan_applications",
                column: "ClientCode");

            migrationBuilder.CreateIndex(
                name: "IX_home_loan_applications_CreatedAt",
                table: "home_loan_applications",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_home_loan_applications_Status",
                table: "home_loan_applications",
                column: "Status");
        }
    }
}
