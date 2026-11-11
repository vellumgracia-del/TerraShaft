'use client';

import React, { useState } from 'react';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import {
  Satellite,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Layers,
  Info
} from 'lucide-react';
import { DataMode } from '@/types/provenance';

import {
  getNasaPowerDisplayStatus,
  getSoilGridsDisplayStatus
} from '@/lib/provenance';

export default function DataSourceProvenanceCard() {
  const { climateData, soilData, provenance } = useTerraShaftStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const prov = provenance;
  const nasaProv = prov?.nasaPower;
  const soilProv = prov?.isricSoilGrids;
  const overallMode = prov?.overallMode ?? 'fallback';

  const nasaStatus = getNasaPowerDisplayStatus(prov);
  const soilStatus = getSoilGridsDisplayStatus(prov);

  const getCleanStatusLabel = (mode: DataMode) => {
    switch (mode) {
      case 'live':
        return 'API RESPONSE RECEIVED';
      case 'cached':
        return 'CACHED API DATA';
      case 'fallback':
        return 'REGIONAL ESTIMATE (FAILOVER)';
      case 'demo':
        return 'SIMULATED DEMO';
      case 'error':
        return 'SERVICE UNAVAILABLE';
      case 'loading':
      default:
        return 'SYNCING TELEMETRY...';
    }
  };

  const nasaLabel = getCleanStatusLabel(nasaProv?.mode ?? 'fallback');
  const soilLabel = getCleanStatusLabel(soilProv?.mode ?? 'fallback');

  const formatTime = (iso?: string) => {
    if (!iso) return '--:--';
    try {
      return new Date(iso).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return '--:--';
    }
  };

  return (
    <div id="data-sources" className="bg-[#20242B] border border-[#2C313A] rounded-[4px] p-5 lg:p-6 flex flex-col gap-5 text-[#F1F3F5]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#2C313A]">
        <div className="flex items-center gap-3">
          <Satellite className="w-5 h-5 text-[#C1C7CD] shrink-0 stroke-[1.75]" />
          <div>
            <h2 className="text-[15px] font-medium text-[#F1F3F5] tracking-tight">
              Status Data Observasi & Provenansi Ilmiah
            </h2>
            <p className="text-[12px] text-[#8A949E] mt-0.5">
              Transparansi sumber telemetri satelit NASA POWER dan pemetaan tanah ISRIC SoilGrids v2.0
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-mono text-[#00C2CC] hover:underline flex items-center gap-1"
        >
          <span>{isExpanded ? 'Ringkas' : 'Rincian Lengkap'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Quiet Demo Notice only when in pure demo mode */}
      {overallMode === 'demo' && (
        <div className="p-3 rounded-[4px] bg-[#16191E] border border-[#2C313A] text-xs font-mono text-[#9BA3AE] flex items-center gap-2">
          <Info className="w-4 h-4 text-[#8A949E] shrink-0" />
          <span>Mode Demo: Nilai iklim dan tanah disimulasikan untuk evaluasi alur kerja platform.</span>
        </div>
      )}

      {/* Main Provenance Grid (2 Columns: NASA & ISRIC) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. NASA POWER Climate */}
        <div className="p-4 rounded-[4px] bg-[#16191E] border border-[#2C313A] flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-medium text-[#F1F3F5]">
              Iklim & Atmosfer (NASA POWER)
            </span>
            <span className={`px-2 py-0.5 rounded-[3px] border font-mono text-[10.5px] ${
              nasaProv?.mode === 'live'
                ? 'bg-[#163A40] text-[#00C2CC] border-[#009DA5]/40'
                : 'bg-[#20242B] text-[#C1C7CD] border-[#2C313A]'
            }`}>
              {nasaLabel}
            </span>
          </div>

          <div className="text-[12px] text-[#9BA3AE] flex flex-col gap-1.5 pt-1.5 border-t border-[#2C313A]">
            <div className="flex justify-between gap-2">
              <span className="text-[#8A949E]">Penyedia & Dataset:</span>
              <span className="font-mono text-[#F1F3F5] text-right truncate max-w-[220px]">
                {nasaProv?.dataset || 'NASA POWER Climatology'}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-[#8A949E]">Waktu Pengambilan:</span>
              <span className="font-mono text-[#F1F3F5]">{formatTime(climateData?.fetchedAt)}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-[#8A949E]">Status Observasi:</span>
              <span className="font-mono text-[#F1F3F5] text-right truncate max-w-[220px]">
                {nasaStatus.shortLabel}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-[#8A949E]">Periode Observasi:</span>
              <span className="font-mono text-[#F1F3F5] text-right truncate max-w-[220px]">
                {climateData?.observationPeriod || 'Historical Baseline 1-Tahun'}
              </span>
            </div>
          </div>

          <p className="text-[11.5px] text-[#8A949E] bg-[#20242B] p-2.5 rounded-[3px] border border-[#2C313A] leading-relaxed">
            {nasaStatus.detailText}
          </p>

          {climateData?.fallbackReason && (
            <div className="p-2.5 rounded-[3px] bg-[#20242B] border border-[#2C313A] text-[11px] font-mono text-[#8A949E] flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-[#8A949E] shrink-0 mt-0.5" />
              <span>Keterangan: {climateData.fallbackReason}</span>
            </div>
          )}
        </div>

        {/* 2. ISRIC SoilGrids Profile */}
        <div className="p-4 rounded-[4px] bg-[#16191E] border border-[#2C313A] flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-medium text-[#F1F3F5]">
              Fisika Tanah (ISRIC SoilGrids)
            </span>
            <span className={`px-2 py-0.5 rounded-[3px] border font-mono text-[10.5px] ${
              soilProv?.mode === 'live'
                ? 'bg-[#163A40] text-[#00C2CC] border-[#009DA5]/40'
                : 'bg-[#20242B] text-[#C1C7CD] border-[#2C313A]'
            }`}>
              {soilLabel}
            </span>
          </div>

          <div className="text-[12px] text-[#9BA3AE] flex flex-col gap-1.5 pt-1.5 border-t border-[#2C313A]">
            <div className="flex justify-between gap-2">
              <span className="text-[#8A949E]">Penyedia & Model:</span>
              <span className="font-mono text-[#F1F3F5] text-right truncate max-w-[220px]">
                {soilProv?.dataset || 'ISRIC SoilGrids 250m v2.0'}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-[#8A949E]">Waktu Pengambilan:</span>
              <span className="font-mono text-[#F1F3F5]">{formatTime(soilData?.fetchedAt)}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-[#8A949E]">Status Observasi:</span>
              <span className="font-mono text-[#F1F3F5] text-right truncate max-w-[220px]">
                {soilStatus.shortLabel}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-[#8A949E]">Lapisan Kedalaman:</span>
              <span className="font-mono text-[#F1F3F5] text-right truncate max-w-[220px]">
                {soilData?.observationPeriod || 'Standard Depth Layer 0-30cm'}
              </span>
            </div>
          </div>

          <p className="text-[11.5px] text-[#8A949E] bg-[#20242B] p-2.5 rounded-[3px] border border-[#2C313A] leading-relaxed">
            {soilStatus.detailText}
          </p>

          {soilData?.fallbackReason && (
            <div className="p-2.5 rounded-[3px] bg-[#20242B] border border-[#2C313A] text-[11px] font-mono text-[#8A949E] flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-[#8A949E] shrink-0 mt-0.5" />
              <span>Keterangan: {soilData.fallbackReason}</span>
            </div>
          )}
        </div>
      </div>

      {/* Keterbatasan Data: Quiet Technical Note */}
      <div className="p-4 rounded-[4px] bg-[#16191E] border border-[#2C313A] flex flex-col gap-2 text-[12px] text-[#9BA3AE]">
        <div className="flex items-center gap-2 font-medium text-[#F1F3F5]">
          <Layers className="w-4 h-4 text-[#8A949E]" />
          <span>Keterbatasan Data Telemetri</span>
        </div>
        <p className="leading-relaxed">
          TerraShaft menggunakan kombinasi data observasi API satelit resmi dan model pedologi terkalibrasi regional saat layanan hulu mengalami kendala jaringan. Nilai estimasi regional dirancang untuk perencanaan skenario rotasi tanaman dan perlu divalidasi dengan pengamatan fisik di lahan budidaya.
        </p>
      </div>

      {/* Expanded Details on Sensors and Models */}
      {isExpanded && (
        <div className="p-4 rounded-[4px] bg-[#16191E] border border-[#2C313A] flex flex-col gap-2 text-xs text-[#9BA3AE]">
          <span className="font-medium text-[#F1F3F5]">Instrumen Asimilasi Satelit & Model:</span>
          <ul className="list-disc pl-5 space-y-1 text-[#8A949E] font-mono text-[11.5px]">
            <li><strong>NASA SMAP (Soil Moisture Active Passive):</strong> Level-4 Model-Assimilated Root-Zone Soil Wetness (0-100cm).</li>
            <li><strong>NASA POWER Precipitation:</strong> NASA-derived precipitation estimate via NASA POWER daily PRECTOTCORR.</li>
            <li><strong>NASA CERES & MERRA-2:</strong> Solar Surface Radiation & Evapotranspiration Hargreaves-Samani via NASA POWER.</li>
            <li><strong>ISRIC SoilGrids 250m v2.0:</strong> Pedotransfer Sand, Clay, Silt, C-Organic, pH, dan CEC (atau profil regional terkalibrasi saat failover).</li>
          </ul>
        </div>
      )}

      {/* Required Scientific Disclaimer: Low Chrome */}
      <div className="p-3.5 rounded-[4px] bg-[#16191E] border border-[#2C313A] flex items-start gap-2.5 text-xs text-[#8A949E]">
        <ShieldCheck className="w-4 h-4 text-[#009DA5] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          TerraShaft adalah alat eksplorasi skenario berbasis observasi NASA, profil tanah, dan aturan agronomi. Rekomendasi perlu divalidasi dengan penyuluh dan kondisi lapangan lokal sebelum digunakan sebagai keputusan tanam.
        </p>
      </div>
    </div>
  );
}
