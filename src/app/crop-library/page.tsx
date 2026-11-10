'use client';

import React, { useState } from 'react';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import { Crop, CropCategory, DroughtTolerance } from '@/types/agronomy';
import { Database, Plus, Check, Sparkles } from 'lucide-react';
import { getCropEmoji, formatMm } from '@/lib/formatters';

export default function CropLibraryPage() {
  const { crops, addCustomCrop } = useTerraShaftStore();
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<CropCategory>('Cereal');
  const [growthDuration, setGrowthDuration] = useState('95');
  const [waterReq, setWaterReq] = useState('380');
  const [nFixation, setNFixation] = useState('0');
  const [profitIndex, setProfitIndex] = useState('75');
  const [droughtTolerance, setDroughtTolerance] = useState<DroughtTolerance>('Moderate');
  const [icon, setIcon] = useState('🌾');
  const [variety, setVariety] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCustomCrop({
      name: name.trim(),
      category,
      growth_duration_days: parseInt(growthDuration, 10) || 90,
      water_requirement_mm: parseFloat(waterReq) || 350,
      kc_mid: 1.05,
      root_depth_cm: 65,
      nitrogen_fixation_kg_ha: parseFloat(nFixation) || 0,
      nitrogen_demand_kg_ha: 85,
      soil_carbon_input: 'Medium',
      economic_profit_index: parseInt(profitIndex, 10) || 50,
      drought_tolerance: droughtTolerance,
      break_pest_cycle: category === 'Legume' || category === 'Cover Crop',
      icon: icon || '🌱',
      recommended_variety: variety.trim() || undefined,
      local_notes: notes.trim() || undefined
    });

    setIsAddingNew(false);
    setName('');
    setCategory('Cereal');
    setGrowthDuration('95');
    setWaterReq('380');
    setProfitIndex('75');
    setVariety('');
    setNotes('');
  };

  return (
    <div className="agri-card p-5 lg:p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#E4EAE6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#E7F5EE] text-[#12A875] flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#17231F] leading-tight">
              Pustaka Komoditas Tanaman
            </h2>
            <p className="text-xs text-[#7B8681]">
              Basis data agronomi ({crops.length} komoditas) untuk optimasi rotasi adaptif iklim
            </p>
          </div>
        </div>

        {!isAddingNew && (
          <button
            type="button"
            onClick={() => setIsAddingNew(true)}
            className="px-3.5 py-2 rounded-xl bg-[#12A875] hover:bg-[#0E9365] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Varietas Kustom</span>
          </button>
        )}
      </div>

      {/* Add Custom Crop Form */}
      {isAddingNew && (
        <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-[#F5F7F4] border border-[#E4EAE6] flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4EAE6]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#12A875]" />
              <span className="text-sm font-bold text-[#17231F]">
                Formulir Penambahan Varietas Kustom Lokal
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="text-xs text-[#7B8681] hover:text-[#17231F]"
            >
              Batal
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-[#17231F]">Nama Komoditas *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Sorgum Merah NTT"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-2.5 rounded-xl bg-white border border-[#E4EAE6] focus:border-[#12A875] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-[#17231F]">Kategori Komoditas</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CropCategory)}
                className="p-2.5 rounded-xl bg-white border border-[#E4EAE6] focus:border-[#12A875] outline-none"
              >
                <option value="Cereal">Sereal / Pangan Utama</option>
                <option value="Legume">Legum / Kacang-kacangan</option>
                <option value="Cover Crop">Tanaman Penutup (Cover Crop)</option>
                <option value="Tuber">Umbi-umbian</option>
                <option value="Other">Lainnya</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-[#17231F]">Varietas Rekomendasi</label>
              <input
                type="text"
                placeholder="Contoh: Bioguma 1 / Vima 1"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                className="p-2.5 rounded-xl bg-white border border-[#E4EAE6] focus:border-[#12A875] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-[#17231F]">Umur Tanam (Hari)</label>
              <input
                type="number"
                value={growthDuration}
                onChange={(e) => setGrowthDuration(e.target.value)}
                className="p-2.5 rounded-xl bg-white border border-[#E4EAE6] focus:border-[#12A875] outline-none font-mono"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-[#17231F]">Kebutuhan Air (mm)</label>
              <input
                type="number"
                value={waterReq}
                onChange={(e) => setWaterReq(e.target.value)}
                className="p-2.5 rounded-xl bg-white border border-[#E4EAE6] focus:border-[#12A875] outline-none font-mono"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-[#17231F]">Indeks Profit Pasar (0–100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={profitIndex}
                onChange={(e) => setProfitIndex(e.target.value)}
                className="p-2.5 rounded-xl bg-white border border-[#E4EAE6] focus:border-[#12A875] outline-none font-mono"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-[#17231F]">Toleransi Kekeringan</label>
              <select
                value={droughtTolerance}
                onChange={(e) => setDroughtTolerance(e.target.value as DroughtTolerance)}
                className="p-2.5 rounded-xl bg-white border border-[#E4EAE6] focus:border-[#12A875] outline-none"
              >
                <option value="Low">Rendah (Padi Sawah)</option>
                <option value="Moderate">Sedang (Kedelai)</option>
                <option value="High">Tinggi (Kacang Hijau)</option>
                <option value="Very High">Sangat Tinggi (Sorgum / Orok-orok)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-[#17231F]">Fiksasi N (kg N/ha)</label>
              <input
                type="number"
                value={nFixation}
                onChange={(e) => setNFixation(e.target.value)}
                className="p-2.5 rounded-xl bg-white border border-[#E4EAE6] focus:border-[#12A875] outline-none font-mono"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-[#17231F]">Ikon Emoji</label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="p-2.5 rounded-xl bg-white border border-[#E4EAE6] focus:border-[#12A875] outline-none text-center text-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-4 py-2 rounded-xl border border-[#E4EAE6] text-xs font-semibold text-[#52605B] hover:bg-white"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#12A875] hover:bg-[#0E9365] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Varietas Kustom</span>
            </button>
          </div>
        </form>
      )}

      {/* List of Crops */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {crops.map((crop: Crop) => (
          <div
            key={crop.id}
            className="p-4 rounded-2xl bg-white border border-[#E4EAE6] hover:border-[#12A875]/40 transition-all flex flex-col justify-between gap-3 shadow-xs"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl p-2 bg-[#F5F7F4] rounded-xl">{getCropEmoji(crop.icon)}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-[#17231F]">{crop.name}</h4>
                    {crop.is_custom && (
                      <span className="px-1.5 py-0.2 rounded-md bg-[#FFF4D8] text-[#D97706] text-[10px] font-bold">
                        [KUSTOM]
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#7B8681]">{crop.category}</span>
                </div>
              </div>

              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#E7F5EE] text-[#12A875]">
                Profit: {crop.economic_profit_index}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-[#E4EAE6] text-center">
              <div className="bg-[#F5F7F4] p-1.5 rounded-xl">
                <span className="text-[10px] text-[#7B8681] block">Umur</span>
                <span className="font-bold font-mono text-[#17231F]">{crop.growth_duration_days}h</span>
              </div>
              <div className="bg-[#F5F7F4] p-1.5 rounded-xl">
                <span className="text-[10px] text-[#7B8681] block">Air (ETc)</span>
                <span className="font-bold font-mono text-[#0284C7]">{formatMm(crop.water_requirement_mm)}</span>
              </div>
              <div className="bg-[#F5F7F4] p-1.5 rounded-xl">
                <span className="text-[10px] text-[#7B8681] block">Toleransi</span>
                <span className="font-bold text-[#52605B]">{crop.drought_tolerance}</span>
              </div>
            </div>

            {crop.recommended_variety && (
              <div className="text-[11px] text-[#52605B] bg-[#F5F7F4] p-2 rounded-xl">
                Varietas: <strong>{crop.recommended_variety}</strong>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
