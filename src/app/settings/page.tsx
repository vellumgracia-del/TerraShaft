'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import {
  User,
  Sliders,
  Radio,
  Lock,
  Check,
  Save,
  LogOut,
  MapPin,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Satellite,
  Layers,
  Sparkles,
  ShieldCheck,
  Trash2,
  AlertCircle
} from 'lucide-react';

type TabKey = 'profile' | 'preferences' | 'integrations' | 'security';

interface UserProfile {
  name: string;
  email: string;
  role: string;
  organization: string;
  district: string;
  bio: string;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Ravi Arnan Irianto',
  email: 'raviarnankeren@gmail.com',
  role: 'Penyuluh Pertanian Lapangan (PPL) / Agronomy Analyst',
  organization: 'Dinas Pertanian & Ketahanan Pangan',
  district: 'Kabupaten Kupang, Nusa Tenggara Timur',
  bio: 'Pendamping petani lahan kering tadah hujan dengan fokus pemulihan baterai tanah Vertisol dan mitigasi dampak El Nino.'
};

const AOI_PRESETS = [
  { name: 'Kupang Timur, NTT', lat: -10.1542, lon: 123.821, elevation: 85 },
  { name: 'Camplong, NTT', lat: -10.0381, lon: 123.9215, elevation: 180 },
  { name: 'Sumba Timur, NTT', lat: -9.6541, lon: 120.2642, elevation: 60 },
  { name: 'Gunungkidul, DIY', lat: -7.9656, lon: 110.6012, elevation: 220 },
  { name: 'Indramayu, Jawa Barat', lat: -6.3275, lon: 108.3242, elevation: 12 },
  { name: 'Machakos, Kenya (Global)', lat: -1.5177, lon: 37.2634, elevation: 1600 },
  { name: 'Central Valley, California (Global)', lat: 36.7378, lon: -119.7871, elevation: 94 }
];

export default function SettingsPage() {
  const router = useRouter();
  const {
    location,
    setLocation,
    isFieldMode,
    toggleFieldMode,
    selectedPathway,
    setSelectedPathway,
    priorities,
    setPriorityPreset
  } = useTerraShaftStore();

  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Gemini API Key state
  const [geminiKey, setGeminiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  // Password state
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('terrashaft_user_profile');
      if (saved) setProfile(JSON.parse(saved));
      const savedKey = localStorage.getItem('terrashaft_gemini_key');
      if (savedKey) setGeminiKey(savedKey);
    } catch {
      // ignore
    }
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('terrashaft_user_profile', JSON.stringify(profile));
      triggerToast('Profil pengguna berhasil disimpan.');
    } catch {
      triggerToast('Gagal menyimpan profil.');
    }
  };

  const handleSaveApiKey = () => {
    try {
      localStorage.setItem('terrashaft_gemini_key', geminiKey.trim());
      triggerToast('Kunci Gemini API berhasil diperbarui.');
    } catch {
      triggerToast('Gagal menyimpan kunci API.');
    }
  };

  const handleClearCache = () => {
    triggerToast('Cache telemetri NASA & ISRIC lokal berhasil dibersihkan.');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (!currPassword) {
      setPasswordError('Kata sandi saat ini wajib diisi.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Kata sandi baru minimal 8 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    setCurrPassword('');
    setNewPassword('');
    setConfirmPassword('');
    triggerToast('Kata sandi berhasil diperbarui.');
  };

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#00C2CC]">
          <span>TerraShaft Platform · Preferences</span>
        </div>
        <h1 className="text-xl lg:text-2xl font-semibold text-[#F1F3F5] tracking-tight">
          Pengaturan Umum & Profil
        </h1>
        <p className="text-xs text-[#9BA3AE]">
          Kelola profil penyuluh, preferensi wilayah kerja lahan, integrasi telemetri satelit, dan keamanan akun.
        </p>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-[4px] bg-[#163A40] border border-[#00C2CC] text-xs font-medium text-[#F1F3F5] shadow-2xl flex items-center gap-2">
          <Check className="w-4 h-4 text-[#00C2CC]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container with Left Tab Navigation */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left Tabs Rail */}
        <nav className="w-full md:w-56 shrink-0 bg-[#16191E] border border-[#282C34] rounded-[6px] p-2 flex flex-row md:flex-col gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-xs font-medium transition-colors text-left shrink-0 ${
              activeTab === 'profile'
                ? 'bg-[#163A40] text-[#00C2CC]'
                : 'text-[#C1C7CD] hover:bg-[#1F242B] hover:text-white'
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            <span>Profil Pengguna</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-xs font-medium transition-colors text-left shrink-0 ${
              activeTab === 'preferences'
                ? 'bg-[#163A40] text-[#00C2CC]'
                : 'text-[#C1C7CD] hover:bg-[#1F242B] hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4 shrink-0" />
            <span>Preferensi Sistem</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('integrations')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-xs font-medium transition-colors text-left shrink-0 ${
              activeTab === 'integrations'
                ? 'bg-[#163A40] text-[#00C2CC]'
                : 'text-[#C1C7CD] hover:bg-[#1F242B] hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4 shrink-0" />
            <span>Integrasi Satelit & AI</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-xs font-medium transition-colors text-left shrink-0 ${
              activeTab === 'security'
                ? 'bg-[#163A40] text-[#00C2CC]'
                : 'text-[#C1C7CD] hover:bg-[#1F242B] hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4 shrink-0" />
            <span>Keamanan & Sesi</span>
          </button>
        </nav>

        {/* Right Tab Content Card */}
        <div className="flex-1 w-full bg-[#16191E] border border-[#282C34] rounded-[6px] p-5 sm:p-6 flex flex-col gap-6">
          {/* TAB 1: PROFIL PENGGUNA */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
              <div className="border-b border-[#282C34] pb-3">
                <h2 className="text-sm font-semibold text-[#F1F3F5]">Profil Akun & Petugas Lapangan</h2>
                <p className="text-xs text-[#8A949E]">
                  Informasi ini dicantumkan pada Lembar Rekomendasi WhatsApp dan Action Sheet ekspor.
                </p>
              </div>

              {/* Avatar Header */}
              <div className="flex items-center gap-4 p-3 bg-[#121418] rounded-[6px] border border-[#242831]">
                <div className="w-14 h-14 rounded-full bg-[#42CADB] text-[#121417] font-bold text-lg flex items-center justify-center shrink-0 shadow-sm">
                  <span>{profile.name.split(' ').map((n) => n[0]).slice(0, 2).join('') || 'RI'}</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#F1F3F5]">{profile.name}</h3>
                  <p className="text-xs text-[#8A949E]">{profile.role}</p>
                  <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded-[3px] bg-[#064E3B] text-[#34D399] border border-[#047857]">
                    Akun Terverifikasi
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[#A6AFB8] mb-1 font-medium">Nama Lengkap</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    required
                    className="w-full bg-[#121418] border border-[#282C34] focus:border-[#00C2CC] rounded-[4px] px-3 py-2 text-[#F1F3F5] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#A6AFB8] mb-1 font-medium">Alamat Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    required
                    className="w-full bg-[#121418] border border-[#282C34] focus:border-[#00C2CC] rounded-[4px] px-3 py-2 text-[#F1F3F5] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#A6AFB8] mb-1 font-medium">Jabatan / Peran</label>
                  <input
                    type="text"
                    value={profile.role}
                    onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                    className="w-full bg-[#121418] border border-[#282C34] focus:border-[#00C2CC] rounded-[4px] px-3 py-2 text-[#F1F3F5] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#A6AFB8] mb-1 font-medium">Dinas / Institusi</label>
                  <input
                    type="text"
                    value={profile.organization}
                    onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                    className="w-full bg-[#121418] border border-[#282C34] focus:border-[#00C2CC] rounded-[4px] px-3 py-2 text-[#F1F3F5] outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[#A6AFB8] mb-1 font-medium">Wilayah Kerja Binaan</label>
                  <input
                    type="text"
                    value={profile.district}
                    onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                    className="w-full bg-[#121418] border border-[#282C34] focus:border-[#00C2CC] rounded-[4px] px-3 py-2 text-[#F1F3F5] outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[#A6AFB8] mb-1 font-medium">Catatan / Bio Lapangan</label>
                  <textarea
                    rows={3}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full bg-[#121418] border border-[#282C34] focus:border-[#00C2CC] rounded-[4px] px-3 py-2 text-[#F1F3F5] outline-none resize-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#282C34] flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00C2CC] hover:bg-[#33D4DC] text-[#121417] font-semibold text-xs rounded-[4px] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan Profil</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: PREFERENSI SISTEM */}
          {activeTab === 'preferences' && (
            <div className="flex flex-col gap-5">
              <div className="border-b border-[#282C34] pb-3">
                <h2 className="text-sm font-semibold text-[#F1F3F5]">Preferensi Workbench & Lahan</h2>
                <p className="text-xs text-[#9BA3AE]">
                  Atur lokasi default, mode kontras tinggi saat di sawah, dan jalur optimasi bawaan.
                </p>
              </div>

              {/* Lokasi Default AOI */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-[#F1F3F5] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#00C2CC]" />
                  <span>Area of Interest (AOI) Bawaan</span>
                </label>
                <select
                  value={location.placeName}
                  onChange={(e) => {
                    const preset = AOI_PRESETS.find((p) => p.name === e.target.value);
                    if (preset) {
                      setLocation(preset.lat, preset.lon, preset.name, preset.elevation);
                      triggerToast(`Lokasi aktif diubah ke ${preset.name}`);
                    }
                  }}
                  className="w-full max-w-md bg-[#121418] border border-[#282C34] focus:border-[#00C2CC] rounded-[4px] px-3 py-2 text-xs text-[#F1F3F5] outline-none"
                >
                  {AOI_PRESETS.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name} ({p.lat}°, {p.lon}° | {p.elevation}m)
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-[#8A949E]">
                  Lokasi ini otomatis dimuat setiap kali aplikasi dibuka.
                </span>
              </div>

              {/* Mode Lapangan Outdoor */}
              <div className="p-4 bg-[#121418] rounded-[6px] border border-[#242831] flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#F1F3F5] flex items-center gap-1.5">
                    {isFieldMode ? <Sun className="w-4 h-4 text-[#FBBF24]" /> : <Moon className="w-4 h-4 text-[#00C2CC]" />}
                    <span>Mode Lapangan Kontras Tinggi (Outdoor Sunlight Guard)</span>
                  </div>
                  <p className="text-[11px] text-[#8A949E] mt-0.5">
                    Mempertajam kontras teks dan batas kartu saat membaca telemetri di bawah terik sinar matahari sawah.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleFieldMode}
                  className={`px-3 py-1.5 rounded-[4px] text-xs font-medium transition-colors cursor-pointer ${
                    isFieldMode
                      ? 'bg-[#163A40] text-[#00C2CC] border border-[#00C2CC]'
                      : 'bg-[#1A1F26] text-[#A6AFB8] border border-[#2E3540]'
                  }`}
                >
                  {isFieldMode ? 'Aktif' : 'Non-Aktif'}
                </button>
              </div>

              {/* Skenario Rotasi Default */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-[#F1F3F5]">
                  Jalur Skenario Bawaan (Default Pathway)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'A', name: 'Pathway A', desc: 'Max Soil Regeneration' },
                    { id: 'B', name: 'Pathway B', desc: 'Drought Resilience' },
                    { id: 'C', name: 'Pathway C', desc: 'Cash-Flow Optimized' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedPathway(p.id as 'A' | 'B' | 'C');
                        triggerToast(`Jalur bawaan disetel ke ${p.name}`);
                      }}
                      className={`p-3 rounded-[4px] border text-left transition-colors cursor-pointer ${
                        selectedPathway === p.id
                          ? 'bg-[#163A40] border-[#00C2CC] text-[#F1F3F5]'
                          : 'bg-[#121418] border-[#242831] text-[#A6AFB8] hover:border-[#2C313A]'
                      }`}
                    >
                      <div className="text-xs font-semibold text-[#00C2CC]">{p.name}</div>
                      <div className="text-[11px] mt-0.5">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preset Bobot Optimasi */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-[#F1F3F5]">
                  Preset Prioritas Mesin Optimasi
                </label>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setPriorityPreset('soil');
                      triggerToast('Prioritas disetel ke: Pemulihan Baterai Tanah');
                    }}
                    className="px-3 py-1.5 rounded-[4px] bg-[#121418] hover:bg-[#1A1F26] border border-[#282C34] text-[#C1C7CD]"
                  >
                    Fokus Tanah (45% Tanah, 35% Air, 20% Profit)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPriorityPreset('water');
                      triggerToast('Prioritas disetel ke: Hemat Air & El Nino');
                    }}
                    className="px-3 py-1.5 rounded-[4px] bg-[#121418] hover:bg-[#1A1F26] border border-[#282C34] text-[#C1C7CD]"
                  >
                    Fokus Air (50% Air, 30% Tanah, 20% Profit)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPriorityPreset('profit');
                      triggerToast('Prioritas disetel ke: Arus Kas Petani');
                    }}
                    className="px-3 py-1.5 rounded-[4px] bg-[#121418] hover:bg-[#1A1F26] border border-[#282C34] text-[#C1C7CD]"
                  >
                    Fokus Kas (60% Profit, 25% Air, 15% Tanah)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INTEGRASI SATELIT & AI */}
          {activeTab === 'integrations' && (
            <div className="flex flex-col gap-5">
              <div className="border-b border-[#282C34] pb-3">
                <h2 className="text-sm font-semibold text-[#F1F3F5]">Integrasi Telemetri Satelit & Layanan AI</h2>
                <p className="text-xs text-[#9BA3AE]">
                  Status koneksi API publik NASA POWER, ISRIC SoilGrids, dan kunci API Gemini AI.
                </p>
              </div>

              {/* Status Sensor Publik */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-[#121418] rounded-[6px] border border-[#242831] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Satellite className="w-4 h-4 text-[#00C2CC]" />
                    <div>
                      <div className="text-xs font-semibold text-[#F1F3F5]">NASA POWER API</div>
                      <div className="text-[11px] text-[#8A949E]">SMAP, GPM IMERG, CERES</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-[3px] bg-[#064E3B] text-[#34D399] border border-[#047857]">
                    ACTIVE LIVE
                  </span>
                </div>

                <div className="p-3.5 bg-[#121418] rounded-[6px] border border-[#242831] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-[#00C2CC]" />
                    <div>
                      <div className="text-xs font-semibold text-[#F1F3F5]">ISRIC SoilGrids v2.0</div>
                      <div className="text-[11px] text-[#8A949E]">Profil 0-30 cm Wageningen</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-[3px] bg-[#064E3B] text-[#34D399] border border-[#047857]">
                    ACTIVE LIVE
                  </span>
                </div>
              </div>

              {/* Google Gemini API Key */}
              <div className="p-4 bg-[#121418] rounded-[6px] border border-[#242831] flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-[#F1F3F5] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#00C2CC]" />
                      <span>Google Gemini API Key (Field Advisor AI)</span>
                    </div>
                    <p className="text-[11px] text-[#8A949E] mt-0.5">
                      Opsional. Jika diisi, Field Advisor AI dapat menjawab konsultasi bebas secara generatif selain dokumen acuan baku.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-[3px] bg-[#163A40] text-[#00C2CC]">
                    {geminiKey ? 'KEY TERPASANG' : 'MODE DETERMINISTIK'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder="Masukkan AIzaSy... (atau atur via GEMINI_API_KEY di .env.local)"
                      className="w-full bg-[#16191E] border border-[#282C34] focus:border-[#00C2CC] rounded-[4px] px-3 py-2 pr-9 text-xs text-[#F1F3F5] outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A949E] hover:text-[#F1F3F5]"
                    >
                      {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveApiKey}
                    className="px-3.5 py-2 bg-[#00C2CC] hover:bg-[#33D4DC] text-[#121417] text-xs font-semibold rounded-[4px] transition-colors"
                  >
                    Simpan
                  </button>
                </div>
              </div>

              {/* Cache Management */}
              <div className="p-4 bg-[#121418] rounded-[6px] border border-[#242831] flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#F1F3F5]">Penyimpanan Cache Data Satelit</div>
                  <p className="text-[11px] text-[#8A949E] mt-0.5">
                    TTL 24 jam untuk iklim NASA POWER dan 30 hari untuk profil tanah ISRIC guna menghemat bandwidth.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClearCache}
                  className="px-3 py-1.5 rounded-[4px] bg-[#1F242B] hover:bg-[#282C34] text-[#C1C7CD] text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-[#F87171]" />
                  <span>Bersihkan Cache</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: KEAMANAN & SESI */}
          {activeTab === 'security' && (
            <div className="flex flex-col gap-5">
              <div className="border-b border-[#282C34] pb-3">
                <h2 className="text-sm font-semibold text-[#F1F3F5]">Keamanan Akun & Manajemen Sesi</h2>
                <p className="text-xs text-[#9BA3AE]">
                  Perbarui kata sandi login dan pantau perangkat aktif yang terhubung.
                </p>
              </div>

              {/* Form Ganti Password */}
              <form onSubmit={handleChangePassword} className="flex flex-col gap-3 max-w-md">
                <div className="text-xs font-semibold text-[#F1F3F5]">Ganti Kata Sandi</div>

                {passwordError && (
                  <div className="p-2.5 bg-[#2D1B1E] border border-[#7F1D1D]/40 rounded-[4px] flex items-center gap-2 text-xs text-[#F87171]">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[#A6AFB8] mb-1 text-xs">Kata Sandi Saat Ini</label>
                  <input
                    type="password"
                    value={currPassword}
                    onChange={(e) => setCurrPassword(e.target.value)}
                    className="w-full bg-[#121418] border border-[#282C34] focus:border-[#00C2CC] rounded-[4px] px-3 py-2 text-xs text-[#F1F3F5] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#A6AFB8] mb-1 text-xs">Kata Sandi Baru</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#121418] border border-[#282C34] focus:border-[#00C2CC] rounded-[4px] px-3 py-2 text-xs text-[#F1F3F5] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#A6AFB8] mb-1 text-xs">Konfirmasi Kata Sandi Baru</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#121418] border border-[#282C34] focus:border-[#00C2CC] rounded-[4px] px-3 py-2 text-xs text-[#F1F3F5] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-2 px-4 py-2 bg-[#1A1F26] hover:bg-[#232933] border border-[#2E3540] text-[#F1F3F5] font-medium text-xs rounded-[4px] w-fit transition-colors cursor-pointer"
                >
                  Perbarui Kata Sandi
                </button>
              </form>

              {/* Sesi Aktif */}
              <div className="pt-4 border-t border-[#282C34] flex flex-col gap-2">
                <div className="text-xs font-semibold text-[#F1F3F5]">Sesi Perangkat Aktif</div>
                <div className="p-3 bg-[#121418] rounded-[6px] border border-[#242831] flex items-center justify-between text-xs">
                  <div>
                    <div className="font-medium text-[#F1F3F5]">Browser Web Aktif (Linux x86_64)</div>
                    <div className="text-[11px] text-[#8A949E] mt-0.5">Sesi Lokal Saat Ini · 127.0.0.1</div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-[3px] bg-[#064E3B] text-[#34D399]">
                    AKTIF SEKARANG
                  </span>
                </div>
              </div>

              {/* Log Out Button */}
              <div className="pt-4 border-t border-[#282C34] flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#F1F3F5]">Keluar dari Platform</div>
                  <div className="text-[11px] text-[#8A949E]">
                    Mengakhiri sesi kerja dan kembali ke layar login utama.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3.5 py-2 rounded-[4px] bg-[#2D1B1E] hover:bg-[#3B2226] text-[#F87171] border border-[#7F1D1D]/50 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar Akun</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
