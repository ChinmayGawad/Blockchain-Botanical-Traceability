// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title BotanicalTraceability
 * @dev Comprehensive smart contract for immutable botanical supply chain provenance,
 * tracking crops from harvest, through processing, laboratory testing, transport, and retail.
 */
contract BotanicalTraceability {

    enum ProductStatus {
        REGISTERED,
        PROCESSING,
        PROCESSED,
        IN_TESTING,
        APPROVED,
        REJECTED,
        IN_TRANSIT,
        DELIVERED,
        RETAIL_READY,
        SUSPICIOUS,
        RECALLED
    }

    enum UserRole {
        ADMIN,
        FARMER,
        PROCESSOR,
        LABORATORY,
        DISTRIBUTOR,
        RETAILER,
        CONSUMER
    }

    struct LabReport {
        string labId;
        string labName;
        string testedBy;
        uint256 testDate;
        uint256 purityPercentage; // 2 decimal precision (e.g. 9850 = 98.50%)
        uint256 moisturePercentage; // 2 decimal precision (e.g. 720 = 7.20%)
        bool heavyMetalsPassed;
        bool microbialTestPassed;
        bool pesticideResiduePassed;
        string certificateIpfsCid;
        bool overallApproved;
        address labAddress;
        string notes;
    }

    struct ProcessingDetails {
        string processorId;
        string processorName;
        string facilityLocation;
        string method;
        uint256 initialQuantityKg;
        uint256 processedQuantityKg;
        uint256 yieldLossPercentage; // 2 decimal precision (e.g. 1250 = 12.50%)
        uint256 processingDate;
        string equipmentUsed;
        string ipfsDocumentCid;
        address processorAddress;
        string notes;
    }

    struct ShipmentDetails {
        string shipmentId;
        string distributorId;
        string distributorName;
        string sourceLocation;
        string destinationLocation;
        string vehicleNumber;
        string transportType;
        string temperatureRange;
        string trackingNumber;
        uint256 dispatchDate;
        uint256 deliveryDate;
        address distributorAddress;
        bool isDelivered;
    }

    struct RetailDetails {
        string retailerId;
        string retailerName;
        string storeLocation;
        string shelfLocation;
        uint256 receivedDate;
        string retailPrice;
        address retailerAddress;
    }

    struct SuspiciousReport {
        string reportId;
        string batchId;
        string reporterName;
        address reporterAddress;
        string reason;
        string evidenceIpfsCid;
        uint256 timestamp;
        bool resolved;
        string resolutionNotes;
    }

    struct HarvestInput {
        string batchId;
        string botanicalName;
        string commonName;
        string category;
        string farmLocation;
        string coordinates;
        uint256 harvestDate;
        uint256 quantityKg;
        string cultivationMethod;
        string farmerId;
        string farmerName;
    }

    struct ProcessingInput {
        string batchId;
        string processorId;
        string processorName;
        string facilityLocation;
        string method;
        uint256 initialQuantityKg;
        uint256 processedQuantityKg;
        uint256 yieldLossPercentage;
        string equipmentUsed;
        string ipfsDocumentCid;
        string notes;
    }

    struct LabInput {
        string batchId;
        string labId;
        string labName;
        string testedBy;
        uint256 purityPercentage;
        uint256 moisturePercentage;
        bool heavyMetalsPassed;
        bool microbialTestPassed;
        bool pesticideResiduePassed;
        string certificateIpfsCid;
        bool overallApproved;
        string notes;
    }

    struct ShipmentInput {
        string batchId;
        string shipmentId;
        string distributorId;
        string distributorName;
        string sourceLocation;
        string destinationLocation;
        string vehicleNumber;
        string transportType;
        string temperatureRange;
        string trackingNumber;
    }

    struct RetailInput {
        string batchId;
        string retailerId;
        string retailerName;
        string storeLocation;
        string shelfLocation;
        string retailPrice;
    }

    struct BotanicalProduct {
        string batchId;
        string botanicalName;
        string commonName;
        string category;
        string farmLocation;
        string coordinates;
        uint256 harvestDate;
        uint256 quantityKg;
        string cultivationMethod;
        string farmerId;
        string farmerName;
        address farmerAddress;
        ProductStatus status;
        ProcessingDetails processing;
        LabReport labReport;
        ShipmentDetails shipment;
        RetailDetails retail;
        uint256 createdAt;
        uint256 updatedAt;
        bool exists;
    }

    // Contract state
    address public owner;
    mapping(string => BotanicalProduct) private products;
    string[] private allBatchIds;

    mapping(address => UserRole) public userRoles;
    mapping(address => bool) public isAuthorizedActor;
    mapping(string => SuspiciousReport[]) private productReports;
    SuspiciousReport[] private allSuspiciousReports;

    // Events for real-time tracking and indexing
    event ProductRegistered(string indexed batchId, string botanicalName, address indexed farmer, uint256 timestamp);
    event ProcessingRecorded(string indexed batchId, string processorName, address indexed processor, uint256 timestamp);
    event LabReportRecorded(string indexed batchId, bool indexed approved, address indexed laboratory, uint256 timestamp);
    event ShipmentDispatched(string indexed batchId, string shipmentId, address indexed distributor, uint256 timestamp);
    event ShipmentDelivered(string indexed batchId, string shipmentId, address indexed distributor, uint256 timestamp);
    event RetailReceived(string indexed batchId, string retailerName, address indexed retailer, uint256 timestamp);
    event ProductSuspiciousReported(string indexed batchId, string reportId, address indexed reporter, string reason);
    event ProductRecalled(string indexed batchId, string reason, address indexed authority);
    event RoleGranted(address indexed actor, UserRole role);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can perform this action");
        _;
    }

    modifier onlyRole(UserRole role) {
        require(
            msg.sender == owner || (isAuthorizedActor[msg.sender] && userRoles[msg.sender] == role),
            "Unauthorized role for this operation"
        );
        _;
    }

    modifier batchExists(string memory batchId) {
        require(products[batchId].exists, "Batch does not exist on-chain");
        _;
    }

    constructor() {
        owner = msg.sender;
        userRoles[msg.sender] = UserRole.ADMIN;
        isAuthorizedActor[msg.sender] = true;
        emit RoleGranted(msg.sender, UserRole.ADMIN);
    }

    /**
     * @dev Grant or update participant role in the supply chain
     */
    function grantRole(address actor, UserRole role) external onlyOwner {
        userRoles[actor] = role;
        isAuthorizedActor[actor] = true;
        emit RoleGranted(actor, role);
    }

    /**
     * @dev 1. Farmer registers a newly harvested botanical batch
     */
    function registerHarvest(HarvestInput calldata input) external {
        require(!products[input.batchId].exists, "Batch with this ID already registered");
        require(bytes(input.batchId).length > 0, "Batch ID cannot be empty");

        BotanicalProduct storage p = products[input.batchId];
        p.batchId = input.batchId;
        p.botanicalName = input.botanicalName;
        p.commonName = input.commonName;
        p.category = input.category;
        p.farmLocation = input.farmLocation;
        p.coordinates = input.coordinates;
        p.harvestDate = input.harvestDate > 0 ? input.harvestDate : block.timestamp;
        p.quantityKg = input.quantityKg;
        p.cultivationMethod = input.cultivationMethod;
        p.farmerId = input.farmerId;
        p.farmerName = input.farmerName;
        p.farmerAddress = msg.sender;
        p.status = ProductStatus.REGISTERED;
        p.createdAt = block.timestamp;
        p.updatedAt = block.timestamp;
        p.exists = true;

        allBatchIds.push(input.batchId);

        emit ProductRegistered(input.batchId, input.botanicalName, msg.sender, block.timestamp);
    }

    /**
     * @dev 2. Processor records processing / extraction details
     */
    function recordProcessing(ProcessingInput calldata input) external batchExists(input.batchId) {
        BotanicalProduct storage p = products[input.batchId];
        require(p.status == ProductStatus.REGISTERED || p.status == ProductStatus.PROCESSING, "Invalid state for processing");

        p.processing = ProcessingDetails({
            processorId: input.processorId,
            processorName: input.processorName,
            facilityLocation: input.facilityLocation,
            method: input.method,
            initialQuantityKg: input.initialQuantityKg,
            processedQuantityKg: input.processedQuantityKg,
            yieldLossPercentage: input.yieldLossPercentage,
            processingDate: block.timestamp,
            equipmentUsed: input.equipmentUsed,
            ipfsDocumentCid: input.ipfsDocumentCid,
            processorAddress: msg.sender,
            notes: input.notes
        });

        p.status = ProductStatus.PROCESSED;
        p.updatedAt = block.timestamp;

        emit ProcessingRecorded(input.batchId, input.processorName, msg.sender, block.timestamp);
    }

    /**
     * @dev 3. Laboratory submits QC testing results & certification
     */
    function submitLabReport(LabInput calldata input) external batchExists(input.batchId) {
        BotanicalProduct storage p = products[input.batchId];
        require(
            p.status == ProductStatus.PROCESSED || p.status == ProductStatus.IN_TESTING || p.status == ProductStatus.REGISTERED,
            "Invalid state for lab testing"
        );

        p.labReport = LabReport({
            labId: input.labId,
            labName: input.labName,
            testedBy: input.testedBy,
            testDate: block.timestamp,
            purityPercentage: input.purityPercentage,
            moisturePercentage: input.moisturePercentage,
            heavyMetalsPassed: input.heavyMetalsPassed,
            microbialTestPassed: input.microbialTestPassed,
            pesticideResiduePassed: input.pesticideResiduePassed,
            certificateIpfsCid: input.certificateIpfsCid,
            overallApproved: input.overallApproved,
            labAddress: msg.sender,
            notes: input.notes
        });

        p.status = input.overallApproved ? ProductStatus.APPROVED : ProductStatus.REJECTED;
        p.updatedAt = block.timestamp;

        emit LabReportRecorded(input.batchId, input.overallApproved, msg.sender, block.timestamp);
    }

    /**
     * @dev 4. Distributor dispatches shipment
     */
    function dispatchShipment(ShipmentInput calldata input) external batchExists(input.batchId) {
        BotanicalProduct storage p = products[input.batchId];
        require(p.status == ProductStatus.APPROVED, "Product must be approved by laboratory before shipment");

        p.shipment = ShipmentDetails({
            shipmentId: input.shipmentId,
            distributorId: input.distributorId,
            distributorName: input.distributorName,
            sourceLocation: input.sourceLocation,
            destinationLocation: input.destinationLocation,
            vehicleNumber: input.vehicleNumber,
            transportType: input.transportType,
            temperatureRange: input.temperatureRange,
            trackingNumber: input.trackingNumber,
            dispatchDate: block.timestamp,
            deliveryDate: 0,
            distributorAddress: msg.sender,
            isDelivered: false
        });

        p.status = ProductStatus.IN_TRANSIT;
        p.updatedAt = block.timestamp;

        emit ShipmentDispatched(input.batchId, input.shipmentId, msg.sender, block.timestamp);
    }

    /**
     * @dev 4b. Distributor confirms shipment arrival / delivery
     */
    function confirmDelivery(string memory batchId) external batchExists(batchId) {
        BotanicalProduct storage p = products[batchId];
        require(p.status == ProductStatus.IN_TRANSIT, "Product is not currently in transit");

        p.shipment.deliveryDate = block.timestamp;
        p.shipment.isDelivered = true;
        p.status = ProductStatus.DELIVERED;
        p.updatedAt = block.timestamp;

        emit ShipmentDelivered(batchId, p.shipment.shipmentId, msg.sender, block.timestamp);
    }

    /**
     * @dev 5. Retailer confirms receipt and places product on retail shelves
     */
    function confirmRetailReceipt(RetailInput calldata input) external batchExists(input.batchId) {
        BotanicalProduct storage p = products[input.batchId];
        require(
            p.status == ProductStatus.DELIVERED || p.status == ProductStatus.IN_TRANSIT || p.status == ProductStatus.APPROVED,
            "Product not ready for retail receipt"
        );

        p.retail = RetailDetails({
            retailerId: input.retailerId,
            retailerName: input.retailerName,
            storeLocation: input.storeLocation,
            shelfLocation: input.shelfLocation,
            receivedDate: block.timestamp,
            retailPrice: input.retailPrice,
            retailerAddress: msg.sender
        });

        p.status = ProductStatus.RETAIL_READY;
        p.updatedAt = block.timestamp;

        emit RetailReceived(input.batchId, input.retailerName, msg.sender, block.timestamp);
    }

    /**
     * @dev Report suspicious activity or potential counterfeit
     */
    function reportSuspicious(
        string calldata reportId,
        string calldata batchId,
        string calldata reporterName,
        string calldata reason,
        string calldata evidenceIpfsCid
    ) external batchExists(batchId) {
        SuspiciousReport memory report = SuspiciousReport({
            reportId: reportId,
            batchId: batchId,
            reporterName: reporterName,
            reporterAddress: msg.sender,
            reason: reason,
            evidenceIpfsCid: evidenceIpfsCid,
            timestamp: block.timestamp,
            resolved: false,
            resolutionNotes: ""
        });

        productReports[batchId].push(report);
        allSuspiciousReports.push(report);

        products[batchId].status = ProductStatus.SUSPICIOUS;
        products[batchId].updatedAt = block.timestamp;

        emit ProductSuspiciousReported(batchId, reportId, msg.sender, reason);
    }

    /**
     * @dev Admin/Regulator recalls a batch
     */
    function recallProduct(string memory batchId, string calldata reason) external onlyOwner batchExists(batchId) {
        products[batchId].status = ProductStatus.RECALLED;
        products[batchId].updatedAt = block.timestamp;

        emit ProductRecalled(batchId, reason, msg.sender);
    }

    // ==========================================
    // View Functions for Public & QR Verification
    // ==========================================

    /**
     * @dev Retrieve complete batch record for consumer QR verification
     */
    function getProduct(string memory batchId) external view batchExists(batchId) returns (BotanicalProduct memory) {
        return products[batchId];
    }

    /**
     * @dev Get total count of registered batches
     */
    function getTotalBatchesCount() external view returns (uint256) {
        return allBatchIds.length;
    }

    /**
     * @dev Get all registered batch IDs
     */
    function getAllBatchIds() external view returns (string[] memory) {
        return allBatchIds;
    }

    /**
     * @dev Get suspicious reports for a batch
     */
    function getReportsForBatch(string memory batchId) external view returns (SuspiciousReport[] memory) {
        return productReports[batchId];
    }

    /**
     * @dev Get all suspicious reports
     */
    function getAllReports() external view returns (SuspiciousReport[] memory) {
        return allSuspiciousReports;
    }
}
