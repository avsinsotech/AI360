-- ============================================================
-- RocketPay Mandate V4 — Database Migration Script
-- Run this script on your existing MySQL database:
--   loan_scrutiny_system
-- This script is idempotent (uses IF NOT EXISTS)
-- ============================================================

-- 1. Mandates (main table)
CREATE TABLE IF NOT EXISTS `rocketpay_mandates` (
    `id`                         VARCHAR(100) NOT NULL,
    `deleted`                    TINYINT(1) NOT NULL DEFAULT 0,
    `created_at`                 BIGINT NOT NULL DEFAULT 0,
    `updated_at`                 BIGINT NOT NULL DEFAULT 0,
    `created_by`                 VARCHAR(100) NULL,
    `updated_by`                 VARCHAR(100) NULL,
    `reference_id`               VARCHAR(200) NULL,
    `reference_type`             VARCHAR(100) NULL,
    `approval_amount`            DOUBLE NOT NULL DEFAULT 0,
    `advance_amount`             DOUBLE NOT NULL DEFAULT 0,
    `frequency`                  VARCHAR(50) NULL,
    `start_date`                 VARCHAR(20) NULL,
    `end_date`                   VARCHAR(20) NULL,
    `time_zone`                  VARCHAR(100) NULL,
    `installment_count`          INT NOT NULL DEFAULT 0,
    `state`                      VARCHAR(50) NULL,
    `payment_order_id`           VARCHAR(100) NULL,
    `mms_id`                     VARCHAR(100) NULL,
    `mandate_auth_checkout_url`  VARCHAR(500) NULL,
    `enterprise_id`              VARCHAR(100) NULL,
    `enterprise_handler_entity`  VARCHAR(100) NULL,
    `client_meta_description`    VARCHAR(500) NULL,
    `raw_json`                   LONGTEXT NULL,
    `local_created_at`           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `local_updated_at`           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Mandate Payers (one per mandate)
CREATE TABLE IF NOT EXISTS `mandate_payers` (
    `id`                         INT NOT NULL AUTO_INCREMENT,
    `mandate_id`                 VARCHAR(100) NOT NULL,
    `tag`                        VARCHAR(100) NULL,
    `mode`                       VARCHAR(50) NULL,
    `amount_value`               DOUBLE NOT NULL DEFAULT 0,
    `amount_currency`            VARCHAR(10) NULL,
    `account_id`                 VARCHAR(100) NULL,
    `mobile_number`              VARCHAR(20) NULL,
    `name`                       VARCHAR(200) NULL,
    `instrument_id`              VARCHAR(100) NULL,
    `ifsc`                       VARCHAR(20) NULL,
    `bank_code`                  VARCHAR(20) NULL,
    `branch_name`                VARCHAR(200) NULL,
    `account_number`             VARCHAR(100) NULL,
    `account_holder_name_at_bank` VARCHAR(200) NULL,
    `account_holder_name`        VARCHAR(200) NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_mandate_payer_mandate` FOREIGN KEY (`mandate_id`)
        REFERENCES `rocketpay_mandates`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Mandate Payees (multiple per mandate)
CREATE TABLE IF NOT EXISTS `mandate_payees` (
    `id`                         INT NOT NULL AUTO_INCREMENT,
    `mandate_id`                 VARCHAR(100) NOT NULL,
    `tag`                        VARCHAR(100) NULL,
    `mode`                       VARCHAR(50) NULL,
    `amount_value`               DOUBLE NOT NULL DEFAULT 0,
    `amount_currency`            VARCHAR(10) NULL,
    `account_id`                 VARCHAR(100) NULL,
    `mobile_number`              VARCHAR(20) NULL,
    `name`                       VARCHAR(200) NULL,
    `instrument_id`              VARCHAR(100) NULL,
    `ifsc`                       VARCHAR(20) NULL,
    `bank_code`                  VARCHAR(20) NULL,
    `branch_name`                VARCHAR(200) NULL,
    `account_number`             VARCHAR(100) NULL,
    `account_holder_name_at_bank` VARCHAR(200) NULL,
    `account_holder_name`        VARCHAR(200) NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_mandate_payee_mandate` FOREIGN KEY (`mandate_id`)
        REFERENCES `rocketpay_mandates`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Mandate Transactions
CREATE TABLE IF NOT EXISTS `mandate_transactions` (
    `id`                    INT NOT NULL AUTO_INCREMENT,
    `mandate_id`            VARCHAR(100) NOT NULL,
    `txn_id`                VARCHAR(100) NULL,
    `utr`                   VARCHAR(200) NULL,
    `state`                 VARCHAR(50) NULL,
    `medium`                VARCHAR(50) NULL,
    `txn_created_at`        BIGINT NULL,
    `generic_error`         VARCHAR(500) NULL,
    `umrn`                  VARCHAR(100) NULL,
    `sub_state`             VARCHAR(100) NULL,
    `gateway_name`          VARCHAR(100) NULL,
    `gateway_reference_id`  VARCHAR(200) NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_mandate_txn_mandate` FOREIGN KEY (`mandate_id`)
        REFERENCES `rocketpay_mandates`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Installments (main table)
CREATE TABLE IF NOT EXISTS `rocketpay_installments` (
    `id`                      VARCHAR(100) NOT NULL,
    `deleted`                 TINYINT(1) NOT NULL DEFAULT 0,
    `created_at`              BIGINT NOT NULL DEFAULT 0,
    `updated_at`              BIGINT NOT NULL DEFAULT 0,
    `created_by`              VARCHAR(100) NULL,
    `updated_by`              VARCHAR(100) NULL,
    `reference_id`            VARCHAR(200) NULL,
    `reference_type`          VARCHAR(100) NULL,
    `mandate_id`              VARCHAR(100) NULL,
    `due_date`                VARCHAR(20) NULL,
    `schedule_date`           VARCHAR(20) NULL,
    `time_zone`               VARCHAR(100) NULL,
    `state`                   VARCHAR(50) NULL,
    `payment_order_id`        VARCHAR(100) NULL,
    `mms_id`                  VARCHAR(100) NULL,
    `client_meta_description` VARCHAR(500) NULL,
    `raw_json`                LONGTEXT NULL,
    `local_created_at`        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `local_updated_at`        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_installment_mandate_id` (`mandate_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Installment Payers (one per installment)
CREATE TABLE IF NOT EXISTS `installment_payers` (
    `id`                          INT NOT NULL AUTO_INCREMENT,
    `installment_id`              VARCHAR(100) NOT NULL,
    `tag`                         VARCHAR(100) NULL,
    `mode`                        VARCHAR(50) NULL,
    `amount_value`                DOUBLE NOT NULL DEFAULT 0,
    `amount_currency`             VARCHAR(10) NULL,
    `account_id`                  VARCHAR(100) NULL,
    `mobile_number`               VARCHAR(20) NULL,
    `name`                        VARCHAR(200) NULL,
    `instrument_id`               VARCHAR(100) NULL,
    `ifsc`                        VARCHAR(20) NULL,
    `bank_code`                   VARCHAR(20) NULL,
    `branch_name`                 VARCHAR(200) NULL,
    `account_number`              VARCHAR(100) NULL,
    `account_holder_name_at_bank` VARCHAR(200) NULL,
    `account_holder_name`         VARCHAR(200) NULL,
    `vpa`                         VARCHAR(200) NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_inst_payer_inst` FOREIGN KEY (`installment_id`)
        REFERENCES `rocketpay_installments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Installment Payees (multiple per installment)
CREATE TABLE IF NOT EXISTS `installment_payees` (
    `id`                          INT NOT NULL AUTO_INCREMENT,
    `installment_id`              VARCHAR(100) NOT NULL,
    `tag`                         VARCHAR(100) NULL,
    `mode`                        VARCHAR(50) NULL,
    `amount_value`                DOUBLE NOT NULL DEFAULT 0,
    `amount_currency`             VARCHAR(10) NULL,
    `account_id`                  VARCHAR(100) NULL,
    `mobile_number`               VARCHAR(20) NULL,
    `name`                        VARCHAR(200) NULL,
    `instrument_id`               VARCHAR(100) NULL,
    `ifsc`                        VARCHAR(20) NULL,
    `bank_code`                   VARCHAR(20) NULL,
    `branch_name`                 VARCHAR(200) NULL,
    `account_number`              VARCHAR(100) NULL,
    `account_holder_name_at_bank` VARCHAR(200) NULL,
    `account_holder_name`         VARCHAR(200) NULL,
    `vpa`                         VARCHAR(200) NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_inst_payee_inst` FOREIGN KEY (`installment_id`)
        REFERENCES `rocketpay_installments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Installment Transactions
CREATE TABLE IF NOT EXISTS `installment_transactions` (
    `id`                    INT NOT NULL AUTO_INCREMENT,
    `installment_id`        VARCHAR(100) NOT NULL,
    `txn_id`                VARCHAR(100) NULL,
    `utr`                   VARCHAR(200) NULL,
    `state`                 VARCHAR(50) NULL,
    `medium`                VARCHAR(50) NULL,
    `txn_created_at`        BIGINT NULL,
    `generic_error`         VARCHAR(500) NULL,
    `umrn`                  VARCHAR(100) NULL,
    `sub_state`             VARCHAR(100) NULL,
    `sub_state_reason`      VARCHAR(500) NULL,
    `sub_state_timestamp`   VARCHAR(100) NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_inst_txn_inst` FOREIGN KEY (`installment_id`)
        REFERENCES `rocketpay_installments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Verification: check tables were created
-- ============================================================
-- SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
-- WHERE TABLE_SCHEMA = 'loan_scrutiny_system'
--   AND TABLE_NAME IN (
--     'rocketpay_mandates','mandate_payers','mandate_payees','mandate_transactions',
--     'rocketpay_installments','installment_payers','installment_payees','installment_transactions'
--   );
