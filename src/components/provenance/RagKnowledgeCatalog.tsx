'use client';

import React, { useState } from 'react';
import { AGRONOMY_KNOWLEDGE_BASE, KnowledgeDocument } from '@/data/agronomyKnowledgeBase';
import { useAppI18n } from '@/lib/i18n';
import { BookOpen, Search, Building2, Calendar, Tag } from 'lucide-react';

const CATEGORY_LABELS: Record<KnowledgeDocument['category'], { en: string; id: string; color: string }> = {
  crop: { en: 'Crop & Cultivar', id: 'Tanaman & Kultivar', color: 'text-[#34D399]' },
  soil: { en: 'Soil & Fertility', id: 'Tanah & Kesuburan', color: 'text-[#FBBF24]' },
  water: { en: 'Water & Satellite', id: 'Air & Satelit', color: 'text-[#00C2CC]' },
  pest: { en: 'Pest & Protection', id: 'Hama & Proteksi', color: 'text-[#F87171]' }
};

export default function RagKnowledgeCatalog() {
  const { isEn } = useAppI18n();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | KnowledgeDocument['category']>('all');

  const q = search.trim().toLowerCase();
  const filteredDocs = AGRONOMY_KNOWLEDGE_BASE.filter((doc) => {
    if (activeCategory !== 'all' && doc.category !== activeCategory) return false;
    if (!q) return true;
    return (
      doc.title.toLowerCase().includes(q) ||
      doc.institution.toLowerCase().includes(q) ||
      doc.summary.toLowerCase().includes(q) ||
      doc.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Header & Search */}
      <div className="bg-[#16191E] border border-[#282C34] rounded-[6px] p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[4px] bg-[#163A40] flex items-center justify-center text-[#00C2CC]">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#F1F3F5]">
              {isEn
                ? `Field Advisor RAG Knowledge Base (${AGRONOMY_KNOWLEDGE_BASE.length} SOP Documents)`
                : `Basis Data Pengetahuan RAG Field Advisor (${AGRONOMY_KNOWLEDGE_BASE.length} Dokumen SOP)`}
            </h2>
            <p className="text-xs text-[#8A949E]">
              {isEn
                ? 'Verified scientific documents from BRIN, Balittanah, FAO, NASA, USDA, and ESA used to ground AI recommendations.'
                : 'Dokumen ilmiah resmi dari BRIN, Balittanah, FAO, NASA, USDA, dan ESA yang menjadi rujukan utama jawaban AI.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#6C757D] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                isEn
                  ? 'Search title, institution, or tag (e.g. NASA, FAO, pH, sorgum)...'
                  : 'Cari judul, institusi, atau tag (misal: NASA, FAO, pH, sorgum)...'
              }
              className="w-full bg-[#121418] border border-[#282C34] focus:border-[#00C2CC] rounded-[4px] pl-8 pr-3 py-1.5 text-xs text-[#F1F3F5] placeholder-[#6C757D] outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(['all', 'crop', 'soil', 'water', 'pest'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1.5 rounded-[4px] text-[11px] font-medium border transition-colors cursor-pointer shrink-0 ${
                  activeCategory === cat
                    ? 'bg-[#163A40] text-[#00C2CC] border-[#164E55]'
                    : 'bg-[#121418] text-[#9BA3AE] border-[#282C34] hover:text-[#F1F3F5]'
                }`}
              >
                {cat === 'all'
                  ? isEn ? 'All' : 'Semua'
                  : isEn ? CATEGORY_LABELS[cat].en : CATEGORY_LABELS[cat].id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocs.length === 0 ? (
        <div className="bg-[#16191E] border border-[#282C34] rounded-[6px] p-8 text-center text-xs text-[#8A949E]">
          {isEn ? 'No matching SOP documents found.' : 'Tidak ada dokumen SOP yang cocok dengan pencarian.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredDocs.map((doc, idx) => {
            const catMeta = CATEGORY_LABELS[doc.category];
            return (
              <div
                key={doc.id}
                className="bg-[#16191E] border border-[#282C34] rounded-[6px] p-4 flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[13px] font-semibold text-[#F1F3F5] leading-snug">
                    <span className="text-[#00C2CC] font-mono mr-1.5">#{idx + 1}</span>
                    {doc.title}
                  </h3>
                  <span className={`text-[11px] font-mono shrink-0 ${catMeta.color}`}>
                    {isEn ? catMeta.en : catMeta.id}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#9BA3AE]">
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-[#00C2CC]" />
                    {doc.institution}
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3 text-[#8A949E]" />
                    {doc.year}
                  </span>
                </div>

                <p className="text-xs text-[#C1C7CD] leading-relaxed">{doc.summary}</p>

                <ul className="list-disc pl-4 space-y-0.5 text-[11.5px] text-[#9BA3AE]">
                  {doc.recommendations.map((rec, rIdx) => (
                    <li key={rIdx}>{rec}</li>
                  ))}
                </ul>

                <div className="mt-auto pt-2 border-t border-[#242831] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1">
                    <Tag className="w-3 h-3 text-[#6C757D] mr-0.5" />
                    {doc.tags.slice(0, 5).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono px-1.5 py-0.5 bg-[#121418] text-[#8A949E] rounded-[3px] border border-[#242831]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-[10.5px] font-mono text-[#6C757D]">
                    {doc.citation}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
