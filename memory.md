# 🧠 FloraChain AI Memory & Project Architecture Guide

This document serves as the central knowledge base for AI agents operating on the **FloraChain** codebase. It outlines the architectural decisions, tech stack, data flows, and implementation details so you do not need to read the entire source code to understand how the project works.

## 🏗️ 1. Project Overview & Architecture
FloraChain is an enterprise-grade botanical supply chain provenance application.
It bridges a **Spring Boot 3 (Java) Web2 Backend** with a **React 18 (TypeScript) Web3 Frontend** and an **EVM Smart Contract (Solidity)** on the blockchain.

### Architecture Flow:
1. **Frontend (React)**: Handles UI, MetaMask integration, and state management.
2. **Backend (Spring Boot)**: Manages User Authentication (JWT), Profiles, Role-Based Access Control (RBAC), and mirrors supply chain data in a relational database (H2/PostgreSQL).
3. **Smart Contract (Solidity)**: Acts as the single source of truth for the provenance timeline, guaranteeing immutability.
4. **Relayer (Meta-Transactions)**: To spare users from paying gas fees, the frontend leverages an embedded "Admin" relayer wallet that wraps user EIP-712 signatures and submits them to an `ERC2771Forwarder` on-chain.

## 🛠️ 2. Technology Stack
- **Smart Contracts**: Solidity `0.8.24` (Targeting `cancun` EVM), Hardhat, OpenZeppelin v5 (`ERC2771Context`, `ERC2771Forwarder`).
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Ethers.js v6.
- **Backend**: Java 20, Spring Boot 3.3.3, Spring Security (JWT), Web3j, Spring Data JPA, H2 (dev), PostgreSQL (prod).

## 🗄️ 3. Directory Structure
- `/contracts`: Contains `BotanicalTraceability.sol`.
- `/scripts`: Hardhat deployment scripts (`deploy.cjs`).
- `/backend`: The Maven/Spring Boot project.
  - `/backend/src/main/java/com/florachain/backend`: Core Java code.
    - `/controller`: REST APIs (`AuthController`, `ProductController`, etc.).
    - `/service`: Business logic (`AuthService`, `ProductService`).
    - `/entity` & `/dto`: JPA Models and Data Transfer Objects.
    - `/security`: JWT Token filters and authentication.
- `/src`: The React frontend code.
  - `/src/context`: React Contexts (`AuthContext.tsx`, `BlockchainContext.tsx`).
  - `/src/services`: `api.ts` (Axios for backend) and `web3Service.ts` (Ethers.js for blockchain).
  - `/src/pages`: Role-specific UI dashboards (Farmer, Processor, etc.).

## 🔐 4. Authentication & Identity
- **JWT & Role-Based Access**: 
  - Users register via `/api/auth/register`. 
  - Roles (`FARMER`, `PROCESSOR`, `LABORATORY`, `DISTRIBUTOR`, `RETAILER`, `ADMIN`) are assigned and enforced by both the Spring Boot backend (`@PreAuthorize`) and the Smart Contract (`onlyRole` modifier).
- **Aadhaar e-KYC**:
  - The platform integrates Aadhaar validation during registration.
  - Uses the **Verhoeff Algorithm** for checksum validation.
  - Features a simulated OTP flow in the UI to mimic government e-KYC verification.
  - Aadhaar numbers are tracked in `UserEntity` (Backend) and `AuthContext` (Frontend).

## ⛓️ 5. Blockchain Integration & Meta-Transactions
- **Dual-Write Mechanism**: When a user performs an action (e.g., Register Harvest), the frontend writes to BOTH the backend database (via Axios) and the Blockchain (via Ethers.js).
- **Gasless Meta-Transactions**:
  - The smart contract inherits OpenZeppelin's `ERC2771Context`.
  - Instead of standard transaction execution, the frontend `web3Service.ts` prompts the user to sign a **Typed Data (EIP-712)** `ForwardRequest` using MetaMask (which costs no gas).
  - The frontend then uses a pre-funded local "Admin" private key (the Relayer) to submit this signature to the `ERC2771Forwarder` smart contract.
  - Inside the smart contract, `_msgSender()` successfully resolves to the original user's address, keeping RBAC intact while the Relayer pays the gas.

## 📝 6. Supply Chain State Machine
The lifecycle of a botanical batch is strictly enforced:
1. `REGISTERED` (Farmer)
2. `PROCESSED` (Processor)
3. `APPROVED` / `REJECTED` (Laboratory QA)
4. `IN_TRANSIT` (Distributor)
5. `DELIVERED` (Distributor)
6. `RETAIL_READY` (Retailer)
7. `SUSPICIOUS` / `RECALLED` (Admin/Consortium)

## 🚀 7. Running the Project Locally
To run the full stack locally:
1. **Terminal 1 (Blockchain)**: `npm run node:blockchain`
2. **Terminal 2 (Deploy Contract)**: `npm run deploy:contracts`
3. **Terminal 3 (Backend)**: `cd backend && ./mvnw spring-boot:run`
4. **Terminal 4 (Frontend)**: `npm run dev`

## 💡 8. Key Developer Notes
- **Web3Service (`src/services/web3Service.ts`)**: Look here for all Ethereum/Ethers.js interactions. The `signAndRelayMetaTransaction` function is the core of the gasless implementation.
- **Contract Compilation**: The `hardhat.config.cjs` uses `evmVersion: "cancun"` to support the `mcopy` opcode used by OpenZeppelin v5.
- **Backend Port**: Spring Boot runs on `8080`.
- **Frontend Port**: Vite runs on `5173` (or `5174` if `5173` is busy).
- **Artifact Generation**: Deploying the contract automatically generates `src/contracts/contractConfig.json`, feeding the ABI and forwarder addresses to the React frontend.
