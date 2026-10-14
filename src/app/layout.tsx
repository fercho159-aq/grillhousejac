import type { Metadata, Viewport } from "next";
import { Alfa_Slab_One, Inter, Oswald } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import { SITE } from "@/lib/site-config";

const slab = Alfa_Slab_One({ weight: "400", subsets: ["latin"], display: "swap", variable: "--font-slab" });
const oswald = Oswald({ weight: ["500"], subsets: ["latin"], display: "swap", variable: "--font-oswald" });
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

const title = `${SITE.name} · Parrilla y cortes en CDMX`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: title, template: `%s · ${SITE.name}` },
  description: SITE.description,
  keywords: [...SITE.keywords],
  applicationName: SITE.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "/",
    siteName: SITE.name,
    title,
    description: SITE.description,
  },
  twitter: { card: "summary_large_image", title, description: SITE.description },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#14110F",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-MX" className={`scroll-smooth ${slab.variable} ${oswald.variable} ${inter.variable}`}>
      <body>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
