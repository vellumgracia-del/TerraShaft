'use client';

import React, { useState, useMemo } from 'react';
import {
  Satellite,
  ExternalLink,
  Search,
  CheckCircle2,
  Globe,
  Sprout,
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';

export type DatasetDomainGroup = 'soil' | 'weather' | 'crop-land' | 'water-topo' | 'agri-econ';
export type GeographicProfile = 'global-core' | 'indonesia-profile' | 'standard-baseline';
export type DatasetIntegrationStatus =
  | 'Live API'
  | 'Static Local Registry'
  | 'Knowledge Base'
  | 'Reference Standard'
  | 'Planned Integration';

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
  statusBadge: DatasetIntegrationStatus;
  officialUrl: string;
}

export const NASA_CHALLENGE_DATASETS: ChallengeDataset[] = [
  // 1. Live Telemetry APIs (Called directly via backend route handlers)
  {
    id: 'nasa-power',
    name: 'NASA POWER Agroclimatology & Solar Radiation',
    acronym: 'NASA POWER',
    agency: 'NASA Langley Research Center (LaRC)',
    agencyCategory: 'NASA',
    category: 'climate-reanalysis',
    domainGroup: 'weather',
    geographicProfile: 'global-core',
    geographicScopeNote: 'Global & Indonesia: Live REST API (/api/nasa-climate) for T2M, ALLSKY_SFC_SW_DWN, GWETROOT, and PRECTOTCORR.',
    isCoreBaseline: true,
    resolution: '0.5° x 0.5° (~50 km)',
    frequency: 'Daily & Historical Baseline (Live REST API)',
    variables: ['Solar Radiation (ALLSKY_SFC_SW_DWN)', 'T2M (Min/Max/Mean)', 'PRECTOTCORR', 'GWETROOT'],
    description: 'Kumpulan data surya, meteorologi, dan klimatologi global yang dioptimalkan untuk riset dan aplikasi pertanian terintegrasi.',
    adaptationValue: 'Menghitung penggunaan air tanaman, kondisi musim tanam, risiko suhu ekstrem, dan kesesuaian iklim komoditas rotasi.',
    terraShaftRole: 'Live API utama (/api/nasa-climate): menyediakan suhu harian, radiasi surya (ET0 Hargreaves-Samani), GWETROOT (indikator lengas akar), dan PRECTOTCORR (curah hujan).',
    statusBadge: 'Live API',
    officialUrl: 'https://power.larc.nasa.gov/'
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
    geographicScopeNote: 'Global & Indonesia: Live REST API (/api/soil-profile) untuk fraksi pasir, debu, liat, SOC, pH, dan CEC (0–30 cm).',
    isCoreBaseline: true,
    resolution: '250 meter',
    frequency: 'Live REST API (/api/soil-profile, Cache 30 Hari)',
    variables: ['Clay Fraction (%)', 'Sand Fraction (%)', 'Silt Fraction (%)', 'SOC (g/kg)', 'pH H2O', 'CEC (cmol/kg)'],
    description: 'Sistem pemetaan digital tanah global berbasis machine learning yang mengintegrasikan puluhan ribu profil tanah terestrial.',
    adaptationValue: 'Menentukan kapasitas retensi lengas tanah, kerentanan retak Vertisol, ketersediaan hara, dan batas kritis aerasi akar.',
    terraShaftRole: 'Live API (/api/soil-profile): mengambil sifat fisik/kimia tanah 0–30 cm untuk menghitung Available Water Capacity (AWC) dan klasifikasi tekstur USDA.',
    statusBadge: 'Live API',
    officialUrl: 'https://www.isric.org/explore/soilgrids'
  },
  {
    id: 'nasa-srtm',
    name: 'Shuttle Radar Topography Mission DEM (via Open-Meteo Elevation)',
    acronym: 'SRTM · Open-Meteo DEM',
    agency: 'NASA / NGA & Open-Meteo DEM',
    agencyCategory: 'NASA',
    category: 'nasa-satellites',
    domainGroup: 'water-topo',
    geographicProfile: 'global-core',
    geographicScopeNote: 'Global & Indonesia: Lookup elevasi titik koordinat via /api/geocode; analisis lereng & limpasan raster bersifat rencana.',
    isCoreBaseline: true,
    resolution: '~30–90 meter DEM',
    frequency: 'Live Point Elevation Lookup (/api/geocode)',
    variables: ['Elevation (m)', 'Slope Context (Planned)', 'Aspect (Planned)'],
    description: 'Model elevasi digital global berbasis radar interferometrik untuk penentuan ketinggian lokasi (sabuk elevasi dataran rendah/menengah/tinggi) pada zonasi AEZ.',
    adaptationValue: 'Menentukan sabuk elevasi lokasi pada pipeline AEZ dan menjadi acuan konteks topografi lereng.',
    terraShaftRole: 'Live API /api/geocode mengambil elevasi titik dari Open-Meteo Elevation (berbasis SRTM/Copernicus DEM) untuk zonasi agroekologi; analisis kemiringan lereng & runoff raster belum berjalan di runtime.',
    statusBadge: 'Live API',
    officialUrl: 'https://www.earthdata.nasa.gov/sensors/srtm'
  },
  {
    id: 'nasa-smap',
    name: 'Soil Moisture Active Passive (SMAP L4 Reference)',
    acronym: 'SMAP (via NASA POWER GWETROOT)',
    agency: 'NASA JPL & GSFC',
    agencyCategory: 'NASA',
    category: 'nasa-satellites',
    domainGroup: 'soil',
    geographicProfile: 'global-core',
    geographicScopeNote: 'Tidak memanggil direct SMAP API; runtime menggunakan parameter model-assimilated GWETROOT dari NASA POWER.',
    isCoreBaseline: true,
    resolution: '0.5° grid via NASA POWER (SMAP native 9 km Planned)',
    frequency: 'Direct SMAP Granule API: Planned Integration',
    variables: ['GWETROOT (NASA POWER Model-Assimilated)', 'Direct SMAP L4 9km (Planned)'],
    description: 'Referensi misi satelit kelembapan tanah NASA SMAP. Pada implementasi saat ini, TerraShaft tidak memiliki route API SMAP langsung.',
    adaptationValue: 'Menjadi rujukan konsep indikator lengas zona akar untuk peringatan dini stres air.',
    terraShaftRole: 'Di runtime, indikator kelembapan akar menggunakan NASA POWER GWETROOT (bukan direct SMAP API). Integrasi granule SMAP L4 9 km langsung adalah Planned Integration.',
    statusBadge: 'Planned Integration',
    officialUrl: 'https://smap.jpl.nasa.gov/'
  },
  {
    id: 'nasa-gpm-imerg',
    name: 'Global Precipitation Measurement & IMERG (Reference)',
    acronym: 'GPM IMERG (Planned Direct)',
    agency: 'NASA GSFC & JAXA',
    agencyCategory: 'NASA',
    category: 'nasa-satellites',
    domainGroup: 'weather',
    geographicProfile: 'global-core',
    geographicScopeNote: 'Tidak memanggil direct GPM/IMERG API; curah hujan runtime berasal dari parameter NASA POWER PRECTOTCORR.',
    isCoreBaseline: true,
    resolution: '0.5° via NASA POWER PRECTOTCORR (IMERG 0.1° Planned)',
    frequency: 'Direct GPM/IMERG API: Planned Integration',
    variables: ['PRECTOTCORR (NASA POWER Runtime)', 'Direct GPM IMERG Half-Hourly (Planned)'],
    description: 'Konstelasi satelit estimasi presipitasi resolusi tinggi. Saat ini belum dipanggil secara langsung sebagai API terpisah di backend.',
    adaptationValue: 'Menjadi acuan konsep keandalan curah hujan musiman dan pasokan lengas pada modul Neraca Air.',
    terraShaftRole: 'Di runtime, modul Neraca Air membaca parameter PRECTOTCORR dari /api/nasa-climate (NASA POWER), bukan integrasi langsung NASA GPM/IMERG.',
    statusBadge: 'Planned Integration',
    officialUrl: 'https://gpm.nasa.gov/data/imerg'
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
    geographicScopeNote: 'Referensi kerangka vegetasi; belum memproses band spektral NDVI/EVI langsung di runtime.',
    isCoreBaseline: false,
    resolution: '30m (Landsat) · 250m–1km (MODIS/VIIRS)',
    frequency: 'Planned Integration (Satellite Raster Pipeline)',
    variables: ['Surface Reflectance (Planned)', 'NDVI (Planned)', 'EVI (Planned)'],
    description: 'Referensi arsip reflektansi permukaan dan indeks vegetasi untuk pemantauan biomassa dan kesehatan kanopi.',
    adaptationValue: 'Potensi ke depan untuk memetakan vigor tanaman aktual dan verifikasi fase bera secara spasial.',
    terraShaftRole: 'Berperan sebagai framework referensi & dokumen RAG. Belum ada pengambilan API atau pemrosesan piksel NDVI/EVI Landsat/MODIS/VIIRS dalam perhitungan saat ini.',
    statusBadge: 'Planned Integration',
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
    geographicScopeNote: 'Referensi spasial petak AOI pada dokumentasi; belum ada pemrosesan band optik 10m atau API Copernicus.',
    isCoreBaseline: false,
    resolution: '10m / 20m / 60m',
    frequency: 'Planned Integration (Optical AOI Analytics)',
    variables: ['13 Spectral Bands (Planned)', 'NDVI/NDWI Index (Planned)'],
    description: 'Referensi misi citra optik multispektral beresolusi 10 m dari ESA Copernicus.',
    adaptationValue: 'Rujukan masa depan untuk delineasi batas petak mikro petani dan pemantauan klorosis kanopi.',
    terraShaftRole: 'Katalog referensi & integrasi terencana. Peta GIS Explorer saat ini menampilkan basemap web Leaflet dan tidak memproses citra spektral Sentinel-2 mentah.',
    statusBadge: 'Planned Integration',
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
    geographicScopeNote: 'Standar referensi reanalisis iklim & daratan; tidak dipanggil via API runtime.',
    isCoreBaseline: false,
    resolution: '0.25° (GLDAS) / 31 km (ERA5)',
    frequency: 'Reference Standard (Static Documentation / Concept)',
    variables: ['Atmospheric Reanalysis Framework', 'Layered Soil Moisture Concept'],
    description: 'Model reanalisis atmosfer dan transfer energi permukaan daratan yang mendasari literatur agrometeorologi global.',
    adaptationValue: 'Memberi konteks ilmiah mengenai kesinambungan deret waktu cuaca dan keseimbangan energi permukaan.',
    terraShaftRole: 'Berfungsi sebagai Reference Standard dalam dokumentasi teknis; data cuaca runtime seluruhnya diambil melalui NASA POWER API (/api/nasa-climate).',
    statusBadge: 'Reference Standard',
    officialUrl: 'https://ldas.gsfc.nasa.gov/'
  },

  // 2. Knowledge Base, Local Cultivar Registry & Standards
  {
    id: 'fao-gaez',
    name: 'FAO GAEZ v4 & FAO-56 Agrometeorology Standards',
    acronym: 'FAO GAEZ v4 · FAO-56',
    agency: 'FAO & IIASA',
    agencyCategory: 'FAO',
    category: 'climate-reanalysis',
    domainGroup: 'agri-econ',
    geographicProfile: 'standard-baseline',
    geographicScopeNote: 'Standar konseptual Kc/ET0 FAO-56 & entri basis pengetahuan GAEZ; tidak ada query raster GAEZ di runtime.',
    isCoreBaseline: false,
    resolution: 'Conceptual Standard & Knowledge Base Doc',
    frequency: 'Reference Standard (No Runtime GAEZ API)',
    variables: ['FAO-56 ET0/Kc Framework', 'Agro-Ecological Zoning Concepts (Doc)'],
    description: 'Kerangka referensi FAO-56 (evapotranspirasi & koefisien tanaman) serta literatur zonasi agro-ekologis FAO GAEZ v4.',
    adaptationValue: 'Menjadi rujukan metodologis konseptual pada kalkulasi kebutuhan air (ETc) dan narasi penasihat AI.',
    terraShaftRole: 'Reference Standard & entri RAG (agronomyKnowledgeBase.ts). Belum ada pengambilan data GAEZ, raster query, maupun skor GAEZ di mesin optimasi runtime.',
    statusBadge: 'Reference Standard',
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
    geographicScopeNote: 'Sumber dokumen RAG lokal; belum ada pemanggilan API atau layer LST ECOSTRESS runtime.',
    isCoreBaseline: false,
    resolution: '70 meter (Mission Spec)',
    frequency: 'Knowledge Base Only (No Live ECOSTRESS API)',
    variables: ['Land-Surface Temperature Literature', 'Thermal Stress Concepts'],
    description: 'Referensi ilmiah pengamatan suhu permukaan daratan dan indeks cekaman evaporatif NASA ECOSTRESS.',
    adaptationValue: 'Memberi konteks pengetahuan pada asisten AI terkait manajemen cekaman panas dan penggunaan tanaman penutup tanah.',
    terraShaftRole: 'Berperan khusus sebagai sumber dokumen Knowledge Base (RAG) di agronomyKnowledgeBase.ts; tidak ada pengambilan data ECOSTRESS secara langsung.',
    statusBadge: 'Knowledge Base',
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
    geographicScopeNote: 'Sumber dokumen RAG agroforestri; belum ada pengambilan footprint LiDAR GEDI di runtime.',
    isCoreBaseline: false,
    resolution: '25 meter footprint LiDAR (Mission Spec)',
    frequency: 'Knowledge Base Only (No Live GEDI API)',
    variables: ['Canopy Structure Literature', 'Agroforestry Windbreak Guidance'],
    description: 'Referensi ilmiah misi LiDAR struktur kanopi dan biomassa vertikal NASA GEDI.',
    adaptationValue: 'Menyediakan konteks edukatif untuk integrasi pohon pelindung dan agroforestri dalam konsultasi AI Field Advisor.',
    terraShaftRole: 'Sumber teks Knowledge Base (RAG) di agronomyKnowledgeBase.ts tanpa pengambilan API LiDAR maupun pemrosesan kanopi di runtime.',
    statusBadge: 'Knowledge Base',
    officialUrl: 'https://gedi.umd.edu/'
  },
  {
    id: 'brin-kementan',
    name: 'Regional Cultivar Registry & BRIN / Extension Knowledge Base',
    acronym: 'Static Registry · BRIN/Kementan',
    agency: 'Curated JSON Metadata (BRIN, USDA, KALRO, ICAR, EMBRAPA, GRDC Refs)',
    agencyCategory: 'BRIN / Kementan',
    category: 'national-agronomy',
    domainGroup: 'agri-econ',
    geographicProfile: 'indonesia-profile',
    geographicScopeNote: '23 entri kultivar statis (ID, US, KE, TZ, UG, IN, BR, AU) + guardrail lintas batas & fallback Phenotype Archetype.',
    isCoreBaseline: false,
    resolution: '23 Curated Static Entries (cultivars_registry.json)',
    frequency: 'Static Local Registry (No Live Seed Availability API)',
    variables: ['Country/Region Release Guardrail', 'Maturity & Tolerance Metadata', 'BRIN/Balittanah RAG Docs'],
    description: 'Registri lokal statis berisi 23 varietas lintas 6 spesies utama (crop_species.json & cultivars_registry.json) beserta dokumen RAG agronomi.',
    adaptationValue: 'Memastikan kultivar Indonesia (Inpago, Bisi-18, Anjasmoro, Vima, Bioguma) hanya muncul di wilayah ID, dan wilayah lain memakai registri lokal atau Phenotype Archetype.',
    terraShaftRole: 'Static Local Registry & Knowledge Base yang terhubung ke cultivarLocalizer.ts dan optimizationEngine.ts; belum terhubung ke API ketersediaan benih/registrasi resmi eksternal.',
    statusBadge: 'Static Local Registry',
    officialUrl: 'https://brin.go.id/'
  },
  {
    id: 'usda-ssurgo',
    name: 'USDA Soil Taxonomy & SSURGO / STATSGO2 Pedological Reference',
    acronym: 'USDA Soil Refs (SSURGO)',
    agency: 'USDA Natural Resources Conservation Service',
    agencyCategory: 'USDA',
    category: 'usda-usgs',
    domainGroup: 'soil',
    geographicProfile: 'standard-baseline',
    geographicScopeNote: 'Acuan konseptual Segitiga Tekstur USDA; tidak ada query live SSURGO/STATSGO2 di backend.',
    isCoreBaseline: false,
    resolution: 'Conceptual Reference & CONUS Regional Fallback',
    frequency: 'Reference Standard (No Live SSURGO Query)',
    variables: ['USDA Soil Texture Triangle', 'Pedological Reference Constants'],
    description: 'Literatur taksonomi tanah USDA dan Segitiga Tekstur Tanah NRCS yang menjadi acuan konseptual klasifikasi tekstur.',
    adaptationValue: 'Membantu klasifikasi tekstur tanah secara konsisten dan menjadi rujukan konseptual fallback wilayah CONUS saat SoilGrids timeout.',
    terraShaftRole: 'Reference Standard untuk klasifikasi tekstur (classifySoilTexture) dan dokumen RAG; nilai tanah runtime berasal dari ISRIC SoilGrids atau fallback regional statis, tanpa API SSURGO langsung.',
    statusBadge: 'Reference Standard',
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
    { id: 'all', label: 'Semua (13 Sumber)', count: NASA_CHALLENGE_DATASETS.length },
    {
      id: 'global-core',
      label: 'Global Core & Earth Obs',
      count: NASA_CHALLENGE_DATASETS.filter((d) => d.geographicProfile === 'global-core').length
    },
    {
      id: 'indonesia',
      label: 'Global + Regional Registry & RAG',
      count: NASA_CHALLENGE_DATASETS.filter(
        (d) => d.geographicProfile === 'global-core' || d.geographicProfile === 'indonesia-profile'
      ).length
    },
    {
      id: 'standard-baseline',
      label: 'Reference Standards (FAO & USDA)',
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
      case 'Live API':
        return {
          label: 'LIVE API',
          style: 'bg-[#122822] text-[#2DD4BF] border-[#2DD4BF]/40 font-semibold'
        };
      case 'Static Local Registry':
        return {
          label: 'STATIC LOCAL REGISTRY',
          style: 'bg-[#162C2B] text-[#34D399] border-[#34D399]/40 font-semibold'
        };
      case 'Knowledge Base':
        return {
          label: 'KNOWLEDGE BASE',
          style: 'bg-[#291B33] text-[#C084FC] border-[#C084FC]/40 font-semibold'
        };
      case 'Reference Standard':
        return {
          label: 'REFERENCE STANDARD',
          style: 'bg-[#252528] text-[#D1D5DB] border-[#9CA3AF]/30 font-medium'
        };
      case 'Planned Integration':
        return {
          label: 'PLANNED INTEGRATION',
          style: 'bg-[#182338] text-[#38BDF8] border-[#38BDF8]/40 font-medium'
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
          label: 'REGIONAL & RAG',
          style: 'bg-[#133324] text-[#34D399] border-[#34D399]/40 font-semibold'
        };
      case 'standard-baseline':
        return {
          label: 'REFERENCE STANDARD',
          style: 'bg-[#252836] text-[#A5B4FC] border-[#A5B4FC]/30'
        };
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
            <span>13 Sumber Dataset, Referensi, & Peran Aktualnya di Sistem</span>
          </h1>
          <p className="mt-2 text-sm text-[#9BA3AE] leading-relaxed max-w-4xl">
            Pemetaan jujur 13 sumber referensi & telemetri TerraShaft berdasarkan status aktual di kode:
            <strong className="text-[#2DD4BF]"> Live API</strong> (NASA POWER T2M/Radiation/GWETROOT/PRECTOTCORR, ISRIC SoilGrids v2.0, Open-Meteo/SRTM Elevation),
            <strong className="text-[#34D399]"> Static Local Registry</strong> (23 kultivar regional terlokalisasi),
            <strong className="text-[#C084FC]"> Knowledge Base</strong> (ECOSTRESS, GEDI, BRIN RAG),
            <strong className="text-[#D1D5DB]"> Reference Standard</strong> (ERA5/GLDAS, FAO-56/GAEZ, USDA Texture Triangle), dan
            <strong className="text-[#38BDF8]"> Planned Integration</strong> (direct SMAP, GPM/IMERG, Landsat/MODIS, Sentinel-2 raster).
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
              Klasifikasi Transparan: Live API vs Static Registry, Knowledge Base, & Planned Integration
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
              1. Live API & Telemetry Core
            </span>
            <p className="text-[#8A949E]">
              Aktif dipanggil runtime: NASA POWER (T2M, ALLSKY_SFC_SW_DWN, GWETROOT, PRECTOTCORR), ISRIC SoilGrids v2.0 (0–30 cm), dan Open-Meteo/SRTM elevation (/api/geocode). Tidak ada direct SMAP/GPM/Sentinel/Landsat API.
            </p>
          </div>
          <div className="p-3 rounded-[3px] bg-[#12161E] border border-[#202735] flex flex-col gap-1.5">
            <span className="font-semibold text-[#34D399] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#34D399]" />
              2. Static Registry & Knowledge Base
            </span>
            <p className="text-[#8A949E]">
              Registri statis 23 kultivar lokal (ID, US, KE, TZ, UG, IN, BR, AU) + guardrail lintas batas dan dokumen RAG lokal (BRIN/Balittanah, ECOSTRESS, GEDI). Belum terhubung ke API registri benih resmi eksternal.
            </p>
          </div>
          <div className="p-3 rounded-[3px] bg-[#12161E] border border-[#202735] flex flex-col gap-1.5">
            <span className="font-semibold text-[#A5B4FC] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#A5B4FC]" />
              3. Reference Standards & Planned
            </span>
            <p className="text-[#8A949E]">
              Segitiga Tekstur USDA, FAO-56/GAEZ, dan GLDAS/ERA5 berperan sebagai standar konseptual/literatur. Tidak ada query runtime SSURGO maupun raster FAO GAEZ.
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
