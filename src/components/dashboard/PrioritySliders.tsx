'use client';

import React from 'react';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import { Sliders, Coins, Droplets, Sprout, Sparkles } from 'lucide-react';

export default function PrioritySliders() {
  const { priorities, setPriorities, setPriorityPreset, selectedPathway } = useTerraShaftStore();

  const handleSliderChange = (key: keyof typeof priorities, value: number) => {
    setPriorities({ [key]: value });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-col gap-3.5">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Prioritas Petani & Rekomendasi</h3>
            <p className="text-xs text-slate-400">Atur bobot multi-objektif optimasi 4 musim</p>
          </div>
        </div>
      </div>

      {/* Preset Cepat */}
      <div>
        <span className="text-[11px] font-medium text-slate-400 block mb-1.5 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Preset Cepat Strategi Lahan:
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => setPriorityPreset('profit')}
            className={`px-2.5 py-2 rounded-xl text-xs font-medium border transition-all flex flex-col items-center justify-center text-center gap-1 ${
              selectedPathway === 'C'
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Coins className="w-4 h-4 text-amber-400" />
            <span>Maksimalkan Uang</span>
          </button>

          <button
            type="button"
            onClick={() => setPriorityPreset('water')}
            className={`px-2.5 py-2 rounded-xl text-xs font-medium border transition-all flex flex-col items-center justify-center text-center gap-1 ${
              selectedPathway === 'B'
                ? 'bg-sky-500/20 border-sky-500 text-sky-300 shadow-md'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Droplets className="w-4 h-4 text-sky-400" />
            <span>Siaga Kemarau</span>
          </button>

          <button
            type="button"
            onClick={() => setPriorityPreset('soil')}
            className={`px-2.5 py-2 rounded-xl text-xs font-medium border transition-all flex flex-col items-center justify-center text-center gap-1 ${
              selectedPathway === 'A'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Sprout className="w-4 h-4 text-emerald-400" />
            <span>Suburkan Tanah</span>
          </button>
        </div>
      </div>

      {/* Sliders */}
      <div className="flex flex-col gap-3 pt-1">
        {/* Slider 1: Profit */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 flex items-center gap-1.5 font-medium">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              Pendapatan Kas (Profit)
            </span>
            <span className="font-mono text-amber-400 font-semibold">{priorities.profitWeight}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="80"
            value={priorities.profitWeight}
            onChange={(e) => handleSliderChange('profitWeight', parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        {/* Slider 2: Water */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 flex items-center gap-1.5 font-medium">
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
              Hemat Air & Tahan Kemarau
            </span>
            <span className="font-mono text-sky-400 font-semibold">{priorities.waterWeight}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="80"
            value={priorities.waterWeight}
            onChange={(e) => handleSliderChange('waterWeight', parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
        </div>

        {/* Slider 3: Soil */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 flex items-center gap-1.5 font-medium">
              <Sprout className="w-3.5 h-3.5 text-emerald-400" />
              Kesehatan & Regenerasi Tanah
            </span>
            <span className="font-mono text-emerald-400 font-semibold">{priorities.soilWeight}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="80"
            value={priorities.soilWeight}
            onChange={(e) => handleSliderChange('soilWeight', parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
      </div>
    </div>
  );
}
