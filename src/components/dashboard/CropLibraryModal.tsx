'use client';

import React, { useState } from 'react';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import { X, Plus, BookOpen, Sparkles, Check, Droplets, Zap, Shield, ArrowDownCircle } from 'lucide-react';
import { Crop, CropCategory, DroughtTolerance, SoilCarbonInput } from '@/types/agronomy';

interface CropLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CropLibraryModal({ isOpen, onClose }: CropLibraryModalProps) {
  const { crops, addCustomCrop } = useTerraShaftStore();
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form state untuk custom crop
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CropCategory>('Legume');
  const [duration, setDuration] = useState(75);
  const [waterReq, setWaterReq] = useState(300);
  const [kcMid, setKcMid] = useState(0.95);
  const [rootDepth, setRootDepth] = useState(60);
  const [nFix, setNFix] = useState(50);
  const [nDemand, setNDemand] = useState(20);
  const [profitIndex, setProfitIndex] = useState(70);
  const [droughtTol, setDroughtTol] = useState<DroughtTolerance>('High');
  const [carbonInput, setCarbonInput] = useState<SoilCarbonInput>('Medium');
  const [variety, setVariety] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCustomCrop({
      name,
      category,
      growth_duration_days: duration,
      water_requirement_mm: waterReq,
      kc_mid: kcMid,
      root_depth_cm: rootDepth,
      nitrogen_fixation_kg_ha: nFix,
      nitrogen_demand_kg_ha: nDemand,
      soil_carbon_input: carbonInput,
      economic_profit_index: profitIndex,
      drought_tolerance: droughtTol,
      break_pest_cycle: category === 'Legume' || category === 'Cover Crop',
      icon: category === 'Legume' ? 'bean' : category === 'Cover Crop' ? 'flower' : 'plant',
      recommended_variety: variety || 'Varietas Unggul Lokal',
      local_notes: notes || 'Komoditas lokal tambahan.'
    });

    setIsAddingNew(false);
    setName('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Pustaka Komoditas Tanaman (Agro-Library)</h3>
              <p className="text-xs text-slate-400">Database profil biofisik, kebutuhan air & fiksasi hara tanaman</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isAddingNew && (
              <button
                type="button"
                onClick={() => setIsAddingNew(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
              >
                <Plus className="w-4 h-4" />
                Tambah Komoditas Lokal
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {isAddingNew ? (
            /* Form Tambah Tanaman Kustom */
            <form onSubmit={handleSubmitNew} className="flex flex-col gap-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-white text-sm">Formulir Tambah Komoditas Lokal</h4>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Batal
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1">Nama Tanaman</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Kacang Tunggak, Ubi Kayu..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Kategori Fisiologis</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CropCategory)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Legume">Legume (Kacang-kacangan)</option>
                    <option value="Cover Crop">Cover Crop (Penutup Tanah)</option>
                    <option value="Cereal">Cereal (Padi/Jagung)</option>
                    <option value="Cereal / Forage">Cereal / Forage (Sorgum/Pakan)</option>
                    <option value="Tuber">Tuber (Umbi-umbian)</option>
                    <option value="Other">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Durasi Tanam (Hari)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Kebutuhan Air Musim (mm)</label>
                  <input
                    type="number"
                    value={waterReq}
                    onChange={(e) => setWaterReq(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Fiksasi N Alami (kg N/ha)</label>
                  <input
                    type="number"
                    value={nFix}
                    onChange={(e) => setNFix(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Toleransi Kekeringan</label>
                  <select
                    value={droughtTol}
                    onChange={(e) => setDroughtTol(e.target.value as DroughtTolerance)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Very High">Sangat Tinggi (Very High)</option>
                    <option value="High">Tinggi (High)</option>
                    <option value="Moderate">Sedang (Moderate)</option>
                    <option value="Low">Rendah (Low)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Rekomendasi Varietas Unggul</label>
                  <input
                    type="text"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    placeholder="Contoh: Varietas Lokal Bima..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Indeks Keuntungan Pasar (0–100)</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={profitIndex}
                    onChange={(e) => setProfitIndex(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 text-xs">Catatan Lapangan & Rekomendasi PPL</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan agronomi khusus..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow"
              >
                Simpan & Jalankan Ulang Optimasi Rotasi
              </button>
            </form>
          ) : (
            /* Daftar Komoditas yang Ada */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {crops.map((crop) => (
                <div
                  key={crop.id}
                  className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-2.5 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-white text-sm">{crop.name}</h4>
                        {crop.is_custom && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Kustom
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-emerald-400 font-medium block mt-0.5">{crop.category}</span>
                    </div>

                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Profit: {crop.economic_profit_index}/100
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {crop.local_notes || 'Varietas anjuran adaptif iklim lokal.'}
                  </p>

                  <div className="grid grid-cols-3 gap-1.5 text-[11px] pt-1 border-t border-slate-800/80">
                    <div className="bg-slate-900/60 p-1.5 rounded-lg flex flex-col">
                      <span className="text-[10px] text-slate-400">Kebutuhan Air</span>
                      <span className="font-mono text-slate-200">{crop.water_requirement_mm} mm</span>
                    </div>
                    <div className="bg-slate-900/60 p-1.5 rounded-lg flex flex-col">
                      <span className="text-[10px] text-slate-400">Fiksasi N</span>
                      <span className="font-mono text-emerald-300">+{crop.nitrogen_fixation_kg_ha} kg</span>
                    </div>
                    <div className="bg-slate-900/60 p-1.5 rounded-lg flex flex-col">
                      <span className="text-[10px] text-slate-400">Ketahanan</span>
                      <span className="font-medium text-slate-200 truncate">{crop.drought_tolerance}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
