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
        "- [Latar Belakang](#latar-belakang)",
        "- [Solusi](#solusi)",
        "- [Cakupan Geografis dan Strategi Dataset](#cakupan-geografis-dan-strategi-dataset)",
        "- [Dataset Global Core](#dataset-global-core)",
        "- [Dataset Indonesia Profile](#dataset-indonesia-profile)",
        "- [Dataset Regional Amerika Serikat](#dataset-regional-amerika-serikat)",
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
      sectionsBody: `## Latar Belakang

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

1. **Observasi lahan:** kondisi vegetasi, perubahan tutupan lahan, kelembapan tanah, dan suhu permukaan.
2. **Kondisi lingkungan:** hujan, temperatur, radiasi, evapotranspirasi, elevasi, dan kemiringan lahan.
3. **Kondisi tanah dan pertanian:** tekstur, pH, karbon organik, kapasitas air, jenis tanaman, dan histori produksi.
4. **Optimasi keputusan:** penyaringan tanaman berdasarkan batas air, kalender tanam, tujuan regenerasi tanah, dan potensi ekonomi.

Hasil akhirnya berupa beberapa skenario rotasi, bukan satu jawaban mutlak. Setiap skenario menunjukkan manfaat, risiko, confidence score, asumsi, dan sumber data yang digunakan.

---

## Cakupan Geografis dan Strategi Dataset

TerraShaft menggunakan pendekatan **Global Core + Regional Enhancement**.

### Global Core

Dataset global yang tersedia untuk Indonesia dan sebagian besar wilayah dunia digunakan sebagai fondasi utama:

\`\`\`text
Landsat
MODIS/VIIRS
SMAP
GPM/IMERG
NASA POWER
SRTM
SoilGrids
GLDAS
FAO GAEZ
\`\`\`

### Indonesia Profile

Untuk Indonesia, Global Core dilengkapi dengan dataset dan konteks regional yang tersedia:

\`\`\`text
Global Core
+ ECOSTRESS
+ GEDI untuk agroforestri atau vegetasi tinggi
+ data tanah nasional jika tersedia
+ data BPS/Kementerian Pertanian
+ data BMKG atau stasiun lokal jika tersedia
+ data harga komoditas lokal
\`\`\`

### United States Profile

Dataset USDA dan sumber regional Amerika Serikat hanya digunakan ketika lokasi berada di wilayah yang didukung:

\`\`\`text
Global Core
+ SSURGO/WSS
+ CDL/CropScape
+ USDA NASS
+ PRISM
+ NAIP
+ NLCD
+ NLDAS
+ USGS NWIS
+ OpenET
+ USDA AMS Market News
\`\`\`

Dengan strategi ini, TerraShaft tidak memaksakan dataset Amerika Serikat ke lokasi Indonesia atau negara lain.

---

## Dataset Global Core

### Landsat

Digunakan untuk memantau reflektansi permukaan, NDVI, EVI, kondisi vegetasi, tanah terbuka, perubahan musiman, dan histori lahan. Landsat berperan sebagai sumber observasi spasial dengan histori panjang.

### MODIS/VIIRS

Digunakan sebagai pelengkap Landsat untuk pemantauan temporal yang lebih sering dan analisis wilayah yang lebih luas. MODIS/VIIRS membantu mendeteksi perubahan kehijauan, transisi musim, dan pola stres tanaman ketika citra resolusi tinggi tidak tersedia atau tertutup awan.

### SMAP

Digunakan untuk indikator kelembapan tanah dan kekeringan. Produk root-zone soil moisture merupakan estimasi berbasis observasi satelit dan asimilasi/model, bukan pengukuran langsung di seluruh kedalaman tanah.

Nilai SMAP tidak boleh diperlakukan sebagai kebenaran absolut pada tingkat petak kecil. Sistem perlu memperhitungkan resolusi spasial, kualitas piksel, dan confidence score.

### GPM/IMERG

Digunakan untuk estimasi curah hujan, akumulasi hujan, variasi antarperiode, dan deteksi hujan ekstrem. Data digunakan untuk menghitung input air, risiko limpasan, dan potensi defisit air.

Untuk analisis historis, sistem memprioritaskan produk yang telah dikalibrasi atau memiliki kualitas lebih tinggi. Untuk pemantauan cepat, sistem dapat menggunakan produk near-real-time dengan label latency yang jelas.

### NASA POWER

Digunakan untuk data meteorologi dan radiasi seperti temperatur, kelembapan, angin, dan radiasi matahari. Data ini mendukung perhitungan ET0, kondisi musim tumbuh, risiko panas, dan kesesuaian iklim.

NASA POWER merupakan sumber data cuaca dan energi global. Variabel dan periode observasi yang digunakan harus dicatat pada metadata setiap respons API.

### SRTM

Digunakan untuk elevasi, kemiringan, arah aliran air, posisi relatif pada lanskap, serta estimasi risiko limpasan dan erosi.

### SoilGrids

SoilGrids menjadi sumber tanah global utama untuk lokasi di luar wilayah yang memiliki data tanah nasional atau regional yang lebih detail.

Properti yang dapat digunakan meliputi:

- pasir, debu, dan liat;
- pH;
- karbon organik tanah;
- bulk density;
- kapasitas tukar kation;
- nitrogen total;
- coarse fragments;
- estimasi properti tanah pada beberapa interval kedalaman.

SoilGrids memiliki resolusi sekitar 250 meter dan menyediakan ketidakpastian prediksi per piksel. Karena itu, data ini cocok untuk analisis regional dan screening awal, tetapi tidak selalu cukup untuk keputusan presisi pada petak kecil.

### GLDAS

GLDAS digunakan sebagai deret waktu lingkungan global untuk melengkapi SMAP dan NASA POWER. Variabelnya dapat mencakup kelembapan tanah, evapotranspirasi, temperatur, radiasi, dan kondisi permukaan.

GLDAS membantu mengisi konteks temporal ketika satu sumber data memiliki gap, resolusi kasar, atau latency berbeda.

### FAO GAEZ

FAO Global Agro-Ecological Zones digunakan untuk mengevaluasi kesesuaian agroklimat, keterbatasan tanah, ketersediaan air, dan potensi produktivitas berbagai tanaman.

GAEZ berfungsi sebagai lapisan validasi dan constraint agronomi. Data ini tidak digunakan sebagai jaminan hasil panen aktual.

---

## Dataset Indonesia Profile

Untuk Indonesia, dataset berikut digunakan sebagai penguat apabila tersedia dan relevan untuk lokasi yang dipilih:

### ECOSTRESS

Digunakan untuk mendeteksi suhu permukaan, hotspot panas, dan indikasi stres air pada skala yang lebih detail. ECOSTRESS sangat berguna untuk membandingkan microclimate antarbagian lahan, tetapi ketersediaan observasi dan tutupan awan harus diperiksa.

### GEDI

Digunakan secara opsional untuk wilayah agroforestri, perkebunan, hutan tepi lahan, dan lanskap dengan vegetasi tinggi. GEDI membantu memberikan konteks struktur kanopi dan biomassa sekitar lahan.

GEDI bukan dataset utama untuk lahan terbuka dengan tanaman pendek.

### Data tanah nasional dan regional

Jika tersedia, data tanah nasional atau hasil survei lokal diprioritaskan di atas SoilGrids karena biasanya lebih relevan terhadap kondisi setempat. Setiap sumber lokal harus menyimpan resolusi, tahun pemetaan, metode pengukuran, dan cakupan wilayahnya.

### Statistik dan data pertanian Indonesia

Untuk konteks produksi dan ekonomi, sistem dapat mengintegrasikan:

- BPS untuk statistik luas panen, produktivitas, dan produksi;
- Kementerian Pertanian untuk komoditas, kalender tanam, dan informasi agronomi;
- BMKG atau stasiun cuaca untuk validasi iklim lokal jika tersedia;
- sumber harga lokal untuk estimasi pendapatan;
- data varietas dari lembaga penelitian atau rekomendasi wilayah.

Dataset lokal tidak boleh dianggap selalu tersedia. Jika tidak tersedia, UI harus menampilkan bahwa sistem menggunakan sumber global atau estimasi regional.

---

## Dataset Regional Amerika Serikat

Dataset berikut dipakai sebagai enhancement ketika lokasi berada di Amerika Serikat atau wilayah yang secara resmi didukung:

- **SSURGO/WSS:** peta dan atribut tanah detail.
- **CDL/CropScape:** klasifikasi jenis tanaman tahunan.
- **USDA NASS:** statistik luas tanam, hasil panen, dan produksi.
- **PRISM:** data iklim yang memperhitungkan pengaruh topografi.
- **NAIP:** citra udara resolusi tinggi untuk validasi batas dan kondisi lahan.
- **NLCD:** tutupan dan penggunaan lahan.
- **NLDAS:** deret waktu cuaca dan variabel permukaan Amerika Utara.
- **USGS NWIS:** data sungai, air tanah, debit, dan kualitas air.
- **OpenET:** estimasi evapotranspirasi untuk wilayah yang didukung.
- **USDA AMS Market News:** harga dan kondisi pasar komoditas Amerika Serikat.

SSURGO, WSS, CDL, dan USDA NASS tidak digunakan sebagai dataset global. Jika lokasi berada di luar cakupan, sistem menggunakan provider global atau regional lain dan mencatat fallback tersebut.

---

## Alur Kerja Sistem

\`\`\`text
Input koordinat dan profil lahan
              ↓
Validasi lokasi dan resolusi data
              ↓
Pemilihan provider berdasarkan negara/wilayah
              ↓
Pengambilan data cuaca, tanah, vegetasi, air, dan topografi
              ↓
Quality control, normalisasi unit, dan masking nilai invalid
              ↓
Perhitungan ET0, ETc, water balance, dan indikator kekeringan
              ↓
Penyusunan Soil Battery Index dan indikator regenerasi
              ↓
Penyaringan tanaman berdasarkan constraint agronomi
              ↓
Evaluasi seluruh skenario rotasi yang valid
              ↓
Ranking Pathway A, B, dan C
              ↓
Audit log, confidence score, dan action sheet
              ↓
Feedback hasil aktual untuk evaluasi musim berikutnya
\`\`\`

---

## Fitur Utama

### 1. Peta dan Input Lokasi

- Pencarian lokasi melalui nama wilayah.
- Input koordinat manual.
- Pemilihan lokasi melalui peta.
- Deteksi lokasi perangkat jika diizinkan pengguna.
- Preset wilayah Indonesia dan lokasi global.
- Validasi latitude -90..90 dan longitude -180..180 tanpa silent clamping.

### 2. Multi-Source Telemetry

Sistem menggabungkan data kelembapan tanah, hujan, cuaca, radiasi, vegetasi, topografi, dan tanah. Setiap nilai memiliki sumber, satuan, waktu pengambilan, periode observasi, dan kualitas data.

### 3. Soil Battery Index

Soil Battery adalah indeks komposit untuk membantu komunikasi dan simulasi, bukan pengukuran langsung kesuburan tanah.

Komponen indikatifnya dapat mencakup:

- kondisi karbon organik;
- kontribusi bahan organik/residu;
- pengambilan hara oleh tanaman;
- kontribusi legum;
- tekanan kekeringan;
- potensi erosi;
- kualitas dan keterbatasan tanah.

Skor harus ditampilkan bersama formula, asumsi, dan confidence score.

### 4. Tiga Skenario Rotasi

#### Pathway A — Soil Regeneration

Memprioritaskan peningkatan tutupan tanah, pengembalian residu, legum, dan pengurangan tekanan pada tanah.

#### Pathway B — Drought Resilience

Memprioritaskan tanaman dengan kebutuhan air lebih rendah, umur panen lebih sesuai, dan risiko lebih rendah pada periode defisit air.

#### Pathway C — Cash-Flow Optimized

Memprioritaskan potensi pendapatan setelah memperhitungkan biaya benih, pupuk, irigasi, tenaga kerja, transportasi, harga lokal, dan risiko gagal panen.

### 5. Rotasi Empat Periode Adaptif

Sistem menggunakan empat planning windows, bukan mengasumsikan bahwa semua wilayah memiliki empat musim yang sama.

Periode dapat ditentukan dari:

- pola hujan lokal;
- temperatur;
- tanggal awal dan akhir musim tanam;
- lintang dan belahan bumi;
- sistem irigasi;
- umur tanaman;
- preferensi petani.

### 6. Water Balance Chart

Grafik membandingkan input air dan kebutuhan tanaman:

\`\`\`text
Water Balance = precipitation + irrigation - ETc - runoff - drainage
\`\`\`

Nilai ETc dihitung dari ET0 dan koefisien tanaman atau parameter tanaman yang tersedia. Threshold defisit harus dikonfigurasi berdasarkan tanaman, tanah, dan tujuan analisis, bukan dianggap universal.

### 7. Algorithmic Audit Log

Setiap rekomendasi menampilkan:

- alasan tanaman dipilih;
- alasan tanaman ditolak;
- data yang memicu keputusan;
- nilai threshold;
- asumsi yang digunakan;
- sumber data;
- timestamp;
- confidence score.

### 8. Confidence Score

Confidence score mempertimbangkan:

- kelengkapan data;
- usia data;
- resolusi spasial;
- kualitas piksel;
- kesesuaian provider dengan wilayah;
- konsistensi antar-sumber;
- ketersediaan data lokal;
- ketidakpastian model.

### 9. Action Sheet

Hasil rekomendasi dapat diekspor sebagai lembar panduan yang mudah dibaca di ponsel dan dibagikan melalui WhatsApp. Action sheet harus menampilkan bahwa angka-angka tertentu merupakan estimasi model.

### 10. Field Advisor

Asisten agronomi dapat menggunakan RAG berbasis sumber yang dikurasi, seperti FAO, publikasi lembaga penelitian, dan dokumentasi resmi. Jawaban harus menyertakan sitasi, tanggal sumber, dan peringatan ketika bukti lokal tidak cukup.

---

## Metodologi dan Asumsi

### Estimasi evapotranspirasi

Sistem harus menyatakan metode yang dipakai, misalnya Hargreaves-Samani atau FAO-56 Penman-Monteith. Pemilihan metode bergantung pada ketersediaan temperatur, kelembapan, angin, dan radiasi.

Radiasi matahari saja tidak cukup untuk mengklaim ET0 yang presisi pada semua kondisi.

### Estimasi kebutuhan tanaman

\`\`\`text
ETc = ET0 × Kc
\`\`\`

Nilai Kc bergantung pada jenis tanaman dan fase pertumbuhan. Jika varietas atau fase pertumbuhan tidak diketahui, sistem harus menampilkan nilai sebagai estimasi berbasis default.

### Soil Battery

Skor Soil Battery tidak boleh ditulis sebagai kg hara aktual tanpa model neraca hara dan data lapangan yang memadai. Angka perubahan musiman harus diberi label sebagai skor heuristik atau hasil simulasi.

### Kontribusi nitrogen

Fiksasi nitrogen legum bergantung pada spesies, biomassa, bakteri simbion, pH, air, fosfor, dan apakah residu dikembalikan ke lahan. Nitrogen yang difiksasi tidak otomatis seluruhnya tersedia untuk tanaman berikutnya.

### Profit

\`\`\`text
Estimated Profit =
expected yield × local price
− seed cost
− fertilizer cost
− pesticide cost
− labor cost
− irrigation cost
− transport cost
− risk penalty
\`\`\`

Jika harga atau biaya lokal tidak tersedia, sistem harus menggunakan skenario harga dan menampilkan keterbatasan tersebut.

---

## Provenansi Data

Setiap provider mengembalikan metadata minimal berikut:

\`\`\`json
{
  "source": "SOILGRIDS_GLOBAL",
  "provider": "ISRIC",
  "product": "SoilGrids 250m v2.0",
  "fetchedAt": "2026-11-14T00:00:00Z",
  "observationPeriod": "standard depth layer 0-30cm",
  "spatialResolution": "250m",
  "temporalResolution": "static soil map",
  "cached": false,
  "fallback": false,
  "fallbackReason": null,
  "uncertaintyAvailable": true
}
\`\`\`

Contoh nilai \`source\`:

\`\`\`text
LANDSAT_GLOBAL
MODIS_GLOBAL
SMAP_GLOBAL
GPM_IMERG_GLOBAL
NASA_POWER_GLOBAL
SRTM_GLOBAL
SOILGRIDS_GLOBAL
GLDAS_GLOBAL
FAO_GAEZ_GLOBAL
SSURGO_US
CDL_US
NASS_US
LOCAL_INDONESIA
REGIONAL_FALLBACK
\`\`\`

\`fetchedAt\` adalah waktu pengambilan data dari jaringan atau cache. Field ini tidak boleh dianggap sebagai waktu observasi fisik.

---

## Arsitektur Teknologi

- **Frontend:** Next.js App Router, React, TypeScript.
- **Styling:** Tailwind CSS.
- **Internationalization (i18n):** \`i18next\` untuk manajemen terjemahan multi-bahasa (Indonesia & Inggris).
- **Peta:** Leaflet dengan basemap yang sesuai lisensi.
- **Visualisasi:** Recharts atau library chart setara.
- **State management:** Zustand.
- **Offline support:** Web App Manifest dan Service Worker.
- **Ekspor gambar:** html-to-image atau renderer server-side.
- **API layer:** Next.js Route Handlers sebagai proxy provider.
- **Cache:** in-memory atau persistent cache dengan TTL dan metadata stale time.
- **Validation:** schema validation untuk koordinat, unit, missing values, dan response provider.
- **Security:** API key hanya disimpan di server-side environment variable dan tidak dikirim langsung dari browser ke provider.

Contoh endpoint:

\`\`\`text
/api/location
/api/telemetry
/api/soil-profile
/api/vegetation
/api/water-balance
/api/rotation-scenarios
/api/provenance
/api/field-advisor
\`\`\`

---

## Keterbatasan

- Data satelit memiliki resolusi spasial dan temporal yang berbeda.
- SMAP dan sebagian data meteorologi tidak cocok dianggap sebagai pengukuran presisi untuk setiap petak kecil.
- SoilGrids adalah prediksi global, bukan pengganti survei tanah lokal.
- Data hujan satelit dapat memiliki bias dan sebaiknya divalidasi dengan stasiun atau data lokal jika tersedia.
- Citra optik dapat terganggu awan, asap, dan bayangan.
- Data tanaman global tidak selalu dapat membedakan jenis komoditas secara akurat.
- SSURGO, CDL, dan USDA NASS hanya digunakan pada cakupan regional yang didukung.
- Harga komoditas, biaya input, dan estimasi hasil dapat berubah cepat.
- Indeks Soil Battery bukan pengukuran laboratorium kesuburan tanah.
- Estimasi penghematan air dan kontribusi nitrogen adalah hasil model, bukan jaminan lapangan.
- Rekomendasi perlu divalidasi oleh petani, PPL, dan agronom setempat sebelum diterapkan pada skala besar.

---

## Menjalankan Proyek

### Prasyarat

- Node.js 20 atau lebih baru.
- npm, pnpm, atau yarn.
- API key provider yang diperlukan, jika digunakan.

### Instalasi

\`\`\`bash
git clone <repository-url>
cd terrashaft-app
npm install
\`\`\`

### Environment variables

Buat file \`.env.local\` dan isi hanya dengan provider yang digunakan:

\`\`\`text
NASA_POWER_BASE_URL=https://power.larc.nasa.gov/api/temporal
SOILGRIDS_BASE_URL=<soilgrids-endpoint>
GPM_BASE_URL=<gpm-endpoint>
LANDSAT_PROVIDER=<provider>
MAP_TILE_URL=<tile-url>
\`\`\`

Jangan commit file \`.env.local\` atau API key ke repository.

### Menjalankan test dan development server

\`\`\`bash
npm test
npm run lint
npm run dev
\`\`\`

Buka:

\`\`\`text
http://localhost:3000
\`\`\`

### Generate dokumentasi multi-bahasa via \`i18next\`

\`\`\`bash
npm run i18n:readme
\`\`\`

### Production build

\`\`\`bash
npm run build
npm run start
\`\`\`

### Test yang disarankan

- Validasi koordinat.
- Unit conversion dan missing-value handling.
- Provider fallback berdasarkan negara.
- Perhitungan ET0 dan ETc.
- Perhitungan water balance.
- Ranking skenario rotasi.
- Audit log dan provenance.
- Respons ketika provider timeout atau tidak tersedia.
- Tidak adanya API key pada bundle frontend.

---

## Sitasi dan Sumber Data

- **NASA Earthdata** untuk katalog data observasi bumi.
- **NASA Landsat** untuk pengamatan permukaan dan vegetasi.
- **NASA SMAP** untuk estimasi kelembapan tanah.
- **NASA GPM IMERG** untuk estimasi presipitasi global.
- **NASA POWER** untuk data solar dan meteorologi global.
- **NASA SRTM** untuk elevasi dan topografi.
- **ISRIC SoilGrids** untuk data tanah global.
- **NASA GLDAS** untuk deret waktu kondisi permukaan global.
- **FAO GAEZ** untuk kesesuaian agroekologi.
- **USDA NRCS SSURGO/WSS** untuk data tanah Amerika Serikat.
- **USDA NASS CDL/CropScape** untuk klasifikasi tanaman Amerika Serikat.
- **USDA NASS QuickStats** untuk statistik pertanian Amerika Serikat.
- **BPS, Kementerian Pertanian, BMKG, dan sumber lokal terkait** untuk data Indonesia jika tersedia.
- **FAO-56** untuk metodologi evapotranspirasi dan koefisien tanaman.

---

## Tim

- **Zulfa Fahmiy Al Murtadlo** ([@varosaghasi](https://github.com/varosaghasi)) — Team Owner
- **Mohammad Arga** ([@rifaldhi](https://github.com/rifaldhi))
- **Moch. Hafidz Zawawi** ([@zawacaprio](https://github.com/zawacaprio))
- **Stiven Josh Peter Siburian** ([@stevenjoshburian](https://github.com/stevenjoshburian))
- **Ravi Arnan Irianto** ([@raviarnan](https://github.com/raviarnan))

---

## Lisensi

Tambahkan lisensi proyek dan atribusi masing-masing provider data sesuai ketentuan penggunaan sumber yang dipakai.

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
        "- [Background](#background)",
        "- [Solution](#solution)",
        "- [Geographic Coverage and Dataset Strategy](#geographic-coverage-and-dataset-strategy)",
        "- [Global Core Datasets](#global-core-datasets)",
        "- [Indonesia Profile Datasets](#indonesia-profile-datasets)",
        "- [United States Regional Datasets](#united-states-regional-datasets)",
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
      sectionsBody: `## Background

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

1. **Land observation:** vegetation condition, land-cover change, soil moisture, and land surface temperature.
2. **Environmental conditions:** precipitation, temperature, solar radiation, evapotranspiration, elevation, and slope.
3. **Soil and agricultural context:** texture, pH, soil organic carbon, water-holding capacity, crop types, and production history.
4. **Decision optimization:** crop filtering based on water constraints, planting calendars, soil regeneration goals, and economic potential.

The final output presents multiple rotation scenarios rather than a single rigid answer. Each scenario highlights benefits, risks, confidence scores, assumptions, and the data sources used.

---

## Geographic Coverage and Dataset Strategy

TerraShaft uses a **Global Core + Regional Enhancement** approach.

### Global Core

Global datasets available for Indonesia and most regions worldwide serve as the primary foundation:

\`\`\`text
Landsat
MODIS/VIIRS
SMAP
GPM/IMERG
NASA POWER
SRTM
SoilGrids
GLDAS
FAO GAEZ
\`\`\`

### Indonesia Profile

For Indonesia, the Global Core is enriched with available regional datasets and local context:

\`\`\`text
Global Core
+ ECOSTRESS
+ GEDI for agroforestry or tall vegetation
+ National soil data where available
+ BPS / Ministry of Agriculture statistics
+ BMKG or local weather stations where available
+ Local commodity price data
\`\`\`

### United States Profile

USDA datasets and United States regional sources are used only when the target location falls within supported coverage areas:

\`\`\`text
Global Core
+ SSURGO/WSS
+ CDL/CropScape
+ USDA NASS
+ PRISM
+ NAIP
+ NLCD
+ NLDAS
+ USGS NWIS
+ OpenET
+ USDA AMS Market News
\`\`\`

With this strategy, TerraShaft never forces United States-only datasets onto locations in Indonesia or other countries.

---

## Global Core Datasets

### Landsat

Used to monitor surface reflectance, NDVI, EVI, vegetation condition, bare soil, seasonal changes, and field history. Landsat serves as a long-term spatial observation record.

### MODIS/VIIRS

Used to complement Landsat for higher-frequency temporal monitoring and broader regional analysis. MODIS/VIIRS helps detect greenness changes, seasonal transitions, and crop stress patterns when high-resolution optical imagery is unavailable or cloud-covered.

### SMAP

Used for soil moisture and drought indicators. Root-zone soil moisture products are estimates derived from satellite observations and land-surface assimilation/modeling rather than direct physical measurements across all soil depths.

SMAP values must not be treated as absolute ground truth at the small-parcel scale. The system accounts for spatial resolution, pixel quality flags, and confidence scores.

### GPM/IMERG

Used for precipitation estimates, rainfall accumulation, inter-period variability, and extreme rainfall detection. The data supports water input calculations, runoff risk, and potential water deficit analysis.

For historical analysis, the system prioritizes calibrated, higher-quality research products. For rapid monitoring, near-real-time products may be used with explicit latency labels.

### NASA POWER

Used for meteorological and solar radiation variables such as temperature, humidity, wind speed, and solar irradiance. These variables support ET0 calculation, growing season assessment, heat stress risk, and climate suitability.

NASA POWER is a global weather and solar energy data resource. The specific variables and observation periods used must be recorded in the metadata of every API response.

### SRTM

Used for elevation, slope, flow direction, relative landscape position, and runoff/erosion risk estimation.

### SoilGrids

SoilGrids serves as the primary global soil data source for locations outside regions with more detailed national or local soil surveys.

Properties utilized include:

- sand, silt, and clay fractions;
- soil pH;
- soil organic carbon (SOC);
- bulk density;
- cation exchange capacity (CEC);
- total nitrogen;
- coarse fragments;
- estimated soil properties across multiple standard depth intervals.

SoilGrids has a spatial resolution of approximately 250 meters and provides per-pixel prediction uncertainty. Consequently, it is well suited for regional analysis and initial screening, though not always sufficient for precision decisions at the small-plot level.

### GLDAS

GLDAS is used as a global environmental time-series dataset to complement SMAP and NASA POWER. Variables include soil moisture, evapotranspiration, temperature, radiation, and land-surface conditions.

GLDAS helps fill temporal context when a single source has data gaps, coarser resolution, or differing latency.

### FAO GAEZ

FAO Global Agro-Ecological Zones (GAEZ) is used to evaluate agro-climatic suitability, edaphic constraints, water availability, and potential productivity across diverse crops.

GAEZ acts as an agronomic validation and constraint layer. It is not used as a guarantee of actual harvest yield.

---

## Indonesia Profile Datasets

For Indonesia, the following datasets are used as regional enhancements whenever available and relevant to the selected location:

### ECOSTRESS

Used to detect land surface temperature, thermal hotspots, and finer-scale water stress indicators. ECOSTRESS is valuable for comparing microclimates across field sectors, though observation availability and cloud cover must be checked.

### GEDI

Used optionally for agroforestry zones, plantations, forest-edge farmlands, and landscapes with tall vegetation. GEDI provides context on canopy structure and surrounding biomass.

GEDI is not a primary dataset for open croplands with short-stature annual crops.

### National and regional soil data

Where available, national soil maps or local survey data are prioritized over SoilGrids because they better reflect local pedological conditions. Every local source must record its spatial resolution, mapping year, measurement method, and geographic coverage.

### Indonesian agricultural statistics and local data

For production and economic context, the system can integrate:

- **BPS (Statistics Indonesia)** for harvested area, productivity, and production statistics;
- **Ministry of Agriculture (Kementerian Pertanian)** for commodity profiles, planting calendars, and agronomic guidelines;
- **BMKG** or local weather stations for local climate validation where available;
- **Local price sources** for revenue estimation;
- **Seed variety data** from research institutes or regional extension recommendations.

Local datasets must never be assumed to be universally available. When unavailable, the UI clearly indicates that the system is falling back to global sources or regional estimates.

---

## United States Regional Datasets

The following datasets are used as regional enhancements when a location is within the United States or officially supported territories:

- **SSURGO/WSS:** detailed soil maps and soil survey attributes.
- **CDL/CropScape:** annual crop type classification.
- **USDA NASS:** planted acreage, yield, and production statistics.
- **PRISM:** climate datasets accounting for topographic/orographic effects.
- **NAIP:** high-resolution aerial imagery for field boundary and condition validation.
- **NLCD:** land cover and land use classification.
- **NLDAS:** North American weather time series and land-surface variables.
- **USGS NWIS:** surface water, groundwater, streamflow, and water quality data.
- **OpenET:** satellite-based evapotranspiration estimates for supported regions.
- **USDA AMS Market News:** United States commodity prices and market conditions.

SSURGO, WSS, CDL, and USDA NASS are never used as global datasets. When a location lies outside their coverage, the system routes to global or appropriate regional providers and logs the fallback.

---

## System Workflow

\`\`\`text
Coordinate & field profile input
              ↓
Location validation & data resolution check
              ↓
Provider selection based on country/region
              ↓
Fetching weather, soil, vegetation, water & topography data
              ↓
Quality control, unit normalization & invalid-value masking
              ↓
Computing ET0, ETc, water balance & drought indicators
              ↓
Building Soil Battery Index & regeneration indicators
              ↓
Filtering crops by agronomic constraints
              ↓
Evaluating all valid crop rotation scenarios
              ↓
Ranking Pathway A, B, and C
              ↓
Audit log, confidence score & exportable action sheet
              ↓
Actual harvest feedback for next-season evaluation
\`\`\`

---

## Key Features

### 1. Map and Location Input

- Location search by region or place name.
- Manual coordinate entry.
- Interactive map pin selection.
- Device geolocation detection when permitted by the user.
- Presets for Indonesian dryland regions and global reference sites.
- Strict validation for latitude (\`-90..90\`) and longitude (\`-180..180\`) without silent clamping.

### 2. Multi-Source Telemetry

The system combines soil moisture, precipitation, weather, solar radiation, vegetation, topography, and soil properties. Every metric carries its source, unit, fetch timestamp, physical observation period, and data quality indicator.

### 3. Soil Battery Index

The Soil Battery is a composite index designed to aid communication and scenario simulation rather than a direct physical measurement of soil fertility.

Indicative components may include:

- soil organic carbon condition;
- organic matter and crop residue contribution;
- crop nutrient uptake demand;
- legume biological nitrogen contribution;
- drought stress pressure;
- erosion potential;
- soil quality and edaphic limitations.

Scores are always displayed alongside their underlying formula, assumptions, and confidence score.

### 4. Three Rotation Scenarios

#### Pathway A — Soil Regeneration

Prioritizes ground cover improvement, biomass/residue return, legume integration, and reduced soil extraction pressure.

#### Pathway B — Drought Resilience

Prioritizes crops with lower water demand, matching growth duration, and lower failure risk during water-deficit windows.

#### Pathway C — Cash-Flow Optimized

Prioritizes net revenue potential after accounting for seed, fertilizer, irrigation, labor, transport costs, local prices, and crop failure risk.

### 5. Adaptive Four-Period Rotation

The system uses four adaptive planning windows rather than assuming every region experiences four temperate seasons.

Planning windows can be derived from:

- local rainfall distribution;
- temperature regimes;
- growing season start and end dates;
- latitude and hemisphere;
- irrigation availability;
- crop maturity duration;
- farmer preferences.

### 6. Water Balance Chart

Compares water supply against crop water demand:

\`\`\`text
Water Balance = precipitation + irrigation - ETc - runoff - drainage
\`\`\`

\`ETc\` is calculated from \`ET0\` and crop coefficients (\`Kc\`) or available crop parameters. Deficit thresholds are configured according to crop type, soil properties, and analysis goals rather than treated as universal constants.

### 7. Algorithmic Audit Log

Every recommendation transparently exposes:

- why a crop was selected;
- why candidate crops were rejected/disqualified;
- the telemetry values that triggered the decision;
- threshold values applied;
- underlying model assumptions;
- data sources used;
- evaluation timestamp;
- confidence score.

### 8. Confidence Score

The confidence score accounts for:

- data completeness;
- data recency/age;
- spatial resolution;
- pixel quality flags;
- provider suitability for the target region;
- cross-source consistency;
- local data availability;
- model uncertainty.

### 9. Action Sheet

Recommendations can be exported as a mobile-friendly visual guide ready to share via WhatsApp. The Action Sheet explicitly notes that projected figures represent model estimates.

### 10. Field Advisor

The agronomic assistant can leverage Retrieval-Augmented Generation (RAG) grounded in curated sources such as FAO guidelines, research institute publications, and official extension documentation. Responses include citations, source dates, and caveats when local evidence is insufficient.

---

## Methodology and Assumptions

### Evapotranspiration estimation

The system explicitly states the evapotranspiration method used, such as Hargreaves-Samani or FAO-56 Penman-Monteith. Method selection depends on the availability of temperature, relative humidity, wind speed, and solar radiation data.

Solar radiation alone is insufficient to claim high-precision \`ET0\` across all climatic regimes.

### Crop water requirement estimation

\`\`\`text
ETc = ET0 × Kc
\`\`\`

\`Kc\` depends on crop type and phenological growth stage. When specific cultivar or growth stage details are unknown, the system labels values as default-based estimates.

### Soil Battery

Soil Battery scores must not be presented as exact kilograms of plant-available nutrients without a full nutrient mass-balance model and field calibration data. Seasonal delta values are labeled as heuristic scores or simulation outputs.

### Nitrogen contribution

Legume nitrogen fixation depends on species, biomass accumulation, rhizobial symbiosis, soil pH, moisture availability, phosphorus status, and whether crop residues are incorporated back into the field. Fixed nitrogen is not automatically 100% available to the immediately following crop.

### Profit estimation

\`\`\`text
Estimated Profit =
expected yield × local price
− seed cost
− fertilizer cost
− pesticide cost
− labor cost
− irrigation cost
− transport cost
− risk penalty
\`\`\`

When local commodity prices or input costs are unavailable, the system applies reference price scenarios and clearly surfaces those limitations.

---

## Data Provenance

Every data provider returns at minimum the following provenance metadata contract:

\`\`\`json
{
  "source": "SOILGRIDS_GLOBAL",
  "provider": "ISRIC",
  "product": "SoilGrids 250m v2.0",
  "fetchedAt": "2026-11-14T00:00:00Z",
  "observationPeriod": "standard depth layer 0-30cm",
  "spatialResolution": "250m",
  "temporalResolution": "static soil map",
  "cached": false,
  "fallback": false,
  "fallbackReason": null,
  "uncertaintyAvailable": true
}
\`\`\`

Example \`source\` identifiers:

\`\`\`text
LANDSAT_GLOBAL
MODIS_GLOBAL
SMAP_GLOBAL
GPM_IMERG_GLOBAL
NASA_POWER_GLOBAL
SRTM_GLOBAL
SOILGRIDS_GLOBAL
GLDAS_GLOBAL
FAO_GAEZ_GLOBAL
SSURGO_US
CDL_US
NASS_US
LOCAL_INDONESIA
REGIONAL_FALLBACK
\`\`\`

\`fetchedAt\` records when the payload was retrieved from the network or cache. It must never be conflated with the physical satellite/sensor observation period.

---

## Technology Architecture

- **Frontend:** Next.js App Router, React, TypeScript.
- **Styling:** Tailwind CSS.
- **Internationalization (i18n):** \`i18next\` for multi-language translation management (Indonesian & English).
- **Mapping:** Leaflet with license-compliant basemaps.
- **Visualization:** Recharts or equivalent charting library.
- **State management:** Zustand.
- **Offline support:** Web App Manifest and Service Worker.
- **Image export:** \`html-to-image\` or server-side renderer.
- **API layer:** Next.js Route Handlers acting as provider proxies.
- **Cache:** In-memory or persistent cache with TTL and stale-time metadata.
- **Validation:** Schema validation for coordinates, units, missing values, and provider responses.
- **Security:** API keys are stored exclusively in server-side environment variables and never exposed to the browser bundle.

Example endpoints:

\`\`\`text
/api/location
/api/telemetry
/api/soil-profile
/api/vegetation
/api/water-balance
/api/rotation-scenarios
/api/provenance
/api/field-advisor
\`\`\`

---

## Limitations

- Satellite datasets vary in spatial and temporal resolution.
- SMAP and coarse-gridded meteorological data should not be treated as precision in-situ measurements for individual small plots.
- SoilGrids is a global machine-learning prediction, not a replacement for local soil sampling and laboratory testing.
- Satellite precipitation estimates can exhibit regional bias and should be validated against local rain gauges where available.
- Optical imagery can be affected by cloud cover, smoke/haze, and terrain shadows.
- Global cropland maps cannot always distinguish specific local cultivars or intercropping systems accurately.
- SSURGO, CDL, and USDA NASS are restricted strictly to supported United States coverage areas.
- Commodity prices, input costs, and yield expectations can fluctuate rapidly.
- The Soil Battery Index is not a laboratory soil fertility test.
- Water savings and nitrogen fixation numbers are model estimates, not field guarantees.
- Recommendations should be validated by farmers, extension officers (PPL), and local agronomists before large-scale adoption.

---

## Running the Project

### Prerequisites

- Node.js 20 or newer.
- npm, pnpm, or yarn.
- Required provider API keys, if applicable.

### Installation

\`\`\`bash
git clone <repository-url>
cd terrashaft-app
npm install
\`\`\`

### Environment variables

Create a \`.env.local\` file and configure only the providers used:

\`\`\`text
NASA_POWER_BASE_URL=https://power.larc.nasa.gov/api/temporal
SOILGRIDS_BASE_URL=<soilgrids-endpoint>
GPM_BASE_URL=<gpm-endpoint>
LANDSAT_PROVIDER=<provider>
MAP_TILE_URL=<tile-url>
\`\`\`

Never commit \`.env.local\` or secret API keys to the repository.

### Running tests and development server

\`\`\`bash
npm test
npm run lint
npm run dev
\`\`\`

Open:

\`\`\`text
http://localhost:3000
\`\`\`

### Generating localized README files via \`i18next\`

\`\`\`bash
npm run i18n:readme
\`\`\`

### Production build

\`\`\`bash
npm run build
npm run start
\`\`\`

### Recommended test coverage

- Coordinate bounds validation.
- Unit conversion and missing-value masking.
- Country/region-based provider fallback routing.
- \`ET0\` and \`ETc\` calculations.
- Water balance computation.
- Crop rotation scenario ranking.
- Algorithmic audit log and provenance contract verification.
- Graceful degradation when upstream providers time out or are unavailable.
- Verification that no secret API keys leak into the client bundle.

---

## Citations and Data Sources

- **NASA Earthdata** for Earth observation data catalogs.
- **NASA Landsat** for land surface and vegetation monitoring.
- **NASA SMAP** for soil moisture estimation.
- **NASA GPM IMERG** for global precipitation estimation.
- **NASA POWER** for global solar and meteorological data.
- **NASA SRTM** for digital elevation and topography.
- **ISRIC SoilGrids** for global soil property predictions.
- **NASA GLDAS** for global land-surface time series.
- **FAO GAEZ** for agro-ecological suitability assessment.
- **USDA NRCS SSURGO/WSS** for United States soil survey data.
- **USDA NASS CDL/CropScape** for United States crop classification.
- **USDA NASS QuickStats** for United States agricultural statistics.
- **BPS, Ministry of Agriculture, BMKG, and related local sources** for Indonesian agricultural and climate context where available.
- **FAO-56** for evapotranspiration and crop coefficient methodology.

---

## Team

- **Zulfa Fahmiy Al Murtadlo** ([@varosaghasi](https://github.com/varosaghasi)) — Team Owner
- **Mohammad Arga** ([@rifaldhi](https://github.com/rifaldhi))
- **Moch. Hafidz Zawawi** ([@zawacaprio](https://github.com/zawacaprio))
- **Stiven Josh Peter Siburian** ([@stevenjoshburian](https://github.com/stevenjoshburian))
- **Ravi Arnan Irianto** ([@raviarnan](https://github.com/raviarnan))

---

## License

Add the project license and data provider attributions in accordance with the terms of use of each data source utilized.

© 2026 TerraShaft Team — Built for resilient agriculture and space-to-field impact.`,
    },
  },
} as const;
