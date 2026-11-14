'use client';

import React, { useState, useMemo } from 'react';
import {
  Satellite,
  Database,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  Layers,
  Globe,
  Droplets,
  Sprout,
  BarChart3,
  ShieldCheck,
  Compass,
  ArrowUpRight
} from 'lucide-react';

export interface ChallengeDataset {
  id: string;
  name: string;
  acronym: string;
  agency: string;
  agencyCategory: 'NASA' | 'ESA' | 'USDA' | 'USGS' | 'ECMWF' | 'FAO' | 'OSU / Partners';
  category: 'nasa-satellites' | 'space-partners' | 'usda-usgs' | 'climate-reanalysis';
  resolution: string;
  frequency: string;
  variables: string[];
  description: string;
  adaptationValue: string;
  terraShaftRole: string;
  statusBadge: 'Active API' | 'Integrated Bio-Model' | 'RAG Knowledge Base' | 'Calibrated Reference';
  officialUrl: string;
}

export const NASA_CHALLENGE_DATASETS: ChallengeDataset[] = [
  // 1. NASA Earth Observation Satellites
  {
    id: 'nasa-smap',
    name: 'Soil Moisture Active Passive',
    acronym: 'SMAP',
    agency: 'NASA JPL & GSFC',
    agencyCategory: 'NASA',
    category: 'nasa-satellites',
    resolution: '9 km / 36 km (L4 root-zone model)',
    frequency: '2–3 hari',
    variables: ['Surface Soil Moisture (0-5 cm)', 'Root-Zone Soil Wetness (0-100 cm)', 'Freeze/Thaw State'],
    description: 'Menyediakan pengukuran global kelembapan tanah permukaan dan zona perakaran serta siklus beku/cair bumi.',
    adaptationValue: 'Mengidentifikasi cekaman kekeringan dini sebelum daun layu, ketersediaan air perakaran, potensi infiltrasi, dan evaluasi tanaman rotasi hemat air.',
    terraShaftRole: 'Indikator GWETROOT pada Baterai Tanah dan ambang batas peringatan dini defisit air di sistem optimasi 4 musim.',
    statusBadge: 'Active API',
    officialUrl: 'https://smap.jpl.nasa.gov/'
  },
  {
    id: 'nasa-gpm-imerg',
    name: 'Global Precipitation Measurement & IMERG',
    acronym: 'GPM IMERG',
    agency: 'NASA GSFC & JAXA',
    agencyCategory: 'NASA',
    category: 'nasa-satellites',
    resolution: '0.1° (~10 km)',
    frequency: '30 menit / Harian',
    variables: ['Precipitation Rate (mm/jam)', 'Accumulated Rainfall (mm)', 'Storm Frequency'],
    description: 'Konstelasi satelit internasional untuk estimasi laju dan akumulasi presipitasi global resolusi tinggi.',
    adaptationValue: 'Menilai keandalan curah hujan, frekuensi badai ekstrem pemicu erosi tanah, dan tren jangka panjang masukan lengas tanah.',
    terraShaftRole: 'Perhitungan water budget input (P) pada modul Neraca Air dan analisis risiko erosi pada periode peralihan musim.',
    statusBadge: 'Active API',
    officialUrl: 'https://gpm.nasa.gov/data/imerg'
  },
  {
    id: 'nasa-landsat-modis-viirs',
    name: 'Landsat & MODIS / VIIRS Vegetation Indices',
    acronym: 'Landsat · MODIS/VIIRS',
    agency: 'NASA & USGS EROS',
    agencyCategory: 'NASA',
    category: 'nasa-satellites',
    resolution: '30m (Landsat) · 250m–1km (MODIS/VIIRS)',
    frequency: 'Harian (MODIS) / 8–16 hari (Landsat)',
    variables: ['Surface Reflectance', 'NDVI (Normalized Difference Veg Index)', 'EVI', 'Bare Ground Windows'],
    description: 'Reflektansi permukaan terkoreksi atmosfer dan indeks vegetasi untuk memantau biomassa dan kesehatan kanopi.',
    adaptationValue: 'Memetakan vigor tanaman, mendeteksi transisi musiman, mengidentifikasi lahan bera tanpa tutupan, dan membandingkan opsi rotasi visual.',
    terraShaftRole: 'Visualisasi vegetasi GIS Explorer, deteksi fase bera pada petak lahan, dan kalibrasi koefisien tanaman (Kc).',
    statusBadge: 'Integrated Bio-Model',
    officialUrl: 'https://landsat.gsfc.nasa.gov/'
  },
  {
    id: 'nasa-power',
    name: 'NASA POWER Agroclimatology & Meteorological Data',
    acronym: 'NASA POWER',
    agency: 'NASA Langley Research Center (LaRC)',
    agencyCategory: 'NASA',
    category: 'climate-reanalysis',
    resolution: '0.5° x 0.5° (~50 km)',
    frequency: 'Harian & Klimatologi Historis',
    variables: ['Solar Radiation (ALLSKY_SFC_SW_DWN)', 'T2M (Min/Max/Mean)', 'RH2M', 'PRECTOTCORR', 'Wind Speed'],
    description: 'Kumpulan data surya, meteorologi, dan klimatologi global yang dioptimalkan untuk riset dan aplikasi pertanian.',
    adaptationValue: 'Menghitung penggunaan air tanaman, kondisi musim tanam, risiko suhu ekstrem, dan kesesuaian iklim komoditas rotasi.',
    terraShaftRole: 'Sumber data telemetri iklim langsung yang menghitung ET0 harian FAO-56 Hargreaves-Samani secara realtime.',
    statusBadge: 'Active API',
    officialUrl: 'https://power.larc.nasa.gov/'
  },
  {
    id: 'nasa-srtm',
    name: 'Shuttle Radar Topography Mission DEM',
    acronym: 'SRTM DEM',
    agency: 'NASA & NGA',
    agencyCategory: 'NASA',
    category: 'nasa-satellites',
    resolution: '1 arc-second (~30 meter)',
    frequency: 'Model Topografi Global Terstandarisasi',
    variables: ['Elevation (m)', 'Slope Gradient (%)', 'Aspect', 'Flow Accumulation'],
    description: 'Model elevasi digital global berbasis radar interferometrik untuk analisis geomorfologi dan topografi permukaan bumi.',
    adaptationValue: 'Menganalisis kemiringan lereng, aliran limpasan permukaan (runoff), risiko erosi, dan penataan stabilisasi tanah miring.',
    terraShaftRole: 'Koreksi topografi elevasi pada AOI, estimasi limpasan curah hujan, dan rekomendasi tanaman lereng (vetiver/orok-orok).',
    statusBadge: 'Integrated Bio-Model',
    officialUrl: 'https://www.earthdata.nasa.gov/sensors/srtm'
  },
  {
    id: 'nasa-ecostress',
    name: 'ECOSTRESS Thermal Infrared & Evapotranspiration',
    acronym: 'ECOSTRESS',
    agency: 'NASA JPL (ISS Payload)',
    agencyCategory: 'NASA',
    category: 'nasa-satellites',
    resolution: '70 meter',
    frequency: '1–5 hari (Orbit ISS)',
    variables: ['Land-Surface Temperature (LST)', 'Evapotranspiration (ET)', 'Evaporative Stress Index (ESI)'],
    description: 'Pengukuran radiometer termal resolusi tinggi untuk memetakan suhu permukaan daratan dan laju kehilangan air tanaman.',
    adaptationValue: 'Mendeteksi titik panas (hotspots) stres tanaman, paparan cekaman termal, kerentanan akar dangkal, dan kebutuhan air petak mikro.',
    terraShaftRole: 'Deteksi kerentanan tanaman monokultur saat gelombang panas kemarau dan pembuktian efisiensi cover crop penurun suhu tanah.',
    statusBadge: 'RAG Knowledge Base',
    officialUrl: 'https://ecostress.jpl.nasa.gov/'
  },
  {
    id: 'nasa-gedi',
    name: 'Global Ecosystem Dynamics Investigation',
    acronym: 'GEDI LiDAR',
    agency: 'NASA & University of Maryland',
    agencyCategory: 'NASA',
    category: 'nasa-satellites',
    resolution: '25 meter footprint LiDAR',
    frequency: 'Misi LiDAR ISS Terkalibrasi',
    variables: ['Canopy Height Profile', 'Leaf Area Index (LAI)', 'Above-Ground Biomass Density (AGBD)'],
    description: 'Pengukuran struktur kanopi dan biomassa berbasis laser altimeter berpresisi tinggi dari Stasiun Luar Angkasa.',
    adaptationValue: 'Memahami kerapatan vegetasi, cekaman kanopi, dan perubahan biomassa jangka panjang di lanskap sekitar lahan budidaya.',
    terraShaftRole: 'Penilaian integrasi pohon pelindung (agroforestri) penahan angin kering dan estimasi sekuestrasi karbon residu biomassa.',
    statusBadge: 'RAG Knowledge Base',
    officialUrl: 'https://gedi.umd.edu/'
  },

  // 2. Space Agency Partner Missions
  {
    id: 'esa-sentinel2',
    name: 'Copernicus Sentinel-2 Multispectral Mission',
    acronym: 'Sentinel-2',
    agency: 'European Space Agency (ESA)',
    agencyCategory: 'ESA',
    category: 'space-partners',
    resolution: '10m / 20m / 60m',
    frequency: '5 hari (Konstelasi 2A/2B)',
    variables: ['13 Spectral Bands', 'Red-Edge Chlorophyll Bands', 'SWIR Moisture Bands', 'NDWI'],
    description: 'Citra optik multispektral bebas akses beresolusi spasial tinggi dengan pita khusus analisis status vegetasi dan lengas daun.',
    adaptationValue: 'Memetakan indeks klorofil kanopi, deteksi dini klorosis hara, batas kepemilikan petak mikro petani, dan monitoring lahan bera.',
    terraShaftRole: 'Penyedia resolusi tinggi pendamping Landsat untuk delineasi batas AOI dan analisis petak beresolusi 10 meter.',
    statusBadge: 'Active API',
    officialUrl: 'https://sentinels.copernicus.eu/web/sentinel/missions/sentinel-2'
  },
  {
    id: 'ecmwf-era5',
    name: 'ERA5 Global Atmospheric Reanalysis',
    acronym: 'ERA5',
    agency: 'ECMWF / Copernicus C3S',
    agencyCategory: 'ECMWF',
    category: 'space-partners',
    resolution: '31 km grid',
    frequency: 'Per Jam (Hourly) Continuous',
    variables: ['Hourly Temperature', 'Soil Temperature (4 Layers)', 'Relative Humidity', 'Solar Radiation', 'Wind Vector'],
    description: 'Reanalisis atmosfer dan daratan global generasi kelima yang menggabungkan model fisik atmosfer dengan miliaran observasi in-situ.',
    adaptationValue: 'Mengisi celah kekosongan data stasiun cuaca terestrial lokal, analisis tren iklim jangka panjang, dan fitur deret waktu.',
    terraShaftRole: 'Validasi kontinuitas cuaca jam-jaman dan kalibrasi cadangan parameter suhu tanah multi-kedalaman.',
    statusBadge: 'Calibrated Reference',
    officialUrl: 'https://www.ecmwf.int/en/forecasts/dataset/ecmwf-reanalysis-v5'
  },

  // 3. USDA & USGS Suites
  {
    id: 'usda-ag-data-commons',
    name: 'USDA Ag Data Commons',
    acronym: 'Ag Data Commons',
    agency: 'USDA Agricultural Research Service (ARS)',
    agencyCategory: 'USDA',
    category: 'usda-usgs',
    resolution: 'Multi-scale Field Experiments',
    frequency: 'Open Access Repository',
    variables: ['Soil Property Measurements', 'Crop Phenology', 'Management Practices', 'Yield Trial Datasets'],
    description: 'Repositori terbuka data riset pertanian federal yang mencakup tanah, tanaman, iklim mikro, dan tata kelola agronomi.',
    adaptationValue: 'Menghubungkan indikator satelit NASA dengan batasan praktis di tingkat usahatani dan realitas rotasi tanaman lokal.',
    terraShaftRole: 'Basis validasi kurva serapan hara (N-P-K) dan kalibrasi koefisien biomasa legum pada mesin optimasi rotasi.',
    statusBadge: 'RAG Knowledge Base',
    officialUrl: 'https://data.nal.usda.gov/'
  },
  {
    id: 'usda-wss',
    name: 'Web Soil Survey (WSS)',
    acronym: 'WSS NRCS',
    agency: 'USDA Natural Resources Conservation Service (NRCS)',
    agencyCategory: 'USDA',
    category: 'usda-usgs',
    resolution: '1:12.000 hingga 1:24.000 Map Scale',
    frequency: 'Pembaruan Tahunan Resmi',
    variables: ['Soil Maps', 'Texture by Horizon', 'Drainage Class', 'Hydrologic Rating', 'Compaction Risk'],
    description: 'Sumber data tanah resmi AS yang memuat peta tanah detail, klasifikasi drainase, dan kesesuaian tata guna lahan.',
    adaptationValue: 'Mengidentifikasi karakteristik spesifik tanah petak (bahan organik, tekstur, infiltrasi) guna memperkuat rekomendasi rotasi cerdas.',
    terraShaftRole: 'Standar baku taksonomi tanah yang dipetakan bersama basis data ISRIC SoilGrids v2.0 pada modul profil tanah.',
    statusBadge: 'Calibrated Reference',
    officialUrl: 'https://websoilsurvey.nrcs.usda.gov/'
  },
  {
    id: 'usda-cdl',
    name: 'Cropland Data Layer (CropScape)',
    acronym: 'USDA CDL',
    agency: 'USDA National Agricultural Statistics Service (NASS)',
    agencyCategory: 'USDA',
    category: 'usda-usgs',
    resolution: '30 meter',
    frequency: 'Tahunan (Annual Census)',
    variables: ['Cropland Classifications', 'Crop Types (Corn, Soy, Sorghum, Wheat, Alfalfa)', 'Rotation Sequence History'],
    description: 'Klasifikasi tutupan tanaman pangan tahunan resolusi 30 meter berbasis citra satelit dan survei lapangan ground-truth.',
    adaptationValue: 'Mempelajari suksesi pola rotasi tanaman eksisting, melacak pergeseran musim, dan mengidentifikasi periode tanah bera.',
    terraShaftRole: 'Benchmark pelatihan pola suksesi monokultur vs diversifikasi polikultur pada skenario pemulihan baterai tanah.',
    statusBadge: 'Integrated Bio-Model',
    officialUrl: 'https://nassgeodata.gmu.edu/CropScape/'
  },
  {
    id: 'usda-ssurgo',
    name: 'USDA NRCS SSURGO / STATSGO2 Soil Database',
    acronym: 'SSURGO · STATSGO2',
    agency: 'USDA NRCS',
    agencyCategory: 'USDA',
    category: 'usda-usgs',
    resolution: 'Field-scale (SSURGO) · Regional (STATSGO2)',
    frequency: 'Database Terkalibrasi Berkelanjutan',
    variables: ['Soil Texture Fractions', 'Organic Matter (SOC %)', 'Available Water Capacity (AWC)', 'Restrictive Hardpan Layers'],
    description: 'Atribut tanah terinci dari survei lapangan: kedalaman padas pembatas, kelompok hidrologi (HSG), dan kapasitas retensi lengas.',
    adaptationValue: 'Menyediakan penilaian akurat kondisi kesehatan tanah, potensi erosi, dan kesesuaian tanaman pemecah padas.',
    terraShaftRole: 'Formulasi pedotransfer baku Saxton-Rawls untuk menghitung AWC dan kapasitas muatan hara tanah pada TerraShaft.',
    statusBadge: 'Integrated Bio-Model',
    officialUrl: 'https://www.nrcs.usda.gov/resources/data-and-tech/soil-survey-geographic-database-ssurgo'
  },
  {
    id: 'usda-naip',
    name: 'National Agriculture Imagery Program Aerial Imagery',
    acronym: 'NAIP Aerial',
    agency: 'USDA Farm Service Agency (FSA)',
    agencyCategory: 'USDA',
    category: 'usda-usgs',
    resolution: '0.5 – 1 meter (Sub-Meter Ortofoto)',
    frequency: 'Siklus 2–3 Tahun Masa Tanam',
    variables: ['Sub-Meter True Color / NIR Imagery', 'Field Boundary Delineation', 'Micro-Terrace Verification'],
    description: 'Foto udara resolusi sangat tinggi yang diambil selama puncak musim tanam pertanian.',
    adaptationValue: 'Memetakan batas petak mikro, mengamati perkembangan tanaman, dan memvalidasi pola tanah yang terdeteksi satelit.',
    terraShaftRole: 'Verifikasi ketepatan delineasi poligon GIS Explorer dan deteksi visual rekahan tanah Vertisol di lapangan.',
    statusBadge: 'Calibrated Reference',
    officialUrl: 'https://naip-usdaonline.hub.arcgis.com/'
  },
  {
    id: 'usgs-nlcd',
    name: 'USGS National Land Cover Database',
    acronym: 'USGS NLCD',
    agency: 'Multi-Agency Consortium (MRLC) / USGS',
    agencyCategory: 'USGS',
    category: 'usda-usgs',
    resolution: '30 meter',
    frequency: 'Rilis Berkala Multi-Dekade',
    variables: ['Land Cover Types', 'Impervious Surface %', 'Tree Canopy %', 'Agricultural Land Transition'],
    description: 'Klasifikasi tutupan dan penggunaan lahan 30 meter multi-dekade untuk memantau perubahan ekologis bentang lahan.',
    adaptationValue: 'Mengontekstualisasikan fitur bentang alam yang memengaruhi iklim mikro, ketersediaan air, dan dinamika erosi.',
    terraShaftRole: 'Penetapan batas ekologis bentang alam pada analisis wilayah semi-arid dan mitigasi konflik alih fungsi lahan.',
    statusBadge: 'Calibrated Reference',
    officialUrl: 'https://www.mrlc.gov/data'
  },
  {
    id: 'nasa-noaa-nldas-gldas',
    name: 'NLDAS & GLDAS Land Data Assimilation Systems',
    acronym: 'NLDAS / GLDAS',
    agency: 'NASA GSFC & NOAA NCEP',
    agencyCategory: 'NASA',
    category: 'climate-reanalysis',
    resolution: '0.125° (NLDAS) / 0.25° (GLDAS)',
    frequency: 'Sub-harian hingga Harian Deret Waktu',
    variables: ['Layered Soil Moisture (0-10, 10-40, 40-100, 100-200cm)', 'Soil Temperature', 'Surface Runoff', 'ET Fluxes'],
    description: 'Menggabungkan observasi meteorologi satelit dan darat dengan model transfer massa-energi permukaan bumi kontinu.',
    adaptationValue: 'Mempelajari onset awal kekeringan, defisit kelembapan tanah musiman, dan transisi musim tanam berkelanjutan.',
    terraShaftRole: 'Fitur pendukung kalibrasi cadangan model kelembapan bertingkat saat data SMAP mengalami periode blackout sensor.',
    statusBadge: 'Integrated Bio-Model',
    officialUrl: 'https://ldas.gsfc.nasa.gov/'
  },
  {
    id: 'openet',
    name: 'OpenET Satellite-Driven Evapotranspiration',
    acronym: 'OpenET',
    agency: 'NASA, USGS, DRI & EDF Consortium',
    agencyCategory: 'USGS',
    category: 'usda-usgs',
    resolution: '30 meter (Field-Scale)',
    frequency: 'Harian / Bulanan',
    variables: ['Actual Evapotranspiration (ETa)', 'Reference ET (ETr/ETo)', 'Ensemble Satellite ET (6 Models)'],
    description: 'Platform ensemble 6 model satelit untuk estimasi evapotranspirasi aktual tingkat petak lahan pertanian.',
    adaptationValue: 'Mengevaluasi kebutuhan air tanaman, penjadwalan irigasi hemat air, dan deteksi petak di bawah cekaman termal.',
    terraShaftRole: 'Pembanding ground-truth validasi formula ET0 dan penghitungan defisit air tanaman pada modul Neraca Air.',
    statusBadge: 'RAG Knowledge Base',
    officialUrl: 'https://openetdata.org/'
  },
  {
    id: 'usfs-landfire',
    name: 'USFS LANDFIRE Vegetation & Fuel Models',
    acronym: 'LANDFIRE',
    agency: 'US Forest Service & USGS',
    agencyCategory: 'USGS',
    category: 'usda-usgs',
    resolution: '30 meter',
    frequency: 'Pembaruan Berkala Terjadwal',
    variables: ['Existing Vegetation Type (EVT)', 'Canopy Bulk Density', 'Fuel Models', 'Landscape Structure'],
    description: 'Menyediakan lapisan vegetasi terpadu, biomassa mudah terbakar, dan karakteristik lanskap ekologi.',
    adaptationValue: 'Memahami interaksi pohon-tanaman budidaya, aliran limpasan, dan mitigasi risiko kebakaran residu brangkasan kering.',
    terraShaftRole: 'Panduan tata kelola mulsa organik agar sisa panen sorgum/jagung tidak memicu risiko kebakaran saat kemarau kering.',
    statusBadge: 'Calibrated Reference',
    officialUrl: 'https://landfire.gov/'
  },
  {
    id: 'usda-ams-market-news',
    name: 'USDA AMS Market News Commodity Pricing',
    acronym: 'AMS Market News',
    agency: 'USDA Agricultural Marketing Service',
    agencyCategory: 'USDA',
    category: 'usda-usgs',
    resolution: 'Pasar Regional & Pusat Distribusi',
    frequency: 'Harian / Mingguan',
    variables: ['Commodity Prices', 'Wholesale Volume Trends', 'Supply-Demand Indicators'],
    description: 'Publikasi resmi pergerakan harga komoditas pangan, tren permintaan pasar, dan kondisi perdagangan hasil panen.',
    adaptationValue: 'Memastikan tanaman rotasi yang diusulkan memiliki kepastian pasar lokal/regional yang layak bagi ekonomi petani.',
    terraShaftRole: 'Penyaring kelayakan ekonomi komoditas alternatif (misal: pasar pakan sorgum vs konsumsi kedelai lokal).',
    statusBadge: 'RAG Knowledge Base',
    officialUrl: 'https://www.ams.usda.gov/market-news'
  },
  {
    id: 'usda-nass-quickstats',
    name: 'USDA NASS QuickStats Agricultural Database',
    acronym: 'NASS QuickStats',
    agency: 'USDA NASS',
    agencyCategory: 'USDA',
    category: 'usda-usgs',
    resolution: 'Tingkat Kabupaten (County) & Negara Bagian',
    frequency: 'Sensus & Survei Tahunan',
    variables: ['Historical Crop Yields', 'Planted & Harvested Acreage', 'Crop Rotation Frequency', 'Irrigation Adoption'],
    description: 'Basis data statistik sensus pertanian historis paling komprehensif untuk membandingkan produktivitas komoditas.',
    adaptationValue: 'Mengalibrasi model rotasi terhadap performa historis nyata dan mengevaluasi tren agronomi jangka panjang.',
    terraShaftRole: 'Penetapan benchmark potensi hasil panen pada tanaman model untuk memvalidasi estimasi kenaikan panen pasca rotasi.',
    statusBadge: 'Calibrated Reference',
    officialUrl: 'https://quickstats.nass.usda.gov/'
  },

  // 4. Climate Normals & Global Frameworks
  {
    id: 'prism-climate-data',
    name: 'PRISM Climate Group Topographic Climate Normals',
    acronym: 'PRISM Climate',
    agency: 'Oregon State University (OSU)',
    agencyCategory: 'OSU / Partners',
    category: 'climate-reanalysis',
    resolution: '800m – 4km Topographically Corrected',
    frequency: 'Harian, Bulanan, Normal 30-Tahun',
    variables: ['PRISM Precipitation', 'Mean/Min/Max Temperature', 'Dewpoint', 'Frost/Freeze Thresholds'],
    description: 'Dataset iklim presisi tinggi yang memperhitungkan efek elevasi, orientasi lereng, dan inversi suhu mikro.',
    adaptationValue: 'Menilai tren iklim jangka panjang, menyelaraskan rotasi dengan riwayat suhu lokal, dan validasi indikator satelit.',
    terraShaftRole: 'Metodologi referensi untuk mengkoreksi suhu data kasar satelit terhadap ketinggian elevasi lokal DEM.',
    statusBadge: 'Calibrated Reference',
    officialUrl: 'https://prism.oregonstate.edu/'
  },
  {
    id: 'fao-gaez',
    name: 'FAO Global Agro-Ecological Zones (GAEZ v4)',
    acronym: 'FAO GAEZ v4',
    agency: 'FAO & IIASA',
    agencyCategory: 'FAO',
    category: 'climate-reanalysis',
    resolution: '5 arc-minute (~9 km)',
    frequency: 'Edisi Global v4',
    variables: ['Agro-Climatic Crop Suitability', 'Soil Constraints (Salinity, Depth, Texture)', 'Potential Yield Indices'],
    description: 'Model global penentuan zona agro-ekologis dan kesesuaian biofisik lahan untuk puluhan komoditas pangan dunia.',
    adaptationValue: 'Mengevaluasi apakah komoditas rotasi selaras dengan iklim dan tanah lokal dari perspektif agronomi global teruji.',
    terraShaftRole: 'Kriteria validasi agronomis pada modul Field Advisor AI dan formula kesesuaian rotasi tanaman di iklim semi-arid.',
    statusBadge: 'RAG Knowledge Base',
    officialUrl: 'https://gaez.fao.org/'
  },
  {
    id: 'cocorahs-precipitation',
    name: 'CoCoRaHS Community Precipitation Network',
    acronym: 'CoCoRaHS',
    agency: 'Colorado State University & NOAA NWS',
    agencyCategory: 'OSU / Partners',
    category: 'climate-reanalysis',
    resolution: 'Titik Stasiun Pengamat Relawan',
    frequency: 'Harian (Crowdsourced In-Situ)',
    variables: ['Daily Ground Precipitation (Rain/Snow)', 'Micro-Rainstorm Events', 'Field Accumulation'],
    description: 'Jaringan pengukuran presipitasi harian terbesar berbasis partisipasi warga dan penyuluh di lapangan.',
    adaptationValue: 'Memvalidasi estimasi curah hujan satelit IMERG dan mendeteksi kejadian hujan badai lokal ekstrem di tingkat desa.',
    terraShaftRole: 'Kerangka konseptual untuk pelaporan partisipatif Petugas Penyuluh Lapangan (PPL) pada fitur Mode Lapangan.',
    statusBadge: 'Calibrated Reference',
    officialUrl: 'https://www.cocorahs.org/'
  },
  {
    id: 'usgs-nwis',
    name: 'USGS National Water Information System',
    acronym: 'USGS NWIS',
    agency: 'USGS Water Resources Mission Area',
    agencyCategory: 'USGS',
    category: 'usda-usgs',
    resolution: 'Ribuan Stasiun Pengukur Aliran & Sumur Bor',
    frequency: 'Near-Realtime (15-menit) & Harian',
    variables: ['Groundwater Levels', 'Streamflow Discharge (cfs/m3s)', 'River Gauge Stages', 'Water Quality'],
    description: 'Catatan jangka panjang muka air tanah, debit aliran sungai, dan pemantauan hidrologi terestrial.',
    adaptationValue: 'Menilai ketersediaan cadangan air irigasi, mendeteksi stres hidrologis DAS, dan kalibrasi kelembapan tanah satelit.',
    terraShaftRole: 'Indikator acuan kapasitas air irigasi suplemen pada Daerah Aliran Sungai (DAS) untuk mencegah kekeringan parah.',
    statusBadge: 'Calibrated Reference',
    officialUrl: 'https://waterdata.usgs.gov/nwis'
  }
];

export default function NasaChallengeResources() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'Semua Dataset', count: NASA_CHALLENGE_DATASETS.length },
    {
      id: 'nasa-satellites',
      label: 'Satelit NASA',
      count: NASA_CHALLENGE_DATASETS.filter((d) => d.category === 'nasa-satellites').length
    },
    {
      id: 'space-partners',
      label: 'Mitra Antariksa (ESA & ECMWF)',
      count: NASA_CHALLENGE_DATASETS.filter((d) => d.category === 'space-partners').length
    },
    {
      id: 'usda-usgs',
      label: 'USDA & USGS Lahan/Tanah',
      count: NASA_CHALLENGE_DATASETS.filter((d) => d.category === 'usda-usgs').length
    },
    {
      id: 'climate-reanalysis',
      label: 'Iklim & Global Normals',
      count: NASA_CHALLENGE_DATASETS.filter((d) => d.category === 'climate-reanalysis').length
    }
  ];

  const filteredDatasets = useMemo(() => {
    return NASA_CHALLENGE_DATASETS.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.acronym.toLowerCase().includes(q) ||
        item.agency.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.adaptationValue.toLowerCase().includes(q) ||
        item.terraShaftRole.toLowerCase().includes(q) ||
        item.variables.some((v) => v.toLowerCase().includes(q))
      );
    });
  }, [activeCategory, searchQuery]);

  const getStatusColor = (status: ChallengeDataset['statusBadge']) => {
    switch (status) {
      case 'Active API':
        return 'bg-[#163A40] text-[#00C2CC] border-[#00C2CC]/30';
      case 'Integrated Bio-Model':
        return 'bg-[#1C2C3A] text-[#38BDF8] border-[#38BDF8]/30';
      case 'RAG Knowledge Base':
        return 'bg-[#2A2338] text-[#C084FC] border-[#C084FC]/30';
      case 'Calibrated Reference':
      default:
        return 'bg-[#20242B] text-[#A6AFB8] border-[#2C313A]';
    }
  };

  return (
    <div className="flex flex-col gap-6 text-[#F1F3F5]">
      {/* Official Challenge Header Banner */}
      <div className="p-6 rounded-[4px] bg-gradient-to-r from-[#121721] via-[#161D2A] to-[#121620] border border-[#263347] flex flex-col gap-4 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-[3px] bg-[#00C2CC]/10 text-[#00C2CC] border border-[#00C2CC]/30 font-mono text-xs font-semibold uppercase tracking-wider">
              NASA Space Apps Challenge 2026
            </span>
            <span className="text-xs text-[#8A949E] hidden sm:inline">·</span>
            <span className="text-xs font-mono text-[#8A949E]">Challenge: Adapting Farms with NASA Data</span>
          </div>

          <a
            href="https://www.spaceappschallenge.org/2026/challenges/adapting-farms-with-nasa-data/?tab=resources"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#00C2CC] hover:underline"
          >
            <span>Buka Resources Resmi NASA</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Satellite className="w-6 h-6 text-[#00C2CC] shrink-0" />
            <span>Katalog Sumber Data Observasi Bumi & Ekosistem Mitra</span>
          </h1>
          <p className="mt-2 text-sm text-[#9BA3AE] leading-relaxed max-w-4xl">
            Arsitektur data lengkap TerraShaft yang mengintegrasikan 24 dataset resmi tantangan NASA Space Apps 2026:
            mulai dari observasi satelit perakaran SMAP, presipitasi GPM IMERG, indeks multispektral Landsat dan Sentinel-2,
            hingga model tanah SSURGO/SoilGrids dan neraca agroklimat FAO GAEZ.
          </p>
        </div>

        {/* Verbatim NASA Disclaimer Notice as Required */}
        <div className="p-3.5 rounded-[4px] bg-[#0A0D13]/80 border border-[#212B3B] text-[11.5px] text-[#7E8B9E] leading-relaxed flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#8A949E] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#A6AFB8]">Official NASA Data Notice: </span>
            NASA does not endorse any non-U.S. Government entity and is not responsible for information contained on
            non-U.S. Government websites. For non-U.S. Government websites, participants must comply with any data use
            parameters of that specific website.
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#16191E] border border-[#2C313A] p-3 rounded-[4px]">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCategory(c.id)}
              className={`px-3 py-1.5 rounded-[3px] text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeCategory === c.id
                  ? 'bg-[#00C2CC] text-[#121417] font-semibold'
                  : 'bg-[#20242B] text-[#A6AFB8] hover:text-white hover:bg-[#282E37]'
              }`}
            >
              <span>{c.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeCategory === c.id ? 'bg-[#121417]/20 text-[#121417]' : 'bg-[#16191E] text-[#8A949E]'
                }`}
              >
                {c.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-[#8A949E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari dataset, sensor, atau variabel..."
            className="w-full bg-[#20242B] border border-[#2C313A] rounded-[3px] pl-9 pr-3 py-1.5 text-xs text-[#F1F3F5] placeholder-[#6C757D] focus:outline-none focus:border-[#00C2CC]"
          />
        </div>
      </div>

      {/* Datasets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredDatasets.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-[4px] bg-[#16191E] border border-[#2C313A] hover:border-[#384252] transition-colors flex flex-col justify-between gap-4 shadow-sm"
          >
            <div className="flex flex-col gap-3">
              {/* Header row: Acronym + Agency + Status */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-white tracking-wide">
                      {item.acronym}
                    </span>
                    <span className="text-xs text-[#8A949E]">·</span>
                    <span className="text-xs font-medium text-[#C1C7CD]">{item.agency}</span>
                  </div>
                  <h3 className="text-[13.5px] font-semibold text-[#00C2CC] mt-0.5">{item.name}</h3>
                </div>

                <span className={`px-2 py-0.5 rounded-[3px] border font-mono text-[10.5px] shrink-0 ${getStatusColor(item.statusBadge)}`}>
                  {item.statusBadge}
                </span>
              </div>

              {/* Technical Specifications Pills */}
              <div className="flex flex-wrap gap-2 text-[11px] font-mono text-[#8A949E]">
                <span className="bg-[#20242B] px-2 py-0.5 rounded-[2px] border border-[#2C313A]">
                  Res: <span className="text-[#F1F3F5]">{item.resolution}</span>
                </span>
                <span className="bg-[#20242B] px-2 py-0.5 rounded-[2px] border border-[#2C313A]">
                  Frekuensi: <span className="text-[#F1F3F5]">{item.frequency}</span>
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-[#9BA3AE] leading-relaxed">
                {item.description}
              </p>

              {/* Variables */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {item.variables.map((v, idx) => (
                  <span
                    key={idx}
                    className="text-[10.5px] font-mono px-2 py-0.5 rounded-[2px] bg-[#20242B] border border-[#2A313C] text-[#C1C7CD]"
                  >
                    {v}
                  </span>
                ))}
              </div>

              {/* Adaptation Value Callout */}
              <div className="p-3 rounded-[3px] bg-[#20242B]/80 border border-[#282F3A] flex flex-col gap-1 text-[11.5px]">
                <div className="flex items-center gap-1.5 font-medium text-[#F1F3F5]">
                  <Sprout className="w-3.5 h-3.5 text-[#00C2CC]" />
                  <span>Nilai Adaptasi Pertanian:</span>
                </div>
                <p className="text-[#9BA3AE] leading-relaxed">
                  {item.adaptationValue}
                </p>
              </div>

              {/* Integration in TerraShaft */}
              <div className="p-3 rounded-[3px] bg-[#12161E] border border-[#1F2735] flex flex-col gap-1 text-[11.5px]">
                <div className="flex items-center gap-1.5 font-medium text-[#38BDF8]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Implementasi di TerraShaft:</span>
                </div>
                <p className="text-[#A6AFB8] leading-relaxed">
                  {item.terraShaftRole}
                </p>
              </div>
            </div>

            {/* Footer with link */}
            <div className="pt-3 border-t border-[#262C36] flex items-center justify-between text-xs">
              <span className="font-mono text-[11px] text-[#6C757D]">
                Kategori: {item.agencyCategory}
              </span>

              <a
                href={item.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00C2CC] hover:text-[#33D4DC] flex items-center gap-1 font-medium transition-colors"
              >
                <span>Dokumentasi Resmi</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {filteredDatasets.length === 0 && (
        <div className="p-12 text-center bg-[#16191E] border border-[#2C313A] rounded-[4px] text-xs text-[#8A949E]">
          Tidak ditemukan dataset yang cocok dengan kata kunci &quot;{searchQuery}&quot;. Coba gunakan kata kunci lain seperti &quot;smap&quot;, &quot;hujan&quot;, &quot;tanah&quot;, atau &quot;et&quot;.
        </div>
      )}
    </div>
  );
}
