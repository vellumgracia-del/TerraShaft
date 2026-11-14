export interface KnowledgeDocument {
  id: string;
  title: string;
  institution: string;
  year: number;
  category: 'crop' | 'soil' | 'water' | 'pest';
  tags: string[];
  summary: string;
  recommendations: string[];
  citation: string;
}

export const AGRONOMY_KNOWLEDGE_BASE: KnowledgeDocument[] = [
  {
    id: 'brin-kedelai-anjasmoro',
    title: 'Petunjuk Teknis Budidaya Kedelai Varietas Anjasmoro di Lahan Kering',
    institution: 'Balitkabi - Badan Riset dan Inovasi Nasional (BRIN)',
    year: 2022,
    category: 'crop',
    tags: ['kedelai', 'anjasmoro', 'legum', 'nitrogen', 'lahan kering', 'palawija'],
    summary: 'Kedelai varietas Anjasmoro memiliki adaptasi luas di lahan kering iklim kering dengan potensi hasil 2.0-2.5 ton/ha. Bintil akar aktif mampu menambat nitrogen bebas 60-80 kg N/ha jika diinokulasi Rhizobium.',
    recommendations: [
      'Gunakan jarak tanam 40 cm x 15 cm (2 biji per lubang) untuk kerapatan populasi optimal.',
      'Aplikasikan inokulan bakteri Bradyrhizobium japonicum (Legin) pada benih sebelum tanam untuk memaksimalkan bintil akar.',
      'Pupuk dasar: 50 kg Urea/ha, 75 kg SP-36/ha, dan 50 kg KCl/ha saat tanam.',
      'Hindari genangan air saat fase kecambah (0-10 HST) dan fase pengisian polong (45-65 HST).'
    ],
    citation: 'Balitkabi BRIN (2022). Petunjuk Teknis Budidaya Kedelai Unggul di Lahan Sub-Optimal.'
  },
  {
    id: 'brin-sorgum-bioguma',
    title: 'Budidaya Sorgum Manis & Biji Varietas Bioguma untuk Mitigasi Kekeringan Ekstrem',
    institution: 'Balitserealia - BRIN & Kementerian Pertanian',
    year: 2023,
    category: 'crop',
    tags: ['sorgum', 'bioguma', 'kekeringan', 'el nino', 'akar dalam', 'kemarau'],
    summary: 'Sorgum Bioguma 1, 2, dan 3 sangat toleran terhadap kekeringan (butuh air hanya 300-350 mm) dengan sistem perakaran serabut lebat hingga kedalaman 100-120 cm. Cocok ditanam pada puncak kemarau ketika tanaman sereal lain gagal panen.',
    recommendations: [
      'Tanam saat curah hujan mulai turun di bawah 100 mm/bulan sebagai tanaman penutup musim kemarau.',
      'Jarak tanam anjuran 70 cm x 20 cm dengan kebutuhan benih 8-10 kg/ha.',
      'Biomassa batang dan daun setelah panen jangan dibakar, melainkan dicacah sebagai mulsa organik untuk menutup retakan tanah lempung.',
      'Mampu diratun (panen kedua) hingga 1-2 kali dengan pemupukan N susulan 50 kg/ha.'
    ],
    citation: 'Balitserealia BRIN (2023). Akselerasi Pengembangan Sorgum di Wilayah Semi-Arid Indonesia.'
  },
  {
    id: 'brin-kacang-hijau-vima',
    title: 'Standar Budidaya Kacang Hijau Genjah Varietas Vima 1-5 Pasca Tanaman Utama',
    institution: 'Balitkabi - Kementerian Pertanian',
    year: 2021,
    category: 'crop',
    tags: ['kacang hijau', 'vima', 'genjah', 'gadu', 'hemat air', 'pemutus hama'],
    summary: 'Kacang hijau varietas Vima memiliki umur sangat genjah (panen 56-60 hari) dan toleran kekeringan sedang. Sangat efektif ditanam pada musim peralihan (Gadu 2) untuk memanfaatkan sisa kelembapan tanah sebelum puncak kemarau.',
    recommendations: [
      'Gunakan sistem Tanpa Olah Tanah (TOT) pada lahan bekas padi/jagung untuk menghemat biaya dan menjaga kelembapan kapiler tanah.',
      'Semprot insektisida nabati atau perangkap kuning pada umur 15-25 HST untuk mengendalikan hama lalat bibit (Agromyza phaseoli).',
      'Panen serempak dapat dilakukan saat 85% polong berwarna coklat-hitam kering.'
    ],
    citation: 'Balitkabi Kementan (2021). Monograf Varietas Unggul Kacang Hijau Vima.'
  },
  {
    id: 'brin-jagung-bisi',
    title: 'Pengelolaan Air dan Hara Jagung Hibrida di Sentra Lahan Kering Tadah Hujan',
    institution: 'Puslitbangtan - Badan Litbang Pertanian',
    year: 2022,
    category: 'crop',
    tags: ['jagung', 'bisi 18', 'cereal', 'hibrida', 'rendeng', 'hujan utama'],
    summary: 'Jagung hibrida merupakan tanaman pengeruk hara tinggi (butuh 120 kg N/ha, 450 mm air). Wajib ditanam pada periode puncak musim hujan (Rendeng) dan wajib diselingi tanaman legum di musim berikutnya untuk memulihkan cadangan hara.',
    recommendations: [
      'Waktu tanam ideal: saat curah hujan dasarian konsisten >50 mm dan kelembapan SMAP GWETROOT > 0.40.',
      'Pemupukan berimbang: Urea 300 kg/ha (diberikan 3 tahap: 7 HST, 28 HST, 45 HST), Phonska NPK 200 kg/ha.',
      'Fase kritis air adalah masa berbunga (tasseling/silking, umur 45-60 HST). Defisit air di fase ini memicu tongkol ompong atau gagal biji.'
    ],
    citation: 'Puslitbangtan (2022). Panduan Teknis Budidaya Jagung Berkelanjutan di Lahan Kering.'
  },
  {
    id: 'balitpa-padi-gogo-inpago',
    title: 'Teknologi Budidaya Padi Gogo Inpago untuk Antisipasi Musim Hujan Pendek',
    institution: 'Balai Besar Penelitian Tanaman Padi (BBPadi) / BRIN',
    year: 2021,
    category: 'crop',
    tags: ['padi gogo', 'inpago', 'lahan kering', 'aerobik'],
    summary: 'Varietas Inpago (Inbrida Padi Gogo) dirancang toleran kekeringan pada fase vegetatif dan tahan terhadap keracunan aluminium pada tanah masam. Membutuhkan drainase yang baik tanpa genangan padas.',
    recommendations: [
      'Tanam dengan sistem larikan gogo (legowo 2:1 atau 4:1) untuk memperlancar aerasi dan pencahayaan kanopi.',
      'Kebutuhan benih 30-40 kg/ha dengan kedalaman lubang tanam 3-4 cm.',
      'Hindari penanaman di tanah dengan pH < 4.5 tanpa perlakuan pengapuran awal.'
    ],
    citation: 'BBPadi Kementan (2021). Petunjuk Praktis Budidaya Padi Gogo Toleran Cekaman Biotik & Abiotik.'
  },
  {
    id: 'kementan-orok-orok-crotalaria',
    title: 'Pemanfaatan Crotalaria juncea (Orok-orok) untuk Pemecah Lapisan Padas & Bio-Fertilizer',
    institution: 'Balai Pengkajian Teknologi Pertanian (BPTP)',
    year: 2023,
    category: 'soil',
    tags: ['orok-orok', 'crotalaria', 'cover crop', 'padas', 'hardpan', 'biomasa', 'recharge'],
    summary: 'Crotalaria juncea memiliki akar tunggang tegak yang mampu menembus lapisan tanah keras (hardpan/padas olah) hingga kedalaman lebih dari 1.5 meter, membentuk biopori alami dan mendaur ulang hara dari lapisan tanah dalam.',
    recommendations: [
      'Tanam rapat (tebar benih 20-25 kg/ha) pada akhir musim hujan atau awal kemarau.',
      'Tebas dan benamkan biomasa ke dalam tanah pada umur 45-50 hari (saat mulai berbunga) sebelum batang mengayu keras.',
      'Menyumbang 150-200 kg N/ha biomassa segar, setara dengan penghematan 300 kg pupuk urea per hektar pada musim berikutnya.',
      'Sangat efektif menekan nematoda bengkak akar dan memutus siklus gulma berdaun sempit.'
    ],
    citation: 'BPTP Balitbangtan (2023). Konservasi Tanah dan Air Berbasis Cover Crop Leguminosa.'
  },
  {
    id: 'balittanah-ameliorasi-ph-masam',
    title: 'Pedoman Pengapuran (Dolomit) dan Perbaikan Reaksi Tanah Masam di Lahan Kering',
    institution: 'Balai Penelitian Tanah (Balittanah)',
    year: 2022,
    category: 'soil',
    tags: ['ph', 'masam', 'dolomit', 'kapur', 'kalsium', 'magnesium', 'ktk'],
    summary: 'Tanah dengan pH H2O di bawah 5.5 mengalami fiksasi fosfat (P) oleh aluminium dan besi, sehingga pupuk P tidak dapat diserap tanaman. Pengapuran menggunakan dolomit CaMg(CO3)2 menaikkan pH sekaligus menyuplai hara esensial Ca dan Mg.',
    recommendations: [
      'Untuk menaikkan 1.0 unit pH pada tanah lempung masam, dibutuhkan 1.5 - 2.0 ton dolomit/ha.',
      'Aplikasikan dolomit 2-3 minggu sebelum tanam bersamaan dengan pengolahan tanah awal agar kapur bereaksi sempurna dengan kelembapan tanah.',
      'Kombinasikan dengan pupuk kandang/kompos matang (2-3 ton/ha) untuk meningkatkan Kapasitas Tukar Kation (KTK).'
    ],
    citation: 'Balittanah (2022). Standar Operasional Ameliorasi dan Pengelolaan Kesuburan Tanah Masam.'
  },
  {
    id: 'balittanah-manajemen-vertisol',
    title: 'Tata Kelola Tanah Vertisol (Lempung Mengembang) di Kawasan Iklim Semi-Arid',
    institution: 'Balai Penelitian Tanah (Balittanah)',
    year: 2021,
    category: 'soil',
    tags: ['vertisol', 'lempung', 'clay', 'retak', 'swelling', 'kupang', 'timor', 'padas'],
    summary: 'Tanah Vertisol memiliki fraksi lempung tipe montmorillonit >40% yang sangat lengket dan plastis saat basah, namun merekah/retak lebar saat kering. Retakan ini memutus akar tanaman dan mempercepat penguapan air tanah di lapisan perakaran.',
    recommendations: [
      'Terapkan pengolahan tanah konservasi (Minimum Tillage / No-Till) untuk menjaga agregat tanah alami.',
      'Gunakan mulsa sisa panen tebal (3-5 ton/ha) untuk menutup permukaan tanah dan menahan laju penguapan melalui rekahan tanah.',
      'Jangan mengolah tanah saat terlalu basah karena akan memicu pemadatan parah (lapisan padas olah).',
      'Rotasikan dengan tanaman berakar dalam (sorgum atau orok-orok) untuk menjaga porositas makro.'
    ],
    citation: 'Balittanah (2021). Pengelolaan Sumberdaya Lahan Kering Beriklim Kering Kawasan Timur Indonesia.'
  },
  {
    id: 'balittanah-soc-karbon-organik',
    title: 'Manajemen Karbon Organik Tanah (SOC) untuk Ketahanan Air dan Baterai Hara',
    institution: 'Balai Besar Litbang Sumberdaya Lahan Pertanian (BBLP)',
    year: 2023,
    category: 'soil',
    tags: ['soc', 'karbon organik', 'baterai tanah', 'awc', 'retensi air'],
    summary: 'Karbon Organik Tanah (SOC) adalah kunci kapasitas baterai tanah. Setiap peningkatan 1% bahan organik tanah mampu meningkatkan daya simpan air tanah (AWC) hingga 150.000 liter per hektar di zona perakaran.',
    recommendations: [
      'Hentikan total kebiasaan membakar jerami atau brangkasan tanaman setelah panen.',
      'Kembalikan residu tanaman ke dalam tanah melalui pencacahan langsung atau pembuatan kompos bokashi.',
      'Targetkan kadar SOC minimal >1.5% pada lahan kering untuk mencegah degradasi struktural tanah.'
    ],
    citation: 'BBLP Kementan (2023). Sekuestrasi Karbon Tanah dan Peningkatan Produktivitas Lahan Kering.'
  },
  {
    id: 'fao-56-water-balance',
    title: 'FAO-56: Manajemen Neraca Air dan Ambang Batas Kritis Evapotranspirasi Tanaman',
    institution: 'Food and Agriculture Organization (FAO) of the United Nations',
    year: 1998,
    category: 'water',
    tags: ['fao-56', 'et0', 'etc', 'defisit air', 'neraca air', 'irigasi'],
    summary: 'Standar baku dunia FAO Irrigation and Drainage Paper No. 56 untuk menghitung kebutuhan air tanaman (ETc) berdasarkan koefisien tanaman (Kc) dan evapotranspirasi acuan (ET0). Defisit air musiman di atas 100 mm menimbulkan risiko cekaman fatal bagi tanaman sereal.',
    recommendations: [
      'Jika defisit air (Wdeficit) diprediksi melampaui 100 mm, batasi koefisien Kc tanaman di bawah 0.8 (misal beralih ke sorgum atau legum genjah).',
      'Amati indikator kelembapan tanah perakaran NASA SMAP (GWETROOT); angka di bawah 0.25 menandakan air tanah telah mendekati Titik Layu Permanen (Permanent Wilting Point).',
      'Fasilitasi pemanenan air hujan (embung mikro atau rorak) untuk cadangan penyiraman darurat saat fase reproduktif tanaman.'
    ],
    citation: 'Allen, R. G., et al. (FAO, 1998). Crop Evapotranspiration - Guidelines for Computing Crop Water Requirements (FAO-56).'
  },
  {
    id: 'kementan-pht-rotasi-hama',
    title: 'Pengendalian Hama Terpadu (PHT) Melalui Pola Rotasi Tanaman Berkesinambungan',
    institution: 'Direktorat Perlindungan Tanaman Pangan - Kementan',
    year: 2022,
    category: 'pest',
    tags: ['pht', 'hama', 'rotasi', 'ulat grayak', 'penggerek', 'wereng'],
    summary: 'Monokultur jagung atau padi secara terus-menerus memicu ledakan populasi hama spesifik seperti Ulat Grayak Jagung (Spodoptera frugiperda) dan penggerek batang. Menyelingi tanaman sereal dengan legum atau famili berbeda memutus siklus hidup larva hama secara mekanis.',
    recommendations: [
      'Jangan menanam jagung berturut-turut pada petak lahan yang sama lebih dari dua musim.',
      'Selingi dengan tanaman legum (kedelai atau kacang hijau) yang bukan merupakan inang hama Spodoptera frugiperda.',
      'Tanaman legum mengundang musuh alami (predator dan parasitoid) yang menjaga keseimbangan ekosistem mikro lahan.'
    ],
    citation: 'Ditlin Tanaman Pangan Kementan (2022). Petunjuk Pelaksanaan Pengendalian Hama Terpadu Ramah Lingkungan.'
  },
  {
    id: 'nasa-smap-rootzone-soil-moisture',
    title: 'NASA SMAP: Pemantauan Kelembapan Zona Perakaran (0-100 cm) untuk Deteksi Dini Stres Tanaman',
    institution: 'NASA Jet Propulsion Laboratory (JPL) & Goddard Space Flight Center',
    year: 2024,
    category: 'water',
    tags: ['smap', 'kelembapan tanah', 'rootzone', 'drought stress', 'nasa', 'l4', 'infiltrasi'],
    summary: 'Misi NASA Soil Moisture Active Passive (SMAP) menyediakan pengukuran kelembapan tanah permukaan dan zona perakaran (0-100 cm) setiap 2-3 hari. Data ini krusial untuk mengidentifikasi cekaman kekeringan sebelum gejala visual layu muncul pada daun, serta mengevaluasi potensi infiltrasi air untuk tanaman rotasi.',
    recommendations: [
      'Gunakan batas kelembapan perakaran SMAP (GWETROOT) < 0.25 sebagai sinyal kritis untuk menghentikan tanaman rakus air dan beralih ke tanaman penutup kemarau (sorgum atau orok-orok).',
      'Integrasikan tren kelembapan SMAP 3-harian untuk memperkirakan jendela tanam optimal saat musim peralihan.',
      'Kombinasikan data kelembapan tanah SMAP dengan kapasitas simpan air (AWC) tanah lokal guna menghitung daya tahan cadangan baterai tanah.'
    ],
    citation: 'NASA SMAP Science Team (2024). SMAP Level-4 Surface and Root-Zone Soil Moisture Geophysical Data.'
  },
  {
    id: 'nasa-gpm-imerg-rainfall',
    title: 'NASA GPM & IMERG: Estimasi Akumulasi Presipitasi Global untuk Mitigasi Erosi dan Defisit Air',
    institution: 'NASA Goddard Space Flight Center & JAXA',
    year: 2023,
    category: 'water',
    tags: ['gpm', 'imerg', 'presipitasi', 'curah hujan', 'erosi', 'nasa', 'badai', 'hujan ekstrim'],
    summary: 'Global Precipitation Measurement (GPM) melalui produk IMERG menyediakan estimasi laju dan akumulasi curah hujan resolusi tinggi. Data ini membantu menilai reliabilitas hujan, frekuensi badai ekstrem pemicu erosi tanah olah, dan tren jangka panjang masukan air ke tanah.',
    recommendations: [
      'Bandingkan strategi rotasi tanaman di bawah skenario curah hujan ekstrem vs normal menggunakan data historis IMERG.',
      'Pada wilayah dengan risiko hujan berintensitas tinggi, wajib terapkan tanaman penutup kanopi rapat (cover crop) untuk memecah energi kinetik butir hujan.',
      'Gunakan akumulasi IMERG dasarian untuk memvalidasi fase kritis pembentukan bunga dan pengisian biji pada tanaman sereal.'
    ],
    citation: 'Huffman, G. J., et al. (NASA GSFC, 2023). Integrated Multi-satellitE Retrievals for GPM (IMERG) Technical Documentation.'
  },
  {
    id: 'nasa-landsat-modis-ndvi',
    title: 'Landsat & MODIS/VIIRS: Indeks Vegetasi (NDVI/EVI) dan Pemetaan Lahan Bera Beresolusi Tinggi',
    institution: 'NASA & USGS Earth Resources Observation and Science (EROS) Center',
    year: 2023,
    category: 'crop',
    tags: ['landsat', 'modis', 'viirs', 'ndvi', 'evi', 'vigor tanaman', 'lahan bera', 'nasa', 'usgs'],
    summary: 'Citra Landsat (resolusi 30 meter) dan MODIS/VIIRS (250-1000 meter) menyediakan data reflektansi terkoreksi dan indeks vegetasi (NDVI) untuk memetakan vigor tanaman, transisi musiman, deteksi lahan bera tanpa tutupan, serta perbandingan visual efektivitas rotasi lahan.',
    recommendations: [
      'Pantau periode lahan bera (bare ground) pasca panen utama; jika nilai NDVI < 0.20 berlanjut lebih dari 20 hari, segera tanam legum penutup tanah.',
      'Gunakan tren NDVI 16-harian untuk mendeteksi penurunan vigor lebih dini sebelum kerusakan kanopi meluas.',
      'Verifikasi keseragaman pertumbuhan petak lahan dengan resolusi 30m Landsat untuk menentukan zonasi pemupukan presisi.'
    ],
    citation: 'USGS / NASA Landsat Program (2023). Landsat Surface Reflectance and Terrestrial Essential Climate Variables.'
  },
  {
    id: 'nasa-ecostress-thermal-et',
    title: 'NASA ECOSTRESS: Suhu Permukaan Tanah (LST) dan Evapotranspirasi Mikro untuk Deteksi Stres Termal',
    institution: 'NASA Jet Propulsion Laboratory (JPL) / International Space Station',
    year: 2024,
    category: 'water',
    tags: ['ecostress', 'lst', 'evapotranspirasi', 'suhu tanah', 'panas', 'stres termal', 'akar dangkal'],
    summary: 'Instrumen ECOSTRESS di Stasiun Luar Angkasa Internasional (ISS) mengukur suhu permukaan tanah (Land Surface Temperature/LST) dan laju evapotranspirasi aktual pada resolusi spasial tinggi. Sangat efektif mendeteksi titik panas (thermal hotspots) dan kerentanan tanaman berakar dangkal.',
    recommendations: [
      'Identifikasi petak lahan yang mengalami lonjakan suhu kanopi di atas 38°C pada siang hari sebagai indikator penutupan stomata dan stres air parah.',
      'Gunakan pemetaan ET mikro ECOSTRESS untuk membedakan kebutuhan air riil antar petak dan memilih tanaman yang hemat transpirasi.',
      'Petakan area rentan cekaman panas untuk diprioritaskan mendapat mulsa organik atau pohon penaung agroforestri.'
    ],
    citation: 'Fisher, J. B., et al. (NASA JPL, 2024). The ECOSTRESS Mission: High-Resolution Evapotranspiration and Plant Water Stress from Space.'
  },
  {
    id: 'nasa-srtm-elevation-terrain',
    title: 'NASA SRTM: Model Elevasi Digital (DEM) untuk Analisis Kemiringan Lereng dan Penataan Aliran Limpasan',
    institution: 'NASA / National Geospatial-Intelligence Agency (NGA)',
    year: 2020,
    category: 'soil',
    tags: ['srtm', 'dem', 'elevasi', 'lereng', 'slope', 'limpasan', 'runoff', 'erosi', 'terasering'],
    summary: 'Shuttle Radar Topography Mission (SRTM) menyediakan data elevasi topografi global resolusi 30 meter untuk menganalisis kemiringan lereng, arah aliran limpasan permukaan (runoff), dan zona risiko erosi tanah. Pola topografi menentukan tanaman rotasi yang mampu menstabilkan lereng.',
    recommendations: [
      'Pada lereng dengan kemiringan >15%, hindari rotasi yang menyisakan tanah terbuka tanpa vegetasi penutup.',
      'Gunakan tanaman penguat lereng dengan akar serabut padat atau akar tunggang jangkar (vetiver, orok-orok, lamtoro) di sepanjang garis kontur.',
      'Hitung faktor topografi (LS-factor) menggunakan data SRTM untuk memperkirakan laju kehilangan tanah akibat erosi lembar.'
    ],
    citation: 'Farr, T. G., et al. (NASA, 2020). The Shuttle Radar Topography Mission: Global High-Resolution Topographic Data.'
  },
  {
    id: 'fao-gaez-crop-suitability',
    title: 'FAO GAEZ v4: Zona Agro-Ekologi Global dan Potensi Kesesuaian Agroklimat Tanaman Rotasi',
    institution: 'Food and Agriculture Organization (FAO) & IIASA',
    year: 2021,
    category: 'crop',
    tags: ['gaez', 'kesesuaian tanaman', 'fao', 'iiasa', 'agroklimat', 'potensi hasil', 'kendala tanah'],
    summary: 'FAO Global Agro-Ecological Zones (GAEZ) menyediakan lapisan kesesuaian agroklimat untuk puluhan komoditas pangan, lengkap dengan batasan biofisik tanah, ketersediaan air, dan estimasi potensi hasil di berbagai skenario masukan input.',
    recommendations: [
      'Validasi pemilihan komoditas rotasi 4 musim terhadap indeks kesesuaian GAEZ untuk mencegah pemilihan tanaman di luar rentang termal dan fotoperiode alaminya.',
      'Gunakan pemodelan defisit kelembapan GAEZ untuk menghitung peluang keberhasilan panen tanaman sereal vs legum pada musim kemarau.',
      'Padukan parameter tanah GAEZ dengan data observasi tanah lokal untuk menentukan dosis input pemupukan berimbang.'
    ],
    citation: 'FAO & IIASA (2021). Global Agro-Ecological Zones v4 (GAEZ v4) Model Documentation.'
  },
  {
    id: 'usda-ssurgo-soil-health',
    title: 'USDA NRCS SSURGO / STATSGO2: Standar Karakterisasi Tekstur, Kepadatan, dan Retensi Air Tanah',
    institution: 'USDA Natural Resources Conservation Service (NRCS)',
    year: 2023,
    category: 'soil',
    tags: ['ssurgo', 'statsgo2', 'usda', 'nrcs', 'awc', 'tekstur', 'drainase', 'lapisan padas', 'soil survey'],
    summary: 'Database survei tanah resmi USDA NRCS menyediakan atribut fisik dan kimia tanah mendalam: kelas tekstur, kadar bahan organik, kelas drainase, kelompok hidrologi tanah (HSG), lapisan penghambat (restrictive layer/hardpan), dan kapasitas simpan air (Available Water Capacity/AWC).',
    recommendations: [
      'Gunakan pedoman kelompok hidrologi tanah (HSG A, B, C, D) untuk memprediksi potensi infiltrasi air vs laju limpasan permukaan.',
      'Identifikasi kedalaman lapisan padas (hardpan) untuk menentukan kebutuhan tanaman pemecah padas berakar agresif.',
      'Terapkan formula pedotransfer terstandarisasi untuk mengestimasi ketersediaan air tanah riil di zona perakaran aktif.'
    ],
    citation: 'Soil Survey Staff, USDA-NRCS (2023). Soil Survey Geographic (SSURGO) Database and Web Soil Survey Standards.'
  },
  {
    id: 'esa-copernicus-sentinel2',
    title: 'ESA Copernicus Sentinel-2: Citra Multispektral Resolusi Tinggi (10-20m) untuk Monitoring Vegetasi & Red-Edge',
    institution: 'European Space Agency (ESA) Copernicus Programme',
    year: 2024,
    category: 'crop',
    tags: ['sentinel-2', 'esa', 'copernicus', 'red-edge', 'swir', 'ndvi', 'resolusi tinggi', '10m'],
    summary: 'Satelit Copernicus Sentinel-2 menyediakan citra multispektral bebas biaya beresolusi 10-20 meter dengan revisit cepat 5 hari. Pita spektral Red-Edge dan SWIR sangat peka terhadap kandungan klorofil daun, status nitrogen kanopi, dan kelembapan biomassa tanaman.',
    recommendations: [
      'Manfaatkan band Red-Edge (B5, B6, B7) Sentinel-2 untuk mendeteksi defisiensi nitrogen sebelum gejala klorosis terlihat di lapangan.',
      'Gunakan rasio indeks NDWI (Near-Infrared vs Shortwave Infrared) untuk mengukur kadar air daun dan status hidrasi kanopi.',
      'Gunakan resolusi spasial 10m untuk delineasi batas petak kepemilikan petani kecil dan mendeteksi variabilitas kesuburan mikro.'
    ],
    citation: 'European Space Agency (ESA, 2024). Sentinel-2 User Handbook & Copernicus Land Monitoring Service.'
  }
];

export interface AgronomyQueryMatch {
  doc: KnowledgeDocument;
  score: number;
  matchedKeywords: string[];
}

export function searchKnowledgeBase(query: string, maxResults: number = 3): AgronomyQueryMatch[] {
  const normalized = query.toLowerCase();
  const tokens = normalized
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);

  const scored = AGRONOMY_KNOWLEDGE_BASE.map((doc) => {
    let score = 0;
    const matchedKeywords: string[] = [];

    // Check tags
    doc.tags.forEach((tag) => {
      tokens.forEach((token) => {
        if (tag.toLowerCase().includes(token) || token.includes(tag.toLowerCase())) {
          score += 15;
          if (!matchedKeywords.includes(tag)) matchedKeywords.push(tag);
        }
      });
    });

    // Check title
    const titleLower = doc.title.toLowerCase();
    tokens.forEach((token) => {
      if (titleLower.includes(token)) {
        score += 8;
        if (!matchedKeywords.includes(token)) matchedKeywords.push(token);
      }
    });

    // Check summary & recommendations
    const bodyText = (doc.summary + ' ' + doc.recommendations.join(' ')).toLowerCase();
    tokens.forEach((token) => {
      if (bodyText.includes(token)) {
        score += 3;
      }
    });

    return { doc, score, matchedKeywords };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}
