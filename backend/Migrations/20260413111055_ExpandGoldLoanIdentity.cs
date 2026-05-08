using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TushGptBackend.Migrations
{
    /// <inheritdoc />
    public partial class ExpandGoldLoanIdentity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AadhaarNo",
                table: "gold_loan_applications",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "gold_loan_applications",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "Age",
                table: "gold_loan_applications",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MobileNo",
                table: "gold_loan_applications",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "PanNo",
                table: "gold_loan_applications",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "RepaymentDate",
                table: "gold_loan_applications",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "Tenure",
                table: "gold_loan_applications",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ValuerReceiptNo",
                table: "gold_loan_applications",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AadhaarNo",
                table: "gold_loan_applications");

            migrationBuilder.DropColumn(
                name: "Address",
                table: "gold_loan_applications");

            migrationBuilder.DropColumn(
                name: "Age",
                table: "gold_loan_applications");

            migrationBuilder.DropColumn(
                name: "MobileNo",
                table: "gold_loan_applications");

            migrationBuilder.DropColumn(
                name: "PanNo",
                table: "gold_loan_applications");

            migrationBuilder.DropColumn(
                name: "RepaymentDate",
                table: "gold_loan_applications");

            migrationBuilder.DropColumn(
                name: "Tenure",
                table: "gold_loan_applications");

            migrationBuilder.DropColumn(
                name: "ValuerReceiptNo",
                table: "gold_loan_applications");
        }
    }
}
