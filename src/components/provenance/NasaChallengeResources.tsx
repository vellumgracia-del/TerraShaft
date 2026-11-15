'use client';

import React, { useState, useMemo } from 'react';
import { useAppI18n } from '@/lib/i18n';
import {
  Satellite,
  Search,
  CheckCircle2,
  Globe,
  Sprout,
  ArrowUpRight
} from 'lucide-react';

export type DatasetDomainGroup = 'soil' | 'weather' | 'crop-land' | 'water-topo' | 'agri-econ';
export type GeographicProfile = 'global-core' | 'indonesia-profile' | 'standard-baseline';
export type DatasetIntegrationStatus =
  | 'Live API'
  | 'Indirect API'
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
  geographicScopeNoteEn: string;
  isCoreBaseline: boolean;
  resolution: string;
  frequency: string;
  frequencyEn?: string;
  variables: string[];
  description: string;
  descriptionEn: string;
  adaptationValue: string;
  adaptationValueEn: string;
  terraShaftRole: string;
  terraShaftRoleEn: string;
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
    geographicScopeNote: 'Global & Indonesia: Live REST API (/api/nasa-climate) untuk T2M, ALLSKY_SFC_SW_DWN, GWETROOT, dan PRECTOTCORR.',
    geographicScopeNoteEn: 'Global & Indonesia: Live REST API (/api/nasa-climate) for T2M, ALLSKY_SFC_SW_DWN, GWETROOT, and PRECTOTCORR.',
    isCoreBaseline: true,
    resolution: '0.5° x 0.5° (~50 km)',
    frequency: 'Harian & Baseline Historis (Live REST API)',
    frequencyEn: 'Daily & Historical Baseline (Live REST API)',
    variables: ['Solar Radiation (ALLSKY_SFC_SW_DWN)', 'T2M (Min/Max/Mean)', 'PRECTOTCORR', 'GWETROOT'],
    description: 'Kumpulan data surya, meteorologi, dan klimatologi global yang dioptimalkan untuk riset dan aplikasi pertanian terintegrasi.',
    descriptionEn: 'Global solar, meteorological, and climatological datasets optimized for integrated agricultural research and decision-support applications.',
    adaptationValue: 'Menghitung penggunaan air tanaman, kondisi musim tanam, risiko suhu ekstrem, dan kesesuaian iklim komoditas rotasi.',
    adaptationValueEn: 'Computes crop water demand, growing-season windows, extreme temperature stress, and climate suitability across rotation crops.',
    terraShaftRole: 'Live API utama (/api/nasa-climate): menyediakan suhu harian, radiasi surya (ET0 Hargreaves-Samani), GWETROOT (indikator lengas akar), dan PRECTOTCORR (curah hujan).',
    terraShaftRoleEn: 'Primary live API (/api/nasa-climate): supplies daily temperature, solar irradiance (Hargreaves-Samani ET0), GWETROOT (root-zone wetness), and PRECTOTCORR (precipitation).',
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
    geographicScopeNoteEn: 'Global & Indonesia: Live REST API (/api/soil-profile) for sand, silt, clay fractions, SOC, pH, and CEC (0-30 cm).',
    isCoreBaseline: true,
    resolution: '250 meter',
    frequency: 'Live REST API (/api/soil-profile, Cache 30 Hari)',
    frequencyEn: 'Live REST API (/api/soil-profile, 30-Day Cache)',
    variables: ['Clay Fraction (%)', 'Sand Fraction (%)', 'Silt Fraction (%)', 'SOC (g/kg)', 'pH H2O', 'CEC (cmol/kg)'],
    description: 'Sistem pemetaan digital tanah global berbasis machine learning yang mengintegrasikan puluhan ribu profil tanah terestrial.',
    descriptionEn: 'Machine-learning-based global digital soil mapping system integrating tens of thousands of terrestrial soil profiles.',
    adaptationValue: 'Menentukan kapasitas retensi lengas tanah, kerentanan retak Vertisol, ketersediaan hara, dan batas kritis aerasi akar.',
    adaptationValueEn: 'Determines soil water retention capacity, Vertisol cracking susceptibility, nutrient exchange capacity, and root aeration thresholds.',
    terraShaftRole: 'Live API (/api/soil-profile): mengambil sifat fisik/kimia tanah 0–30 cm untuk menghitung Available Water Capacity (AWC) dan klasifikasi tekstur USDA.',
    terraShaftRoleEn: 'Live API (/api/soil-profile): fetches 0-30 cm topsoil physical and chemical properties to compute Available Water Capacity (AWC) and USDA texture class.',
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
    geographicScopeNoteEn: 'Global & Indonesia: Point elevation lookup via /api/geocode; raster slope & runoff analysis is planned.',
    isCoreBaseline: true,
    resolution: '~30–90 meter DEM',
    frequency: 'Live Point Elevation Lookup (/api/geocode)',
    frequencyEn: 'Live Point Elevation Lookup (/api/geocode)',
    variables: ['Elevation (m)', 'Slope Context (Planned)', 'Aspect (Planned)'],
    description: 'Model elevasi digital global berbasis radar interferometrik untuk penentuan ketinggian lokasi (sabuk elevasi dataran rendah/menengah/tinggi) pada zonasi AEZ.',
    descriptionEn: 'Interferometric radar global digital elevation model used to determine plot elevation belts (lowland/midland/highland) in AEZ zoning.',
    adaptationValue: 'Menentukan sabuk elevasi lokasi pada pipeline AEZ dan menjadi acuan konteks topografi lereng.',
    adaptationValueEn: 'Determines plot elevation belt in the AEZ pipeline and provides topographic slope context.',
    terraShaftRole: 'Live API /api/geocode mengambil elevasi titik dari Open-Meteo Elevation (berbasis SRTM/Copernicus DEM) untuk zonasi agroekologi; analisis kemiringan lereng & runoff raster belum berjalan di runtime.',
    terraShaftRoleEn: 'Live API /api/geocode fetches point elevation from Open-Meteo Elevation (SRTM/Copernicus DEM) for agroecological zoning; raster slope & runoff modeling is not yet active at runtime.',
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
    geographicScopeNoteEn: 'No direct SMAP API call; runtime uses model-assimilated GWETROOT parameter from NASA POWER.',
    isCoreBaseline: true,
    resolution: '0.5° grid via NASA POWER (SMAP native 9 km Planned)',
    frequency: 'Direct SMAP Granule API: Planned Integration',
    frequencyEn: 'Direct SMAP Granule API: Planned Integration',
    variables: ['GWETROOT (NASA POWER Model-Assimilated)', 'Direct SMAP L4 9km (Planned)'],
    description: 'Referensi misi satelit kelembapan tanah NASA SMAP. Pada implementasi saat ini, TerraShaft tidak memiliki route API SMAP langsung.',
    descriptionEn: 'NASA SMAP soil moisture satellite mission reference. Currently, TerraShaft does not invoke a direct SMAP granule API route.',
    adaptationValue: 'Menjadi rujukan konsep indikator lengas zona akar untuk peringatan dini stres air.',
    adaptationValueEn: 'Serves as the conceptual basis for root-zone moisture indicators and early water-stress alerts.',
    terraShaftRole: 'Di runtime, indikator kelembapan akar menggunakan NASA POWER GWETROOT (bukan direct SMAP API). Integrasi granule SMAP L4 9 km langsung adalah Planned Integration.',
    terraShaftRoleEn: 'At runtime, root-zone moisture uses NASA POWER GWETROOT (not direct SMAP API). Direct 9 km SMAP L4 granule ingestion is a Planned Integration.',
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
    geographicScopeNoteEn: 'No direct GPM/IMERG API call; runtime rainfall comes from NASA POWER PRECTOTCORR.',
    isCoreBaseline: true,
    resolution: '0.5° via NASA POWER PRECTOTCORR (IMERG 0.1°)',
    frequency: 'Baseline Harian/Bulanan (Tidak Langsung via NASA POWER)',
    frequencyEn: 'Daily / Monthly Baseline (Indirect via NASA POWER PRECTOTCORR)',
    variables: ['PRECTOTCORR (NASA POWER Runtime)', 'Precipitation Rate & Accumulation'],
    description: 'Konstelasi satelit estimasi presipitasi resolusi tinggi. Diambil melalui parameter terasimilasi PRECTOTCORR pada NASA POWER API.',
    descriptionEn: 'High-resolution precipitation satellite constellation. Accessed indirectly via the assimilated PRECTOTCORR parameter in NASA POWER.',
    adaptationValue: 'Menilai keandalan curah hujan musiman dan pasokan lengas pada modul Neraca Air.',
    adaptationValueEn: 'Evaluates seasonal rainfall reliability and moisture supply in the Water Balance module.',
    terraShaftRole: 'Di runtime, modul Neraca Air membaca parameter PRECTOTCORR dari /api/nasa-climate (NASA POWER), bukan integrasi langsung endpoint NASA GPM/IMERG.',
    terraShaftRoleEn: 'At runtime, the Water Balance module reads PRECTOTCORR from /api/nasa-climate (NASA POWER) rather than a direct NASA GPM/IMERG endpoint.',
    statusBadge: 'Indirect API',
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
    geographicScopeNote: 'Telemetri live NDVI/EVI per koordinat melalui Microsoft Planetary Computer STAC & TiTiler API.',
    geographicScopeNoteEn: 'Live coordinate-level NDVI/EVI telemetry via Microsoft Planetary Computer STAC & TiTiler API.',
    isCoreBaseline: false,
    resolution: '30m (Landsat) · 250m–1km (MODIS/VIIRS)',
    frequency: 'MODIS 16-Hari / Landsat 8–16 Hari (Live STAC & TiTiler API)',
    frequencyEn: '16-Day MODIS / 8-16 Day Landsat (Live STAC & TiTiler API)',
    variables: ['Surface Reflectance', 'NDVI (Normalized Difference Veg Index)', 'EVI', 'Bare Ground Windows'],
    description: 'Reflektansi permukaan terkoreksi atmosfer dan indeks vegetasi untuk memantau biomassa dan kesehatan kanopi.',
    descriptionEn: 'Atmospherically corrected surface reflectance and vegetation indices for monitoring biomass and canopy vigor.',
    adaptationValue: 'Memetakan vigor tanaman, mendeteksi transisi musiman, dan memverifikasi fase bera secara spasial.',
    adaptationValueEn: 'Maps crop vigor, detects seasonal phenology transitions, and spatially verifies fallow windows.',
    terraShaftRole: 'Telemetri live NDVI/EVI per koordinat via /api/vegetation-indices (Microsoft Planetary Computer STAC & TiTiler: landsat-c2-l2 & modis-13Q1-061).',
    terraShaftRoleEn: 'Live coordinate-level NDVI/EVI telemetry via /api/vegetation-indices (Microsoft Planetary Computer STAC & TiTiler: landsat-c2-l2 & modis-13Q1-061).',
    statusBadge: 'Live API',
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
    geographicScopeNote: 'Telemetri live NDVI 10m (B04/B08) per koordinat melalui Microsoft Planetary Computer STAC & TiTiler API.',
    geographicScopeNoteEn: 'Live 10m NDVI (B04/B08) telemetry per coordinate via Microsoft Planetary Computer STAC & TiTiler API.',
    isCoreBaseline: false,
    resolution: '10m / 20m / 60m',
    frequency: '5 hari (Live STAC & TiTiler API via Planetary Computer)',
    frequencyEn: '5-Day Revisit (Live STAC & TiTiler API via Planetary Computer)',
    variables: ['13 Spectral Bands', 'Red-Edge Chlorophyll Bands', 'SWIR Moisture Bands', 'NDWI'],
    description: 'Citra optik multispektral bebas akses beresolusi spasial tinggi dengan pita khusus analisis status vegetasi dan lengas daun.',
    descriptionEn: 'Free, high-resolution multispectral optical imagery with dedicated bands for vegetation status and leaf moisture analysis.',
    adaptationValue: 'Memetakan indeks klorofil kanopi, deteksi dini klorosis hara, batas kepemilikan petak mikro petani, dan monitoring lahan bera.',
    adaptationValueEn: 'Maps canopy chlorophyll index, early nutrient chlorosis detection, smallholder plot boundaries, and fallow monitoring.',
    terraShaftRole: 'Telemetri live NDVI 10m (B04/B08) per koordinat via /api/vegetation-indices (Microsoft Planetary Computer STAC & TiTiler: sentinel-2-l2a).',
    terraShaftRoleEn: 'Live 10m NDVI (B04/B08) telemetry per coordinate via /api/vegetation-indices (Microsoft Planetary Computer STAC & TiTiler: sentinel-2-l2a).',
    statusBadge: 'Live API',
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
    geographicScopeNoteEn: 'Reference standard for land-surface & climate reanalysis; not invoked via runtime API.',
    isCoreBaseline: false,
    resolution: '0.25° (GLDAS) / 31 km (ERA5)',
    frequency: 'Reference Standard (Dokumentasi Statis / Konseptual)',
    frequencyEn: 'Reference Standard (Static Documentation / Concept)',
    variables: ['Atmospheric Reanalysis Framework', 'Layered Soil Moisture Concept'],
    description: 'Model reanalisis atmosfer dan transfer energi permukaan daratan yang mendasari literatur agrometeorologi global.',
    descriptionEn: 'Atmospheric reanalysis and land-surface energy transfer models underpinning global agrometeorology literature.',
    adaptationValue: 'Memberi konteks ilmiah mengenai kesinambungan deret waktu cuaca dan keseimbangan energi permukaan.',
    adaptationValueEn: 'Provides scientific context for continuous weather time-series and surface energy balance.',
    terraShaftRole: 'Berfungsi sebagai Reference Standard dalam dokumentasi teknis; data cuaca runtime seluruhnya diambil melalui NASA POWER API (/api/nasa-climate).',
    terraShaftRoleEn: 'Serves as a Reference Standard in technical docs; runtime weather telemetry is fetched entirely via NASA POWER API (/api/nasa-climate).',
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
    geographicScopeNoteEn: 'Conceptual FAO-56 Kc/ET0 standard & GAEZ knowledge entries; no runtime GAEZ raster queries.',
    isCoreBaseline: false,
    resolution: 'Conceptual Standard & Knowledge Base Doc',
    frequency: 'Reference Standard (Tanpa API GAEZ Runtime)',
    frequencyEn: 'Reference Standard (No Runtime GAEZ API)',
    variables: ['FAO-56 ET0/Kc Framework', 'Agro-Ecological Zoning Concepts (Doc)'],
    description: 'Kerangka referensi FAO-56 (evapotranspirasi & koefisien tanaman) serta literatur zonasi agro-ekologis FAO GAEZ v4.',
    descriptionEn: 'FAO-56 reference framework (evapotranspiration & crop coefficients) and FAO GAEZ v4 agro-ecological zoning literature.',
    adaptationValue: 'Menjadi rujukan metodologis konseptual pada kalkulasi kebutuhan air (ETc) dan narasi penasihat AI.',
    adaptationValueEn: 'Serves as the methodological baseline for crop water requirement (ETc) calculations and AI advisor guidance.',
    terraShaftRole: 'Reference Standard & entri RAG (agronomyKnowledgeBase.ts). Belum ada pengambilan data GAEZ, raster query, maupun skor GAEZ di mesin optimasi runtime.',
    terraShaftRoleEn: 'Reference Standard & RAG entries (agronomyKnowledgeBase.ts). No runtime GAEZ raster queries or GAEZ scores are executed in the optimizer.',
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
    geographicScopeNoteEn: 'Local RAG knowledge source; no runtime ECOSTRESS API calls or LST raster layers.',
    isCoreBaseline: false,
    resolution: '70 meter (Mission Spec)',
    frequency: 'Knowledge Base Only (Tanpa API ECOSTRESS Live)',
    frequencyEn: 'Knowledge Base Only (No Live ECOSTRESS API)',
    variables: ['Land-Surface Temperature Literature', 'Thermal Stress Concepts'],
    description: 'Referensi ilmiah pengamatan suhu permukaan daratan dan indeks cekaman evaporatif NASA ECOSTRESS.',
    descriptionEn: 'Scientific reference for NASA ECOSTRESS land-surface temperature observations and evaporative stress indices.',
    adaptationValue: 'Memberi konteks pengetahuan pada asisten AI terkait manajemen cekaman panas dan penggunaan tanaman penutup tanah.',
    adaptationValueEn: 'Provides knowledge context to the AI Advisor on heat-stress mitigation and cover-crop mulching.',
    terraShaftRole: 'Berperan khusus sebagai sumber dokumen Knowledge Base (RAG) di agronomyKnowledgeBase.ts; tidak ada pengambilan data ECOSTRESS secara langsung.',
    terraShaftRoleEn: 'Used exclusively as a Knowledge Base (RAG) source in agronomyKnowledgeBase.ts; no direct ECOSTRESS data ingestion.',
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
    geographicScopeNoteEn: 'Agroforestry RAG knowledge source; no runtime GEDI LiDAR footprint queries.',
    isCoreBaseline: false,
    resolution: '25 meter footprint LiDAR (Mission Spec)',
    frequency: 'Knowledge Base Only (Tanpa API GEDI Live)',
    frequencyEn: 'Knowledge Base Only (No Live GEDI API)',
    variables: ['Canopy Structure Literature', 'Agroforestry Windbreak Guidance'],
    description: 'Referensi ilmiah misi LiDAR struktur kanopi dan biomassa vertikal NASA GEDI.',
    descriptionEn: 'Scientific reference for the NASA GEDI LiDAR canopy structure and vertical biomass mission.',
    adaptationValue: 'Menyediakan konteks edukatif untuk integrasi pohon pelindung dan agroforestri dalam konsultasi AI Field Advisor.',
    adaptationValueEn: 'Provides educational context for shade-tree integration and agroforestry windbreaks in Field Advisor AI.',
    terraShaftRole: 'Sumber teks Knowledge Base (RAG) di agronomyKnowledgeBase.ts tanpa pengambilan API LiDAR maupun pemrosesan kanopi di runtime.',
    terraShaftRoleEn: 'Knowledge Base (RAG) text source in agronomyKnowledgeBase.ts without runtime LiDAR API calls or canopy processing.',
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
    geographicScopeNoteEn: '23 static cultivar entries (ID, US, KE, TZ, UG, IN, BR, AU) + cross-border guardrails & Phenotype Archetype fallback.',
    isCoreBaseline: false,
    resolution: '23 Curated Static Entries (cultivars_registry.json)',
    frequency: 'Static Local Registry (Tanpa API Ketersediaan Benih Live)',
    frequencyEn: 'Static Local Registry (No Live Seed Availability API)',
    variables: ['Country/Region Release Guardrail', 'Maturity & Tolerance Metadata', 'BRIN/Balittanah RAG Docs'],
    description: 'Registri lokal statis berisi 23 varietas lintas 6 spesies utama (crop_species.json & cultivars_registry.json) beserta dokumen RAG agronomi.',
    descriptionEn: 'Static local registry containing 23 varieties across 6 core species (crop_species.json & cultivars_registry.json) plus agronomy RAG documents.',
    adaptationValue: 'Memastikan kultivar Indonesia (Inpago, Bisi-18, Anjasmoro, Vima, Bioguma) hanya muncul di wilayah ID, dan wilayah lain memakai registri lokal atau Phenotype Archetype.',
    adaptationValueEn: 'Ensures Indonesian cultivars (Inpago, Bisi-18, Anjasmoro, Vima, Bioguma) appear only in ID, while other regions resolve local registries or Phenotype Archetypes.',
    terraShaftRole: 'Static Local Registry & Knowledge Base yang terhubung ke cultivarLocalizer.ts dan optimizationEngine.ts; belum terhubung ke API ketersediaan benih/registrasi resmi eksternal.',
    terraShaftRoleEn: 'Static Local Registry & Knowledge Base wired into cultivarLocalizer.ts and optimizationEngine.ts; not connected to external live seed-availability APIs.',
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
    geographicScopeNoteEn: 'Conceptual USDA Texture Triangle standard; no live SSURGO/STATSGO2 backend queries.',
    isCoreBaseline: false,
    resolution: 'Conceptual Reference & CONUS Regional Fallback',
    frequency: 'Reference Standard (Tanpa Query SSURGO Live)',
    frequencyEn: 'Reference Standard (No Live SSURGO Query)',
    variables: ['USDA Soil Texture Triangle', 'Pedological Reference Constants'],
    description: 'Literatur taksonomi tanah USDA dan Segitiga Tekstur Tanah NRCS yang menjadi acuan konseptual klasifikasi tekstur.',
    descriptionEn: 'USDA soil taxonomy literature and NRCS Soil Texture Triangle serving as the conceptual reference for texture classification.',
    adaptationValue: 'Membantu klasifikasi tekstur tanah secara konsisten dan menjadi rujukan konseptual fallback wilayah CONUS saat SoilGrids timeout.',
    adaptationValueEn: 'Supports consistent soil texture classification and serves as the conceptual CONUS fallback reference when SoilGrids times out.',
    terraShaftRole: 'Reference Standard untuk klasifikasi tekstur (classifySoilTexture) dan dokumen RAG; nilai tanah runtime berasal dari ISRIC SoilGrids atau fallback regional statis, tanpa API SSURGO langsung.',
    terraShaftRoleEn: 'Reference Standard for texture classification (classifySoilTexture) and RAG docs; runtime soil values come from ISRIC SoilGrids or static regional fallbacks without live SSURGO API.',
    statusBadge: 'Reference Standard',
    officialUrl: 'https://www.nrcs.usda.gov/resources/data-and-tech/soil-survey-geographic-database-ssurgo'
  }
];

export default function NasaChallengeResources() {
  const { isEn } = useAppI18n();
  const [activeProfile, setActiveProfile] = useState<'all' | 'global-core' | 'indonesia' | 'standard-baseline'>('all');
  const [activeGroup, setActiveGroup] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const domainGroups = [
    { id: 'all', label: isEn ? 'All Domains' : 'Semua Domain', count: NASA_CHALLENGE_DATASETS.length },
    {
      id: 'soil',
      label: isEn ? 'Soil Conditions' : 'Kondisi Tanah',
      count: NASA_CHALLENGE_DATASETS.filter((d) => d.domainGroup === 'soil').length
    },
    {
      id: 'weather',
      label: isEn ? 'Weather & Climate' : 'Cuaca & Iklim',
      count: NASA_CHALLENGE_DATASETS.filter((d) => d.domainGroup === 'weather').length
    },
    {
      id: 'crop-land',
      label: isEn ? 'Crop & Land' : 'Tanaman & Lahan',
      count: NASA_CHALLENGE_DATASETS.filter((d) => d.domainGroup === 'crop-land').length
    },
    {
      id: 'water-topo',
      label: isEn ? 'Water & Topography' : 'Air & Topografi',
      count: NASA_CHALLENGE_DATASETS.filter((d) => d.domainGroup === 'water-topo').length
    },
    {
      id: 'agri-econ',
      label: isEn ? 'Feasibility & Economics' : 'Kelayakan & Ekonomi',
      count: NASA_CHALLENGE_DATASETS.filter((d) => d.domainGroup === 'agri-econ').length
    }
  ];

  const profilePills: Array<{
    id: 'all' | 'global-core' | 'indonesia' | 'standard-baseline';
    label: string;
    count: number;
  }> = [
    { id: 'all', label: isEn ? 'All' : 'Semua', count: NASA_CHALLENGE_DATASETS.length },
    {
      id: 'global-core',
      label: 'Global Core',
      count: NASA_CHALLENGE_DATASETS.filter((d) => d.geographicProfile === 'global-core').length
    },
    {
      id: 'indonesia',
      label: isEn ? 'Regional & RAG' : 'Regional & RAG',
      count: NASA_CHALLENGE_DATASETS.filter(
        (d) => d.geographicProfile === 'global-core' || d.geographicProfile === 'indonesia-profile'
      ).length
    },
    {
      id: 'standard-baseline',
      label: isEn ? 'Reference Standards' : 'Standar Acuan',
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
          style: 'bg-[#122A2F] text-[#00C2CC] border-[#164E55] font-semibold'
        };
      case 'Indirect API':
        return {
          label: 'INDIRECT PROXY API',
          style: 'bg-[#1A2630] text-[#00C2CC] border-[#00C2CC]/40 font-semibold'
        };
      case 'Static Local Registry':
        return {
          label: 'STATIC LOCAL REGISTRY',
          style: 'bg-[#20242B] text-[#C1C7CD] border-[#2C313A] font-medium'
        };
      case 'Knowledge Base':
        return {
          label: 'KNOWLEDGE BASE',
          style: 'bg-[#20242B] text-[#C1C7CD] border-[#2C313A] font-medium'
        };
      case 'Reference Standard':
        return {
          label: 'REFERENCE STANDARD',
          style: 'bg-[#20242B] text-[#C1C7CD] border-[#2C313A] font-medium'
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
          style: 'bg-[#121418] text-[#8A949E] border-[#282C34]'
        };
      case 'indonesia-profile':
        return {
          label: 'REGIONAL & RAG',
          style: 'bg-[#121418] text-[#8A949E] border-[#282C34]'
        };
      case 'standard-baseline':
        return {
          label: 'REFERENCE STANDARD',
          style: 'bg-[#121418] text-[#8A949E] border-[#282C34]'
        };
    }
  };

  return (
    <div className="flex flex-col gap-6 text-[#F1F3F5]">
      {/* Catalog Header Banner */}
      <div className="p-6 rounded-[4px] bg-[#16191E] border border-[#2C313A] flex flex-col gap-2">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Satellite className="w-6 h-6 text-[#00C2CC] shrink-0" />
          <span>
            {isEn
              ? '13 Datasets, References, & Actual System Roles'
              : '13 Sumber Dataset, Referensi, & Peran Aktualnya di Sistem'}
          </span>
        </h1>
        <p className="text-sm text-[#9BA3AE] leading-relaxed max-w-4xl">
          {isEn
            ? 'Transparent mapping of 13 TerraShaft telemetry and reference sources by actual implementation status: Live API (NASA POWER T2M/Radiation/GWETROOT/PRECTOTCORR, ISRIC SoilGrids v2.0, Open-Meteo/SRTM Elevation), Static Local Registry (23 localized regional cultivars), Knowledge Base (ECOSTRESS, GEDI, BRIN RAG), Reference Standard (ERA5/GLDAS, FAO-56/GAEZ, USDA Texture Triangle), and Planned Integration (direct SMAP, GPM/IMERG, Landsat/MODIS, Sentinel-2 raster).'
            : 'Pemetaan jujur 13 sumber referensi & telemetri TerraShaft berdasarkan status aktual di kode: Live API (NASA POWER T2M/Radiation/GWETROOT/PRECTOTCORR, ISRIC SoilGrids v2.0, Open-Meteo/SRTM Elevation), Static Local Registry (23 kultivar regional terlokalisasi), Knowledge Base (ECOSTRESS, GEDI, BRIN RAG), Reference Standard (ERA5/GLDAS, FAO-56/GAEZ, USDA Texture Triangle), dan Planned Integration (direct SMAP, GPM/IMERG, Landsat/MODIS, Sentinel-2 raster).'}
        </p>
      </div>

      {/* Geographic Profiling & Dataset Optimization Callout */}
      <div className="p-5 rounded-[4px] bg-[#16191E] border border-[#2C313A] flex flex-col gap-3.5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#242831] pb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#00C2CC]" />
            <h2 className="text-sm font-semibold text-white tracking-tight">
              {isEn
                ? 'Transparent Classification: Live API vs Static Registry, Knowledge Base, & Planned Integration'
                : 'Klasifikasi Transparan: Live API vs Static Registry, Knowledge Base, & Planned Integration'}
            </h2>
          </div>
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-1 bg-[#20242B] p-1 rounded-[3px] border border-[#2C313A] shrink-0">
            {profilePills.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveProfile(p.id)}
                className={`px-2.5 py-1 rounded-[2px] text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                  activeProfile === p.id
                    ? 'bg-[#00C2CC] text-[#121417] font-semibold shadow-xs'
                    : 'text-[#A6AFB8] hover:text-white'
                }`}
              >
                <span>{p.label}</span>
                <span className={`ml-1.5 text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  activeProfile === p.id ? 'bg-[#121417]/20 text-[#121417]' : 'bg-[#16191E] text-[#8A949E]'
                }`}>
                  {p.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs leading-relaxed">
          <div className="p-3 rounded-[3px] bg-[#121418] border border-[#242831] flex flex-col gap-1.5">
            <span className="font-semibold text-[#F1F3F5]">
              {isEn ? '1. Live API & Telemetry Core' : '1. Live API & Telemetry Core'}
            </span>
            <p className="text-[#8A949E]">
              {isEn
                ? 'Active runtime calls: NASA POWER (T2M, Radiation, GWETROOT, PRECTOTCORR), ISRIC SoilGrids v2.0 (0-30 cm), Sentinel-2/Landsat/MODIS NDVI (/api/vegetation-indices via Planetary Computer), and Open-Meteo/SRTM elevation (/api/geocode).'
                : 'Aktif dipanggil runtime: NASA POWER (T2M, Radiasi, GWETROOT, PRECTOTCORR), ISRIC SoilGrids v2.0 (0-30 cm), NDVI Sentinel-2/Landsat/MODIS (/api/vegetation-indices via Planetary Computer), dan elevasi Open-Meteo/SRTM (/api/geocode).'}
            </p>
          </div>
          <div className="p-3 rounded-[3px] bg-[#121418] border border-[#242831] flex flex-col gap-1.5">
            <span className="font-semibold text-[#F1F3F5]">
              {isEn ? '2. Static Registry & Knowledge Base' : '2. Static Registry & Knowledge Base'}
            </span>
            <p className="text-[#8A949E]">
              {isEn
                ? 'Static registry of 23 local cultivars (ID, US, KE, TZ, UG, IN, BR, AU) with cross-border guardrails and local RAG documents (BRIN/Balittanah, ECOSTRESS, GEDI). Not connected to external seed registry APIs.'
                : 'Registri statis 23 kultivar lokal (ID, US, KE, TZ, UG, IN, BR, AU) + guardrail lintas batas dan dokumen RAG lokal (BRIN/Balittanah, ECOSTRESS, GEDI). Belum terhubung ke API registri benih resmi eksternal.'}
            </p>
          </div>
          <div className="p-3 rounded-[3px] bg-[#121418] border border-[#242831] flex flex-col gap-1.5">
            <span className="font-semibold text-[#F1F3F5]">
              {isEn ? '3. Reference Standards & Planned' : '3. Reference Standards & Planned'}
            </span>
            <p className="text-[#8A949E]">
              {isEn
                ? 'USDA Texture Triangle, FAO-56/GAEZ, and GLDAS/ERA5 serve as conceptual/literature standards. No runtime SSURGO or FAO GAEZ raster queries.'
                : 'Segitiga Tekstur USDA, FAO-56/GAEZ, dan GLDAS/ERA5 berperan sebagai standar konseptual/literatur. Tidak ada query runtime SSURGO maupun raster FAO GAEZ.'}
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
            placeholder={isEn ? 'Search dataset, parameter, or agency...' : 'Cari dataset, parameter, atau agensi...'}
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
                <div className="p-2.5 rounded-[3px] bg-[#121418] border border-[#242831] text-[11px] font-mono text-[#9BA3AE] flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-[#00C2CC] shrink-0" />
                  <span>{isEn ? item.geographicScopeNoteEn : item.geographicScopeNote}</span>
                </div>

                {/* Description */}
                <p className="text-xs text-[#9BA3AE] leading-relaxed">
                  {isEn ? item.descriptionEn : item.description}
                </p>

                {/* Resolution & Frequency */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-[#121418] p-2.5 rounded-[3px] border border-[#242831]">
                  <div>
                    <span className="text-[#6C757D] block text-[10px] uppercase tracking-wider">
                      {isEn ? 'Spatial Resolution' : 'Resolusi Spasial'}
                    </span>
                    <span className="text-[#D0D7DE] font-semibold">{item.resolution}</span>
                  </div>
                  <div>
                    <span className="text-[#6C757D] block text-[10px] uppercase tracking-wider">
                      {isEn ? 'Update Frequency' : 'Frekuensi Pembaruan'}
                    </span>
                    <span className="text-[#D0D7DE] font-semibold">
                      {isEn ? item.frequencyEn || item.frequency : item.frequency}
                    </span>
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
                    <span>{isEn ? 'Agricultural Adaptation Value:' : 'Nilai Adaptasi Pertanian:'}</span>
                  </div>
                  <p className="text-[#9BA3AE] leading-relaxed">
                    {isEn ? item.adaptationValueEn : item.adaptationValue}
                  </p>
                </div>

                {/* Integration in TerraShaft */}
                <div className="p-3 rounded-[3px] bg-[#20242B]/80 border border-[#282F3A] flex flex-col gap-1 text-[11.5px]">
                  <div className="flex items-center gap-1.5 font-medium text-[#F1F3F5]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00C2CC]" />
                    <span>{isEn ? 'TerraShaft Implementation:' : 'Implementasi di TerraShaft:'}</span>
                  </div>
                  <p className="text-[#9BA3AE] leading-relaxed">
                    {isEn ? item.terraShaftRoleEn : item.terraShaftRole}
                  </p>
                </div>
              </div>

              {/* Footer with link */}
              <div className="pt-3 border-t border-[#262C36] flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-[#6C757D]">
                  {isEn ? 'Agency:' : 'Agensi:'} {item.agencyCategory}
                </span>

                <a
                  href={item.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00C2CC] hover:text-[#33D4DC] flex items-center gap-1 font-medium transition-colors"
                >
                  <span>{isEn ? 'Official Docs' : 'Dokumentasi Resmi'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDatasets.length === 0 && (
        <div className="p-12 text-center bg-[#16191E] border border-[#2C313A] rounded-[4px] text-xs text-[#8A949E]">
          {isEn
            ? `No datasets found matching "${searchQuery}". Try keywords such as "smap", "rain", "soil", or "et".`
            : `Tidak ditemukan dataset yang cocok dengan kata kunci "${searchQuery}". Coba gunakan kata kunci lain seperti "smap", "hujan", "tanah", atau "et".`}
        </div>
      )}
    </div>
  );
}
