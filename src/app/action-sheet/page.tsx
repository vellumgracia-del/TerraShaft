'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import { toPng } from 'html-to-image';
import {
  Download,
  Share2,
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

export default function ActionSheetPage() {
  const { location, elevation_m, plans, selectedPathway, setSelectedPathway, provenance, isFieldMode } = useTerraShaftStore();
  const cardRef = useRef<HTMLDivElement>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const currentPlan = plans ? plans[selectedPathway] : null;
  if (!currentPlan) {
    return (
      <div className="bg-[#20242B] border border-[#2C313A] rounded-[4px] p-12 flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-12 h-12 rounded-[4px] bg-[#163A40] text-[#00C2CC] flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
        <h3 className="text-base font-bold text-[#F1F3F5]">Menyiapkan Lembar Aksi Lapangan...</h3>
        <p className="text-xs text-[#8A949E]">
          Sedang menghitung optimasi rotasi berdasarkan data telemetri iklim & tanah. Mohon tunggu sejenak.
        </p>
      </div>
    );
  }

  const actionSheetProv = getActionSheetProvenanceDisplay(provenance);
  const overallDisplay = getOverallDisplayStatus(provenance);

  const initialBattery = currentPlan.initialBatteryScore;
  const finalBattery = currentPlan.soilBatteryScore;
  const deltaBattery = finalBattery - initialBattery;

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    setExportSuccess(false);

    const appShellEl = cardRef.current.closest('[data-field-mode]');
    const wasDark = isFieldMode;

    try {
      await document.fonts?.ready;

      // Pastikan kanvas cetak selalu diekspor dalam tema terang bersih (konsisten di semua mode tampilan)
      if (wasDark) {
        document.documentElement.setAttribute('data-field-mode', 'false');
        document.body.setAttribute('data-field-mode', 'false');
        appShellEl?.setAttribute('data-field-mode', 'false');
      }

      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 1,
        width: 1080,
        height: 1350,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        },
        backgroundColor: '#181B20'
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
      if (wasDark) {
        document.documentElement.setAttribute('data-field-mode', 'true');
        document.body.setAttribute('data-field-mode', 'true');
        appShellEl?.setAttribute('data-field-mode', 'true');
      }
      setIsExporting(false);
    }
  };

  const handleShareWhatsApp = () => {
    const cropsSummary = currentPlan.seasons
      .map((s) => {
        const seasonInfo = getStructuredSeason(s.seasonIndex, s.seasonName, s.monthRange);
        return `*${seasonInfo.seasonLabel}: ${seasonInfo.seasonName} (${seasonInfo.monthRange})*: ${s.crop.name} (Varietas: ${
          s.crop.recommended_variety || 'Unggul'
        }), Defisit Air: ${formatMm(s.waterDeficit_mm)}, Efek Baterai: ${s.batteryDelta_pct >= 0 ? '+' : ''}${s.batteryDelta_pct}%`;
      })
      .join('\n');

    const messageText =
      `*LEMBAR AKSI POLA ROTASI TANAM 4 MUSIM: TERRASHAFT*\n\n` +
      `*Lokasi:* ${location.placeName || 'Lahan Budidaya'} (${formatCoordinate(location.lat)}°, ${formatCoordinate(location.lon)}°, ${Math.round(elevation_m)} m dpl)\n` +
      `*Skenario Terpilih:* ${currentPlan.title} (Skor: ${formatScore(currentPlan.compositeScore)}/100)\n\n` +
      `*Baterai Tanah:* ${initialBattery}% -> ${finalBattery}% (${deltaBattery >= 0 ? '+' : ''}${deltaBattery}%)\n` +
      `*Efisiensi Air:* Estimasi penghematan air hingga ${currentPlan.waterSavingsPct}% dibanding baseline monokultur\n` +
      `*Neraca Nitrogen:* Estimasi kontribusi N biologis kumulatif ${formatKgPerHa(currentPlan.netNitrogenDelta)}\n\n` +
      `*JADWAL ROTASI 4 MUSIM:*\n${cropsSummary}\n\n` +
      `*Status Sumber Data:*\n${actionSheetProv.compactSourceBlock.nasa}\n${actionSheetProv.compactSourceBlock.soil}\n\n` +
      `_${actionSheetProv.scientificNote}_\n` +
      `_TerraShaft adalah alat eksplorasi skenario; validasikan dengan penyuluh dan kondisi lapangan lokal sebelum tanam._`;

    const encoded = encodeURIComponent(messageText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="bg-[#20242B] border border-[#2C313A] rounded-[4px] p-5 lg:p-6 flex flex-col gap-6 text-[#F1F3F5]">
      {/* Top Toolbar */}
      <div className="pb-4 border-b border-[#2C313A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[4px] bg-[#163A40] text-[#00C2CC] flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#F1F3F5] leading-tight">
              Lembar Panduan Lapangan WhatsApp (Action Sheet)
            </h2>
            <p className="text-xs text-[#8A949E]">
              Format poster 1080×1350 px (rasio 4:5) siap dibagikan ke kelompok tani
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 bg-[#16191E] border border-[#2C313A] rounded-[4px] text-xs font-semibold">
            {(['A', 'B', 'C'] as const).map((pw) => (
              <button
                key={pw}
                type="button"
                onClick={() => setSelectedPathway(pw)}
                className={`px-2.5 py-1 rounded-[3px] transition-all ${
                  selectedPathway === pw
                    ? 'bg-[#009DA5] text-white font-bold shadow-xs'
                    : 'text-[#8A949E] hover:text-[#F1F3F5]'
                }`}
              >
                Jalur {pw}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={isExporting}
            className="px-4 py-2 rounded-[4px] bg-[#009DA5] hover:bg-[#00878E] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Memproses...' : 'Unduh Gambar (PNG)'}</span>
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="px-4 py-2 rounded-[4px] bg-[#25D366] hover:bg-[#20BA5C] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Share2 className="w-4 h-4" />
            <span>Kirim ke WhatsApp</span>
          </button>
        </div>
      </div>

      {exportSuccess && (
        <div className="p-3 rounded-[4px] bg-[#163A40] border border-[#009DA5]/40 text-[#00C2CC] text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Gambar Action Sheet berhasil diunduh (1080×1350 px PNG)!</span>
        </div>
      )}

      {/* Preview Container: Responsive Bounding Box Without Horizontal Scroll Overflow */}
      <div className="p-4 sm:p-6 rounded-[4px] bg-[#16191E] border border-[#2C313A] flex justify-center overflow-hidden">
        <div className="w-[324px] h-[405px] sm:w-[648px] sm:h-[810px] lg:w-[864px] lg:h-[1080px] relative overflow-hidden rounded-[4px] shadow-xl">
          <div
            ref={cardRef}
            style={{ width: '1080px', height: '1350px' }}
            className="bg-[#181B20] p-12 rounded-[6px] border border-[#2C313A] text-[#F1F3F5] flex flex-col justify-between shrink-0 transform origin-top-left scale-[0.3] sm:scale-[0.6] lg:scale-[0.8]"
          >
          {/* Header: Brand & Farm Location */}
          <div className="flex items-start justify-between pb-8 border-b-2 border-[#2C313A]">
            <div className="flex items-center gap-5">
              <Image
                src="/terrashaft-logo.png"
                alt="TerraShaft Orbital Agriculture"
                width={240}
                height={64}
                className="h-16 w-auto object-contain"
                unoptimized
              />
              <div className="h-12 w-px bg-[#2C313A]" />
              <div>
                <h1 className="text-2xl font-extrabold text-[#F1F3F5] tracking-tight">
                  ACTION SHEET PANDUAN LAPANGAN
                </h1>
                <p className="text-sm text-[#8A949E] font-semibold mt-0.5">
                  Optimasi Pola Rotasi 4 Musim & Regenerasi Baterai Tanah
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono uppercase tracking-wider text-[#00C2CC] bg-[#163A40] border border-[#009DA5]/40 px-3 py-1 rounded-[3px]">
                Dokumen Resmi PPL
              </span>
              <p className="text-sm text-[#8A949E] mt-2 font-mono">
                {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Farm Location Details Banner */}
          <div className="p-6 rounded-[4px] bg-[#20242B] border border-[#2C313A] grid grid-cols-3 gap-6 text-sm">
            <div>
              <span className="text-xs text-[#8A949E] font-semibold uppercase">Lokasi Budidaya</span>
              <p className="text-base font-bold text-[#F1F3F5] mt-1">{location.placeName}</p>
            </div>
            <div>
              <span className="text-xs text-[#8A949E] font-semibold uppercase">Koordinat Spasial</span>
              <p className="text-base font-bold font-mono text-[#F1F3F5] mt-1">
                LAT {formatCoordinate(location.lat)}° | LON {formatCoordinate(location.lon)}°
              </p>
            </div>
            <div>
              <span className="text-xs text-[#8A949E] font-semibold uppercase">Ketinggian Lahan</span>
              <p className="text-base font-bold text-[#F1F3F5] mt-1">{Math.round(elevation_m)} m dpl</p>
            </div>
          </div>

          {/* Source-Specific Provenance Block */}
          <div className={`p-4 rounded-[4px] border flex flex-col gap-2 ${
            actionSheetProv.overallTone === 'success'
              ? 'bg-[#163A40] border-[#009DA5]/40 text-[#00C2CC]'
              : actionSheetProv.overallTone === 'info'
              ? 'bg-[#163A40] border-[#009DA5]/40 text-[#00C2CC]'
              : 'bg-[#20242B] border-[#2C313A] text-[#C1C7CD]'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-bold text-xs uppercase tracking-wide">Status Sumber Data</span>
              </div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-[3px] bg-[#16191E] border border-current">
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
          <div className="p-8 rounded-[4px] bg-[#16191E] border border-[#2C313A] flex items-center justify-between">
            <div>
              <span className="text-sm font-bold uppercase tracking-wider text-[#00C2CC]">
                Skenario Terpilih: Jalur {selectedPathway}
              </span>
              <h2 className="text-3xl font-extrabold text-[#F1F3F5] mt-1">
                {currentPlan.title}
              </h2>
              <p className="text-sm text-[#8A949E] mt-2 max-w-xl leading-relaxed">
                {currentPlan.description}
              </p>
            </div>

            <div className="text-center p-6 bg-[#20242B] rounded-[4px] border border-[#2C313A] shadow-sm">
              <span className="text-xs font-bold uppercase text-[#8A949E] block">Skor Komposit</span>
              <span className="text-5xl font-black font-mono text-[#00C2CC]">
                {formatScore(currentPlan.compositeScore)}
              </span>
              <span className="text-xs text-[#8A949E] block mt-1">/ 100</span>
            </div>
          </div>

          {/* Key Field Success Indicators */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-5 rounded-[4px] bg-[#20242B] border border-[#2C313A]">
              <span className="text-xs text-[#8A949E] font-bold uppercase block">Baterai Tanah</span>
              <span className="text-3xl font-extrabold font-mono text-[#F1F3F5] mt-1 block">
                {initialBattery}% ➔ {finalBattery}%
              </span>
              <span className="text-xs font-bold text-[#00C2CC] mt-1 inline-block">
                +{deltaBattery}% Pemulihan
              </span>
            </div>

            <div className="p-5 rounded-[4px] bg-[#20242B] border border-[#2C313A]">
              <span className="text-xs text-[#8A949E] font-bold uppercase block">Hemat Air</span>
              <span className="text-3xl font-extrabold font-mono text-[#00C2CC] mt-1 block">
                {currentPlan.waterSavingsPct}%
              </span>
              <span className="text-xs text-[#8A949E] mt-1 inline-block leading-tight">
                Estimasi vs baseline
              </span>
            </div>

            <div className="p-5 rounded-[4px] bg-[#20242B] border border-[#2C313A]">
              <span className="text-xs text-[#8A949E] font-bold uppercase block">Pasokan Nitrogen (ΔN)</span>
              <span className="text-3xl font-extrabold font-mono text-[#00C2CC] mt-1 block">
                +{currentPlan.netNitrogenDelta}
              </span>
              <span className="text-xs text-[#8A949E] mt-1 inline-block">kg N / hektar</span>
            </div>

            <div className="p-5 rounded-[4px] bg-[#20242B] border border-[#2C313A]">
              <span className="text-xs text-[#8A949E] font-bold uppercase block">Indeks Profit</span>
              <span className="text-3xl font-extrabold font-mono text-[#00C2CC] mt-1 block">
                {currentPlan.projectedProfitIndex}
              </span>
              <span className="text-xs text-[#8A949E] mt-1 inline-block">Skala 0-100</span>
            </div>
          </div>

          {/* 4 Seasons Rotation Plan Detailed Grid */}
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold text-[#F1F3F5] tracking-tight flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#00C2CC]" />
              <span>Rencana Pergiliran Tanaman 4 Musim Berkelanjutan</span>
            </h3>

            <div className="grid grid-cols-4 gap-4">
              {currentPlan.seasons.map((season) => {
                const sInfo = getStructuredSeason(season.seasonIndex, season.seasonName, season.monthRange);
                const iconEmoji = getCropEmoji(season.crop.icon);

                return (
                  <div key={season.seasonIndex} className="p-5 rounded-[4px] bg-[#20242B] border border-[#2C313A] flex flex-col justify-between gap-3">
                    <div className="border-b border-[#2C313A] pb-2">
                      <span className="text-xs font-bold text-[#00C2CC] block uppercase tracking-wider">
                        {sInfo.seasonLabel}
                      </span>
                      <span className="text-xs font-semibold text-[#F1F3F5] block">{sInfo.seasonName}</span>
                      <span className="text-xs text-[#8A949E]">{sInfo.monthRange}</span>
                    </div>

                    <div>
                      <span className="text-3xl mb-1 block">{iconEmoji}</span>
                      <h4 className="text-lg font-bold text-[#F1F3F5] leading-tight">{season.crop.name}</h4>
                      <p className="text-xs text-[#8A949E] mt-1 font-medium">
                        Varietas: {season.crop.recommended_variety || 'Unggul Lokal'}
                      </p>
                    </div>

                    <div className="p-3 rounded-[3px] bg-[#16191E] border border-[#2C313A] text-xs flex flex-col gap-1">
                      <div className="flex justify-between">
                        <span className="text-[#8A949E]">Kebutuhan Air:</span>
                        <span className="font-mono font-bold text-[#F1F3F5]">{formatMm(season.waterDemand_mm)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8A949E]">Defisit Air:</span>
                        <span className="font-mono font-bold text-[#8A949E]">{formatMm(season.waterDeficit_mm)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-[#00C2CC] pt-1 border-t border-[#2C313A]">
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
          <div className="p-6 rounded-[4px] bg-[#20242B] border border-[#2C313A] flex items-center justify-between text-xs text-[#8A949E]">
            <div className="flex items-center gap-3">
              <Satellite className="w-5 h-5 text-[#00C2CC] shrink-0" />
              <p className="max-w-3xl leading-relaxed">
                <strong>Pernyataan Ilmiah:</strong> Dihitung dengan algoritma optimasi TerraShaft berbasis asimilasi data NASA POWER dan profil tanah ISRIC SoilGrids. Skor Baterai Tanah adalah indikator <em>screening model</em>; rekomendasi wajib divalidasi bersama Penyuluh Pertanian Lapangan (PPL).
              </p>
            </div>
            <span className="font-mono font-bold text-[#F1F3F5] text-sm shrink-0">
              TERRASHAFT 2026
            </span>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
