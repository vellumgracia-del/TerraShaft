'use client';

import React, { useEffect, useState } from 'react';
import DataSourceProvenanceCard from '@/components/provenance/DataSourceProvenanceCard';
import NasaChallengeResources from '@/components/provenance/NasaChallengeResources';
import RagKnowledgeCatalog from '@/components/provenance/RagKnowledgeCatalog';
import { AGRONOMY_KNOWLEDGE_BASE } from '@/data/agronomyKnowledgeBase';
import { Database, Activity, BookOpen } from 'lucide-react';

type DataSourcesTab = 'catalog' | 'live-status' | 'rag-sop';

export default function DataSourcesPage() {
  const [activeTab, setActiveTab] = useState<DataSourcesTab>('catalog');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'rag-sop' || tab === 'live-status' || tab === 'catalog') {
      setActiveTab(tab);
    }
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Tab Bar Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#2C313A] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2 rounded-[3px] text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'catalog'
              ? 'bg-[#00C2CC] text-[#121417] font-semibold shadow-xs'
              : 'bg-[#16191E] text-[#A6AFB8] hover:text-white hover:bg-[#20242B] border border-[#2C313A]'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>13 Sumber Dataset, Referensi & Peran Sistem</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('live-status')}
          className={`flex items-center gap-2 px-4 py-2 rounded-[3px] text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'live-status'
              ? 'bg-[#00C2CC] text-[#121417] font-semibold shadow-xs'
              : 'bg-[#16191E] text-[#A6AFB8] hover:text-white hover:bg-[#20242B] border border-[#2C313A]'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Status Telemetri & Provenansi AOI Aktif</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rag-sop')}
          className={`flex items-center gap-2 px-4 py-2 rounded-[3px] text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'rag-sop'
              ? 'bg-[#00C2CC] text-[#121417] font-semibold shadow-xs'
              : 'bg-[#16191E] text-[#A6AFB8] hover:text-white hover:bg-[#20242B] border border-[#2C313A]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Basis Data SOP Ilmiah AI (RAG)</span>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              activeTab === 'rag-sop' ? 'bg-[#121417]/20 text-[#121417]' : 'bg-[#20242B] text-[#8A949E]'
            }`}
          >
            {AGRONOMY_KNOWLEDGE_BASE.length} Dokumen
          </span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'catalog' ? (
        <section className="flex flex-col gap-4">
          <NasaChallengeResources />
        </section>
      ) : activeTab === 'live-status' ? (
        <section className="flex flex-col gap-4">
          <DataSourceProvenanceCard />
        </section>
      ) : (
        <section className="flex flex-col gap-4">
          <RagKnowledgeCatalog />
        </section>
      )}
    </div>
  );
}
