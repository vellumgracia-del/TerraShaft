'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import Navbar from '@/components/dashboard/Navbar';
import SatelliteTelemetryRack from '@/components/dashboard/SatelliteTelemetryRack';
import RotationDecisionCenter from '@/components/dashboard/RotationDecisionCenter';
import RadarComparison from '@/components/dashboard/RadarComparison';
import CropLibraryModal from '@/components/dashboard/CropLibraryModal';
import ActionSheetModal from '@/components/export/ActionSheetModal';
import { AlertCircle, Satellite, Share2, Layers } from 'lucide-react';

const WaterBalanceCenter = dynamic(() => import('@/components/dashboard/WaterBalanceCenter'), {
  ssr: false,
  loading: () => (
    <div className="telemetry-card rounded border border-[#1E293B] bg-[#131B2E] p-8 flex items-center justify-center font-mono text-xs text-slate-400">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-[#06B6D4] border-t-transparent rounded-full animate-spin" />
        <span>MEMUAT TELEMETRI SPASIAL & NERACA AIR...</span>
      </div>
    </div>
  )
});

export default function Home() {
  const {
    location,
    soilData,
    isLoadingBioData,
    errorBioData,
    fetchBioPhysicalData,
    isFieldMode,
    isExportModalOpen,
    closeExportModal,
    openExportModal
  } = useTerraShaftStore();

  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [showRadarDrawer, setShowRadarDrawer] = useState(false);

  // Initial fetch data biofisik saat pertama kali aplikasi dibuka
  useEffect(() => {
    if (!soilData && !isLoadingBioData) {
      fetchBioPhysicalData(location.lat, location.lon);
    }
  }, []);

  return (
    <div
      data-field-mode={isFieldMode ? 'true' : 'false'}
      className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100 transition-colors"
    >
      {/* 1. Header Mission Control Navbar */}
      <Navbar
        onOpenCropLibrary={() => setIsCropModalOpen(true)}
        onOpenExportModal={openExportModal}
      />

      {/* Main Mission Control Layout (3-Zone Architecture) */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-3 lg:px-6 py-4 flex flex-col gap-4">
        {/* Banner Alert Notifikasi Jaringan Telemetri */}
        {errorBioData && (
          <div className="p-2.5 bg-red-950/40 border border-red-800 rounded flex items-center gap-2 text-xs text-red-300 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>ALERT: {errorBioData}. Failover mengaktifkan model regional Nusa Tenggara.</span>
          </div>
        )}

        {/* ========================================================
            TIGA ZONA OPERASIONAL TELEMETRI (12-COLUMN GRID)
            Zona 1 (3 Col): Telemetri Biofisik Satelit
            Zona 2 (6 Col): Neraca Air & The Soil Battery
            Zona 3 (3 Col): Engine Rotasi & Audit Logika
           ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* ZONA 1 (Kiri - 3 Col): Telemetri Satelit Riil */}
          <section className="lg:col-span-3 flex flex-col gap-3">
            <SatelliteTelemetryRack />
          </section>

          {/* ZONA 2 (Tengah - 6 Col): Neraca Air & Peta Minimalis */}
          <section className="lg:col-span-6 flex flex-col gap-3">
            <WaterBalanceCenter />
          </section>

          {/* ZONA 3 (Kanan - 3 Col): Engine Rotasi & Audit Logika Eliminasi */}
          <section className="lg:col-span-3 flex flex-col gap-3">
            <RotationDecisionCenter />
          </section>
        </div>

        {/* Collapsible Analisis Multi-Dimensi: Radar Trade-off Chart */}
        <div className="telemetry-card rounded border border-[#1E293B] bg-[#131B2E] p-3 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300 font-mono">
                ANALISIS KOMPARATIF TRADE-OFF (SPIDER RADAR METRIK)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                [5 Sumbu Evaluasi]
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowRadarDrawer(!showRadarDrawer)}
              className="text-xs font-mono text-[#06B6D4] hover:underline"
            >
              {showRadarDrawer ? 'Sembunyikan Grafik [-]' : 'Tampilkan Grafik [+]'}
            </button>
          </div>

          {showRadarDrawer && (
            <div className="pt-2 border-t border-slate-800">
              <RadarComparison />
            </div>
          )}
        </div>

        {/* Bottom Operational Action Bar */}
        <section className="bg-[#131B2E] border border-[#1E293B] rounded p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#06B6D4]" />
            <span className="text-slate-300">
              SISTEM ROTASI ADAPTIF AKTIF: Validasi batas SMAP & GPM diterapkan pada 4 siklus musim.
            </span>
          </div>

          <button
            type="button"
            onClick={openExportModal}
            className="px-4 py-1.5 rounded bg-[#2563EB] hover:bg-blue-600 text-white font-semibold transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Generate Action Sheet WhatsApp (1080×1350)</span>
          </button>
        </section>
      </main>

      {/* Footer Citations Standar NASA */}
      <footer className="border-t border-[#1E293B] bg-[#0B0F17] py-3 text-center text-[11px] font-mono text-slate-500">
        <div className="max-w-[1600px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 TerraRotate Engine — Telemetri Asimilasi NASA POWER (SMAP L4, GPM IMERG, CERES, MERRA-2) & ISRIC SoilGrids v2.0.</p>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="flex items-center gap-1">
              <Satellite className="w-3 h-3 text-[#06B6D4]" />
              NASA Earth Data Cloud
            </span>
            <span>•</span>
            <span>Hargreaves-Samani Bio-Deficit Model</span>
          </div>
        </div>
      </footer>

      {/* Modal Pustaka Komoditas Tanaman */}
      <CropLibraryModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
      />

      {/* Modal Action Sheet WhatsApp / PDF Export (1080x1350 px) */}
      <ActionSheetModal
        isOpen={isExportModalOpen}
        onClose={closeExportModal}
      />
    </div>
  );
}
