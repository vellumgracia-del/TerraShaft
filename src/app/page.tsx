'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import AppShell from '@/components/shell/AppShell';
import SummaryMetricCards from '@/components/overview/SummaryMetricCards';
import FourSeasonRotationCard from '@/components/rotation/FourSeasonRotationCard';
import SoilBatteryCard from '@/components/soil/SoilBatteryCard';
import DataSourceProvenanceCard from '@/components/provenance/DataSourceProvenanceCard';
import CropLibraryModal from '@/components/modals/CropLibraryModal';
import ActionSheetModal from '@/components/modals/ActionSheetModal';
import { AlertCircle, LayoutDashboard } from 'lucide-react';

const FieldOverviewCard = dynamic(() => import('@/components/overview/FieldOverviewCard'), {
  ssr: false,
  loading: () => (
    <div className="agri-card p-12 flex items-center justify-center text-xs text-[#7B8681] bg-white">
      <div className="flex items-center gap-2.5">
        <div className="w-5 h-5 border-2 border-[#12A875] border-t-transparent rounded-full animate-spin" />
        <span>Memuat Peta & Telemetri Spasial Lahan...</span>
      </div>
    </div>
  )
});

const WaterBalanceCard = dynamic(() => import('@/components/water/WaterBalanceCard'), {
  ssr: false,
  loading: () => (
    <div className="agri-card p-12 flex items-center justify-center text-xs text-[#7B8681] bg-white">
      <div className="flex items-center gap-2.5">
        <div className="w-5 h-5 border-2 border-[#0284C7] border-t-transparent rounded-full animate-spin" />
        <span>Memuat Analisis Neraca Air Lahan...</span>
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
    isExportModalOpen,
    openExportModal,
    closeExportModal
  } = useTerraShaftStore();

  const [activeSection, setActiveSection] = useState('overview');
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const isManualScrollRef = React.useRef(false);
  const manualScrollTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const hasInitializedRef = React.useRef(false);

  // Initial fetch upon mounting once
  useEffect(() => {
    if (!hasInitializedRef.current && !soilData && !isLoadingBioData) {
      hasInitializedRef.current = true;
      fetchBioPhysicalData(location.lat, location.lon);
    }
  }, [fetchBioPhysicalData, isLoadingBioData, location.lat, location.lon, soilData]);

  // Track active section automatically on scroll using IntersectionObserver
  useEffect(() => {
    const sectionIds = [
      'overview',
      'field-map',
      'soil-battery',
      'rotation-planner',
      'water-balance',
      'data-sources'
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        if (isManualScrollRef.current) return;
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const topEntry = visible.reduce((prev, curr) => {
            const prevDist = Math.abs(prev.boundingClientRect.top - 88);
            const currDist = Math.abs(curr.boundingClientRect.top - 88);
            return currDist < prevDist ? curr : prev;
          });
          if (topEntry.target.id) {
            setActiveSection(topEntry.target.id);
          }
        }
      },
      {
        rootMargin: '-88px 0px -40% 0px',
        threshold: [0, 0.15, 0.4]
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
      if (manualScrollTimerRef.current) {
        clearTimeout(manualScrollTimerRef.current);
      }
    };
  }, []);

  // Smooth scroll handler for sidebar navigation
  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    isManualScrollRef.current = true;
    if (manualScrollTimerRef.current) {
      clearTimeout(manualScrollTimerRef.current);
    }

    if (sectionId === 'overview') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const elem = document.getElementById(sectionId);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    manualScrollTimerRef.current = setTimeout(() => {
      isManualScrollRef.current = false;
    }, 850);
  };

  return (
    <AppShell
      activeSection={activeSection}
      onNavigate={handleNavigate}
      onOpenCropLibrary={() => setIsCropModalOpen(true)}
      onOpenExportModal={openExportModal}
      isCropLibraryOpen={isCropModalOpen}
      isExportModalOpen={isExportModalOpen}
    >
      <div className="flex flex-col gap-6">
        {/* Controlled Error Alert Banner */}
        {errorBioData && (
          <div className="p-3.5 bg-[#FDEAEA] border border-[#FECDD3] rounded-2xl flex items-center gap-2.5 text-xs text-[#E11D48] animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#E11D48]" />
            <span>
              <strong>Peringatan Validasi/Jaringan:</strong> {errorBioData}
            </span>
          </div>
        )}

        {/* 1. Ringkasan Lahan (#overview) */}
        <section id="overview" className="scroll-section flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <h2 className="text-sm font-bold text-[#17231F] flex items-center gap-1.5 uppercase tracking-wider">
                <LayoutDashboard className="w-4 h-4 text-[#12A875]" />
                Ringkasan Indikator Biofisik & Rekomendasi
              </h2>
              <p className="text-xs text-[#7B8681]">
                Metrik agro-klimatologi satelit NASA SMAP dan profil tanah ISRIC SoilGrids
              </p>
            </div>
          </div>
          <SummaryMetricCards />
        </section>

        {/* 2. Peta Lahan & Observasi Spasial (#field-map) */}
        <section id="field-map" className="scroll-section">
          <FieldOverviewCard />
        </section>

        {/* 3. Baterai Tanah (#soil-battery) */}
        <section id="soil-battery" className="scroll-section">
          <SoilBatteryCard onExploreRotation={() => handleNavigate('rotation-planner')} />
        </section>

        {/* 4. Rencana Rotasi Pola Tanam 4 Musim (#rotation-planner) */}
        <section id="rotation-planner" className="scroll-section">
          <FourSeasonRotationCard />
        </section>

        {/* 5. Neraca Air (#water-balance) */}
        <section id="water-balance" className="scroll-section">
          <WaterBalanceCard />
        </section>

        {/* 6. Sumber Data & Provenance (#data-sources) */}
        <section id="data-sources" className="scroll-section">
          <DataSourceProvenanceCard />
        </section>
      </div>

      {/* Modals */}
      <CropLibraryModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
      />

      <ActionSheetModal
        isOpen={isExportModalOpen}
        onClose={closeExportModal}
      />
    </AppShell>
  );
}
