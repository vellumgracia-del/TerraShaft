'use client';

import React from 'react';
import ActiveTelemetrySidebar from '@/components/advisor/ActiveTelemetrySidebar';
import AdvisoryChatSection from '@/components/advisor/AdvisoryChatSection';
import { useAppI18n } from '@/lib/i18n';

export default function FieldAdvisorPage() {
  const { isEn } = useAppI18n();

  return (
    <div className="flex flex-col gap-3 lg:h-full lg:min-h-0 lg:overflow-hidden">
      {/* Compact Single-Row Header for No-Scroll Viewport Layout */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-[#242831]">
        <h1 className="text-lg lg:text-xl font-semibold text-[#F1F3F5] tracking-tight">
          Field Advisor AI
        </h1>
        <p className="text-[11px] text-[#8A949E] truncate max-w-2xl">
          {isEn
            ? 'Interactive agronomy copilot grounded in NASA POWER, ISRIC SoilGrids v2.0, AEZ cultivar localization, and FAO/BRIN references.'
            : 'Konsultasi agronomi berbasis telemetri NASA POWER, profil tanah ISRIC v2.0, lokalisasi kultivar AEZ, dan rujukan resmi BRIN/FAO-56.'}
        </p>
      </div>

      {/* Main 2-Column Fixed-Height Workspace */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 items-stretch">
        {/* Left Column: Active Field Telemetry Inspector */}
        <ActiveTelemetrySidebar />

        {/* Right Column: Grounded Advisory Chat Interface */}
        <AdvisoryChatSection />
      </div>
    </div>
  );
}
