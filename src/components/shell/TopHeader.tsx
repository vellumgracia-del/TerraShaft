'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import {
  RefreshCw,
  Bell,
  HelpCircle,
  Settings,
  Menu,
  UserCog,
  LogOut
} from 'lucide-react';

interface TopHeaderProps {
  onToggleMobileMenu?: () => void;
}

export default function TopHeader({
  onToggleMobileMenu
}: TopHeaderProps) {
  const router = useRouter();
  const {
    location,
    isLoadingBioData,
    fetchBioPhysicalData,
    provenance
  } = useTerraShaftStore();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState({
    name: 'RAVI ARNAN IRIANTO',
    email: 'raviarnankeren@gmail.com',
    initials: 'RI'
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('terrashaft_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name || parsed.email) {
          const rawName = (parsed.name || 'Ravi Arnan Irianto').trim();
          const initials = rawName
            .split(' ')
            .filter(Boolean)
            .map((w: string) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase() || 'RI';
          setProfile({
            name: rawName.toUpperCase(),
            email: parsed.email || 'raviarnankeren@gmail.com',
            initials
          });
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false);
      }
    }

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProfileMenuOpen]);

  const badge = provenance.headerBadge;

  return (
    <header className="h-16 bg-[#121417] border-b border-[#282C34] px-4 lg:px-6 sticky top-0 z-40 select-none flex items-center justify-between text-[#F1F3F5] transition-all">
      {/* Left: Brand Mark */}
      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-[5px] text-[#C1C7CD] hover:bg-[#20242B] hover:text-white shrink-0"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <Link href="/overview" className="flex items-center shrink-0 group py-1">
          {/* Official TerraShaft Orbital Agriculture Logo: Prominent & High Clarity */}
          <Image
            src="/terrashaft-logo.png"
            alt="TerraShaft Orbital Agriculture"
            width={200}
            height={50}
            className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-[1.02]"
            priority
          />
        </Link>
      </div>

      {/* Right: Minimal Planet Utility Toolbar */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Live Telemetry Sync Refresh Button (Icon Only) */}
        <button
          type="button"
          onClick={() => fetchBioPhysicalData(location.lat, location.lon)}
          disabled={isLoadingBioData}
          title={isLoadingBioData ? 'Menyinkronkan telemetri satelit...' : `Sinkronisasi telemetri satelit (${badge?.text || 'NASA POWER & ISRIC SoilGrids'})`}
          className="w-9 h-9 rounded-[5px] inline-flex items-center justify-center text-[#C1C7CD] hover:text-white hover:bg-[#20242B] transition-colors disabled:opacity-50"
          aria-label="Sinkronisasi telemetri satelit"
        >
          <RefreshCw className={`w-4 h-4 ${isLoadingBioData ? 'animate-spin text-[#00C2CC]' : 'text-[#C1C7CD] hover:text-white'}`} />
        </button>

        {/* Notifications / Telemetry Provenance */}
        <Link
          href="/data-sources"
          title="Status Telemetri & Provenansi Data"
          className="w-9 h-9 rounded-[5px] inline-flex items-center justify-center text-[#C1C7CD] hover:text-white hover:bg-[#20242B] transition-colors relative"
        >
          <Bell className="w-4 h-4" />
          <span className="w-1.5 h-1.5 rounded-full absolute top-2.5 right-2.5 bg-[#00C2CC]" />
        </Link>

        {/* Help / Scientific Documentation */}
        <Link
          href="/data-sources"
          title="Dokumentasi Ilmiah & Sumber Satelit"
          className="w-9 h-9 rounded-[5px] inline-flex items-center justify-center text-[#C1C7CD] hover:text-white hover:bg-[#20242B] transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </Link>

        {/* Settings / Workbench Preference */}
        <Link
          href="/settings"
          title="Pengaturan Workbench & Profil Pengguna"
          className="w-9 h-9 rounded-[5px] inline-flex items-center justify-center text-[#C1C7CD] hover:text-white hover:bg-[#20242B] transition-colors"
        >
          <Settings className="w-4 h-4" />
        </Link>

        {/* Profile Avatar Badge with Dropdown Menu */}
        <div className="relative" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
            aria-expanded={isProfileMenuOpen}
            aria-haspopup="true"
            title={`Profil Akun: ${profile.name}`}
            className={`p-1 rounded-[6px] transition-colors flex items-center justify-center focus:outline-hidden ${
              isProfileMenuOpen ? 'bg-[#2A2F3A]' : 'hover:bg-[#20242B]'
            }`}
          >
            <span className="w-8 h-8 rounded-full bg-[#42CADB] hover:bg-[#52D8E8] text-[#121417] font-bold text-xs inline-flex items-center justify-center select-none shadow-xs shrink-0 transition-colors">
              {profile.initials}
            </span>
          </button>

          {/* Profile Dropdown Popover */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-[#20242C] border border-[#2F3642] rounded-[8px] shadow-2xl z-50 overflow-hidden flex flex-col py-1 text-left animate-in fade-in duration-100">
              {/* Header: Avatar + User Details */}
              <div className="p-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#42CADB] text-[#121417] font-bold text-sm inline-flex items-center justify-center shrink-0 shadow-xs select-none">
                  {profile.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-bold text-white tracking-wide truncate">
                    {profile.name}
                  </div>
                  <div className="text-xs text-[#8A949E] truncate">
                    {profile.email}
                  </div>
                </div>
              </div>

              {/* Hairline Divider */}
              <div className="h-px bg-[#2C313A] my-1" />

              {/* Navigation Options */}
              <Link
                href="/settings"
                onClick={() => setIsProfileMenuOpen(false)}
                className="group flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-[#E1E4EA] hover:text-white hover:bg-[#282E38] transition-colors"
              >
                <UserCog className="w-4 h-4 text-[#8A949E] group-hover:text-[#42CADB] transition-colors shrink-0" />
                <span>My Profile & Settings</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  router.push('/login');
                }}
                className="group w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-[#E1E4EA] hover:text-white hover:bg-[#282E38] transition-colors text-left"
              >
                <LogOut className="w-4 h-4 text-[#8A949E] group-hover:text-[#EF4444] transition-colors shrink-0" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
