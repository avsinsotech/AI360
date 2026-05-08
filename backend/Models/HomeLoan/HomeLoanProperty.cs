using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TushGptBackend.Models.HomeLoan
{
    [Table("home_loan_properties")]
    public class HomeLoanProperty
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int HomeLoanRequestId { get; set; }

        [Column(TypeName = "longtext")]
        public string PropertyType { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string VendorName { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string PropertyAddress { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string HousingSocietyName { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string FlatNo { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string Floor { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string Wing { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string PlotNo { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string NagarSector { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string RoadName { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string Suburb { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string District { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string PinCode { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string HousingRegNo { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string HousingMemberNo { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string ShareCertNo { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string SharesFrom { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string SharesTo { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string Area { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string AreaType { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string BoundaryEast { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string BoundaryWest { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string BoundarySouth { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string BoundaryNorth { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string BuildingYear { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string SurveyNo { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string HissaNo { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string GatNo { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string MunicipalNo { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string OcReceived { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string OcDate { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string ConveyanceDeed { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string ConveyanceDeedDate { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string TotalPurchasePrice { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string AmountPaid { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string BalancePayable { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string MortgageDetails { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string GovtValuation { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string MarketValuation { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string BuilderFirmName { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string UnderConstrAddress { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string BuildingPlanApproved { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string ConstructionNature { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string ConstArea { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string ConstAreaType { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string ConstBoundaryEast { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string ConstBoundaryWest { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string ConstBoundarySouth { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string ConstBoundaryNorth { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string ConstPlotNo { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string ConstSurveyNo { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string ConstGatNo { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string ConstHissaNo { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string ConstMunicipalNo { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string AgreementDate { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string StampDuty { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string RegistrationAmount { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string ConstTotalPrice { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string ConstAmountPaid { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string ConstBalancePayable { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CollateralJson { get; set; } = "[]";

        // Step 6 Collateral Property Details
        [Column(TypeName = "longtext")]
        public string CollateralHousingNaav { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CollateralFlatNo { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CollateralFloor { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CollateralWing { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CollateralPlotNo { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CollateralNagarSector { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CollateralRoadName { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CollateralSuburb { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CollateralDistrict { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CollateralPinCode { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CollateralHousingRegNo { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CollateralHousingMemberNo { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CollateralShareCertNo { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CollateralSharesFrom { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CollateralSharesTo { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CollateralArea { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CollateralAreaType { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CollateralBoundaryEast { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CollateralBoundaryWest { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CollateralBoundarySouth { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CollateralBoundaryNorth { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CollateralBuildingYear { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CollateralSurveyNo { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CollateralHissaNo { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CollateralGatNo { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CollateralMunicipalNo { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CollateralOcReceived { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CollateralOcDate { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CollateralConveyanceDeed { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CollateralConveyanceDeedDate { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CollateralGovtValuation { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CollateralMarketValuation { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string CollateralRemarks { get; set; } = string.Empty;

        [Column(TypeName = "longtext")]
        public string FixedAssetsJson { get; set; } = "[]";

        [Column(TypeName = "longtext")]
        public string CurrentLoansJson { get; set; } = "[]";

        // Navigation Properties
        [ForeignKey("HomeLoanRequestId")]
        [System.Text.Json.Serialization.JsonIgnore]
        public virtual HomeLoanRequest? Request { get; set; }
    }
}
