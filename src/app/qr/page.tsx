"use client";

import Image from "next/image";
import { SITE } from "@/lib/site-config";

// Printable table card. The QR always points to the contact section on production.
const LINKS_URL = `${SITE.url}/contacto`;
const QR_SRC = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(LINKS_URL)}&bgcolor=F3EEE3&color=14110F&margin=20`;

export default function QRPage() {
  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center bg-carbon p-6 print:bg-white print:p-0">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-hueso text-carbon shadow-2xl print:shadow-none">
        <div className="flex flex-col items-center bg-carbon px-6 pb-6 pt-8">
          <Image src="/images/logo-grillhousejac.webp" alt={`Logo de ${SITE.name}`} width={112} height={112} className="rounded-full ring-2 ring-oro" />
          <h1 className="font-display mt-3 text-2xl text-hueso">{SITE.name}</h1>
          <p className="font-accent mt-1 text-[11px] text-oro">{SITE.slogan}</p>
        </div>
        <div className="flex flex-col items-center px-6 py-8">
          <h2 className="font-display text-2xl">Escanéame</h2>
          <p className="mb-6 mt-1 text-center text-sm text-cuero">Menú · WhatsApp · Redes sociales · Ubicación</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={QR_SRC} alt={`Código QR hacia ${LINKS_URL}`} width={260} height={260} className="rounded-xl" />
        </div>
        <div className="bg-carbon px-6 py-4 text-center">
          <p className="text-xs text-oro">{LINKS_URL.replace("https://", "")}</p>
        </div>
      </div>
      <button
        onClick={() => window.print()}
        className="mt-8 rounded-full bg-oro px-8 py-3 font-semibold text-carbon shadow-lg transition-colors hover:bg-oro-claro print:hidden"
      >
        Imprimir QR
      </button>
    </main>
  );
}
