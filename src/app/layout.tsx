import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "TerraRotate (TerraShaft) — Adaptive Crop Rotation & Soil Regeneration Engine",
  description:
    "Mesin rekomendasi pola rotasi tanaman multi-musim cerdas berbasis data satelit NASA POWER, SMAP, dan ISRIC SoilGrids untuk ketahanan iklim, hemat air, dan pemulihan hara tanah.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.svg",
    apple: "/icons/icon-192.svg"
  },
  keywords: [
    "TerraRotate",
    "TerraShaft",
    "Crop Rotation",
    "Soil Battery",
    "NASA POWER",
    "SMAP",
    "SoilGrids",
    "Agronomy",
    "Pertanian Lahan Kering"
  ]
};

export const viewport: Viewport = {
  themeColor: "#06B6D4",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark h-full antialiased">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-full flex flex-col bg-[#0B0F17] text-slate-100 selection:bg-[#06B6D4] selection:text-black">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
