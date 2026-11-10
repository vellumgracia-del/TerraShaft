'use client';

import React from 'react';
import DataSourceProvenanceCard from '@/components/provenance/DataSourceProvenanceCard';

export default function DataSourcesPage() {
  return (
    <section className="flex flex-col gap-4">
      <DataSourceProvenanceCard />
    </section>
  );
}
