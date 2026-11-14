'use client';

import React, { useState } from 'react';
import DataSourceProvenanceCard from '@/components/provenance/DataSourceProvenanceCard';
import NasaChallengeResources from '@/components/provenance/NasaChallengeResources';
import { Satellite, Database, Activity } from 'lucide-react';

export default function DataSourcesPage() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'live-status'>('catalog');

  return (
    <div className="flex flex-col gap-6">
      {/* Top Tab Bar Navigation */}
      <div className="flex items-center gap-2 border-b border-[#2C313A] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2 rounded-[3px] text-xs font-medium transition-all ${
            activeTab === 'catalog'
              ? 'bg-[#00C2CC] text-[#121417] font-semibold shadow-xs'
              : 'bg-[#16191E] text-[#A6AFB8] hover:text-white hover:bg-[#20242B] border border-[#2C313A]'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Katalog 24 Dataset Resmi NASA 2026</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
            activeTab === 'catalog' ? 'bg-[#121417]/20 text-[#121417]' : 'bg-[#20242B] text-[#8A949E]'
          }`}>
            24
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('live-status')}
          className={`flex items-center gap-2 px-4 py-2 rounded-[3px] text-xs font-medium transition-all ${
            activeTab === 'live-status'
              ? 'bg-[#00C2CC] text-[#121417] font-semibold shadow-xs'
              : 'bg-[#16191E] text-[#A6AFB8] hover:text-white hover:bg-[#20242B] border border-[#2C313A]'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Status Telemetri & Provenansi AOI Aktif</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'catalog' ? (
        <section className="flex flex-col gap-4">
          <NasaChallengeResources />
        </section>
      ) : (
        <section className="flex flex-col gap-4">
          <DataSourceProvenanceCard />
        </section>
      )}
    </div>
  );
}
