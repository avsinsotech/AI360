START TRANSACTION;

ALTER TABLE `gold_loan_deductions` DROP COLUMN `AccNo`;

ALTER TABLE `personal_loan_guarantor2_info` MODIFY COLUMN `SharesCount` bigint NULL;

ALTER TABLE `personal_loan_guarantor2_info` MODIFY COLUMN `MotherAge` bigint NULL;

ALTER TABLE `personal_loan_guarantor2_info` MODIFY COLUMN `FatherHusbandAge` bigint NULL;

ALTER TABLE `personal_loan_guarantor2_info` MODIFY COLUMN `DurationYears` bigint NULL;

ALTER TABLE `personal_loan_guarantor2_info` MODIFY COLUMN `DurationMonths` bigint NULL;

ALTER TABLE `personal_loan_guarantor2_info` MODIFY COLUMN `DependentsCount` bigint NULL;

ALTER TABLE `personal_loan_guarantor2_info` MODIFY COLUMN `Age` bigint NULL;

ALTER TABLE `personal_loan_guarantor1_info` MODIFY COLUMN `SharesCount` bigint NULL;

ALTER TABLE `personal_loan_guarantor1_info` MODIFY COLUMN `ServiceYears` bigint NULL;

ALTER TABLE `personal_loan_guarantor1_info` MODIFY COLUMN `ServiceMonths` bigint NULL;

ALTER TABLE `personal_loan_guarantor1_info` MODIFY COLUMN `MotherAge` bigint NULL;

ALTER TABLE `personal_loan_guarantor1_info` MODIFY COLUMN `FatherHusbandAge` bigint NULL;

ALTER TABLE `personal_loan_guarantor1_info` MODIFY COLUMN `DurationYears` bigint NULL;

ALTER TABLE `personal_loan_guarantor1_info` MODIFY COLUMN `DurationMonths` bigint NULL;

ALTER TABLE `personal_loan_guarantor1_info` MODIFY COLUMN `DependentsCount` bigint NULL;

ALTER TABLE `personal_loan_guarantor1_info` MODIFY COLUMN `Age` bigint NULL;

ALTER TABLE `personal_loan_borrower_info` MODIFY COLUMN `SharesCount` bigint NULL;

ALTER TABLE `personal_loan_borrower_info` MODIFY COLUMN `ServiceYears` bigint NULL;

ALTER TABLE `personal_loan_borrower_info` MODIFY COLUMN `ServiceMonths` bigint NULL;

ALTER TABLE `personal_loan_borrower_info` MODIFY COLUMN `MotherAge` bigint NULL;

ALTER TABLE `personal_loan_borrower_info` MODIFY COLUMN `FatherHusbandAge` bigint NULL;

ALTER TABLE `personal_loan_borrower_info` MODIFY COLUMN `DurationYears` bigint NULL;

ALTER TABLE `personal_loan_borrower_info` MODIFY COLUMN `DurationMonths` bigint NULL;

ALTER TABLE `personal_loan_borrower_info` MODIFY COLUMN `DependentsCount` bigint NULL;

ALTER TABLE `personal_loan_borrower_info` MODIFY COLUMN `Age` bigint NULL;

ALTER TABLE `personal_loan_applications` MODIFY COLUMN `RepaymentPeriodMonths` bigint NULL;

ALTER TABLE `personal_loan_applications` MODIFY COLUMN `InstallmentDay` bigint NULL;

ALTER TABLE `personal_loan_applications` MODIFY COLUMN `Guarantor3AgeSummary` bigint NULL;

ALTER TABLE `personal_loan_applications` MODIFY COLUMN `Guarantor2AgeSummary` bigint NULL;

ALTER TABLE `personal_loan_applications` MODIFY COLUMN `Guarantor1AgeSummary` bigint NULL;

ALTER TABLE `personal_loan_applications` MODIFY COLUMN `FirstInstallmentAfterMonths` bigint NULL;

ALTER TABLE `personal_loan_applications` MODIFY COLUMN `DependentsCount` bigint NULL;

ALTER TABLE `personal_loan_applications` MODIFY COLUMN `CoApplicantAge` bigint NULL;

ALTER TABLE `personal_loan_applications` MODIFY COLUMN `Age` bigint NULL;

ALTER TABLE `personal_loan_applications` ADD `InterestRate` decimal(65,30) NULL;

ALTER TABLE `gold_loan_deductions` ADD `Charges` decimal(65,30) NULL;

ALTER TABLE `gold_loan_deductions` ADD `Per` decimal(65,30) NULL;

CREATE TABLE `GoldDedmaster` (
    `BRCD` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
    `SRNO` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
    `SUBGLCODE` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
    `DEDTYPE` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
    `DTYPE` int NULL,
    `PER` decimal(65,30) NULL,
    `CHARGES` decimal(65,30) NULL,
    `FROMAMT` decimal(65,30) NULL,
    `TOAMT` decimal(65,30) NULL,
    `STAGE` longtext CHARACTER SET utf8mb4 NULL,
    `EFFECTDATE` datetime(6) NULL,
    `MID` longtext CHARACTER SET utf8mb4 NULL,
    `CID` longtext CHARACTER SET utf8mb4 NULL,
    `VID` longtext CHARACTER SET utf8mb4 NULL,
    `DedEnable` longtext CHARACTER SET utf8mb4 NULL,
    `MINVALUE` int NULL,
    `MAXVALUE` int NULL,
    CONSTRAINT `PK_GoldDedmaster` PRIMARY KEY (`BRCD`, `SRNO`, `SUBGLCODE`, `DEDTYPE`)
) CHARACTER SET=utf8mb4;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260416060006_AddInterestRateAndFixOverflowToPersonalLoanV2', '8.0.2');

COMMIT;

