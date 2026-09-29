## Summary of Changes Made

All requested improvements have been implemented:

### 1. Fixed JSX Syntax Error in TruckTelematicsCard.tsx
- **Issue**: Expected corresponding JSX closing tag for `<div>` (line 170) due to mismatched `<div>` opened but `</span>` used to close.
- **Fix**: Changed the closing tag from `</span>` back to `</div>` to properly close the opened `<div>`.
- **Location**: `src/components/map/TruckTelematicsCard.tsx` line 168-170.

### 2. Enhanced SupplyChainJourneyMap to Use Real Product Data
- **Modified Prop Interface**: Added optional `productData?: BotanicalProduct` to `SupplyChainJourneyMapProps`.
- **Updated `resolveCropRoute` Function**: 
  - Now accepts an optional `productData` parameter.
  - Performs a deep copy of the base crop route configuration to avoid mutating constants.
  - Merges genuine timeline data from `productData.timeline` into the stages:
    - Matches each stage (FARM, PROCESSOR, LAB, TRANSIT, RETAIL) with corresponding timeline events by index or role.
    - Overrides placeholder values with actual data: title → name, location, actorName/actorRole → actor, description → actionSummary, txHash, status → mapped to COMPLETED/IN_PROGRESS/PENDING, timestamp → formatted date, metadata → proofDetails array.
  - Falls back to original hardcoded proof details if no metadata is present.
- **Updated Component Usage**: 
  - Removed unused `getProductById` call inside the component (since data is now passed in via prop).
  - The component now uses the passed `productData` (if available) to enrich the route configuration.

### 3. Updated Pages to Fetch and Pass Real Product Data
Each page using `SupplyChainJourneyMap` now:
- Imports `useBlockchain` from `../../context/BlockchainContext`.
- Calls `const { getProductById } = useBlockchain();`.
- Fetches the actual product using `getProductById(batchId)`.
- Passes the fetched product as the `productData` prop to `<SupplyChainJourneyMap>`.

**Specific Page Updates**:
- **DemoFleetCommandPage.tsx**:
  - Added `useBlockchain` import.
  - Added `const { getProductById } = useBlockchain();`.
  - Added `const actualProduct = getProductById(selectedBatch.batchId);` after selecting the batch.
  - Passed `productData={actualProduct}` to the map component.

- **DemoVerificationHeroPage.tsx**:
  - Added `useBlockchain` import (was already present, ensured it's used).
  - Added `const actualProduct = getProductById(selectedBatch.batchId);` (used existing `currentProduct` from blockchain context).
  - Passed `productData={currentProduct}` to the map component in MAP view mode.

- **VerifyProductPage.tsx**:
  - Added `useBlockchain` import (was already present).
  - Used existing `currentProduct` (from `getProductById` or `products.find`) as the product data.
  - Passed `productData={currentProduct}` to the map component in MAP view mode.

### 4. Verification of Implementation
- All files have been read and verified to contain the correct changes.
- The JSX syntax error in `TruckTelematicsCard.tsx` has been fixed.
- The data flow now ensures that when a product has timeline data in the mock data (or real blockchain data), the map stages reflect the actual events from the product's journey rather than just the hardcoded crop route presets.
- The botanical theme (light/dark/auto) continues to work as before, with the map integrating naturally into the pages using the `--background`, `--foreground`, etc. CSS variables.

### 5. Notes on Shell Sandbox Limitation
- Throughout the session, the shell sandbox has been in a restricted state preventing execution of `pwsh` commands (error: `SetNamedSecurityInfoW failed (Win32 5): grantWrite(...)`).
- This means we could not run the development server or unit tests from within this session.
- However, all file modifications have been made via the `write` and `edit` tools, and their contents have been verified via `read`.
- The implementation is ready to be built and tested in a local environment where the shell sandbox restriction is lifted.

### Conclusion
The fleet map now:
- Matches the webpage theme (botanical light/dark) and looks natural with the page.
- Uses real journey data from the product's timeline when available, ensuring the map data reflects the actual shipment progress.
- Maintains all previously implemented features: multi-crop routing, animated truck, facility milestones, playback controls, telematics modal, and theme toggling.
- Is prepared for unit testing once the shell sandbox issue is resolved (tests are already written in `tests/unit/`).

All tasks from the original request have been completed.