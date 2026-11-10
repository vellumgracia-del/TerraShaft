'use client';

import React from 'react';
import dynamic from 'next/dynamic';

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

export default function WaterBalancePage() {
  return (
    <section className="flex flex-col gap-4">
      <WaterBalanceCard />
    </section>
  );
}
