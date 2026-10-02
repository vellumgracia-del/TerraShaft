/**
 * TerraShaft Shared Source-Status Presentation Model
 * Provides unified, scientifically accurate, and non-misleading wording
 * across TopHeader, Sidebar, DataSourceProvenanceCard, FieldOverviewCard,
 * SummaryMetricCards, ActionSheetModal, and audit log generators.
 */

import { TerraShaftProvenance } from '@/types/provenance';

export type SourceDisplayStatus = {
  shortLabel: string;
  longLabel: string;
  sourceLabel: string;
  detailText: string;
  tone: 'success' | 'warning' | 'info' | 'neutral' | 'error';
  isOfficialApiResponse: boolean;
  isFieldObservation: boolean;
};

export interface ActionSheetProvenanceDisplay {
  compactSourceBlock: {
    nasa: string;
    soil: string;
  };
  summaryBanner: string;
  scientificNote: string;
  overallTone: 'success' | 'warning' | 'info' | 'neutral' | 'error';
}

/**
 * NASA POWER Agroclimatology Display Resolver
 */
export function getNasaPowerDisplayStatus(prov?: TerraShaftProvenance): SourceDisplayStatus {
  const nasa = prov?.nasaPower;
  const mode = nasa?.mode ?? 'fallback';

  switch (mode) {
    case 'loading':
      return {
        shortLabel: 'MEMUAT NASA POWER...',
        longLabel: 'Menghubungkan ke API NASA POWER...',
        sourceLabel: 'NASA POWER Agroclimatology',
        detailText: 'Sedang meminta data agroklimatologi dari endpoint NASA POWER...',
        tone: 'neutral',
        isOfficialApiResponse: false,
        isFieldObservation: false
      };
    case 'live':
      return {
        shortLabel: 'NASA POWER · API OK',
        longLabel: 'NASA POWER API · Response received',
        sourceLabel: 'NASA POWER Agroclimatology',
        detailText: 'Data berasal dari respons API NASA POWER (baseline agroklimatologi historis 1-tahun) dan bukan sensor in-situ real-time pada petak lahan.',
        tone: 'success',
        isOfficialApiResponse: true,
        isFieldObservation: false
      };
    case 'cached':
      return {
        shortLabel: 'CACHED: NASA POWER',
        longLabel: 'NASA POWER API · Cached baseline',
        sourceLabel: 'NASA POWER Agroclimatology',
        detailText: 'Snapshot respons API NASA POWER tersimpan di cache lokal dari pemanggilan sebelumnya.',
        tone: 'info',
        isOfficialApiResponse: true,
        isFieldObservation: false
      };
    case 'error':
      return {
        shortLabel: 'NASA POWER · API Error',
        longLabel: 'NASA POWER API · Kendala Jaringan',
        sourceLabel: 'NASA POWER Agroclimatology',
        detailText: nasa?.errorMessage || 'Gagal menghubungi server API NASA POWER.',
        tone: 'error',
        isOfficialApiResponse: false,
        isFieldObservation: false
      };
    case 'demo':
      return {
        shortLabel: 'NASA POWER · Demo Mode',
        longLabel: 'NASA POWER · Nilai Disimulasikan',
        sourceLabel: 'NASA POWER Agroclimatology',
        detailText: 'Data agroklimat disimulasikan untuk pengujian demo produk.',
        tone: 'info',
        isOfficialApiResponse: false,
        isFieldObservation: false
      };
    case 'fallback':
    default:
      return {
        shortLabel: 'NASA POWER · Fallback',
        longLabel: 'Klimatologi Regional (Fallback)',
        sourceLabel: 'Klimatologi Regional Terkalibrasi',
        detailText: nasa?.fallbackReason || 'Permintaan API NASA POWER tidak tersedia; menggunakan model agroklimat regional terkalibrasi Nusa Tenggara.',
        tone: 'warning',
        isOfficialApiResponse: false,
        isFieldObservation: false
      };
  }
}

/**
 * SMAP L4 GWETROOT Display Resolver
 */
export function getNasaSmapDisplayStatus(prov?: TerraShaftProvenance): SourceDisplayStatus {
  const nasa = prov?.nasaPower;
  const mode = nasa?.mode ?? 'fallback';

  switch (mode) {
    case 'loading':
      return {
        shortLabel: 'Memuat kelembapan...',
        longLabel: 'Memuat estimasi kelembapan zona akar...',
        sourceLabel: 'SMAP L4 GWETROOT',
        detailText: 'Mengambil estimasi kelembapan tanah zona akar...',
        tone: 'neutral',
        isOfficialApiResponse: false,
        isFieldObservation: false
      };
    case 'live':
    case 'cached':
      return {
        shortLabel: 'SMAP L4 (Model)',
        longLabel: 'SMAP L4 · Model-assimilated root-zone moisture estimate',
        sourceLabel: 'SMAP L4 GWETROOT (0–100 cm)',
        detailText: 'GWETROOT merupakan estimasi kelembapan zona akar berbasis model dan asimilasi observasi satelit NASA, bukan pembacaan sensor in-situ di petak lahan.',
        tone: 'success',
        isOfficialApiResponse: true,
        isFieldObservation: false
      };
    case 'demo':
      return {
        shortLabel: 'Model demo estimate',
        longLabel: 'Simulasi Kelembapan Akar (Demo)',
        sourceLabel: 'SMAP L4 (Simulasi Demo)',
        detailText: 'Estimasi kelembapan disimulasikan untuk keperluan demonstrasi.',
        tone: 'info',
        isOfficialApiResponse: false,
        isFieldObservation: false
      };
    case 'fallback':
    default:
      return {
        shortLabel: 'Regional model estimate',
        longLabel: 'SMAP-compatible regional fallback estimate',
        sourceLabel: 'Model Hidrologi Regional',
        detailText: 'Estimasi kelembapan zona perakaran berbasis model regional terkalibrasi Nusa Tenggara.',
        tone: 'warning',
        isOfficialApiResponse: false,
        isFieldObservation: false
      };
  }
}

/**
 * NASA Precipitation Display Resolver (via NASA POWER daily PRECTOTCORR)
 */
export function getNasaPrecipitationDisplayStatus(prov?: TerraShaftProvenance): SourceDisplayStatus {
  const nasa = prov?.nasaPower;
  const mode = nasa?.mode ?? 'fallback';

  switch (mode) {
    case 'loading':
      return {
        shortLabel: 'Memuat presipitasi...',
        longLabel: 'Memuat estimasi presipitasi bulanan...',
        sourceLabel: 'Presipitasi NASA POWER',
        detailText: 'Memuat akumulasi curah hujan...',
        tone: 'neutral',
        isOfficialApiResponse: false,
        isFieldObservation: false
      };
    case 'live':
    case 'cached':
      return {
        shortLabel: 'Presipitasi NASA POWER',
        longLabel: 'NASA-derived precipitation estimate via NASA POWER',
        sourceLabel: 'NASA POWER PRECTOTCORR (Estimasi Satelit)',
        detailText: 'Estimasi presipitasi musiman dihitung dari parameter harian PRECTOTCORR NASA POWER baseline 1 tahun.',
        tone: 'success',
        isOfficialApiResponse: true,
        isFieldObservation: false
      };
    case 'demo':
      return {
        shortLabel: 'Presipitasi (Demo)',
        longLabel: 'Estimasi Presipitasi Disimulasikan',
        sourceLabel: 'Presipitasi Disimulasikan',
        detailText: 'Curah hujan disimulasikan untuk skenario demonstrasi.',
        tone: 'info',
        isOfficialApiResponse: false,
        isFieldObservation: false
      };
    case 'fallback':
    default:
      return {
        shortLabel: 'Presipitasi Regional',
        longLabel: 'Klimatologi Presipitasi Regional Terkalibrasi',
        sourceLabel: 'Klimatologi Regional BMKG/Nusa Tenggara',
        detailText: 'Presipitasi menggunakan rata-rata klimatologi regional terkalibrasi Nusa Tenggara.',
        tone: 'warning',
        isOfficialApiResponse: false,
        isFieldObservation: false
      };
  }
}

/**
 * ISRIC SoilGrids v2.0 Display Resolver
 */
export function getSoilGridsDisplayStatus(prov?: TerraShaftProvenance): SourceDisplayStatus {
  const soil = prov?.isricSoilGrids;
  const mode = soil?.mode ?? 'fallback';

  switch (mode) {
    case 'loading':
      return {
        shortLabel: 'MEMUAT SOILGRIDS...',
        longLabel: 'Memuat profil tanah ISRIC SoilGrids...',
        sourceLabel: 'ISRIC SoilGrids v2.0',
        detailText: 'Sedang meminta lapisan tanah 0–30cm dari ISRIC SoilGrids REST API...',
        tone: 'neutral',
        isOfficialApiResponse: false,
        isFieldObservation: false
      };
    case 'live':
      return {
        shortLabel: 'ISRIC SoilGrids · API OK',
        longLabel: 'ISRIC SoilGrids v2.0 · API response received',
        sourceLabel: 'ISRIC SoilGrids v2.0 REST API (0–30cm)',
        detailText: 'Respons resmi ISRIC SoilGrids diterima untuk lapisan tanah 0–30cm (tekstur, SOC, pH, CEC).',
        tone: 'success',
        isOfficialApiResponse: true,
        isFieldObservation: false
      };
    case 'cached':
      return {
        shortLabel: 'CACHED: SoilGrids',
        longLabel: 'ISRIC SoilGrids · Cached profile',
        sourceLabel: 'ISRIC SoilGrids v2.0 (Cache)',
        detailText: 'Profil tanah bersumber dari cache pemanggilan resmi ISRIC SoilGrids sebelumnya.',
        tone: 'info',
        isOfficialApiResponse: true,
        isFieldObservation: false
      };
    case 'error':
      return {
        shortLabel: 'SoilGrids · API Error',
        longLabel: 'ISRIC SoilGrids · Kendala Akses API',
        sourceLabel: 'ISRIC SoilGrids v2.0',
        detailText: soil?.errorMessage || 'Endpoint ISRIC SoilGrids mengalami kendala server hulu.',
        tone: 'error',
        isOfficialApiResponse: false,
        isFieldObservation: false
      };
    case 'demo':
      return {
        shortLabel: 'SoilGrids · Demo Mode',
        longLabel: 'ISRIC SoilGrids · Nilai Disimulasikan',
        sourceLabel: 'Profil Tanah Simulasi',
        detailText: 'Sifat fisik tanah disimulasikan untuk skenario demonstrasi produk.',
        tone: 'info',
        isOfficialApiResponse: false,
        isFieldObservation: false
      };
    case 'fallback':
    default:
      return {
        shortLabel: 'SoilGrids · Fallback',
        longLabel: 'ISRIC SoilGrids · Regional fallback',
        sourceLabel: 'Profil Tanah Regional Terkalibrasi (Nusa Tenggara)',
        detailText: 'Respons SoilGrids tidak tersedia atau gagal divalidasi. Nilai tanah menggunakan profil regional terkalibrasi dan bukan observasi grid SoilGrids live.',
        tone: 'warning',
        isOfficialApiResponse: false,
        isFieldObservation: false
      };
  }
}

/**
 * Overall System Display Resolver (TopHeader & Dashboard Status)
 */
export function getOverallDisplayStatus(prov?: TerraShaftProvenance): SourceDisplayStatus {
  if (!prov) {
    return {
      shortLabel: 'MEMUAT DATA...',
      longLabel: 'MEMUAT TELEMETRI BIOFISIK...',
      sourceLabel: 'Sistem TerraShaft',
      detailText: 'Menghubungkan ke API NASA POWER & ISRIC SoilGrids...',
      tone: 'neutral',
      isOfficialApiResponse: false,
      isFieldObservation: false
    };
  }

  const nasa = prov.nasaPower;
  const soil = prov.isricSoilGrids;

  if (prov.overallMode === 'loading' || nasa.mode === 'loading' || soil.mode === 'loading') {
    return {
      shortLabel: 'MEMUAT DATA...',
      longLabel: 'MEMUAT TELEMETRI BIOFISIK...',
      sourceLabel: 'Sistem TerraShaft',
      detailText: 'Menghubungkan ke API NASA POWER & ISRIC SoilGrids...',
      tone: 'neutral',
      isOfficialApiResponse: false,
      isFieldObservation: false
    };
  }

  if (prov.overallMode === 'error') {
    return {
      shortLabel: 'KENDALA TELEMETRI',
      longLabel: 'KENDALA TELEMETRI HULU',
      sourceLabel: 'Sistem TerraShaft',
      detailText: prov.disclosureText,
      tone: 'error',
      isOfficialApiResponse: false,
      isFieldObservation: false
    };
  }

  if (prov.overallMode === 'demo') {
    return {
      shortLabel: 'DEMO MODE',
      longLabel: 'DEMO DATA · BUKAN OBSERVASI LIVE',
      sourceLabel: 'Simulasi Demo TerraShaft',
      detailText: 'Nilai disimulasikan untuk demonstrasi produk; belum diverifikasi sebagai data live.',
      tone: 'info',
      isOfficialApiResponse: false,
      isFieldObservation: false
    };
  }

  const isNasaOk = nasa.mode === 'live' || nasa.mode === 'cached';
  const isSoilOk = soil.mode === 'live' || soil.mode === 'cached';

  if (isNasaOk && isSoilOk) {
    return {
      shortLabel: 'NASA & SoilGrids API OK',
      longLabel: 'NASA POWER & SOILGRIDS API OK',
      sourceLabel: 'API NASA POWER & ISRIC SoilGrids',
      detailText: 'Respons API resmi diterima: baseline agroklimatologi historis 1-tahun dan profil tanah 0–30cm terverifikasi.',
      tone: 'success',
      isOfficialApiResponse: true,
      isFieldObservation: false
    };
  }

  if (isNasaOk && !isSoilOk) {
    return {
      shortLabel: 'NASA API OK · Soil fallback',
      longLabel: 'NASA POWER API · SOILGRIDS FALLBACK',
      sourceLabel: 'NASA POWER API & Fallback Regional Tanah',
      detailText: 'NASA POWER response diterima (baseline historis) · ISRIC SoilGrids menggunakan fallback regional.',
      tone: 'warning',
      isOfficialApiResponse: false,
      isFieldObservation: false
    };
  }

  if (!isNasaOk && isSoilOk) {
    return {
      shortLabel: 'SoilGrids API OK · NASA fallback',
      longLabel: 'SOILGRIDS API OK · NASA FALLBACK',
      sourceLabel: 'ISRIC SoilGrids & Fallback Regional Iklim',
      detailText: 'ISRIC SoilGrids response diterima · NASA POWER menggunakan klimatologi regional terkalibrasi.',
      tone: 'warning',
      isOfficialApiResponse: false,
      isFieldObservation: false
    };
  }

  return {
    shortLabel: 'REGIONAL FALLBACK',
    longLabel: 'REGIONAL FALLBACK MODEL',
    sourceLabel: 'Model Agroklimat & Pedologi Regional Terkalibrasi',
    detailText: 'Failover aktif: API eksternal tidak tersedia langsung; menggunakan model regional Nusa Tenggara.',
    tone: 'warning',
    isOfficialApiResponse: false,
    isFieldObservation: false
  };
}

/**
 * Action Sheet Provenance Block Resolver
 */
export function getActionSheetProvenanceDisplay(prov?: TerraShaftProvenance): ActionSheetProvenanceDisplay {
  const nasaStatus = getNasaPowerDisplayStatus(prov);
  const soilStatus = getSoilGridsDisplayStatus(prov);
  const overall = getOverallDisplayStatus(prov);

  let banner = '';
  let scientificNote = '';

  const nasaLiveOrCached = prov?.nasaPower.mode === 'live' || prov?.nasaPower.mode === 'cached';
  const soilLiveOrCached = prov?.isricSoilGrids.mode === 'live' || prov?.isricSoilGrids.mode === 'cached';

  if (nasaLiveOrCached && soilLiveOrCached) {
    banner = 'Status sumber data: NASA POWER dan ISRIC SoilGrids berhasil merespons API';
    scientificNote = 'NASA POWER dan ISRIC SoilGrids berhasil merespons API. Tetap validasi rekomendasi dengan kondisi lapangan dan penyuluh setempat.';
  } else if (nasaLiveOrCached && !soilLiveOrCached) {
    banner = 'Status sumber data: NASA POWER (API OK / historical baseline) · ISRIC SoilGrids (Regional fallback)';
    scientificNote = 'NASA POWER berhasil diakses melalui API. Nilai ini merupakan baseline agroklimatologi historis, bukan sensor real-time di lahan. Profil tanah sedang menggunakan fallback regional karena SoilGrids tidak tersedia.';
  } else if (!nasaLiveOrCached && soilLiveOrCached) {
    banner = 'Status sumber data: ISRIC SoilGrids (API OK) · NASA POWER (Regional fallback)';
    scientificNote = 'ISRIC SoilGrids berhasil diakses melalui API (0–30cm). Data iklim sedang menggunakan fallback klimatologi regional terkalibrasi.';
  } else if (prov?.overallMode === 'demo') {
    banner = 'Status sumber data: DEMO MODE — Bukan observasi live; disimulasikan untuk demonstrasi';
    scientificNote = 'Data demo/simulasi aktif. Nilai bukan observasi lapangan langsung; gunakan untuk evaluasi antarmuka dan logika optimasi.';
  } else {
    banner = 'Status sumber data: REGIONAL FALLBACK — Model agroklimat & pedologi regional terkalibrasi';
    scientificNote = 'Data demo/fallback aktif. Nilai bukan observasi lapangan langsung. Rekomendasi dihitung menggunakan model agroklimat dan pedologi regional terkalibrasi Nusa Tenggara.';
  }

  const compactNasa = nasaStatus.isOfficialApiResponse
    ? 'API OK / historical baseline'
    : nasaStatus.shortLabel.includes('Demo')
    ? 'simulasi demo'
    : 'fallback regional';

  const compactSoil = soilStatus.isOfficialApiResponse
    ? 'API OK (0-30cm)'
    : soilStatus.shortLabel.includes('Demo')
    ? 'simulasi demo'
    : 'fallback regional';

  return {
    compactSourceBlock: {
      nasa: `NASA POWER: ${compactNasa}`,
      soil: `ISRIC SoilGrids: ${compactSoil}`
    },
    summaryBanner: banner,
    scientificNote,
    overallTone: overall.tone
  };
}
