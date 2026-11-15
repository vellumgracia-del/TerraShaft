'use client';

import React, { useState, useMemo } from 'react';
import {
  Satellite,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  Globe,
  Sprout,
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';

export type DatasetDomainGroup = 'soil' | 'weather' | 'crop-land' | 'water-topo' | 'agri-econ';
export type GeographicProfile = 'global-core' | 'indonesia-profile' | 'standard-baseline';

export interface ChallengeDataset {
  id: string;
  name: string;
  acronym: string;
  agency: string;
  agencyCategory: 'NASA' | 'ESA' | 'USDA' | 'ECMWF' | 'FAO' | 'ISRIC' | 'BRIN / Kementan';
  category: 'nasa-satellites' | 'space-partners' | 'usda-usgs' | 'climate-reanalysis' | 'soil-institutes' | 'national-agronomy';
  domainGroup: DatasetDomainGroup;
  geographicProfile: GeographicProfile;
  geographicScopeNote: string;
  isCoreBaseline: boolean;
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
  // 1. Live Telemetry & Earth Observation Satellites
  {
    id: 'nasa-power',
    name: 'NASA POWER Agroclimatology & Solar Radiation',
    acronym: 'NASA POWER',
    agency: 'NASA Langley Research Center (LaRC)',
    agencyCategory: 'NASA',
    category: 'climate-reanalysis',
    domainGroup: 'weather',
    geographicProfile: 'global-core',
    geographicScopeNote: 'Global & Indonesia: Suhu harian (T2M, T2M_MAX, T2M_MIN), radiasi surya (ALLSKY_SFC_SW_DWN), dan presipitasi live per koordinat.',
    isCoreBaseline: true,
    resolution: '0.5° x 0.5° (~50 km)',
    frequency: 'Harian & Baseline Historis (Active On-Demand REST API)',
    variables: ['Solar Radiation (ALLSKY_SFC_SW_DWN)', 'T2M (Min/Max/Mean)', 'PRECTOTCORR', 'GWETROOT'],
    description: 'Kumpulan data surya, meteorologi, dan klimatologi global yang dioptimalkan untuk riset dan aplikasi pertanian terintegrasi.',
    adaptationValue: 'Menghitung penggunaan air tanaman, kondisi musim tanam, risiko suhu ekstrem, dan kesesuaian iklim komoditas rotasi.',
    terraShaftRole: 'Sumber telemetri iklim utama yang menghitung laju ET0 harian metode Hargreaves-Samani (FAO-56) secara langsung per koordinat petak.',
    statusBadge: 'Active API',
    officialUrl: 'https://power.larc.nasa.gov/'
  },
  {
    id: 'nasa-smap',
    name: 'Soil Moisture Active Passive (SMAP L4)',
    acronym: 'SMAP L4 GWETROOT',
    agency: 'NASA JPL & GSFC',
    agencyCategory: 'NASA',
    category: 'nasa-satellites',
    domainGroup: 'soil',
    geographicProfile: 'global-core',
    geographicScopeNote: 'Global & Indonesia: Estimasi kelembapan zona perakaran 0–100 cm berbasis asimilasi model L4 NASA.',
    isCoreBaseline: true,
    resolution: '9 km / 36 km (L4 root-zone model)',
    frequency: '2–3 hari (Live parameter GWETROOT via NASA POWER API)',
    variables: ['Surface Soil Moisture (0-5 cm)', 'Root-Zone Soil Wetness (0-100 cm)', 'Freeze/Thaw State'],
    description: 'Menyediakan estimasi global kelembapan tanah zona perakaran tanaman melalui asimilasi data observasi satelit NASA dan model transfer daratan.',
    adaptationValue: 'Mengidentifikasi cekaman kekeringan dini sebelum daun layu, ketersediaan air perakaran, potensi infiltrasi, dan evaluasi tanaman rotasi hemat air.',
    terraShaftRole: 'Indikator kelembapan zona perakaran pada Baterai Tanah dan ambang batas peringatan dini defisit air di sistem optimasi 4 musim.',
    statusBadge: 'Active API',
    officialUrl: 'https://smap.jpl.nasa.gov/'
  },
  {
    id: 'isric-soilgrids',
    name: 'ISRIC SoilGrids v2.0 Global Soil Mapping',
    acronym: 'SoilGrids v2.0',
    agency: 'ISRIC - World Soil Information',
    agencyCategory: 'ISRIC',
    category: 'soil-institutes',
    domainGroup: 'soil',
    geographicProfile: 'global-core',
    geographicScopeNote: 'Global & Indonesia: Fraksi pasir, debu, liat, SOC, pH, dan CEC kedalaman 0–30 cm.',
    isCoreBaseline: true,
    resolution: '250 meter',
    frequency: 'Active On-Demand REST API (Cache 30 Hari)',
    variables: ['Clay Fraction (%)', 'Sand Fraction (%)', 'Silt Fraction (%)', 'SOC (g/kg)', 'pH H2O', 'CEC (cmol/kg)'],
    description: 'Sistem pemetaan digital tanah global berbasis machine learning yang mengintegrasikan puluhan ribu profil tanah terestrial.',
    adaptationValue: 'Menentukan kapasitas retensi lengas tanah, kerentanan retak Vertisol, ketersediaan hara, dan batas kritis aerasi akar.',
    terraShaftRole: 'Penyedia sifat fisik/kimia tanah utama (0–30 cm) yang diolah fungsi pedotransfer untuk menghitung kapasitas simpan air (AWC).',
    statusBadge: 'Active API',
    officialUrl: 'https://www.isric.org/explore/soilgrids'
  },
  {
    id: 'nasa-gpm-imerg',
    name: 'Global Precipitation Measurement & IMERG',
    acronym: 'GPM IMERG',
    agency: 'NASA GSFC & JAXA',
    agencyCategory: 'NASA',
    category: 'nasa-satellites',
    domainGroup: 'weather',
    geographicProfile: 'global-core',
    geographicScopeNote: 'Global & Indonesia: Akumulasi hujan dan deteksi presipitasi ekstrem resolusi 0.1° (~10 km).',
    isCoreBaseline: true,
    resolution: '0.1° (~10 km)',
    frequency: 'Harian / Akumulasi Bulanan (Terintegrasi via PRECTOTCORR)',
    variables: ['Precipitation Rate (mm/jam)', 'Accumulated Rainfall (mm)', 'Storm Frequency'],
    description: 'Konstelasi satelit internasional untuk estimasi laju dan akumulasi presipitasi global resolusi tinggi.',
    adaptationValue: 'Menilai keandalan curah hujan, frekuensi badai ekstrem pemicu erosi tanah, dan tren jangka panjang masukan lengas tanah.',
    terraShaftRole: 'Perhitungan water budget input (P) pada modul Neraca Air dan analisis risiko erosi pada periode peralihan musim.',
    statusBadge: 'Active API',
    officialUrl: 'https://gpm.nasa.gov/data/imerg'
  },
  {
    id: 'nasa-srtm',
    name: 'Shuttle Radar Topography Mission DEM',
    acronym: 'SRTM DEM',
    agency: 'NASA & NGA',
    agencyCategory: 'NASA',
    category: 'nasa-satellites',
    domainGroup: 'water-topo',
    geographicProfile: 'global-core',
    geographicScopeNote: 'Global & Indonesia: Topografi 30m global untuk analisis lereng, limpasan, dan risiko erosi.',
    isCoreBaseline: true,
    resolution: '1 arc-second (~30 meter)',
    frequency: 'Model Topografi Global Terstandarisasi',
    variables: ['Elevation (m)', 'Slope Gradient (%)', 'Aspect', 'Flow Accumulation'],
    description: 'Model elevasi digital global berbasis radar interferometrik untuk analisis geomorfologi dan topografi permukaan bumi.',
    adaptationValue: 'Menganalisis kemiringan lereng, aliran limpasan permukaan (runoff), risiko erosi, dan penataan stabilisasi tanah miring.',
    terraShaftRole: 'Deteksi elevasi lahan otomatis via endpoint /api/geocode (DEM publik SRTM/Copernicus) serta panduan tanaman konservasi penahan erosi.',
    statusBadge: 'Integrated Bio-Model',
    officialUrl: 'https://www.earthdata.nasa.gov/sensors/srtm'
  },
  {
    id: 'nasa-landsat-modis-viirs',
    name: 'Landsat & MODIS / VIIRS Vegetation Indices',
    acronym: 'Landsat · MODIS/VIIRS',
    agency: 'NASA & USGS EROS',
    agencyCategory: 'NASA',
    category: 'nasa-satellites',
    domainGroup: 'crop-land',
    geographicProfile: 'global-core',
    geographicScopeNote: 'Global & Indonesia: Landsat 30m untuk detail spasial, MODIS/VIIRS untuk dinamika temporal harian.',
    isCoreBaseline: true,
    resolution: '30m (Landsat) · 250m–1km (MODIS/VIIRS)',
    frequency: 'Harian (MODIS) / 8–16 hari (Landsat)',
    variables: ['Surface Reflectance', 'NDVI (Normalized Difference Veg Index)', 'EVI', 'Bare Ground Windows'],
    description: 'Reflektansi permukaan terkoreksi atmosfer dan indeks vegetasi untuk memantau biomassa dan kesehatan kanopi.',
    adaptationValue: 'Memetakan vigor tanaman, mendeteksi transisi musiman, mengidentifikasi lahan bera tanpa tutupan, dan membandingkan opsi rotasi visual.',
    terraShaftRole: 'Referensi indeks vegetasi untuk visualisasi GIS Explorer, deteksi fase bera, dan kalibrasi parameter koefisien tanaman (Kc).',
    statusBadge: 'Integrated Bio-Model',
    officialUrl: 'https://landsat.gsfc.nasa.gov/'
  },
  {
    id: 'esa-sentinel2',
    name: 'Copernicus Sentinel-2 Multispectral Mission',
    acronym: 'Sentinel-2',
    agency: 'European Space Agency (ESA)',
    agencyCategory: 'ESA',
    category: 'space-partners',
    domainGroup: 'crop-land',
    geographicProfile: 'global-core',
    geographicScopeNote: 'Global & Indonesia: Referensi citra optik 10m untuk delineasi batas petak lahan (AOI) dan pemantauan kanopi.',
    isCoreBaseline: true,
    resolution: '10m / 20m / 60m',
    frequency: '5 hari (Konstelasi 2A/2B)',
    variables: ['13 Spectral Bands', 'Red-Edge Chlorophyll Bands', 'SWIR Moisture Bands', 'NDWI'],
    description: 'Citra optik multispektral bebas akses beresolusi spasial tinggi dengan pita khusus analisis status vegetasi dan lengas daun.',
    adaptationValue: 'Memetakan indeks klorofil kanopi, deteksi dini klorosis hara, batas kepemilikan petak mikro petani, dan monitoring lahan bera.',
    terraShaftRole: 'Referensi citra optik resolusi tinggi (10m) pendamping basemap satelit untuk delineasi visual batas petak lahan (AOI) dan pemantauan kanopi.',
    statusBadge: 'Integrated Bio-Model',
    officialUrl: 'https://sentinels.copernicus.eu/web/sentinel/missions/sentinel-2'
  },
  {
    id: 'ecmwf-era5-gldas',
    name: 'GLDAS & ECMWF ERA5 Land Surface Reanalysis',
    acronym: 'GLDAS · ERA5',
    agency: 'NASA GSFC & ECMWF',
    agencyCategory: 'ECMWF',
    category: 'climate-reanalysis',
    domainGroup: 'weather',
    geographicProfile: 'global-core',
    geographicScopeNote: 'Global & Indonesia: Reanalisis atmosfer dan transfer energi daratan kontinu.',
    isCoreBaseline: true,
    resolution: '0.25° (GLDAS) / 31 km (ERA5)',
    frequency: 'Sub-harian hingga Harian Kontinu',
    variables: ['Hourly Temperature', 'Layered Soil Moisture', 'Relative Humidity', 'Solar Radiation', 'ET Fluxes'],
    description: 'Menggabungkan model transfer massa-energi permukaan bumi kontinu dengan miliaran observasi in-situ dan satelit.',
    adaptationValue: 'Mengisi celah kekosongan data stasiun cuaca terestrial lokal, analisis tren iklim jangka panjang, dan fitur deret waktu.',
    terraShaftRole: 'Validasi kontinuitas cuaca jam-jaman dan kalibrasi cadangan parameter suhu tanah multi-kedalaman.',
    statusBadge: 'Calibrated Reference',
    officialUrl: 'https://ldas.gsfc.nasa.gov/'
  },

  // 2. Indonesia Regional & Dryland Agroforestry Enhancement
  {
    id: 'fao-gaez',
    name: 'FAO Global Agro-Ecological Zones (GAEZ v4) & FAO-56',
    acronym: 'FAO GAEZ v4',
    agency: 'FAO & IIASA',
    agencyCategory: 'FAO',
    category: 'climate-reanalysis',
    domainGroup: 'agri-econ',
    geographicProfile: 'indonesia-profile',
    geographicScopeNote: 'Global & Indonesia: Zonasi agro-ekologis dan kesesuaian biofisik lahan puluhan komoditas pangan.',
    isCoreBaseline: true,
    resolution: '5 arc-minute (~9 km)',
    frequency: 'Edisi Global v4 Terstandarisasi',
    variables: ['Agro-Climatic Crop Suitability', 'Soil Constraints (Salinity, Depth, Texture)', 'Potential Yield Indices', 'FAO-56 Dual Kc'],
    description: 'Model global penentuan zona agro-ekologis dan kesesuaian biofisik lahan untuk puluhan komoditas pangan dunia.',
    adaptationValue: 'Mengevaluasi apakah komoditas rotasi selaras dengan iklim dan tanah lokal dari perspektif agronomi global teruji.',
    terraShaftRole: 'Kriteria validasi agronomis pada modul Field Advisor AI dan formula kesesuaian rotasi tanaman di iklim semi-arid.',
    statusBadge: 'RAG Knowledge Base',
    officialUrl: 'https://gaez.fao.org/'
  },
  {
    id: 'nasa-ecostress',
    name: 'ECOSTRESS Thermal Infrared & Evapotranspiration',
    acronym: 'ECOSTRESS',
    agency: 'NASA JPL (ISS Payload)',
    agencyCategory: 'NASA',
    category: 'nasa-satellites',
    domainGroup: 'crop-land',
    geographicProfile: 'indonesia-profile',
    geographicScopeNote: 'Penguatan Indonesia: Deteksi hotspot panas dan stres air tanaman di wilayah tadah hujan (NTT, Madura).',
    isCoreBaseline: false,
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
    name: 'Global Ecosystem Dynamics Investigation (GEDI LiDAR)',
    acronym: 'GEDI LiDAR',
    agency: 'NASA & University of Maryland',
    agencyCategory: 'NASA',
    category: 'nasa-satellites',
    domainGroup: 'crop-land',
    geographicProfile: 'indonesia-profile',
    geographicScopeNote: 'Penguatan Indonesia: Struktur vertikal kanopi LiDAR untuk agroforestri dan perkebunan pohon pelindung.',
    isCoreBaseline: false,
    resolution: '25 meter footprint LiDAR',
    frequency: 'Misi LiDAR ISS Terkalibrasi',
    variables: ['Canopy Height Profile', 'Leaf Area Index (LAI)', 'Above-Ground Biomass Density (AGBD)'],
    description: 'Pengukuran struktur kanopi dan biomassa berbasis laser altimeter berpresisi tinggi dari Stasiun Luar Angkasa.',
    adaptationValue: 'Memahami kerapatan vegetasi, cekaman kanopi, dan perubahan biomassa jangka panjang di lanskap sekitar lahan budidaya.',
    terraShaftRole: 'Penilaian integrasi pohon pelindung (agroforestri) penahan angin kering dan estimasi sekuestrasi karbon residu biomassa.',
    statusBadge: 'RAG Knowledge Base',
    officialUrl: 'https://gedi.umd.edu/'
  },
  {
    id: 'brin-kementan',
    name: 'Riset Agronomi Tropis & Juknis Varietas BRIN / Kementan',
    acronym: 'BRIN · Balittanah',
    agency: 'BRIN & Kementerian Pertanian Republik Indonesia',
    agencyCategory: 'BRIN / Kementan',
    category: 'national-agronomy',
    domainGroup: 'agri-econ',
    geographicProfile: 'indonesia-profile',
    geographicScopeNote: 'Penguatan Indonesia: Panduan budidaya varietas adaptif iklim kering dan pengelolaan tanah Vertisol.',
    isCoreBaseline: false,
    resolution: 'Uji Multilokasi & Rekomendasi Balai Riset',
    frequency: 'Monograf Resmi & Panduan Teknis Mutakhir',
    variables: ['Kebutuhan Lengas Varietas', 'Penambatan N2 Simbiotik', 'Ameliorasi Kapur & Bahan Organik', 'Toleransi Kekeringan'],
    description: 'Basis pengetahuan ilmiah nasional mengenai tanaman pangan palawija toleran kekeringan dan manajemen tanah tropis sub-optimal.',
    adaptationValue: 'Menyediakan parameter spesifik varietas lokal (Sorgum Bioguma, Kedelai Anjasmoro, Kacang Hijau Vima, Jagung Bisi, Orok-orok) yang realistis di tingkat petani.',
    terraShaftRole: 'Rujukan agronomi utama pada mesin optimasi rotasi 4 musim dan RAG knowledge base asisten Field Advisor AI.',
    statusBadge: 'RAG Knowledge Base',
    officialUrl: 'https://brin.go.id/'
  },

  // 3. Calibrated Standard Benchmark
  {
    id: 'usda-ssurgo',
    name: 'USDA NRCS SSURGO / STATSGO2 Soil Pedotransfer Baseline',
    acronym: 'SSURGO · STATSGO2',
    agency: 'USDA Natural Resources Conservation Service',
    agencyCategory: 'USDA',
    category: 'usda-usgs',
    domainGroup: 'soil',
    geographicProfile: 'standard-baseline',
    geographicScopeNote: 'Standar Kalibrasi: Klasifikasi Segitiga Tekstur Tanah USDA & hubungan empiris tekstur–retensi air (AWC).',
    isCoreBaseline: false,
    resolution: 'Field-scale (SSURGO) · Regional (STATSGO2)',
    frequency: 'Database Terkalibrasi Berkelanjutan',
    variables: ['Soil Texture Fractions', 'Organic Matter (SOC %)', 'Available Water Capacity (AWC)', 'Hydrologic Soil Group'],
    description: 'Standar database atribut fisik dan hidrologi tanah terinci yang mendasari formulasi hubungan tekstur-retensi air.',
    adaptationValue: 'Menyediakan dasar perhitungan matematis untuk memprediksi kapasitas simpan air (AWC) dan dinamika aerasi tanah.',
    terraShaftRole: 'Standar klasifikasi Segitiga Tekstur Tanah USDA dan hubungan empiris tekstur–retensi air yang mendasari fungsi pedotransfer kalkulasi Available Water Capacity (AWC).',
    statusBadge: 'Calibrated Reference',
    officialUrl: 'https://www.nrcs.usda.gov/resources/data-and-tech/soil-survey-geographic-database-ssurgo'
  }
];

export default function NasaChallengeResources() {
  const [activeProfile, setActiveProfile] = useState<'all' | 'global-core' | 'indonesia' | 'standard-baseline'>('all');
  const [activeGroup, setActiveGroup] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const domainGroups = [
    { id: 'all', label: 'Semua Domain', count: NASA_CHALLENGE_DATASETS.length },
    {
      id: 'soil',
      label: 'Kondisi Tanah',
      count: NASA_CHALLENGE_DATASETS.filter((d) => d.domainGroup === 'soil').length
    },
    {
      id: 'weather',
      label: 'Cuaca & Iklim',
      count: NASA_CHALLENGE_DATASETS.filter((d) => d.domainGroup === 'weather').length
    },
    {
      id: 'crop-land',
      label: 'Tanaman & Lahan',
      count: NASA_CHALLENGE_DATASETS.filter((d) => d.domainGroup === 'crop-land').length
    },
    {
      id: 'water-topo',
      label: 'Air & Topografi',
      count: NASA_CHALLENGE_DATASETS.filter((d) => d.domainGroup === 'water-topo').length
    },
    {
      id: 'agri-econ',
      label: 'Kelayakan & Ekonomi',
      count: NASA_CHALLENGE_DATASETS.filter((d) => d.domainGroup === 'agri-econ').length
    }
  ];

  const profilePills: Array<{
    id: 'all' | 'global-core' | 'indonesia' | 'standard-baseline';
    label: string;
    count: number;
  }> = [
    { id: 'all', label: 'Semua (13 Dataset)', count: NASA_CHALLENGE_DATASETS.length },
    {
      id: 'global-core',
      label: 'Global Core (Wajib & Aktif)',
      count: NASA_CHALLENGE_DATASETS.filter((d) => d.geographicProfile === 'global-core').length
    },
    {
      id: 'indonesia',
      label: 'Penguatan Indonesia (+ ECOSTRESS, GEDI, BRIN)',
      count: NASA_CHALLENGE_DATASETS.filter(
        (d) => d.geographicProfile === 'global-core' || d.geographicProfile === 'indonesia-profile'
      ).length
    },
    {
      id: 'standard-baseline',
      label: 'Standar Kalibrasi (USDA Baseline)',
      count: NASA_CHALLENGE_DATASETS.filter((d) => d.geographicProfile === 'standard-baseline').length
    }
  ];

  const filteredDatasets = useMemo(() => {
    return NASA_CHALLENGE_DATASETS.filter((item) => {
      // Profile Filter
      if (activeProfile === 'global-core' && item.geographicProfile !== 'global-core') {
        return false;
      }
      if (
        activeProfile === 'indonesia' &&
        item.geographicProfile !== 'global-core' &&
        item.geographicProfile !== 'indonesia-profile'
      ) {
        return false;
      }
      if (activeProfile === 'standard-baseline' && item.geographicProfile !== 'standard-baseline') {
        return false;
      }

      // Domain Group Filter
      const matchesGroup = activeGroup === 'all' || item.domainGroup === activeGroup;
      if (!matchesGroup) return false;

      // Text Search
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
  }, [activeProfile, activeGroup, searchQuery]);

  const getStatusBadge = (status: ChallengeDataset['statusBadge']) => {
    switch (status) {
      case 'Active API':
        return {
          label: 'ACTIVE API',
          style: 'bg-[#122822] text-[#2DD4BF] border-[#2DD4BF]/40 font-semibold'
        };
      case 'Integrated Bio-Model':
        return {
          label: 'INTEGRATED BIO-MODEL',
          style: 'bg-[#182338] text-[#38BDF8] border-[#38BDF8]/40 font-semibold'
        };
      case 'RAG Knowledge Base':
        return {
          label: 'RAG KNOWLEDGE BASE',
          style: 'bg-[#291B33] text-[#C084FC] border-[#C084FC]/40 font-semibold'
        };
      case 'Calibrated Reference':
        return {
          label: 'CALIBRATED REFERENCE',
          style: 'bg-[#252528] text-[#D1D5DB] border-[#9CA3AF]/30 font-medium'
        };
    }
  };

  const getProfileBadge = (profile: GeographicProfile) => {
    switch (profile) {
      case 'global-core':
        return {
          label: 'GLOBAL CORE',
          style: 'bg-[#163A40] text-[#00C2CC] border-[#00C2CC]/40 font-semibold'
        };
      case 'indonesia-profile':
        return {
          label: 'INDONESIA FIT',
          style: 'bg-[#133324] text-[#34D399] border-[#34D399]/40 font-semibold'
        };
      case 'standard-baseline':
        return {
          label: 'STANDAR ACUAN',
          style: 'bg-[#252836] text-[#A5B4FC] border-[#A5B4FC]/30'
        };
    }
  };

  const getDomainLabel = (group: DatasetDomainGroup) => {
    switch (group) {
      case 'soil':
        return 'Kondisi Tanah';
      case 'weather':
        return 'Cuaca & Iklim';
      case 'crop-land':
        return 'Tanaman & Lahan';
      case 'water-topo':
        return 'Air & Topografi';
      case 'agri-econ':
        return 'Kelayakan & Ekonomi';
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
            <span>Katalog Sumber Data Observasi Bumi & Ekosistem Terverifikasi</span>
          </h1>
          <p className="mt-2 text-sm text-[#9BA3AE] leading-relaxed max-w-4xl">
            Arsitektur data teroptimasi TerraShaft yang berfokus pada 13 dataset aktif dan terverifikasi untuk adaptasi iklim pertanian:
            mulai dari telemetri live NASA POWER & ISRIC SoilGrids, observasi perakaran SMAP L4, presipitasi GPM IMERG, indeks multispektral Landsat/Sentinel-2,
            hingga riset agronomi lahan kering BRIN/Balittanah.
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

      {/* Geographic Profiling & Dataset Optimization Callout */}
      <div className="p-5 rounded-[4px] bg-[#16191E] border border-[#2C313A] flex flex-col gap-3.5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#242831] pb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#00C2CC]" />
            <h2 className="text-sm font-semibold text-white tracking-tight">
              Arsitektur Profil Wilayah: Global Core, Penguatan Indonesia, & Standar Kalibrasi
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 bg-[#20242B] p-1 rounded-[3px] border border-[#2C313A]">
            {profilePills.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveProfile(p.id)}
                className={`px-2.5 py-1 rounded-[2px] text-[11px] font-medium transition-all ${
                  activeProfile === p.id
                    ? 'bg-[#00C2CC] text-[#121417] font-semibold shadow-xs'
                    : 'text-[#A6AFB8] hover:text-white'
                }`}
              >
                <span>{p.label}</span>
                <span className={`ml-1 text-[10px] font-mono px-1 py-0.2 rounded-full ${
                  activeProfile === p.id ? 'bg-[#121417]/20 text-[#121417]' : 'bg-[#16191E] text-[#8A949E]'
                }`}>
                  {p.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs leading-relaxed">
          <div className="p-3 rounded-[3px] bg-[#12161E] border border-[#202735] flex flex-col gap-1.5">
            <span className="font-semibold text-[#00C2CC] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00C2CC]" />
              1. Global Core (Universal & Aktif)
            </span>
            <p className="text-[#8A949E]">
              Selalu aktif di semua lokasi dunia termasuk Indonesia: NASA POWER, SMAP L4, ISRIC SoilGrids, GPM IMERG, Landsat & MODIS/VIIRS, Sentinel-2, SRTM DEM, dan GLDAS/ERA5.
            </p>
          </div>
          <div className="p-3 rounded-[3px] bg-[#12161E] border border-[#202735] flex flex-col gap-1.5">
            <span className="font-semibold text-[#34D399] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#34D399]" />
              2. Penguatan Indonesia
            </span>
            <p className="text-[#8A949E]">
              Global Core ditambah ECOSTRESS (deteksi hotspot suhu & stres air di wilayah semi-arid NTT/Madura), GEDI (kanopi agroforestri), FAO GAEZ, serta riset agronomi BRIN/Balittanah.
            </p>
          </div>
          <div className="p-3 rounded-[3px] bg-[#12161E] border border-[#202735] flex flex-col gap-1.5">
            <span className="font-semibold text-[#A5B4FC] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#A5B4FC]" />
              3. Standar Kalibrasi Baku
            </span>
            <p className="text-[#8A949E]">
              Formula pedotransfer Saxton-Rawls berbasis database USDA SSURGO untuk menghitung AWC tanah dan fallback terkalibrasi CONUS. Dataset regional non-aktif telah dieliminasi.
            </p>
          </div>
        </div>
      </div>

      {/* Domain Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#16191E] border border-[#2C313A] p-3 rounded-[4px]">
        {/* Domain Group Pills */}
        <div className="flex flex-wrap items-center gap-1">
          {domainGroups.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setActiveGroup(g.id)}
              className={`px-3 py-1.5 rounded-[3px] text-xs font-medium transition-all ${
                activeGroup === g.id
                  ? 'bg-[#00C2CC] text-[#121417] font-semibold shadow-xs'
                  : 'bg-[#20242B] text-[#A6AFB8] hover:text-white border border-[#2C313A]'
              }`}
            >
              <span>{g.label}</span>
              <span className={`ml-1.5 text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                activeGroup === g.id ? 'bg-[#121417]/20 text-[#121417]' : 'bg-[#16191E] text-[#8A949E]'
              }`}>
                {g.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-[#8A949E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari dataset, parameter, atau agensi..."
            className="w-full pl-9 pr-3 py-1.5 rounded-[3px] bg-[#12161E] border border-[#2C313A] text-xs text-[#F1F3F5] placeholder-[#6C757D] focus:border-[#00C2CC] focus:outline-none font-mono"
          />
        </div>
      </div>

      {/* Dataset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDatasets.map((item) => {
          const statusBadge = getStatusBadge(item.statusBadge);
          const profileBadge = getProfileBadge(item.geographicProfile);

          return (
            <div
              key={item.id}
              className="p-5 rounded-[4px] bg-[#16191E] border border-[#2C313A] hover:border-[#3E4552] flex flex-col justify-between gap-4 transition-all hover:shadow-lg relative group"
            >
              <div className="flex flex-col gap-3">
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#00C2CC]">
                        {item.acronym}
                      </span>
                      <span className="text-xs text-[#6C757D]">·</span>
                      <span className="text-xs text-[#8A949E] font-medium">
                        {item.agency}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-white tracking-tight leading-snug">
                      {item.name}
                    </h3>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-[2px] border ${statusBadge.style}`}>
                      {statusBadge.label}
                    </span>
                    <span className={`text-[9.5px] font-mono px-1.5 py-0.5 rounded-[2px] border ${profileBadge.style}`}>
                      {profileBadge.label}
                    </span>
                  </div>
                </div>

                {/* Scope Note */}
                <div className="p-2 rounded-[3px] bg-[#0F131A] border border-[#1F2735] text-[11px] font-mono text-[#00C2CC] flex items-center gap-1.5">
                  <Globe className="w-3 h-3 shrink-0" />
                  <span>{item.geographicScopeNote}</span>
                </div>

                {/* Description */}
                <p className="text-xs text-[#9BA3AE] leading-relaxed">
                  {item.description}
                </p>

                {/* Resolution & Frequency */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-[#12161E] p-2.5 rounded-[3px] border border-[#202530]">
                  <div>
                    <span className="text-[#6C757D] block text-[10px] uppercase tracking-wider">Resolusi Spasial</span>
                    <span className="text-[#D0D7DE] font-semibold">{item.resolution}</span>
                  </div>
                  <div>
                    <span className="text-[#6C757D] block text-[10px] uppercase tracking-wider">Frekuensi Pembaruan</span>
                    <span className="text-[#D0D7DE] font-semibold">{item.frequency}</span>
                  </div>
                </div>

                {/* Variables */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {item.variables.map((v, idx) => (
                    <span
                      key={idx}
                      className="text-[10.5px] font-mono px-2 py-0.5 rounded-[2px] bg-[#20242B] border border-[#2C313A] text-[#C1C7CD]"
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
                  Agensi: {item.agencyCategory}
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
          );
        })}
      </div>

      {filteredDatasets.length === 0 && (
        <div className="p-12 text-center bg-[#16191E] border border-[#2C313A] rounded-[4px] text-xs text-[#8A949E]">
          Tidak ditemukan dataset yang cocok dengan kata kunci &quot;{searchQuery}&quot;. Coba gunakan kata kunci lain seperti &quot;smap&quot;, &quot;hujan&quot;, &quot;tanah&quot;, atau &quot;et&quot;.
        </div>
      )}
    </div>
  );
}
