'use client';

import React, { useState } from 'react';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import {
  Satellite,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ShieldCheck
} from 'lucide-react';

export default function DataSourceProvenanceCard() {
  const { climateData, soilData } = useTerraShaftStore();
  const [isExpanded, setIsExpanded] = useState(false);

  // Status helper
  const getSourceBadge = (source?: string, cached?: boolean) => {
    if (cached) {
      return {
        label: 'CACHED DATA',
        style: 'bg-[#EAF5F4] text-[#0284C7] border-[#BAE6FD]',
        dot: 'bg-[#0284C7]'
      };
    }
    if (source === 'NASA_POWER_LIVE' || source === 'ISRIC_SOILGRIDS_LIVE') {
      return {
        label: 'LIVE STREAM',
        style: 'bg-[#E7F5EE] text-[#12A875] border-[#A7F3D0]',
        dot: 'bg-[#12A875]'
      };
    }
    return {
      label: 'REGIONAL FALLBACK',
      style: 'bg-[#FFF4D8] text-[#D97706] border-[#FDE68A]',
      dot: 'bg-[#D97706]'
    };
  };

  const climateBadge = getSourceBadge(climateData?.source, climateData?.cached);
  const soilBadge = getSourceBadge(soilData?.source, soilData?.cached);

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

      {/* Main Provenance Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. NASA POWER Climate */}
        <div className="p-4 rounded-xl bg-[#F5F7F4] border border-[#E4EAE6] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#17231F] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
              Iklim & Atmosfer (NASA POWER)
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${climateBadge.style}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${climateBadge.dot}`} />
              <span>{climateBadge.label}</span>
            </span>
          </div>

          <div className="text-xs text-[#52605B] flex flex-col gap-1 mt-1">
            <div className="flex justify-between">
              <span className="text-[#7B8681]">Waktu Fetch/Cache:</span>
              <span className="font-mono font-semibold text-[#17231F]">{formatTime(climateData?.fetchedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7B8681]">Periode Observasi:</span>
              <span className="font-medium text-[#17231F] text-right truncate max-w-[220px]" title={climateData?.observationPeriod}>
                {climateData?.observationPeriod || 'Historical Baseline 1-Tahun'}
              </span>
            </div>
          </div>

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
              <span className="text-[#7B8681]">Waktu Fetch/Cache:</span>
              <span className="font-mono font-semibold text-[#17231F]">{formatTime(soilData?.fetchedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7B8681]">Lapisan Tanah:</span>
              <span className="font-medium text-[#17231F] text-right truncate max-w-[220px]" title={soilData?.observationPeriod}>
                {soilData?.observationPeriod || 'Standard Depth Layer 0-30cm'}
              </span>
            </div>
          </div>

          {soilData?.fallbackReason && (
            <div className="mt-2 p-2 rounded-lg bg-[#FFF4D8] border border-[#FDE68A] text-[11px] text-[#D97706] flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{soilData.fallbackReason}</span>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Details on Sensors and Models */}
      {isExpanded && (
        <div className="p-4 rounded-xl bg-[#F5F7F4] border border-[#E4EAE6] flex flex-col gap-2 text-xs text-[#52605B]">
          <span className="font-bold text-[#17231F]">Instrumen Asimilasi Satelit:</span>
          <ul className="list-disc pl-5 space-y-1 text-[#7B8681]">
            <li><strong>NASA SMAP (Soil Moisture Active Passive):</strong> Level-4 Root-Zone Soil Wetness (0–100cm).</li>
            <li><strong>NASA GPM (Global Precipitation Measurement):</strong> IMERG Corrected Precipitation.</li>
            <li><strong>NASA CERES & MERRA-2:</strong> Solar Surface Radiation & Evapotranspiration Hargreaves-Samani.</li>
            <li><strong>ISRIC SoilGrids 250m v2.0:</strong> Pedotransfer Sand, Clay, Silt, C-Organic, pH, dan CEC.</li>
          </ul>
        </div>
      )}

      {/* Required Scientific Disclaimer (Prompt Requirement) */}
      <div className="p-3.5 rounded-xl bg-[#E7F5EE] border border-[#A7F3D0] flex items-start gap-2.5 text-xs text-[#17231F]">
        <ShieldCheck className="w-4 h-4 text-[#12A875] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          TerraShaft adalah alat eksplorasi skenario berbasis observasi NASA, profil tanah, dan aturan agronomi. Rekomendasi perlu divalidasi dengan penyuluh dan kondisi lapangan lokal sebelum digunakan sebagai keputusan tanam.
        </p>
      </div>
    </div>
  );
}
