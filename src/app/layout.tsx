import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "TerraShaft — Modern Farm Intelligence & Climate-Resilient Crop Rotation",
  description:
    "Workspace cerdas eksplorasi pola rotasi tanaman 4 musim adaptif iklim berbasis biofisik satelit NASA POWER dan profil tanah ISRIC SoilGrids v2.0.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.svg",
    apple: "/icons/icon-192.svg"
  },
  keywords: [
    "TerraShaft",
    "TerraRotate",
    "Crop Rotation",
    "Soil Battery",
    "NASA POWER",
    "SMAP",
    "SoilGrids",
    "Agronomy",
    "Farm Intelligence"
  ]
};

export const viewport: Viewport = {
  themeColor: "#12A875",
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
    <html lang="id" className="h-full antialiased">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="min-h-full flex flex-col bg-[#F5F7F4] text-[#17231F] selection:bg-[#E7F5EE] selection:text-[#12A875]">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
