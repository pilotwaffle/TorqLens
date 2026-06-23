import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TorqLens — AI Plant & Weed Scanner",
  description:
    "Point your camera at any plant, weed, grass, or flower and get an instant AI ID — plus simple, safety-first guidance on whether to grow it or remove it safely.",
  applicationName: "TorqLens",
  keywords: [
    "plant identifier",
    "weed scanner",
    "lawn care",
    "gardening",
    "flower id",
    "grass id",
    "yard",
    "plant ai",
  ],
  authors: [{ name: "Torq Business Solutions" }],
  icons: {
    icon: "/brand/nav-mark-256.png",
    apple: "/brand/app-icon-1024-master.png",
  },
  openGraph: {
    title: "TorqLens — AI Plant & Weed Scanner",
    description:
      "Identify any plant, weed, grass, or flower from a photo — with safety-first grow-or-remove guidance. A product of Torq Business Solutions.",
    siteName: "TorqLens",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TorqLens — AI Plant & Weed Scanner",
    description:
      "Identify any plant, weed, grass, or flower from a photo — with safety-first guidance.",
  },
};

export const viewport: Viewport = {
  themeColor: "#2b2d42",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${hanken.variable} ${jetbrains.variable} font-sans bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
