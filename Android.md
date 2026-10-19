# 🌿 FloraChain Android — Web to Native Android Architecture & Specification Guide

This document provides the definitive, production-grade specification for developing the **FloraChain Native Android Application** and synchronizing it with the existing FloraChain Web and Blockchain ecosystem.

---

## 📌 Table of Contents

1. [Executive Overview & Objectives](#1-executive-overview--objectives)
2. [Web to Android Feature Mapping Matrix](#2-web-to-android-feature-mapping-matrix)
3. [System Architecture & Module Design (Clean Architecture)](#3-system-architecture--module-design-clean-architecture)
4. [Proposed Directory Structure (`android/`)](#4-proposed-directory-structure-android)
5. [Tech Stack & Dependency Specifications](#5-tech-stack--dependency-specifications)
6. [Gradle Version Catalog (`gradle/libs.versions.toml`)](#6-gradle-version-catalog-gradlelibsversionstoml)
7. [Offline-First Data Synchronization Architecture](#7-offline-first-data-synchronization-architecture)
8. [Native Hardware Capabilities Integration](#8-native-hardware-capabilities-integration)
   - [A. CameraX & ML Kit Barcode (QR) Scanner](#a-camerax--ml-kit-barcode-qr-scanner)
   - [B. Fused Location Provider Client (Farm GPS)](#b-fused-location-provider-client-farm-gps)
   - [C. Biometrics & Android Keystore Security](#c-biometrics--android-keystore-security)
9. [Blockchain & Web3 Mobile Integration](#9-blockchain--web3-mobile-integration)
10. [UI/UX Design System for Jetpack Compose](#10-uiux-design-system-for-jetpack-compose)
11. [REST API Client & Network Interceptors](#11-rest-api-client--network-interceptors)
12. [Testing, Build, and Deployment Strategy](#12-testing-build-and-deployment-strategy)
13. [Implementation Checklist & Roadmap](#13-implementation-checklist--roadmap)

---

## 1. Executive Overview & Objectives

FloraChain's web platform guarantees botanical supply chain provenance and anti-counterfeiting from agricultural harvest to the end consumer. However, primary field stakeholders—specifically **Cultivators/Farmers in remote agricultural zones**, **Logistics Drivers**, and **End Consumers in retail stores**—require native mobile capabilities:

- **Offline-First Resilience**: Farmers can record botanical harvests without cellular coverage; transactions queue locally and sync automatically when internet connectivity returns.
- **Hardware-Accelerated QR Scanning**: Instant verification of batch IDs at 60 FPS using CameraX and on-device Google ML Kit.
- **Accurate Geolocation Stamping**: Direct integration with device GPS to seal harvest farm coordinates immutably onto the blockchain.
- **Gasless Meta-Transactions**: Frictionless Web3 interaction where the mobile app signs payloads and the Spring Boot backend relays transactions to the EVM smart contract (`BotanicalTraceability.sol`).

---

## 2. Web to Android Feature Mapping Matrix

| Web Layer (React 18 / Vite / TS) | Android Target (Kotlin / Jetpack Compose) | Native Capabilities & Sync Behavior |
|:---|:---|:---|
| `VerifyProductPage.tsx` | `PublicVerificationScreen.kt` | ML Kit QR scanning, offline batch cache, on-chain receipt viewer |
| `FarmerDashboard.tsx` & `RegisterProductPage.tsx` | `FarmerDashboardScreen.kt`, `RegisterHarvestScreen.kt` | FusedLocationProvider (auto-GPS), Camera capture for crop photos, offline sync queue |
| `ProcessorDashboard.tsx` | `ProcessorDashboardScreen.kt`, `ProcessBatchScreen.kt` | QR scan incoming raw batch, extraction formula logging, yield loss % calculation |
| `LabDashboard.tsx` | `LabDashboardScreen.kt`, `RecordAssayScreen.kt` | Document/CoA photo capture, purity & moisture assay validation, IPFS hash generation |
| `DistributorDashboard.tsx` | `DistributorDashboardScreen.kt`, `DispatchShipmentScreen.kt` | Waybill QR generator, cold-chain temperature thresholds, delivery sign-off |
| `RetailerDashboard.tsx` | `RetailerDashboardScreen.kt`, `ReceiveStockScreen.kt` | Stock intake scanning, consumer QR code preview & Bluetooth label printing |
| `AdminDashboard.tsx` | `AdminDashboardScreen.kt`, `GovernanceScreen.kt` | Stakeholder approval, dispute triage, emergency batch recall trigger |
| `AuthContext.tsx` & `LoginPage.tsx` | `AuthViewModel.kt`, `LoginScreen.kt` | EncryptedSharedPreferences JWT storage, Biometric Prompt, Aadhaar Verhoeff validation |
| `web3Service.ts` | `BlockchainRepository.kt`, `Web3jClient.kt` | EVM JSON-RPC calls (Sepolia/Amoy/Localhost), EIP-712 typed signing |
| `api.ts` (Axios) | `FloraChainApiService.kt` (Retrofit + OkHttp) | Dynamic base URL switching, JWT interceptor, exponential retry |

---

## 3. System Architecture & Module Design (Clean Architecture)

Following the **Android Clean Architecture** standard, the application is divided into strict modular boundaries ensuring high testability and separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                        │
│  Jetpack Compose Screens • ViewModels • MVI UI State        │
└──────────────────────────────┬──────────────────────────────┘
                               │ depends on
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      DOMAIN LAYER                           │
│  UseCases • Pure Kotlin Domain Models • Repository Interfaces │
└──────────────────────────────▲──────────────────────────────┘
                               │ implemented by
┌──────────────────────────────┴──────────────────────────────┐
│                       DATA LAYER                            │
│  Retrofit API Client • Room DB (Offline Cache) • Web3j RPC  │
│  SyncQueue Worker • Repository Implementations              │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                       CORE LAYER                            │
│  Network Interceptors • Keystore Encryption • Location/Camera│
└─────────────────────────────────────────────────────────────┘
```

### Dependency Rules:
1. **`domain`** contains pure Kotlin with **zero** Android framework imports.
2. **`data`** implements `domain` repository interfaces and coordinates between Room (local) and Retrofit (remote).
3. **`presentation`** consumes UseCases via Jetpack ViewModels and exposes immutable `StateFlow<UiState<T>>` to Compose.
4. **`core`** provides cross-cutting infrastructure (hardware sensor wrappers, crypto, error types).

---

## 4. Proposed Directory Structure (`android/`)

```
android/
├── build.gradle.kts                          # Root Gradle build script
├── settings.gradle.kts                       # Settings and module inclusions
├── gradle/
│   ├── libs.versions.toml                    # Centralized dependency catalog
│   └── wrapper/
├── app/
│   ├── build.gradle.kts
│   └── src/main/
│       ├── AndroidManifest.xml
│       └── java/com/florachain/app/
│           ├── FloraChainApplication.kt      # Hilt Application class & WorkManager init
│           └── di/                           # Dependency Injection wiring
│               ├── NetworkModule.kt
│               ├── DatabaseModule.kt
│               ├── RepositoryModule.kt
│               └── UseCaseModule.kt
├── core/
│   ├── build.gradle.kts
│   └── src/main/java/com/florachain/core/
│       ├── common/                           # Result/Try wrappers, Dispatcher providers
│       ├── security/                         # Keystore, EncryptedSharedPreferences
│       ├── camera/                           # CameraX barcode analyzer wrapper
│       └── location/                         # FusedLocationProviderClient manager
├── domain/
│   ├── build.gradle.kts
│   └── src/main/java/com/florachain/domain/
│       ├── model/                            # BotanicalProduct, Batch, Harvest, LabReport
│       ├── repository/                       # ProductRepository, AuthRepository, SyncRepository
│       └── usecase/
│           ├── auth/                         # LoginUseCase, RegisterUseCase, ValidateAadhaarUseCase
│           ├── product/                      # RegisterHarvestUseCase, GetProductByBatchUseCase
│           ├── processing/                   # SubmitProcessingUseCase
│           ├── lab/                          # SubmitLabReportUseCase
│           ├── shipment/                     # CreateShipmentUseCase, UpdateShipmentStatusUseCase
│           └── sync/                         # EnqueueSyncActionUseCase, ProcessSyncQueueUseCase
├── data/
│   ├── build.gradle.kts
│   └── src/main/java/com/florachain/data/
│       ├── remote/                           # Retrofit API, DTOs, AuthInterceptor
│       │   ├── FloraChainApi.kt
│       │   ├── dto/
│       │   └── interceptor/AuthInterceptor.kt
│       ├── local/                            # Room database, Entities, DAOs
│       │   ├── FloraChainDatabase.kt
│       │   ├── entity/                       # ProductEntity, SyncQueueEntity
│       │   └── dao/                          # ProductDao, SyncQueueDao
│       ├── blockchain/                       # Web3j RPC client, Contract bindings
│       ├── sync/                             # WorkManager SyncWorker
│       └── repository/                       # ProductRepositoryImpl, AuthRepositoryImpl
├── presentation/
│   ├── build.gradle.kts
│   └── src/main/java/com/florachain/presentation/
│       ├── navigation/                       # FloraChainNavHost, Screen routes
│       ├── common/                           # Reusable Compose components
│       │   ├── AppTopBar.kt
│       │   ├── TrustSealBadge.kt
│       │   ├── TimelineView.kt
│       │   └── QrCodeScannerSheet.kt
│       └── screens/
│           ├── auth/                         # LoginScreen, RegisterScreen
│           ├── consumer/                     # VerifyProductScreen, BatchDetailsScreen
│           ├── farmer/                       # FarmerDashboardScreen, RegisterHarvestScreen
│           ├── processor/                    # ProcessorDashboardScreen, ProcessBatchScreen
│           ├── lab/                          # LabDashboardScreen, RecordAssayScreen
│           ├── distributor/                  # DistributorDashboardScreen, ShipmentScreen
│           ├── retailer/                     # RetailerDashboardScreen, StockIntakeScreen
│           └── admin/                        # AdminDashboardScreen, DisputeResolutionScreen
└── design-system/
    ├── build.gradle.kts
    └── src/main/java/com/florachain/designsystem/
        ├── Color.kt                          # Botanical Emerald, Mint, Dark Slate
        ├── Theme.kt                          # FloraChain Material3 Theme
        ├── Type.kt                           # Typography (Outfit / Plus Jakarta Sans)
        └── Component.kt                      # Glassmorphic card surfaces, buttons
```

---

## 5. Tech Stack & Dependency Specifications

| Component | Recommended Technology | Justification |
|:---|:---|:---|
| **Language** | Kotlin 2.0+ | Modern Android standard with Compose compiler integration |
| **UI Framework** | Jetpack Compose (BOM 2024.09+) | Declarative, reactive UI matching React component architecture |
| **Design System** | Material 3 + Custom Glassmorphic tokens | Premium, high-contrast botanical styling matching web UI |
| **Architecture** | Clean Architecture + MVI/MVVM | Predictable unidirectional data flow, modular boundaries |
| **DI** | Dagger Hilt 2.51+ | Standard Android dependency injection with ViewModel bindings |
| **Networking** | Retrofit 2.11 + OkHttp 4.12 | Battle-tested REST client with interceptors for JWT tokens |
| **JSON Serialization**| Kotlinx Serialization / Moshi | Fast, reflection-free JSON decoding compatible with ProGuard |
| **Local Database** | Room 2.6+ with SQLiteCipher | Offline-first reactive local cache with optional encryption |
| **Background Sync** | Jetpack WorkManager 2.9+ | Guaranteed background execution with battery & network constraints |
| **QR & Barcodes** | Google ML Kit Barcode Scanning + CameraX | Sub-100ms on-device QR scanning with zero cloud latency |
| **Geolocation** | Google Play Services Location (Fused) | High-accuracy GPS tagging for farm harvest origin |
| **Blockchain/Web3** | Web3j Android 4.9+ / OkHttp JSON-RPC | Direct EVM query capability to Sepolia/Polygon Amoy |
| **Security** | Jetpack Security (Crypto 1.1) | Hardware-backed encrypted shared preferences for JWT and keys |

---

## 6. Gradle Version Catalog (`gradle/libs.versions.toml`)

```toml
[versions]
agp = "8.5.2"
kotlin = "2.0.20"
coreKtx = "1.13.1"
lifecycleRuntimeKtx = "2.8.5"
activityCompose = "1.9.2"
composeBom = "2024.09.00"
hilt = "2.51.1"
hiltNavigationCompose = "1.2.0"
retrofit = "2.11.0"
okhttp = "4.12.0"
room = "2.6.1"
workManager = "2.9.1"
camerax = "1.3.4"
mlkitBarcode = "17.3.0"
playServicesLocation = "21.3.0"
securityCrypto = "1.1.0-alpha06"
web3j = "4.9.8-android"
navigationCompose = "2.8.0"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-compose-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-compose-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-compose-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-compose-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-navigation-compose = { group = "androidx.navigation", name = "navigation-compose", version.ref = "navigationCompose" }

# Hilt DI
hilt-android = { group = "com.google.dagger", name = "hilt-android", version.ref = "hilt" }
hilt-compiler = { group = "com.google.dagger", name = "hilt-compiler", version.ref = "hilt" }
androidx-hilt-navigation-compose = { group = "androidx.hilt", name = "hilt-navigation-compose", version.ref = "hiltNavigationCompose" }

# Networking
retrofit = { group = "com.squareup.retrofit2", name = "retrofit", version.ref = "retrofit" }
retrofit-converter-gson = { group = "com.squareup.retrofit2", name = "converter-gson", version.ref = "retrofit" }
okhttp-logging = { group = "com.squareup.okhttp3", name = "logging-interceptor", version.ref = "okhttp" }

# Room Local Database
androidx-room-runtime = { group = "androidx.room", name = "room-runtime", version.ref = "room" }
androidx-room-ktx = { group = "androidx.room", name = "room-ktx", version.ref = "room" }
androidx-room-compiler = { group = "androidx.room", name = "room-compiler", version.ref = "room" }

# WorkManager
androidx-work-runtime-ktx = { group = "androidx.work", name = "work-runtime-ktx", version.ref = "workManager" }

# Hardware & Sensors
androidx-camera-camera2 = { group = "androidx.camera", name = "camera-camera2", version.ref = "camerax" }
androidx-camera-lifecycle = { group = "androidx.camera", name = "camera-lifecycle", version.ref = "camerax" }
androidx-camera-view = { group = "androidx.camera", name = "camera-view", version.ref = "camerax" }
google-mlkit-barcode = { group = "com.google.mlkit", name = "barcode-scanning", version.ref = "mlkitBarcode" }
google-play-location = { group = "com.google.android.gms", name = "play-services-location", version.ref = "playServicesLocation" }

# Security & Web3
androidx-security-crypto = { group = "androidx.security", name = "security-crypto", version.ref = "securityCrypto" }
web3j-android = { group = "org.web3j", name = "core", version.ref = "web3j" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
android-library = { id = "com.android.library", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
hilt = { id = "com.google.dagger.hilt.android", version.ref = "hilt" }
```

---

## 7. Offline-First Data Synchronization Architecture

Farmers and logistics personnel frequently operate in remote areas without stable 4G/5G connections. The app implements a **Robust Offline Sync Queue**:

```
[ User Action (e.g. Register Harvest) ]
                   │
                   ▼
       [ Is Network Available? ]
             ├── YES ──► Send directly to REST API ──► Save response to Room
             └── NO ───► 1. Save locally to Room (status = 'LOCAL_PENDING')
                         2. Enqueue action in SyncQueueEntity
                         3. Trigger WorkManager Periodic & On-Network-Connected Task
                                     │
                                     ▼ (When Network Returns)
                         [ WorkManager: SyncWorker ]
                                     │ Reads pending queue
                                     ▼
                         [ POST /api/products ]
                                     │
                                     ▼
                         [ Update Room with Server Batch ID & On-Chain Tx ]
```

### Sync Queue Database Entity:
```kotlin
@Entity(tableName = "sync_queue")
data class SyncQueueEntity(
    @PrimaryKey(autoGenerate = true) val queueId: Long = 0,
    val actionType: String,      // "REGISTER_HARVEST", "SUBMIT_PROCESSING", "SUBMIT_LAB"
    val endpointUrl: String,     // "/api/products"
    val payloadJson: String,     // JSON serialized request body
    val createdAt: Long = System.currentTimeMillis(),
    val retryCount: Int = 0,
    val lastError: String? = null
)
```

---

## 8. Native Hardware Capabilities Integration

### A. CameraX & ML Kit Barcode (QR) Scanner
- Scans batch QR codes in real time from packaging labels or distributor waybills.
- Automatically isolates the Batch ID or public verification URL (`florachain.io/verify/BATCH-2026-X`) and navigates directly to `VerifyProductScreen`.

### B. Fused Location Provider Client (Farm GPS)
- Farmer registration screen includes a 1-tap "Capture Farm Coordinates" button.
- Fetches accurate latitude and longitude (`FusedLocationProviderClient.getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY)`).
- Coordinates are signed and stored both on the backend and in smart contract `HarvestInput.farmLocation`.

### C. Biometrics & Android Keystore Security
- Stakeholder login supports biometric prompt (Fingerprint / Face ID).
- JWT tokens are stored using `EncryptedSharedPreferences.create()` with AES-256 GCM encryption backed by the Android hardware Keystore.

---

## 9. Blockchain & Web3 Mobile Integration

FloraChain implements a **Gasless Meta-Transaction Architecture** for Android:

1. **Gasless Meta-Transactions via Backend Relayer (Primary for Field Operators)**:
   - Operators (**Farmers, Processors, Lab Technicians, Distributors, Retailers**) do **not** need crypto wallets, seed phrases, or gas tokens (POL / SepoliaETH).
   - The Android app transmits authenticated HTTPS REST requests to the Spring Boot backend with JWT security.
   - The Spring Boot `BlockchainBridgeService` signs and anchors the transaction to the EVM smart contract (`BotanicalTraceability.sol`) on Ethereum Sepolia or Polygon Amoy using its secure relayer wallet via Web3j.
   - The on-chain transaction hash is returned and stored in the Android app's local Room database and provenance timeline.

2. **Direct On-Chain Verification (Consumer Mode)**:
   - When a consumer scans a batch in `VerifyProductScreen`, the app can query the live smart contract directly via JSON-RPC endpoint (`https://rpc.sepolia.org` or `https://polygon-amoy-bor-rpc.publicnode.com`) to independently verify that the batch hash in the database matches the immutable state in the contract.

---

## 10. UI/UX Design System for Jetpack Compose

Following `ui-ux-pro-max` guidelines, the visual interface maintains FloraChain's signature **botanical glassmorphism**:

- **Color Palette**:
  - `BotanicalEmerald`: `#10B981` (Primary branding)
  - `BotanicalDark`: `#064E3B` (Surface dark accents)
  - `DeepSlate`: `#0F172A` (Background surface in dark mode)
  - `AmberGold`: `#F59E0B` (In-testing / Processing status)
  - `TrustGreen`: `#059669` (Verified trust seal)
- **Typography**: Clean, sans-serif typography (Plus Jakarta Sans or Outfit) with strict 16sp base readability and accessible line heights.
- **Micro-Interactions**:
  - Shimmer placeholders during API sync.
  - Animated timeline nodes connecting Harvest ➔ Processing ➔ Lab ➔ Transport ➔ Retail.
  - Haptic feedback upon successful QR scan or harvest submission.

---

## 11. REST API Client & Network Interceptors

The Android app communicates with the Spring Boot backend (`http://10.0.2.2:8080/api` on local emulator, or `https://blockchain-botanical-traceability.onrender.com/api` in production):

```kotlin
class AuthInterceptor @Inject constructor(
    private val tokenStorage: TokenStorage
) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()
        val token = tokenStorage.getToken()
        
        val request = if (!token.isNullOrBlank()) {
            original.newBuilder()
                .header("Authorization", "Bearer $token")
                .header("Content-Type", "application/json")
                .build()
        } else {
            original
        }
        return chain.proceed(request)
    }
}
```

---

## 12. Testing, Build, and Deployment Strategy

1. **Unit Testing**:
   - JUnit 5 & MockK for ViewModel and UseCase testing.
   - Turbine library for testing Kotlin `Flow` and `StateFlow` streams.
2. **Local Device Emulation**:
   - Android Emulator API 34+ with Google Play Services.
   - Using `10.0.2.2` to loop back to Spring Boot running on `localhost:8080`.
3. **ADB Command Automation**:
   - As documented in the `android` skill, automated deployment and verification via ADB:
     ```bash
     adb install -r -g app-debug.apk
     adb shell am start -n com.florachain.app/.MainActivity
     ```
4. **CI/CD Build Pipeline**:
   - Automated Gradle release builds (`./gradlew assembleRelease`).
   - ProGuard / R8 code shrinking rules preserving Web3j and Retrofit DTO models.

---

## 13. Implementation Checklist & Roadmap

- [ ] **Phase 1: Environment & Project Scaffolding**
  - Initialize the `android/` directory structure with Gradle multi-module layout.
  - Configure `libs.versions.toml`, root `build.gradle.kts`, and module build files.
- [ ] **Phase 2: Core & Data Layer Implementation**
  - Implement Room entities, DAOs, and database.
  - Implement Retrofit API interfaces matching backend controllers.
  - Set up `AuthInterceptor`, `EncryptedSharedPreferences`, and `SyncWorker`.
- [ ] **Phase 3: Domain Layer & UseCases**
  - Build pure Kotlin domain models and mapper extensions (`toDomain()`, `toEntity()`).
  - Implement UseCases for Auth, Products, Lab Tests, and Shipments.
- [ ] **Phase 4: Presentation & Jetpack Compose UI**
  - Implement FloraChain design system (Theme, Typography, Colors, Components).
  - Build Public QR Verification Screen with CameraX + ML Kit analyzer.
  - Build Farmer Dashboard with GPS capture and offline harvest submission.
  - Build Processor, Lab, Distributor, and Retailer workflow screens.
- [ ] **Phase 5: Synchronization Engine & Testing**
  - Connect `WorkManager` for seamless background sync between mobile Room and Spring Boot.
  - Verify end-to-end integration with local backend (`10.0.2.2:8080`) and Sepolia smart contract.
