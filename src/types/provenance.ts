/**
 * TerraShaft Provenance & Data Mode Type Contracts
 * Scientific integrity model distinguishing Live, Cached, Fallback, Demo, Error, and Loading modes.
 */

import { ClimateData } from './climate';
import { SoilData } from './agronomy';

export type DataMode =
  | 'demo'
  | 'live'
  | 'cached'
  | 'fallback'
  | 'error'
  | 'loading';

export type DataProvenance = {
  mode: DataMode;
  provider: string;
  dataset?: string;
  fetchedAt?: string;
  observationPeriod?: string;
  isOfficialObservation: boolean;
  isSimulated: boolean;
  isFallback: boolean;
  isCached: boolean;
  fallbackReason?: string | null;
  errorMessage?: string | null;
  requestCoordinates?: {
    latitude: number;
    longitude: number;
  };
};

export interface TerraShaftProvenance {
  nasaPower: DataProvenance;
  nasaGpm?: DataProvenance;
  nasaSmap?: DataProvenance;
  isricSoilGrids: DataProvenance;
  overallMode: DataMode;
  headerBadge: {
    label: string;
    text: string;
    sublabel: string;
    style: string;
    dot: string;
    isVerifiedLive: boolean;
  };
  disclosureText: string;
}

/**
 * Resolves truthful provenance for NASA POWER and ISRIC SoilGrids
 */
export function resolveTerraShaftProvenance(
  climate: ClimateData | null,
  soil: SoilData | null,
  isLoading = false,
  errorMsg: string | null = null,
  loadingSources?: { nasaPower?: boolean; soilGrids?: boolean }
): TerraShaftProvenance {
  const isNasaLoading = isLoading && (loadingSources ? loadingSources.nasaPower !== false : true);
  const isSoilLoading = isLoading && (loadingSources ? loadingSources.soilGrids !== false : true);

  if (isNasaLoading && isSoilLoading) {
    const loadingProv: DataProvenance = {
      mode: 'loading',
      provider: 'Telemetri Satelit NASA & ISRIC',
      isOfficialObservation: false,
      isSimulated: false,
      isFallback: false,
      isCached: false
    };
    return {
      nasaPower: { ...loadingProv, provider: 'NASA POWER Agroclimatology' },
      isricSoilGrids: { ...loadingProv, provider: 'ISRIC SoilGrids v2.0' },
      overallMode: 'loading',
      headerBadge: {
        label: 'MEMUAT DATA...',
        text: 'MEMUAT DATA...',
        sublabel: 'Menghubungkan ke API NASA POWER & ISRIC SoilGrids',
        style: 'bg-[#F5F7F4] text-[#7B8681] border-[#E4EAE6]',
        dot: 'bg-[#7B8681]',
        isVerifiedLive: false
      },
      disclosureText: 'Sedang mengambil data agroklimatologi NASA POWER dan profil tanah ISRIC SoilGrids...'
    };
  }

  if (errorMsg) {
    const errorProv: DataProvenance = {
      mode: 'error',
      provider: 'Proxy Telemetri TerraShaft',
      isOfficialObservation: false,
      isSimulated: false,
      isFallback: false,
      isCached: false,
      errorMessage: errorMsg
    };
    return {
      nasaPower: errorProv,
      isricSoilGrids: errorProv,
      overallMode: 'error',
      headerBadge: {
        label: 'KENDALA TELEMETRI',
        text: 'KENDALA TELEMETRI',
        sublabel: errorMsg,
        style: 'bg-[#FDEAEA] text-[#E11D48] border-[#FECDD3]',
        dot: 'bg-[#E11D48]',
        isVerifiedLive: false
      },
      disclosureText: `Kendala jaringan/validasi telemetri: ${errorMsg}`
    };
  }

  // NASA POWER Provenance
  const isNasaCached = Boolean(climate?.cached);
  const isNasaFallback = climate?.source === 'FALLBACK_CLIMATOLOGY';
  const isNasaLive = climate?.source === 'NASA_POWER_LIVE' && !isNasaFallback;
  const isNasaDemo = !climate || climate.source === ('DEMO_SIMULATION' as string);

  const nasaMode: DataMode = isNasaLoading
    ? 'loading'
    : isNasaFallback
    ? 'fallback'
    : isNasaCached
    ? 'cached'
    : isNasaLive
    ? 'live'
    : 'demo';

  const nasaPower: DataProvenance = {
    mode: nasaMode,
    provider: 'NASA POWER Agroclimatology',
    dataset: 'Daily Point Agroclimatology (Historical 1-Year Baseline)',
    fetchedAt: climate?.fetchedAt,
    observationPeriod: climate?.observationPeriod || (isNasaFallback ? 'Klimatologi Regional Nusa Tenggara' : 'Baseline 1 Tahun Historis'),
    isOfficialObservation: isNasaLive || (isNasaCached && !isNasaFallback),
    isSimulated: isNasaFallback || isNasaDemo,
    isFallback: isNasaFallback,
    isCached: isNasaCached,
    fallbackReason: climate?.fallbackReason
  };

  // ISRIC SoilGrids Provenance
  const isSoilCached = Boolean(soil?.cached);
  const isSoilFallback = soil?.source === 'REGIONAL_FALLBACK';
  const isSoilLive = soil?.source === 'ISRIC_SOILGRIDS_LIVE' && !isSoilFallback;
  const isSoilDemo = !soil || soil.source === ('DEMO_SIMULATION' as string);

  const soilMode: DataMode = isSoilLoading
    ? 'loading'
    : isSoilFallback
    ? 'fallback'
    : isSoilCached
    ? 'cached'
    : isSoilLive
    ? 'live'
    : 'demo';

  const isricSoilGrids: DataProvenance = {
    mode: soilMode,
    provider: 'ISRIC SoilGrids v2.0 REST API (WCS/REST)',
    dataset: 'Global Soil Grids 250m Layer 0-30cm',
    fetchedAt: soil?.fetchedAt,
    observationPeriod: soil?.observationPeriod || (isSoilFallback ? 'Profil Tanah Terkalibrasi Regional' : 'Standar Kedalaman 0-30cm (ISRIC v2.0)'),
    isOfficialObservation: isSoilLive || (isSoilCached && !isSoilFallback),
    isSimulated: isSoilFallback || isSoilDemo,
    isFallback: isSoilFallback,
    isCached: isSoilCached,
    fallbackReason: soil?.fallbackReason
  };

  // Determine Truthful Overall Mode
  let overallMode: DataMode = 'live';
  if (isNasaLoading || isSoilLoading) {
    overallMode = 'loading';
  } else if (isNasaDemo || isSoilDemo) {
    overallMode = 'demo';
  } else if (isNasaFallback || isSoilFallback) {
    overallMode = 'fallback';
  } else if (isNasaCached || isSoilCached) {
    overallMode = 'cached';
  } else if (!isNasaLive || !isSoilLive) {
    overallMode = 'demo';
  }

  // Header Badge and Truthful Disclosure Text
  let headerBadge = {
    label: 'NASA POWER & SOILGRIDS API OK',
    text: 'NASA POWER & SOILGRIDS API OK',
    sublabel: 'Respons API diterima · baseline historis & profil tanah terverifikasi',
    style: 'bg-[#E7F5EE] text-[#12A875] border-[#A7F3D0]',
    dot: 'bg-[#12A875]',
    isVerifiedLive: true
  };
  let disclosureText =
    'Respons API NASA POWER (baseline historis 1-tahun) dan profil tanah ISRIC SoilGrids berhasil diterima.';

  if (isNasaLoading && isSoilLoading) {
    headerBadge = {
      label: 'MEMUAT DATA...',
      text: 'MEMUAT DATA...',
      sublabel: 'Menghubungkan ke API NASA POWER & ISRIC SoilGrids',
      style: 'bg-[#F5F7F4] text-[#7B8681] border-[#E4EAE6]',
      dot: 'bg-[#7B8681]',
      isVerifiedLive: false
    };
    disclosureText = 'Sedang mengambil data agroklimatologi NASA POWER dan profil tanah ISRIC SoilGrids...';
  } else if (isNasaLoading) {
    headerBadge = {
      label: 'MEMUAT NASA POWER...',
      text: 'MEMUAT NASA POWER...',
      sublabel: 'ISRIC SoilGrids selesai · Menunggu data iklim',
      style: 'bg-[#F5F7F4] text-[#7B8681] border-[#E4EAE6]',
      dot: 'bg-[#7B8681]',
      isVerifiedLive: false
    };
    disclosureText = 'Profil tanah ISRIC SoilGrids telah diterima; sedang menunggu data agroklimat NASA POWER...';
  } else if (isSoilLoading) {
    headerBadge = {
      label: 'MEMUAT SOILGRIDS...',
      text: 'MEMUAT SOILGRIDS...',
      sublabel: 'NASA POWER selesai · Menunggu profil tanah',
      style: 'bg-[#F5F7F4] text-[#7B8681] border-[#E4EAE6]',
      dot: 'bg-[#7B8681]',
      isVerifiedLive: false
    };
    disclosureText = 'Data iklim NASA POWER telah diterima; sedang menunggu profil tanah ISRIC SoilGrids...';
  } else if (overallMode === 'demo') {
    headerBadge = {
      label: 'DEMO DATA · BUKAN OBSERVASI LIVE',
      text: 'DEMO DATA · BUKAN OBSERVASI LIVE',
      sublabel: 'Nilai disimulasikan untuk demonstrasi produk',
      style: 'bg-[#FAF5FF] text-[#7E22CE] border-[#E9D5FF]',
      dot: 'bg-[#7E22CE]',
      isVerifiedLive: false
    };
    disclosureText =
      'Mode Demo aktif. Nilai iklim, tanah, dan rekomendasi yang ditampilkan digunakan untuk demonstrasi produk dan belum seluruhnya berasal dari observasi API resmi secara langsung.';
  } else if (isNasaFallback && isSoilFallback) {
    headerBadge = {
      label: 'REGIONAL FALLBACK',
      text: 'REGIONAL FALLBACK',
      sublabel: 'Failover: model agroklimat & pedologi regional terkalibrasi',
      style: 'bg-[#FFF4D8] text-[#D97706] border-[#FDE68A]',
      dot: 'bg-[#D97706]',
      isVerifiedLive: false
    };
    disclosureText =
      'Mode Failover Regional: Permintaan API NASA POWER dan ISRIC SoilGrids tidak tersedia secara langsung. Menampilkan data klimatologi dan pedologi regional terkalibrasi Nusa Tenggara untuk eksplorasi skenario.';
  } else if (isNasaLive && isSoilFallback) {
    headerBadge = {
      label: 'NASA POWER API · SOILGRIDS FALLBACK',
      text: 'NASA POWER API · SOILGRIDS FALLBACK',
      sublabel: 'NASA POWER response diterima · ISRIC SoilGrids menggunakan fallback regional',
      style: 'bg-[#FFF4D8] text-[#D97706] border-[#FDE68A]',
      dot: 'bg-[#D97706]',
      isVerifiedLive: false
    };
    disclosureText =
      'Sebagian Observasi Resmi: NASA POWER terhubung via API (baseline historis 1-tahun), namun ISRIC SoilGrids menggunakan profil tanah regional terkalibrasi akibat kendala koneksi hulu.';
  } else if (isNasaFallback && isSoilLive) {
    headerBadge = {
      label: 'SOILGRIDS API OK · NASA FALLBACK',
      text: 'SOILGRIDS API OK · NASA FALLBACK',
      sublabel: 'ISRIC SoilGrids response diterima · NASA POWER failover regional',
      style: 'bg-[#FFF4D8] text-[#D97706] border-[#FDE68A]',
      dot: 'bg-[#D97706]',
      isVerifiedLive: false
    };
    disclosureText =
      'Sebagian Observasi Resmi: ISRIC SoilGrids terhubung via API, namun NASA POWER menggunakan data klimatologi regional terkalibrasi akibat kendala koneksi hulu.';
  } else if (isNasaCached || isSoilCached) {
    const cachedSources = [
      isNasaCached ? 'NASA POWER' : null,
      isSoilCached ? 'SoilGrids' : null
    ].filter(Boolean).join(' & ');
    headerBadge = {
      label: `CACHED: ${cachedSources.toUpperCase()}`,
      text: `CACHED: ${cachedSources.toUpperCase()}`,
      sublabel: 'Data tersimpan di cache lokal',
      style: 'bg-[#EAF5F4] text-[#0284C7] border-[#BAE6FD]',
      dot: 'bg-[#0284C7]',
      isVerifiedLive: false
    };
    disclosureText = `Data telemetri ${cachedSources} disajikan dari memori cache lokal untuk respons cepat.`;
  }

  return {
    nasaPower,
    isricSoilGrids,
    overallMode,
    headerBadge,
    disclosureText
  };
}
