# 🌿 FloraChain — Blockchain-Based Botanical Traceability Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?logo=solidity)](https://soliditylang.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.3-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-20%2B-ED8B00?logo=openjdk&logoColor=white)](https://openjdk.org/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.12-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.29.1-FFF100?logo=ethereum&logoColor=black)](https://hardhat.org/)
[![Web3j](https://img.shields.io/badge/Web3j-4.10.3-F16822)](https://web3j.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

**FloraChain** is an enterprise-grade, decentralized botanical supply chain provenance and anti-counterfeiting platform. It guarantees end-to-end transparency, regulatory compliance, and immutable quality verification for medicinal herbs, organic extracts, botanicals, and herbal health formulations from agricultural harvest to the end consumer.

---

## 📑 Table of Contents

- [Key Highlights](#-key-highlights)
- [The Problem \& Solution](#-the-problem--solution)
- [System Architecture](#-system-architecture)
- [Supply Chain Lifecycle \& State Machine](#-supply-chain-lifecycle--state-machine)
- [Stakeholder Roles \& Dashboards](#-stakeholder-roles--dashboards)
- [Technology Stack Matrix](#-technology-stack-matrix)
- [Smart Contract Specification](#-smart-contract-specification)
- [Backend REST API Overview](#-backend-rest-api-overview)
- [Project Directory Structure](#-project-directory-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started \& Local Setup](#-getting-started--local-setup)
  - [1. Smart Contract \& Local EVM Node](#1-smart-contract--local-evm-node)
  - [2. Spring Boot 3 Backend](#2-spring-boot-3-backend)
  - [3. React + Vite Frontend](#3-react--vite-frontend)
  - [4. Docker Compose (Full Stack)](#4-docker-compose-full-stack)
- [Pre-Seeded Demo Credentials](#-pre-seeded-demo-credentials)
- [Testing \& Verification](#-testing--verification)
- [Security \& Data Integrity](#-security--data-integrity)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🌟 Key Highlights

- **Immutable On-Chain Ledger**: Core supply chain milestones are anchored onto an EVM smart contract (`BotanicalTraceability.sol`), creating an unalterable audit trail.
- **Multi-Stakeholder Role-Based Access Control (RBAC)**: Secure multi-tenant architecture strictly partitioning operations for **Farmers**, **Processors**, **Laboratories**, **Distributors**, **Retailers**, and **Consortium Admins**.
- **Cryptographic Laboratory Proofs & IPFS Off-Chain Storage**: Full assay documentation, certificates of analysis (CoA), heavy metal assays, and microbial tests are cryptographically hashed and linked via IPFS CID references.
- **Consumer Instant Verification**: Public portal enabling consumers to scan a batch QR code or input a Batch ID to instantly view complete farm-to-shelf provenance, geo-coordinates, lab results, and blockchain transaction receipts.
- **Anti-Counterfeit & Anomaly Alerting**: Built-in suspicious batch flagging, multi-stage dispute reporting, and admin recall mechanisms.
- **Enterprise Spring Boot 3 Backend**: High-performance RESTful API with stateless JWT security, Web3j blockchain integration, H2 in-memory zero-config dev database, and PostgreSQL production readiness.
- **Premium Reactive UI/UX**: Built with React 18, Vite, TypeScript, and modern glassmorphic Tailwind CSS with animated milestone progress trackers and real-time blockchain telemetry.

---

## 🎯 The Problem & Solution

### ⚠️ Industry Challenges
1. **Adulteration & Counterfeiting**: High-value botanical extracts and medicinal herbs are vulnerable to unauthorized blending with synthetic fillers or low-grade substitutes.
2. **Centralized & Manipulable Records**: Paper logs and centralized relational databases can be retroactively altered, falsified, or lost.
3. **Fragmented Silos**: Farmers, extract processors, certified testing laboratories, cold-chain transporters, and retailers operate on disparate, non-interoperable tracking systems.
4. **Opaque Quality Assays**: Consumers and healthcare practitioners cannot verify the authenticity of printed organic, pesticide-free, or purity certificates.
5. **Slow Recall Response**: Tracing contaminated or substandard batches across complex international distribution networks can take weeks.

### 🛡️ The FloraChain Solution
```
[ 🧑‍🌾 Cultivator / Farmer ]
         │  Registers raw botanical harvest with geo-coordinates, yield & organic certs
         ▼
[ ⚙️ Extraction Processor ]
         │  Logs extraction method (CO2, solvent, milling), processing yield & loss %
         ▼
[ 🔬 Certified QA Laboratory ]
         │  Conducts purity (%), moisture (%), heavy metals & microbial assays + IPFS CoA
         ▼
[ 🚚 Cold-Chain Distributor ]
         │  Tracks transit telemetry, source/destination dispatch & delivery signatures
         ▼
[ 🏪 Licensed Retailer ]
         │  Receives verified stock, checks shelf readiness, generates batch QR code
         ▼
[ 📱 End Consumer / Patient ]
            Scans QR code -> Instant end-to-end cryptographic provenance & verified audit trail
```

---

## 🏗️ System Architecture

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT LAYER                                      |
|  React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons + QR Scanner / Gen    |
+-----------------------------------------------------------------------------------+
                                         │  HTTP / REST (JWT Auth)
                                         ▼
+-----------------------------------------------------------------------------------+
|                             APPLICATION LAYER                                     |
|  Spring Boot 3.3.x (Java 20) REST API                                             |
|  ├── Spring Security 6 + JJWT Filter (Stateless RBAC)                             |
|  ├── Controllers (Auth, Product, Lab, Shipment, Retail, Blockchain, Reports)      |
|  ├── Service Layer (Product, Verification, IPFS Mock/Gateway, Blockchain Bridge)  |
|  └── Spring Data JPA Repositories (Entity Relationships & Query Projections)       |
+-----------------------------------------------------------------------------------+
                 │                                                │
                 │ JSON-RPC (Web3j 4.10.3)                        │ JPA / JDBC
                 ▼                                                ▼
+------------------------------------+          +-----------------------------------+
|         BLOCKCHAIN LAYER           |          |          DATA / STORAGE           |
|  Hardhat Local EVM Node / Ethereum |          |  • PostgreSQL 16 (Production)     |
|  Smart Contract:                   |          |  • H2 In-Memory DB (Dev Profile)  |
|  `BotanicalTraceability.sol`       |          |  • IPFS Gateway (Pinata / Storage)|
+------------------------------------+          +-----------------------------------+
```

---

## 🔄 Supply Chain Lifecycle & State Machine

Each botanical product batch traverses through an immutable state machine enforced by smart contract modifiers and backend business logic:

```mermaid
stateDiagram-v2
    [*] --> REGISTERED: Farmer registers harvest
    REGISTERED --> PROCESSING: Processor claims batch
    PROCESSING --> PROCESSED: Processing details logged
    PROCESSED --> IN_TESTING: Submitted to Laboratory
    IN_TESTING --> APPROVED: QA Assays passed & CoA anchored
    IN_TESTING --> REJECTED: QA Assays failed
    APPROVED --> IN_TRANSIT: Distributor initiates shipment
    IN_TRANSIT --> DELIVERED: Transport completed
    DELIVERED --> RETAIL_READY: Retailer stocks & generates QR
    RETAIL_READY --> [*]: Scanned & Verified by Consumer
    
    APPROVED --> SUSPICIOUS: Anomaly flagged
    IN_TRANSIT --> SUSPICIOUS: Anomaly flagged
    RETAIL_READY --> SUSPICIOUS: Anomaly flagged
    SUSPICIOUS --> RECALLED: Admin confirms breach
    SUSPICIOUS --> APPROVED: Admin resolves dispute
```

---

## 👥 Stakeholder Roles & Dashboards

| Role | Responsibilities & Capabilities | Accessible Routes |
|:---|:---|:---|
| **ADMIN** | Consortium governance, approving stakeholder registration, resolving flagged disputes, triggering product recalls, viewing consortium-wide analytics. | `/admin/dashboard`, `/admin/approvals`, `/admin/reports`, `/admin/explorer` |
| **FARMER** | Registering new raw crop harvests, botanical species classification, geo-location coordinate tagging, harvest yield & organic certification uploads. | `/farmer/dashboard`, `/farmer/register`, `/farmer/products` |
| **PROCESSOR** | Accepting raw botanical batches, recording refinement/extraction methods, processing dates, equipment IDs, yield loss %, and intermediate storage details. | `/processor/dashboard`, `/processor/process`, `/processor/batches` |
| **LABORATORY** | Executing chemical and analytical tests (Purity %, Moisture %, Heavy Metals, Pesticide Residue, Microbial Analysis), issuing cryptographic Certificates of Analysis (IPFS). | `/laboratory/dashboard`, `/laboratory/test`, `/laboratory/reports` |
| **DISTRIBUTOR** | Logging cold-chain vehicle IDs, transport temperature thresholds, dispatch timestamps, waybill tracking numbers, and delivery sign-offs. | `/distributor/dashboard`, `/distributor/create-shipment`, `/distributor/shipments` |
| **RETAILER** | Receiving verified batches into retail inventory, shelf location assignment, retail pricing, and generating consumer-facing packaging QR codes. | `/retailer/dashboard`, `/retailer/inventory`, `/retailer/generate-qr` |
| **CONSUMER** | Public access to search any Batch ID or scan QR codes to view the interactive supply chain timeline, farmer origin, lab safety scores, and on-chain proofs. | `/`, `/home`, `/verify`, `/verify/:productId` |

---

## 💻 Technology Stack Matrix

### Frontend
- **Framework**: [React 18.3.1](https://react.dev/) + [Vite 5.4.6](https://vitejs.dev/)
- **Language**: [TypeScript 5.5.3](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 3.4.12](https://tailwindcss.com/) + PostCSS + Autoprefixer
- **Routing**: [React Router DOM 6.26.2](https://reactrouter.com/) (with custom `ProtectedRoute` RBAC guards)
- **Icons & Visuals**: [Lucide React 0.446.0](https://lucide.dev/), Canvas Confetti
- **QR Utilities**: `qrcode.react` (SVG & Canvas rendering)
- **Web3 Integration**: [Ethers.js v6.17.0](https://docs.ethers.org/v6/)

### Backend
- **Framework**: [Spring Boot 3.3.3](https://spring.io/projects/spring-boot)
- **Language**: [Java 20](https://openjdk.org/)
- **Security**: Spring Security 6 + [JJWT 0.12.5](https://github.com/jwtk/jjwt) (Stateless JWT token authentication)
- **ORM & Data**: Spring Data JPA + Hibernate 6
- **Databases**:
  - **Development**: H2 In-Memory Database (zero configuration, console enabled at `/h2-console`)
  - **Production**: PostgreSQL 16 Alpine
- **Blockchain Connectivity**: [Web3j 4.10.3](https://web3j.io/) (EVM JSON-RPC client)
- **Boilerplate Reduction**: Project Lombok

### Smart Contract & Blockchain
- **Smart Contract Language**: [Solidity ^0.8.24](https://soliditylang.org/)
- **Development & Testing Framework**: [Hardhat 2.29.1](https://hardhat.org/) + Hardhat Toolbox
- **EVM Networks**: Hardhat Localhost Node (Chain ID `31337`), Ethereum / Polygon compatible

### DevOps & Infrastructure
- **Containerization**: Docker & Docker Compose
- **IPFS Storage**: Pinata / IPFS Gateway bridge

---

## 📜 Smart Contract Specification

The smart contract `contracts/BotanicalTraceability.sol` encapsulates all business logic and state transitions:

### Key Structs
- `HarvestInput`: Botanical taxon, common name, batch ID, farm coordinates, harvest date, farmer ID.
- `ProcessingDetails`: Extraction method, initial & processed weight, yield loss %, facility ID.
- `LabReport`: Purity %, moisture %, heavy metals / pesticides / microbial pass-fail flags, IPFS certificate hash.
- `ShipmentDetails`: Courier, transport type, temperature parameters, tracking number, delivery verification.
- `RetailDetails`: Store ID, shelf location, retail price, receipt timestamp.
- `SuspiciousReport`: Reporter address, incident description, evidence IPFS CID, resolution state.

### Role Authorization & Security Modifiers
```solidity
modifier onlyRole(UserRole _role)
modifier onlyAdmin()
modifier validBatch(string memory _batchId)
modifier batchInStatus(string memory _batchId, ProductStatus _requiredStatus)
```

---

## 🔌 Backend REST API Overview

All secured endpoints require the header `Authorization: Bearer <JWT_TOKEN>`.

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|:---|:---|:---|:---|
| `POST` | `/api/auth/register` | Register a new user/organization | Public |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT Bearer token | Public |
| `GET` | `/api/auth/me` | Retrieve profile of authenticated user | Authenticated |
| `POST` | `/api/auth/switch-role` | Demo endpoint to swap personas in development | Authenticated |

### Products & Traceability (`/api/products`)
| Method | Endpoint | Description | Access |
|:---|:---|:---|:---|
| `GET` | `/api/products` | Get products (Scoped by caller's role) | Authenticated |
| `GET` | `/api/products/{id}` | Get product details by ID or Batch ID | Public / Auth |
| `POST` | `/api/products/harvest` | Register new botanical crop harvest | `FARMER`, `ADMIN` |
| `POST` | `/api/products/{id}/process` | Record extraction & processing stage | `PROCESSOR`, `ADMIN` |
| `POST` | `/api/products/{id}/lab-test` | Submit certified laboratory analysis | `LABORATORY`, `ADMIN` |
| `POST` | `/api/products/{id}/shipment` | Dispatch cold-chain shipment | `DISTRIBUTOR`, `ADMIN` |
| `POST` | `/api/products/{id}/delivery` | Confirm shipment delivery receipt | `DISTRIBUTOR`, `RETAILER`, `ADMIN` |
| `POST` | `/api/products/{id}/retail` | Stock product into retail store | `RETAILER`, `ADMIN` |
| `POST` | `/api/products/{id}/report` | Flag batch as suspicious / counterfeit | Authenticated |

### Public Verification & Blockchain (`/api/verify`, `/api/blockchain`)
| Method | Endpoint | Description | Access |
|:---|:---|:---|:---|
| `GET` | `/api/verify/{batchId}` | Public lookup of full provenance timeline | Public |
| `GET` | `/api/blockchain/stats` | Network status, block height & total txs | Public |
| `GET` | `/api/blockchain/transactions` | Query recent on-chain transactions | Public |

---

## 📁 Project Directory Structure

```
Blockchain Botanical Traceability/
├── contracts/                        # Smart Contracts
│   └── BotanicalTraceability.sol     # Main Solidity Traceability Contract
├── scripts/                          # Hardhat Deployment & Seeding Scripts
│   └── deploy.cjs                    # Deploys contract and seeds initial on-chain batch
├── test/                             # Hardhat Test Suite
│   └── BotanicalTraceability.test.cjs
├── backend/                          # Spring Boot 3 Java Backend
│   ├── src/main/java/com/florachain/backend/
│   │   ├── config/                   # SecurityConfig, DataInitializer, PasswordEncoder
│   │   ├── controller/               # REST Controllers (Auth, Product, Lab, etc.)
│   │   ├── dto/                      # Request / Response Data Transfer Objects
│   │   ├── entity/                   # JPA Database Entities
│   │   ├── enums/                    # Roles, Statuses, Cultivation Methods
│   │   ├── exception/                # Global Exception Handler & Custom Errors
│   │   ├── repository/               # Spring Data JPA Repositories
│   │   ├── security/                 # JWT Authentication Filter & Token Provider
│   │   └── service/                  # Business Services & Web3j Blockchain Bridge
│   ├── src/main/resources/           # application.yml, application-dev.yml, application-prod.yml
│   ├── Dockerfile                    # Multi-stage Maven backend container build
│   └── pom.xml                       # Maven Dependencies (Spring Boot, Web3j, JJWT, Postgres)
├── src/                              # React 18 Frontend
│   ├── components/                   # Reusable UI Components
│   │   ├── blockchain/               # Blockchain explorer & transaction cards
│   │   ├── common/                   # Modal, Badge, StatCard, PageHeader
│   │   ├── layout/                   # Navbar, Footer, AppLayout
│   │   ├── timeline/                 # Interactive Supply Chain Timeline
│   │   └── verification/             # QR Scanner & Certificate Viewer
│   ├── context/                      # AuthContext & BlockchainContext
│   ├── data/                         # Mock & Initial Seed Data
│   ├── pages/                        # Role-Specific Dashboard Pages
│   │   ├── admin/                    # Admin Dashboard, User Approvals, Explorer, Reports
│   │   ├── auth/                     # LoginPage, RegisterPage
│   │   ├── distributor/              # Distributor Dashboard, Create Shipment
│   │   ├── farmer/                   # Farmer Dashboard, Register Product
│   │   ├── laboratory/               # Lab Dashboard, Record Test
│   │   ├── processor/                # Processor Dashboard, Process Batch
│   │   ├── public/                   # Landing Page, Verify Product Page
│   │   └── retailer/                 # Retailer Dashboard, Generate QR
│   ├── routes/                       # AppRoutes.tsx & ProtectedRoute.tsx
│   ├── services/                     # Axios API Client & Web3 Ethers Service
│   ├── types/                        # TypeScript Interfaces & Enums
│   ├── App.tsx                       # Root Component
│   ├── main.tsx                      # Application Entry Point
│   └── index.css                     # Tailwind CSS & Global Styles
├── docker-compose.yml                # Multi-container orchestration (PostgreSQL & Backend)
├── hardhat.config.cjs                # Hardhat Configuration
├── package.json                      # Node.js Dependencies & NPM Scripts
├── tailwind.config.js                # Tailwind Theme & Color Customizations
├── tsconfig.json                     # TypeScript Configuration
└── vite.config.ts                    # Vite Build Configuration
```

---

## 📦 Prerequisites

Ensure you have the following installed on your workstation:
- **Node.js**: `v18.x` or `v20.x` ([Download](https://nodejs.org/))
- **Java Development Kit (JDK)**: `JDK 17` or `JDK 20+` ([Download OpenJDK](https://adoptium.net/))
- **Apache Maven**: `3.9+` (or use the included `./mvnw` / `mvnw.cmd` wrapper)
- **Git**: For version control
- **Docker & Docker Compose** *(Optional, for containerized deployment)*

---

## 🚀 Getting Started & Local Setup

You can run the entire platform locally using the following steps:

### 1. Smart Contract & Local EVM Node

In the project root directory:

```bash
# Install Node.js dependencies
npm install

# Compile the Solidity smart contracts
npm run compile

# Launch a local Hardhat EVM blockchain node (Keep this terminal running)
npm run node:blockchain
```

In a second terminal, deploy the smart contract and seed initial test records:

```bash
npm run deploy:contracts
```
> Note the deployed contract address (typically `0x5FbDB2315678afecb367f032d93F642f64180aa3`).

---

### 2. Spring Boot 3 Backend

The backend is configured by default to run with the `dev` profile using an in-memory **H2 database** and connects to your local Hardhat node at `http://127.0.0.1:8545`.

Navigate to the `backend` folder:

```bash
cd backend

# On Windows:
.\mvnw.cmd spring-boot:run

# On Linux / macOS:
./mvnw spring-boot:run
```

The Spring Boot backend will start on **`http://localhost:8080`**.
- H2 Web Console: `http://localhost:8080/h2-console`
  - JDBC URL: `jdbc:h2:mem:florachain_db`
  - Username: `sa` | Password: *(blank)*

---

### 3. React + Vite Frontend

In the root directory, launch the Vite development server:

```bash
# Start the frontend dev server
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

### 4. Docker Compose (Full Stack)

To run the full stack with **PostgreSQL 16** and the **Spring Boot backend** containerized:

```bash
docker-compose up -d --build
```

---

## 🔑 Pre-Seeded Demo Credentials

The application comes pre-populated with ready-to-use persona accounts. You can log in using these credentials or use the **1-Click Persona Selector** directly on the Login page:

| Persona / Role | Name | Email | Password | Organization |
|:---|:---|:---|:---|:---|
| **Consortium Admin** | Dr. Evelyn Vance | `admin@florachain.org` | `password123` | Botanical Traceability Consortium |
| **Organic Farmer** | Rajesh Patel | `rajesh@vedicfarms.org` | `password123` | Vedic Agro Organic Cooperative |
| **Extract Processor** | Marcus Thorne | `marcus@phytoextracts.com` | `password123` | PhytoExtracts Bio-Refining Ltd |
| **Certified Lab** | Dr. Ananya Sharma | `ananya@agrilabs.ch` | `password123` | Eurofins AgriBio Analytics Lab |
| **Cold-Chain Distributor**| Klaus Lindner | `klaus@coldchainlogistics.de` | `password123` | TransGlobal Cold-Chain Logistics |
| **Retail Dispensary** | Sophia Laurent | `sophia@pureapothecary.co.uk`| `password123` | Pure Botanical Apothecary London |

---

## 🧪 Testing & Verification

### Smart Contract Tests
Execute the comprehensive Hardhat test suite validating role access, state progression, and error reversions:
```bash
npm run test:contracts
```

### Backend Automated Tests
Run JUnit 5 and Spring Security integration tests:
```bash
cd backend
./mvnw test
```

### Frontend Typecheck & Build Validation
```bash
npm run build
```

---

## 🔒 Security & Data Integrity

1. **Role-Based Modifier Checks**: Critical state changes on the smart contract (`registerHarvest`, `recordProcessing`, `recordLabTest`, `recordShipment`, `recordRetailReceipt`) are guarded by `onlyRole(...)` checks.
2. **Stateless JWT Authentication**: Passwords hashed with BCrypt (strength 12), with cryptographic signature verification on every HTTP request.
3. **Data Scoping & Isolation**: Non-admin stakeholders only receive data records scoped to their identity and organization.
4. **Input Sanitization & Validation**: Jakarta Validation API on all incoming DTO requests prevents injection attacks and payload corruption.
5. **CORS & CSRF Protection**: Explicit origin whitelisting configured for authorized client frontend hosts.

---

## 🗺️ Roadmap

- [x] Hardhat EVM Smart Contract (`BotanicalTraceability.sol`)
- [x] Multi-Role Authentication with Spring Security 6 & JWT
- [x] Spring Boot REST API & Web3j Blockchain Bridge
- [x] Role-Scoped Dashboards (Admin, Farmer, Processor, Lab, Distributor, Retailer)
- [x] Public Consumer Verification Portal & QR Code Generator
- [ ] Automated IoT Temperature & Humidity Sensor Telemetry via MQTT
- [ ] Zero-Knowledge Proofs (ZK-SNARKs) for proprietary extraction formula confidentiality
- [ ] Native Mobile App (React Native / Flutter) for offline barcode scanning at farm gates

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).

---

<p align="center">
  Built with 🌿 for transparent, sustainable, and authentic botanical supply chains worldwide.
</p>
