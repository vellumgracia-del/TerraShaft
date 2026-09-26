# TECHNICAL SPECIFICATION & PRODUCT REQUIREMENT DOCUMENT (PRD)

**Project Name:** TerraShaft
 
**Subtitle:** Adaptive Crop Rotation & Soil Regeneration Engine  
**Target Platform:** Progressive Web App (PWA) — Mobile-First, Offline-Ready  
**Document Version:** 1.0.0  
**Target Audience:** Fullstack Developer, UI/UX Engineer, Solution Architect  

---

## 1. Executive Summary & Problem Scope

### 1.1 Objective
Membangun aplikasi web tangguh dan responsif yang menerjemahkan observasi biofisik satelit NASA, profil tanah lokal (ISRIC SoilGrids), karakteristik fisiologis tanaman (FAO), dan preferensi petani menjadi rencana rotasi tanaman multi-musim (3–5 siklus) yang adaptif terhadap kekeringan, memulihkan bahan organik tanah, serta menjaga pendapatan petani.

### 1.2 Core Value Proposition
* **Mengganti Tebak-tebakan Kalender Tanam:** Menghitung jendela tanam berdasarkan defisit kelembapan zona perakaran (*root-zone soil moisture*) dan radiasi harian, bukan sekadar tanggal kalender masehi/pranata mangsa konvensional.
* **Closed-Loop Soil Battery:** Menampilkan status hara dan kelembapan tanah layaknya baterai yang terisi (*charging*) oleh legum/akar pemecah tanah dan terkuras (*draining*) oleh komoditas monokultur rakus hara.
* **Aksi Lapangan Berkecepatan Tinggi:** Memberikan lembar panduan rotasi ringkas (*action sheet*) berformat gambar/PDF siap sebar via WhatsApp untuk penyuluh lapangan.

---

## 2. Tech Stack Architecture

### 2.1 Recommended Stack
* **Frontend Framework:** Next.js (App Router, React 19) (TypeScript).
* **Styling & Design System:** Tailwind CSS + Radix UI / Shadcn UI (ringan, ramah aksesibilitas).
* **Map Engine:** Mapbox GL JS atau Leaflet.js (menggunakan *tile* OpenStreetMap/Carto Positron untuk opsi 100% *open-source*).
* **Data Visualization:** Lucide Icons (aset ikon), Recharts / D3.js (Radar Chart, Horizon Timeline, Soil Battery Gauge).
* **State Management:** Zustand (ringan, mudah di-persist ke `localStorage` / `IndexedDB`).
* **Backend / API Layer:** Next.js Serverless Route Handlers / Node.js Express (bertindak sebagai proxy dan aggregator data eksternal guna mengatasi masalah CORS dan *rate-limiting*).
* **Local Storage / Offline:** `idb-keyval` (IndexedDB wrapper) + Service Worker (PWA Workbox).

### 2.2 System Flow Diagram

```
[ User Browser / PWA Client ]
         │
         ├──► 1. Map Interaction (Lat, Lon Input)
         │
         ▼
[ Next.js API Proxy / BFF ]
         │
         ├───► A. NASA POWER API (Weather, Solar Radiation, GDD)
         ├───► B. ISRIC SoilGrids REST (Soil Texture, SOC, pH, CEC)
         ├───► C. NASA Earthdata AppEEARS (SMAP Root-Zone Soil Moisture)
         └───► D. Local Static Data (`crops_library.json`)
         │
         ▼
[ TerraRotate Optimization Engine ]
         │
         ├──► Evaluasi Defisit Air Kumulatif ($ET_c$ vs Rain + Soil Moisture)
         ├──► Evaluasi Neraca Nitrogen & Karbon ($C:N$ balance)
         └──► Pembobotan Multi-Objective (Profit, Water, Soil)
         │
         ▼
[ Render UI: 3 Pathway Cards + Soil Battery + Timeline ]
```

---

## 3. External API Integrations & Data Contracts

Semua panggilan API eksternal **wajib** melalui layer backend internal (`/api/proxy/...`) untuk:
1. Menyembunyikan token rahasia (*secret keys*).
2. Melakukan caching respons harian (data tanah bersifat statis, data NASA POWER diperbarui harian).
3. Melakukan transformasi data mentah ke format JSON yang ringkas (*lightweight payload*).

### 3.1 NASA POWER API (Agroclimatology Daily)
* **Status Auth:** Bebas Biaya, Tanpa Key.
* **Endpoint:** `GET https://power.larc.nasa.gov/api/temporal/daily/point`
* **Query Parameters:**
  * `latitude`: float
  * `longitude`: float
  * `parameters`: `T2M,T2M_MAX,T2M_MIN,PRECTOTCORR,ALLSKY_SFC_SW_DWN`
  * `community`: `AG`
  * `start`: YYYYMMDD (ambil 3 tahun terakhir untuk kalkulasi rata-rata klimatologis)
  * `end`: YYYYMMDD
  * `format`: `JSON`
* **Output Parsed untuk Engine:**
  * Rata-rata curah hujan bulanan ($mm/bulan$).
  * Nilai Evapotranspirasi Potensial ($ET_0$) berbasis metode Hargreaves-Samani yang dihitung dari `T2M_MIN`, `T2M_MAX`, dan radiasi matahari `ALLSKY_SFC_SW_DWN`.

### 3.2 ISRIC SoilGrids REST API
* **Status Auth:** Bebas Biaya, Tanpa Key (Open Data).
* **Endpoint:** `GET https://rest.isric.org/soilgrids/v2.0/properties/query`
* **Query Parameters:**
  * `lat`: float
  * `lon`: float
  * `property`: `clay,sand,silt,soc,phh2o,cec`
  * `depth`: `0-30cm`
  * `value`: `mean`
* **Transformasi Satuan:**
  * `clay, sand, silt`: dikonversi ke persentase ($g/kg \div 10 = \%$).
  * `soc`: Karbon Organik Tanah ($dg/kg \div 100 = \%$ C-Organik).
  * `phh2o`: Nilai pH ($pH \times 10 \div 10$).
* **Fungsi di Aplikasi:** Menghitung Kapasitas Menahan Air Tanah (*Available Water Capacity* - AWC) menggunakan pedotransfer:
  $$AWC = 0.15 \times \text{Sand}\% + 0.35 \times \text{Silt}\% + 0.40 \times \text{Clay}\% + (1.2 \times \text{SOC}\%)$$

### 3.3 NASA Earthdata / SMAP L4 (Soil Moisture Active Passive)
* **Status Auth:** Akun NASA Earthdata Login (Gratis).
* **Metode Operasional (Pilihan untuk Developer):**
  * *Opsi A (Produksi Kompleks):* Mengambil tile raster HDF5 via API AppEEARS menggunakan Bearer Token dari endpoint `https://appeears.earthdatacloud.nasa.gov/api/login`.
  * *Opsi B (Rekomendasi MVP Cepat):* Gunakan proxy data kelembapan tanah harian yang disediakan langsung melalui parameter NASA POWER `GWETROOT` (Root Zone Soil Wetness: skala 0–1.0) yang sudah dikalibrasi dengan asimilasi satelit SMAP. Ini menghindari pengunduhan berkas citra berukuran besar (*heavy geotiff/hdf5 processing*).

### 3.4 Mapbox GL JS / OpenStreetMap
* **Mapbox Public Key:** `NEXT_PUBLIC_MAPBOX_TOKEN` (Opsional jika menggunakan Leaflet OSM gratis).
* **Fitur:** Peta interaktif dengan pin drag-and-drop dan search bar geocoding wilayah.

---

## 4. Internal Data Architecture: `crops_library.json`

Developer **tidak perlu** mencari API untuk karakteristik tanaman. Simpan berkas `crops_library.json` berikut di folder `/data` atau direktori aset backend:

```json
[
  {
    "id": "padi_gogo",
    "name": "Padi Gogo (Lahan Kering)",
    "category": "Cereal",
    "growth_duration_days": 110,
    "water_requirement_mm": 500,
    "kc_mid": 1.15,
    "root_depth_cm": 40,
    "nitrogen_fixation_kg_ha": 0,
    "nitrogen_demand_kg_ha": 90,
    "soil_carbon_input": "Medium",
    "economic_profit_index": 75,
    "drought_tolerance": "Moderate",
    "break_pest_cycle": false,
    "icon": "wheat"
  },
  {
    "id": "jagung_hibrida",
    "name": "Jagung Hibrida",
    "category": "Cereal",
    "growth_duration_days": 100,
    "water_requirement_mm": 450,
    "kc_mid": 1.20,
    "root_depth_cm": 80,
    "nitrogen_fixation_kg_ha": 0,
    "nitrogen_demand_kg_ha": 120,
    "soil_carbon_input": "High",
    "economic_profit_index": 80,
    "drought_tolerance": "Moderate",
    "break_pest_cycle": false,
    "icon": "corn"
  },
  {
    "id": "kedelai",
    "name": "Kedelai",
    "category": "Legume",
    "growth_duration_days": 85,
    "water_requirement_mm": 350,
    "kc_mid": 1.05,
    "root_depth_cm": 60,
    "nitrogen_fixation_kg_ha": 60,
    "nitrogen_demand_kg_ha": 20,
    "soil_carbon_input": "Medium",
    "economic_profit_index": 70,
    "drought_tolerance": "Moderate",
    "break_pest_cycle": true,
    "icon": "bean"
  },
  {
    "id": "kacang_hijau",
    "name": "Kacang Hijau",
    "category": "Legume",
    "growth_duration_days": 65,
    "water_requirement_mm": 250,
    "kc_mid": 0.90,
    "root_depth_cm": 50,
    "nitrogen_fixation_kg_ha": 45,
    "nitrogen_demand_kg_ha": 15,
    "soil_carbon_input": "Low",
    "economic_profit_index": 65,
    "drought_tolerance": "High",
    "break_pest_cycle": true,
    "icon": "sprout"
  },
  {
    "id": "sorgum",
    "name": "Sorgum",
    "category": "Cereal / Forage",
    "growth_duration_days": 95,
    "water_requirement_mm": 300,
    "kc_mid": 0.95,
    "root_depth_cm": 120,
    "nitrogen_fixation_kg_ha": 0,
    "nitrogen_demand_kg_ha": 60,
    "soil_carbon_input": "High",
    "economic_profit_index": 55,
    "drought_tolerance": "Very High",
    "break_pest_cycle": true,
    "icon": "plant"
  },
  {
    "id": "crotalaria",
    "name": "Orok-orok (Crotalaria / Cover Crop)",
    "category": "Cover Crop",
    "growth_duration_days": 50,
    "water_requirement_mm": 180,
    "kc_mid": 0.70,
    "root_depth_cm": 90,
    "nitrogen_fixation_kg_ha": 110,
    "nitrogen_demand_kg_ha": 0,
    "soil_carbon_input": "Very High",
    "economic_profit_index": 10,
    "drought_tolerance": "Very High",
    "break_pest_cycle": true,
    "icon": "flower"
  }
]
```

---

## 5. Optimization & Scoring Algorithm

Logika mesin menghasilkan kombinasi tanaman 4 musim berturut-turut ($M_1, M_2, M_3, M_4$) dan menghitung skor untuk 3 skenario:

### 5.1 Rumus Perhitungan Metrik

1. **Defisit Air Tanaman ($W_{deficit}$):**
   $$W_{deficit} = \max(0, \text{Kebutuhan Air Tanaman (mm)} - (\text{Presipitasi Musiman NASA} + \text{AWC Tanah}))$$
   *Jika $W_{deficit} > 100\text{ mm}$, tanaman berisiko gagal panen tanpa irigasi tambahan.*

2. **Neraca Nitrogen Kumulatif ($\Delta N$):**
   $$\Delta N = \sum (\text{Fiksasi N} - \text{Kebutuhan N Serapan})$$

3. **Status Baterai Tanah (Soil Battery Level, 0–100%):**
   Nilai dasar dihitung dari:
   $$\text{Battery} = 40 + (20 \times \text{SOC}\%) + \text{Faktor Rotasi}$$
   * *Charging (+15% per musim):* Jika tanaman adalah `Legume` atau `Cover Crop`.
   * *Draining (-20% per musim):* Jika dua musim berturut-turut menanam `Cereal` rakus hara tanpa jeda legum.

4. **Multi-Objective Composite Score ($S$):**
   $$S = (w_{profit} \cdot P) + (w_{water} \cdot W) + (w_{soil} \cdot B)$$
   * Di mana $w_{profit} + w_{water} + w_{soil} = 1.0$ (diambil dari slider bobot prioritas petani).

### 5.2 Aturan Logika 3 Skenario Output

* **Pathway A (Max Soil Regeneration):** Wajib menyisipkan minimal satu `Cover Crop` berakar dalam dan minimal satu `Legume` pengikat N tinggi.
  * *Contoh Urutan:* Jagung $\to$ Kedelai $\to$ Crotalaria $\to$ Sorgum.
* **Pathway B (Drought Resilience):** Tidak boleh ada tanaman dengan `drought_tolerance: Moderate` pada musim kemarau (Juli–Oktober).
  * *Contoh Urutan:* Padi Gogo $\to$ Kacang Hijau $\to$ Sorgum $\to$ Bera Berpenutup Tanah.
* **Pathway C (Cash-Flow Optimized):** Memaksimalkan nilai `economic_profit_index` tertinggi yang masih lolos batas aman kelembapan tanah SMAP.
  * *Contoh Urutan:* Jagung $\to$ Kedelai $\to$ Jagung $\to$ Kacang Hijau.

---

## 6. UI/UX Wireframe & Design Specifications

### 6.1 Layout Grid & Theme Tokens
* **Color Palette:**
  * Background: Slate-50 (`#f8fafc`) / Dark Mode: Slate-950 (`#020617`).
  * Primary Green: Emerald-600 (`#059669`) — simbol regenerasi.
  * Earth Brown: Amber-800 (`#92400e`) — aksen tanah & hara.
  * Water Blue: Sky-600 (`#0284c7`) — parameter kelembapan & presipitasi.
  * Danger Red: Rose-600 (`#e11d48`) — indikator defisit air kritis.
* **Typography:** `Plus Jakarta Sans` / `Inter` (UI), `JetBrains Mono` (angka metrik).

### 6.2 Full Wireframe Blueprint (Desktop & Tablet)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  [Logo] TerraRotate    │  Wilayah: Kupang Timur, NTT  │  [Status: Connected]    │
├───────────────────────────────────────────────────────┬──────────────────────────┤
│ PANEL KIRI (Input & Baseline Biofisik)                │ PANEL KANAN (Simulator)  │
│                                                       │                          │
│ ┌───────────────────────────────────────────────────┐ │ ┌──────────────────────┐ │
│ │ 1. PETA INTERAKTIF LAHAN (Mapbox/Leaflet)         │ │ │ PRIORITAS PETANI     │ │
│ │ [ Cari Desa / Pin Koordinat ]                     │ │ │ Profit      [===o--] │ │
│ │                                                   │ │ │ Hemat Air   [=====o] │ │
│ │   Lat: -10.1542, Lon: 123.8210                    │ │ │ Tanah Sehat [====o-] │ │
│ └───────────────────────────────────────────────────┘ │ └──────────────────────┘ │
│                                                       │                          │
│ ┌───────────────────────────────────────────────────┐ │ ┌──────────────────────┐ │
│ │ 2. BIO-PHYSICAL BASELINE (Live NASA + SoilGrids)  │ │ │ THE SOIL BATTERY     │ │
│ │ • Kelembapan Akar (SMAP) : 18% [Defisit Kering]   │ │ │ [ 68% RECHARGED  ⚡ ] │ │
│ │ • Hujan Tahunan (GPM)    : 850 mm/thn             │ │ │ +15% Dari Siklus N   │ │
│ │ • Tekstur Tanah          : Lempung Berpasir       │ │ └──────────────────────┘ │
│ │ • Karbon Organik (SOC)   : 0.8% [Kritis Padat]    │ │                          │
│ └───────────────────────────────────────────────────┘ │ ┌──────────────────────┐ │
│                                                       │ │ REKOMENDASI SKENARIO │ │
│                                                       │ │ [A. Soil] [B. Air]   │ │
│                                                       │ │ [*C. Hybrid Balance*]│ │
│                                                       │ └──────────────────────┘ │
│                                                       │                          │
│ ┌──────────────────────────────────────────────────────────────────────────────┐ │
│ │ 3. HORIZON ROTATION TIMELINE (Gantt Chart 4 Musim)                           │ │
│ │  Musim 1 (Nov-Feb)  : [ Jagung Hibrida ] ──► Air: Cukup │ Profit: Tinggi     │ │
│ │  Musim 2 (Mar-Mei)  : [ Kedelai ]        ──► Fiksasi N: +60kg │ Pulihkan Hara│ │
│ │  Musim 3 (Jun-Agu)  : [ Sorgum ]         ──► Tahan Kering │ Akar Tembus Hard │ │
│ │  Musim 4 (Sep-Okt)  : [ Crotalaria ]     ──► Cover Crop Biomassa (+0.3% SOC) │ │
│ └──────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
│ ┌───────────────────────────────────────────────┬──────────────────────────────┐ │
│ │ 4. RADAR TRADE-OFF COMPARISON                 │ 5. ACTION SHEET EXPORT       │ │
│ │               Profit                          │ [ 📄 Download WhatsApp Card] │ │
│ │                 /\                            │                              │ │
│ │   Ketahanan    /  \   Hemat Air               │ Jadwal tebar benih, varietas │ │
│ │     Iklim     /____\                          │ anjuran, dan kebutuhan pupuk │ │
│ │               \    /                          │ dalam 1 lembar praktis.      │ │
│ │                \  /                           │                              │ │
│ │          Kesehatan Tanah                      │                              │ │
│ └───────────────────────────────────────────────┴──────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Mobile Screen Layout (Single Column Flow)
1. **Header:** Title + Lokasi GPS Otomatis.
2. **Card 1: Mini Map:** Drop pin sederhana + status ringkas iklim NASA.
3. **Card 2: Priority Sliders:** 3 slider praktis dengan preset tombol (*"Maksimalkan Uang"*, *"Siaga Kemarau"*, *"Suburkan Tanah"*).
4. **Card 3: Big Soil Battery:** Animasi visual tabung baterai dengan angka persentase.
5. **Card 4: Swipeable Rotation Cards:** Card musim yang bisa digeser horizontal (Musim 1 $\to$ Musim 2 $\to$ Musim 3 $\to$ Musim 4) dengan badge warna:
   * Hijau = *Net Positive Nitrogen*
   * Oranye = *Air Kritis Terkendali*
   * Ungu = *Penghasil Kas Utama*
6. **Bottom Sticky Bar:** Tombol hijau besar `Bagikan Lembar Panduan (WhatsApp/PDF)`.

---

## 7. Frontend State Management & Component Structure

### 7.1 Zustand Store (`useRotateStore.ts`)

```typescript
interface LocationState {
  lat: number;
  lon: number;
  placeName: string;
}

interface SoilData {
  sand: number;
  clay: number;
  silt: number;
  soc: number;
  ph: number;
  awc: number;
}

interface ClimateData {
  annualRainfall: number;
  monthlyRainfall: number[];
  rootZoneMoisture: number; // 0 - 1.0 (from SMAP/POWER)
  avgTemp: number;
}

interface Priorities {
  profitWeight: number; // 0 - 100
  waterWeight: number;
  soilWeight: number;
}

interface RotationPlan {
  pathwayId: 'A' | 'B' | 'C';
  title: string;
  crops: Crop[];
  soilBatteryScore: number;
  waterSavingsPct: number;
  netNitrogenDelta: number;
  projectedProfitIndex: number;
}
```

### 7.2 Directory Structure Recommendation
```text
/src
  ├── /app
  │    ├── layout.tsx
  │    ├── page.tsx                  // Dashboard Utama
  │    └── /api
  │         ├── /nasa-climate        // Handler NASA POWER
  │         └── /soil-profile        // Handler ISRIC SoilGrids
  ├── /components
  │    ├── /map                      // Mapbox / Leaflet Pin Selector
  │    ├── /soil-battery             // Animated Canvas / SVG Battery
  │    ├── /timeline                 // Horizontal Multi-Season Timeline
  │    ├── /radar-chart              // Trade-off Spider Chart
  │    └── /export-modal             // Render Kartu WhatsApp / PDF
  ├── /data
  │    └── crops_library.json        // Database Statis 10+ Komoditas Lokal
  ├── /lib
  │    ├── optimizationEngine.ts     // Core Scoring & Rotation Combinatorics
  │    └── pedotransfer.ts           // Kalkulator Fisika Tanah (AWC)
  └── /store
       └── useRotateStore.ts         // Zustand State Store
```

---

## 8. Exportable Action Sheet Specification (WhatsApp/PDF Card)

Salah satu nilai jual terbesar untuk juri NASA adalah **keterpakaian lapangan**. Lembar rekomendasi yang dihasilkan memiliki spesifikasi:

* **Dimensi Canvas:** $1080 \times 1350\text{ px}$ (Rasio 4:5, optimal untuk layar ponsel dan status WhatsApp).
* **Konten Wajib:**
  1. Header: *"Rekomendasi Pola Tanam Adaptif TerraRotate — Musim 2026/2027"*.
  2. Identitas Lahan: Titik koordinat + Estimasi tekstur tanah.
  3. Tabel 4 Musim:
     * Nama Tanaman & Rekomendasi Varietas Tahan (misal: *Sorgum Varietas Bioguma* atau *Jagung Hibrida Bisi-18*).
     * Waktu Tanam Ideal.
     * Manfaat Khusus: (*"Memecah tanah padas"* / *"Menambah 60 kg N alami"*).
  4. Indikator Keberhasilan: *"Penghematan Air: 38% | Estimasi Bahan Organik: Naik +0.3%"*.
  5. Catatan NASA: *"Dihitung berdasarkan asimilasi satelit NASA SMAP & GPM"*.

---

## 9. Implementation Roadmap for Fullstack Developer

| Tahap | Durasi Est. | Deliverables Kunci |
|---|---|---|
| **Sprint 1: Data Plumbing** | Hari 1–2 | • Setup Next.js + Tailwind + Zustand.<br>• Buat route `/api/soil-profile` (SoilGrids) dan `/api/nasa-climate` (NASA POWER).<br>• Validasi berkas `crops_library.json`. |
| **Sprint 2: Core Algorithm** | Hari 3–4 | • Implementasi fungsi penghitung AWC dan evapotranspirasi.<br>• Implementasi algoritma penentu urutan 4 musim (Pathway A, B, C).<br>• Unit test logika *Soil Battery* dan neraca nitrogen. |
| **Sprint 3: Map & UI Components** | Hari 5–6 | • Pasang peta interaktif (Leaflet/Mapbox).<br>• Bangun komponen visual *Soil Battery Gauge* & *Timeline 4 Musim*.<br>• Hubungkan slider prioritas petani dengan *state engine*. |
| **Sprint 4: Export & Polish** | Hari 7 | • Integrasi `html2canvas` / `@react-pdf/renderer` untuk cetak *Action Sheet* WhatsApp.<br>• Uji coba caching luring (PWA).<br>• Demo simulasi pada koordinat lahan kering Nusa Tenggara. |