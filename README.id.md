<div align="center">

[![English](https://img.shields.io/badge/Language-English%20🇬🇧-inactive?style=for-the-badge)](./README.md)
[![Bahasa Indonesia](https://img.shields.io/badge/Bahasa-Indonesia%20🇮🇩-10b981?style=for-the-badge)](./README.id.md)

</div>

# TerraShaft (TerraRotate)

**Adaptive Crop Rotation & Soil Regeneration Decision-Support Engine**

TerraShaft adalah aplikasi web untuk membantu petani dan Penyuluh Pertanian Lapangan (PPL) menyusun skenario rotasi tanaman adaptif berdasarkan observasi satelit, data cuaca, kelembapan tanah, topografi, karakteristik tanah, dan konteks pertanian lokal.

Sistem mengubah data geospasial yang kompleks menjadi rekomendasi rotasi tanaman yang lebih mudah dipahami, dilengkapi estimasi kebutuhan air, indikator kesehatan tanah, risiko kekeringan, alternatif tanaman, serta alasan ilmiah di balik setiap rekomendasi.

> **Catatan penting:** TerraShaft adalah sistem pendukung keputusan. Sistem tidak menggantikan pengukuran tanah langsung, penyuluh, agronom, atau keputusan petani. Nilai seperti kebutuhan air, kontribusi nitrogen, dan indeks Soil Battery merupakan estimasi model yang memiliki asumsi dan ketidakpastian.

---

## Daftar Isi

- [Dokumentasi Tampilan Aplikasi (Screenshots)](#dokumentasi-tampilan-aplikasi-screenshots)
- [Latar Belakang](#latar-belakang)
- [Solusi](#solusi)
- [13 Sumber Dataset, Referensi, & Peran Aktualnya di Sistem](#13-sumber-dataset-referensi--peran-aktualnya-di-sistem)
- [Zonasi Agroekologi Global, Lokalisasi Kultivar & i18n](#zonasi-agroekologi-global-lokalisasi-kultivar--i18n)
- [Cakupan Geografis dan Strategi Dataset](#cakupan-geografis-dan-strategi-dataset)
- [Alur Kerja Sistem](#alur-kerja-sistem)
- [Fitur Utama](#fitur-utama)
- [Metodologi dan Asumsi](#metodologi-dan-asumsi)
- [Provenansi Data](#provenansi-data)
- [Arsitektur Teknologi](#arsitektur-teknologi)
- [Keterbatasan](#keterbatasan)
- [Menjalankan Proyek](#menjalankan-proyek)
- [Sitasi dan Sumber Data](#sitasi-dan-sumber-data)
- [Tim](#tim)
- [Lisensi](#lisensi)

---

## Dokumentasi Tampilan Aplikasi (Screenshots)

### 1. Halaman Utama (Landing Page)
![TerraShaft Landing Page](./public/screenshots/01-landing.png)
*Pengantar platform intelijen geospasial TerraShaft yang menghubungkan telemetri NASA POWER dan ISRIC SoilGrids dengan perencanaan rotasi tanaman adaptif iklim.*

### 2. Dashboard Ringkasan Eksekutif & Telemetri Satelit (`/overview`)
![TerraShaft Overview Dashboard](./public/screenshots/02-overview-dashboard.png)
*Ringkasan telemetri lokasi aktif (indikator lengas akar NASA POWER `GWETROOT`, curah hujan NASA POWER `PRECTOTCORR`, tekstur tanah ISRIC SoilGrids v2.0, kapasitas menahan air $AWC$, zonasi AEZ, serta perbandingan 3 jalur rotasi).*

### 3. Peta Eksplorasi Lahan Interaktif (`/field-map`)
![TerraShaft Interactive Field Explorer](./public/screenshots/03-gis-field-explorer.png)
*Eksplorasi spasial berbasis Leaflet dengan preset lokasi lahan kering Indonesia & global, pencarian wilayah (`/api/geocode`), serta titik koordinat pengamatan.*

### 4. Perencana Rotasi 4 Musim & Komparasi Radar (`/rotation-planner`)
![TerraShaft 4-Season Rotation Planner](./public/screenshots/04-rotation-planner.png)
*Evaluasi kombinatorial $6^4 = 1.296$ sekuens rotasi ke dalam tiga skenario utama (Pathway A: Soil Regeneration, Pathway B: Drought Resilience, Pathway C: Cash-Flow Optimized) dengan kultivar terlokalisasi serta Algorithmic Audit Log.*

### 5. Asisten Agronomi AI Berbasis RAG (`/field-advisor`)
![TerraShaft AI Field Advisor](./public/screenshots/05-field-advisor-ai.png)
*Konsultasi agronomi kontekstual yang mengombinasikan telemetri lokasi aktif dan profil AEZ dengan basis pengetahuan lokal (BRIN, Balittanah, Kementan, FAO-56) disertai sitasi sumber ilmiah.*

### 6. Transparansi Provenansi Data & Katalog Sumber Ilmiah (`/data-sources`)
![TerraShaft Data Provenance & Scientific Catalog](./public/screenshots/06-data-provenance.png)
*Panel pelacakan provenansi API secara transparan (`source`, `fetchedAt`, `observationPeriod`, status cache/fallback) dan katalog 13 sumber referensi/data yang dipisahkan jujur menurut status implementasinya (`Live API`, `Static Local Registry`, `Knowledge Base`, `Reference Standard`, `Planned Integration`).*

---

## Latar Belakang

Pertanian di wilayah lahan kering dan sentra pangan tadah hujan menghadapi beberapa tantangan:

- Perubahan pola hujan membuat kalender tanam historis semakin sulit dipakai tanpa penyesuaian.
- Monokultur dapat meningkatkan pengambilan hara, tekanan penyakit, dan kerentanan terhadap stres air.
- Kondisi permukaan tanah tidak selalu menggambarkan kelembapan yang tersedia di sekitar zona perakaran.
- Data satelit, iklim, dan tanah tersedia dalam jumlah besar tetapi sulit diterjemahkan menjadi keputusan lapangan.
- Rekomendasi agronomi perlu mempertimbangkan faktor teknis, ekonomi, ketersediaan air, dan kondisi lokal secara bersamaan.

TerraShaft dirancang untuk menjembatani observasi bumi dengan tindakan pertanian yang lebih mudah dipahami.

---

## Solusi

TerraShaft menggabungkan empat lapisan analisis:

1. **Observasi iklim & air zona akar:** curah hujan `PRECTOTCORR`, suhu, radiasi surya, dan indikator lengas perakaran `GWETROOT` dari NASA POWER.
2. **Kondisi lingkungan & AEZ:** evapotranspirasi acuan ($ET_0$), elevasi lokasi, panjang musim kering, GDD, belahan bumi, dan klasifikasi zona agroekologi (`AgroecologicalProfile`).
3. **Kondisi tanah dan pertanian:** fraksi tekstur (pasir, debu, liat), pH, karbon organik ($SOC$), $CEC$, kapasitas menahan air ($AWC$) dari ISRIC SoilGrids v2.0, serta spesies tanaman & registri kultivar terlokalisasi.
4. **Optimasi keputusan:** penyaringan tanaman berdasarkan batas air, kalender tanam 4 periode, tujuan regenerasi tanah, guardrail kultivar lintas negara, dan estimasi pendapatan.

Hasil akhirnya berupa beberapa skenario rotasi (Pathway A, B, dan C), bukan satu jawaban mutlak. Setiap skenario menunjukkan manfaat, risiko, alasan ilmiah (*audit log*), status bukti/fallback kultivar, dan sumber data yang digunakan.

---

## 13 Sumber Dataset, Referensi, & Peran Aktualnya di Sistem

Untuk menghindari *overclaim*, TerraShaft mengelompokkan ke-13 sumber dataset di katalog `/data-sources` ke dalam **5 status aktual di dalam kode**: `Live API`, `Static Local Registry`, `Knowledge Base`, `Reference Standard`, dan `Planned Integration`.

| Kategori Status | Sumber | Status Aktual di Kode |
|---|---|---|
| **`Live API`** | NASA POWER (`/api/nasa-climate`), ISRIC SoilGrids v2.0 (`/api/soil-profile`), Open-Meteo Elevation / SRTM DEM + Nominatim (`/api/geocode`) | Dipanggil langsung saat runtime dengan cache & fallback regional. |
| **`Static Local Registry`** | `crop_species.json` (6 spesies) & `cultivars_registry.json` (**23 entri kultivar statis** + metadata institusi) | Aktif di runtime; **belum** terhubung ke live API ketersediaan benih/registrasi resmi eksternal. |
| **`Knowledge Base`** | Dokumen RAG `agronomyKnowledgeBase.ts` (BRIN/Balittanah, ECOSTRESS, GEDI) | Sumber konteks konsultasi Field Advisor AI; tidak ada panggilan API ECOSTRESS/GEDI langsung. |
| **`Reference Standard`** | USDA Soil Taxonomy / Segitiga Tekstur, FAO-56 & GAEZ v4, GLDAS/ERA5 | Acuan konseptual/literatur & fallback statis; **tidak** ada query live SSURGO maupun raster FAO GAEZ. |
| **`Planned Integration`** | Direct SMAP API, Direct GPM/IMERG API, Landsat/MODIS/VIIRS, Sentinel-2 raster | Belum ada route API maupun pemrosesan citra spektral; tercantum sebagai roadmap & acuan. |

### Rincian 13 Sumber dalam Katalog

1. **NASA POWER (`Live API`):** Agroklimatologi harian (`T2M_MIN`, `T2M_MAX`, `T2M`, `ALLSKY_SFC_SW_DWN`, `PRECTOTCORR`, `GWETROOT`) diambil langsung melalui route `/api/nasa-climate` untuk perhitungan $ET_0$, pasokan hujan, dan indikator lengas perakaran.
2. **ISRIC SoilGrids v2.0 (`Live API`):** Fraksi tekstur (`sand`, `silt`, `clay`), `soc`, `phh2o`, dan `cec` (agregasi tertimbang 0–30 cm) via `/api/soil-profile` untuk kalkulasi $AWC$ dan klasifikasi tekstur.
3. **Open-Meteo Elevation / SRTM DEM (`Live API` titik elevasi | `Planned Integration` analisis lereng/runoff):** Route `/api/geocode` mengambil elevasi koordinat dari Open-Meteo Elevation API untuk klasifikasi sabuk elevasi AEZ. Pemrosesan raster kemiringan lereng & limpasan permukaan belum berjalan di runtime.
4. **NASA SMAP L4 Context (`Live API parameter GWETROOT via NASA POWER` | Direct SMAP API: `Planned Integration`):** TerraShaft **tidak** memanggil direct SMAP API. Indikator kelembapan zona akar runtime membaca parameter **`GWETROOT`** dari NASA POWER sebagai *model-assimilated root-zone wetness indicator*.
5. **NASA GPM / IMERG Context (`Live API parameter PRECTOTCORR via NASA POWER` | Direct GPM/IMERG API: `Planned Integration`):** TerraShaft **tidak** memiliki integrasi langsung ke API NASA GPM/IMERG. Data curah hujan runtime diambil dari parameter presipitasi terkoreksi **`PRECTOTCORR`** pada NASA POWER.
6. **Landsat & MODIS / VIIRS (`Planned Integration` / `Reference Standard`):** Tidak dipanggil sebagai API dan tidak ada pemrosesan NDVI/EVI di runtime; berfungsi sebagai kerangka referensi fase vegetasi.
7. **Copernicus Sentinel-2 (`Planned Integration` / `Reference Standard`):** Peta `/field-map` memakai basemap web Leaflet untuk visualisasi lokasi; belum ada pengambilan API maupun pemrosesan band optik 10 m Sentinel-2.
8. **GLDAS & ECMWF ERA5 (`Reference Standard`):** Acuan literatur reanalisis daratan/atmosfer; tidak diambil saat runtime (seluruh cuaca runtime berasal dari NASA POWER atau fallback lintang).
9. **NASA ECOSTRESS (`Knowledge Base` / `Planned Integration`):** Berperan sebagai entri pengetahuan lokal di `agronomyKnowledgeBase.ts` untuk konteks stres panas pada AI Advisor; tidak ada query LST ECOSTRESS langsung.
10. **NASA GEDI LiDAR (`Knowledge Base` / `Planned Integration`):** Berperan sebagai referensi agroforestri di `agronomyKnowledgeBase.ts`; tidak ada query footprint LiDAR GEDI di runtime.
11. **Riset Agronomi BRIN / Balittanah & Registri Kultivar Regional (`Static Local Registry` & `Knowledge Base`):** Berbasis data JSON statis lokal (`src/data/cultivars_registry.json` berisi **23 entri kultivar statis** untuk `Indonesia`, `United States`, `Kenya`, `Tanzania / East Africa`, `Uganda`, `India / South Asia`, `Brazil / Latin America`, dan `Australia`) serta dokumen RAG lokal. Referensi institusi (`USDA NASS / Land-Grant Extension`, `KALRO / KEPHIS`, `ICAR / IRRI`, `EMBRAPA`, `GRDC`, `BRIN / Balittanah`) tersimpan sebagai metadata string JSON—**belum** ada endpoint live `GET /api/cultivars`, `GET /api/cultivar-recommendation`, atau `GET /api/evidence`.
12. **FAO GAEZ v4 & FAO-56 (`Reference Standard` & `Knowledge Base`):** Konsep $ET_0$/$K_c$ FAO-56 dan literatur GAEZ v4 menjadi acuan metodologis serta dokumen RAG. **Belum** ada pengambilan data GAEZ, raster query, lapisan kesesuaian lahan GAEZ, atau skor GAEZ di mesin optimasi runtime.
13. **USDA Soil Taxonomy & SSURGO / STATSGO2 Reference (`Reference Standard`):** Klasifikasi **Segitiga Tekstur Tanah USDA** (`classifySoilTexture`) dan literatur NRCS menjadi acuan konseptual/pedagogis serta konstanta fallback statis wilayah CONUS saat SoilGrids timeout. **Tidak** ada query live ke SSURGO atau STATSGO2; nilai tanah runtime berasal dari ISRIC SoilGrids atau fallback regional statis.

---

## Zonasi Agroekologi Global, Lokalisasi Kultivar & i18n

TerraShaft memisahkan secara ketat **taksonomi spesies tanaman** dari **registri kultivar lokal statis** agar varietas Indonesia tidak pernah terbawa ke negara lain:

1. **Pemisahan Entitas Spesies vs Kultivar:** Spesies (`src/data/crop_species.json`) memuat 6 spesies (*Oryza sativa L.*, *Zea mays L.*, *Glycine max (L.) Merr.*, *Vigna radiata*, *Sorghum bicolor*, *Crotalaria juncea*). Kultivar (`src/data/cultivars_registry.json`) berisi **23 entri statis** yang mengikat tiap varietas ke `country_or_region_of_release`, `allowed_agroecological_zones`, `registration_status`, `evidence_source`, dan calibrated `confidence_score`.
2. **Pipeline Zonasi Agroekologi Global (`src/lib/agroecologicalZoning.ts`):** Mengonversi koordinat, elevasi, iklim NASA POWER, serta profil tanah ISRIC SoilGrids menjadi profil `AgroecologicalProfile` (negara, makro-wilayah, belahan bumi, sabuk elevasi, bulan kering, GDD, kelas fotoperiod, dan zona agroekologi).
3. **Isolasi Geografis & Fallback Arketipe (`src/lib/cultivarLocalizer.ts`):** Kultivar Indonesia (seperti Inpago, Bisi-18, Anjasmoro, Vima, Bioguma) dibatasi hanya untuk `ID`. Wilayah global dalam registri statis (`US`, `KE`, `TZ`, `UG`, `IN`, `BR`, `AU`) menampilkan varietas lokal yang sesuai zona AEZ, sedangkan wilayah tanpa entri registri melakukan fallback transparan ke **Arketipe Fenotipe Spesies** (*Phenotype Archetype*) tanpa mengarang nama varietas maupun status ketersediaan benih.
4. **Dukungan Dwibahasa i18n (`en` default & `id`):** Aplikasi menggunakan `i18next` (`src/locales/en.json` sebagai default, `src/locales/id.json` alternatif bahasa Indonesia). Pergantian bahasa `EN | ID` hanya mengubah teks antarmuka—telemetri, nama ilmiah, nama kultivar, unit metrik, dan hasil optimasi tetap identik.

---

## Cakupan Geografis dan Strategi Dataset

TerraShaft menggunakan pendekatan **Global Core APIs + Static Regional Registries**.

### Global Core (Live API di Seluruh Dunia)

Endpoint proxy yang dipanggil secara aktif saat runtime untuk Indonesia maupun koordinat global:

```text
NASA POWER /api/nasa-climate (T2M, T2M_MAX, T2M_MIN, ALLSKY_SFC_SW_DWN, GWETROOT, PRECTOTCORR)
ISRIC SoilGrids 250m v2.0 /api/soil-profile (Sand, Silt, Clay, SOC, pH, CEC 0-30cm)
OpenStreetMap Nominatim + Open-Meteo Elevation /api/geocode (Geocoding & Elevasi DEM)
```

### Konteks Regional & Preset Pengujian

- **Indonesia:** Preset lahan kering (Kupang Timur, Camplong, Sumba Timur, Gunungkidul, Indramayu, Lombok Timur), registri kultivar nasional `ID`, serta dokumen RAG BRIN/Balittanah pada modul Field Advisor.
- **Referensi Lintas Benua:** Preset pengujian global (Central Valley USA, Machakos Kenya, Murray-Darling Australia) dengan registri kultivar statis lokal masing-masing wilayah serta katalog 13 sumber dataset di `/data-sources`.

---

## Alur Kerja Sistem

```text
Input koordinat / pencarian wilayah / pilih preset di peta
              ↓
Validasi koordinat ketat (-90..90 lat, -180..180 lon tanpa silent clamping)
              ↓
Pengambilan data paralel via Proxy Route Handlers:
  • /api/nasa-climate (NASA POWER: suhu, radiasi, GWETROOT, PRECTOTCORR)
  • /api/soil-profile (ISRIC SoilGrids v2.0 0–30 cm)
  • /api/geocode (Nominatim + Open-Meteo DEM elevation)
              ↓
Quality control, masking nilai fill (-999), & fallback regional jika API hulu timeout
              ↓
Zonasi AEZ Global (agroecologicalZoning.ts) & Lokalisasi Kultivar Statis / Phenotype Archetype
              ↓
Perhitungan ET0 (Hargreaves-Samani), ETc tanaman, AWC tanah, & Water Balance
              ↓
Evaluasi kombinatorial 6^4 = 1.296 skenario rotasi 4 periode → Pathway A, B, & C
              ↓
Penyusunan Algorithmic Audit Log, Provenance Badge, AI Field Advisor, & Action Sheet PNG
```

---

## Fitur Utama

### 1. Peta GIS & Input Lokasi Dinamis (`/field-map` & Header)

- Pencarian lokasi melalui nama wilayah dan *reverse geocoding* (`/api/geocode`).
- Input koordinat manual dan klik langsung pada peta interaktif Leaflet.
- Deteksi geolokasi perangkat pengguna.
- Preset wilayah lahan kering Indonesia dan lokasi referensi global.
- Validasi ketat latitude `-90..90` dan longitude `-180..180` (mengembalikan HTTP 400 tanpa *silent clamping*).

### 2. Multi-Source Climate & Soil Telemetry (`/overview`)

Menggabungkan indikator lengas akar NASA POWER (`GWETROOT`), presipitasi `PRECTOTCORR`, suhu, radiasi surya, fisika-kimia tanah (tekstur USDA, SOC, pH, CEC, AWC), serta ringkasan zona agroekologi (`AgroecologicalProfileCard`) dan metadata provenansi.

### 3. Soil Battery Index (`/soil-battery`)

Soil Battery adalah indeks komposit ($0–100\%$) untuk memvisualisasikan simulasi dinamika kesehatan tanah dan neraca nitrogen alami ($\Delta N$ dalam $\text{kg N/ha}$), bukan pengganti uji laboratorium tanah:

- **Discharging:** Penanaman sereal rakus hara secara berturut-turut menurunkan kapasitas indeks baterai tanah.
- **Charging:** Penyisipan spesies legum penambat nitrogen (*Glycine max*, *Vigna radiata*) dan *cover crop* pemecah padas (*Crotalaria juncea*) dengan kultivar terlokalisasi memulihkan skor indeks baterai tanah.

### 4. Tiga Skenario Rotasi Optimal (`/rotation-planner`)

- **Pathway A — Soil Regeneration:** Memprioritaskan pemulihan indeks baterai tanah, fiksasi nitrogen biologis, dan biomassa penutup tanah.
- **Pathway B — Drought Resilience:** Memblokir tanaman boros air pada periode defisit air tinggi dan memprioritaskan spesies tahan kering dengan kultivar terlokalisasi (atau fallback arketipe fenotipe spesies).
- **Pathway C — Cash-Flow Optimized:** Memprioritaskan estimasi pendapatan bersih dengan tetap menjaga batas aman ketersediaan air tanah.

### 5. Water Balance Chart (`/water-balance`)

Grafik komparasi bulanan antara suplai curah hujan NASA POWER (`PRECTOTCORR`), indikator cadangan lengas perakaran (`GWETROOT`), dan estimasi kebutuhan evapotranspirasi tanaman ($ET_c = ET_0 \times K_c$).

### 6. Algorithmic Audit Log

Setiap rekomendasi menampilkan alasan transparan mengapa suatu tanaman dipilih atau didiskualifikasi berdasarkan aturan ambang batas biofisik (misal defisit air $W_{deficit}$ atau penalti monokultur) serta metadata bukti/fallback kultivar.

### 7. AI Field Advisor Berbasis RAG (`/field-advisor`)

Asisten agronomi interaktif (`/api/ai/advisor`) yang memadukan pencarian dokumen pengetahuan lokal (`agronomyKnowledgeBase.ts`) dengan data iklim, tanah, dan profil AEZ lokasi aktif. Mendukung kunci API Gemini opsional (via `/settings`) maupun mesin analisis deterministik lokal penuh (*offline-capable fallback*) dengan sitasi ilmiah.

### 8. Ekspor Lembar Panduan WhatsApp (`/action-sheet`)

Mengekspor rekomendasi rotasi 4 musim beserta kultivar terlokalisasi/arketipe menjadi poster gambar PNG ($1080 \times 1350\text{ px}$) menggunakan `html-to-image`, lengkap dengan Mode Lapangan (*High-Contrast Outdoor Mode*).

---

## Metodologi dan Asumsi

### 1. Estimasi Evapotranspirasi Acuan ($ET_0$)

Dihitung di `src/lib/evapotranspiration.ts` menggunakan formula **Hargreaves-Samani terkalibrasi radiasi matahari permukaan** (`ALLSKY_SFC_SW_DWN`):

```text
Ra_equiv (mm/hari) = ALLSKY_SFC_SW_DWN × 0.408
ET0 (mm/hari)      = 0.0023 × Ra_equiv × (Tmean + 17.8) × sqrt(max(0.5, Tmax - Tmin))
```

### 2. Kebutuhan Air Tanaman ($ET_c$)

```text
ETc = ET0_harian × Durasi_Tanam_Hari × (Kc_mid × 0.88)
```

### 3. Kapasitas Menahan Air Tanah ($AWC$) & Klasifikasi Tekstur USDA

Dihitung di `src/lib/pedotransfer.ts` untuk lapisan perakaran 0–30 cm dari fraksi tekstur ISRIC SoilGrids v2.0 dan persentase karbon organik ($SOC$), disertai klasifikasi tekstur mengacu pada Segitiga Tekstur Tanah USDA:

```text
AWC (mm / 30cm) = 0.15 × Sand% + 0.35 × Silt% + 0.40 × Clay% + 1.2 × SOC%
```

### 4. Estimasi Ekonomi & Neraca Nitrogen

Perhitungan pendapatan bersih dan kontribusi nitrogen ($\text{kg N/ha}$) pada `src/lib/optimizationEngine.ts` merupakan hasil simulasi model berbasis parameter pustaka spesies/komoditas lokal (`src/data/crops_library.json` & `src/data/crop_species.json`) dan harus disesuaikan dengan harga pasar serta kondisi lokal saat diterapkan di lapangan.

---

## Provenansi Data

Setiap respons proxy API (`/api/nasa-climate` dan `/api/soil-profile`) menyertakan kontrak metadata provenansi untuk membedakan data *live*, *cache*, dan *regional fallback*:

```json
{
  "source": "ISRIC_SOILGRIDS_LIVE",
  "fetchedAt": "2026-11-15T06:00:00.000Z",
  "observationPeriod": "Standard Depth Layer 0-30cm",
  "cached": false,
  "fallbackReason": null
}
```

Nilai `source` yang didukung di dalam sistem:

- `NASA_POWER_LIVE` — Respons langsung dari NASA POWER Agroclimatology API.
- `ISRIC_SOILGRIDS_LIVE` — Respons langsung dari ISRIC SoilGrids v2.0 REST API.
- `FALLBACK_CLIMATOLOGY` — Profil klimatologi regional terkalibrasi lintang ketika API NASA POWER mengalami *timeout* atau kendala jaringan.
- `REGIONAL_FALLBACK` — Profil pedologi regional statis ketika API ISRIC SoilGrids tidak merespons atau mengembalikan piksel perairan/perkotaan kosong.

`fetchedAt` mencatat waktu pengambilan data oleh server/cache dan dipisahkan secara tegas dari `observationPeriod` (periode observasi fisik/lapisan kedalaman tanah).

---

## Arsitektur Teknologi

- **Frontend Framework:** Next.js 16 (App Router, React 19, TypeScript).
- **Styling:** Tailwind CSS v4 (Dark Telemetry Theme & High-Contrast Outdoor Mode).
- **Internationalization (i18n):** `i18next` untuk aplikasi web dwibahasa (`src/locales/en.json` & `src/locales/id.json`) serta sinkronisasi dokumentasi multi-bahasa (`README.md` & `README.id.md`).
- **Peta Spasial:** Leaflet (`react` integration) dengan basemap satelit & dark vector.
- **Visualisasi Data:** Recharts (Dual-Axis Water Balance Chart & 5-Axis Pathway Radar Comparison).
- **State Management & Persistensi:** Zustand + `idb-keyval` + Service Worker PWA.
- **Ekspor Gambar:** `html-to-image` (render poster PNG $1080 \times 1350\text{ px}$ di sisi klien).
- **Backend API Route Handlers:**
  - `/api/nasa-climate` — Proxy NASA POWER Agroclimatology (`T2M`, `T2M_MAX`, `T2M_MIN`, `ALLSKY_SFC_SW_DWN`, `PRECTOTCORR`, `GWETROOT`) dengan *in-memory bounded cache* (TTL 24 jam) & fallback klimatologi regional.
  - `/api/soil-profile` — Proxy ISRIC SoilGrids v2.0 dengan agregasi tertimbang kedalaman 0–30 cm, *bounded cache* (TTL 30 hari), & fallback pedologi regional statis.
  - `/api/geocode` — Proxy OpenStreetMap Nominatim + Open-Meteo Elevation (SRTM/Copernicus DEM).
  - `/api/ai/advisor` — Endpoint RAG Field Advisor (mendukung kunci Gemini API opsional & mesin respons deterministik berbasis dokumen lokal).

---

## Keterbatasan

- **Tidak ada API satelit langsung selain NASA POWER, SoilGrids, Open-Meteo DEM, dan Nominatim:** TerraShaft tidak memanggil direct SMAP API (lengas akar runtime berasal dari NASA POWER `GWETROOT`), tidak memanggil direct GPM/IMERG API (curah hujan berasal dari `PRECTOTCORR`), tidak mengunduh raster FAO GAEZ/SSURGO/STATSGO2 di runtime, serta tidak memproses band citra Landsat, MODIS/VIIRS, Sentinel-2, ECOSTRESS, GEDI, atau ERA5/GLDAS.
- **Resolusi Grid & Prediksi Global:** NASA POWER (~0.5° / ~50 km) dan ISRIC SoilGrids (250 m *machine learning* global) merepresentasikan estimasi grid regional, bukan pengukuran sensor *in-situ* maupun uji laboratorium tanah lokal.
- **Registri Kultivar Masih Bersifat Statis:** `src/data/cultivars_registry.json` memuat 23 entri kurasi statis dan sitasi institusi sebagai metadata JSON lokal—belum terhubung ke layanan live API registrasi varietas resmi maupun ketersediaan benih di toko pertanian (`/api/cultivars`, `/api/evidence`).
- **Keluaran Simulasi:** Estimasi $ET_c$, skor Soil Battery, neraca nitrogen, dan estimasi pendapatan adalah keluaran model keputusan yang wajib divalidasi bersama PPL atau agronom setempat.

---

## Menjalankan Proyek

### Prasyarat

- Node.js 20 atau lebih baru.
- npm, pnpm, atau yarn.

### Instalasi

```bash
git clone https://github.com/vellumgracia-del/TerraShaft.git
cd TerraShaft
npm install
```

### Environment Variables (Opsional)

Aplikasi dapat langsung berjalan tanpa konfigurasi API key khusus karena NASA POWER dan ISRIC SoilGrids adalah API publik terbuka. Untuk kustomisasi endpoint atau mengaktifkan LLM eksternal pada Field Advisor, buat file `.env.local`:

```text
NASA_POWER_BASE_URL=https://power.larc.nasa.gov/api
ISRIC_SOILGRIDS_BASE_URL=https://rest.isric.org/soilgrids/v2.0
NASA_POWER_TIMEOUT_MS=8000
SOILGRIDS_TIMEOUT_MS=8000
GEMINI_API_KEY=<opsional-untuk-ai-advisor>
```

Jangan pernah melakukan commit file `.env.local` ke dalam repository.

### Menjalankan Pengujian & Server Pengembangan

```bash
npm test
npm run lint
npm run dev
```

Buka `http://localhost:3000` di browser.

### Sinkronisasi Dokumentasi Multi-Bahasa (`i18next`)

```bash
npm run i18n:readme
```

### Build Produksi

```bash
npm run build
npm run start
```

---

## Sitasi dan Sumber Data

- **NASA POWER Project:** NASA Langley Research Center (LaRC) Agroclimatology Archive (`T2M`, `ALLSKY_SFC_SW_DWN`, `PRECTOTCORR`, `GWETROOT`).
- **ISRIC — World Soil Information:** SoilGrids 250m v2.0 (*Poggio et al., 2021*).
- **Open-Meteo Elevation & OpenStreetMap Nominatim:** Elevation DEM & forward/reverse geocoding APIs.
- **Reference Standards (Conceptual & Knowledge Base):** FAO Irrigation and Drainage Paper No. 56 (*Allen et al., 1998*), FAO GAEZ v4, USDA Soil Taxonomy / NRCS Soil Texture Triangle, NASA SMAP L4 / GPM / ECOSTRESS / GEDI / Landsat / Sentinel-2 / ERA5 / GLDAS literature, and regional agronomic monographs (BRIN, Balittanah, Kementan, USDA Extension, KALRO/KEPHIS, ICAR/IRRI, EMBRAPA, GRDC).

---

## Tim

- **Zulfa Fahmiy Al Murtadlo** ([@varosaghasi](https://github.com/varosaghasi)) — Team Owner
- **Mohammad Arga** ([@rifaldhi](https://github.com/rifaldhi))
- **Moch. Hafidz Zawawi** ([@zawacaprio](https://github.com/zawacaprio))
- **Stiven Josh Peter Siburian** ([@stevenjoshburian](https://github.com/stevenjoshburian))
- **Ravi Arnan Irianto** ([@raviarnan](https://github.com/raviarnan))

---

## Lisensi

Proyek ini dikembangkan untuk tujuan riset, edukasi, dan inovasi pertanian berkelanjutan (NASA Space Apps Challenge). Atribusi data satelit, tanah, dan agroklimatologi tunduk pada ketentuan lisensi terbuka masing-masing penyedia (NASA Earthdata, ISRIC SoilGrids CC-BY 4.0, FAO, dan BRIN/Kementan).

© 2026 TerraShaft Team — Built for resilient agriculture and space-to-field impact.
