-- =============================================================================
-- FloraChain V3 — Reference / demo seed data
--
-- Replaces the runtime DataInitializer (which wrote rows through JPA on every
-- boot) with declarative, versioned seed migrations. The same dataset is used
-- by the dev (H2) and prod (PostgreSQL) profiles, so environments stay
-- consistent and reproducible.
--
-- All demo accounts share the bcrypt hash of the password "password123".
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Users
-- -----------------------------------------------------------------------------
INSERT INTO users (id, name, email, password, role, organization, location, status, joined_date, avatar_url, wallet_address) VALUES
('USR-ADM-01', 'Dr. Rameshwar Varma', 'admin@florachain.org', '$2a$10$r4CO6stzwxKYYRQ9ic2ePOP3G/tlhObKzTJdCW6ZHBCFeAv7qxG5i', 'ADMIN', 'National Botanical Provenance Authority of India', 'New Delhi, India', 'ACTIVE', DATE '2023-01-15', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'),
('USR-FRM-01', 'Rajesh Patel', 'rajesh@vedicfarms.org', '$2a$10$r4CO6stzwxKYYRQ9ic2ePOP3G/tlhObKzTJdCW6ZHBCFeAv7qxG5i', 'FARMER', 'Vedic Agro Organic Cooperative', 'Neemuch, Madhya Pradesh, India', 'ACTIVE', DATE '2023-03-10', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'),
('USR-PRC-01', 'Mahesh Deshmukh', 'mahesh@phytoextracts.in', '$2a$10$r4CO6stzwxKYYRQ9ic2ePOP3G/tlhObKzTJdCW6ZHBCFeAv7qxG5i', 'PROCESSOR', 'PhytoExtracts Bio-Refining India Ltd', 'Peenya Industrial Complex, Bengaluru, Karnataka', 'ACTIVE', DATE '2023-04-18', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'),
('USR-LAB-01', 'Dr. Ananya Sharma', 'ananya@agrilabs.in', '$2a$10$r4CO6stzwxKYYRQ9ic2ePOP3G/tlhObKzTJdCW6ZHBCFeAv7qxG5i', 'LABORATORY', 'Eurofins NABL Analytical Testing Lab', 'Hyderabad & Bengaluru Biotech Park, India', 'ACTIVE', DATE '2023-02-22', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', '0x90F79bf6EB2c4f870365E785982E1f101E93b906'),
('USR-DST-01', 'Vikramjit Singh', 'vikram@transglobalcoldchain.in', '$2a$10$r4CO6stzwxKYYRQ9ic2ePOP3G/tlhObKzTJdCW6ZHBCFeAv7qxG5i', 'DISTRIBUTOR', 'TransGlobal Cold-Chain Logistics India Pvt Ltd', 'Nelamangala Logistics Park, Bengaluru & Delhi-NCR Hub', 'ACTIVE', DATE '2023-05-11', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65'),
('USR-RET-01', 'Aarav Mehta', 'aarav@arogyawellness.in', '$2a$10$r4CO6stzwxKYYRQ9ic2ePOP3G/tlhObKzTJdCW6ZHBCFeAv7qxG5i', 'RETAILER', 'Arogya Pure Herbals & Ayurvedic Dispensary', 'Indiranagar Flagship Store, Bengaluru, Karnataka', 'ACTIVE', DATE '2023-06-01', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc'),
('USR-FRM-02', 'Kavita Sundaram', 'kavita@nilgiricoop.in', '$2a$10$r4CO6stzwxKYYRQ9ic2ePOP3G/tlhObKzTJdCW6ZHBCFeAv7qxG5i', 'FARMER', 'Nilgiri Mountain Herbs Alliance', 'Ooty, Tamil Nadu, India', 'PENDING_APPROVAL', DATE '2024-08-20', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', NULL);

INSERT INTO user_certifications (user_id, certification) VALUES
('USR-FRM-01', 'India Organic NPOP'),
('USR-FRM-01', 'FSSAI Jaivik Bharat'),
('USR-FRM-01', 'AYUSH Premium Mark'),
('USR-FRM-01', 'FairWild Certified'),
('USR-PRC-01', 'GMP Certified (AYUSH)'),
('USR-PRC-01', 'ISO 22000:2018'),
('USR-PRC-01', 'FSSAI Manufacturing License'),
('USR-LAB-01', 'ISO/IEC 17025 NABL Accredited'),
('USR-LAB-01', 'FSSAI Notified Laboratory'),
('USR-LAB-01', 'AYUSH Approved Drug Testing Lab'),
('USR-DST-01', 'GDP Compliant'),
('USR-DST-01', 'ISO 9001:2015'),
('USR-DST-01', 'FSSAI Logistics License'),
('USR-RET-01', 'FSSAI Retail License'),
('USR-RET-01', 'AYUSH Premium Retailer Guild'),
('USR-RET-01', 'Jaivik Bharat Member'),
('USR-FRM-02', 'Rainforest Alliance (Under Audit)');

-- -----------------------------------------------------------------------------
-- Products
-- -----------------------------------------------------------------------------
INSERT INTO products (id, batch_id, name, botanical_name, category, cultivation_method, quantity_kg, harvest_date, farm_location, gps_lat, gps_lng, farmer_id, farmer_name, farmer_org, status, verification_state, qr_code_value, description, image_url, created_timestamp) VALUES
('BOT-2024-8901', 'ASH-2024-089', 'Pure Organic Ashwagandha Root Powder', 'Withania somnifera', 'MEDICINAL_HERB', 'ORGANIC', 450.0, DATE '2024-06-14', 'Vedic Farms Plot #4, Neemuch, MP, India', 24.4649, 74.8718, 'USR-FRM-01', 'Rajesh Patel', 'Vedic Agro Organic Cooperative', 'RETAIL_READY', 'VERIFIED', 'https://florachain.verify/BOT-2024-8901', 'High-potency, slow-shade dried full-spectrum Withania somnifera root sustainably harvested under certified regenerative organic standards. Standardized to 5.4% Withanolides.', 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600', TIMESTAMP '2024-06-15 08:30:00'),
('BOT-2024-9102', 'TUR-2024-114', 'Organic Lakadong Turmeric Root (9.2% Curcumin)', 'Curcuma longa', 'SPICE', 'ORGANIC', 800.0, DATE '2024-07-05', 'Jaintia Hills Organic Cluster, Meghalaya, India', 25.4529, 92.2037, 'USR-FRM-01', 'Rajesh Patel', 'Vedic Agro Organic Cooperative', 'IN_TRANSIT', 'IN_PROGRESS', 'https://florachain.verify/BOT-2024-9102', 'World-renowned high-curcumin Lakadong turmeric grown in pristine Meghalaya microclimate.', 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600', TIMESTAMP '2024-07-06 10:15:00'),
('BOT-2024-9403', 'TLS-2024-042', 'Biodynamic Rama & Krishna Tulsi Leaf Blend', 'Ocimum tenuiflorum', 'TEA', 'BIODYNAMIC', 320.0, DATE '2024-08-01', 'Vrindavan Biodynamic Estate, UP, India', 27.5824, 77.7006, 'USR-FRM-01', 'Rajesh Patel', 'Vedic Agro Organic Cooperative', 'APPROVED', 'VERIFIED', 'https://florachain.verify/BOT-2024-9403', 'Sacred adaptogenic holy basil carefully hand-picked during lunar crest.', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600', TIMESTAMP '2024-08-02 07:00:00'),
('BOT-2024-9704', 'MOR-2024-201', 'Wild-Crafted Moringa Leaf Fine Cut', 'Moringa oleifera', 'MEDICINAL_HERB', 'WILD_CRAFTED', 600.0, DATE '2024-08-18', 'Deccan Wild Agro-Forestry, Karnataka, India', 15.3173, 75.7139, 'USR-FRM-01', 'Rajesh Patel', 'Vedic Agro Organic Cooperative', 'REGISTERED', 'IN_PROGRESS', 'https://florachain.verify/BOT-2024-9704', 'Nutrient-dense raw moringa leaves sun-shaded and cold-conditioned immediately post-harvest.', 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=600', TIMESTAMP '2024-08-19 11:00:00'),
('BOT-2024-9981', 'NEM-2024-012', 'Wild-Crafted Neem Leaf Extract (Failed QA)', 'Azadirachta indica', 'EXTRACT', 'WILD_CRAFTED', 200.0, DATE '2024-07-05', 'Wild Forest Reserve Buffer Zone, Rajasthan', 26.9124, 75.7873, 'USR-FRM-01', 'Rajesh Patel', 'Vedic Agro Organic Cooperative', 'REJECTED', 'REJECTED', 'https://florachain.verify/BOT-2024-9981', 'Raw Neem leaf batch flagged during multi-residue GC-MS laboratory screening due to synthetic organophosphate traces from adjacent non-organic spray drift.', 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600', TIMESTAMP '2024-07-06 10:00:00');

INSERT INTO product_active_compounds (product_id, compound_name) VALUES
('BOT-2024-8901', 'Withanolides 5.4%'),
('BOT-2024-8901', 'Withaferin A 0.8%'),
('BOT-2024-8901', 'Alkaloids 1.2%'),
('BOT-2024-9102', 'Curcuminoids 9.2%'),
('BOT-2024-9102', 'Turmerones 4.1%'),
('BOT-2024-9403', 'Eugenol 68%'),
('BOT-2024-9403', 'Rosmarinic Acid'),
('BOT-2024-9403', 'Caryophyllene'),
('BOT-2024-9704', 'Chlorogenic Acid'),
('BOT-2024-9704', 'Quercetin'),
('BOT-2024-9704', 'Isothiocyanates'),
('BOT-2024-9981', 'Azadirachtin'),
('BOT-2024-9981', 'Nimbin'),
('BOT-2024-9981', 'Salannin');

-- -----------------------------------------------------------------------------
-- Certificates, processing, laboratory QA, logistics and retail (batch 8901)
-- -----------------------------------------------------------------------------
INSERT INTO certificates (id, type, certificate_number, issuing_authority, issue_date, expiry_date, ipfs_cid, status, product_id) VALUES
('CERT-001', 'India Organic (NPOP) Certificate', 'NPOP-ORG-2024-99812', 'OneCert International India / APEDA', DATE '2024-01-10', DATE '2025-01-09', 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco', 'VALID', 'BOT-2024-8901');

INSERT INTO processing_details (id, processor_id, processor_name, processing_date, method, facility_location, initial_quantity_kg, processed_quantity_kg, yield_loss_percentage, ipfs_document_cid, notes, tx_hash, product_id) VALUES
('PRC-2024-8901', 'USR-PRC-01', 'Mahesh Deshmukh (PhytoExtracts Bio-Refining)', DATE '2024-06-22', 'Cryogenic Micronization & Supercritical CO2 Separation', 'PhytoExtracts Facility B, Peenya Biotech Park, Bengaluru, India', 450.0, 396.0, 12.0, 'QmZtmD2qt8SrhB8vnvsn8Go25vqRzkvNenGYjppsGo2Za', 'Cryogenic milling at -40C preserved thermo-sensitive withanolide glycosides without thermal degradation under AYUSH GMP.', '0x8f23b1c4e5a67890123456789abcdef0123456789abcdef0123456789abcdef0', 'BOT-2024-8901');

INSERT INTO processing_equipment (processing_id, equipment_name) VALUES
('PRC-2024-8901', 'CryoMill CM-800'),
('PRC-2024-8901', 'Supercritical Fluid Extractor SFE-500'),
('PRC-2024-8901', 'Fluidized Bed Dryer');

INSERT INTO lab_reports (id, lab_id, lab_name, test_date, tested_by, purity_percentage, moisture_percentage, heavy_metals_status, microbial_test_status, pesticide_residue_status, certificate_ipfs_cid, certificate_url, overall_result, notes, tx_hash, product_id) VALUES
('LAB-2024-8901', 'USR-LAB-01', 'Dr. Ananya Sharma (Eurofins NABL)', DATE '2024-07-02', 'Dr. Ananya Sharma, Lead Bio-Analytical Chemist', 99.4, 4.8, 'PASS', 'PASS', 'PASS', 'Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu', 'https://gateway.pinata.cloud/ipfs/Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu', 'APPROVED', 'Sample fully complies with Ayurvedic Pharmacopoeia of India (API) and FSSAI Standards. No synthetic adulterants detected.', '0x4a7c8e9f0123456789abcdef0123456789abcdef0123456789abcdef01234567', 'BOT-2024-8901');

INSERT INTO lab_test_parameters (name, param_value, unit, standard_limit, passed, lab_report_id) VALUES
('Total Withanolides (HPLC-UV)', '5.42', '% w/w', '>= 2.5%', TRUE, 'LAB-2024-8901'),
('Lead (Pb) - ICP-MS', '0.08', 'ppm (mg/kg)', '< 3.0 ppm', TRUE, 'LAB-2024-8901'),
('Cadmium (Cd) - ICP-MS', '0.02', 'ppm (mg/kg)', '< 0.5 ppm', TRUE, 'LAB-2024-8901'),
('Aflatoxins (B1+B2+G1+G2)', '< 0.5', 'ppb (ug/kg)', '< 4.0 ppb', TRUE, 'LAB-2024-8901');

INSERT INTO shipments (id, distributor_id, distributor_name, source_location, destination_location, vehicle_number, transport_type, temperature_range, dispatch_date, expected_delivery_date, actual_delivery_date, status, tracking_number, tx_hash, product_id) VALUES
('SHP-2024-8901', 'USR-DST-01', 'Vikramjit Singh (TransGlobal Logistics)', 'PhytoExtracts Hub, Nelamangala, Bengaluru, India', 'Arogya Pure Herbals Dispensary, Indiranagar, Bengaluru, India', 'KA-01-TG-8442', 'REFRIGERATED_TRUCK', '15C - 22C (Monitored)', DATE '2024-07-08', DATE '2024-07-12', DATE '2024-07-12', 'DELIVERED', 'TRK-IND-2024-998812', '0x2c5e8b0d123456789abcdef0123456789abcdef0123456789abcdef012345678', 'BOT-2024-8901');

INSERT INTO retail_details (id, retailer_id, retailer_name, store_location, received_date, shelf_batch_id, unit_price, qr_code_generated, notes, tx_hash, product_id) VALUES
('RET-2024-8901', 'USR-RET-01', 'Aarav Mehta (Arogya Pure Herbals)', 'Indiranagar Flagship Store, 100 Feet Road, Bengaluru 560038', DATE '2024-07-14', 'SHELF-BLR-2024-089A', 850.00, TRUE, 'Inbound inspection verified all anti-tamper seals intact. Assigned shelf location Bay A-3.', '0x1a3d5f7b90123456789abcdef0123456789abcdef0123456789abcdef0123456', 'BOT-2024-8901');

-- -----------------------------------------------------------------------------
-- Provenance timeline for batch 8901
-- -----------------------------------------------------------------------------
INSERT INTO timeline_events (id, title, stage, timestamp, actor_name, actor_role, location, description, tx_hash, status, product_id) VALUES
('EVT-001', 'Harvest & On-Farm Batch Registration', 'FARM_HARVEST', TIMESTAMP '2024-06-14 06:45:00', 'Rajesh Patel', 'FARMER', 'Neemuch, Madhya Pradesh, India', 'Harvested 450kg organic root crop.', '0x3a1b2c...', 'COMPLETED', 'BOT-2024-8901'),
('EVT-002', 'Bio-Processing & Cryogenic Milling', 'PROCESSING', TIMESTAMP '2024-06-22 14:00:00', 'Mahesh Deshmukh', 'PROCESSOR', 'Peenya, Bengaluru, India', 'Cryogenic milling at -40C completed.', '0x8f23b1...', 'COMPLETED', 'BOT-2024-8901'),
('EVT-003', 'Laboratory Purity & Contaminant Analysis', 'LAB_TESTING', TIMESTAMP '2024-07-02 11:30:00', 'Dr. Ananya Sharma', 'LABORATORY', 'Eurofins NABL Lab', 'Passed all HPLC and heavy metal assays.', '0x4a7c8e...', 'COMPLETED', 'BOT-2024-8901'),
('EVT-004', 'Cold-Chain Transit Dispatched & Delivered', 'LOGISTICS_TRANSIT', TIMESTAMP '2024-07-12 16:20:00', 'Vikramjit Singh', 'DISTRIBUTOR', 'Nelamangala to Indiranagar, Bengaluru', 'Delivered safely to Bengaluru retail hub.', '0x2c5e8b...', 'COMPLETED', 'BOT-2024-8901'),
('EVT-005', 'Retail Stocking & Consumer QR Active', 'RETAIL_ARRIVAL', TIMESTAMP '2024-07-14 09:30:00', 'Aarav Mehta', 'RETAILER', 'Indiranagar Bengaluru', 'Active on shelf. Authenticity QR live.', '0x1a3d5f...', 'COMPLETED', 'BOT-2024-8901');

-- -----------------------------------------------------------------------------
-- Blockchain ledger mirrors
-- -----------------------------------------------------------------------------
INSERT INTO blockchain_transactions (tx_id, block_number, timestamp, stage, action, actor, actor_role, payload_hash, channel_name, chaincode, product_id) VALUES
('0x1a3d5f7b90123456789abcdef0123456789abcdef0123456789abcdef0123456', 10745, TIMESTAMP '2024-07-14 09:30:00', 'RETAIL_ARRIVAL', 'CONFIRM_RETAIL_RECEIPT', 'Aarav Mehta', 'RETAILER', 'sha256:b8c9d0...', 'botanical-supply-channel', 'BotanicalTraceability v1.0', 'BOT-2024-8901'),
('0x2c5e8b0d123456789abcdef0123456789abcdef0123456789abcdef012345678', 10744, TIMESTAMP '2024-07-08 09:00:00', 'LOGISTICS_TRANSIT', 'CREATE_SHIPMENT', 'Vikramjit Singh', 'DISTRIBUTOR', 'sha256:a7b8c9...', 'botanical-supply-channel', 'BotanicalTraceability v1.0', 'BOT-2024-8901'),
('0x4a7c8e9f0123456789abcdef0123456789abcdef0123456789abcdef01234567', 10743, TIMESTAMP '2024-07-02 11:30:00', 'LAB_TESTING', 'SUBMIT_LAB_RESULT_APPROVED', 'Dr. Ananya Sharma', 'LABORATORY', 'sha256:f6a7b8...', 'botanical-supply-channel', 'BotanicalTraceability v1.0', 'BOT-2024-8901');

INSERT INTO tx_endorsing_peers (tx_id, peer_name) VALUES
('0x1a3d5f7b90123456789abcdef0123456789abcdef0123456789abcdef0123456', 'peer0.consortium'),
('0x1a3d5f7b90123456789abcdef0123456789abcdef0123456789abcdef0123456', 'peer1.retail'),
('0x2c5e8b0d123456789abcdef0123456789abcdef0123456789abcdef012345678', 'peer0.consortium'),
('0x2c5e8b0d123456789abcdef0123456789abcdef0123456789abcdef012345678', 'peer1.logistics'),
('0x4a7c8e9f0123456789abcdef0123456789abcdef0123456789abcdef01234567', 'peer0.consortium'),
('0x4a7c8e9f0123456789abcdef0123456789abcdef0123456789abcdef01234567', 'peer1.quality');

-- -----------------------------------------------------------------------------
-- Open compliance report
-- -----------------------------------------------------------------------------
INSERT INTO suspicious_reports (id, product_id, batch_id, reporter_name, reporter_email, reason, description, reported_at, status, admin_notes) VALUES
('REP-2024-001', 'BOT-2024-9704', 'MOR-2024-201', 'John Davies', 'jdavies@consumer-watch.org', 'TAMPERED_PACKAGING', 'Inbound carton showed evidence of broken secondary tamper seals during inspection.', TIMESTAMP '2024-08-22 14:30:00', 'PENDING_REVIEW', 'Assigned to compliance inspector for physical batch audit.');
