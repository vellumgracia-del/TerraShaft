'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useAppI18n } from '@/lib/i18n';

function MapLoadingFallback() {
  const { isEn } = useAppI18n();
  return (
    <div className="w-full h-full bg-[#121417] flex items-center justify-center text-xs text-[#8A949E]">
      <div className="flex items-center gap-2.5 bg-[#16191E] border border-[#282C34] px-4 py-3 rounded-[4px] shadow-2xl">
        <div className="w-4 h-4 border-2 border-[#009DA5] border-t-transparent rounded-full animate-spin" />
        <span>
          {isEn
            ? 'Loading GIS Workbench & Satellite Imagery...'
            : 'Memuat GIS Workbench & Citra Satelit Lahan...'}
        </span>
      </div>
    </div>
  );
}

const InteractiveFieldExplorer = dynamic(
  () => import('@/components/map/InteractiveFieldExplorer'),
  {
    ssr: false,
    loading: () => <MapLoadingFallback />
  }
);

export default function FieldMapPage() {
  return (
    <div className="w-full h-full relative overflow-hidden">
      <InteractiveFieldExplorer />
    </div>
  );
}
