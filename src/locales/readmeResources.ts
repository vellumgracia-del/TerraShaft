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
        "- [13 Dataset Terintegrasi & Peran Aktualnya di Sistem](#13-dataset-terintegrasi--peran-aktualnya-di-sistem)",
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
*Pengantar platform intelijen geospasial TerraShaft yang menghubungkan observasi satelit NASA dengan perencanaan rotasi tanaman lahan kering.*

### 2. Dashboard Ringkasan Eksekutif & Telemetri Satelit (\`/overview\`)
![TerraShaft Overview Dashboard](./public/screenshots/02-overview-dashboard.png)
*Ringkasan telemetri lokasi aktif (kelembapan zona perakaran SMAP \`GWETROOT\`, curah hujan GPM \`PRECTOTCORR\`, tekstur tanah ISRIC SoilGrids v2.0, kapasitas menahan air $AWC$, serta perbandingan 3 jalur rotasi).*

### 3. Peta Eksplorasi Lahan Interaktif (\`/field-map\`)
![TerraShaft Interactive Field Explorer](./public/screenshots/03-gis-field-explorer.png)
*Eksplorasi spasial berbasis Leaflet dengan citra satelit resolusi tinggi, preset lokasi lahan kering Indonesia & global, pencarian wilayah, serta delineasi petak pengamatan.*

### 4. Perencana Rotasi 4 Musim & Komparasi Radar (\`/rotation-planner\`)
![TerraShaft 4-Season Rotation Planner](./public/screenshots/04-rotation-planner.png)
*Evaluasi kombinatorial $6^4 = 1.296$ sekuens rotasi ke dalam tiga skenario utama (Pathway A: Soil Regeneration, Pathway B: Drought Resilience, Pathway C: Cash-Flow Optimized) lengkap dengan Algorithmic Audit Log.*

### 5. Asisten Agronomi AI Berbasis RAG (\`/field-advisor\`)
![TerraShaft AI Field Advisor](./public/screenshots/05-field-advisor-ai.png)
*Konsultasi agronomi kontekstual yang mengombinasikan telemetri lokasi aktif dengan basis pengetahuan lokal (BRIN, Balittanah, Kementan, FAO-56) disertai sitasi sumber ilmiah.*

### 6. Transparansi Provenansi Data & Katalog Sumber Ilmiah (\`/data-sources\`)
![TerraShaft Data Provenance & Scientific Catalog](./public/screenshots/06-data-provenance.png)
*Panel pelacakan provenansi API secara transparan (\`source\`, \`fetchedAt\`, \`observationPeriod\`, status cache/fallback) dan katalog 13 sumber data observasi bumi beserta status integrasinya.*

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

1. **Observasi lahan:** kondisi vegetasi, perubahan tutupan lahan, kelembapan tanah zona perakaran, dan konteks termal permukaan.
2. **Kondisi lingkungan:** curah hujan, temperatur, radiasi matahari, evapotranspirasi acuan ($ET_0$), dan elevasi lokasi.
3. **Kondisi tanah dan pertanian:** fraksi tekstur (pasir, debu, liat), pH, karbon organik ($SOC$), kapasitas tukar kation ($CEC$), kapasitas menahan air ($AWC$), dan pustaka komoditas lokal.
4. **Optimasi keputusan:** penyaringan tanaman berdasarkan batas air, kalender tanam 4 periode, tujuan regenerasi tanah, dan estimasi pendapatan.

Hasil akhirnya berupa beberapa skenario rotasi (Pathway A, B, dan C), bukan satu jawaban mutlak. Setiap skenario menunjukkan manfaat, risiko, alasan ilmiah (*audit log*), asumsi model, dan sumber data yang digunakan.

---

## 13 Dataset Terintegrasi & Peran Aktualnya di Sistem

Untuk menjaga akuntabilitas ilmiah dan menghindari *overclaim*, TerraShaft mengelompokkan sumber data berdasarkan **tingkat integrasi aktual di dalam kode**:

### A. Live API & Telemetri Inti (Dipanggil Langsung di Backend)

1. **NASA POWER:** Data agroklimatologi harian (suhu min/max/rata-rata \`T2M_MIN\`, \`T2M_MAX\`, \`T2M\` dan radiasi surya permukaan \`ALLSKY_SFC_SW_DWN\`) via *live API* (\`/api/nasa-climate\`) untuk kalkulasi laju evapotranspirasi acuan harian ($ET_0$ metode Hargreaves-Samani terkalibrasi radiasi mengacu FAO-56).
2. **NASA SMAP (Level-4):** Estimasi lengas tanah zona perakaran (\`GWETROOT\` kedalaman 0–100 cm yang diasimilasi melalui endpoint NASA POWER) untuk indikator Baterai Tanah dan ambang peringatan dini kekeringan ($GWETROOT < 0.25$).
3. **ISRIC SoilGrids v2.0:** Data fraksi tekstur tanah (pasir \`sand\`, debu \`silt\`, liat \`clay\`), karbon organik (\`soc\`), \`phh2o\`, dan \`cec\` pada kedalaman 0–5 cm, 5–15 cm, dan 15–30 cm (dirata-ratakan tertimbang untuk lapisan 0–30 cm) via *live REST API* (\`/api/soil-profile\`) untuk menghitung kapasitas menahan air tanah ($AWC$).
4. **NASA GPM / IMERG:** Akumulasi presipitasi harian/bulanan (via parameter terkoreksi \`PRECTOTCORR\` di NASA POWER) untuk perhitungan input neraca air (*water balance*) dan deteksi defisit air musiman.

### B. Referensi Spasial GIS & Kalibrasi Bio-Model Satelit

5. **NASA SRTM / Copernicus DEM:** Deteksi elevasi titik koordinat lahan secara otomatis via endpoint \`/api/geocode\` (Open-Meteo Elevation API berbasis SRTM/Copernicus DEM) serta konteks topografi untuk rekomendasi tanaman konservasi penahan erosi.
6. **Landsat & MODIS / VIIRS:** Referensi reflektansi permukaan dan dinamika indeks vegetasi (NDVI/EVI) untuk kalibrasi fase pertanaman, koefisien tanaman ($K_c$), dan identifikasi periode bera pada modul eksplorasi GIS.
7. **Copernicus Sentinel-2 (ESA):** Referensi citra optik resolusi tinggi (10 m) pendamping basemap satelit pada GIS Explorer untuk delineasi visual batas petak lahan (*Area of Interest* / AOI).
8. **GLDAS & ECMWF ERA5:** Model asimilasi daratan dan reanalisis atmosfer kontinu yang menjadi acuan kontinuitas deret waktu cuaca serta profil kelembapan tanah multi-lapisan.

### C. Penguatan Lahan Kering Indonesia (RAG Knowledge Base & Parameter Lokal)

9. **NASA ECOSTRESS (JPL):** Basis pengetahuan indikator suhu permukaan daratan (*Land Surface Temperature*) dan cekaman termal tanaman untuk mendasari rekomendasi *cover crop* penurun suhu tanah di wilayah semi-arid (NTT, Madura, Gunungkidul).
10. **NASA GEDI (LiDAR):** Basis pengetahuan struktur kanopi vertikal dan biomassa untuk panduan integrasi pohon pelindung penahan angin (*agroforestri*).
11. **Riset Agronomi BRIN / Balittanah / Kementan:** Basis data RAG (\`agronomyKnowledgeBase.ts\`) dan parameter varietas unggul adaptif lokal (\`crops_library.json\`: Sorgum Bioguma, Kedelai Anjasmoro, Kacang Hijau Vima, Jagung Bisi-18, Padi Gogo Inpago, Orok-orok *Crotalaria juncea*, serta ameliorasi Dolomit tanah masam) pada asisten AI Field Advisor & mesin optimasi rotasi.
12. **FAO GAEZ v4 & FAO-56:** Standar batas toleransi agroklimat tanaman pangan, koefisien tanaman ($K_c$), dan validasi neraca air pada modul optimasi 4 musim.

### D. Standar Kalibrasi Pedologis

13. **USDA NRCS (Soil Taxonomy & SSURGO/STATSGO2):** Standar klasifikasi **Segitiga Tekstur Tanah USDA** (\`classifySoilTexture\`) dan hubungan empiris tekstur–retensi air yang mendasari fungsi pedotransfer kalkulasi *Available Water Capacity* ($AWC$) serta referensi profil tanah regional.

---

## Cakupan Geografis dan Strategi Dataset

TerraShaft menggunakan pendekatan **Global Core + Regional Context**.

### Global Core (Aktif di Seluruh Dunia)

Fondasi telemetri global yang bekerja untuk Indonesia maupun lokasi internasional:

\`\`\`text
NASA POWER (T2M, T2M_MAX, T2M_MIN, ALLSKY_SFC_SW_DWN)
NASA SMAP L4 (GWETROOT 0-100cm via NASA POWER)
NASA GPM / IMERG (PRECTOTCORR via NASA POWER)
ISRIC SoilGrids 250m v2.0 (Sand, Silt, Clay, SOC, pH, CEC 0-30cm)
OpenStreetMap Nominatim (Reverse & Forward Geocoding via /api/geocode)
\`\`\`

### Konteks Regional Indonesia

Dilengkapi dengan pustaka komoditas lokal, preset wilayah lahan kering Indonesia (Kupang Timur, Camplong, Sumba Timur, Gunungkidul, Indramayu, Lombok Timur), dan dokumen referensi agronomi BRIN/Balittanah/Kementan pada modul RAG Field Advisor.

### Konteks Referensi Internasional

Menyediakan preset pengujian lintas zona agroklimat global (seperti Central Valley USA, Machakos Kenya, dan Murray-Darling Australia) serta katalog referensi dataset mitra internasional (USDA, USGS, ESA, ECMWF, FAO) di halaman \`/data-sources\`.

---

## Alur Kerja Sistem

\`\`\`text
Input koordinat / pencarian wilayah / pilih preset di peta
              ↓
Validasi koordinat ketat (-90..90 lat, -180..180 lon tanpa silent clamping)
              ↓
Pengambilan data paralel via Proxy Route Handlers:
  • /api/nasa-climate (NASA POWER, SMAP GWETROOT, GPM PRECTOTCORR)
  • /api/soil-profile (ISRIC SoilGrids v2.0 0–30 cm)
              ↓
Quality control, masking nilai fill (-999), & fallback regional jika API hulu timeout
              ↓
Perhitungan ET0 harian (Hargreaves-Samani), ETc tanaman, AWC tanah, & Water Balance
              ↓
Evaluasi kombinatorial 6^4 = 1.296 skenario rotasi 4 periode
              ↓
Pemeringkatan 3 jalur utama:
  • Pathway A (Max Soil Regeneration)
  • Pathway B (Drought Resilience)
  • Pathway C (Cash-Flow Optimized)
              ↓
Penyusunan Algorithmic Audit Log, Provenance Badge, AI Field Advisor, & Action Sheet PNG
\`\`\`

---

## Fitur Utama

### 1. Peta GIS & Input Lokasi Dinamis (\`/field-map\` & Header)

- Pencarian lokasi melalui nama wilayah (\`/api/geocode\`).
- Input koordinat manual dan klik langsung pada peta interaktif Leaflet.
- Deteksi geolokasi perangkat pengguna.
- Preset wilayah lahan kering Indonesia dan lokasi referensi global.
- Validasi ketat latitude \`-90..90\` dan longitude \`-180..180\` (mengembalikan HTTP 400 tanpa *silent clamping*).

### 2. Multi-Source Satellite & Soil Telemetry (\`/overview\`)

Menggabungkan data kelembapan tanah zona perakaran, curah hujan bulanan, suhu, radiasi matahari, serta fisika-kimia tanah (tekstur USDA, SOC, pH, CEC, AWC) lengkap dengan metadata provenansi.

### 3. Soil Battery Index (\`/soil-battery\`)

Soil Battery adalah indeks komposit ($0–100\\%$) untuk memvisualisasikan simulasi dinamika kesehatan tanah dan neraca nitrogen alami ($\\Delta N$ dalam $\\text{kg N/ha}$), bukan pengganti uji laboratorium tanah:

- **Discharging:** Penanaman sereal rakus hara secara berturut-turut menurunkan kapasitas indeks baterai tanah.
- **Charging:** Penyisipan legum penambat nitrogen (Kedelai Anjasmoro, Kacang Hijau Vima) dan *cover crop* pemecah padas (Orok-orok *Crotalaria juncea*) memulihkan skor indeks baterai tanah.

### 4. Tiga Skenario Rotasi Optimal (\`/rotation-planner\`)

- **Pathway A — Soil Regeneration:** Memprioritaskan pemulihan indeks baterai tanah, fiksasi nitrogen biologis, dan biomassa penutup tanah.
- **Pathway B — Drought Resilience:** Memblokir tanaman boros air pada periode defisit air tinggi dan memprioritaskan komoditas tahan kering (seperti Sorgum Bioguma atau Kacang Hijau Vima).
- **Pathway C — Cash-Flow Optimized:** Memprioritaskan estimasi pendapatan bersih dengan tetap menjaga batas aman ketersediaan air tanah.

### 5. Water Balance Chart (\`/water-balance\`)

Grafik komparasi bulanan antara suplai curah hujan GPM (\`PRECTOTCORR\`), cadangan lengas perakaran SMAP (\`GWETROOT\`), dan kebutuhan evapotranspirasi tanaman ($ET_c = ET_0 \\times K_c$).

### 6. Algorithmic Audit Log

Setiap rekomendasi menampilkan alasan transparan mengapa suatu tanaman dipilih atau didiskualifikasi berdasarkan aturan ambang batas biofisik (misal defisit air $W_{deficit}$ atau penalti monokultur).

### 7. AI Field Advisor Berbasis RAG (\`/field-advisor\`)

Asisten agronomi interaktif (\`/api/ai/advisor\`) yang memadukan pencarian dokumen pengetahuan lokal (\`agronomyKnowledgeBase.ts\`) dengan data iklim dan tanah lokasi aktif. Dapat bekerja menggunakan kunci API Gemini milik pengguna (opsional melalui halaman \`/settings\`) maupun mesin analisis deterministik lokal penuh (*offline-capable fallback*) lengkap dengan sitasi ilmiah.

### 8. Ekspor Lembar Panduan WhatsApp (\`/action-sheet\`)

Mengekspor rekomendasi rotasi 4 musim menjadi poster gambar PNG beresolusi tinggi ($1080 \\times 1350\\text{ px}$) menggunakan \`html-to-image\`, lengkap denganMode Lapangan (*High-Contrast Outdoor Mode*) agar mudah dibaca di bawah terik matahari.

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

### 3. Kapasitas Menahan Air Tanah ($AWC$) & Tekstur USDA

Dihitung di \`src/lib/pedotransfer.ts\` untuk lapisan perakaran 0–30 cm berdasarkan fraksi tekstur ISRIC SoilGrids v2.0 dan persentase karbon organik ($SOC$):

\`\`\`text
AWC (mm / 30cm) = 0.15 × Sand% + 0.35 × Silt% + 0.40 × Clay% + 1.2 × SOC%
\`\`\`

### 4. Estimasi Ekonomi & Neraca Nitrogen

Perhitungan pendapatan bersih dan kontribusi nitrogen ($\\text{kg N/ha}$) pada \`src/lib/optimizationEngine.ts\` merupakan hasil simulasi model berbasis parameter pustaka komoditas (\`src/data/crops_library.json\`) dan harus disesuaikan dengan harga pasar serta kondisi lokal saat diterapkan di lapangan.

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
- \`REGIONAL_FALLBACK\` — Profil pedologi regional terkalibrasi ketika API ISRIC SoilGrids tidak merespons atau mengembalikan piksel perairan/perkotaan kosong.

\`fetchedAt\` mencatat waktu pengambilan data oleh server/cache dan dipisahkan secara tegas dari \`observationPeriod\` (periode observasi fisik sensor/lapisan kedalaman tanah).

---

## Arsitektur Teknologi

- **Frontend Framework:** Next.js 16 (App Router, React 19, TypeScript).
- **Styling:** Tailwind CSS v4 (Dark Telemetry Theme & High-Contrast Outdoor Mode).
- **Internationalization (i18n):** \`i18next\` untuk sinkronisasi dokumentasi multi-bahasa (\`README.md\` & \`README.en.md\`).
- **Peta Spasial:** Leaflet (\`react\` integration) dengan basemap satelit & dark vector.
- **Visualisasi Data:** Recharts (Dual-Axis Water Balance Chart & 5-Axis Pathway Radar Comparison).
- **State Management & Persistensi:** Zustand + \`idb-keyval\` + Service Worker PWA.
- **Ekspor Gambar:** \`html-to-image\` (render poster PNG $1080 \\times 1350\\text{ px}$ di sisi klien).
- **Backend API Route Handlers:**
  - \`/api/nasa-climate\` — Proxy NASA POWER Agroclimatology dengan *in-memory bounded cache* (TTL 24 jam) & fallback klimatologi regional.
  - \`/api/soil-profile\` — Proxy ISRIC SoilGrids v2.0 dengan agregasi tertimbang kedalaman 0–30 cm, *bounded cache* (TTL 30 hari), & fallback pedologi regional.
  - \`/api/geocode\` — Proxy pencarian nama lokasi & *reverse geocoding* OpenStreetMap Nominatim.
  - \`/api/ai/advisor\` — Endpoint RAG Field Advisor (mendukung integrasi Gemini API & mesin respons deterministik berbasis dokumen BRIN/Kementan/FAO).

---

## Keterbatasan

- Resolusi spasial NASA POWER (~50 km) dan SMAP L4 (~9–36 km) merepresentasikan kondisi skala grid regional, bukan sensor tanah *in-situ* pada petak mikro.
- ISRIC SoilGrids (resolusi 250 m) adalah prediksi *machine learning* global dan tidak menggantikan uji sampel tanah laboratorium lokal.
- Katalog dataset mitra (seperti SRTM, Sentinel-2, ECOSTRESS, GEDI, SSURGO) digunakan sebagai referensi spasial GIS, kalibrasi bio-model, dan basis pengetahuan RAG—sistem tidak melakukan pemrosesan citra spektral mentah secara langsung di browser.
- Estimasi kebutuhan air ($ET_c$), indeks Soil Battery, neraca nitrogen, dan keuntungan finansial adalah keluaran model simulasi yang wajib divalidasi bersama PPL atau agronom setempat.

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
- **NASA SMAP:** Soil Moisture Active Passive Level-4 Root-Zone Soil Moisture.
- **NASA GPM IMERG:** Integrated Multi-satellitE Retrievals for GPM.
- **ISRIC — World Soil Information:** SoilGrids 250m v2.0 (*Poggio et al., 2021*).
- **FAO Irrigation and Drainage Paper No. 56:** *Crop Evapotranspiration — Guidelines for Computing Crop Water Requirements* (*Allen et al., 1998*).
- **FAO GAEZ v4:** Global Agro-Ecological Zones data portal.
- **BRIN, Balittanah & Kementerian Pertanian RI:** Monograf dan petunjuk teknis varietas palawija/serealia lahan kering serta pengelolaan tanah masam.
- **USDA NRCS:** Soil Survey Manual & Soil Texture Triangle classification standard.

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
        "- [13 Integrated Datasets & Their Actual System Roles](#13-integrated-datasets--their-actual-system-roles)",
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
*Introduction to the TerraShaft geospatial intelligence platform bridging NASA Earth observations with dryland crop rotation planning.*

### 2. Executive Overview & Satellite Telemetry Dashboard (\`/overview\`)
![TerraShaft Overview Dashboard](./public/screenshots/02-overview-dashboard.png)
*Real-time telemetry summary for the active location (SMAP \`GWETROOT\` root-zone soil wetness, GPM \`PRECTOTCORR\` precipitation, ISRIC SoilGrids v2.0 texture fractions, Available Water Capacity $AWC$, and 3-pathway rotation comparison).*

### 3. Interactive GIS Field Explorer (\`/field-map\`)
![TerraShaft Interactive Field Explorer](./public/screenshots/03-gis-field-explorer.png)
*Leaflet-based spatial explorer featuring high-resolution satellite imagery, Indonesian dryland & global reference presets, location search, and plot boundary inspection.*

### 4. 4-Season Crop Rotation Planner & Radar Comparison (\`/rotation-planner\`)
![TerraShaft 4-Season Rotation Planner](./public/screenshots/04-rotation-planner.png)
*Combinatorial evaluation of $6^4 = 1,296$ rotation sequences across three optimization pathways (Pathway A: Soil Regeneration, Pathway B: Drought Resilience, Pathway C: Cash-Flow Optimized) with full Algorithmic Audit Logs.*

### 5. RAG-Powered AI Field Advisor (\`/field-advisor\`)
![TerraShaft AI Field Advisor](./public/screenshots/05-field-advisor-ai.png)
*Contextual agronomic assistant combining active field telemetry with curated scientific knowledge bases (BRIN, Balittanah, Ministry of Agriculture, FAO-56) and explicit citations.*

### 6. Data Provenance Transparency & Scientific Resource Catalog (\`/data-sources\`)
![TerraShaft Data Provenance & Scientific Catalog](./public/screenshots/06-data-provenance.png)
*Transparent API provenance tracking (\`source\`, \`fetchedAt\`, \`observationPeriod\`, cache/fallback state) alongside a structured catalog of 13 Earth observation datasets and their exact integration roles.*

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

1. **Land observation:** vegetation condition, land-cover context, root-zone soil moisture, and surface thermal context.
2. **Environmental conditions:** precipitation, temperature, solar radiation, reference evapotranspiration ($ET_0$), and site elevation.
3. **Soil and agricultural context:** soil texture fractions (sand, silt, clay), pH, soil organic carbon ($SOC$), cation exchange capacity ($CEC$), available water capacity ($AWC$), and local crop variety profiles.
4. **Decision optimization:** crop filtering based on water constraints, 4-period planting calendars, soil regeneration goals, and estimated net revenue.

The final output presents three ranked rotation pathways (Pathway A, B, and C) rather than a single rigid answer. Each scenario highlights benefits, risks, algorithmic audit logs, model assumptions, and data provenance.

---

## 13 Integrated Datasets & Their Actual System Roles

To uphold scientific rigor and avoid overclaiming, TerraShaft explicitly categorizes its 13 core datasets by their **actual implementation role in the codebase**:

### A. Live API & Core Telemetry (Fetched Directly via Backend Routes)

1. **NASA POWER:** Daily agroclimatology variables (min/max/mean temperature \`T2M_MIN\`, \`T2M_MAX\`, \`T2M\` and surface shortwave solar radiation \`ALLSKY_SFC_SW_DWN\`) fetched via live API (\`/api/nasa-climate\`) to compute daily reference evapotranspiration ($ET_0$ using the radiation-calibrated Hargreaves-Samani method aligned with FAO-56).
2. **NASA SMAP (Level-4):** Root-zone soil wetness estimates (\`GWETROOT\` 0–100 cm assimilated via the NASA POWER endpoint) driving the Soil Battery moisture reserve calculation and early drought warning threshold ($GWETROOT < 0.25$).
3. **ISRIC SoilGrids v2.0:** Soil texture fractions (\`sand\`, \`silt\`, \`clay\`), organic carbon (\`soc\`), \`phh2o\`, and \`cec\` across 0–5 cm, 5–15 cm, and 15–30 cm depth layers (depth-weighted to 0–30 cm) fetched via live REST API (\`/api/soil-profile\`) to compute Available Water Capacity ($AWC$).
4. **NASA GPM / IMERG:** Daily and monthly precipitation accumulation (via bias-corrected \`PRECTOTCORR\` in NASA POWER) used for water balance supply calculations and seasonal water-deficit detection.

### B. Spatial GIS References & Satellite Bio-Model Calibration

5. **NASA SRTM / Copernicus DEM:** Automated coordinate elevation lookup via \`/api/geocode\` (Open-Meteo Elevation API backed by SRTM/Copernicus DEM) alongside topographic context for erosion-control cover crop recommendations.
6. **Landsat & MODIS / VIIRS:** Surface reflectance and vegetation index (NDVI/EVI) reference frameworks used to calibrate crop growth stages, crop coefficients ($K_c$), and bare-fallow windows in the GIS Explorer.
7. **Copernicus Sentinel-2 (ESA):** High-resolution (10 m) optical reference accompanying satellite basemaps in the GIS Explorer for visual plot boundary (*Area of Interest* / AOI) delineation.
8. **GLDAS & ECMWF ERA5:** Land-surface assimilation and continuous atmospheric reanalysis frameworks underpinning multi-layer soil moisture and meteorological time-series continuity.

### C. Indonesian Dryland Enhancement (RAG Knowledge Base & Local Parameters)

9. **NASA ECOSTRESS (JPL):** Knowledge-base indicators for Land Surface Temperature (LST) and canopy thermal stress, supporting soil-cooling cover crop recommendations in semi-arid Indonesian regions (East Nusa Tenggara, Madura, Gunungkidul).
10. **NASA GEDI (LiDAR):** Canopy vertical structure and biomass reference knowledge for integrating windbreak shade trees (*agroforestry*).
11. **BRIN / Balittanah / Ministry of Agriculture Research:** Curated RAG knowledge base (\`agronomyKnowledgeBase.ts\`) and local adaptive cultivar parameters (\`crops_library.json\`: Bioguma Sorghum, Anjasmoro Soybean, Vima Mungbean, Bisi-18 Hybrid Maize, Inpago Upland Rice, *Crotalaria juncea* Sunn Hemp, and acid-soil Dolomite liming) powering the AI Field Advisor & rotation engine.
12. **FAO GAEZ v4 & FAO-56:** Agro-climatic crop suitability bounds, phenological crop coefficients ($K_c$), and water-balance validation rules in the 4-season optimization engine.

### D. Pedological Calibration Standards

13. **USDA NRCS (Soil Taxonomy & SSURGO/STATSGO2):** Empirical **USDA Soil Texture Triangle** classification rules (\`classifySoilTexture\`) and texture–water retention relationships underlying the pedotransfer calculation of Available Water Capacity ($AWC$) and regional soil reference profiles.

---

## Geographic Coverage and Dataset Strategy

TerraShaft implements a **Global Core + Regional Context** architecture.

### Global Core (Active Worldwide)

Primary live telemetry providers operating across Indonesia and global coordinates:

\`\`\`text
NASA POWER (T2M, T2M_MAX, T2M_MIN, ALLSKY_SFC_SW_DWN)
NASA SMAP L4 (GWETROOT 0-100cm via NASA POWER)
NASA GPM / IMERG (PRECTOTCORR via NASA POWER)
ISRIC SoilGrids 250m v2.0 (Sand, Silt, Clay, SOC, pH, CEC 0-30cm)
OpenStreetMap Nominatim (Reverse & Forward Geocoding via /api/geocode)
\`\`\`

### Indonesian Regional Context

Enriched with local seed variety profiles, dryland presets across Indonesia (East Kupang, Camplong, East Sumba, Gunungkidul, Indramayu, East Lombok), and curated BRIN/Balittanah/Kementan agronomic guidelines inside the RAG Field Advisor.

### International Reference Context

Includes cross-continental agro-climatic presets (Central Valley USA, Machakos Kenya, Murray-Darling Australia) and a transparent 13-dataset scientific resource catalog (NASA, ESA, ECMWF, ISRIC, USDA, FAO, BRIN/Kementan) at \`/data-sources\`.

---

## System Workflow

\`\`\`text
Coordinate input / place search / preset selection on map
              ↓
Strict coordinate validation (-90..90 lat, -180..180 lon without silent clamping)
              ↓
Parallel telemetry fetching via Next.js Route Handler proxies:
  • /api/nasa-climate (NASA POWER, SMAP GWETROOT, GPM PRECTOTCORR)
  • /api/soil-profile (ISRIC SoilGrids v2.0 0–30 cm)
              ↓
Quality control, fill-value masking (-999), & calibrated regional fallback on timeout
              ↓
Computing daily ET0 (Hargreaves-Samani), crop ETc, soil AWC, & Water Balance
              ↓
Combinatorial evaluation of 6^4 = 1,296 4-period rotation sequences
              ↓
Ranking 3 primary decision pathways:
  • Pathway A (Max Soil Regeneration)
  • Pathway B (Drought Resilience)
  • Pathway C (Cash-Flow Optimized)
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

### 2. Multi-Source Satellite & Soil Telemetry (\`/overview\`)

Integrates root-zone soil wetness, monthly precipitation, temperature, solar radiation, and topsoil physico-chemical properties (USDA texture class, SOC, pH, CEC, AWC) with full provenance metadata.

### 3. Soil Battery Index (\`/soil-battery\`)

The Soil Battery is a composite heuristic index ($0–100\\%$) designed to communicate simulated soil health dynamics and biological nitrogen balance ($\\Delta N$ in $\\text{kg N/ha}$), not a replacement for laboratory soil testing:

- **Discharging:** Consecutive nutrient-demanding cereal monocultures deplete the Soil Battery score.
- **Charging:** Incorporating nitrogen-fixing legumes (Anjasmoro Soybean, Vima Mungbean) and hardpan-penetrating cover crops (*Crotalaria juncea*) recharges the Soil Battery index.

### 4. Three Optimal Rotation Scenarios (\`/rotation-planner\`)

- **Pathway A — Soil Regeneration:** Maximizes Soil Battery recovery, biological nitrogen fixation, and organic biomass return.
- **Pathway B — Drought Resilience:** Disqualifies water-intensive crops during severe deficit windows and prioritizes drought-tolerant cultivars (e.g., Bioguma Sorghum, Vima Mungbean).
- **Pathway C — Cash-Flow Optimized:** Maximizes projected net farm revenue while enforcing root-zone water safety constraints.

### 5. Water Balance Chart (\`/water-balance\`)

Monthly dual-axis comparison between GPM precipitation supply (\`PRECTOTCORR\`), SMAP root-zone moisture wetness (\`GWETROOT\`), and crop evapotranspiration demand ($ET_c = ET_0 \\times K_c$).

### 6. Algorithmic Audit Log

Every recommendation transparently exposes why specific crops were selected or disqualified based on biophysical threshold rules (e.g., $W_{deficit}$ limits or monoculture pest penalties).

### 7. RAG-Powered AI Field Advisor (\`/field-advisor\`)

Interactive agronomic assistant (\`/api/ai/advisor\`) combining document retrieval from \`agronomyKnowledgeBase.ts\` with live field telemetry. Supports user-configured Gemini API keys (via \`/settings\`) as well as a built-in deterministic offline-capable advisory engine with explicit scientific citations.

### 8. WhatsApp Action Sheet Export (\`/action-sheet\`)

Renders the 4-season rotation plan into a high-resolution mobile-friendly PNG poster ($1080 \\times 1350\\text{ px}$) via \`html-to-image\`, paired with a **High-Contrast Outdoor Mode** for readability under direct sunlight.

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

Computed in \`src/lib/pedotransfer.ts\` for the 0–30 cm topsoil layer from ISRIC SoilGrids v2.0 particle-size fractions and Soil Organic Carbon ($SOC$):

\`\`\`text
AWC (mm / 30cm) = 0.15 × Sand% + 0.35 × Silt% + 0.40 × Clay% + 1.2 × SOC%
\`\`\`

### 4. Economic & Nitrogen Balance Estimates

Projected net revenue and biological nitrogen contributions ($\\text{kg N/ha}$) in \`src/lib/optimizationEngine.ts\` are model simulations parameterized by \`src/data/crops_library.json\` and should be calibrated with local market prices and field observations.

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
- **Internationalization (i18n):** \`i18next\` for synchronized bilingual documentation (\`README.md\` & \`README.en.md\`).
- **Spatial Mapping:** Leaflet with satellite imagery and dark vector basemaps.
- **Data Visualization:** Recharts (Dual-Axis Water Balance Chart & 5-Axis Pathway Radar Comparison).
- **State Management & Offline Persistence:** Zustand + \`idb-keyval\` + PWA Service Worker.
- **Image Export:** \`html-to-image\` (client-side $1080 \\times 1350\\text{ px}$ PNG poster rendering).
- **Backend API Route Handlers:**
  - \`/api/nasa-climate\` — NASA POWER Agroclimatology proxy with bounded in-memory caching (24h TTL) & regional climatology failover.
  - \`/api/soil-profile\` — ISRIC SoilGrids v2.0 proxy with 0–30 cm depth-weighted aggregation, bounded caching (30d TTL), & regional soil failover.
  - \`/api/geocode\` — OpenStreetMap Nominatim forward & reverse geocoding proxy.
  - \`/api/ai/advisor\` — RAG Field Advisor endpoint supporting both Gemini API keys and a deterministic local citation engine.

---

## Limitations

- Spatial resolutions of NASA POWER (~50 km) and SMAP L4 (~9–36 km) reflect regional grid conditions rather than sub-meter in-situ soil probes.
- ISRIC SoilGrids (250 m resolution) is a global machine-learning prediction and does not replace laboratory soil testing.
- Partner datasets in the resource catalog (SRTM, Sentinel-2, ECOSTRESS, GEDI, SSURGO) serve as GIS spatial context, bio-model calibration references, and RAG knowledge bases—the browser does not process raw spectral satellite bands directly.
- Crop water demand ($ET_c$), Soil Battery scores, nitrogen balances, and financial projections are simulation estimates that must be validated with local extension officers (PPL) or agronomists.

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
- **NASA SMAP:** Soil Moisture Active Passive Level-4 Root-Zone Soil Moisture.
- **NASA GPM IMERG:** Integrated Multi-satellitE Retrievals for GPM.
- **ISRIC — World Soil Information:** SoilGrids 250m v2.0 (*Poggio et al., 2021*).
- **FAO Irrigation and Drainage Paper No. 56:** *Crop Evapotranspiration — Guidelines for Computing Crop Water Requirements* (*Allen et al., 1998*).
- **FAO GAEZ v4:** Global Agro-Ecological Zones data portal.
- **BRIN, Balittanah & Ministry of Agriculture (Indonesia):** Technical monographs on dryland palawija/cereal cultivars and acid-soil amelioration.
- **USDA NRCS:** Soil Survey Manual & Soil Texture Triangle classification standard.

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
