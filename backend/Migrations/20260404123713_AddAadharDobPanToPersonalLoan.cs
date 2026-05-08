using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TushGptBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddAadharDobPanToPersonalLoan : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AadharNo",
                table: "personal_loan_borrower_info",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Dob",
                table: "personal_loan_borrower_info",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "PanNo",
                table: "personal_loan_borrower_info",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AadharNo",
                table: "personal_loan_borrower_info");

            migrationBuilder.DropColumn(
                name: "Dob",
                table: "personal_loan_borrower_info");

            migrationBuilder.DropColumn(
                name: "PanNo",
                table: "personal_loan_borrower_info");
        }
    }
}
