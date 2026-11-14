'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('analyst@terrashaft.org');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isLoading) return;

    setIsLoading(true);
    setTimeout(() => {
      router.push('/overview');
    }, 600);
  };

  return (
    <div
      className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 bg-neutral-950 bg-cover bg-center bg-no-repeat selection:bg-[#007079] selection:text-white"
      style={{
        backgroundImage: `url('/images/satellite-ocean.jpg')`
      }}
    >
      {/* Subtle Atmospheric Gradient Overlay to deepen edges like satellite view */}
      <div className="absolute inset-0 bg-black/25 pointer-events-none" />

      {/* Top Left Back Link */}
      <Link
        href="/"
        className="absolute top-5 left-5 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white/90 hover:text-white text-xs font-medium border border-white/10 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Kembali ke Beranda</span>
      </Link>

      {/* Centered Crisp Pure White Card (Immune to dark mode overrides) */}
      <div
        className="auth-white-card relative z-10 w-full max-w-[410px] rounded-[6px] shadow-2xl px-8 py-10 sm:px-10 sm:py-12 border flex flex-col items-center"
        style={{
          backgroundColor: '#FFFFFF',
          color: '#111827',
          borderColor: '#F3F4F6'
        }}
      >
        {/* Official TerraShaft Brand Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/terrashaft-logo-light.png"
            alt="TerraShaft Orbital Agriculture"
            width={240}
            height={75}
            className="h-11 sm:h-12 w-auto object-contain"
            priority
          />
        </div>

        {/* Heading & Subtitle */}
        <h1
          className="text-2xl font-normal text-center tracking-tight"
          style={{ color: '#111827' }}
        >
          Welcome
        </h1>
        <p
          className="text-[13px] text-center mt-2 mb-6 font-normal"
          style={{ color: '#6B7280' }}
        >
          Log in to TerraShaft to continue to Platform.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address*"
              required
              disabled={isLoading}
              className="auth-input w-full px-3.5 py-3 rounded-[4px] text-sm placeholder:text-neutral-400 focus:outline-none transition-all"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#111827',
                border: '1px solid #D1D5DB'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="auth-btn-continue w-full py-3 px-4 disabled:opacity-60 font-medium text-sm rounded-[4px] transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2 mt-1"
            style={{
              backgroundColor: '#007079',
              color: '#FFFFFF'
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Memverifikasi Sesi...</span>
              </>
            ) : (
              <span>Continue</span>
            )}
          </button>
        </form>

        {/* Footer Text */}
        <div
          className="auth-footer-text mt-8 text-center text-xs"
          style={{ color: '#4B5563' }}
        >
          <div>Don&apos;t have a TerraShaft Platform account?</div>
          <Link
            href="/overview"
            className="font-medium hover:underline inline-block mt-0.5"
            style={{ color: '#007079' }}
          >
            Sign up!
          </Link>
        </div>
      </div>

      {/* Bottom Left Photo Attribution Pill (matching Image 2) */}
      <div className="absolute bottom-5 left-5 z-20 pointer-events-auto">
        <span
          className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-normal text-white/90 backdrop-blur-md transition-opacity select-none shadow-xs border border-white/5"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
        >
          Photo by Fahrul Razi
        </span>
      </div>
    </div>
  );
}
