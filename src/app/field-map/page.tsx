'use client';

import React from 'react';
import dynamic from 'next/dynamic';

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

export default function FieldMapPage() {
  return (
    <section className="flex flex-col gap-4">
      <FieldOverviewCard />
    </section>
  );
}
