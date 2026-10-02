'use client';

import React, { useState } from 'react';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import {
  Satellite,
  AlertTriangle,
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

  const getBadgeStyle = (mode: DataMode) => {
    switch (mode) {
      case 'live':
        return {
          label: 'API RESPONSE RECEIVED',
          style: 'bg-[#E7F5EE] text-[#12A875] border-[#A7F3D0]',
          dot: 'bg-[#12A875]'
        };
      case 'cached':
        return {
          label: 'CACHED API DATA',
          style: 'bg-[#EAF5F4] text-[#0284C7] border-[#BAE6FD]',
          dot: 'bg-[#0284C7]'
        };
      case 'fallback':
        return {
          label: 'REGIONAL FALLBACK',
          style: 'bg-[#FFF4D8] text-[#D97706] border-[#FDE68A]',
          dot: 'bg-[#D97706]'
        };
      case 'demo':
        return {
          label: 'DEMO DATA — BUKAN LIVE',
          style: 'bg-[#F3E8FF] text-[#7E22CE] border-[#E9D5FF]',
          dot: 'bg-[#7E22CE]'
        };
      case 'error':
        return {
          label: 'DATA SOURCE ERROR',
          style: 'bg-[#FDEAEA] text-[#E11D48] border-[#FECDD3]',
          dot: 'bg-[#E11D48]'
        };
      case 'loading':
      default:
        return {
          label: 'MEMUAT DATA...',
          style: 'bg-[#F5F7F4] text-[#7B8681] border-[#E4EAE6]',
          dot: 'bg-[#7B8681]'
        };
    }
  };

  const nasaBadge = getBadgeStyle(nasaProv?.mode ?? 'fallback');
  const soilBadge = getBadgeStyle(soilProv?.mode ?? 'fallback');

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

  const isAnyDemo = overallMode === 'demo' || nasaProv?.isSimulated || soilProv?.isSimulated;
  const isAnyFallback = nasaProv?.isFallback || soilProv?.isFallback;

  return (
    <div id="data-sources" className="agri-card p-5 lg:p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E4EAE6]">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-[#EAF5F4] text-[#0284C7]">
            <Satellite className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-base font-bold text-[#17231F] tracking-tight">
              Status Data Observasi & Provenansi Ilmiah
            </h2>
            <p className="text-xs text-[#7B8681]">
              Transparansi sumber telemetri satelit NASA POWER dan pemetaan tanah ISRIC SoilGrids v2.0
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-semibold text-[#12A875] hover:underline flex items-center gap-1"
        >
          <span>{isExpanded ? 'Ringkas' : 'Rincian Lengkap'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Demo / Simulation Warning Banner if Demo/Fallback */}
      {isAnyDemo && (
        <div className="p-3.5 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] flex items-start gap-2.5 text-xs text-[#6B21A8]">
          <Info className="w-4 h-4 text-[#9333EA] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">DEMO DATA — Nilai disimulasikan untuk demonstrasi produk.</span>
            <p className="mt-0.5 text-[#7E22CE] leading-relaxed">
              Mode Demo aktif. Nilai iklim, tanah, dan rekomendasi yang ditampilkan digunakan untuk demonstrasi produk dan belum seluruhnya berasal dari observasi API resmi secara langsung.
            </p>
          </div>
        </div>
      )}

      {/* Main Provenance Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. NASA POWER Climate */}
        <div className="p-4 rounded-xl bg-[#F5F7F4] border border-[#E4EAE6] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#17231F] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
              Iklim & Atmosfer (NASA POWER)
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${nasaBadge.style}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${nasaBadge.dot}`} />
              <span>{nasaBadge.label}</span>
            </span>
          </div>

          <div className="text-xs text-[#52605B] flex flex-col gap-1 mt-1">
            <div className="flex justify-between">
              <span className="text-[#7B8681]">Penyedia & Dataset:</span>
              <span className="font-medium text-[#17231F] text-right truncate max-w-[200px]">
                {nasaProv?.dataset || 'NASA POWER Climatology'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7B8681]">Waktu Pengambilan:</span>
              <span className="font-mono font-semibold text-[#17231F]">{formatTime(climateData?.fetchedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7B8681]">Status Observasi:</span>
              <span className="font-medium text-[#17231F] text-right truncate max-w-[200px]" title={nasaStatus.detailText}>
                {nasaProv?.mode === 'live'
                  ? 'API Response Received (Baseline Historis)'
                  : nasaProv?.isCached
                  ? 'Cached API Data'
                  : nasaProv?.mode === 'demo'
                  ? 'Simulasi Demo'
                  : 'Estimasi Regional (Fallback)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7B8681]">Periode Observasi:</span>
              <span className="font-medium text-[#17231F] text-right truncate max-w-[200px]" title={climateData?.observationPeriod}>
                {climateData?.observationPeriod || 'Historical Baseline 1-Tahun'}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-[#7B8681] italic mt-1 bg-white p-2 rounded-lg border border-[#E4EAE6]">
            {nasaStatus.detailText}
          </p>

          {climateData?.fallbackReason && (
            <div className="mt-2 p-2 rounded-lg bg-[#FFF4D8] border border-[#FDE68A] text-[11px] text-[#D97706] flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{climateData.fallbackReason}</span>
            </div>
          )}
        </div>

        {/* 2. ISRIC SoilGrids Profile */}
        <div className="p-4 rounded-xl bg-[#F5F7F4] border border-[#E4EAE6] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#17231F] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#12A875]" />
              Fisika Tanah (ISRIC SoilGrids)
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${soilBadge.style}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${soilBadge.dot}`} />
              <span>{soilBadge.label}</span>
            </span>
          </div>

          <div className="text-xs text-[#52605B] flex flex-col gap-1 mt-1">
            <div className="flex justify-between">
              <span className="text-[#7B8681]">Penyedia & Model:</span>
              <span className="font-medium text-[#17231F] text-right truncate max-w-[200px]">
                {soilProv?.dataset || 'ISRIC SoilGrids 250m v2.0'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7B8681]">Waktu Pengambilan:</span>
              <span className="font-mono font-semibold text-[#17231F]">{formatTime(soilData?.fetchedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7B8681]">Status Observasi:</span>
              <span className="font-medium text-[#17231F] text-right truncate max-w-[200px]" title={soilStatus.detailText}>
                {soilProv?.mode === 'live'
                  ? 'API Response Received (0–30cm)'
                  : soilProv?.isCached
                  ? 'Cached Soil Profile'
                  : soilProv?.mode === 'demo'
                  ? 'Simulasi Demo'
                  : 'Profil Regional Terkalibrasi (Fallback)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7B8681]">Lapisan Kedalaman:</span>
              <span className="font-medium text-[#17231F] text-right truncate max-w-[200px]" title={soilData?.observationPeriod}>
                {soilData?.observationPeriod || 'Standard Depth Layer 0–30cm'}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-[#7B8681] italic mt-1 bg-white p-2 rounded-lg border border-[#E4EAE6]">
            {soilStatus.detailText}
          </p>

          {soilData?.fallbackReason && (
            <div className="mt-2 p-2 rounded-lg bg-[#FFF4D8] border border-[#FDE68A] text-[11px] text-[#D97706] flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{soilData.fallbackReason}</span>
            </div>
          )}
        </div>
      </div>

      {/* Section 14 Requirement: Explicit Keterbatasan Data Box */}
      <div className="p-4 rounded-xl bg-[#F5F7F4] border border-[#E4EAE6] flex flex-col gap-2 text-xs text-[#52605B]">
        <div className="flex items-center gap-1.5 font-bold text-[#17231F]">
          <Layers className="w-4 h-4 text-[#0284C7]" />
          <span>Keterbatasan Data</span>
        </div>
        <p className="leading-relaxed text-[#52605B]">
          TerraShaft saat ini dapat menggunakan kombinasi data demo, cache, fallback regional, dan respons API tergantung ketersediaan sumber. Status setiap sumber ditampilkan secara terpisah di atas. Nilai demo dan fallback tidak boleh diperlakukan sebagai observasi lapangan langsung.
        </p>
        {isAnyFallback && (
          <p className="text-[11px] text-[#D97706] bg-[#FFF4D8] p-2 rounded-lg border border-[#FDE68A]">
            Saat ini deployment menggunakan data fallback regional atau demo untuk sebagian sumber telemetri karena keterbatasan akses jaringan/upstream service. Integrasi API resmi perlu diverifikasi sebelum digunakan untuk keputusan budidaya nyata.
          </p>
        )}
      </div>

      {/* Expanded Details on Sensors and Models */}
      {isExpanded && (
        <div className="p-4 rounded-xl bg-[#F5F7F4] border border-[#E4EAE6] flex flex-col gap-2 text-xs text-[#52605B]">
          <span className="font-bold text-[#17231F]">Instrumen Asimilasi Satelit & Model:</span>
          <ul className="list-disc pl-5 space-y-1 text-[#7B8681]">
            <li><strong>NASA SMAP (Soil Moisture Active Passive):</strong> Level-4 Model-Assimilated Root-Zone Soil Wetness (0–100cm).</li>
            <li><strong>NASA POWER Precipitation:</strong> NASA-derived precipitation estimate via NASA POWER daily PRECTOTCORR.</li>
            <li><strong>NASA CERES & MERRA-2:</strong> Solar Surface Radiation & Evapotranspiration Hargreaves-Samani via NASA POWER.</li>
            <li><strong>ISRIC SoilGrids 250m v2.0:</strong> Pedotransfer Sand, Clay, Silt, C-Organic, pH, dan CEC (atau profil regional terkalibrasi saat failover).</li>
          </ul>
        </div>
      )}

      {/* Required Scientific Disclaimer */}
      <div className="p-3.5 rounded-xl bg-[#E7F5EE] border border-[#A7F3D0] flex items-start gap-2.5 text-xs text-[#17231F]">
        <ShieldCheck className="w-4 h-4 text-[#12A875] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          TerraShaft adalah alat eksplorasi skenario berbasis observasi NASA, profil tanah, dan aturan agronomi. Rekomendasi perlu divalidasi dengan penyuluh dan kondisi lapangan lokal sebelum digunakan sebagai keputusan tanam.
        </p>
      </div>
    </div>
  );
}
