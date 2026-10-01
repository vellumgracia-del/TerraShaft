'use client';

import React, { useState } from 'react';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import {
  RotateCw,
  Sliders,
  ChevronDown,
  ChevronUp,
  ShieldAlert
} from 'lucide-react';
import { SeasonCropAllocation } from '@/types/agronomy';
import {
  formatMm,
  formatKgPerHa,
  getCropEmoji,
  getStructuredSeason,
  getWaterStatusDetails
} from '@/lib/formatters';
import { generateDynamicAuditLog } from '@/lib/auditLogGenerator';

export default function FourSeasonRotationCard() {
  const {
    location,
    climateData,
    soilData,
    plans,
    selectedPathway,
    setSelectedPathway,
    priorities,
    setPriorities,
    setPriorityPreset,
    crops
  } = useTerraShaftStore();

  const [showSliders, setShowSliders] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(true);

  const currentPlan = plans ? plans[selectedPathway] : null;

  // Generate dynamic, state-synchronized audit entries
  const dynamicAudit = generateDynamicAuditLog(
    location,
    climateData,
    soilData,
    currentPlan,
    priorities,
    crops
  );

  const pathways = [
    {
      id: 'A' as const,
      label: 'Pathway A: Max Soil',
      fullTitle: 'Pemulihan Baterai Tanah & Karbon',
      desc: 'Wajib cover crop berakar dalam & legum penambat nitrogen tinggi'
    },
    {
      id: 'B' as const,
      label: 'Pathway B: Drought Resilience',
      fullTitle: 'Siaga Cekaman Kekeringan',
      desc: 'Hanya komoditas efisiensi air tinggi pada puncak kemarau'
    },
    {
      id: 'C' as const,
      label: 'Pathway C: Cash Flow',
      fullTitle: 'Optimalisasi Nilai Ekonomi Tunai',
      desc: 'Prioritaskan komoditas bernilai jual tinggi dalam batas aman air'
    }
  ];

  return (
    <div id="rotation-planner" className="agri-card p-5 lg:p-6 flex flex-col gap-6">
      {/* Header & Pathway Tabs */}
      <div className="flex flex-col gap-4 pb-4 border-b border-[#E4EAE6]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#E7F5EE] text-[#12A875]">
                <RotateCw className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-[#17231F] tracking-tight">
                Rencana Rotasi Pola Tanam 4 Musim
              </h2>
            </div>
            <p className="text-xs text-[#7B8681] mt-0.5">
              Optimasi kombinasi 1.296 permutasi siklus budidaya adaptif iklim
            </p>
          </div>

          {/* Priority Slider Toggle */}
          <button
            type="button"
            onClick={() => setShowSliders(!showSliders)}
            className="px-3 py-1.5 rounded-xl border border-[#E4EAE6] text-xs font-semibold text-[#52605B] hover:bg-[#F5F7F4] flex items-center gap-1.5 self-start sm:self-auto transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-[#12A875]" />
            <span>Bobot Prioritas Petani</span>
            {showSliders ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Pathway Selection Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {pathways.map((pw) => {
            const isSelected = selectedPathway === pw.id;
            const planForPw = plans ? plans[pw.id] : null;

            return (
              <button
                key={pw.id}
                type="button"
                onClick={() => setSelectedPathway(pw.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-[#E7F5EE]/60 border-[#12A875] ring-2 ring-[#12A875]/20 shadow-xs'
                    : 'bg-white border-[#E4EAE6] hover:bg-[#F5F7F4] hover:border-[#D1D5DB]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-xs font-bold ${isSelected ? 'text-[#12A875]' : 'text-[#17231F]'}`}>
                    {pw.label}
                  </span>
                  {planForPw && (
                    <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-full bg-white border border-[#E4EAE6] text-[#52605B]">
                      Skor {planForPw.compositeScore}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#7B8681] line-clamp-2 leading-relaxed">
                  {pw.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Expandable Priority Sliders Panel */}
      {showSliders && (
        <div className="p-4 bg-[#F5F7F4] border border-[#E4EAE6] rounded-2xl flex flex-col gap-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#17231F] uppercase tracking-wider">
              Sesuaikan Bobot Penilaian Rekomendasi
            </span>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[#7B8681]">Preset:</span>
              <button
                type="button"
                onClick={() => setPriorityPreset('soil')}
                className="px-2.5 py-1 rounded-lg bg-white border border-[#E4EAE6] hover:bg-[#E7F5EE] text-[#12A875] font-semibold text-[11px]"
              >
                Tanah
              </button>
              <button
                type="button"
                onClick={() => setPriorityPreset('water')}
                className="px-2.5 py-1 rounded-lg bg-white border border-[#E4EAE6] hover:bg-[#EAF5F4] text-[#0284C7] font-semibold text-[11px]"
              >
                Air
              </button>
              <button
                type="button"
                onClick={() => setPriorityPreset('profit')}
                className="px-2.5 py-1 rounded-lg bg-white border border-[#E4EAE6] hover:bg-[#FFF4D8] text-[#D97706] font-semibold text-[11px]"
              >
                Profit
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Keuntungan Finansial */}
            <div className="bg-white p-3 rounded-xl border border-[#E4EAE6] flex flex-col gap-2">
              <div className="flex justify-between text-xs font-semibold text-[#17231F]">
                <span>Nilai Pasar / Keuntungan</span>
                <span className="font-mono text-[#D97706]">{priorities.profitWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={priorities.profitWeight}
                onChange={(e) => setPriorities({ profitWeight: parseInt(e.target.value, 10) })}
                className="accent-[#D97706] cursor-pointer"
              />
            </div>

            {/* Efisiensi Air */}
            <div className="bg-white p-3 rounded-xl border border-[#E4EAE6] flex flex-col gap-2">
              <div className="flex justify-between text-xs font-semibold text-[#17231F]">
                <span>Efisiensi Air & Hemat</span>
                <span className="font-mono text-[#0284C7]">{priorities.waterWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={priorities.waterWeight}
                onChange={(e) => setPriorities({ waterWeight: parseInt(e.target.value, 10) })}
                className="accent-[#0284C7] cursor-pointer"
              />
            </div>

            {/* Baterai Tanah */}
            <div className="bg-white p-3 rounded-xl border border-[#E4EAE6] flex flex-col gap-2">
              <div className="flex justify-between text-xs font-semibold text-[#17231F]">
                <span>Regenerasi Baterai Tanah</span>
                <span className="font-mono text-[#12A875]">{priorities.soilWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={priorities.soilWeight}
                onChange={(e) => setPriorities({ soilWeight: parseInt(e.target.value, 10) })}
                className="accent-[#12A875] cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Four Seasons Timeline Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {currentPlan?.seasons.map((season: SeasonCropAllocation) => {
          const structured = getStructuredSeason(season.seasonIndex);
          const waterInfo = getWaterStatusDetails(season.waterDeficit_mm);

          return (
            <div
              key={season.seasonIndex}
              className="bg-white p-4 rounded-2xl border border-[#E4EAE6] shadow-xs flex flex-col justify-between gap-3 relative overflow-hidden"
            >
              {/* Header: Structured Season Badge + Month Range */}
              <div className="flex items-center justify-between pb-2 border-b border-[#E4EAE6]">
                <div>
                  <span className="text-xs font-bold text-[#17231F] block">
                    {structured.seasonLabel} · {structured.seasonName}
                  </span>
                  <span className="text-[11px] text-[#7B8681]">{structured.monthRange}</span>
                </div>
                <span className="text-2xl" title={season.crop.category}>
                  {getCropEmoji(season.crop.icon)}
                </span>
              </div>

              {/* Crop Identity */}
              <div>
                <h4 className="text-sm font-bold text-[#17231F] leading-tight">
                  {season.crop.name}
                </h4>
                <p className="text-[11px] text-[#52605B] mt-0.5">
                  Varietas: <strong>{season.crop.recommended_variety || 'Benih Unggul Lokal'}</strong>
                </p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-[#F5F7F4] border border-[#E4EAE6] text-[10px] font-semibold text-[#52605B]">
                    {season.crop.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#F5F7F4] border border-[#E4EAE6] text-[10px] font-medium text-[#7B8681]">
                    {season.crop.growth_duration_days} Hari
                  </span>
                </div>
              </div>

              {/* Water Balance Breakdown */}
              <div className="p-2.5 rounded-xl bg-[#F5F7F4] border border-[#E4EAE6] flex flex-col gap-1 text-xs">
                <div className="flex justify-between text-[#7B8681]">
                  <span>Kebutuhan Air:</span>
                  <span className="font-mono font-semibold text-[#17231F]">{formatMm(season.waterDemand_mm)}</span>
                </div>
                <div className="flex justify-between text-[#7B8681]">
                  <span>Estimasi Hujan:</span>
                  <span className="font-mono text-[#0284C7]">{formatMm(season.expectedRain_mm)}</span>
                </div>
                <div className="flex justify-between font-semibold pt-1 border-t border-[#E4EAE6]">
                  <span>Defisit Air:</span>
                  <span className={`font-mono ${waterInfo.colorClass}`}>
                    {formatMm(season.waterDeficit_mm)}
                  </span>
                </div>
              </div>

              {/* Agronomic Soil & Nitrogen Delta */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-[#E7F5EE] border border-[#A7F3D0] text-center">
                  <span className="text-[10px] text-[#7B8681] block">Baterai Hara</span>
                  <span className="font-bold font-mono text-[#12A875]">
                    {season.batteryDelta_pct >= 0 ? `+${season.batteryDelta_pct}%` : `${season.batteryDelta_pct}%`}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-[#EAF5F4] border border-[#BAE6FD] text-center">
                  <span className="text-[10px] text-[#7B8681] block">Neraca N</span>
                  <span className="font-bold font-mono text-[#0284C7]">
                    {formatKgPerHa(season.nitrogenDelta_kg_ha)}
                  </span>
                </div>
              </div>

              {/* Status Pill Footer */}
              <div className="pt-2 border-t border-[#E4EAE6] flex items-center justify-between text-[11px]">
                <span className="text-[#7B8681]">Status Air:</span>
                <span
                  className={`px-2 py-0.5 rounded-full font-bold border ${waterInfo.badgeClass}`}
                  title={waterInfo.description}
                >
                  {waterInfo.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Algorithmic Audit Log (State-Synchronized Without Hardcoded Values) */}
      <div className="p-4 bg-[#F5F7F4] border border-[#E4EAE6] rounded-2xl flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#D97706]" />
            <div>
              <span className="text-xs font-bold text-[#17231F] uppercase tracking-wider block">
                Logika Audit Algoritma: Alasan Eliminasi & Seleksi Varietas
              </span>
              <span className="text-[11px] text-[#7B8681]">
                {dynamicAudit.modeBadge}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAuditLog(!showAuditLog)}
            className="text-xs text-[#12A875] font-semibold hover:underline self-start sm:self-auto"
          >
            {showAuditLog ? 'Sembunyikan Log' : 'Tampilkan Log'}
          </button>
        </div>

        {showAuditLog && (
          <div className="flex flex-col gap-2 pt-2 border-t border-[#E4EAE6] text-xs">
            <div className="p-2 rounded-lg bg-[#EAF5F4] border border-[#BAE6FD] text-[11px] text-[#0284C7] leading-relaxed">
              <strong>Catatan Provenansi Audit:</strong> {dynamicAudit.provenanceNote}
            </div>

            {dynamicAudit.entries.map((entry) => (
              <div
                key={entry.id}
                className="p-3 rounded-xl bg-white border border-[#E4EAE6] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#17231F]">{entry.cropName}</span>
                    <span className="text-[10px] text-[#7B8681] px-1.5 py-0.5 rounded bg-[#F5F7F4] border border-[#E4EAE6]">
                      {entry.seasonLabel}
                    </span>
                  </div>
                  <div
                    className="text-[#52605B] text-[11px] mt-1 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: entry.reasonHtml }}
                  />
                </div>
                <span
                  className={`px-2.5 py-1 rounded-md font-bold text-[10px] self-start sm:self-auto shrink-0 ${
                    entry.outcome === 'TERPILIH'
                      ? 'bg-[#E7F5EE] text-[#12A875]'
                      : 'bg-[#FDEAEA] text-[#E11D48]'
                  }`}
                >
                  {entry.outcome}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
