'use client';

import React, { useRef, useState } from 'react';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import { toPng } from 'html-to-image';
import {
  X,
  Download,
  Share2,
  Sprout,
  CheckCircle2,
  Satellite,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import {
  formatMm,
  formatKgPerHa,
  formatCoordinate,
  formatScore,
  getCropEmoji,
  getStructuredSeason
} from '@/lib/formatters';
import { getActionSheetProvenanceDisplay, getOverallDisplayStatus } from '@/lib/provenance';

interface ActionSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ActionSheetModal({ isOpen, onClose }: ActionSheetModalProps) {
  const { location, elevation_m, plans, selectedPathway, provenance } = useTerraShaftStore();
  const cardRef = useRef<HTMLDivElement>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  if (!isOpen) return null;

  const currentPlan = plans ? plans[selectedPathway] : null;
  if (!currentPlan) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
        <div className="bg-white border border-[#E4EAE6] rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#E7F5EE] text-[#12A875] flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <h3 className="text-base font-bold text-[#17231F]">Menyiapkan Lembar Aksi Lapangan...</h3>
          <p className="text-xs text-[#7B8681]">
            Sedang menghitung optimasi rotasi berdasarkan data telemetri iklim & tanah. Mohon tunggu sejenak.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#F5F7F4] border border-[#E4EAE6] text-xs font-semibold text-[#17231F] hover:bg-[#E4EAE6]"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  const actionSheetProv = getActionSheetProvenanceDisplay(provenance);
  const overallDisplay = getOverallDisplayStatus(provenance);

  const initialBattery = currentPlan.initialBatteryScore;
  const finalBattery = currentPlan.soilBatteryScore;
  const deltaBattery = finalBattery - initialBattery;

  // Handler Download PNG (1080x1350 px native canvas)
  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    setExportSuccess(false);

    try {
      await document.fonts?.ready;

      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 1,
        backgroundColor: '#F5F7F4'
      });

      const cleanLocation = (location.placeName || 'Lahan').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
      const filename = `TerraShaft_ActionSheet_${cleanLocation}_Pathway_${selectedPathway}.png`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err) {
      console.error('Export Action Sheet failed:', err);
      alert('Gagal mengekspor berkas gambar. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  // Handler WhatsApp Share
  const handleShareWhatsApp = () => {
    const cropsSummary = currentPlan.seasons
      .map((s) => {
        const seasonInfo = getStructuredSeason(s.seasonIndex, s.seasonName, s.monthRange);
        const iconEmoji = getCropEmoji(s.crop.icon);
        return `• *${seasonInfo.seasonLabel}: ${seasonInfo.seasonName} (${seasonInfo.monthRange})*: ${iconEmoji} ${s.crop.name} (Varietas: ${
          s.crop.recommended_variety || 'Unggul'
        }) — Defisit Air: ${formatMm(s.waterDeficit_mm)}, Efek Baterai: ${s.batteryDelta_pct >= 0 ? '+' : ''}${s.batteryDelta_pct}%`;
      })
      .join('\n');

    const messageText =
      `🌱 *LEMBAR AKSI POLA ROTASI TANAM 4 MUSIM — TERRASHAFT* 🌱\n\n` +
      `📍 *Lokasi:* ${location.placeName || 'Lahan Budidaya'} (${formatCoordinate(location.lat)}°, ${formatCoordinate(location.lon)}° · ${Math.round(elevation_m)} m dpl)\n` +
      `🎯 *Skenario Terpilih:* ${currentPlan.title} (Skor: ${formatScore(currentPlan.compositeScore)}/100)\n\n` +
      `⚡ *Baterai Tanah:* ${initialBattery}% ➔ ${finalBattery}% (${deltaBattery >= 0 ? '+' : ''}${deltaBattery}%)\n` +
      `💧 *Efisiensi Air:* Estimasi penghematan air hingga ${currentPlan.waterSavingsPct}% dibanding baseline monokultur\n` +
      `🌿 *Neraca Nitrogen:* Estimasi kontribusi N biologis kumulatif ${formatKgPerHa(currentPlan.netNitrogenDelta)}\n\n` +
      `📅 *JADWAL ROTASI 4 MUSIM:*\n${cropsSummary}\n\n` +
      `🛰️ *Status Sumber Data:*\n• ${actionSheetProv.compactSourceBlock.nasa}\n• ${actionSheetProv.compactSourceBlock.soil}\n\n` +
      `ℹ️ _${actionSheetProv.scientificNote}_\n` +
      `⚠️ _TerraShaft adalah alat eksplorasi skenario; validasikan dengan penyuluh dan kondisi lapangan lokal sebelum tanam._`;

    const encoded = encodeURIComponent(messageText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E4EAE6] rounded-3xl w-full max-w-4xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden text-[#17231F]">
        {/* Modal Top Toolbar */}
        <div className="px-6 py-4 border-b border-[#E4EAE6] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E7F5EE] text-[#12A875] flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#17231F] leading-tight">
                Lembar Panduan Lapangan WhatsApp (Action Sheet)
              </h3>
              <p className="text-xs text-[#7B8681]">
                Format poster 1080×1350 px (rasio 4:5) siap dibagikan ke kelompok tani
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={isExporting}
              className="px-4 py-2 rounded-xl bg-[#12A875] hover:bg-[#0E9365] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Memproses...' : 'Unduh Gambar (PNG)'}</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20BA5C] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Share2 className="w-4 h-4" />
              <span>Kirim ke WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border border-[#E4EAE6] text-[#7B8681] hover:text-[#17231F] hover:bg-[#F5F7F4] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Scroll Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#F5F7F4] flex justify-center">
          {/* Printable / Renderable Container (1080x1350 Canvas Scaled to Viewport) */}
          <div
            ref={cardRef}
            style={{ width: '1080px', height: '1350px' }}
            className="bg-white p-12 rounded-3xl border border-[#E4EAE6] shadow-xl flex flex-col justify-between shrink-0 transform origin-top scale-[0.45] sm:scale-[0.55] md:scale-[0.62] mb-[-450px] sm:mb-[-350px] md:mb-[-280px]"
          >
            {/* Header: Brand & Farm Location */}
            <div className="flex items-start justify-between pb-8 border-b-2 border-[#E4EAE6]">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#12A875] flex items-center justify-center text-white shadow-md">
                  <Sprout className="w-10 h-10 stroke-[2.5]" />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold text-[#17231F] tracking-tight">
                    TERRASHAFT ACTION SHEET
                  </h1>
                  <p className="text-base text-[#7B8681] font-semibold mt-1">
                    Panduan Pola Rotasi 4 Musim & Regenerasi Baterai Tanah
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-bold uppercase tracking-wider text-[#12A875] bg-[#E7F5EE] px-4 py-1.5 rounded-full">
                  Dokumen Resmi PPL
                </span>
                <p className="text-sm text-[#7B8681] mt-2 font-mono">
                  {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Farm Location Details Banner */}
            <div className="p-6 rounded-2xl bg-[#F5F7F4] border border-[#E4EAE6] grid grid-cols-3 gap-6 text-sm">
              <div>
                <span className="text-xs text-[#7B8681] font-semibold uppercase">Lokasi Budidaya</span>
                <p className="text-base font-bold text-[#17231F] mt-1">{location.placeName}</p>
              </div>
              <div>
                <span className="text-xs text-[#7B8681] font-semibold uppercase">Koordinat Spasial</span>
                <p className="text-base font-bold font-mono text-[#17231F] mt-1">
                  LAT {formatCoordinate(location.lat)}° | LON {formatCoordinate(location.lon)}°
                </p>
              </div>
              <div>
                <span className="text-xs text-[#7B8681] font-semibold uppercase">Ketinggian Lahan</span>
                <p className="text-base font-bold text-[#17231F] mt-1">{Math.round(elevation_m)} m dpl</p>
              </div>
            </div>

            {/* Required Section 5: Visible Source-Specific Provenance Block in Action Sheet */}
            <div className={`p-4 rounded-xl border flex flex-col gap-2 ${
              actionSheetProv.overallTone === 'success'
                ? 'bg-[#E7F5EE] border-[#A7F3D0] text-[#065F46]'
                : actionSheetProv.overallTone === 'info'
                ? 'bg-[#EAF5F4] border-[#BAE6FD] text-[#0369A1]'
                : 'bg-[#FFF4D8] border-[#FDE68A] text-[#92400E]'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="font-bold text-xs uppercase tracking-wide">Status Sumber Data</span>
                </div>
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-white/80 border border-current">
                  {overallDisplay.shortLabel}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold pt-1 border-t border-current/20">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-current shrink-0" />
                  <span>{actionSheetProv.compactSourceBlock.nasa}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-current shrink-0" />
                  <span>{actionSheetProv.compactSourceBlock.soil}</span>
                </div>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90 italic">
                {actionSheetProv.scientificNote}
              </p>
            </div>

            {/* Pathway Summary Hero */}
            <div className="p-8 rounded-2xl bg-[#E7F5EE] border-2 border-[#12A875]/30 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold uppercase tracking-wider text-[#12A875]">
                  Skenario Terpilih: Jalur {selectedPathway}
                </span>
                <h2 className="text-3xl font-extrabold text-[#17231F] mt-1">
                  {currentPlan.title}
                </h2>
                <p className="text-sm text-[#52605B] mt-2 max-w-xl leading-relaxed">
                  {currentPlan.description}
                </p>
              </div>

              <div className="text-center p-6 bg-white rounded-2xl border border-[#A7F3D0] shadow-sm">
                <span className="text-xs font-bold uppercase text-[#7B8681] block">Skor Komposit</span>
                <span className="text-5xl font-black font-mono text-[#12A875]">
                  {formatScore(currentPlan.compositeScore)}
                </span>
                <span className="text-xs text-[#7B8681] block mt-1">/ 100</span>
              </div>
            </div>

            {/* Key Field Success Indicators */}
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="p-5 rounded-2xl bg-white border-2 border-[#E4EAE6]">
                <span className="text-xs text-[#7B8681] font-bold uppercase block">Baterai Tanah</span>
                <span className="text-3xl font-extrabold font-mono text-[#17231F] mt-1 block">
                  {initialBattery}% ➔ {finalBattery}%
                </span>
                <span className="text-xs font-bold text-[#12A875] mt-1 inline-block">
                  +{deltaBattery}% Pemulihan
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white border-2 border-[#E4EAE6]">
                <span className="text-xs text-[#7B8681] font-bold uppercase block">Hemat Air</span>
                <span className="text-3xl font-extrabold font-mono text-[#0284C7] mt-1 block">
                  {currentPlan.waterSavingsPct}%
                </span>
                <span className="text-xs text-[#7B8681] mt-1 inline-block leading-tight">
                  Estimasi vs baseline
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white border-2 border-[#E4EAE6]">
                <span className="text-xs text-[#7B8681] font-bold uppercase block">Pasokan Nitrogen (ΔN)</span>
                <span className="text-3xl font-extrabold font-mono text-[#12A875] mt-1 block">
                  +{currentPlan.netNitrogenDelta}
                </span>
                <span className="text-xs text-[#7B8681] mt-1 inline-block">kg N / hektar</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border-2 border-[#E4EAE6]">
                <span className="text-xs text-[#7B8681] font-bold uppercase block">Indeks Profit</span>
                <span className="text-3xl font-extrabold font-mono text-[#D97706] mt-1 block">
                  {currentPlan.projectedProfitIndex}
                </span>
                <span className="text-xs text-[#7B8681] mt-1 inline-block">Skala 0–100</span>
              </div>
            </div>

            {/* 4 Seasons Rotation Plan Detailed Grid */}
            <div className="flex flex-col gap-3">
              <h3 className="text-lg font-bold text-[#17231F] tracking-tight flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#12A875]" />
                <span>Rencana Pergiliran Tanaman 4 Musim Berkelanjutan</span>
              </h3>

              <div className="grid grid-cols-4 gap-4">
                {currentPlan.seasons.map((season) => {
                  const sInfo = getStructuredSeason(season.seasonIndex, season.seasonName, season.monthRange);
                  const iconEmoji = getCropEmoji(season.crop.icon);

                  return (
                    <div key={season.seasonIndex} className="p-5 rounded-2xl bg-[#F5F7F4] border-2 border-[#E4EAE6] flex flex-col justify-between gap-3">
                      <div className="border-b border-[#E4EAE6] pb-2">
                        <span className="text-xs font-bold text-[#12A875] block uppercase tracking-wider">
                          {sInfo.seasonLabel}
                        </span>
                        <span className="text-xs font-semibold text-[#17231F] block">{sInfo.seasonName}</span>
                        <span className="text-xs text-[#7B8681]">{sInfo.monthRange}</span>
                      </div>

                      <div>
                        <span className="text-3xl mb-1 block">{iconEmoji}</span>
                        <h4 className="text-lg font-bold text-[#17231F] leading-tight">{season.crop.name}</h4>
                        <p className="text-xs text-[#52605B] mt-1 font-medium">
                          Varietas: {season.crop.recommended_variety || 'Unggul Lokal'}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-[#E4EAE6] text-xs flex flex-col gap-1">
                        <div className="flex justify-between">
                          <span className="text-[#7B8681]">Kebutuhan Air:</span>
                          <span className="font-mono font-bold text-[#17231F]">{formatMm(season.waterDemand_mm)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#7B8681]">Defisit Air:</span>
                          <span className="font-mono font-bold text-[#D97706]">{formatMm(season.waterDeficit_mm)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-[#12A875] pt-1 border-t border-[#E4EAE6]">
                          <span>Efek Baterai:</span>
                          <span>{season.batteryDelta_pct >= 0 ? `+${season.batteryDelta_pct}%` : `${season.batteryDelta_pct}%`}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Official Scientific Integrity Footer & Disclaimer */}
            <div className="p-6 rounded-2xl bg-[#F5F7F4] border border-[#E4EAE6] flex items-center justify-between text-xs text-[#7B8681]">
              <div className="flex items-center gap-3">
                <Satellite className="w-5 h-5 text-[#12A875] shrink-0" />
                <p className="max-w-3xl leading-relaxed">
                  <strong>Pernyataan Ilmiah:</strong> Dihitung dengan algoritma optimasi TerraShaft berbasis asimilasi data NASA POWER dan profil tanah ISRIC SoilGrids. Skor Baterai Tanah adalah indikator <em>screening model</em>; rekomendasi wajib divalidasi bersama Penyuluh Pertanian Lapangan (PPL).
                </p>
              </div>
              <span className="font-mono font-bold text-[#17231F] text-sm shrink-0">
                TERRASHAFT 2026
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E4EAE6] bg-white flex items-center justify-between text-xs text-[#7B8681]">
          {exportSuccess ? (
            <span className="text-[#12A875] font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Gambar Action Sheet berhasil diunduh (1080×1350 px PNG)!</span>
            </span>
          ) : (
            <span>Pratinjau poster siap unduh resolusi tinggi (1080×1350 px).</span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#F5F7F4] border border-[#E4EAE6] text-xs font-semibold text-[#17231F] hover:bg-[#E4EAE6]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
