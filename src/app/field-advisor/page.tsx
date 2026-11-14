'use client';

import React from 'react';
import ActiveTelemetrySidebar from '@/components/advisor/ActiveTelemetrySidebar';
import AdvisoryChatSection from '@/components/advisor/AdvisoryChatSection';
import { Sparkles } from 'lucide-react';

export default function FieldAdvisorPage() {
  return (
    <div className="flex flex-col gap-5">
      {/* Page Header matching Planet Insights Dark Carbon Theme */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#00C2CC]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Grounded Agronomist Copilot · RAG Precision Engine</span>
        </div>
        <h1 className="text-xl lg:text-2xl font-semibold text-[#F1F3F5] tracking-tight">
          Field Advisor AI
        </h1>
        <p className="text-xs text-[#9BA3AE] max-w-3xl">
          Konsultasi agronomi interaktif berbasis data telemetri satelit NASA (curah hujan & kelembapan tanah SMAP) dan profil tanah ISRIC (fraksi tekstur, pH, SOC). Setiap rekomendasi diselaraskan dengan dokumen ilmiah resmi BRIN, Balitkabi, Balittanah, dan standar FAO-56.
        </p>
      </div>

      {/* Main 2-Column Responsive Workspace */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Left Column: Active Field Telemetry Inspector */}
        <ActiveTelemetrySidebar />

        {/* Right Column: Grounded Advisory Chat Interface */}
        <AdvisoryChatSection />
      </div>
    </div>
  );
}
