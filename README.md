# TerraShaft (TerraRotate) 
### Adaptive Crop Rotation & Closed-Loop Soil Regeneration Telemetry Engine

> **Aplikasi web pintar yang menerjemahkan observasi biofisik satelit NASA (SMAP, GPM, CERES, MERRA-2) dan profil tanah spasial (ISRIC SoilGrids) menjadi rekomendasi pola rotasi tanaman 4 musim adaptif guna mencegah gagal panen akibat kekeringan, memulihkan kesuburan tanah, dan menjaga kestabilan ekonomi petani.**

---

## 1. Latar Belakang & Permasalahan Lapangan

Pertanian di Indonesia—khususnya di kawasan lahan kering dan sentra pangan tadah hujan (seperti Nusa Tenggara, Gunungkidul, Madura, hingga pesisir utara Jawa)—menghadapi permasalahan sistemik:

1. **Jadwal Tanam Berbasis "Tebak-tebakan"**  
   Perubahan iklim global (seperti anomali El Niño dan pergeseran musim) membuat kalender tanam tradisional (*pranata mangsa*) tidak lagi akurat. Petani sering menanam tanaman di waktu yang salah, sehingga tanaman mati kekeringan sebelum panen.

2. **Tanah 'Lelah', Tandus, dan Mengeras Akibat Monokultur**  
   Menanam komoditas yang sama secara berulang-ulang tanpa jeda (misalnya jagung terus atau padi terus) menguras habis hara tanah. Hal ini memaksa petani membeli pupuk kimia sintetis dalam dosis yang makin mahal, sementara struktur tanah kian rusak dan memadat menyerupai lapisan padas.

3. **Petani Tidak Mengetahui Cadangan Air di Dalam Tanah**  
   Tanah bagian permukaan sering kali tampak basah setelah hujan gerimis sesaat, padahal di zona perakaran (*root-zone* kedalaman 0–100 cm), tanah mengalami defisit air kritis. Tanpa alat ukur, petani memaksakan menanam komoditas rakus air yang berujung pada puso (gagal panen).

4. **Kesenjangan Informasi Antara Teknologi Antariksa dan Petani**  
   Badan antariksa dunia (NASA) memantau bumi setiap detik, namun data satelit tersebut berbentuk format angka ilmiah yang sangat rumit dan berukuran raksasa sehingga tidak dapat diakses secara langsung oleh petani kecil maupun Penyuluh Pertanian Lapangan (PPL).

---

## 2. Solusi yang Dihadirkan TerraShaft

TerraShaft hadir menjembatani teknologi antariksa NASA langsung ke layar ponsel petani dan penyuluh dengan pendekatan yang sangat mudah dipahami.

### Konsep Kunci: "Baterai Tanah" (*The Soil Battery*)
TerraShaft memperkenalkan cara pandang baru yang intuitif: **Anggaplah tanah Anda seperti baterai ponsel!**
* **Menguras Baterai (*Discharging*):** Menanam padi atau jagung secara monokultur berturut-turut akan **menguras baterai tanah ($-20\%$ per musim)** karena tanaman tersebut rakus unsur hara.
* **Mengisi Ulang Baterai (*Charging*):** Menyelingi musim tanam dengan tanaman kacang-kacangan (kedelai, kacang hijau) atau tanaman penutup tanah (*cover crop* seperti orok-orok) akan **mengisi ulang baterai tanah ($+15\%$ per musim)**. Bintil akar tanaman ini menangkap nitrogen gratis dari udara, sedangkan akarnya yang dalam memecah lapisan tanah padas dan mengembalikan kesuburan tanah secara alami.

Sistem komputasi TerraShaft secara otomatis mengevaluasi **$6^4 = 1.296$ kemungkinan rotasi** untuk menemukan kombinasi 4 musim terbaik yang menyeimbangkan **keuntungan uang petani**, **ketersediaan air tanah**, dan **kesehatan baterai tanah**.

---

## 3. Fitur-Fitur Utama Aplikasi

```
[ Peta Satelit Lahan ] ──► [ Deteksi Biofisik Satelit NASA ] ──► [ Rekomendasi 4 Musim Siap WhatsApp ]
```

### ① Peta Digital Lahan & Deteksi Lokasi Spasial
* Cukup geser pin lokasi di peta atau pilih tombol preset wilayah lahan kering (seperti **Kupang Timur**, **Gunungkidul**, **Sumba Timur**, **Indramayu**, atau **Lombok Timur**).
* Sistem langsung mendeteksi koordinat GPS, ketinggian lahan (*elevation*), dan memuat data satelit terkait dalam hitungan detik.

### ② Pantauan Telemetri Satelit NASA & Tanah *Real-Time*
Tanpa perlu memasang sensor fisik mahal di sawah, TerraShaft langsung terhubung dengan asimilasi satelit NASA POWER dan ISRIC SoilGrids v2.0:
* **NASA SMAP (`GWETROOT`):** Memantau kelembapan air tanah zona perakaran (skala 0.00 – 1.00) lengkap dengan garis takik merah batas kritis di angka $0.25$.
* **NASA GPM (`PRECTOTCORR`):** Mengukur laju curah hujan harian (mm/hari) dan akumulasi presipitasi musiman.
* **NASA CERES (`ALLSKY_SFC_SW_DWN`):** Mengukur intensitas radiasi matahari untuk menghitung laju penguapan air tanah ($ET_0$).
* **ISRIC SoilGrids:** Menghitung Kapasitas Menahan Air Tanah ($AWC$), kadar Karbon Organik ($SOC\%$), pH, dan kelas tekstur segitiga USDA.

### ③ Indikator Baterai Tanah (*The Soil Battery Gauge*)
* Tabung visual status kapasitas kesuburan tanah ($0–100\%$).
* Menampilkan status secara langsung apakah pola rotasi sedang *Charging* (terisi hara) atau *Discharging* (terkuras).
* Menghitung pasokan **Neraca Nitrogen Alami ($\Delta N$, $\text{kg N/ha}$)** dan estimasi penghematan air dibanding monokultur.

### ④ Tiga Jalur Skenario Rotasi Optimal (Pathway A, B, C)
1. **Pathway A (Max Soil Regeneration):**  
   *Pilihan terbaik untuk memulihkan tanah tandus.* Wajib menyisipkan tanaman penutup berakar dalam dan legum penambat N tinggi untuk menambah pupuk alami dan memperbaiki struktur tanah.
2. **Pathway B (Drought Resilience):**  
   *Pilihan siaga menghadapi kemarau panjang atau El Niño.* Memblokir seluruh tanaman boros air pada musim kemarau puncak dan hanya mengizinkan komoditas tahan kering (seperti sorgum atau kacang hijau).
3. **Pathway C (Cash-Flow Optimized):**  
   *Pilihan untuk memaksimalkan keuntungan tunai hasil panen*, namun tetap dibatasi batas aman ketersediaan air tanah agar tidak terjadi gagal panen.

### ⑤ Matriks Kalender 4 Musim Lengkap dengan Varietas Benih
Membagi siklus budidaya ke dalam 4 musim berkesinambungan:
* **Musim 1 (Nov–Feb / Rendeng):** Musim hujan utama (misal: Jagung Hibrida varietas Bisi-18).
* **Musim 2 (Mar–Mei / Gadu 1):** Pancaroba (misal: Kedelai varietas Anjasmoro untuk injeksi nitrogen tanah).
* **Musim 3 (Jun–Agu / Kemarau Awal):** Awal kemarau (misal: Kacang Hijau Vima atau Sorgum Bioguma).
* **Musim 4 (Sep–Okt / Puncak Kemarau):** Masa paling kering (misal: Orok-orok Crotalaria untuk biomasa penutup tanah).
* Setiap musim dilengkapi rincian kebutuhan air, status defisit, efek baterai hara, dan anjuran varietas bibit unggul lokal.

### ⑥ Grafik Dual-Axis Neraca Air (*Water Balance Chart*)
* Grafik komparasi antara **Curah Hujan Harian GPM** (batang biru) dan **Kebutuhan Air Tanaman $ET_c$** (garis amber).
* Area defisit air ($W_{deficit} > 100\text{ mm}$) otomatis diarsir merah sebagai peringatan dini bahaya kekeringan.

### ⑦ Kotak Transparansi Alasan Ilmiah (*Algorithmic Audit Log*)
* Standar penilaian dewan juri NASA: Sistem menjelaskan secara terbuka mengapa suatu tanaman **dipilih** atau **didiskualifikasi**.
* *Contoh:* Jagung Hibrida didiskualifikasi pada Puncak Kemarau karena terpicu aturan:  
  `Rule: Wdeficit = 142mm (> 100mm) & SMAP GWETROOT = 0.18 (< 0.25). Risiko gagal panen tinggi.`

### ⑧ Mode Lapangan Tahan Silau Matahari (*High-Contrast Outdoor Mode*)
* Penyuluh pertanian sering mengoperasikan ponsel di tengah sawah di bawah terik matahari yang menyilaukan.
* Cukup klik tombol **"Mode Lapangan"**, tampilan seketika berganti menjadi *Technical Monochrome High-Contrast* (latar putih murni, teks hitam tajam, border tegas) sehingga data tetap terbaca sangat jelas.

### ⑨ Ekspor Lembar Panduan WhatsApp (*Action Sheet* 1080×1350 px)
* Hasil rekomendasi dapat diubah menjadi **selembar poster gambar resolusi tinggi (rasio 4:5)** yang pas di layar ponsel dan status WhatsApp.
* Dilengkapi tombol instan **"Unduh Gambar PNG"** dan **"Kirim ke WhatsApp"** untuk memudahkan penyebaran ke grup petani.

### ⑩ Pustaka Komoditas & Tambah Varietas Lokal
* Memuat basis data tanaman bawaan lengkap dengan durasi tanam, kebutuhan air, dan nilai pasar.
* Petani atau PPL dapat menambahkan varietas lokal baru yang langsung diikutsertakan ke dalam mesin optimasi 1.296 kombinasi.

---

## 4. Manfaat Nyata bagi Petani & Lingkungan

| Parameter | Sebelum Menggunakan TerraShaft | Sesudah Menggunakan TerraShaft |
|---|---|---|
| **Pencegahan Gagal Panen** | Mengandalkan tebakan kalender biasa; rawan puso saat kemarau mendadak. | Terpandu data riil kelembapan air tanah zona perakaran satelit NASA SMAP. |
| **Biaya Pupuk Kimia** | Terus membengkak setiap musim karena tanah semakin tandus. | Hemat pupuk berkat pasokan fiksasi nitrogen alami hingga **$+160\text{ kg N/ha}$**. |
| **Kesehatan Tanah** | Tanah mengeras seperti batu akibat monokultur sereal berulang. | Baterai tanah terisi kembali; karbon organik tanah ($SOC$) meningkat berkala. |
| **Konsumsi Air Pertanian** | Boros air di musim kering untuk tanaman yang tidak sesuai. | Penghematan air terukur hingga **$40\% - 60\%$** dibanding monokultur. |
| **Kecepatan Tindakan PPL** | Perlu waktu berhari-hari untuk menyusun kalkulasi pola tanam. | Lembar panduan WhatsApp 4 musim selesai dihitung dalam **1 detik**. |

---

## 5. Arsitektur Teknologi

* **Frontend Framework:** Next.js 16 (App Router, React 19, TypeScript).
* **Styling & Design System:** Tailwind CSS v4 (NASA-Grade 60-30-10 Telemetry Theme, Dark Mode & High-Contrast Outdoor Mode).
* **Mesin Peta:** Leaflet.js dengan basemap CartoDB Dark Matter & Esri Satellite World Imagery.
* **Visualisasi Data:** Recharts (Dual-Axis ComposedChart & 5-Axis Spider Radar Chart).
* **State Management & Offline:** Zustand + Web App Manifest + Service Worker PWA.
* **Mesin Ekspor Gambar:** `html-to-image` (Client-side Canvas rendering 1080×1350 px).
* **Data Plumbing Layer & Provenansi Ilmiah:** Next.js Route Handlers sebagai proxy API terintegrasi dengan pelacakan metadata ketat:
  - `/api/nasa-climate` (NASA POWER Agroclimatology: SMAP L4, GPM IMERG, CERES, MERRA-2).
  - `/api/soil-profile` (ISRIC SoilGrids v2.0 REST API).
  - **Kontrak Provenansi Data (`source`, `fetchedAt`, `cached`, `fallbackReason`, `observationPeriod`):**
    - `source`: Menandai asal data (`NASA_POWER_LIVE`, `ISRIC_SOILGRIDS_LIVE`, `FALLBACK_CLIMATOLOGY`, `REGIONAL_FALLBACK`).
    - `fetchedAt`: Waktu stempel pengambilan jaringan / cache lokal (bukan periode observasi fisik).
    - `observationPeriod`: Menandai rentang waktu observasi fisik sensor/satelit (misal: "Historical 1-Year Baseline" atau "Standard Depth Layer 0-30cm").
    - `cached`: Menandai data berasal dari in-memory cache TTL (UI menampilkan badge "CACHED DATA").
    - `fallbackReason`: Penjelasan ilmiah transparan saat failover regional aktif akibat kendala jaringan/timeout.
  - **Validasi Koordinat Tanpa Silent Clamping:**
    - Parameter koordinat `lat` dan `lon` wajib diisi. Input di luar batas (-90°..90° latitude, -180°..180° longitude) ditolak dengan HTTP 400 Bad Request dan pesan kesalahan terkontrol, mencegah pergeseran lokasi diam-diam (*silent clamping*).

---

## 6. Panduan Menjalankan Proyek (Getting Started)

### Prasyarat
* Node.js v20+ atau v24+
* npm atau yarn / pnpm

### Langkah Instalasi
```bash
# 1. Masuk ke direktori proyek
cd terrashaft-app

# 2. Pasang dependensi
npm install

# 3. Jalankan pengujian unit test dan integrasi proxy (1.296 permutasi + 12 kriteria API)
npm test

# 4. Jalankan linting kode
npm run lint

# 5. Jalankan server pengembangan lokal
npm run dev
```

Buka peramban Anda di [http://localhost:3000](http://localhost:3000).

### Membangun Versi Produksi
```bash
npm run build
npm run start
```

---

## 7. Sitasi & Sumber Data Ilmiah

* **NASA POWER Agroclimatology Community**: Data harian cuaca, radiasi matahari harian permukaan bumi (CERES), dan asimilasi atmosfer (GMAO MERRA-2).
* **NASA SMAP (Soil Moisture Active Passive)**: Asimilasi Level-4 *Root-Zone Soil Wetness* (`GWETROOT`, 0–100 cm).
* **NASA GPM (Global Precipitation Measurement)**: Algoritma presipitasi global IMERG (`PRECTOTCORR`).
* **ISRIC World Soil Information**: SoilGrids 250m v2.0 (Tekstur pasir/debu/liat, C-Organik, pH, KTK).
* **FAO Irrigation and Drainage Paper No. 56**: Metodologi Hargreaves-Samani ($ET_0$) dan Koefisien Tanaman ($K_c$).

---
*© 2026 TerraShaft Team — Built for Resilient Agriculture & Space-to-Field Impact.*
