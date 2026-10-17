"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { mexicoToday } from "@/lib/content/schedule";

/**
 * Pop-up de promoción que aparece al abrir la página principal.
 * Se muestra una vez por pestaña (sessionStorage) y solo hasta la fecha `hasta`
 * (hora de la Ciudad de México). Para cambiar la promo, edita aquí el texto y la fecha.
 */
export const PROMO_POPUP = {
  eyebrow: "Promoción del día",
  title: "Tacos de sirloin",
  big: "2x1",
  note: "¡¡Solo por hoy!!",
  cta: "Quiero los míos",
  target: "#contacto",
  /** Último día (YYYY-MM-DD) en que se muestra. Después de esa fecha ya no aparece. */
  hasta: "2026-10-17",
} as const;

const STORAGE_KEY = `promo-popup:${PROMO_POPUP.hasta}:${PROMO_POPUP.title}`;

export function PromoPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (mexicoToday().date > PROMO_POPUP.hasta) return;
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
    } catch {
      // sessionStorage can be blocked (private mode); show the pop-up anyway.
    }
    const timer = window.setTimeout(() => setOpen(true), 400);
    return () => window.clearTimeout(timer);
  }, []);

  const close = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  };

  const goToTarget = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    close();
    // Wait for the dialog to unlock body scroll before jumping to the section.
    window.setTimeout(() => {
      const el = document.querySelector<HTMLElement>(PROMO_POPUP.target);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", PROMO_POPUP.target);
      } else {
        window.location.hash = PROMO_POPUP.target;
      }
    }, 250);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : close())}>
      <DialogContent
        aria-describedby={undefined}
        className="w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-2xl border-2 border-oro bg-carbon-2 p-0 text-hueso shadow-[0_0_60px_rgba(201,161,90,0.25)] [&>button]:text-hueso [&>button]:opacity-80 [&>button]:hover:opacity-100"
      >
        <div className="relative px-6 pb-7 pt-10 text-center sm:px-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-oro-oscuro via-oro-claro to-oro-oscuro" />
          <p className="font-accent inline-flex items-center gap-2 rounded-full bg-brasa px-4 py-1.5 text-xs text-hueso sm:text-sm">
            <Flame className="h-4 w-4" aria-hidden="true" />
            {PROMO_POPUP.eyebrow}
          </p>
          <DialogTitle className="font-display mt-5 text-3xl leading-tight tracking-normal text-hueso sm:text-4xl">
            {PROMO_POPUP.title}
          </DialogTitle>
          <p className="font-display mt-1 text-7xl leading-none text-oro drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] sm:text-8xl">
            {PROMO_POPUP.big}
          </p>
          <DialogDescription className="font-accent mt-4 text-base text-oro-claro sm:text-lg">
            {PROMO_POPUP.note}
          </DialogDescription>
          <div className="mx-auto mt-6 h-px w-24 bg-oro" />
          <Button
            asChild
            size="lg"
            className="mt-6 w-full bg-oro text-base font-semibold text-carbon hover:bg-oro-claro sm:w-auto sm:px-10"
          >
            <a href={PROMO_POPUP.target} onClick={goToTarget}>
              {PROMO_POPUP.cta}
            </a>
          </Button>
          <button
            type="button"
            onClick={close}
            className="mt-4 block w-full rounded py-1 text-sm text-arena underline-offset-4 hover:text-hueso hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-oro"
          >
            Ahora no
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
