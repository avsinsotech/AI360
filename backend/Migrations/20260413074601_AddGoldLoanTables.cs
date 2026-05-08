using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TushGptBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddGoldLoanTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.CreateTable(
                name: "gold_loan_applications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ApplicationNo = table.Column<string>(type: "varchar(255)", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ClientCode = table.Column<string>(type: "varchar(255)", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CustomerName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Scheme = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SanctionDate = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    GoldBagNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SbAcNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Branch = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SbName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Balance = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    LoanLimit = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    LoanSanction = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    TotalTransferVoucher = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    TotalDeductionVoucher = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    TotalPayableAmount = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_gold_loan_applications", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "gold_loan_deductions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    GoldLoanId = table.Column<int>(type: "int", nullable: false),
                    RowOrder = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    AccNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    DeductionAmount = table.Column<decimal>(type: "decimal(65,30)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_gold_loan_deductions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_gold_loan_deductions_gold_loan_applications_GoldLoanId",
                        column: x => x.GoldLoanId,
                        principalTable: "gold_loan_applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "gold_loan_images",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    GoldLoanId = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Base64Data = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_gold_loan_images", x => x.Id);
                    table.ForeignKey(
                        name: "FK_gold_loan_images_gold_loan_applications_GoldLoanId",
                        column: x => x.GoldLoanId,
                        principalTable: "gold_loan_applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "gold_loan_ornaments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    GoldLoanId = table.Column<int>(type: "int", nullable: false),
                    RowOrder = table.Column<int>(type: "int", nullable: false),
                    Particular = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Qty = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    GrossWt = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    NetWt = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    Rate = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    Price = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    ValuerPrice = table.Column<decimal>(type: "decimal(65,30)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_gold_loan_ornaments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_gold_loan_ornaments_gold_loan_applications_GoldLoanId",
                        column: x => x.GoldLoanId,
                        principalTable: "gold_loan_applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_gold_loan_applications_ApplicationNo",
                table: "gold_loan_applications",
                column: "ApplicationNo");

            migrationBuilder.CreateIndex(
                name: "IX_gold_loan_applications_ClientCode",
                table: "gold_loan_applications",
                column: "ClientCode");

            migrationBuilder.CreateIndex(
                name: "IX_gold_loan_applications_CreatedAt",
                table: "gold_loan_applications",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_gold_loan_deductions_GoldLoanId",
                table: "gold_loan_deductions",
                column: "GoldLoanId");

            migrationBuilder.CreateIndex(
                name: "IX_gold_loan_images_GoldLoanId",
                table: "gold_loan_images",
                column: "GoldLoanId");

            migrationBuilder.CreateIndex(
                name: "IX_gold_loan_ornaments_GoldLoanId",
                table: "gold_loan_ornaments",
                column: "GoldLoanId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "gold_loan_deductions");

            migrationBuilder.DropTable(
                name: "gold_loan_images");

            migrationBuilder.DropTable(
                name: "gold_loan_ornaments");

            migrationBuilder.DropTable(
                name: "gold_loan_applications");

        }
    }
}
