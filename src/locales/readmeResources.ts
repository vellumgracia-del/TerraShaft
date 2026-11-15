export const readmeResources = {
  id: {
    readme: {
      badgeId: "https://img.shields.io/badge/Bahasa-Indonesia%20🇮🇩-10b981?style=for-the-badge",
      badgeEn: "https://img.shields.io/badge/Language-English%20🇬🇧-inactive?style=for-the-badge",
      title: "TerraShaft (TerraRotate)",
      subtitle: "Adaptive Crop Rotation & Soil Regeneration Decision-Support Engine",
      intro1:
        "TerraShaft adalah aplikasi web untuk membantu petani dan Penyuluh Pertanian Lapangan (PPL) menyusun skenario rotasi tanaman adaptif berdasarkan observasi satelit, data cuaca, kelembapan tanah, topografi, karakteristik tanah, dan konteks pertanian lokal.",
      intro2:
        "Sistem mengubah data geospasial yang kompleks menjadi rekomendasi rotasi tanaman yang lebih mudah dipahami, dilengkapi estimasi kebutuhan air, indikator kesehatan tanah, risiko kekeringan, alternatif tanaman, serta alasan ilmiah di balik setiap rekomendasi.",
      noteLabel: "Catatan penting:",
      noteBody:
        "TerraShaft adalah sistem pendukung keputusan. Sistem tidak menggantikan pengukuran tanah langsung, penyuluh, agronom, atau keputusan petani. Nilai seperti kebutuhan air, kontribusi nitrogen, dan indeks Soil Battery merupakan estimasi model yang memiliki asumsi dan ketidakpastian.",
      tocTitle: "Daftar Isi",
      tocItems: [
        "- [Dokumentasi Tampilan Aplikasi (Screenshots)](#dokumentasi-tampilan-aplikasi-screenshots)",
        "- [Latar Belakang](#latar-belakang)",
        "- [Solusi](#solusi)",
        "- [13 Sumber Dataset, Referensi, & Peran Aktualnya di Sistem](#13-sumber-dataset-referensi--peran-aktualnya-di-sistem)",
        "- [Zonasi Agroekologi Global, Lokalisasi Kultivar & i18n](#zonasi-agroekologi-global-lokalisasi-kultivar--i18n)",
        "- [Cakupan Geografis dan Strategi Dataset](#cakupan-geografis-dan-strategi-dataset)",
        "- [Alur Kerja Sistem](#alur-kerja-sistem)",
        "- [Fitur Utama](#fitur-utama)",
        "- [Metodologi dan Asumsi](#metodologi-dan-asumsi)",
        "- [Provenansi Data](#provenansi-data)",
        "- [Arsitektur Teknologi](#arsitektur-teknologi)",
        "- [Keterbatasan](#keterbatasan)",
        "- [Menjalankan Proyek](#menjalankan-proyek)",
        "- [Sitasi dan Sumber Data](#sitasi-dan-sumber-data)",
        "- [Tim](#tim)",
        "- [Lisensi](#lisensi)",
      ].join("\n"),
      sectionsBody: `## Dokumentasi Tampilan Aplikasi (Screenshots)

### 1. Halaman Utama (Landing Page)
![TerraShaft Landing Page](./public/screenshots/01-landing.png)
*Pengantar platform intelijen geospasial TerraShaft yang menghubungkan telemetri NASA POWER dan ISRIC SoilGrids dengan perencanaan rotasi tanaman adaptif iklim.*

### 2. Dashboard Ringkasan Eksekutif & Telemetri Satelit (\`/overview\`)
![TerraShaft Overview Dashboard](./public/screenshots/02-overview-dashboard.png)
*Ringkasan telemetri lokasi aktif (indikator lengas akar NASA POWER \`GWETROOT\`, curah hujan NASA POWER \`PRECTOTCORR\`, tekstur tanah ISRIC SoilGrids v2.0, kapasitas menahan air $AWC$, zonasi AEZ, serta perbandingan 3 jalur rotasi).*

### 3. Peta Eksplorasi Lahan Interaktif (\`/field-map\`)
![TerraShaft Interactive Field Explorer](./public/screenshots/03-gis-field-explorer.png)
*Eksplorasi spasial berbasis Leaflet dengan preset lokasi lahan kering Indonesia & global, pencarian wilayah (\`/api/geocode\`), serta titik koordinat pengamatan.*

### 4. Perencana Rotasi 4 Musim & Komparasi Radar (\`/rotation-planner\`)
![TerraShaft 4-Season Rotation Planner](./public/screenshots/04-rotation-planner.png)
*Evaluasi kombinatorial $6^4 = 1.296$ sekuens rotasi ke dalam tiga skenario utama (Pathway A: Soil Regeneration, Pathway B: Drought Resilience, Pathway C: Cash-Flow Optimized) dengan kultivar terlokalisasi serta Algorithmic Audit Log.*

### 5. Asisten Agronomi AI Berbasis RAG (\`/field-advisor\`)
![TerraShaft AI Field Advisor](./public/screenshots/05-field-advisor-ai.png)
*Konsultasi agronomi kontekstual yang mengombinasikan telemetri lokasi aktif dan profil AEZ dengan basis pengetahuan lokal (BRIN, Balittanah, Kementan, FAO-56) disertai sitasi sumber ilmiah.*

### 6. Transparansi Provenansi Data & Katalog Sumber Ilmiah (\`/data-sources\`)
![TerraShaft Data Provenance & Scientific Catalog](./public/screenshots/06-data-provenance.png)
*Panel pelacakan provenansi API secara transparan (\`source\`, \`fetchedAt\`, \`observationPeriod\`, status cache/fallback) dan katalog 13 sumber referensi/data yang dipisahkan jujur menurut status implementasinya (\`Live API\`, \`Static Local Registry\`, \`Knowledge Base\`, \`Reference Standard\`, \`Planned Integration\`).*

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

1. **Observasi iklim & air zona akar:** curah hujan \`PRECTOTCORR\`, suhu, radiasi surya, dan indikator lengas perakaran \`GWETROOT\` dari NASA POWER.
2. **Kondisi lingkungan & AEZ:** evapotranspirasi acuan ($ET_0$), elevasi lokasi, panjang musim kering, GDD, belahan bumi, dan klasifikasi zona agroekologi (\`AgroecologicalProfile\`).
3. **Kondisi tanah dan pertanian:** fraksi tekstur (pasir, debu, liat), pH, karbon organik ($SOC$), $CEC$, kapasitas menahan air ($AWC$) dari ISRIC SoilGrids v2.0, serta spesies tanaman & registri kultivar terlokalisasi.
4. **Optimasi keputusan:** penyaringan tanaman berdasarkan batas air, kalender tanam 4 periode, tujuan regenerasi tanah, guardrail kultivar lintas negara, dan estimasi pendapatan.

Hasil akhirnya berupa beberapa skenario rotasi (Pathway A, B, dan C), bukan satu jawaban mutlak. Setiap skenario menunjukkan manfaat, risiko, alasan ilmiah (*audit log*), status bukti/fallback kultivar, dan sumber data yang digunakan.

---

## 13 Sumber Dataset, Referensi, & Peran Aktualnya di Sistem

Untuk menghindari *overclaim*, TerraShaft mengelompokkan ke-13 sumber dataset di katalog \`/data-sources\` ke dalam **5 status aktual di dalam kode**: \`Live API\`, \`Static Local Registry\`, \`Knowledge Base\`, \`Reference Standard\`, dan \`Planned Integration\`.

| Kategori Status | Sumber | Status Aktual di Kode |
|---|---|---|
| **\`Live API\`** | NASA POWER (\`/api/nasa-climate\`), ISRIC SoilGrids v2.0 (\`/api/soil-profile\`), Open-Meteo Elevation / SRTM DEM + Nominatim (\`/api/geocode\`) | Dipanggil langsung saat runtime dengan cache & fallback regional. |
| **\`Static Local Registry\`** | \`crop_species.json\` (6 spesies) & \`cultivars_registry.json\` (**23 entri kultivar statis** + metadata institusi) | Aktif di runtime; **belum** terhubung ke live API ketersediaan benih/registrasi resmi eksternal. |
| **\`Knowledge Base\`** | Dokumen RAG \`agronomyKnowledgeBase.ts\` (BRIN/Balittanah, ECOSTRESS, GEDI) | Sumber konteks konsultasi Field Advisor AI; tidak ada panggilan API ECOSTRESS/GEDI langsung. |
| **\`Reference Standard\`** | USDA Soil Taxonomy / Segitiga Tekstur, FAO-56 & GAEZ v4, GLDAS/ERA5 | Acuan konseptual/literatur & fallback statis; **tidak** ada query live SSURGO maupun raster FAO GAEZ. |
| **\`Planned Integration\`** | Direct SMAP API, Direct GPM/IMERG API, Landsat/MODIS/VIIRS, Sentinel-2 raster | Belum ada route API maupun pemrosesan citra spektral; tercantum sebagai roadmap & acuan. |

### Rincian 13 Sumber dalam Katalog

1. **NASA POWER (\`Live API\`):** Agroklimatologi harian (\`T2M_MIN\`, \`T2M_MAX\`, \`T2M\`, \`ALLSKY_SFC_SW_DWN\`, \`PRECTOTCORR\`, \`GWETROOT\`) diambil langsung melalui route \`/api/nasa-climate\` untuk perhitungan $ET_0$, pasokan hujan, dan indikator lengas perakaran.
2. **ISRIC SoilGrids v2.0 (\`Live API\`):** Fraksi tekstur (\`sand\`, \`silt\`, \`clay\`), \`soc\`, \`phh2o\`, dan \`cec\` (agregasi tertimbang 0–30 cm) via \`/api/soil-profile\` untuk kalkulasi $AWC$ dan klasifikasi tekstur.
3. **Open-Meteo Elevation / SRTM DEM (\`Live API\` titik elevasi | \`Planned Integration\` analisis lereng/runoff):** Route \`/api/geocode\` mengambil elevasi koordinat dari Open-Meteo Elevation API untuk klasifikasi sabuk elevasi AEZ. Pemrosesan raster kemiringan lereng & limpasan permukaan belum berjalan di runtime.
4. **NASA SMAP L4 Context (\`Live API parameter GWETROOT via NASA POWER\` | Direct SMAP API: \`Planned Integration\`):** TerraShaft **tidak** memanggil direct SMAP API. Indikator kelembapan zona akar runtime membaca parameter **\`GWETROOT\`** dari NASA POWER sebagai *model-assimilated root-zone wetness indicator*.
5. **NASA GPM / IMERG Context (\`Live API parameter PRECTOTCORR via NASA POWER\` | Direct GPM/IMERG API: \`Planned Integration\`):** TerraShaft **tidak** memiliki integrasi langsung ke API NASA GPM/IMERG. Data curah hujan runtime diambil dari parameter presipitasi terkoreksi **\`PRECTOTCORR\`** pada NASA POWER.
6. **Landsat & MODIS / VIIRS (\`Planned Integration\` / \`Reference Standard\`):** Tidak dipanggil sebagai API dan tidak ada pemrosesan NDVI/EVI di runtime; berfungsi sebagai kerangka referensi fase vegetasi.
7. **Copernicus Sentinel-2 (\`Planned Integration\` / \`Reference Standard\`):** Peta \`/field-map\` memakai basemap web Leaflet untuk visualisasi lokasi; belum ada pengambilan API maupun pemrosesan band optik 10 m Sentinel-2.
8. **GLDAS & ECMWF ERA5 (\`Reference Standard\`):** Acuan literatur reanalisis daratan/atmosfer; tidak diambil saat runtime (seluruh cuaca runtime berasal dari NASA POWER atau fallback lintang).
9. **NASA ECOSTRESS (\`Knowledge Base\` / \`Planned Integration\`):** Berperan sebagai entri pengetahuan lokal di \`agronomyKnowledgeBase.ts\` untuk konteks stres panas pada AI Advisor; tidak ada query LST ECOSTRESS langsung.
10. **NASA GEDI LiDAR (\`Knowledge Base\` / \`Planned Integration\`):** Berperan sebagai referensi agroforestri di \`agronomyKnowledgeBase.ts\`; tidak ada query footprint LiDAR GEDI di runtime.
11. **Riset Agronomi BRIN / Balittanah & Registri Kultivar Regional (\`Static Local Registry\` & \`Knowledge Base\`):** Berbasis data JSON statis lokal (\`src/data/cultivars_registry.json\` berisi **23 entri kultivar statis** untuk \`Indonesia\`, \`United States\`, \`Kenya\`, \`Tanzania / East Africa\`, \`Uganda\`, \`India / South Asia\`, \`Brazil / Latin America\`, dan \`Australia\`) serta dokumen RAG lokal. Referensi institusi (\`USDA NASS / Land-Grant Extension\`, \`KALRO / KEPHIS\`, \`ICAR / IRRI\`, \`EMBRAPA\`, \`GRDC\`, \`BRIN / Balittanah\`) tersimpan sebagai metadata string JSON—**belum** ada endpoint live \`GET /api/cultivars\`, \`GET /api/cultivar-recommendation\`, atau \`GET /api/evidence\`.
12. **FAO GAEZ v4 & FAO-56 (\`Reference Standard\` & \`Knowledge Base\`):** Konsep $ET_0$/$K_c$ FAO-56 dan literatur GAEZ v4 menjadi acuan metodologis serta dokumen RAG. **Belum** ada pengambilan data GAEZ, raster query, lapisan kesesuaian lahan GAEZ, atau skor GAEZ di mesin optimasi runtime.
13. **USDA Soil Taxonomy & SSURGO / STATSGO2 Reference (\`Reference Standard\`):** Klasifikasi **Segitiga Tekstur Tanah USDA** (\`classifySoilTexture\`) dan literatur NRCS menjadi acuan konseptual/pedagogis serta konstanta fallback statis wilayah CONUS saat SoilGrids timeout. **Tidak** ada query live ke SSURGO atau STATSGO2; nilai tanah runtime berasal dari ISRIC SoilGrids atau fallback regional statis.

---

## Zonasi Agroekologi Global, Lokalisasi Kultivar & i18n

TerraShaft memisahkan secara ketat **taksonomi spesies tanaman** dari **registri kultivar lokal statis** agar varietas Indonesia tidak pernah terbawa ke negara lain:

1. **Pemisahan Entitas Spesies vs Kultivar:** Spesies (\`src/data/crop_species.json\`) memuat 6 spesies (*Oryza sativa L.*, *Zea mays L.*, *Glycine max (L.) Merr.*, *Vigna radiata*, *Sorghum bicolor*, *Crotalaria juncea*). Kultivar (\`src/data/cultivars_registry.json\`) berisi **23 entri statis** yang mengikat tiap varietas ke \`country_or_region_of_release\`, \`allowed_agroecological_zones\`, \`registration_status\`, \`evidence_source\`, dan calibrated \`confidence_score\`.
2. **Pipeline Zonasi Agroekologi Global (\`src/lib/agroecologicalZoning.ts\`):** Mengonversi koordinat, elevasi, iklim NASA POWER, serta profil tanah ISRIC SoilGrids menjadi profil \`AgroecologicalProfile\` (negara, makro-wilayah, belahan bumi, sabuk elevasi, bulan kering, GDD, kelas fotoperiod, dan zona agroekologi).
3. **Isolasi Geografis & Fallback Arketipe (\`src/lib/cultivarLocalizer.ts\`):** Kultivar Indonesia (seperti Inpago, Bisi-18, Anjasmoro, Vima, Bioguma) dibatasi hanya untuk \`ID\`. Wilayah global dalam registri statis (\`US\`, \`KE\`, \`TZ\`, \`UG\`, \`IN\`, \`BR\`, \`AU\`) menampilkan varietas lokal yang sesuai zona AEZ, sedangkan wilayah tanpa entri registri melakukan fallback transparan ke **Arketipe Fenotipe Spesies** (*Phenotype Archetype*) tanpa mengarang nama varietas maupun status ketersediaan benih.
4. **Dukungan Dwibahasa i18n (\`en\` default & \`id\`):** Aplikasi menggunakan \`i18next\` (\`src/locales/en.json\` sebagai default, \`src/locales/id.json\` alternatif bahasa Indonesia). Pergantian bahasa \`EN | ID\` hanya mengubah teks antarmuka—telemetri, nama ilmiah, nama kultivar, unit metrik, dan hasil optimasi tetap identik.

---

## Cakupan Geografis dan Strategi Dataset

TerraShaft menggunakan pendekatan **Global Core APIs + Static Regional Registries**.

### Global Core (Live API di Seluruh Dunia)

Endpoint proxy yang dipanggil secara aktif saat runtime untuk Indonesia maupun koordinat global:

\`\`\`text
NASA POWER /api/nasa-climate (T2M, T2M_MAX, T2M_MIN, ALLSKY_SFC_SW_DWN, GWETROOT, PRECTOTCORR)
ISRIC SoilGrids 250m v2.0 /api/soil-profile (Sand, Silt, Clay, SOC, pH, CEC 0-30cm)
OpenStreetMap Nominatim + Open-Meteo Elevation /api/geocode (Geocoding & Elevasi DEM)
\`\`\`

### Konteks Regional & Preset Pengujian

- **Indonesia:** Preset lahan kering (Kupang Timur, Camplong, Sumba Timur, Gunungkidul, Indramayu, Lombok Timur), registri kultivar nasional \`ID\`, serta dokumen RAG BRIN/Balittanah pada modul Field Advisor.
- **Referensi Lintas Benua:** Preset pengujian global (Central Valley USA, Machakos Kenya, Murray-Darling Australia) dengan registri kultivar statis lokal masing-masing wilayah serta katalog 13 sumber dataset di \`/data-sources\`.

---

## Alur Kerja Sistem

\`\`\`text
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
\`\`\`

---

## Fitur Utama

### 1. Peta GIS & Input Lokasi Dinamis (\`/field-map\` & Header)

- Pencarian lokasi melalui nama wilayah dan *reverse geocoding* (\`/api/geocode\`).
- Input koordinat manual dan klik langsung pada peta interaktif Leaflet.
- Deteksi geolokasi perangkat pengguna.
- Preset wilayah lahan kering Indonesia dan lokasi referensi global.
- Validasi ketat latitude \`-90..90\` dan longitude \`-180..180\` (mengembalikan HTTP 400 tanpa *silent clamping*).

### 2. Multi-Source Climate & Soil Telemetry (\`/overview\`)

Menggabungkan indikator lengas akar NASA POWER (\`GWETROOT\`), presipitasi \`PRECTOTCORR\`, suhu, radiasi surya, fisika-kimia tanah (tekstur USDA, SOC, pH, CEC, AWC), serta ringkasan zona agroekologi (\`AgroecologicalProfileCard\`) dan metadata provenansi.

### 3. Soil Battery Index (\`/soil-battery\`)

Soil Battery adalah indeks komposit ($0–100\\%$) untuk memvisualisasikan simulasi dinamika kesehatan tanah dan neraca nitrogen alami ($\\Delta N$ dalam $\\text{kg N/ha}$), bukan pengganti uji laboratorium tanah:

- **Discharging:** Penanaman sereal rakus hara secara berturut-turut menurunkan kapasitas indeks baterai tanah.
- **Charging:** Penyisipan spesies legum penambat nitrogen (*Glycine max*, *Vigna radiata*) dan *cover crop* pemecah padas (*Crotalaria juncea*) dengan kultivar terlokalisasi memulihkan skor indeks baterai tanah.

### 4. Tiga Skenario Rotasi Optimal (\`/rotation-planner\`)

- **Pathway A — Soil Regeneration:** Memprioritaskan pemulihan indeks baterai tanah, fiksasi nitrogen biologis, dan biomassa penutup tanah.
- **Pathway B — Drought Resilience:** Memblokir tanaman boros air pada periode defisit air tinggi dan memprioritaskan spesies tahan kering dengan kultivar terlokalisasi (atau fallback arketipe fenotipe spesies).
- **Pathway C — Cash-Flow Optimized:** Memprioritaskan estimasi pendapatan bersih dengan tetap menjaga batas aman ketersediaan air tanah.

### 5. Water Balance Chart (\`/water-balance\`)

Grafik komparasi bulanan antara suplai curah hujan NASA POWER (\`PRECTOTCORR\`), indikator cadangan lengas perakaran (\`GWETROOT\`), dan estimasi kebutuhan evapotranspirasi tanaman ($ET_c = ET_0 \\times K_c$).

### 6. Algorithmic Audit Log

Setiap rekomendasi menampilkan alasan transparan mengapa suatu tanaman dipilih atau didiskualifikasi berdasarkan aturan ambang batas biofisik (misal defisit air $W_{deficit}$ atau penalti monokultur) serta metadata bukti/fallback kultivar.

### 7. AI Field Advisor Berbasis RAG (\`/field-advisor\`)

Asisten agronomi interaktif (\`/api/ai/advisor\`) yang memadukan pencarian dokumen pengetahuan lokal (\`agronomyKnowledgeBase.ts\`) dengan data iklim, tanah, dan profil AEZ lokasi aktif. Mendukung kunci API Gemini opsional (via \`/settings\`) maupun mesin analisis deterministik lokal penuh (*offline-capable fallback*) dengan sitasi ilmiah.

### 8. Ekspor Lembar Panduan WhatsApp (\`/action-sheet\`)

Mengekspor rekomendasi rotasi 4 musim beserta kultivar terlokalisasi/arketipe menjadi poster gambar PNG ($1080 \\times 1350\\text{ px}$) menggunakan \`html-to-image\`, lengkap dengan Mode Lapangan (*High-Contrast Outdoor Mode*).

---

## Metodologi dan Asumsi

### 1. Estimasi Evapotranspirasi Acuan ($ET_0$)

Dihitung di \`src/lib/evapotranspiration.ts\` menggunakan formula **Hargreaves-Samani terkalibrasi radiasi matahari permukaan** (\`ALLSKY_SFC_SW_DWN\`):

\`\`\`text
Ra_equiv (mm/hari) = ALLSKY_SFC_SW_DWN × 0.408
ET0 (mm/hari)      = 0.0023 × Ra_equiv × (Tmean + 17.8) × sqrt(max(0.5, Tmax - Tmin))
\`\`\`

### 2. Kebutuhan Air Tanaman ($ET_c$)

\`\`\`text
ETc = ET0_harian × Durasi_Tanam_Hari × (Kc_mid × 0.88)
\`\`\`

### 3. Kapasitas Menahan Air Tanah ($AWC$) & Klasifikasi Tekstur USDA

Dihitung di \`src/lib/pedotransfer.ts\` untuk lapisan perakaran 0–30 cm dari fraksi tekstur ISRIC SoilGrids v2.0 dan persentase karbon organik ($SOC$), disertai klasifikasi tekstur mengacu pada Segitiga Tekstur Tanah USDA:

\`\`\`text
AWC (mm / 30cm) = 0.15 × Sand% + 0.35 × Silt% + 0.40 × Clay% + 1.2 × SOC%
\`\`\`

### 4. Estimasi Ekonomi & Neraca Nitrogen

Perhitungan pendapatan bersih dan kontribusi nitrogen ($\\text{kg N/ha}$) pada \`src/lib/optimizationEngine.ts\` merupakan hasil simulasi model berbasis parameter pustaka spesies/komoditas lokal (\`src/data/crops_library.json\` & \`src/data/crop_species.json\`) dan harus disesuaikan dengan harga pasar serta kondisi lokal saat diterapkan di lapangan.

---

## Provenansi Data

Setiap respons proxy API (\`/api/nasa-climate\` dan \`/api/soil-profile\`) menyertakan kontrak metadata provenansi untuk membedakan data *live*, *cache*, dan *regional fallback*:

\`\`\`json
{
  "source": "ISRIC_SOILGRIDS_LIVE",
  "fetchedAt": "2026-11-15T06:00:00.000Z",
  "observationPeriod": "Standard Depth Layer 0-30cm",
  "cached": false,
  "fallbackReason": null
}
\`\`\`

Nilai \`source\` yang didukung di dalam sistem:

- \`NASA_POWER_LIVE\` — Respons langsung dari NASA POWER Agroclimatology API.
- \`ISRIC_SOILGRIDS_LIVE\` — Respons langsung dari ISRIC SoilGrids v2.0 REST API.
- \`FALLBACK_CLIMATOLOGY\` — Profil klimatologi regional terkalibrasi lintang ketika API NASA POWER mengalami *timeout* atau kendala jaringan.
- \`REGIONAL_FALLBACK\` — Profil pedologi regional statis ketika API ISRIC SoilGrids tidak merespons atau mengembalikan piksel perairan/perkotaan kosong.

\`fetchedAt\` mencatat waktu pengambilan data oleh server/cache dan dipisahkan secara tegas dari \`observationPeriod\` (periode observasi fisik/lapisan kedalaman tanah).

---

## Arsitektur Teknologi

- **Frontend Framework:** Next.js 16 (App Router, React 19, TypeScript).
- **Styling:** Tailwind CSS v4 (Dark Telemetry Theme & High-Contrast Outdoor Mode).
- **Internationalization (i18n):** \`i18next\` untuk aplikasi web dwibahasa (\`src/locales/en.json\` & \`src/locales/id.json\`) serta sinkronisasi dokumentasi multi-bahasa (\`README.md\` & \`README.id.md\`).
- **Peta Spasial:** Leaflet (\`react\` integration) dengan basemap satelit & dark vector.
- **Visualisasi Data:** Recharts (Dual-Axis Water Balance Chart & 5-Axis Pathway Radar Comparison).
- **State Management & Persistensi:** Zustand + \`idb-keyval\` + Service Worker PWA.
- **Ekspor Gambar:** \`html-to-image\` (render poster PNG $1080 \\times 1350\\text{ px}$ di sisi klien).
- **Backend API Route Handlers:**
  - \`/api/nasa-climate\` — Proxy NASA POWER Agroclimatology (\`T2M\`, \`T2M_MAX\`, \`T2M_MIN\`, \`ALLSKY_SFC_SW_DWN\`, \`PRECTOTCORR\`, \`GWETROOT\`) dengan *in-memory bounded cache* (TTL 24 jam) & fallback klimatologi regional.
  - \`/api/soil-profile\` — Proxy ISRIC SoilGrids v2.0 dengan agregasi tertimbang kedalaman 0–30 cm, *bounded cache* (TTL 30 hari), & fallback pedologi regional statis.
  - \`/api/geocode\` — Proxy OpenStreetMap Nominatim + Open-Meteo Elevation (SRTM/Copernicus DEM).
  - \`/api/ai/advisor\` — Endpoint RAG Field Advisor (mendukung kunci Gemini API opsional & mesin respons deterministik berbasis dokumen lokal).

---

## Keterbatasan

- **Tidak ada API satelit langsung selain NASA POWER, SoilGrids, Open-Meteo DEM, dan Nominatim:** TerraShaft tidak memanggil direct SMAP API (lengas akar runtime berasal dari NASA POWER \`GWETROOT\`), tidak memanggil direct GPM/IMERG API (curah hujan berasal dari \`PRECTOTCORR\`), tidak mengunduh raster FAO GAEZ/SSURGO/STATSGO2 di runtime, serta tidak memproses band citra Landsat, MODIS/VIIRS, Sentinel-2, ECOSTRESS, GEDI, atau ERA5/GLDAS.
- **Resolusi Grid & Prediksi Global:** NASA POWER (~0.5° / ~50 km) dan ISRIC SoilGrids (250 m *machine learning* global) merepresentasikan estimasi grid regional, bukan pengukuran sensor *in-situ* maupun uji laboratorium tanah lokal.
- **Registri Kultivar Masih Bersifat Statis:** \`src/data/cultivars_registry.json\` memuat 23 entri kurasi statis dan sitasi institusi sebagai metadata JSON lokal—belum terhubung ke layanan live API registrasi varietas resmi maupun ketersediaan benih di toko pertanian (\`/api/cultivars\`, \`/api/evidence\`).
- **Keluaran Simulasi:** Estimasi $ET_c$, skor Soil Battery, neraca nitrogen, dan estimasi pendapatan adalah keluaran model keputusan yang wajib divalidasi bersama PPL atau agronom setempat.

---

## Menjalankan Proyek

### Prasyarat

- Node.js 20 atau lebih baru.
- npm, pnpm, atau yarn.

### Instalasi

\`\`\`bash
git clone https://github.com/vellumgracia-del/TerraShaft.git
cd TerraShaft
npm install
\`\`\`

### Environment Variables (Opsional)

Aplikasi dapat langsung berjalan tanpa konfigurasi API key khusus karena NASA POWER dan ISRIC SoilGrids adalah API publik terbuka. Untuk kustomisasi endpoint atau mengaktifkan LLM eksternal pada Field Advisor, buat file \`.env.local\`:

\`\`\`text
NASA_POWER_BASE_URL=https://power.larc.nasa.gov/api
ISRIC_SOILGRIDS_BASE_URL=https://rest.isric.org/soilgrids/v2.0
NASA_POWER_TIMEOUT_MS=8000
SOILGRIDS_TIMEOUT_MS=8000
GEMINI_API_KEY=<opsional-untuk-ai-advisor>
\`\`\`

Jangan pernah melakukan commit file \`.env.local\` ke dalam repository.

### Menjalankan Pengujian & Server Pengembangan

\`\`\`bash
npm test
npm run lint
npm run dev
\`\`\`

Buka \`http://localhost:3000\` di browser.

### Sinkronisasi Dokumentasi Multi-Bahasa (\`i18next\`)

\`\`\`bash
npm run i18n:readme
\`\`\`

### Build Produksi

\`\`\`bash
npm run build
npm run start
\`\`\`

---

## Sitasi dan Sumber Data

- **NASA POWER Project:** NASA Langley Research Center (LaRC) Agroclimatology Archive (\`T2M\`, \`ALLSKY_SFC_SW_DWN\`, \`PRECTOTCORR\`, \`GWETROOT\`).
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

© 2026 TerraShaft Team — Built for resilient agriculture and space-to-field impact.`,
    },
  },
  en: {
    readme: {
      badgeId: "https://img.shields.io/badge/Bahasa-Indonesia%20🇮🇩-inactive?style=for-the-badge",
      badgeEn: "https://img.shields.io/badge/Language-English%20🇬🇧-10b981?style=for-the-badge",
      title: "TerraShaft (TerraRotate)",
      subtitle: "Adaptive Crop Rotation & Soil Regeneration Decision-Support Engine",
      intro1:
        "TerraShaft is a web application designed to help farmers and Agricultural Extension Officers (*Penyuluh Pertanian Lapangan* / PPL) build adaptive crop rotation scenarios based on satellite observations, weather data, soil moisture, topography, soil characteristics, and local agricultural context.",
      intro2:
        "The system transforms complex geospatial data into easy-to-understand crop rotation recommendations, complete with water requirement estimates, soil health indicators, drought risk assessments, crop alternatives, and the scientific rationale behind each recommendation.",
      noteLabel: "Important Note:",
      noteBody:
        "TerraShaft is a decision-support system. It does not replace direct in-situ soil measurements, agricultural extension officers, agronomists, or farmer judgment. Values such as water demand, nitrogen contribution, and the Soil Battery Index are model estimates that carry underlying assumptions and uncertainties.",
      tocTitle: "Table of Contents",
      tocItems: [
        "- [Application Screenshots](#application-screenshots)",
        "- [Background](#background)",
        "- [Solution](#solution)",
        "- [13 Dataset Sources, References, and Active System Roles](#13-dataset-sources-references-and-active-system-roles)",
        "- [Global Agroecological Zoning, Cultivar Localization & i18n](#global-agroecological-zoning-cultivar-localization--i18n)",
        "- [Geographic Coverage and Dataset Strategy](#geographic-coverage-and-dataset-strategy)",
        "- [System Workflow](#system-workflow)",
        "- [Key Features](#key-features)",
        "- [Methodology and Assumptions](#methodology-and-assumptions)",
        "- [Data Provenance](#data-provenance)",
        "- [Technology Architecture](#technology-architecture)",
        "- [Limitations](#limitations)",
        "- [Running the Project](#running-the-project)",
        "- [Citations and Data Sources](#citations-and-data-sources)",
        "- [Team](#team)",
        "- [License](#license)",
      ].join("\n"),
      sectionsBody: `## Application Screenshots

### 1. Landing Page (\`/landing\`)
![TerraShaft Landing Page](./public/screenshots/01-landing.png)
*Introduction to the TerraShaft geospatial intelligence platform bridging NASA POWER and ISRIC SoilGrids telemetry with climate-adaptive crop rotation planning.*

### 2. Executive Overview & Satellite Telemetry Dashboard (\`/overview\`)
![TerraShaft Overview Dashboard](./public/screenshots/02-overview-dashboard.png)
*Active-plot telemetry summary (NASA POWER \`GWETROOT\` root-zone wetness indicator, NASA POWER \`PRECTOTCORR\` precipitation, ISRIC SoilGrids v2.0 topsoil fractions, Available Water Capacity $AWC$, global AEZ profile, and 3-pathway rotation comparison).*

### 3. Interactive GIS Field Explorer (\`/field-map\`)
![TerraShaft Interactive Field Explorer](./public/screenshots/03-gis-field-explorer.png)
*Leaflet-based spatial explorer featuring Indonesian dryland & global reference presets, location geocoding (\`/api/geocode\`), and interactive plot selection.*

### 4. 4-Season Crop Rotation Planner & Radar Comparison (\`/rotation-planner\`)
![TerraShaft 4-Season Rotation Planner](./public/screenshots/04-rotation-planner.png)
*Combinatorial evaluation of $6^4 = 1,296$ rotation sequences across three optimization pathways (Pathway A: Soil Regeneration, Pathway B: Drought Resilience, Pathway C: Cash-Flow Optimized) with localized cultivars and Algorithmic Audit Logs.*

### 5. RAG-Powered AI Field Advisor (\`/field-advisor\`)
![TerraShaft AI Field Advisor](./public/screenshots/05-field-advisor-ai.png)
*Contextual agronomic assistant combining active field telemetry and AEZ zoning with local curated knowledge bases (BRIN, Balittanah, Ministry of Agriculture, FAO-56) and explicit citations.*

### 6. Data Provenance Transparency & Scientific Resource Catalog (\`/data-sources\`)
![TerraShaft Data Provenance & Scientific Catalog](./public/screenshots/06-data-provenance.png)
*Transparent API provenance tracking (\`source\`, \`fetchedAt\`, \`observationPeriod\`, cache/fallback state) alongside a structured 13-item catalog categorized by actual implementation status (\`Live API\`, \`Static Local Registry\`, \`Knowledge Base\`, \`Reference Standard\`, \`Planned Integration\`).*

---

## Background

Agriculture in dryland regions and rainfed food-production centers faces several critical challenges:

- Shifting rainfall patterns make historical planting calendars increasingly difficult to rely on without adjustment.
- Monoculture farming can accelerate nutrient depletion, pest and disease pressure, and vulnerability to water stress.
- Surface soil conditions do not always reflect the moisture available around the root zone.
- Satellite, climate, and soil datasets are available in massive volumes but are difficult to translate into actionable field decisions.
- Agronomic recommendations must simultaneously account for technical factors, economics, water availability, and local conditions.

TerraShaft is designed to bridge Earth observation data with practical, understandable agricultural action.

---

## Solution

TerraShaft combines four analytical layers:

1. **Climate & root-zone observations:** daily \`PRECTOTCORR\` precipitation, temperature, solar radiation, and model-assimilated root-zone wetness indicator (\`GWETROOT\`) from NASA POWER.
2. **Environmental & AEZ profiling:** reference evapotranspiration ($ET_0$), elevation, dry-season duration, GDD, hemisphere, and agroecological zone classification (\`AgroecologicalProfile\`).
3. **Soil & agricultural context:** soil texture fractions (sand, silt, clay), pH, soil organic carbon ($SOC$), cation exchange capacity ($CEC$), available water capacity ($AWC$) from ISRIC SoilGrids v2.0, separated species entities, and localized cultivar registry entries.
4. **Decision optimization:** crop filtering based on water constraints, 4-period planting calendars, soil regeneration goals, cross-border cultivar guardrails, and projected net revenue.

The final output presents three ranked rotation pathways (Pathway A, B, and C) rather than a single rigid answer. Each scenario highlights benefits, risks, algorithmic audit logs, cultivar evidence/fallback status, and data provenance.

---

## 13 Dataset Sources, References, and Active System Roles

To prevent overclaiming and clarify exactly what executes in runtime code versus what serves as scientific/knowledge-base context, all 13 catalogued items in \`/data-sources\` are grouped into **5 explicit implementation statuses**: \`Live API\`, \`Static Local Registry\`, \`Knowledge Base\`, \`Reference Standard\`, and \`Planned Integration\`.

| Status Label | Sources | Actual Implementation in Code |
|---|---|---|
| **\`Live API\`** | NASA POWER (\`/api/nasa-climate\`), ISRIC SoilGrids v2.0 (\`/api/soil-profile\`), Open-Meteo Elevation / SRTM DEM + Nominatim (\`/api/geocode\`) | Actively fetched at runtime via server route proxies with bounded caching & regional failover. |
| **\`Static Local Registry\`** | \`crop_species.json\` (6 species) & \`cultivars_registry.json\` (**23 static cultivar entries** + institutional metadata) | Active in cultivar localization & optimization; **not** connected to external live registration/seed-availability APIs yet. |
| **\`Knowledge Base\`** | Local RAG documents in \`agronomyKnowledgeBase.ts\` (BRIN/Balittanah, ECOSTRESS, GEDI) | Textual context retrieved by the AI Field Advisor; no direct ECOSTRESS/GEDI satellite API calls. |
| **\`Reference Standard\`** | USDA Soil Texture Triangle, FAO-56 & GAEZ v4 literature, GLDAS/ERA5 reanalysis docs | Conceptual formulas & static fallback constants; **no** runtime SSURGO live queries or FAO GAEZ raster layers. |
| **\`Planned Integration\`** | Direct SMAP API, Direct GPM/IMERG API, Landsat/MODIS/VIIRS indices, Sentinel-2 spectral processing | Documented on roadmap & catalog; no API routes or spectral raster processing in runtime pipeline. |

### Breakdown of the 13 Catalogued Sources

1. **NASA POWER (\`Live API\`):** Daily agroclimatology (\`T2M_MIN\`, \`T2M_MAX\`, \`T2M\`, \`ALLSKY_SFC_SW_DWN\`, \`PRECTOTCORR\`, \`GWETROOT\`) fetched via \`/api/nasa-climate\` to calculate $ET_0$, precipitation supply, and root-zone wetness.
2. **ISRIC SoilGrids v2.0 (\`Live API\`):** Depth-weighted 0–30 cm topsoil properties (\`sand\`, \`silt\`, \`clay\`, \`soc\`, \`phh2o\`, \`cec\`) fetched via \`/api/soil-profile\` to calculate Available Water Capacity ($AWC$) and soil texture class.
3. **Open-Meteo Elevation / SRTM DEM (\`Live API\` point elevation | \`Planned Integration\` slope/runoff rasters):** \`/api/geocode\` fetches coordinate elevation from Open-Meteo Elevation (SRTM/Copernicus DEM) for AEZ elevation-band classification; gridded slope/runoff calculations are not run at runtime.
4. **NASA SMAP L4 Context (\`Live API parameter GWETROOT via NASA POWER\` | Direct SMAP API: \`Planned Integration\`):** TerraShaft does **not** call a direct SMAP API endpoint. Root-zone moisture at runtime uses NASA POWER \`GWETROOT\` as a model-assimilated root-zone wetness indicator.
5. **NASA GPM / IMERG Context (\`Live API parameter PRECTOTCORR via NASA POWER\` | Direct GPM/IMERG API: \`Planned Integration\`):** TerraShaft does **not** have a direct NASA GPM/IMERG integration. Runtime rainfall relies on NASA POWER precipitation parameter \`PRECTOTCORR\`.
6. **Landsat & MODIS / VIIRS (\`Planned Integration\` / \`Reference Standard\`):** Not fetched via API and no NDVI/EVI pixel processing runs in runtime calculations; included as vegetation-monitoring reference context.
7. **Copernicus Sentinel-2 (\`Planned Integration\` / \`Reference Standard\`):** \`/field-map\` displays Leaflet web tiles for spatial orientation; no raw Sentinel-2 10 m multispectral bands or Copernicus API calls are executed.
8. **GLDAS & ECMWF ERA5 (\`Reference Standard\`):** Land-surface reanalysis background standards; not fetched at runtime (all runtime weather telemetry comes from NASA POWER or calibrated latitude fallbacks).
9. **NASA ECOSTRESS (\`Knowledge Base\` / \`Planned Integration\`):** Curated RAG document entry in \`agronomyKnowledgeBase.ts\` explaining heat-stress & soil-cooling cover crop concepts; no live ECOSTRESS LST API calls.
10. **NASA GEDI LiDAR (\`Knowledge Base\` / \`Planned Integration\`):** Curated RAG document entry describing canopy-structure & agroforestry windbreaks; no live GEDI waveform/LiDAR API calls.
11. **Regional Cultivar Registry & BRIN / Extension Knowledge Base (\`Static Local Registry\` & \`Knowledge Base\`):** Static JSON registry (\`src/data/cultivars_registry.json\`) containing **23 curated cultivar entries** across \`Indonesia\`, \`United States\`, \`Kenya\`, \`Tanzania / East Africa\`, \`Uganda\`, \`India / South Asia\`, \`Brazil / Latin America\`, and \`Australia\`, plus BRIN/Balittanah RAG docs. Institutional references (\`USDA NASS / Land-Grant Extension\`, \`KALRO / KEPHIS\`, \`ICAR / IRRI\`, \`EMBRAPA\`, \`GRDC\`, \`BRIN / Balittanah\`) are stored as local JSON metadata strings—live endpoints such as \`GET /api/cultivars\`, \`GET /api/cultivar-recommendation\`, or \`GET /api/evidence\` are **not yet implemented**.
12. **FAO GAEZ v4 & FAO-56 (\`Reference Standard\` & \`Knowledge Base\`):** FAO-56 informs conceptual $ET_0$/$K_c$ calculations and GAEZ v4 appears in the RAG knowledge base; **FAO GAEZ is not a runtime input** (no GAEZ fetch, raster query, suitability layer, API route, or GAEZ score enters the optimization engine).
13. **USDA Soil Taxonomy & SSURGO / STATSGO2 Reference (\`Reference Standard\`):** The **USDA Soil Texture Triangle** (\`classifySoilTexture\`) and NRCS pedological references inform conceptual texture classification and static regional/CONUS fallback constants when ISRIC SoilGrids times out; **there is no live query to SSURGO or STATSGO2**, and runtime soil values originate from ISRIC SoilGrids or calibrated regional failover.

---

## Global Agroecological Zoning, Cultivar Localization & i18n

TerraShaft strictly separates **crop species taxonomy** from **static regional cultivar records** so domestic varieties never leak across borders without verified release mapping:

1. **Separated Taxonomy (\`src/data/crop_species.json\` vs \`src/data/cultivars_registry.json\`):** Evaluates 6 base crop species first (*Oryza sativa L.*, *Zea mays L.*, *Glycine max (L.) Merr.*, *Vigna radiata*, *Sorghum bicolor*, *Crotalaria juncea*). The static registry (\`23\` curated entries) binds each variety to explicit \`country_or_region_of_release\`, \`allowed_agroecological_zones\`, \`registration_status\`, \`evidence_source\`, and calibrated \`confidence_score\`.
2. **Global Agroecological Zoning (\`src/lib/agroecologicalZoning.ts\`):** Transforms coordinates, elevation, NASA POWER climate telemetry, and ISRIC SoilGrids topsoil fractions into a normalized \`AgroecologicalProfile\` (country, macro-region, hemisphere, elevation band, dry-season months, annual GDD, photoperiod class, and AEZ class).
3. **Cross-Border Guardrail & Archetype Fallback (\`src/lib/cultivarLocalizer.ts\`):** Indonesian varieties (Inpago, Bisi-18, Anjasmoro, Vima, Bioguma) are restricted strictly to \`ID\`. Global coordinates in covered territories (\`US\`, \`KE\`, \`TZ\`, \`UG\`, \`IN\`, \`BR\`, \`AU\`) resolve static local regional entries when AEZ-compatible, while unmapped territories transparently fall back to a **Species Phenotype Archetype** without fabricating cultivar names, yields, or seed availability.
4. **Bilingual Web App i18n (\`en\` default / \`id\` alternative):** Built with \`i18next\` (\`src/locales/en.json\` default for demo mode, \`src/locales/id.json\` alternative). Switching \`EN | ID\` updates UI text only—telemetry, scientific names, cultivar identities, units, and optimization calculations remain invariant.

---

## Geographic Coverage and Dataset Strategy

TerraShaft implements a **Global Core Live APIs + Static Regional Registries** architecture.

### Global Core (Live Runtime APIs Worldwide)

Active backend route proxies operating across Indonesia and global coordinates:

\`\`\`text
NASA POWER /api/nasa-climate (T2M, T2M_MAX, T2M_MIN, ALLSKY_SFC_SW_DWN, GWETROOT, PRECTOTCORR)
ISRIC SoilGrids 250m v2.0 /api/soil-profile (Sand, Silt, Clay, SOC, pH, CEC 0-30cm)
OpenStreetMap Nominatim + Open-Meteo Elevation /api/geocode (Geocoding & DEM Elevation)
\`\`\`

### Regional Contexts & Benchmark Presets

- **Indonesia:** Dryland presets (East Kupang, Camplong, East Sumba, Gunungkidul, Indramayu, East Lombok), static \`ID\` cultivar registry entries, and BRIN/Balittanah RAG documents in Field Advisor.
- **International Benchmarks:** Cross-continental AEZ presets (Central Valley USA, Machakos Kenya, Murray-Darling Australia) backed by static regional cultivar records or transparent Phenotype Archetype fallback, plus the 13-item dataset/reference catalog at \`/data-sources\`.

---

## System Workflow

\`\`\`text
Coordinate input / place search / preset selection on map
              ↓
Strict coordinate validation (-90..90 lat, -180..180 lon without silent clamping)
              ↓
Parallel telemetry fetching via Next.js Route Handler proxies:
  • /api/nasa-climate (NASA POWER: T2M, solar irradiance, GWETROOT, PRECTOTCORR)
  • /api/soil-profile (ISRIC SoilGrids v2.0 0–30 cm)
  • /api/geocode (Nominatim + Open-Meteo DEM elevation)
              ↓
Quality control, fill-value masking (-999), & calibrated regional fallback on timeout
              ↓
Global AEZ profiling (agroecologicalZoning.ts) & Static Cultivar / Archetype resolution
              ↓
Computing daily ET0 (Hargreaves-Samani), crop ETc, soil AWC, & Water Balance
              ↓
Combinatorial evaluation of 6^4 = 1,296 4-period rotation sequences → Pathway A, B, & C
              ↓
Generating Algorithmic Audit Logs, Provenance Badges, RAG Field Advisory, & PNG Action Sheet
\`\`\`

---

## Key Features

### 1. Interactive GIS Map & Dynamic Location Input (\`/field-map\` & Header)

- Place name search and reverse geocoding (\`/api/geocode\`).
- Manual GPS coordinate input and interactive Leaflet map pin selection.
- Device geolocation support.
- Built-in presets for Indonesian drylands and global agricultural basins.
- Strict coordinate bounds validation (\`-90..90\` latitude, \`-180..180\` longitude) returning HTTP 400 on invalid inputs without silent clamping.

### 2. Multi-Source Climate & Soil Telemetry (\`/overview\`)

Integrates NASA POWER \`GWETROOT\` root-zone wetness indicator, \`PRECTOTCORR\` precipitation, temperature, solar radiation, topsoil physico-chemical properties (USDA texture class, SOC, pH, CEC, AWC), global AEZ profiling (\`AgroecologicalProfileCard\`), and API provenance metadata.

### 3. Soil Battery Index (\`/soil-battery\`)

The Soil Battery is a composite heuristic index ($0–100\\%$) designed to communicate simulated soil health dynamics and biological nitrogen balance ($\\Delta N$ in $\\text{kg N/ha}$), not a replacement for laboratory soil testing:

- **Discharging:** Consecutive nutrient-demanding cereal monocultures deplete the Soil Battery score.
- **Charging:** Incorporating nitrogen-fixing legumes (*Glycine max*, *Vigna radiata*) and hardpan-penetrating cover crops (*Crotalaria juncea*) with regionally verified cultivars recharges the Soil Battery index.

### 4. Three Optimal Rotation Scenarios (\`/rotation-planner\`)

- **Pathway A — Soil Regeneration:** Maximizes Soil Battery recovery, biological nitrogen fixation, and organic biomass return.
- **Pathway B — Drought Resilience:** Disqualifies water-intensive crops during severe deficit windows and prioritizes drought-tolerant species with localized cultivars (or transparent phenotype archetypes).
- **Pathway C — Cash-Flow Optimized:** Maximizes projected net farm revenue while enforcing root-zone water safety constraints.

### 5. Water Balance Chart (\`/water-balance\`)

Monthly dual-axis comparison between NASA POWER precipitation supply (\`PRECTOTCORR\`), NASA POWER root-zone wetness indicator (\`GWETROOT\`), and crop evapotranspiration demand ($ET_c = ET_0 \\times K_c$).

### 6. Algorithmic Audit Log

Every recommendation transparently exposes why specific crops were selected or disqualified based on biophysical threshold rules (e.g., $W_{deficit}$ limits or monoculture pest penalties) alongside cultivar evidence and fallback metadata.

### 7. RAG-Powered AI Field Advisor (\`/field-advisor\`)

Interactive agronomic assistant (\`/api/ai/advisor\`) combining document retrieval from \`agronomyKnowledgeBase.ts\` with live climate/soil telemetry and AEZ profiles. Supports user-configured Gemini API keys (via \`/settings\`) as well as a built-in deterministic offline-capable advisory engine with explicit scientific citations.

### 8. WhatsApp Action Sheet Export (\`/action-sheet\`)

Renders the 4-season rotation plan and localized cultivars/archetypes into a high-resolution mobile-friendly PNG poster ($1080 \\times 1350\\text{ px}$) via \`html-to-image\`, paired with a **High-Contrast Outdoor Mode** for readability under direct sunlight.

---

## Methodology and Assumptions

### 1. Reference Evapotranspiration ($ET_0$)

Computed in \`src/lib/evapotranspiration.ts\` using the **radiation-calibrated Hargreaves-Samani equation** driven by NASA POWER surface shortwave radiation (\`ALLSKY_SFC_SW_DWN\`):

\`\`\`text
Ra_equiv (mm/day) = ALLSKY_SFC_SW_DWN × 0.408
ET0 (mm/day)      = 0.0023 × Ra_equiv × (Tmean + 17.8) × sqrt(max(0.5, Tmax - Tmin))
\`\`\`

### 2. Crop Water Requirement ($ET_c$)

\`\`\`text
ETc = Daily_ET0 × Growth_Duration_Days × (Kc_mid × 0.88)
\`\`\`

### 3. Available Water Capacity ($AWC$) & USDA Texture

Computed in \`src/lib/pedotransfer.ts\` for the 0–30 cm topsoil layer from ISRIC SoilGrids v2.0 particle-size fractions and Soil Organic Carbon ($SOC$), with texture classes referencing the conceptual USDA Soil Texture Triangle:

\`\`\`text
AWC (mm / 30cm) = 0.15 × Sand% + 0.35 × Silt% + 0.40 × Clay% + 1.2 × SOC%
\`\`\`

### 4. Economic & Nitrogen Balance Estimates

Projected net revenue and biological nitrogen contributions ($\\text{kg N/ha}$) in \`src/lib/optimizationEngine.ts\` are model simulations parameterized by local crop species/commodity libraries (\`src/data/crops_library.json\` & \`src/data/crop_species.json\`) and should be calibrated with local market prices and field observations.

---

## Data Provenance

Every backend proxy response (\`/api/nasa-climate\` and \`/api/soil-profile\`) embeds a strict provenance metadata contract distinguishing live API observations, cached responses, and calibrated regional failovers:

\`\`\`json
{
  "source": "ISRIC_SOILGRIDS_LIVE",
  "fetchedAt": "2026-11-15T06:00:00.000Z",
  "observationPeriod": "Standard Depth Layer 0-30cm",
  "cached": false,
  "fallbackReason": null
}
\`\`\`

Supported \`source\` identifiers in the codebase:

- \`NASA_POWER_LIVE\` — Live response from the NASA POWER Agroclimatology API.
- \`ISRIC_SOILGRIDS_LIVE\` — Live response from the ISRIC SoilGrids v2.0 REST API.
- \`FALLBACK_CLIMATOLOGY\` — Latitude-calibrated regional climatology baseline used when the upstream NASA POWER API times out or is unreachable.
- \`REGIONAL_FALLBACK\` — Calibrated regional pedological profile used when ISRIC SoilGrids is unreachable or returns masked water/urban pixels.

\`fetchedAt\` records the network/cache retrieval timestamp and is strictly separated from \`observationPeriod\` (the physical satellite observation window or soil depth horizon).

---

## Technology Architecture

- **Frontend Framework:** Next.js 16 (App Router, React 19, TypeScript).
- **Styling:** Tailwind CSS v4 (Dark Telemetry Theme & High-Contrast Outdoor Mode).
- **Internationalization (i18n):** \`i18next\` powering the bilingual web app (\`src/locales/en.json\` & \`src/locales/id.json\`) and synchronized documentation (\`README.md\` & \`README.id.md\`).
- **Spatial Mapping:** Leaflet with satellite imagery and dark vector basemaps.
- **Data Visualization:** Recharts (Dual-Axis Water Balance Chart & 5-Axis Pathway Radar Comparison).
- **State Management & Offline Persistence:** Zustand + \`idb-keyval\` + PWA Service Worker.
- **Image Export:** \`html-to-image\` (client-side $1080 \\times 1350\\text{ px}$ PNG poster rendering).
- **Backend API Route Handlers:**
  - \`/api/nasa-climate\` — NASA POWER Agroclimatology proxy (\`T2M\`, \`T2M_MAX\`, \`T2M_MIN\`, \`ALLSKY_SFC_SW_DWN\`, \`PRECTOTCORR\`, \`GWETROOT\`) with bounded in-memory caching (24h TTL) & regional climatology failover.
  - \`/api/soil-profile\` — ISRIC SoilGrids v2.0 proxy with 0–30 cm depth-weighted aggregation, bounded caching (30d TTL), & static regional soil failover.
  - \`/api/geocode\` — OpenStreetMap Nominatim & Open-Meteo Elevation (SRTM/Copernicus DEM) proxy.
  - \`/api/ai/advisor\` — RAG Field Advisor endpoint supporting both Gemini API keys and a deterministic local citation engine.

---

## Limitations

- **Runtime telemetry scope:** Only NASA POWER (\`/api/nasa-climate\`), ISRIC SoilGrids v2.0 (\`/api/soil-profile\`), OpenStreetMap Nominatim, and Open-Meteo Elevation (\`/api/geocode\`) are called via live HTTP APIs. There is **no** direct SMAP API route (root-zone wetness uses NASA POWER \`GWETROOT\`), **no** direct GPM/IMERG API route (rainfall uses \`PRECTOTCORR\`), **no** runtime FAO GAEZ or SSURGO/STATSGO2 queries, and **no** runtime spectral/LiDAR ingestion from Landsat, MODIS/VIIRS, Sentinel-2, ECOSTRESS, GEDI, or ERA5/GLDAS.
- **Spatial scale & global models:** NASA POWER (~0.5° / ~50 km) and ISRIC SoilGrids (250 m machine-learning predictions) reflect regional estimates rather than sub-meter in-situ sensors or laboratory soil tests.
- **Static cultivar registry:** \`src/data/cultivars_registry.json\` holds 23 curated static entries across supported countries/regions with institutional citations stored as local JSON metadata; there are no external live cultivar-registration or commercial seed-availability endpoints (\`/api/cultivars\`, \`/api/cultivar-recommendation\`, \`/api/evidence\`) yet.
- **Simulation outputs:** Crop water demand ($ET_c$), Soil Battery scores, nitrogen balances, and financial projections are heuristic simulation estimates requiring validation by local agronomists or extension officers.

---

## Running the Project

### Prerequisites

- Node.js 20 or newer.
- npm, pnpm, or yarn.

### Installation

\`\`\`bash
git clone https://github.com/vellumgracia-del/TerraShaft.git
cd TerraShaft
npm install
\`\`\`

### Environment Variables (Optional)

The application runs out of the box without secret API keys because NASA POWER and ISRIC SoilGrids are open public APIs. To customize upstream timeouts/URLs or configure a server-side Gemini API key for the Field Advisor, create a \`.env.local\` file:

\`\`\`text
NASA_POWER_BASE_URL=https://power.larc.nasa.gov/api
ISRIC_SOILGRIDS_BASE_URL=https://rest.isric.org/soilgrids/v2.0
NASA_POWER_TIMEOUT_MS=8000
SOILGRIDS_TIMEOUT_MS=8000
GEMINI_API_KEY=<optional-for-ai-advisor>
\`\`\`

Never commit \`.env.local\` or secret keys to version control.

### Running Tests and Development Server

\`\`\`bash
npm test
npm run lint
npm run dev
\`\`\`

Open \`http://localhost:3000\` in your browser.

### Synchronizing Bilingual Documentation (\`i18next\`)

\`\`\`bash
npm run i18n:readme
\`\`\`

### Production Build

\`\`\`bash
npm run build
npm run start
\`\`\`

---

## Citations and Data Sources

- **NASA POWER Project:** NASA Langley Research Center (LaRC) Agroclimatology Archive (\`T2M\`, \`ALLSKY_SFC_SW_DWN\`, \`PRECTOTCORR\`, \`GWETROOT\`).
- **ISRIC — World Soil Information:** SoilGrids 250m v2.0 (*Poggio et al., 2021*).
- **Open-Meteo Elevation & OpenStreetMap Nominatim:** Elevation DEM & forward/reverse geocoding APIs.
- **Reference Standards (Conceptual & Knowledge Base):** FAO Irrigation and Drainage Paper No. 56 (*Allen et al., 1998*), FAO GAEZ v4, USDA Soil Taxonomy / NRCS Soil Texture Triangle, NASA SMAP L4 / GPM / ECOSTRESS / GEDI / Landsat / Sentinel-2 / ERA5 / GLDAS literature, and regional agronomic references (BRIN, Balittanah, Kementan, USDA NASS/Extension, KALRO/KEPHIS, ICAR/IRRI, EMBRAPA, GRDC).

---

## Team

- **Zulfa Fahmiy Al Murtadlo** ([@varosaghasi](https://github.com/varosaghasi)) — Team Owner
- **Mohammad Arga** ([@rifaldhi](https://github.com/rifaldhi))
- **Moch. Hafidz Zawawi** ([@zawacaprio](https://github.com/zawacaprio))
- **Stiven Josh Peter Siburian** ([@stevenjoshburian](https://github.com/stevenjoshburian))
- **Ravi Arnan Irianto** ([@raviarnan](https://github.com/raviarnan))

---

## License

Developed for sustainable agricultural research, education, and innovation (NASA Space Apps Challenge). Satellite, soil, and agroclimatological data attributions follow the open-access terms of their respective providers (NASA Earthdata, ISRIC SoilGrids CC-BY 4.0, FAO, and BRIN/Kementan).

© 2026 TerraShaft Team — Built for resilient agriculture and space-to-field impact.`,
    },
  },
} as const;
