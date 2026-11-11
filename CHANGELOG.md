# Changelog

All notable changes to the TerraShaft project are documented in this file.

## [Milestone 3.0] - 2026-11-10 - Full-Scope Audit, Security Hardening, Global Seasonality & Agritech UX Upgrade

### Summary
Executed a full-scope security, scientific, and UX upgrade aligned with the NASA Space Apps Challenge global impact criteria. Eliminated DOM XSS vectors, bounded in-memory telemetry caches against memory exhaustion, implemented dynamic cross-hemisphere dry season detection, added global agricultural presets alongside GPS geolocation and manual coordinate entry, restored the 5-Axis Spider Radar trade-off comparison chart, and exposed the full ISRIC SoilGrids 0-30cm physical and chemical profile.

### Security & Data Reliability
- **DOM XSS Elimination**: Replaced `dangerouslySetInnerHTML` in `FourSeasonRotationCard.tsx` with safe React elements and added `escapeHtml()` sanitization in `auditLogGenerator.ts`.
- **Bounded Telemetry Caches**: Capped in-memory maps (`MAX_CACHE_SIZE = 500`) with automatic TTL/FIFO eviction in `/api/nasa-climate` and `/api/soil-profile` to prevent memory exhaustion (DoS/OOM).
- **NASA POWER `-999` Fill Filtering**: Filtered missing daily observation flags (`-999`) in `PRECTOTCORR` so missing days do not distort seasonal rainfall totals to `0 mm`.
- **HTTP Security Headers**: Configured `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy` in `next.config.ts`.
- **Custom Crop Input Clamping**: Added numeric boundary clamping (`20-365` days, `50-2000` mm water, `0-300` kg N/ha, `0-100` profit index) in `crop-library/page.tsx`.

### Added
- **Public Geocoding & DEM Elevation Integration (`/api/geocode`)**: Connected OpenStreetMap Nominatim (forward place search & reverse geocoding) and Open-Meteo Digital Elevation Model (Copernicus DEM 90m / SRTM) to replace simulated elevation formulas and coordinate-only labels when clicking the map, dragging pins, using GPS, or searching locations worldwide.
- **ISRIC SoilGrids v2.0 Multi-Depth Aggregation**: Fixed SoilGrids REST query parameters (`property=clay&property=sand...` across `0-5cm`, `5-15cm`, and `15-30cm`) and implemented depth-weighted mean aggregation for the 0-30cm root zone so live soil profiles no longer fall back to static defaults.
- **Global Agricultural Presets & Coordinate Controls**: Added 5 global dryland presets (Machakos Kenya, Central Valley USA, Murray-Darling Australia, Petrolina Brazil, Punjab India), a global place search bar, a 1-click GPS geolocation button (`navigator.geolocation`), and a manual Lat/Lon input bar in `FieldOverviewCard.tsx`.
- **Dynamic Cross-Hemisphere Seasonality (`resolveDynamicSeasons`)**: Dynamically identifies the 2 driest quarters from actual monthly precipitation data in `optimizationEngine.ts` instead of hardcoding June-October, plus hemisphere-aware climate/soil failover models in `/api/nasa-climate` and `/api/soil-profile`.
- **5-Axis Spider Radar Comparison (`PathwayRadarComparison.tsx`)**: Added multi-objective Recharts RadarChart comparing Pathway A, B, and C across Soil Battery, Water Efficiency, Drought Safety, Profit Index, and Nitrogen Fixation on `/rotation-planner`.
- **Full ISRIC SoilGrids 0-30cm Profile Panel**: Added stacked Sand/Silt/Clay texture bar, USDA texture class, pH H2O, CEC (KTK), Bulk Density (`estimateBulkDensity`), and active moisture reserve (`estimateCurrentMoistureReserve`) in `SoilBatteryCard.tsx`.
- **Executive 4-Season Overview Strip**: Added interactive 4-season timeline preview and quick Pathway A/B/C switcher directly on the main dashboard (`/`).
- **Custom Crop LocalStorage Persistence**: Persisted custom varieties in `localStorage` with hydration and deletion controls, and prioritized custom crops in the combinatorial evaluation pool.

### Fixed & Cleaned
- **Action Sheet Print Theme Isolation**: Ensured the 1080x1350px PNG export always renders in a clean light print theme even when Dark Mode is active, and fixed mobile horizontal scroll overflow.
- **Mobile Viewport Accessibility**: Unlocked pinch-to-zoom (`maximumScale: 5`) in `layout.tsx` and updated PWA `manifest.json` and `sw.js` route caching.
- **Dependency & Dead Code Cleanup**: Removed unused `mapbox-gl` dependency and obsolete modal components (`ActionSheetModal.tsx`, `CropLibraryModal.tsx`).

## [Milestone 2.1] - 2026-10-01 - Dashboard Navigation, Map Layering & Layout Stabilization

### Summary
Fixed Leaflet map layering bugs and stacking context isolation, replaced API-key-restricted basemaps with standard OpenStreetMap and Esri satellite services, established one-page dashboard section navigation with stable scroll margins, and implemented dynamic scroll tracking.

### Fixed
- **Map Layering & Stacking Context**: Isolated map container with `isolation: isolate` and clamped internal Leaflet pane and control z-indices so that map tiles and markers no longer overlap the sticky top header during scrolling.
- **Map Tile Source**: Replaced Carto basemap (which displayed `API KEY REQUIRED` watermark) with standard OpenStreetMap tiles and automatic failover to Esri World Street Map, plus Esri World Imagery for satellite mode without API keys.
- **Leaflet Lifecycle**: Integrated `ResizeObserver` on the map container to dynamically trigger `map.invalidateSize()` upon viewport and sidebar adjustments.
- **Metric Formatting**: Formatted Peak Water Deficit metric to `{maxDeficit.toFixed(1)} mm / musim` to resolve IEEE 754 floating point display (`22.20000000000000`).

### Added
- **Functional One-Page Navigation Architecture**: Connected sidebar actions to stable section IDs (`#overview`, `#field-map`, `#soil-battery`, `#rotation-planner`, `#water-balance`, `#data-sources`) with `scroll-margin-top: 88px`.
- **Dynamic Scroll Tracking**: Configured `IntersectionObserver` to automatically highlight the active navigation item as the user scrolls, while supporting smooth programmatic section navigation.
- **Modal Active Feedback**: Added active visual indicators in the sidebar when the Crop Library or Action Sheet modal overlay is open.

## [Milestone 2] - 2026-10-01 - Full UI Reset & Agritech Dashboard Reconstruction

### Summary
Completely removed legacy dark-blue NASA mission-control interface and reconstructed TerraShaft into a light, calm, modern farm intelligence workspace built directly upon the verified agronomic engine, pedotransfer functions, and real satellite/soil telemetry.

### Added
- **Agritech Visual Design System**:
  - Light agricultural palette (`#F5F7F4` canvas, `#FFFFFF` cards, `#12A875` primary green, `#17231F` deep text, `#E4EAE6` borders, `#E7F5EE` / `#FFF4D8` / `#FDEAEA` semantic status badges).
  - High-contrast sunlight-adaptive Mode Lapangan for field agricultural officers.
- **Modern Component Architecture**:
  - `AppShell.tsx`: Responsive layout featuring desktop fixed rail, mobile drawer, and header.
  - `TopHeader.tsx`: Greeting, location, real provenance badge, sync button, and quick actions.
  - `FieldOverviewCard.tsx`: Interactive Leaflet map with pin drag, click-to-locate, Indonesian presets, and rule-based biophysical insight card.
  - `SummaryMetricCards.tsx`: 5 verified state-backed cards (Root-Zone Moisture, Soil Battery, Rotation Pathway, Water Deficit Risk, Recommended Crop).
  - `SoilBatteryCard.tsx`: SVG circular screening score gauge, initial vs final projected score, delta, estimated N balance, and model-based water savings.
  - `FourSeasonRotationCard.tsx`: 4-season timeline with Pathway A/B/C switcher, priority sliders, and algorithmic permutation audit log.
  - `WaterBalanceCard.tsx`: Dual-axis Recharts ComposedChart restyled in light agritech theme.
  - `DataSourceProvenanceCard.tsx`: Dedicated source transparency and provenance card with mandatory agronomy disclaimer.
  - `CropLibraryModal.tsx` & `ActionSheetModal.tsx`: Redesigned light modal overlays for crop exploration and 1080x1350 canvas Action Sheet export.

### Removed
- Decommissioned legacy dark-blue components: `Navbar.tsx`, `SatelliteTelemetryRack.tsx`, `BioPhysicalCard.tsx`, `SoilBatteryGauge.tsx`, `WaterBalanceCenter.tsx`, `RotationDecisionCenter.tsx`, `RotationTimeline.tsx`, `PathwaySelector.tsx`, `PrioritySliders.tsx`, `RadarComparison.tsx`, and `LocationSelector.tsx`.

## [Milestone 1] - 2026-10-01 - Baseline Audit & Scientific Integrity Hardening

### Summary
Stabilized application baseline, resolved linting and compilation issues, implemented rigorous provenance tracking for satellite and soil telemetry, established controlled coordinate validation (eliminating silent clamping), and verified complete failover resilience against network timeouts and malformed upstream payloads.

### Added
- **Scientific Data Provenance Architecture**:
  - Added `source` (`NASA_POWER_LIVE` | `FALLBACK_CLIMATOLOGY`, `ISRIC_SOILGRIDS_LIVE` | `REGIONAL_FALLBACK`) to `ClimateData` and `SoilData`.
  - Added `cached: boolean` and `fallbackReason: string | null` to identify cached responses and failover rationales.
  - Added `observationPeriod: string` to explicitly distinguish physical sensor/model observation windows (e.g. "Historical 1-Year Baseline (NASA POWER Agroclimatology v2.0)" and "Standard Depth Layer 0-30cm (ISRIC SoilGrids v2.0)") from API fetch/cache retrieval timestamps (`fetchedAt`).
- **Comprehensive API Proxy & Scientific Integrity Test Suite** (`src/lib/__tests__/apiProxies.test.ts`):
  - 12 verified acceptance criteria covering invalid lat/lon, missing coordinate params, live NASA/SoilGrids responses, upstream timeout failover, malformed JSON recovery, fallback metadata integrity, and in-memory cache metadata preservation.
- **Hydration Protection**: Added client mounted guard in `Navbar.tsx` for UTC telemetry display to guarantee deterministic SSR rendering.

### Changed
- **Coordinate Validation & Input Rejection**:
  - Replaced silent coordinate clamping in `src/store/useTerraShaftStore.ts` (`setLocation`) with controlled validation error reporting (`errorBioData`).
  - Added strict parameter presence and coordinate boundary validation (-90°..90° latitude, -180°..180° longitude) in `/api/nasa-climate` and `/api/soil-profile`, returning `400 Bad Request` instead of defaulting or silent clamping.
- **User Interface Transparency**:
  - Updated `SatelliteTelemetryRack.tsx` to prominently label `Waktu Fetch/Cache` and display `Periode Observasi Iklim` and `Lapisan Tanah`.
  - Ensured UI badges consistently render `CACHED DATA` whenever `cached === true`, preserving transparency even when original source is `NASA_POWER_LIVE` or `ISRIC_SOILGRIDS_LIVE`.
  - Updated `ActionSheetModal.tsx`, `WaterBalanceCenter.tsx`, `RadarComparison.tsx`, `RotationTimeline.tsx`, and `RotationDecisionCenter.tsx` to reflect provenance states and disclaimers.

### Fixed
- Fixed 47 ESLint warnings (unused imports, unescaped entities, undefined window guards) across components.
- Fixed SSR hydration mismatch on telemetry timestamp in `Navbar.tsx`.
