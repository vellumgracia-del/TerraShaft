'use client';

import React from 'react';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import {
  MapPin,
  Layers,
  Droplets,
  Sprout,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

export default function ActiveTelemetrySidebar() {
  const {
    location,
    elevation_m,
    soilData,
    climateData,
    selectedPathway,
    plans,
    setSelectedPathway,
    isLoadingBioData,
    fetchBioPhysicalData
  } = useTerraShaftStore();

  const activePlan = plans ? plans[selectedPathway] : null;

  return (
    <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-4">
      {/* Lahan & Lokasi Aktif */}
      <div className="bg-[#16191E] border border-[#282C34] rounded-[6px] p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-[#282C34] pb-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9BA3AE]">
            <MapPin className="w-3.5 h-3.5 text-[#00C2CC]" />
            <span>Lahan Aktif</span>
          </div>
          <button
            type="button"
            onClick={() => fetchBioPhysicalData(location.lat, location.lon)}
            disabled={isLoadingBioData}
            title="Muat ulang telemetri"
            className="text-[#9BA3AE] hover:text-[#00C2CC] transition-colors p-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBioData ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#F1F3F5] leading-snug">
            {location.placeName || 'Koordinat Lahan'}
          </h3>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#9BA3AE] font-mono">
            <span>Lat: {location.lat.toFixed(4)}°</span>
            <span>Lon: {location.lon.toFixed(4)}°</span>
            <span>Elevasi: {elevation_m} mdpl</span>
          </div>
        </div>

        <Link
          href="/field-map"
          className="inline-flex items-center justify-between text-xs text-[#00C2CC] hover:text-[#33D4DC] transition-colors border-t border-[#242831] pt-2"
        >
          <span>Ganti Lokasi di Peta GIS</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Profil Fisika & Kimia Tanah (ISRIC) */}
      <div className="bg-[#16191E] border border-[#282C34] rounded-[6px] p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 border-b border-[#282C34] pb-2.5 text-xs font-semibold uppercase tracking-wider text-[#9BA3AE]">
          <Layers className="w-3.5 h-3.5 text-[#00C2CC]" />
          <span>Profil Tanah (0-30 cm)</span>
        </div>

        {soilData ? (
          <div className="flex flex-col gap-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-[#20252D]">
              <span className="text-[#9BA3AE]">Kelas Tekstur</span>
              <span className="font-medium text-[#F1F3F5]">{soilData.textureClass}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#20252D]">
              <span className="text-[#9BA3AE]">Derajat Keasaman (pH)</span>
              <span
                className={`font-semibold px-2 py-0.5 rounded-[3px] text-[11px] ${
                  soilData.ph < 5.5
                    ? 'bg-[#422006] text-[#FBBF24] border border-[#78350F]'
                    : 'bg-[#064E3B] text-[#34D399] border border-[#047857]'
                }`}
              >
                {soilData.ph} ({soilData.ph < 5.5 ? 'Masam' : 'Netral/Optimal'})
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#20252D]">
              <span className="text-[#9BA3AE]">Komposisi (L-P-D)</span>
              <span className="text-[#C1C7CD] font-mono text-[11px]">
                {soilData.clay}% / {soilData.sand}% / {soilData.silt}%
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#20252D]">
              <span className="text-[#9BA3AE]">Karbon Organik (SOC)</span>
              <span className="font-mono text-[#F1F3F5]">{soilData.soc}%</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-[#9BA3AE]">Kapasitas Air (AWC)</span>
              <span className="font-mono text-[#00C2CC]">{soilData.awc} mm</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-[#8A949E] py-2">Memuat profil tanah ISRIC...</div>
        )}
      </div>

      {/* Telemetri Air & Satelit NASA */}
      <div className="bg-[#16191E] border border-[#282C34] rounded-[6px] p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 border-b border-[#282C34] pb-2.5 text-xs font-semibold uppercase tracking-wider text-[#9BA3AE]">
          <Droplets className="w-3.5 h-3.5 text-[#00C2CC]" />
          <span>Satelit NASA POWER</span>
        </div>

        {climateData ? (
          <div className="flex flex-col gap-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-[#20252D]">
              <span className="text-[#9BA3AE]">Curah Hujan Tahunan</span>
              <span className="font-mono text-[#F1F3F5]">{climateData.annualRainfall_mm} mm/th</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-[#9BA3AE]">SMAP Root-Zone (GWET)</span>
              <span
                className={`font-mono font-semibold px-2 py-0.5 rounded-[3px] text-[11px] ${
                  climateData.rootZoneSoilMoisture < 0.25
                    ? 'bg-[#3B1219] text-[#F87171] border border-[#7F1D1D]'
                    : 'bg-[#0E2E33] text-[#00C2CC] border border-[#164E55]'
                }`}
              >
                {climateData.rootZoneSoilMoisture.toFixed(2)} (
                {climateData.rootZoneSoilMoisture < 0.25 ? 'Kering Kritis' : 'Cukup'})
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-[#8A949E] py-2">Memuat telemetri NASA...</div>
        )}
      </div>

      {/* Skenario Rotasi Aktif */}
      <div className="bg-[#16191E] border border-[#282C34] rounded-[6px] p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-[#282C34] pb-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9BA3AE]">
            <Sprout className="w-3.5 h-3.5 text-[#00C2CC]" />
            <span>Skenario Terpilih</span>
          </div>
          <span className="text-[11px] font-semibold text-[#00C2CC] bg-[#163A40] px-2 py-0.5 rounded-[3px]">
            Pathway {selectedPathway}
          </span>
        </div>

        {/* Pathway Selector Quick Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-[#121418] p-1 rounded-[4px] border border-[#242831]">
          {(['A', 'B', 'C'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setSelectedPathway(p)}
              className={`py-1 text-xs font-medium rounded-[3px] transition-colors ${
                selectedPathway === p
                  ? 'bg-[#163A40] text-[#00C2CC] font-semibold'
                  : 'text-[#9BA3AE] hover:text-[#F1F3F5]'
              }`}
            >
              Path {p}
            </button>
          ))}
        </div>

        {activePlan ? (
          <div className="flex flex-col gap-2 text-xs mt-1">
            <div className="text-[11px] text-[#9BA3AE]">Urutan 4 Musim:</div>
            <div className="flex flex-col gap-1.5 font-mono text-[11px]">
              {activePlan.seasons.map((alloc) => (
                <div
                  key={alloc.seasonIndex}
                  className="flex justify-between items-center px-2 py-1 bg-[#1A1F26] rounded-[3px] border border-[#282C34]"
                >
                  <span className="text-[#8A949E]">M{alloc.seasonIndex}</span>
                  <span className="font-sans text-[#F1F3F5] font-medium">{alloc.crop.name}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-[#20252D] text-[11px]">
              <span className="text-[#9BA3AE]">Kapasitas Baterai:</span>
              <span className="font-semibold text-[#34D399]">
                {activePlan.soilBatteryScore}%
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-[#8A949E] py-2">Menghitung optimasi...</div>
        )}
      </div>

      {/* Provenansi RAG Footer */}
      <div className="bg-[#121519] border border-[#242831] rounded-[6px] p-3 text-[11px] text-[#8A949E] flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-[#00C2CC] shrink-0 mt-0.5" />
        <span>
          Semua respons AI diverifikasi langsung dengan data telemetri di atas dan rujukan resmi BRIN/Balitkabi/FAO.
        </span>
      </div>
    </aside>
  );
}
