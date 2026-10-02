# Milestone 2.3 — Source Wording, Action Sheet Consistency, Loading UX & Public Repository Environment Report

**TerraShaft: Climate-Resilient Crop Rotation Decision-Support System**  
**Repository:** [https://github.com/vellumgracia-del/TerraShaft](https://github.com/vellumgracia-del/TerraShaft)  
**Date of Execution:** October 2, 2026  
**Status:** Completed & Fully Validated

---

## 1. Executive Summary

Milestone 2.3 focused strictly on scientific transparency, terminology honesty, Action Sheet state synchronization, loading state integrity, and environment security hardening for future public repository distribution.

Key achievements in Milestone 2.3:
1. **Scientific Integrity & Truthful Terminology**: Replaced misleading terms such as `"NASA LIVE OBSERVATION"` with `"NASA POWER API · Response received (Baseline historis 1-tahun)"`. Distinguishes external API connectivity from in-situ physical farm telemetry.
2. **Model Assimilation Precision for SMAP & Precipitation**: Clarified that SMAP `GWETROOT` is a NASA model-assimilated root-zone moisture estimate (0–100 cm), not an on-farm physical sensor probe. Corrected precipitation wording from unverified direct NASA GPM IMERG to `"NASA POWER Precipitation"` / `"NASA-derived precipitation estimate via NASA POWER daily PRECTOTCORR"`.
3. **Single Shared Source-Status Presentation Model**: Built `src/lib/provenance.ts`, centralizing `getNasaPowerDisplayStatus`, `getNasaSmapDisplayStatus`, `getNasaPrecipitationDisplayStatus`, `getSoilGridsDisplayStatus`, `getOverallDisplayStatus`, and `getActionSheetProvenanceDisplay`.
4. **Action Sheet Complete Synchronization**: Synchronized the Action Sheet modal, high-resolution canvas poster, and WhatsApp sharing text to directly consume the dashboard's active provenance state. Both poster and text outputs render source-specific lines for NASA POWER and ISRIC SoilGrids along with scientific explanatory notes.
5. **Robust Loading UX & Race-Condition Protection**: Implemented independent async fetching for NASA POWER and SoilGrids with `activeRequestId` guards to prevent late responses from old locations overwriting new locations. Provided graceful loading states so users never see unverified values labeled as live API outputs.
6. **Public Repository Environment Security**: Created `.env.example` with non-secret placeholders and safe defaults. Created `src/lib/env.ts` for typed validation and fallback boundaries. Updated `.gitignore` to prevent any `.env`, `.env.local`, or production secret leaks.

---

## 2. NASA/ISRIC Wording Changes

| UI Component | Previous (Milestone 2.2) Wording | Corrected (Milestone 2.3) Wording | Scientific Rationale |
|---|---|---|---|
| **TopHeader Badge** | `NASA LIVE · SOIL FALLBACK` / `LIVE OBSERVATION` | `NASA POWER API · SOILGRIDS FALLBACK` (sub: *NASA POWER response diterima · ISRIC SoilGrids menggunakan fallback regional*) | NASA POWER data provides historical baseline/reanalysis, not a real-time sensor observation at the farm. |
| **TopHeader (Dual Live)** | `LIVE OBSERVATION` | `NASA POWER & SOILGRIDS API OK` (sub: *Respons API diterima · baseline historis & profil tanah terverifikasi*) | Clearly indicates API responses were received without implying in-situ physical farm telemetry. |
| **SMAP Metric Card** | `SMAP (Sim)` / `SMAP L4 (API)` | `SMAP L4 (Model)` / `Regional model estimate` | Clarifies that GWETROOT is a model-assimilated satellite product (0–100 cm), not on-farm physical sensor telemetry. |
| **Precipitation** | `Presipitasi GPM (mm)` / `NASA GPM` | `Presipitasi NASA POWER (mm)` / `NASA-derived precipitation estimate via NASA POWER` | The application calls NASA POWER daily `PRECTOTCORR`, not direct NASA GPM IMERG API endpoints. |
| **SoilGrids Fallback** | `REGIONAL FALLBACK` (generic) | `ISRIC SoilGrids · Regional fallback` | Explicitly states that SoilGrids endpoint failed or timed out and calibrated regional soil profile is active. |
| **Map Insight Card** | *"Data observasi langsung satelit tidak tersedia..."* | *"Telemetri iklim bersumber dari API NASA POWER (baseline historis 1-tahun). Sifat fisik tanah menggunakan profil regional terkalibrasi Nusa Tenggara karena respons hulu SoilGrids tidak tersedia."* | Eliminates contradiction when NASA API succeeded but SoilGrids defaulted to regional fallback. |
| **Action Sheet Status** | `Status data: REGIONAL FALLBACK` | `● NASA POWER: API OK / historical baseline`<br>`● ISRIC SoilGrids: fallback regional` | Shows source-specific status for each upstream provider rather than a monolithic fallback label. |

---

## 3. Actual Source Behavior

| Source | Actual Runtime Behavior | User-Facing Wording | Fallback Behavior |
|---|---|---|---|
| **NASA POWER** | Upstream REST API proxy (`/api/nasa-climate`), fetches 1-year daily agroclimatology baseline (`PRECTOTCORR`, `T2M`, `ALLSKY_SFC_SW_DWN`, `GWETROOT`). | `NASA POWER API · Response received (Baseline historis 1-tahun)` | Failover to calibrated Nusa Tenggara regional agroclimatic baseline table (`FALLBACK_CLIMATOLOGY`). |
| **SMAP GWETROOT** | Extracted from NASA POWER daily parameter `GWETROOT` (0.00–1.00 index for 0–100 cm root zone). | `SMAP L4 · Model-assimilated root-zone moisture estimate` | Calibrated regional hydrologic moisture estimate (`0.38` default watch state). |
| **Precipitation** | Computed monthly from NASA POWER daily parameter `PRECTOTCORR`. | `NASA-derived precipitation estimate via NASA POWER` | Regional climatological precipitation averages (BMKG / regional profile). |
| **ISRIC SoilGrids** | Upstream REST API proxy (`/api/soil-profile`), queries sand, clay, silt, soc, ph, and cec for depth 0–30 cm. Currently experiences upstream HTTP 503/timeouts. | `ISRIC SoilGrids · Regional fallback` | Calibrated Nusa Tenggara regional soil profile (`REGIONAL_FALLBACK`) with pedotransfer-derived AWC. |

---

## 4. Action Sheet Synchronization

The Action Sheet modal (`src/components/modals/ActionSheetModal.tsx`) consumes the exact same active provenance and state objects used by the dashboard via Zustand `useTerraShaftStore`:

1. **Poster Canvas**:
   - Status Header Badge: Displays `overallDisplay.shortLabel` (e.g. `NASA API OK · Soil fallback`).
   - Multi-Source Provenance Block:
     - `● NASA POWER: API OK / historical baseline`
     - `● ISRIC SoilGrids: fallback regional`
   - Scientific Explanatory Note:
     > *"NASA POWER berhasil diakses melalui API. Nilai ini merupakan baseline agroklimatologi historis, bukan sensor real-time di lahan. Profil tanah sedang menggunakan fallback regional karena SoilGrids tidak tersedia."*
2. **WhatsApp Sharing Output**:
   - Synchronized text includes:
     - Target location place name, 4-decimal coordinates, and elevation.
     - Selected scenario title, composite score, and battery recovery (+delta).
     - Water-saving percentage and biological nitrogen balance.
     - 4-season crop schedule with emoji, variety, and seasonal deficit.
     - Dynamic source status bullets matching dashboard provenance.
     - Scientific disclaimer reminding farmers to validate with local agricultural extension officers (PPL).
3. **Graceful Loading State**:
   - If the user opens the Action Sheet before the optimization plan is calculated, a polite loading modal (`"Menyiapkan Lembar Aksi Lapangan..."`) is displayed with a spinning indicator, preventing blank canvas errors.

---

## 5. Loading State & Transition Architecture

TerraShaft implements explicit lifecycle states to ensure transparency during data transitions:

1. **Independent Fetch Pipeline**:
   - `fetchNasa()` and `fetchSoil()` run concurrently in `Promise.allSettled`.
   - When NASA POWER finishes in ~40ms, its live data and provenance update immediately.
   - SoilGrids continues loading until it resolves or hits its timeout (~8s), after which it enters regional fallback.
2. **Stale Request & Race Condition Protection**:
   - Each fetch call increments `activeRequestId`.
   - Any asynchronous completion from a superseded location request is discarded (`if (get().activeRequestId !== nextReqId) return null;`).
3. **Loading States Supported**:
   - `MEMUAT DATA...`: Both external endpoints pending.
   - `MEMUAT NASA POWER...`: SoilGrids ready, awaiting climate data.
   - `MEMUAT SOILGRIDS...`: NASA POWER ready, awaiting soil data.
   - `NASA POWER API · SOILGRIDS FALLBACK`: NASA succeeded, SoilGrids failover regional.
   - `NASA POWER & SOILGRIDS API OK`: Both external APIs verified.
   - `CACHED: [SOURCE]`: Cached from local memory.
   - `DEMO DATA · BUKAN OBSERVASI LIVE`: Synthetic/demonstration mode.
   - `KENDALA TELEMETRI`: Validation or network error.

---

## 6. Environment Configuration & Security

The repository is hardened for public GitHub hosting:

1. **`.env.example` Created**:
   - Contains only public URLs and safe defaults (`NEXT_PUBLIC_DATA_MODE=api`, `NASA_POWER_API_BASE_URL=https://power.larc.nasa.gov/api`, `ISRIC_SOILGRIDS_API_BASE_URL=https://rest.isric.org/soilgrids/v2.0`, `NASA_POWER_TIMEOUT_MS=8000`, `ISRIC_SOILGRIDS_TIMEOUT_MS=8000`).
   - Zero private tokens, zero fake API keys.
2. **`src/lib/env.ts` Implemented**:
   - Typed environment loader `getAppEnv()`.
   - Validates data modes (`api` | `demo`).
   - Clamps timeouts safely between 1,000ms and 60,000ms (default 8,000ms).
   - Sanitizes base URL trailing slashes.
3. **`.gitignore` Enforced**:
   - Explicitly ignores `.env`, `.env.local`, `.env.*.local`, `.env.production`, `.env.development`.
   - Whitelists only `!.env.example`.
4. **Security Audit Results**:
   - `git ls-files | Select-String -Pattern "\.env"`: No `.env` files tracked except `.env.example`.
   - Regex scan for private keys/tokens across all source files: **0 secrets found**.

---

## 7. Files Changed

### Created
- `.env.example`: Public configuration template with non-secret placeholders.
- `src/lib/env.ts`: Typed environment configuration and validation module.
- `src/lib/provenance.ts`: Shared source-status presentation model and resolvers.
- `MILESTONE_2_3_REPORT.md`: This comprehensive milestone verification report.

### Modified
- `.gitignore`: Added explicit exclusion rules for `.env` and `.env.*.local` files while whitelisting `.env.example`.
- `src/app/api/nasa-climate/route.ts`: Integrated `getAppEnv()` for base URL and timeout configuration.
- `src/app/api/soil-profile/route.ts`: Integrated `getAppEnv()` for base URL and timeout configuration.
- `src/types/provenance.ts`: Updated `resolveTerraShaftProvenance` to support partial loading per source and truthful wording (`NASA POWER & SOILGRIDS API OK`, `NASA POWER API · SOILGRIDS FALLBACK`).
- `src/store/useTerraShaftStore.ts`: Added `loadingSources` and `activeRequestId` to state; implemented independent fetching with race-condition guards; hardened error handlers.
- `src/app/page.tsx`: Added `hasInitializedRef` guard to prevent infinite re-render loops on initial mount.
- `src/components/shell/Sidebar.tsx`: Connected footer status badge and sub-label directly to `getOverallDisplayStatus(prov)`.
- `src/components/overview/SummaryMetricCards.tsx`: Switched SMAP label to `smapStatus.shortLabel` (`SMAP L4 (Model)` when live, `Regional model estimate` when fallback); added loading indicators.
- `src/components/overview/FieldOverviewCard.tsx`: Updated `getAgronomicInsight` to resolve contradictory fallback messages.
- `src/components/water/WaterBalanceCard.tsx`: Replaced misleading `GPM IMERG` labels with `Presipitasi NASA POWER`.
- `src/components/provenance/DataSourceProvenanceCard.tsx`: Updated badge styles, model list, and data limitation disclosures.
- `src/components/modals/ActionSheetModal.tsx`: Updated poster canvas with source-specific provenance block and scientific note; synchronized WhatsApp message text; added graceful loading dialog.
- `src/lib/auditLogGenerator.ts`: Updated provenance note and mode badge to accurately reflect NASA POWER baseline and SoilGrids regional fallback.
- `src/lib/__tests__/provenanceAndAudit.test.ts`: Added tests for Milestone 2.3 presentation resolvers, environment configuration, and truthful wording assertions.

---

## 8. Test Execution Results

```text
npm test: PASS (100% - All 3 test suites passed: agronomyEngine, apiProxies, provenanceAndAudit)
npm run lint: PASS (0 errors, 0 warnings)
npm run build: PASS (Compiled in 3.1s, static pages generated, dynamic API routes verified)
```

### Detailed Unit Test Output
- **Agronomy & Optimization Engine**: 1,296 combinatorial rotation permutations verified; pedotransfer AWC and texture classification passed; Soil Battery recovery (+37% to +39%) validated.
- **API Proxies & Acceptance Criteria**: All 12 acceptance criteria passed (coordinate validation, missing params, NASA live, NASA timeout, NASA malformed, NASA fallback metadata, NASA cached metadata, SoilGrids live, SoilGrids timeout, SoilGrids malformed, SoilGrids fallback metadata, SoilGrids cached metadata).
- **Milestone 2.3 Provenance & Audit**:
  - `✓ Pure LIVE mode correctly detected as API OK (not claiming real-time field observation)`
  - `✓ Partial fallback correctly reported as NASA POWER API · SOILGRIDS FALLBACK`
  - `✓ Demo mode explicitly acknowledged in provenance badge`
  - `✓ Shared source-status presentation model verified across all sources & Action Sheet`
  - `✓ Environment validation applies safe bounds and defaults`
  - `✓ Audit log dynamically synchronized with active state without stale hardcoded values`

---

## 9. Browser Verification Results

### 1. Localhost (`http://localhost:3000/`)
- **Initial Load**:
  - Header displays truthful status chip: `NASA POWER API · SOILGRIDS FALLBACK`.
  - Sub-label: `NASA POWER response diterima · ISRIC SoilGrids menggunakan fallback regional`.
  - Sidebar footer badge: `NASA API OK · Soil fallback`.
- **Summary Metric Cards**:
  - Air Zona Akar: `0.70 / 1.00` | Badge: `Memadai` | Source: `SMAP L4 (Model)`. (No `SMAP (Sim)`).
  - Baterai Tanah: `100% skor` | `+39% Charging` | `Awal: 61%`.
  - Skenario Rotasi: `Jalur A: Pathway` | `Skor 66/100` | `Komposit`.
  - Defisit Air Puncak: `21.2 mm / musim` | `Defisit ringan`.
  - Komoditas Musim 1: `Orok-orok (Crotalaria juncea)` | `Crotalaria Lokal Brawijaya`.
- **Wawasan Biofisik Lahan & Peta**:
  - Insight text: *"Telemetri iklim bersumber dari API NASA POWER (baseline historis 1-tahun). Sifat fisik tanah menggunakan profil regional terkalibrasi Nusa Tenggara karena respons hulu SoilGrids tidak tersedia."*
  - Map pans and zooms smoothly; tile layer loads without overflow.
- **Action Sheet Modal**:
  - Opened via TopHeader "Action Sheet" button.
  - "Status Sumber Data" block displays:
    - `NASA API OK · Soil fallback`
    - `● NASA POWER: API OK / historical baseline`
    - `● ISRIC SoilGrids: fallback regional`
  - Scientific Note: *"NASA POWER berhasil diakses melalui API. Nilai ini merupakan baseline agroklimatologi historis, bukan sensor real-time di lahan. Profil tanah sedang menggunakan fallback regional karena SoilGrids tidak tersedia."*
  - Download PNG and WhatsApp share handlers function properly.
- **Location Change**:
  - Tested clicking map to new coordinates (`-10.0869, 123.7104`, elevation `190 m dpl`).
  - Loading states triggered cleanly; values recalculate without race conditions.
  - Reopened Action Sheet: coordinates and elevation synchronized instantly.
- **Responsive Layout**:
  - Tested at **390px x 844px** (Mobile): Header actions wrap cleanly; hamburger menu toggles mobile drawer; no horizontal overflow.
  - Tested at **768px x 1024px** (Tablet): Metric cards adapt to 2-column grid; clean typography hierarchy.

### 2. Live Deployed URL (`https://terrashaft.vercel.app/`)
- Checked live production URL: HTTP 200 OK.
- Verified that existing live deployment serves Milestone 2.2 provenance baseline and is ready for the Milestone 2.3 deployment update upon repository push.

---

## 10. Remaining Limitations

1. **NASA POWER Agroclimatology Nature**:
   - NASA POWER provides 1-year historical agroclimatological reanalysis data. It is not an in-situ physical sensor probe installed on the farmer's field. The UI now clearly labels this as a historical baseline.
2. **ISRIC SoilGrids Global Server Latency**:
   - The public ISRIC SoilGrids v2.0 endpoint frequently experiences high latency or upstream 503 errors. TerraShaft's regional soil fallback functions reliably to provide calibrated regional soil parameters when SoilGrids fails.
3. **Empirical Screening Tool**:
   - TerraShaft recommendations are combinatorial agronomic optimizations for scenario planning. Farmers must validate recommendations with local agricultural extension workers (PPL) before actual field planting.

---

## 11. Deployment Recommendation

```text
READY FOR LIMITED LIVE TESTING
```

**Justification:**  
The application has achieved complete data transparency, eliminated misleading "live sensor" claims, synchronized the Action Sheet and audit log with dashboard provenance, hardened the loading experience against race conditions, and secured environment configuration for public repository access. Because ISRIC SoilGrids currently defaults to calibrated regional fallback and NASA POWER represents a historical baseline rather than real-time field telemetry, `READY FOR LIMITED LIVE TESTING` is the most scientifically truthful and defensible deployment grade.
