'use client';

import React, { useState } from 'react';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import { Crop, CropCategory, DroughtTolerance } from '@/types/agronomy';
import { Database, Plus, Check, Sparkles, Trash2 } from 'lucide-react';
import { getCropEmoji, formatMm } from '@/lib/formatters';

export default function CropLibraryPage() {
  const { crops, addCustomCrop, removeCustomCrop } = useTerraShaftStore();
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

    const clampedDuration = Math.min(365, Math.max(20, parseInt(growthDuration, 10) || 90));
    const clampedWater = Math.min(2000, Math.max(50, parseFloat(waterReq) || 350));
    const clampedNFix = Math.min(300, Math.max(0, parseFloat(nFixation) || 0));
    const clampedProfit = Math.min(100, Math.max(0, parseInt(profitIndex, 10) || 50));

    addCustomCrop({
      name: name.trim().slice(0, 80),
      category,
      growth_duration_days: clampedDuration,
      water_requirement_mm: clampedWater,
      kc_mid: 1.05,
      root_depth_cm: category === 'Cover Crop' ? 90 : category === 'Legume' ? 60 : 65,
      nitrogen_fixation_kg_ha: clampedNFix,
      nitrogen_demand_kg_ha: category === 'Legume' || category === 'Cover Crop' ? 15 : 85,
      soil_carbon_input: category === 'Cover Crop' ? 'Very High' : 'Medium',
      economic_profit_index: clampedProfit,
      drought_tolerance: droughtTolerance,
      break_pest_cycle: category === 'Legume' || category === 'Cover Crop',
      icon: (icon || 'sprout').trim().slice(0, 16),
      recommended_variety: variety.trim().slice(0, 80) || undefined,
      local_notes: notes.trim().slice(0, 200) || undefined
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
    <div className="bg-[#20242B] border border-[#2C313A] rounded-[4px] p-5 lg:p-6 flex flex-col gap-6 text-[#F1F3F5]">
      {/* Header */}
      <div className="pb-4 border-b border-[#2C313A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[4px] bg-[#163A40] text-[#00C2CC] flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-medium text-[#F1F3F5] leading-tight">
              Pustaka Komoditas Tanaman
            </h2>
            <p className="text-xs text-[#8A949E]">
              Basis data agronomi ({crops.length} komoditas) untuk optimasi rotasi adaptif iklim
            </p>
          </div>
        </div>

        {!isAddingNew && (
          <button
            type="button"
            onClick={() => setIsAddingNew(true)}
            className="px-3.5 py-2 rounded-[3px] bg-[#009DA5] hover:bg-[#00B4BD] text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Varietas Kustom</span>
          </button>
        )}
      </div>

      {/* Add Custom Crop Form */}
      {isAddingNew && (
        <form onSubmit={handleSubmit} className="p-5 rounded-[4px] bg-[#16191E] border border-[#2C313A] flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2C313A]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00C2CC]" />
              <span className="text-sm font-medium text-[#F1F3F5]">
                Formulir Penambahan Varietas Kustom Lokal
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="text-xs text-[#8A949E] hover:text-[#F1F3F5]"
            >
              Batal
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="flex flex-col gap-1">
              <label className="text-[#C1C7CD]">Nama Komoditas *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Sorgum Merah NTT"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-2.5 rounded-[3px] bg-[#20242B] border border-[#2C313A] focus:border-[#009DA5] text-[#F1F3F5] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[#C1C7CD]">Kategori Komoditas</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CropCategory)}
                className="p-2.5 rounded-[3px] bg-[#20242B] border border-[#2C313A] focus:border-[#009DA5] text-[#F1F3F5] outline-none"
              >
                <option value="Cereal">Sereal / Pangan Utama</option>
                <option value="Legume">Legum / Kacang-kacangan</option>
                <option value="Cover Crop">Tanaman Penutup (Cover Crop)</option>
                <option value="Tuber">Umbi-umbian</option>
                <option value="Other">Lainnya</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[#C1C7CD]">Varietas Rekomendasi</label>
              <input
                type="text"
                placeholder="Contoh: Bioguma 1 / Vima 1"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                className="p-2.5 rounded-[3px] bg-[#20242B] border border-[#2C313A] focus:border-[#009DA5] text-[#F1F3F5] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[#C1C7CD]">Umur Tanam (20-365 Hari)</label>
              <input
                type="number"
                min="20"
                max="365"
                value={growthDuration}
                onChange={(e) => setGrowthDuration(e.target.value)}
                className="p-2.5 rounded-[3px] bg-[#20242B] border border-[#2C313A] focus:border-[#009DA5] text-[#F1F3F5] outline-none font-mono"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[#C1C7CD]">Kebutuhan Air (50-2000 mm)</label>
              <input
                type="number"
                min="50"
                max="2000"
                value={waterReq}
                onChange={(e) => setWaterReq(e.target.value)}
                className="p-2.5 rounded-[3px] bg-[#20242B] border border-[#2C313A] focus:border-[#009DA5] text-[#F1F3F5] outline-none font-mono"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[#C1C7CD]">Indeks Profit Pasar (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={profitIndex}
                onChange={(e) => setProfitIndex(e.target.value)}
                className="p-2.5 rounded-[3px] bg-[#20242B] border border-[#2C313A] focus:border-[#009DA5] text-[#F1F3F5] outline-none font-mono"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[#C1C7CD]">Toleransi Kekeringan</label>
              <select
                value={droughtTolerance}
                onChange={(e) => setDroughtTolerance(e.target.value as DroughtTolerance)}
                className="p-2.5 rounded-[3px] bg-[#20242B] border border-[#2C313A] focus:border-[#009DA5] text-[#F1F3F5] outline-none"
              >
                <option value="Low">Rendah (Padi Sawah)</option>
                <option value="Moderate">Sedang (Kedelai)</option>
                <option value="High">Tinggi (Kacang Hijau)</option>
                <option value="Very High">Sangat Tinggi (Sorgum / Orok-orok)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[#C1C7CD]">Fiksasi N (0-300 kg N/ha)</label>
              <input
                type="number"
                min="0"
                max="300"
                value={nFixation}
                onChange={(e) => setNFixation(e.target.value)}
                className="p-2.5 rounded-[3px] bg-[#20242B] border border-[#2C313A] focus:border-[#009DA5] text-[#F1F3F5] outline-none font-mono"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[#C1C7CD]">Ikon Identitas</label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="p-2.5 rounded-[3px] bg-[#20242B] border border-[#2C313A] focus:border-[#009DA5] text-[#F1F3F5] outline-none text-center text-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-4 py-2 rounded-[3px] border border-[#2C313A] text-xs font-mono text-[#8A949E] hover:bg-[#20242B]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-[3px] bg-[#009DA5] hover:bg-[#00B4BD] text-white text-xs font-mono flex items-center gap-1.5 shadow-xs"
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
            className="p-4 rounded-[4px] bg-[#16191E] border border-[#2C313A] hover:border-[#009DA5]/60 transition-all flex flex-col justify-between gap-3 shadow-xs"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl p-2 bg-[#20242B] rounded-[4px]">{getCropEmoji(crop.icon)}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-medium text-[#F1F3F5]">{crop.name}</h4>
                    {crop.is_custom && (
                      <span className="px-1.5 py-0.5 rounded-[3px] bg-[#163A40] text-[#00C2CC] border border-[#009DA5]/40 font-mono text-[10px] font-medium">
                        KUSTOM
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#8A949E] font-mono">{crop.category}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono px-2 py-0.5 rounded-[3px] bg-[#163A40] text-[#00C2CC] border border-[#009DA5]/40">
                  Profit: {crop.economic_profit_index}
                </span>
                {crop.is_custom && (
                  <button
                    type="button"
                    onClick={() => removeCustomCrop(crop.id)}
                    title="Hapus varietas kustom"
                    className="p-1.5 rounded-[3px] border border-[#7F1D1D]/40 bg-[#2D1B1E] text-[#F87171] hover:opacity-80 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-[#2C313A] text-center font-mono">
              <div className="bg-[#20242B] p-1.5 rounded-[3px]">
                <span className="text-[10px] text-[#8A949E] block">Umur</span>
                <span className="font-medium text-[#F1F3F5]">{crop.growth_duration_days}h</span>
              </div>
              <div className="bg-[#20242B] p-1.5 rounded-[3px]">
                <span className="text-[10px] text-[#8A949E] block">Air (ETc)</span>
                <span className="font-medium text-[#00C2CC]">{formatMm(crop.water_requirement_mm)}</span>
              </div>
              <div className="bg-[#20242B] p-1.5 rounded-[3px]">
                <span className="text-[10px] text-[#8A949E] block">Toleransi</span>
                <span className="font-medium text-[#C1C7CD]">{crop.drought_tolerance}</span>
              </div>
            </div>

            {crop.recommended_variety && (
              <div className="text-[11px] text-[#8A949E] bg-[#20242B] p-2 rounded-[3px] font-mono">
                Varietas: <strong className="text-[#F1F3F5]">{crop.recommended_variety}</strong>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
