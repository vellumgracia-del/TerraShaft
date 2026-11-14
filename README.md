TerraShaft (TerraRotate)

Adaptive Crop Rotation & Soil Regeneration Decision-Support Engine

TerraShaft adalah aplikasi web untuk membantu petani dan Penyuluh Pertanian Lapangan (PPL) menyusun skenario rotasi tanaman adaptif berdasarkan observasi satelit, data cuaca, kelembapan tanah, topografi, karakteristik tanah, dan konteks pertanian lokal.

Sistem mengubah data geospasial yang kompleks menjadi rekomendasi rotasi tanaman yang lebih mudah dipahami, dilengkapi estimasi kebutuhan air, indikator kesehatan tanah, risiko kekeringan, alternatif tanaman, serta alasan ilmiah di balik setiap rekomendasi.


Catatan penting: TerraShaft adalah sistem pendukung keputusan. Sistem tidak menggantikan pengukuran tanah langsung, penyuluh, agronom, atau keputusan petani. Nilai seperti kebutuhan air, kontribusi nitrogen, dan indeks Soil Battery merupakan estimasi model yang memiliki asumsi dan ketidakpastian.




Daftar Isi

•
Latar Belakang

•
Solusi

•
Cakupan Geografis dan Strategi Dataset

•
Dataset Global Core

•
Dataset Indonesia Profile

•
Dataset Regional Amerika Serikat

•
Alur Kerja Sistem

•
Fitur Utama

•
Metodologi dan Asumsi

•
Arsitektur Teknologi

•
Provenansi Data

•
Keterbatasan

•
Menjalankan Proyek

•
Sitasi dan Sumber Data

•
Tim




Latar Belakang

Pertanian di wilayah lahan kering dan sentra pangan tadah hujan menghadapi beberapa tantangan:

•
Perubahan pola hujan membuat kalender tanam historis semakin sulit dipakai tanpa penyesuaian.

•
Monokultur dapat meningkatkan pengambilan hara, tekanan penyakit, dan kerentanan terhadap stres air.

•
Kondisi permukaan tanah tidak selalu menggambarkan kelembapan yang tersedia di sekitar zona perakaran.

•
Data satelit, iklim, dan tanah tersedia dalam jumlah besar tetapi sulit diterjemahkan menjadi keputusan lapangan.

•
Rekomendasi agronomi perlu mempertimbangkan faktor teknis, ekonomi, ketersediaan air, dan kondisi lokal secara bersamaan.

TerraShaft dirancang untuk menjembatani observasi bumi dengan tindakan pertanian yang lebih mudah dipahami.




Solusi

TerraShaft menggabungkan empat lapisan analisis:

1.
Observasi lahan: kondisi vegetasi, perubahan tutupan lahan, kelembapan tanah, dan suhu permukaan.

2.
Kondisi lingkungan: hujan, temperatur, radiasi, evapotranspirasi, elevasi, dan kemiringan lahan.

3.
Kondisi tanah dan pertanian: tekstur, pH, karbon organik, kapasitas air, jenis tanaman, dan histori produksi.

4.
Optimasi keputusan: penyaringan tanaman berdasarkan batas air, kalender tanam, tujuan regenerasi tanah, dan potensi ekonomi.

Hasil akhirnya berupa beberapa skenario rotasi, bukan satu jawaban mutlak. Setiap skenario menunjukkan manfaat, risiko, confidence score, asumsi, dan sumber data yang digunakan.




Cakupan Geografis dan Strategi Dataset

TerraShaft menggunakan pendekatan Global Core + Regional Enhancement.

Global Core

Dataset global yang tersedia untuk Indonesia dan sebagian besar wilayah dunia digunakan sebagai fondasi utama:

Plain Text


Landsat
MODIS/VIIRS
SMAP
GPM/IMERG
NASA POWER
SRTM
SoilGrids
GLDAS
FAO GAEZ



Indonesia Profile

Untuk Indonesia, Global Core dilengkapi dengan dataset dan konteks regional yang tersedia:

Plain Text


Global Core
+ ECOSTRESS
+ GEDI untuk agroforestri atau vegetasi tinggi
+ data tanah nasional jika tersedia
+ data BPS/Kementerian Pertanian
+ data BMKG atau stasiun lokal jika tersedia
+ data harga komoditas lokal



United States Profile

Dataset USDA dan sumber regional Amerika Serikat hanya digunakan ketika lokasi berada di wilayah yang didukung:

Plain Text


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



Dengan strategi ini, TerraShaft tidak memaksakan dataset Amerika Serikat ke lokasi Indonesia atau negara lain.




Dataset Global Core

Landsat

Digunakan untuk memantau reflektansi permukaan, NDVI, EVI, kondisi vegetasi, tanah terbuka, perubahan musiman, dan histori lahan. Landsat berperan sebagai sumber observasi spasial dengan histori panjang.

MODIS/VIIRS

Digunakan sebagai pelengkap Landsat untuk pemantauan temporal yang lebih sering dan analisis wilayah yang lebih luas. MODIS/VIIRS membantu mendeteksi perubahan kehijauan, transisi musim, dan pola stres tanaman ketika citra resolusi tinggi tidak tersedia atau tertutup awan.

SMAP

Digunakan untuk indikator kelembapan tanah dan kekeringan. Produk root-zone soil moisture merupakan estimasi berbasis observasi satelit dan asimilasi/model, bukan pengukuran langsung di seluruh kedalaman tanah.

Nilai SMAP tidak boleh diperlakukan sebagai kebenaran absolut pada tingkat petak kecil. Sistem perlu memperhitungkan resolusi spasial, kualitas piksel, dan confidence score.

GPM/IMERG

Digunakan untuk estimasi curah hujan, akumulasi hujan, variasi antarperiode, dan deteksi hujan ekstrem. Data digunakan untuk menghitung input air, risiko limpasan, dan potensi defisit air.

Untuk analisis historis, sistem memprioritaskan produk yang telah dikalibrasi atau memiliki kualitas lebih tinggi. Untuk pemantauan cepat, sistem dapat menggunakan produk near-real-time dengan label latency yang jelas.

NASA POWER

Digunakan untuk data meteorologi dan radiasi seperti temperatur, kelembapan, angin, dan radiasi matahari. Data ini mendukung perhitungan ET0, kondisi musim tumbuh, risiko panas, dan kesesuaian iklim.

NASA POWER merupakan sumber data cuaca dan energi global. Variabel dan periode observasi yang digunakan harus dicatat pada metadata setiap respons API.

SRTM

Digunakan untuk elevasi, kemiringan, arah aliran air, posisi relatif pada lanskap, serta estimasi risiko limpasan dan erosi.

SoilGrids

SoilGrids menjadi sumber tanah global utama untuk lokasi di luar wilayah yang memiliki data tanah nasional atau regional yang lebih detail.

Properti yang dapat digunakan meliputi:

•
pasir, debu, dan liat;

•
pH;

•
karbon organik tanah;

•
bulk density;

•
kapasitas tukar kation;

•
nitrogen total;

•
coarse fragments;

•
estimasi properti tanah pada beberapa interval kedalaman.

SoilGrids memiliki resolusi sekitar 250 meter dan menyediakan ketidakpastian prediksi per piksel. Karena itu, data ini cocok untuk analisis regional dan screening awal, tetapi tidak selalu cukup untuk keputusan presisi pada petak kecil.

GLDAS

GLDAS digunakan sebagai deret waktu lingkungan global untuk melengkapi SMAP dan NASA POWER. Variabelnya dapat mencakup kelembapan tanah, evapotranspirasi, temperatur, radiasi, dan kondisi permukaan.

GLDAS membantu mengisi konteks temporal ketika satu sumber data memiliki gap, resolusi kasar, atau latency berbeda.

FAO GAEZ

FAO Global Agro-Ecological Zones digunakan untuk mengevaluasi kesesuaian agroklimat, keterbatasan tanah, ketersediaan air, dan potensi produktivitas berbagai tanaman.

GAEZ berfungsi sebagai lapisan validasi dan constraint agronomi. Data ini tidak digunakan sebagai jaminan hasil panen aktual.




Dataset Indonesia Profile

Untuk Indonesia, dataset berikut digunakan sebagai penguat apabila tersedia dan relevan untuk lokasi yang dipilih:

ECOSTRESS

Digunakan untuk mendeteksi suhu permukaan, hotspot panas, dan indikasi stres air pada skala yang lebih detail. ECOSTRESS sangat berguna untuk membandingkan microclimate antarbagian lahan, tetapi ketersediaan observasi dan tutupan awan harus diperiksa.

GEDI

Digunakan secara opsional untuk wilayah agroforestri, perkebunan, hutan tepi lahan, dan lanskap dengan vegetasi tinggi. GEDI membantu memberikan konteks struktur kanopi dan biomassa sekitar lahan.

GEDI bukan dataset utama untuk lahan terbuka dengan tanaman pendek.

Data tanah nasional dan regional

Jika tersedia, data tanah nasional atau hasil survei lokal diprioritaskan di atas SoilGrids karena biasanya lebih relevan terhadap kondisi setempat. Setiap sumber lokal harus menyimpan resolusi, tahun pemetaan, metode pengukuran, dan cakupan wilayahnya.

Statistik dan data pertanian Indonesia

Untuk konteks produksi dan ekonomi, sistem dapat mengintegrasikan:

•
BPS untuk statistik luas panen, produktivitas, dan produksi;

•
Kementerian Pertanian untuk komoditas, kalender tanam, dan informasi agronomi;

•
BMKG atau stasiun cuaca untuk validasi iklim lokal jika tersedia;

•
sumber harga lokal untuk estimasi pendapatan;

•
data varietas dari lembaga penelitian atau rekomendasi wilayah.

Dataset lokal tidak boleh dianggap selalu tersedia. Jika tidak tersedia, UI harus menampilkan bahwa sistem menggunakan sumber global atau estimasi regional.




Dataset Regional Amerika Serikat

Dataset berikut dipakai sebagai enhancement ketika lokasi berada di Amerika Serikat atau wilayah yang secara resmi didukung:

•
SSURGO/WSS: peta dan atribut tanah detail.

•
CDL/CropScape: klasifikasi jenis tanaman tahunan.

•
USDA NASS: statistik luas tanam, hasil panen, dan produksi.

•
PRISM: data iklim yang memperhitungkan pengaruh topografi.

•
NAIP: citra udara resolusi tinggi untuk validasi batas dan kondisi lahan.

•
NLCD: tutupan dan penggunaan lahan.

•
NLDAS: deret waktu cuaca dan variabel permukaan Amerika Utara.

•
USGS NWIS: data sungai, air tanah, debit, dan kualitas air.

•
OpenET: estimasi evapotranspirasi untuk wilayah yang didukung.

•
USDA AMS Market News: harga dan kondisi pasar komoditas Amerika Serikat.

SSURGO, WSS, CDL, dan USDA NASS tidak digunakan sebagai dataset global. Jika lokasi berada di luar cakupan, sistem menggunakan provider global atau regional lain dan mencatat fallback tersebut.




Alur Kerja Sistem

Plain Text


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






Fitur Utama

1. Peta dan Input Lokasi

•
Pencarian lokasi melalui nama wilayah.

•
Input koordinat manual.

•
Pemilihan lokasi melalui peta.

•
Deteksi lokasi perangkat jika diizinkan pengguna.

•
Preset wilayah Indonesia dan lokasi global.

•
Validasi latitude -90..90 dan longitude -180..180 tanpa silent clamping.

2. Multi-Source Telemetry

Sistem menggabungkan data kelembapan tanah, hujan, cuaca, radiasi, vegetasi, topografi, dan tanah. Setiap nilai memiliki sumber, satuan, waktu pengambilan, periode observasi, dan kualitas data.

3. Soil Battery Index

Soil Battery adalah indeks komposit untuk membantu komunikasi dan simulasi, bukan pengukuran langsung kesuburan tanah.

Komponen indikatifnya dapat mencakup:

•
kondisi karbon organik;

•
kontribusi bahan organik/residu;

•
pengambilan hara oleh tanaman;

•
kontribusi legum;

•
tekanan kekeringan;

•
potensi erosi;

•
kualitas dan keterbatasan tanah.

Skor harus ditampilkan bersama formula, asumsi, dan confidence score.

4. Tiga Skenario Rotasi

Pathway A — Soil Regeneration

Memprioritaskan peningkatan tutupan tanah, pengembalian residu, legum, dan pengurangan tekanan pada tanah.

Pathway B — Drought Resilience

Memprioritaskan tanaman dengan kebutuhan air lebih rendah, umur panen lebih sesuai, dan risiko lebih rendah pada periode defisit air.

Pathway C — Cash-Flow Optimized

Memprioritaskan potensi pendapatan setelah memperhitungkan biaya benih, pupuk, irigasi, tenaga kerja, transportasi, harga lokal, dan risiko gagal panen.

5. Rotasi Empat Periode Adaptif

Sistem menggunakan empat planning windows, bukan mengasumsikan bahwa semua wilayah memiliki empat musim yang sama.

Periode dapat ditentukan dari:

•
pola hujan lokal;

•
temperatur;

•
tanggal awal dan akhir musim tanam;

•
lintang dan belahan bumi;

•
sistem irigasi;

•
umur tanaman;

•
preferensi petani.

6. Water Balance Chart

Grafik membandingkan input air dan kebutuhan tanaman:

Plain Text


Water Balance = precipitation + irrigation - ETc - runoff - drainage



Nilai ETc dihitung dari ET0 dan koefisien tanaman atau parameter tanaman yang tersedia. Threshold defisit harus dikonfigurasi berdasarkan tanaman, tanah, dan tujuan analisis, bukan dianggap universal.

7. Algorithmic Audit Log

Setiap rekomendasi menampilkan:

•
alasan tanaman dipilih;

•
alasan tanaman ditolak;

•
data yang memicu keputusan;

•
nilai threshold;

•
asumsi yang digunakan;

•
sumber data;

•
timestamp;

•
confidence score.

8. Confidence Score

Confidence score mempertimbangkan:

•
kelengkapan data;

•
usia data;

•
resolusi spasial;

•
kualitas piksel;

•
kesesuaian provider dengan wilayah;

•
konsistensi antar-sumber;

•
ketersediaan data lokal;

•
ketidakpastian model.

9. Action Sheet

Hasil rekomendasi dapat diekspor sebagai lembar panduan yang mudah dibaca di ponsel dan dibagikan melalui WhatsApp. Action sheet harus menampilkan bahwa angka-angka tertentu merupakan estimasi model.

10. Field Advisor

Asisten agronomi dapat menggunakan RAG berbasis sumber yang dikurasi, seperti FAO, publikasi lembaga penelitian, dan dokumentasi resmi. Jawaban harus menyertakan sitasi, tanggal sumber, dan peringatan ketika bukti lokal tidak cukup.




Metodologi dan Asumsi

Estimasi evapotranspirasi

Sistem harus menyatakan metode yang dipakai, misalnya Hargreaves-Samani atau FAO-56 Penman-Monteith. Pemilihan metode bergantung pada ketersediaan temperatur, kelembapan, angin, dan radiasi.

Radiasi matahari saja tidak cukup untuk mengklaim ET0 yang presisi pada semua kondisi.

Estimasi kebutuhan tanaman

Plain Text


ETc = ET0 × Kc



Nilai Kc bergantung pada jenis tanaman dan fase pertumbuhan. Jika varietas atau fase pertumbuhan tidak diketahui, sistem harus menampilkan nilai sebagai estimasi berbasis default.

Soil Battery

Skor Soil Battery tidak boleh ditulis sebagai kg hara aktual tanpa model neraca hara dan data lapangan yang memadai. Angka perubahan musiman harus diberi label sebagai skor heuristik atau hasil simulasi.

Kontribusi nitrogen

Fiksasi nitrogen legum bergantung pada spesies, biomassa, bakteri simbion, pH, air, fosfor, dan apakah residu dikembalikan ke lahan. Nitrogen yang difiksasi tidak otomatis seluruhnya tersedia untuk tanaman berikutnya.

Profit

Plain Text


Estimated Profit =
expected yield × local price
− seed cost
− fertilizer cost
− pesticide cost
− labor cost
− irrigation cost
− transport cost
− risk penalty



Jika harga atau biaya lokal tidak tersedia, sistem harus menggunakan skenario harga dan menampilkan keterbatasan tersebut.




Provenansi Data

Setiap provider mengembalikan metadata minimal berikut:

JSON


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



Contoh nilai source:

Plain Text


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



fetchedAt adalah waktu pengambilan data dari jaringan atau cache. Field ini tidak boleh dianggap sebagai waktu observasi fisik.




Arsitektur Teknologi

•
Frontend: Next.js App Router, React, TypeScript.

•
Styling: Tailwind CSS.

•
Peta: Leaflet dengan basemap yang sesuai lisensi.

•
Visualisasi: Recharts atau library chart setara.

•
State management: Zustand.

•
Offline support: Web App Manifest dan Service Worker.

•
Ekspor gambar: html-to-image atau renderer server-side.

•
API layer: Next.js Route Handlers sebagai proxy provider.

•
Cache: in-memory atau persistent cache dengan TTL dan metadata stale time.

•
Validation: schema validation untuk koordinat, unit, missing values, dan response provider.

•
Security: API key hanya disimpan di server-side environment variable dan tidak dikirim langsung dari browser ke provider.

Contoh endpoint:

Plain Text


/api/location
/api/telemetry
/api/soil-profile
/api/vegetation
/api/water-balance
/api/rotation-scenarios
/api/provenance
/api/field-advisor






Keterbatasan

•
Data satelit memiliki resolusi spasial dan temporal yang berbeda.

•
SMAP dan sebagian data meteorologi tidak cocok dianggap sebagai pengukuran presisi untuk setiap petak kecil.

•
SoilGrids adalah prediksi global, bukan pengganti survei tanah lokal.

•
Data hujan satelit dapat memiliki bias dan sebaiknya divalidasi dengan stasiun atau data lokal jika tersedia.

•
Citra optik dapat terganggu awan, asap, dan bayangan.

•
Data tanaman global tidak selalu dapat membedakan jenis komoditas secara akurat.

•
SSURGO, CDL, dan USDA NASS hanya digunakan pada cakupan regional yang didukung.

•
Harga komoditas, biaya input, dan estimasi hasil dapat berubah cepat.

•
Indeks Soil Battery bukan pengukuran laboratorium kesuburan tanah.

•
Estimasi penghematan air dan kontribusi nitrogen adalah hasil model, bukan jaminan lapangan.

•
Rekomendasi perlu divalidasi oleh petani, PPL, dan agronom setempat sebelum diterapkan pada skala besar.




Menjalankan Proyek

Prasyarat

•
Node.js 20 atau lebih baru.

•
npm, pnpm, atau yarn.

•
API key provider yang diperlukan, jika digunakan.

Instalasi

Bash


git clone <repository-url>
cd terrashaft-app
npm install



Environment variables

Buat file .env.local dan isi hanya dengan provider yang digunakan:

Plain Text


NASA_POWER_BASE_URL=https://power.larc.nasa.gov/api/temporal
SOILGRIDS_BASE_URL=<soilgrids-endpoint>
GPM_BASE_URL=<gpm-endpoint>
LANDSAT_PROVIDER=<provider>
MAP_TILE_URL=<tile-url>



Jangan commit file .env.local atau API key ke repository.

Menjalankan test dan development server

Bash


npm test
npm run lint
npm run dev



Buka:

Plain Text


http://localhost:3000



Production build

Bash


npm run build
npm run start



Test yang disarankan

•
Validasi koordinat.

•
Unit conversion dan missing-value handling.

•
Provider fallback berdasarkan negara.

•
Perhitungan ET0 dan ETc.

•
Perhitungan water balance.

•
Ranking skenario rotasi.

•
Audit log dan provenance.

•
Respons ketika provider timeout atau tidak tersedia.

•
Tidak adanya API key pada bundle frontend.




Sitasi dan Sumber Data

•
NASA Earthdata untuk katalog data observasi bumi.

•
NASA Landsat untuk pengamatan permukaan dan vegetasi.

•
NASA SMAP untuk estimasi kelembapan tanah.

•
NASA GPM IMERG untuk estimasi presipitasi global.

•
NASA POWER untuk data solar dan meteorologi global.

•
NASA SRTM untuk elevasi dan topografi.

•
ISRIC SoilGrids untuk data tanah global.

•
NASA GLDAS untuk deret waktu kondisi permukaan global.

•
FAO GAEZ untuk kesesuaian agroekologi.

•
USDA NRCS SSURGO/WSS untuk data tanah Amerika Serikat.

•
USDA NASS CDL/CropScape untuk klasifikasi tanaman Amerika Serikat.

•
USDA NASS QuickStats untuk statistik pertanian Amerika Serikat.

•
BPS, Kementerian Pertanian, BMKG, dan sumber lokal terkait untuk data Indonesia jika tersedia.

•
FAO-56 untuk metodologi evapotranspirasi dan koefisien tanaman.




Tim

•
Zulfa Fahmiy Al Murtadlo (@varosaghasi) — Team Owner

•
Mohammad Arga (@rifaldhi)

•
Moch. Hafidz Zawawi (@zawacaprio)

•
Stiven Josh Peter Siburian (@stevenjoshburian)

•
Ravi Arnan Irianto (@raviarnan)




Lisensi

Tambahkan lisensi proyek dan atribusi masing-masing provider data sesuai ketentuan penggunaan sumber yang dipakai.

© 2026 TerraShaft Team — Built for resilient agriculture and space-to-field impact.

