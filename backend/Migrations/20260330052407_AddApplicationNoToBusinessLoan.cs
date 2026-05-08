using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TushGptBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddApplicationNoToBusinessLoan : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "business_loan_applications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ClientCode = table.Column<string>(type: "varchar(255)", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ApplicationDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    MemberNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    LoanAccountNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Branch = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ApplicationNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ApplicantName = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ApplicantAge = table.Column<int>(type: "int", nullable: true),
                    LoanAmount = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    LoanAmountInWords = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RepaymentMonths = table.Column<int>(type: "int", nullable: true),
                    FirstInstallmentAfterMonths = table.Column<int>(type: "int", nullable: true),
                    InstallmentDate = table.Column<int>(type: "int", nullable: true),
                    Purpose = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    MaritalStatus = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Dependents = table.Column<int>(type: "int", nullable: true),
                    Guarantor1Name = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Guarantor1Age = table.Column<int>(type: "int", nullable: true),
                    Guarantor2Name = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Guarantor2Age = table.Column<int>(type: "int", nullable: true),
                    Guarantor3Name = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Guarantor3Age = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_business_loan_applications", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "business_loan_borrowers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ApplicationId = table.Column<int>(type: "int", nullable: false),
                    PhotoBase64 = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FullName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Age = table.Column<int>(type: "int", nullable: true),
                    MemberNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SharesCount = table.Column<int>(type: "int", nullable: true),
                    SharesAmount = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    FatherHusbandName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FatherHusbandAge = table.Column<int>(type: "int", nullable: true),
                    MotherName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    MotherAge = table.Column<int>(type: "int", nullable: true),
                    ResidentialAddress = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PinCode = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Telephone = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Mobile = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Email = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PropertyTypes = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ResidenceMonths = table.Column<int>(type: "int", nullable: true),
                    ResidenceYears = table.Column<int>(type: "int", nullable: true),
                    MaritalStatus = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Dependents = table.Column<int>(type: "int", nullable: true),
                    CompanyName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CompanyAddress = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CompanyPinCode = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CompanyTelephone = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CompanyMobile = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CompanyEmail = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Department = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Designation = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    EmployeeCode = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    EmploymentMonths = table.Column<int>(type: "int", nullable: true),
                    EmploymentYears = table.Column<int>(type: "int", nullable: true),
                    RetirementDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    MonthlySalary = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    Deductions = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    NetSalary = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    AnnualBusinessIncome = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    TotalExpenses = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    NetAnnualIncome = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    FamilyIncome = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    FamilyIncomeType = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PropertyOwnerName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PropertyOwnerRelation = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    VillageMukkam = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    VillagePost = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    VillageTaluka = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    VillageDistrict = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    VillageState = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    VillagePinCode = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    VillageTelephone = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    VillageMobile = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PrevLoanType = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PrevLoanAccountNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PrevLoanAmount = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    PrevLoanTakenDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    PrevLoanRepaidDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Guar94aBorrowerName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Guar94aLoanType = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Guar94aAccountNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Guar94aAmount = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    Guar94aTakenDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Guar94aRepaidDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Guar94bBorrowerName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Guar94bLoanType = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Guar94bAccountNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Guar94bAmount = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    Guar94bTakenDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Guar94bRepaidDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    FamilyLoanMemberName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FamilyLoanType = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FamilyLoanAccountNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FamilyLoanAmount = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    FamilyLoanTakenDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    FamilyLoanRepaidDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    OtherBankName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    OtherBankBranch = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    OtherBankLoanType = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    OtherBankAccountNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    OtherBankLoanAmount = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    OtherBankLoanTakenDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    OtherBankLoanRepaidDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    PlaceOfSign = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    DateOfSign = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_business_loan_borrowers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_business_loan_borrowers_business_loan_applications_Applicati~",
                        column: x => x.ApplicationId,
                        principalTable: "business_loan_applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "business_loan_business_info",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ApplicationId = table.Column<int>(type: "int", nullable: false),
                    BusinessNature = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    BusinessType = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    BusinessPropertyType = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FloorArea = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    FirmName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Address = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Address2 = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PinCode = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Phone = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Email = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PanCardNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    GumastaLicenseNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SalesTaxNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    VatNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ServiceTaxNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    OtherLicense = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    AllLicensesAvailable = table.Column<bool>(type: "tinyint(1)", nullable: true),
                    IsSmallIndustryResident = table.Column<bool>(type: "tinyint(1)", nullable: true),
                    SinceWhen = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Experience = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TotalAnnualIncome = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    TotalAnnualExpenses = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    NetAnnualIncome = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    Customer1Name = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Customer1Address = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Customer2Name = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Customer2Address = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Supplier1Name = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Supplier1Address = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Supplier2Name = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Supplier2Address = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Extra1 = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Extra2 = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Extra3 = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Extra4 = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_business_loan_business_info", x => x.Id);
                    table.ForeignKey(
                        name: "FK_business_loan_business_info_business_loan_applications_Appli~",
                        column: x => x.ApplicationId,
                        principalTable: "business_loan_applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "business_loan_collateral",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ApplicationId = table.Column<int>(type: "int", nullable: false),
                    PropertyType = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PropertyTypeOther = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PropertyAddress = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PropertyAddress2 = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PropertyPinCode = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PropertyTelephone = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PropertyMobile = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    GalaArea = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    BuildingConstructionYear = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CitySurveyNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PlotNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    WardNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CompletionCertDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    OcDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    ConveyanceDeedDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    HousingSocietyRegNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    MemberNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    LandArea = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    NaOrderDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    LandCitySurveyNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    LandPlotNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    LandWardNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    GutNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    HissaNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    EastBoundary = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    WestBoundary = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SouthBoundary = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    NorthBoundary = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    GovtValuation = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    MarketValue = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    InsuranceCompanyName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    InsuranceAddress = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    InsuranceAddress2 = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    InsurancePolicyNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    InsuranceFrom = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    InsuranceTo = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    InsuranceAmount = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    InsurancePremium = table.Column<decimal>(type: "decimal(65,30)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_business_loan_collateral", x => x.Id);
                    table.ForeignKey(
                        name: "FK_business_loan_collateral_business_loan_applications_Applicat~",
                        column: x => x.ApplicationId,
                        principalTable: "business_loan_applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "business_loan_extra_guarantors",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ApplicationId = table.Column<int>(type: "int", nullable: false),
                    GuarantorNumber = table.Column<int>(type: "int", nullable: false),
                    FrontendId = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PhotoBase64 = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FullName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Age = table.Column<int>(type: "int", nullable: true),
                    MemberNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SharesCount = table.Column<int>(type: "int", nullable: true),
                    SharesAmount = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    FatherHusbandName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FatherHusbandAge = table.Column<int>(type: "int", nullable: true),
                    MotherName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    MotherAge = table.Column<int>(type: "int", nullable: true),
                    ResidentialAddress = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PinCode = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Telephone = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Mobile = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Email = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PropertyTypes = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ResidenceMonths = table.Column<int>(type: "int", nullable: true),
                    ResidenceYears = table.Column<int>(type: "int", nullable: true),
                    MaritalStatus = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Dependents = table.Column<int>(type: "int", nullable: true),
                    CompanyName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CompanyAddress = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CompanyPinCode = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CompanyTelephone = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CompanyMobile = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CompanyEmail = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Department = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Designation = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    EmployeeCode = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    EmploymentMonths = table.Column<int>(type: "int", nullable: true),
                    EmploymentYears = table.Column<int>(type: "int", nullable: true),
                    RetirementDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    MonthlySalary = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    Deductions = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    NetSalary = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    AnnualBusinessIncome = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    TotalExpenses = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    NetAnnualIncome = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    FamilyIncome = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    FamilyIncomeType = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PropertyOwnerName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PropertyOwnerRelation = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    VillageMukkam = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    VillagePost = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    VillageTaluka = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    VillageDistrict = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    VillageState = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    VillagePinCode = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    VillageTelephone = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    VillageMobile = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PrevLoanType = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PrevLoanAccountNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PrevLoanAmount = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    PrevLoanTakenDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    PrevLoanRepaidDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Guar94aBorrowerName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Guar94aLoanType = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Guar94aAccountNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Guar94aAmount = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    Guar94aTakenDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Guar94aRepaidDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Guar94bBorrowerName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Guar94bLoanType = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Guar94bAccountNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Guar94bAmount = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    Guar94bTakenDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Guar94bRepaidDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    FamilyLoanMemberName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FamilyLoanType = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FamilyLoanAccountNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FamilyLoanAmount = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    FamilyLoanTakenDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    FamilyLoanRepaidDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    OtherBankName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    OtherBankBranch = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    OtherBankLoanType = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    OtherBankAccountNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    OtherBankLoanAmount = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    OtherBankLoanTakenDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    OtherBankLoanRepaidDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    PlaceOfSign = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    DateOfSign = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_business_loan_extra_guarantors", x => x.Id);
                    table.ForeignKey(
                        name: "FK_business_loan_extra_guarantors_business_loan_applications_Ap~",
                        column: x => x.ApplicationId,
                        principalTable: "business_loan_applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "business_loan_guarantors",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ApplicationId = table.Column<int>(type: "int", nullable: false),
                    GuarantorNumber = table.Column<int>(type: "int", nullable: false),
                    PhotoBase64 = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FullName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Age = table.Column<int>(type: "int", nullable: true),
                    MemberNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SharesCount = table.Column<int>(type: "int", nullable: true),
                    SharesAmount = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    FatherHusbandName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FatherHusbandAge = table.Column<int>(type: "int", nullable: true),
                    MotherName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    MotherAge = table.Column<int>(type: "int", nullable: true),
                    ResidentialAddress = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PinCode = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Telephone = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Mobile = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Email = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PropertyTypes = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ResidenceMonths = table.Column<int>(type: "int", nullable: true),
                    ResidenceYears = table.Column<int>(type: "int", nullable: true),
                    MaritalStatus = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Dependents = table.Column<int>(type: "int", nullable: true),
                    CompanyName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CompanyAddress = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CompanyPinCode = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CompanyTelephone = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CompanyMobile = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CompanyEmail = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Department = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Designation = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    EmployeeCode = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    EmploymentMonths = table.Column<int>(type: "int", nullable: true),
                    EmploymentYears = table.Column<int>(type: "int", nullable: true),
                    RetirementDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    MonthlySalary = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    Deductions = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    NetSalary = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    AnnualBusinessIncome = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    TotalExpenses = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    NetAnnualIncome = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    FamilyIncome = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    FamilyIncomeType = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PropertyOwnerName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PropertyOwnerRelation = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    VillageMukkam = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    VillagePost = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    VillageTaluka = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    VillageDistrict = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    VillageState = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    VillagePinCode = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    VillageTelephone = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    VillageMobile = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PrevLoanType = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PrevLoanAccountNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PrevLoanAmount = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    PrevLoanTakenDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    PrevLoanRepaidDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Guar94aBorrowerName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Guar94aLoanType = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Guar94aAccountNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Guar94aAmount = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    Guar94aTakenDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Guar94aRepaidDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Guar94bBorrowerName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Guar94bLoanType = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Guar94bAccountNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Guar94bAmount = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    Guar94bTakenDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Guar94bRepaidDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    FamilyLoanMemberName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FamilyLoanType = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FamilyLoanAccountNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FamilyLoanAmount = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    FamilyLoanTakenDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    FamilyLoanRepaidDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    OtherBankName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    OtherBankBranch = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    OtherBankLoanType = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    OtherBankAccountNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    OtherBankLoanAmount = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    OtherBankLoanTakenDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    OtherBankLoanRepaidDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    PlaceOfSign = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    DateOfSign = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_business_loan_guarantors", x => x.Id);
                    table.ForeignKey(
                        name: "FK_business_loan_guarantors_business_loan_applications_Applicat~",
                        column: x => x.ApplicationId,
                        principalTable: "business_loan_applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "business_loan_insurance_tax",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ApplicationId = table.Column<int>(type: "int", nullable: false),
                    InsuranceCompanyName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    InsuranceAddress = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    InsurancePolicyNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    InsuranceFrom = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    InsuranceTo = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    InsuranceAmount = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    InsurancePremium = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    InsurancePremiumFrequency = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    HasPolicyLoan = table.Column<bool>(type: "tinyint(1)", nullable: true),
                    PolicyLoanBankName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PolicyLoanBankAddress = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PolicyLoanAmount = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    PolicyLoanDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    PolicyLoanBalance = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    PanCardNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IncomeTaxSince = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ItYear1From = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ItYear1To = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ItAmount1 = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    ItDate1 = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    ItYear2From = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ItYear2To = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ItAmount2 = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    ItDate2 = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    ItYear3From = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ItYear3To = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ItAmount3 = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    ItDate3 = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    ProTaxNo = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ProTaxSince = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PtYear1From = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PtYear1To = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PtAmount1 = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    PtDate1 = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    PtYear2From = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PtYear2To = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PtAmount2 = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    PtDate2 = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    PtYear3From = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PtYear3To = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PtAmount3 = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    PtDate3 = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_business_loan_insurance_tax", x => x.Id);
                    table.ForeignKey(
                        name: "FK_business_loan_insurance_tax_business_loan_applications_Appli~",
                        column: x => x.ApplicationId,
                        principalTable: "business_loan_applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_business_loan_applications_ClientCode",
                table: "business_loan_applications",
                column: "ClientCode");

            migrationBuilder.CreateIndex(
                name: "IX_business_loan_applications_CreatedAt",
                table: "business_loan_applications",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_business_loan_applications_Status",
                table: "business_loan_applications",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_business_loan_borrowers_ApplicationId",
                table: "business_loan_borrowers",
                column: "ApplicationId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_business_loan_business_info_ApplicationId",
                table: "business_loan_business_info",
                column: "ApplicationId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_business_loan_collateral_ApplicationId",
                table: "business_loan_collateral",
                column: "ApplicationId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_business_loan_extra_guarantors_ApplicationId",
                table: "business_loan_extra_guarantors",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_business_loan_guarantors_ApplicationId_GuarantorNumber",
                table: "business_loan_guarantors",
                columns: new[] { "ApplicationId", "GuarantorNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_business_loan_insurance_tax_ApplicationId",
                table: "business_loan_insurance_tax",
                column: "ApplicationId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "business_loan_borrowers");

            migrationBuilder.DropTable(
                name: "business_loan_business_info");

            migrationBuilder.DropTable(
                name: "business_loan_collateral");

            migrationBuilder.DropTable(
                name: "business_loan_extra_guarantors");

            migrationBuilder.DropTable(
                name: "business_loan_guarantors");

            migrationBuilder.DropTable(
                name: "business_loan_insurance_tax");

            migrationBuilder.DropTable(
                name: "business_loan_applications");
        }
    }
}
