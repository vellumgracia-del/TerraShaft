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
    <div id="rotation-planner" className="bg-[#20242B] border border-[#2C313A] rounded-[4px] p-6 lg:p-7 flex flex-col gap-6 text-[#F1F3F5]">
      {/* Header & Pathway Tabs */}
      <div className="flex flex-col gap-5 pb-5 border-b border-[#2C313A]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-[4px] bg-[#163A40] text-[#00C2CC] shrink-0">
                <RotateCw className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-medium text-[#F1F3F5] tracking-tight">
                Rencana Rotasi Pola Tanam 4 Musim
              </h2>
            </div>
            <p className="text-xs text-[#8A949E] mt-1">
              Optimasi kombinasi {Math.pow(Math.min(crops.length || 6, 8), 4).toLocaleString('id-ID')} permutasi siklus budidaya adaptif iklim
            </p>
          </div>

          {/* Priority Slider Toggle */}
          <button
            type="button"
            onClick={() => setShowSliders(!showSliders)}
            className="h-9 px-3.5 rounded-[4px] border border-[#2C313A] text-xs font-mono text-[#C1C7CD] hover:bg-[#16191E] inline-flex items-center gap-2 whitespace-nowrap shrink-0 self-start sm:self-auto transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-[#00C2CC] shrink-0" />
            <span>Bobot Prioritas Petani</span>
            {showSliders ? <ChevronUp className="w-3.5 h-3.5 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 shrink-0" />}
          </button>
        </div>

        {/* Pathway Selection Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {pathways.map((pw) => {
            const isSelected = selectedPathway === pw.id;
            const planForPw = plans ? plans[pw.id] : null;

            return (
              <button
                key={pw.id}
                type="button"
                onClick={() => setSelectedPathway(pw.id)}
                className={`p-4 rounded-[4px] border text-left transition-all flex flex-col justify-between gap-2.5 ${
                  isSelected
                    ? 'bg-[#163A40] border-[#009DA5] ring-1 ring-[#009DA5]/40 shadow-xs'
                    : 'bg-[#16191E] border-[#2C313A] hover:bg-[#20242B]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 w-full">
                  <span className={`text-xs sm:text-sm font-medium truncate ${isSelected ? 'text-[#00C2CC]' : 'text-[#F1F3F5]'}`}>
                    {pw.label}
                  </span>
                  {planForPw && (
                    <span className="text-[10.5px] font-mono px-2 py-0.5 rounded-[3px] bg-[#16191E] border border-[#2C313A] text-[#C1C7CD] whitespace-nowrap shrink-0">
                      Skor {planForPw.compositeScore}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#8A949E] line-clamp-2 leading-relaxed">
                  {pw.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Expandable Priority Sliders Panel */}
      {showSliders && (
        <div className="p-5 bg-[#16191E] border border-[#2C313A] rounded-[4px] flex flex-col gap-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-mono text-[#F1F3F5] uppercase tracking-wider">
              Sesuaikan Bobot Penilaian Rekomendasi
            </span>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#8A949E] font-mono">Preset:</span>
              <button
                type="button"
                onClick={() => setPriorityPreset('soil')}
                className="px-3 py-1 rounded-[3px] bg-[#20242B] border border-[#2C313A] hover:bg-[#163A40] text-[#00C2CC] font-mono text-xs whitespace-nowrap"
              >
                Tanah
              </button>
              <button
                type="button"
                onClick={() => setPriorityPreset('water')}
                className="px-3 py-1 rounded-[3px] bg-[#20242B] border border-[#2C313A] hover:bg-[#163A40] text-[#00C2CC] font-mono text-xs whitespace-nowrap"
              >
                Air
              </button>
              <button
                type="button"
                onClick={() => setPriorityPreset('profit')}
                className="px-3 py-1 rounded-[3px] bg-[#20242B] border border-[#2C313A] hover:bg-[#163A40] text-[#00C2CC] font-mono text-xs whitespace-nowrap"
              >
                Profit
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Keuntungan Finansial */}
            <div className="bg-[#20242B] p-3.5 rounded-[4px] border border-[#2C313A] flex flex-col gap-2">
              <div className="flex justify-between text-xs font-mono text-[#F1F3F5]">
                <span>Nilai Pasar / Keuntungan</span>
                <span className="font-mono text-[#00C2CC]">{priorities.profitWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={priorities.profitWeight}
                onChange={(e) => setPriorities({ profitWeight: parseInt(e.target.value, 10) })}
                className="accent-[#009DA5] cursor-pointer"
              />
            </div>

            {/* Efisiensi Air */}
            <div className="bg-[#20242B] p-3.5 rounded-[4px] border border-[#2C313A] flex flex-col gap-2">
              <div className="flex justify-between text-xs font-mono text-[#F1F3F5]">
                <span>Efisiensi Air & Hemat</span>
                <span className="font-mono text-[#00C2CC]">{priorities.waterWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={priorities.waterWeight}
                onChange={(e) => setPriorities({ waterWeight: parseInt(e.target.value, 10) })}
                className="accent-[#009DA5] cursor-pointer"
              />
            </div>

            {/* Baterai Tanah */}
            <div className="bg-[#20242B] p-3.5 rounded-[4px] border border-[#2C313A] flex flex-col gap-2">
              <div className="flex justify-between text-xs font-mono text-[#F1F3F5]">
                <span>Regenerasi Baterai Tanah</span>
                <span className="font-mono text-[#00C2CC]">{priorities.soilWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={priorities.soilWeight}
                onChange={(e) => setPriorities({ soilWeight: parseInt(e.target.value, 10) })}
                className="accent-[#009DA5] cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Four Seasons Timeline Cards Grid: Uniform Heights & Aligned Sub-blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
        {currentPlan?.seasons.map((season: SeasonCropAllocation) => {
          const structured = getStructuredSeason(season.seasonIndex);
          const waterInfo = getWaterStatusDetails(season.waterDeficit_mm);

          return (
            <div
              key={season.seasonIndex}
              className="bg-[#16191E] p-5 rounded-[4px] border border-[#2C313A] shadow-xs flex flex-col h-full gap-4 relative overflow-hidden"
            >
              {/* 1. Header: Structured Season Badge + Month Range */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#2C313A] min-h-[60px]">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#00C2CC]">
                      {structured.seasonLabel}
                    </span>
                    <span className="text-xs text-[#8A949E]">·</span>
                    <span className="text-[11px] font-mono text-[#8A949E]">
                      {structured.monthRange}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-[#F1F3F5] block mt-0.5 leading-snug line-clamp-1" title={structured.seasonName}>
                    {structured.seasonName}
                  </span>
                </div>
                <span className="text-2xl shrink-0 p-1.5 rounded-[4px] bg-[#20242B]" title={season.crop.category}>
                  {getCropEmoji(season.crop.icon)}
                </span>
              </div>

              {/* 2. Crop Identity */}
              <div className="flex flex-col justify-between min-h-[76px]">
                <div>
                  <h4 className="text-sm font-medium text-[#F1F3F5] leading-snug line-clamp-1" title={season.crop.name}>
                    {season.crop.name}
                  </h4>
                  <p className="text-[11px] text-[#C1C7CD] mt-0.5 line-clamp-1" title={season.crop.recommended_variety || 'Benih Unggul Lokal'}>
                    Varietas: <strong>{season.crop.recommended_variety || 'Benih Unggul Lokal'}</strong>
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="px-2 py-0.5 rounded-[3px] bg-[#20242B] border border-[#2C313A] text-[10px] font-mono text-[#C1C7CD] whitespace-nowrap">
                    {season.crop.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-[3px] bg-[#20242B] border border-[#2C313A] text-[10px] font-mono text-[#8A949E] whitespace-nowrap">
                    {season.crop.growth_duration_days} Hari
                  </span>
                </div>
              </div>

              {/* 3. Water Balance Breakdown */}
              <div className="p-3 rounded-[4px] bg-[#20242B] border border-[#2C313A] flex flex-col gap-1.5 text-xs mt-auto">
                <div className="flex justify-between items-center text-[#8A949E]">
                  <span>Kebutuhan Air:</span>
                  <span className="font-mono font-medium text-[#F1F3F5]">{formatMm(season.waterDemand_mm)}</span>
                </div>
                <div className="flex justify-between items-center text-[#8A949E]">
                  <span>Estimasi Hujan:</span>
                  <span className="font-mono text-[#00C2CC]">{formatMm(season.expectedRain_mm)}</span>
                </div>
                <div className="flex justify-between items-center font-medium pt-1.5 border-t border-[#2C313A]">
                  <span className="text-[#8A949E]">Defisit Air:</span>
                  <span className={`font-mono ${waterInfo.colorClass}`}>
                    {formatMm(season.waterDeficit_mm)}
                  </span>
                </div>
              </div>

              {/* 4. Agronomic Soil & Nitrogen Delta */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-[4px] bg-[#20242B] border border-[#2C313A] text-center flex flex-col justify-center">
                  <span className="text-[10px] text-[#8A949E] block font-mono">Baterai Hara</span>
                  <span className="font-medium font-mono text-[#00C2CC] mt-0.5 whitespace-nowrap">
                    {season.batteryDelta_pct >= 0 ? `+${season.batteryDelta_pct}%` : `${season.batteryDelta_pct}%`}
                  </span>
                </div>

                <div className="p-2.5 rounded-[4px] bg-[#20242B] border border-[#2C313A] text-center flex flex-col justify-center">
                  <span className="text-[10px] text-[#8A949E] block font-mono">Neraca N</span>
                  <span className="font-medium font-mono text-[#00C2CC] mt-0.5 whitespace-nowrap">
                    {formatKgPerHa(season.nitrogenDelta_kg_ha)}
                  </span>
                </div>
              </div>

              {/* 5. Status Pill Footer */}
              <div className="pt-3 border-t border-[#2C313A] flex items-center justify-between gap-2 text-[11px]">
                <span className="text-[#8A949E] whitespace-nowrap font-mono">Status Air:</span>
                <span
                  className={`px-2 py-0.5 rounded-[3px] font-mono text-[10.5px] border whitespace-nowrap ${waterInfo.badgeClass}`}
                  title={waterInfo.description}
                >
                  {waterInfo.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Algorithmic Audit Log */}
      <div className="p-5 bg-[#16191E] border border-[#2C313A] rounded-[4px] flex flex-col gap-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-[#8A949E] shrink-0" />
            <div>
              <span className="text-xs font-mono text-[#F1F3F5] uppercase tracking-wider block">
                Logika Audit Algoritma: Alasan Eliminasi & Seleksi Varietas
              </span>
              <span className="text-[11px] text-[#8A949E] font-mono">
                {dynamicAudit.modeBadge}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAuditLog(!showAuditLog)}
            className="text-xs text-[#00C2CC] font-mono hover:underline self-start sm:self-auto whitespace-nowrap shrink-0"
          >
            {showAuditLog ? 'Sembunyikan Log' : 'Tampilkan Log'}
          </button>
        </div>

        {showAuditLog && (
          <div className="flex flex-col gap-2.5 pt-3 border-t border-[#2C313A] text-xs">
            <div className="p-3 rounded-[4px] bg-[#20242B] border border-[#2C313A] text-[11px] text-[#C1C7CD] leading-relaxed font-mono">
              <strong className="text-[#F1F3F5]">Catatan Provenansi Audit:</strong> {dynamicAudit.provenanceNote}
            </div>

            {dynamicAudit.entries.map((entry) => (
              <div
                key={entry.id}
                className="p-3.5 rounded-[4px] bg-[#20242B] border border-[#2C313A] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-[#F1F3F5]">{entry.cropName}</span>
                    <span className="text-[10px] text-[#8A949E] px-2 py-0.5 rounded-[3px] bg-[#16191E] border border-[#2C313A] whitespace-nowrap font-mono">
                      {entry.seasonLabel}
                    </span>
                  </div>
                  <p className="text-[#C1C7CD] text-[11px] mt-1 leading-relaxed">
                    {entry.ruleId !== 'RULE_PRIORITY_WEIGHTS' && (
                      <>
                        {entry.outcome === 'TERELIMINASI'
                          ? 'Didiskualifikasi otomatis oleh aturan: '
                          : 'Terpilih melalui aturan: '}
                        <code
                          className={`font-mono font-medium ${
                            entry.outcome === 'TERPILIH' ? 'text-[#00C2CC]' : 'text-[#F87171]'
                          }`}
                        >
                          {entry.ruleId}
                        </code>
                        {'. '}
                      </>
                    )}
                    {entry.reasonText}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-[3px] font-mono text-[10px] self-start sm:self-auto whitespace-nowrap shrink-0 border ${
                    entry.outcome === 'TERPILIH'
                      ? 'bg-[#163A40] text-[#00C2CC] border-[#009DA5]/40'
                      : 'bg-[#2D1B1E] text-[#F87171] border-[#7F1D1D]/40'
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
