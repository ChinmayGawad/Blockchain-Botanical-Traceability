-- =============================================================================
-- FloraChain V2 — Schema alignment, data-integrity constraints & indexes
--
-- V1 created the initial schema, but several tables/columns drifted away from
-- the JPA entity model (the runtime source of truth). This migration reconciles
-- the physical schema with the entity mapping and hardens it with constraints
-- and indexes.
--
-- The statements below are written in the SQL subset understood by both
-- PostgreSQL (production) and H2 (development / test).
--
-- Assumption: the tables were created by V1 (or by an equivalent
-- `CREATE TABLE IF NOT EXISTS` schema). Databases that were provisioned by
-- Hibernate's schema export instead need a `flyway repair`/baseline before this
-- migration can run.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. certificates — date columns must be real DATE values, not VARCHAR
-- -----------------------------------------------------------------------------
ALTER TABLE certificates ADD COLUMN issue_date_tmp DATE;
UPDATE certificates SET issue_date_tmp = CAST(issue_date AS DATE) WHERE issue_date IS NOT NULL AND issue_date <> '';
ALTER TABLE certificates DROP COLUMN IF EXISTS issue_date;
ALTER TABLE certificates RENAME COLUMN issue_date_tmp TO issue_date;

ALTER TABLE certificates ADD COLUMN expiry_date_tmp DATE;
UPDATE certificates SET expiry_date_tmp = CAST(expiry_date AS DATE) WHERE expiry_date IS NOT NULL AND expiry_date <> '';
ALTER TABLE certificates DROP COLUMN IF EXISTS expiry_date;
ALTER TABLE certificates RENAME COLUMN expiry_date_tmp TO expiry_date;

-- -----------------------------------------------------------------------------
-- 2. processing_details — align columns with ProcessingDetailsEntity
-- -----------------------------------------------------------------------------
ALTER TABLE processing_details RENAME COLUMN processing_method TO method;
ALTER TABLE processing_details ADD COLUMN IF NOT EXISTS tx_hash VARCHAR(128);
ALTER TABLE processing_details DROP COLUMN IF EXISTS processor_org;
ALTER TABLE processing_details DROP COLUMN IF EXISTS processor_address;
ALTER TABLE processing_details DROP COLUMN IF EXISTS equipment_used;

CREATE TABLE IF NOT EXISTS processing_equipment (
    processing_id VARCHAR(64) NOT NULL,
    equipment_name VARCHAR(255),
    CONSTRAINT fk_processing_equipment FOREIGN KEY (processing_id) REFERENCES processing_details(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_processing_product ON processing_details(product_id);

-- -----------------------------------------------------------------------------
-- 3. lab_reports — qualitative test statuses replace legacy boolean flags
-- -----------------------------------------------------------------------------
ALTER TABLE lab_reports ADD COLUMN IF NOT EXISTS heavy_metals_status VARCHAR(16);
ALTER TABLE lab_reports ADD COLUMN IF NOT EXISTS microbial_test_status VARCHAR(16);
ALTER TABLE lab_reports ADD COLUMN IF NOT EXISTS pesticide_residue_status VARCHAR(16);
ALTER TABLE lab_reports ADD COLUMN IF NOT EXISTS overall_result VARCHAR(32);
ALTER TABLE lab_reports ADD COLUMN IF NOT EXISTS certificate_url VARCHAR(512);
ALTER TABLE lab_reports ADD COLUMN IF NOT EXISTS tx_hash VARCHAR(128);

UPDATE lab_reports SET heavy_metals_status = CASE WHEN heavy_metals_passed THEN 'PASS' ELSE 'FAIL' END
    WHERE heavy_metals_status IS NULL AND heavy_metals_passed IS NOT NULL;
UPDATE lab_reports SET microbial_test_status = CASE WHEN microbial_test_passed THEN 'PASS' ELSE 'FAIL' END
    WHERE microbial_test_status IS NULL AND microbial_test_passed IS NOT NULL;
UPDATE lab_reports SET pesticide_residue_status = CASE WHEN pesticide_residue_passed THEN 'PASS' ELSE 'FAIL' END
    WHERE pesticide_residue_status IS NULL AND pesticide_residue_passed IS NOT NULL;
UPDATE lab_reports SET overall_result = CASE WHEN overall_approved THEN 'APPROVED' ELSE 'REJECTED' END
    WHERE overall_result IS NULL AND overall_approved IS NOT NULL;

UPDATE lab_reports SET heavy_metals_status = 'PASS' WHERE heavy_metals_status IS NULL;
UPDATE lab_reports SET microbial_test_status = 'PASS' WHERE microbial_test_status IS NULL;
UPDATE lab_reports SET pesticide_residue_status = 'PASS' WHERE pesticide_residue_status IS NULL;
UPDATE lab_reports SET overall_result = 'APPROVED' WHERE overall_result IS NULL;

ALTER TABLE lab_reports ALTER COLUMN heavy_metals_status SET NOT NULL;
ALTER TABLE lab_reports ALTER COLUMN microbial_test_status SET NOT NULL;
ALTER TABLE lab_reports ALTER COLUMN pesticide_residue_status SET NOT NULL;
ALTER TABLE lab_reports ALTER COLUMN overall_result SET NOT NULL;

ALTER TABLE lab_reports DROP COLUMN IF EXISTS heavy_metals_passed;
ALTER TABLE lab_reports DROP COLUMN IF EXISTS microbial_test_passed;
ALTER TABLE lab_reports DROP COLUMN IF EXISTS pesticide_residue_passed;
ALTER TABLE lab_reports DROP COLUMN IF EXISTS overall_approved;
ALTER TABLE lab_reports DROP COLUMN IF EXISTS lab_address;

CREATE INDEX IF NOT EXISTS idx_lab_reports_product ON lab_reports(product_id);

-- -----------------------------------------------------------------------------
-- 4. lab_test_parameters — align with LabTestParameterEntity (IDENTITY pk)
-- -----------------------------------------------------------------------------
ALTER TABLE lab_test_parameters RENAME COLUMN parameter_name TO name;
ALTER TABLE lab_test_parameters RENAME COLUMN measured_value TO param_value;
ALTER TABLE lab_test_parameters RENAME COLUMN acceptable_range TO standard_limit;

-- The legacy table used a VARCHAR surrogate key without a primary key. Rebuild it
-- with the identity key the entity mapping expects while preserving the rows.
CREATE TABLE lab_test_parameters_new (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    param_value VARCHAR(64) NOT NULL,
    unit VARCHAR(32) NOT NULL,
    standard_limit VARCHAR(64) NOT NULL,
    passed BOOLEAN NOT NULL,
    lab_report_id VARCHAR(64),
    CONSTRAINT fk_param_lab_report_v2 FOREIGN KEY (lab_report_id) REFERENCES lab_reports(id) ON DELETE CASCADE
);

INSERT INTO lab_test_parameters_new (name, param_value, unit, standard_limit, passed, lab_report_id)
    SELECT name, COALESCE(param_value, '0'), COALESCE(unit, ''), COALESCE(standard_limit, ''), COALESCE(passed, TRUE), lab_report_id
    FROM lab_test_parameters;

DROP TABLE lab_test_parameters;
ALTER TABLE lab_test_parameters_new RENAME TO lab_test_parameters;

-- -----------------------------------------------------------------------------
-- 5. shipments — align with ShipmentEntity
-- -----------------------------------------------------------------------------
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS expected_delivery_date DATE;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS actual_delivery_date DATE;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS status VARCHAR(32);
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS tx_hash VARCHAR(128);

UPDATE shipments SET expected_delivery_date = COALESCE(delivery_date, dispatch_date) WHERE expected_delivery_date IS NULL;
UPDATE shipments SET actual_delivery_date = delivery_date WHERE actual_delivery_date IS NULL AND delivery_date IS NOT NULL;
UPDATE shipments SET status = CASE WHEN is_delivered THEN 'DELIVERED' ELSE 'IN_TRANSIT' END WHERE status IS NULL;
UPDATE shipments SET tracking_number = 'TRK-MIGRATED-' || id WHERE tracking_number IS NULL OR tracking_number = '';
UPDATE shipments SET temperature_range = '15C - 25C' WHERE temperature_range IS NULL;

ALTER TABLE shipments ALTER COLUMN expected_delivery_date SET NOT NULL;
ALTER TABLE shipments ALTER COLUMN status SET NOT NULL;
ALTER TABLE shipments ALTER COLUMN tracking_number SET NOT NULL;
ALTER TABLE shipments ALTER COLUMN temperature_range SET NOT NULL;

ALTER TABLE shipments DROP COLUMN IF EXISTS shipment_id;
ALTER TABLE shipments DROP COLUMN IF EXISTS delivery_date;
ALTER TABLE shipments DROP COLUMN IF EXISTS is_delivered;
ALTER TABLE shipments DROP COLUMN IF EXISTS distributor_address;

CREATE INDEX IF NOT EXISTS idx_shipment_product ON shipments(product_id);
CREATE INDEX IF NOT EXISTS idx_shipment_tracking ON shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipment_distributor ON shipments(distributor_id);

-- -----------------------------------------------------------------------------
-- 6. retail_records -> retail_details (entity table name)
-- -----------------------------------------------------------------------------
ALTER TABLE retail_records RENAME TO retail_details;

ALTER TABLE retail_details ADD COLUMN IF NOT EXISTS shelf_batch_id VARCHAR(64);
ALTER TABLE retail_details ADD COLUMN IF NOT EXISTS unit_price DOUBLE PRECISION;
ALTER TABLE retail_details ADD COLUMN IF NOT EXISTS qr_code_generated BOOLEAN;
ALTER TABLE retail_details ADD COLUMN IF NOT EXISTS notes VARCHAR(1000);
ALTER TABLE retail_details ADD COLUMN IF NOT EXISTS tx_hash VARCHAR(128);

UPDATE retail_details SET unit_price = CAST(retail_price AS DOUBLE PRECISION)
    WHERE unit_price IS NULL AND retail_price IS NOT NULL AND retail_price <> '';
UPDATE retail_details SET unit_price = 0.0 WHERE unit_price IS NULL;
UPDATE retail_details SET qr_code_generated = FALSE WHERE qr_code_generated IS NULL;

ALTER TABLE retail_details ALTER COLUMN unit_price SET NOT NULL;
ALTER TABLE retail_details ALTER COLUMN qr_code_generated SET NOT NULL;

ALTER TABLE retail_details DROP COLUMN IF EXISTS shelf_location;
ALTER TABLE retail_details DROP COLUMN IF EXISTS retail_price;
ALTER TABLE retail_details DROP COLUMN IF EXISTS retailer_address;

CREATE INDEX IF NOT EXISTS idx_retail_details_product ON retail_details(product_id);

-- -----------------------------------------------------------------------------
-- 7. blockchain_transactions — endorsing peers collection table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tx_endorsing_peers (
    tx_id VARCHAR(128) NOT NULL,
    peer_name VARCHAR(255),
    CONSTRAINT fk_tx_peers FOREIGN KEY (tx_id) REFERENCES blockchain_transactions(tx_id) ON DELETE CASCADE
);

INSERT INTO tx_endorsing_peers (tx_id, peer_name)
    SELECT btx.tx_id, btp.peer FROM blockchain_transaction_peers btp
    JOIN blockchain_transactions btx ON btx.tx_id = btp.tx_id
    WHERE btp.peer IS NOT NULL;

DROP TABLE IF EXISTS blockchain_transaction_peers;

-- -----------------------------------------------------------------------------
-- 8. suspicious_reports — align with SuspiciousReportEntity
-- -----------------------------------------------------------------------------
ALTER TABLE suspicious_reports RENAME COLUMN timestamp TO reported_at;

ALTER TABLE suspicious_reports ADD COLUMN IF NOT EXISTS product_id VARCHAR(64);
ALTER TABLE suspicious_reports ADD COLUMN IF NOT EXISTS description VARCHAR(2000);
ALTER TABLE suspicious_reports ADD COLUMN IF NOT EXISTS reporter_email VARCHAR(128);
ALTER TABLE suspicious_reports ADD COLUMN IF NOT EXISTS admin_notes VARCHAR(1000);

UPDATE suspicious_reports SET product_id = batch_id WHERE product_id IS NULL;
UPDATE suspicious_reports SET description = 'Suspicious activity reported for batch ' || batch_id WHERE description IS NULL;
UPDATE suspicious_reports SET reporter_email = 'unknown@florachain.org' WHERE reporter_email IS NULL;
UPDATE suspicious_reports SET admin_notes = resolution_notes WHERE admin_notes IS NULL AND resolution_notes IS NOT NULL;

ALTER TABLE suspicious_reports ALTER COLUMN product_id SET NOT NULL;
ALTER TABLE suspicious_reports ALTER COLUMN description SET NOT NULL;
ALTER TABLE suspicious_reports ALTER COLUMN reporter_email SET NOT NULL;
ALTER TABLE suspicious_reports ALTER COLUMN reported_at SET NOT NULL;

ALTER TABLE suspicious_reports DROP COLUMN IF EXISTS report_id;
ALTER TABLE suspicious_reports DROP COLUMN IF EXISTS reporter_address;
ALTER TABLE suspicious_reports DROP COLUMN IF EXISTS evidence_ipfs_cid;
ALTER TABLE suspicious_reports DROP COLUMN IF EXISTS resolution_notes;
ALTER TABLE suspicious_reports DROP COLUMN IF EXISTS resolved_by;
ALTER TABLE suspicious_reports DROP COLUMN IF EXISTS resolved_at;

CREATE INDEX IF NOT EXISTS idx_report_product ON suspicious_reports(product_id);
CREATE INDEX IF NOT EXISTS idx_report_status ON suspicious_reports(status);
CREATE INDEX IF NOT EXISTS idx_report_batch ON suspicious_reports(batch_id);
CREATE INDEX IF NOT EXISTS idx_report_created ON suspicious_reports(reported_at);

-- -----------------------------------------------------------------------------
-- 9. Core integrity constraints and lookup indexes
-- -----------------------------------------------------------------------------
ALTER TABLE products ALTER COLUMN quantity_kg SET NOT NULL;
ALTER TABLE products ALTER COLUMN batch_id SET NOT NULL;
ALTER TABLE users ALTER COLUMN email SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_batch_unique ON products(batch_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users(email);
CREATE INDEX IF NOT EXISTS idx_timeline_product_stage ON timeline_events(product_id, stage);
CREATE INDEX IF NOT EXISTS idx_bctx_product_stage ON blockchain_transactions(product_id, stage);

ALTER TABLE products ADD CONSTRAINT chk_products_quantity_positive CHECK (quantity_kg > 0);
ALTER TABLE processing_details ADD CONSTRAINT chk_processing_quantities CHECK (initial_quantity_kg >= 0 AND processed_quantity_kg >= 0);
ALTER TABLE processing_details ADD CONSTRAINT chk_processing_yield_loss CHECK (yield_loss_percentage >= 0 AND yield_loss_percentage <= 100);
ALTER TABLE lab_reports ADD CONSTRAINT chk_lab_purity_range CHECK (purity_percentage >= 0 AND purity_percentage <= 100);
ALTER TABLE lab_reports ADD CONSTRAINT chk_lab_moisture_range CHECK (moisture_percentage >= 0 AND moisture_percentage <= 100);
ALTER TABLE retail_details ADD CONSTRAINT chk_retail_unit_price CHECK (unit_price >= 0);
