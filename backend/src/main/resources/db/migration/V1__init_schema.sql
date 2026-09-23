-- =============================================================================
-- FloraChain Production Database Schema Migration (V1)
-- Enterprise Botanical Traceability Platform
-- =============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    email VARCHAR(128) NOT NULL UNIQUE,
    password VARCHAR(256) NOT NULL,
    role VARCHAR(32) NOT NULL,
    organization VARCHAR(150),
    location VARCHAR(150),
    status VARCHAR(32) NOT NULL,
    joined_date DATE NOT NULL,
    avatar_url VARCHAR(512),
    wallet_address VARCHAR(64),
    aadhaar_hash VARCHAR(64),
    aadhaar_masked VARCHAR(20)
);

CREATE INDEX IF NOT EXISTS idx_user_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_user_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_user_aadhaar_hash ON users(aadhaar_hash);

-- User Certifications Collection Table
CREATE TABLE IF NOT EXISTS user_certifications (
    user_id VARCHAR(64) NOT NULL,
    certification VARCHAR(255),
    CONSTRAINT fk_user_cert FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    batch_id VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    botanical_name VARCHAR(200) NOT NULL,
    category VARCHAR(32) NOT NULL,
    cultivation_method VARCHAR(32) NOT NULL,
    quantity_kg DOUBLE PRECISION NOT NULL,
    harvest_date DATE NOT NULL,
    farm_location VARCHAR(256) NOT NULL,
    gps_lat DOUBLE PRECISION,
    gps_lng DOUBLE PRECISION,
    farmer_id VARCHAR(64) NOT NULL,
    farmer_name VARCHAR(150) NOT NULL,
    farmer_org VARCHAR(150),
    status VARCHAR(32) NOT NULL,
    verification_state VARCHAR(32) NOT NULL,
    qr_code_value VARCHAR(512),
    description VARCHAR(2000),
    image_url VARCHAR(512),
    created_timestamp TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_product_batch_id ON products(batch_id);
CREATE INDEX IF NOT EXISTS idx_product_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_product_farmer ON products(farmer_id);
CREATE INDEX IF NOT EXISTS idx_product_category ON products(category);

-- Product Active Compounds Collection Table
CREATE TABLE IF NOT EXISTS product_active_compounds (
    product_id VARCHAR(64) NOT NULL,
    compound_name VARCHAR(255),
    CONSTRAINT fk_product_compounds FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 3. Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
    id VARCHAR(64) PRIMARY KEY,
    type VARCHAR(150) NOT NULL,
    certificate_number VARCHAR(150) NOT NULL,
    issuing_authority VARCHAR(200) NOT NULL,
    issue_date VARCHAR(64),
    expiry_date VARCHAR(64),
    ipfs_cid VARCHAR(256),
    status VARCHAR(32) NOT NULL,
    product_id VARCHAR(64),
    CONSTRAINT fk_cert_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 4. Processing Details Table
CREATE TABLE IF NOT EXISTS processing_details (
    id VARCHAR(64) PRIMARY KEY,
    processor_id VARCHAR(64) NOT NULL,
    processor_name VARCHAR(150) NOT NULL,
    processor_org VARCHAR(150),
    facility_location VARCHAR(256) NOT NULL,
    processing_method VARCHAR(150) NOT NULL,
    initial_quantity_kg DOUBLE PRECISION NOT NULL,
    processed_quantity_kg DOUBLE PRECISION NOT NULL,
    yield_loss_percentage DOUBLE PRECISION NOT NULL,
    processing_date DATE NOT NULL,
    equipment_used VARCHAR(256),
    ipfs_document_cid VARCHAR(256),
    notes VARCHAR(2000),
    processor_address VARCHAR(64),
    product_id VARCHAR(64) UNIQUE,
    CONSTRAINT fk_proc_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 5. Lab Reports Table
CREATE TABLE IF NOT EXISTS lab_reports (
    id VARCHAR(64) PRIMARY KEY,
    lab_id VARCHAR(64) NOT NULL,
    lab_name VARCHAR(150) NOT NULL,
    tested_by VARCHAR(150) NOT NULL,
    test_date DATE NOT NULL,
    purity_percentage DOUBLE PRECISION NOT NULL,
    moisture_percentage DOUBLE PRECISION NOT NULL,
    heavy_metals_passed BOOLEAN NOT NULL,
    microbial_test_passed BOOLEAN NOT NULL,
    pesticide_residue_passed BOOLEAN NOT NULL,
    certificate_ipfs_cid VARCHAR(256),
    overall_approved BOOLEAN NOT NULL,
    lab_address VARCHAR(64),
    notes VARCHAR(2000),
    product_id VARCHAR(64) UNIQUE,
    CONSTRAINT fk_lab_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Lab Test Parameters Table
CREATE TABLE IF NOT EXISTS lab_test_parameters (
    id VARCHAR(64) PRIMARY KEY,
    parameter_name VARCHAR(150) NOT NULL,
    measured_value VARCHAR(64) NOT NULL,
    unit VARCHAR(32),
    acceptable_range VARCHAR(64),
    passed BOOLEAN NOT NULL,
    lab_report_id VARCHAR(64),
    CONSTRAINT fk_param_lab_report FOREIGN KEY (lab_report_id) REFERENCES lab_reports(id) ON DELETE CASCADE
);

-- 6. Shipments Table
CREATE TABLE IF NOT EXISTS shipments (
    id VARCHAR(64) PRIMARY KEY,
    shipment_id VARCHAR(64) NOT NULL,
    distributor_id VARCHAR(64) NOT NULL,
    distributor_name VARCHAR(150) NOT NULL,
    source_location VARCHAR(256) NOT NULL,
    destination_location VARCHAR(256) NOT NULL,
    vehicle_number VARCHAR(64) NOT NULL,
    transport_type VARCHAR(32) NOT NULL,
    temperature_range VARCHAR(64),
    tracking_number VARCHAR(128),
    dispatch_date DATE NOT NULL,
    delivery_date DATE,
    is_delivered BOOLEAN NOT NULL DEFAULT FALSE,
    distributor_address VARCHAR(64),
    product_id VARCHAR(64) UNIQUE,
    CONSTRAINT fk_shipment_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 7. Retail Records Table
CREATE TABLE IF NOT EXISTS retail_records (
    id VARCHAR(64) PRIMARY KEY,
    retailer_id VARCHAR(64) NOT NULL,
    retailer_name VARCHAR(150) NOT NULL,
    store_location VARCHAR(256) NOT NULL,
    shelf_location VARCHAR(64),
    received_date DATE NOT NULL,
    retail_price VARCHAR(64),
    retailer_address VARCHAR(64),
    product_id VARCHAR(64) UNIQUE,
    CONSTRAINT fk_retail_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 8. Timeline Events Table
CREATE TABLE IF NOT EXISTS timeline_events (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    stage VARCHAR(64) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    actor_name VARCHAR(150) NOT NULL,
    actor_role VARCHAR(32) NOT NULL,
    location VARCHAR(256),
    description VARCHAR(2000),
    tx_hash VARCHAR(128),
    status VARCHAR(32) NOT NULL,
    ipfs_hash VARCHAR(256),
    product_id VARCHAR(64),
    CONSTRAINT fk_timeline_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_timeline_product ON timeline_events(product_id);

-- 9. Blockchain Transactions Table
CREATE TABLE IF NOT EXISTS blockchain_transactions (
    tx_id VARCHAR(128) PRIMARY KEY,
    block_number BIGINT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    stage VARCHAR(64) NOT NULL,
    action VARCHAR(128) NOT NULL,
    actor VARCHAR(150) NOT NULL,
    actor_role VARCHAR(32) NOT NULL,
    payload_hash VARCHAR(128),
    channel_name VARCHAR(64),
    chaincode VARCHAR(64),
    product_id VARCHAR(64),
    CONSTRAINT fk_bctx_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_bctx_product ON blockchain_transactions(product_id);

-- Blockchain Transaction Endorsing Peers Collection Table
CREATE TABLE IF NOT EXISTS blockchain_transaction_peers (
    tx_id VARCHAR(128) NOT NULL,
    peer VARCHAR(255),
    CONSTRAINT fk_bctx_peers FOREIGN KEY (tx_id) REFERENCES blockchain_transactions(tx_id) ON DELETE CASCADE
);

-- 10. Suspicious Reports Table
CREATE TABLE IF NOT EXISTS suspicious_reports (
    id VARCHAR(64) PRIMARY KEY,
    report_id VARCHAR(64) NOT NULL UNIQUE,
    batch_id VARCHAR(64) NOT NULL,
    reporter_name VARCHAR(150) NOT NULL,
    reporter_email VARCHAR(150),
    reporter_address VARCHAR(64),
    reason VARCHAR(32) NOT NULL,
    evidence_ipfs_cid VARCHAR(256),
    timestamp TIMESTAMP NOT NULL,
    status VARCHAR(32) NOT NULL,
    resolution_notes VARCHAR(2000),
    resolved_by VARCHAR(150),
    resolved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_report_batch ON suspicious_reports(batch_id);
CREATE INDEX IF NOT EXISTS idx_report_status ON suspicious_reports(status);
