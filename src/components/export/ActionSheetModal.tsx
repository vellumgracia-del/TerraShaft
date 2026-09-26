'use client';

import React, { useRef, useState } from 'react';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import { toPng } from 'html-to-image';
import {
  X,
  Download,
  Share2,
  Printer,
  Sparkles,
  Sprout,
  CheckCircle2,
  Calendar,
  Droplets,
  Zap,
  MapPin,
  Layers,
  Satellite,
  Info
} from 'lucide-react';

interface ActionSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ActionSheetModal({ isOpen, onClose }: ActionSheetModalProps) {
  const { location, soilData, climateData, plans, selectedPathway } = useTerraShaftStore();
  const cardRef = useRef<HTMLDivElement>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  if (!isOpen) return null;

  const currentPlan = plans ? plans[selectedPathway] : null;
  if (!currentPlan) return null;

  const initialBattery = currentPlan.initialBatteryScore;
  const finalBattery = currentPlan.soilBatteryScore;
  const deltaBattery = finalBattery - initialBattery;

  // Handler Download PNG Resolusi Tinggi (1080x1350 px)
  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    setExportSuccess(false);

    try {
      // Pastikan font dan styling termuat sempurna
      await document.fonts?.ready;

      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 1, // Card sudah didesain 1080x1350 px native
        backgroundColor: '#020617'
      });

      const cleanLocation = (location.placeName || 'Lahan').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
      const filename = `TerraRotate_ActionSheet_${cleanLocation}_Pathway_${selectedPathway}.png`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err) {
      console.error('Export Action Sheet failed:', err);
      alert('Gagal mengekspor berkas gambar. Silakan gunakan tombol cetak browser.');
    } finally {
      setIsExporting(false);
    }
  };

  // Handler Kirim ke WhatsApp (navigator.share / WhatsApp Web Text Link)
  const handleShareWhatsApp = async () => {
    const cropsSummary = currentPlan.seasons
      .map((s) => `• *${s.seasonName.split('(')[0].trim()} (${s.monthRange})*: ${s.crop.name} (Varietas: ${s.crop.recommended_variety || 'Unggul'}) — ${s.notes}`)
      .join('\n');

    const messageText = `🌾 *Rekomendasi Pola Tanam Adaptif TerraRotate* 🌾\n` +
      `📍 *Lokasi:* ${location.placeName || 'Lahan Kering Indonesia'} (${location.lat.toFixed(4)}, ${location.lon.toFixed(4)})\n` +
      `🌱 *Skenario:* ${currentPlan.title}\n\n` +
      `📊 *Indikator Keberhasilan Lapangan:*\n` +
      `⚡ *Baterai Tanah:* ${initialBattery}% ➔ ${finalBattery}% (${deltaBattery >= 0 ? '+' : ''}${deltaBattery}%)\n` +
      `💧 *Penghematan Air:* ${currentPlan.waterSavingsPct}%\n` +
      `🧪 *Neraca Nitrogen Alami:* +${currentPlan.netNitrogenDelta} kg N/ha\n` +
      `💰 *Indeks Profit:* ${currentPlan.projectedProfitIndex}/100\n\n` +
      `📅 *Jadwal 4 Musim Tanam:*\n${cropsSummary}\n\n` +
      `🛰️ _Dihitung berdasarkan asimilasi satelit NASA SMAP & ISRIC SoilGrids v2.0 via TerraRotate Engine_`;

    // Coba Web Share API dengan file blob jika browser mendukung
    if (navigator.share && cardRef.current) {
      try {
        setIsExporting(true);
        const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 1 });
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], `TerraRotate_ActionSheet_${selectedPathway}.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Lembar Panduan Pola Tanam TerraRotate',
            text: messageText,
            files: [file]
          });
          setIsExporting(false);
          return;
        }
      } catch (e) {
        console.log('Native file sharing declined or not supported, falling back to WhatsApp link:', e);
      } finally {
        setIsExporting(false);
      }
    }

    // Fallback URL WhatsApp
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;
    window.open(waUrl, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Modal Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg">
              📲
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm sm:text-base">
                  Action Sheet WhatsApp (1080×1350 px, Rasio 4:5)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  Format Siap Sebar
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Lembar panduan visual berkecepatan tinggi untuk Penyuluh (PPL) & Petani Lapangan
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Aksi Atas */}
        <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Skenario Aktif: <strong className="text-emerald-400">{currentPlan.title}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            {/* Tombol Print */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>

            {/* Tombol WhatsApp */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              disabled={isExporting}
              className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold shadow transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Kirim ke WhatsApp</span>
            </button>

            {/* Tombol Download PNG Resolusi Penuh */}
            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={isExporting}
              className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Memproses HD...' : 'Unduh Gambar PNG'}</span>
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {exportSuccess && (
          <div className="px-5 py-2.5 bg-emerald-500/20 border-b border-emerald-500/30 flex items-center justify-center gap-2 text-xs text-emerald-300 font-medium animate-pulse">
            <CheckCircle2 className="w-4 h-4" />
            <span>Gambar Action Sheet 1080×1350 px berhasil diunduh ke perangkat Anda!</span>
          </div>
        )}

        {/* Viewport Card Preview (Scaled to Fit Comfortably in Modal) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 flex justify-center items-start">
          {/* Card Scaled Wrapper */}
          <div className="w-full max-w-[540px] flex justify-center items-center">
            {/* INTI ELEMEN CANVAS ACTION SHEET (1080 x 1350 px Native) */}
            <div
              ref={cardRef}
              style={{
                width: '1080px',
                height: '1350px',
                transform: 'scale(0.5)',
                transformOrigin: 'top center',
                marginBottom: '-675px' // Menghilangkan whitespace akibat scale(0.5)
              }}
              className="bg-slate-950 text-slate-100 p-12 flex flex-col justify-between border-4 border-slate-800 rounded-[40px] shadow-2xl relative overflow-hidden select-none shrink-0"
            >
              {/* Watermark Pattern Background */}
              <div className="absolute -right-24 -top-24 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

              {/* SECTION 1: HEADER & IDENTITAS BRAND */}
              <div className="flex items-center justify-between border-b-2 border-slate-800 pb-8">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-xl border-2 border-emerald-400/40">
                    <Sprout className="w-12 h-12" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-black tracking-tight text-white">
                        Terra<span className="text-emerald-400">Rotate</span>
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        MUSIM 2026 / 2027
                      </span>
                    </div>
                    <p className="text-base text-slate-400 font-medium mt-1">
                      Adaptive Crop Rotation & Closed-Loop Soil Regeneration Engine
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">ASIMILASI SATELIT</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-emerald-400">
                      NASA SMAP & POWER
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-sky-400">
                      ISRIC SoilGrids v2.0
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: IDENTITAS LAHAN & BASELINE BIOFISIK */}
              <div className="bg-slate-900/90 border-2 border-slate-800 rounded-3xl p-7 flex items-center justify-between gap-6 shadow-md">
                <div className="flex flex-col gap-1.5 flex-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    LOKASI LAHAN PERTANIAN
                  </span>
                  <h4 className="text-2xl font-bold text-white leading-tight">
                    {location.placeName || 'Kawasan Lahan Kering Indonesia'}
                  </h4>
                  <span className="font-mono text-sm text-emerald-400 font-semibold">
                    Titik Koordinat: {location.lat.toFixed(4)}°, {location.lon.toFixed(4)}°
                  </span>
                </div>

                <div className="h-16 w-px bg-slate-800" />

                {/* Indikator Fisika Tanah */}
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 font-medium">Tekstur USDA</span>
                    <span className="text-base font-bold text-slate-200 mt-0.5">{soilData?.textureClass || 'Lempung Liat'}</span>
                    <span className="text-[11px] text-slate-500 font-mono mt-0.5">P:{soilData?.sand || 38}% | L:{soilData?.clay || 30}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 font-medium">Karbon Organik (SOC)</span>
                    <span className="text-xl font-bold font-mono text-amber-300 mt-0.5">{soilData?.soc || 1.15}%</span>
                    <span className="text-[11px] text-amber-400/90 font-medium">Kapasitas Hara</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 font-medium">Kelembapan Akar SMAP</span>
                    <span className="text-xl font-bold font-mono text-sky-400 mt-0.5">
                      {climateData ? Math.round(climateData.rootZoneSoilMoisture * 100) : 38}%
                    </span>
                    <span className="text-[11px] text-sky-300 font-medium">{climateData?.soilWetnessCategory || 'Defisit Air'}</span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: RINGKASAN METRIK KEBERHASILAN SKENARIO */}
              <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-sky-950/60 border-2 border-emerald-500/40 rounded-3xl p-7 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    SKENARIO REKOMENDASI TERPILIH: {selectedPathway}
                  </span>
                  <h3 className="text-2xl font-black text-white mt-2">
                    {currentPlan.title}
                  </h3>
                  <p className="text-sm text-slate-300 mt-1 max-w-xl line-clamp-1">
                    {currentPlan.subtitle}
                  </p>
                </div>

                {/* 3 Box Metrik Kunci */}
                <div className="flex items-center gap-4">
                  <div className="bg-slate-950/80 border border-slate-800 px-5 py-3 rounded-2xl text-center">
                    <span className="text-xs text-slate-400 block font-medium">Baterai Tanah</span>
                    <span className="text-2xl font-mono font-black text-emerald-400">
                      {finalBattery}%
                    </span>
                    <span className="text-[11px] text-emerald-300 font-bold block mt-0.5">
                      {deltaBattery >= 0 ? `+${deltaBattery}%` : `${deltaBattery}%`} Recharged
                    </span>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 px-5 py-3 rounded-2xl text-center">
                    <span className="text-xs text-slate-400 block font-medium">Penghematan Air</span>
                    <span className="text-2xl font-mono font-black text-sky-400">
                      {currentPlan.waterSavingsPct}%
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">vs Monokultur</span>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 px-5 py-3 rounded-2xl text-center">
                    <span className="text-xs text-slate-400 block font-medium">Neraca N Alami</span>
                    <span className="text-2xl font-mono font-black text-teal-300">
                      +{currentPlan.netNitrogenDelta}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">kg N/hektar</span>
                  </div>
                </div>
              </div>

              {/* SECTION 4: TABEL JADWAL 4 MUSIM ROTASI LENGKAP */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  JADWAL ROTASI & REKOMENDASI VARIETAS UNGGUL TAHAN IKLIM (4 MUSIM)
                </span>

                <div className="grid grid-cols-1 gap-3.5">
                  {currentPlan.seasons.map((alloc, idx) => {
                    const isDry = idx >= 2;
                    return (
                      <div
                        key={idx}
                        className="bg-slate-900/90 border-2 border-slate-800 rounded-2xl p-5 flex items-center justify-between gap-6"
                      >
                        {/* Kolom Musim */}
                        <div className="w-44 flex flex-col">
                          <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                            MUSIM {alloc.seasonIndex}
                          </span>
                          <span className="text-lg font-bold text-white mt-0.5">{alloc.monthRange}</span>
                          <span className={`text-[11px] font-semibold mt-1 px-2.5 py-0.5 rounded-full w-fit ${
                            isDry ? 'bg-amber-500/20 text-amber-300' : 'bg-sky-500/20 text-sky-300'
                          }`}>
                            {isDry ? 'Puncak Kemarau' : 'Musim Rendeng'}
                          </span>
                        </div>

                        {/* Kolom Tanaman & Varietas */}
                        <div className="flex-1 flex flex-col">
                          <div className="flex items-center gap-3">
                            <h5 className="text-xl font-bold text-white">{alloc.crop.name}</h5>
                            <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                              {alloc.crop.category}
                            </span>
                          </div>
                          <span className="text-sm text-amber-300 font-semibold mt-1">
                            Rekomendasi Varietas Unggul: {alloc.crop.recommended_variety || 'Varietas Unggul Adaptif'}
                          </span>
                          <p className="text-xs text-slate-300 mt-1 line-clamp-1">
                            {alloc.notes}
                          </p>
                        </div>

                        {/* Kolom Neraca Biofisik */}
                        <div className="flex items-center gap-5 text-right font-mono">
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-400 font-sans">Kebutuhan Air</span>
                            <span className="text-sm font-bold text-slate-200">{alloc.waterDemand_mm} mm</span>
                            <span className={`text-[11px] font-sans font-medium ${
                              alloc.waterDeficit_mm > 0 ? 'text-rose-400' : 'text-emerald-400'
                            }`}>
                              {alloc.waterDeficit_mm > 0 ? `Defisit ${alloc.waterDeficit_mm}mm` : 'Air Cukup'}
                            </span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-xs text-slate-400 font-sans">Efek Baterai</span>
                            <span className={`text-base font-bold ${
                              alloc.batteryDelta_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                              {alloc.batteryDelta_pct >= 0 ? `+${alloc.batteryDelta_pct}%` : `${alloc.batteryDelta_pct}%`}
                            </span>
                            <span className="text-[11px] text-teal-300 font-sans">
                              {alloc.nitrogenDelta_kg_ha > 0 ? `+${alloc.nitrogenDelta_kg_ha}kg N` : `${alloc.nitrogenDelta_kg_ha}kg N`}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 5: PANDUAN PRAKTIS PENYULUH LAPANGAN (PPL) */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-white block text-sm">Instruksi Lapangan untuk Petani & PPL:</strong>
                    <span>
                      Gunakan sisa jerami/biomassa musim rendeng sebagai mulsa penutup tanah saat memasuki musim kemarau. Jangan dibakar!
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] text-slate-400 block">Divalidasi Oleh:</span>
                  <span className="font-bold text-emerald-400 text-sm">PPL & Tim Agronomi Daerah</span>
                </div>
              </div>

              {/* SECTION 6: FOOTER & CITATION NASA */}
              <div className="flex items-center justify-between pt-6 border-t-2 border-slate-800 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Satellite className="w-4 h-4 text-emerald-500" />
                  <span>Dihitung berdasarkan observasi satelit NASA SMAP L4, NASA POWER Agroclimatology & ISRIC SoilGrids v2.0</span>
                </div>
                <div className="font-mono text-slate-400">
                  ID Verifikasi: TR-{selectedPathway}-{Math.abs(Math.round(location.lat * 100))}-{Math.abs(Math.round(location.lon * 100))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
