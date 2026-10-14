"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HERO_HEIGHTS } from "@/lib/content/palette";
import type { HeroFit, HeroSettings, HeroSlide, Lang } from "@/lib/content/types";

/** "auto" is the live site; "desktop"/"mobile" force a layout for the admin preview. */
export type HeroDevice = "auto" | "desktop" | "mobile";

type Props = {
  hero: HeroSettings;
  lang: Lang;
  device?: HeroDevice;
  onViewMenu?: (lang: Lang) => void;
};

const fitClass = (fit: HeroFit) => (fit === "contain" ? "object-contain" : "object-cover");

function heightCss(vh: number, device: HeroDevice) {
  // In the admin preview the frame is a size container, so cqh stands in for the viewport.
  if (device !== "auto") return `${vh}cqh`;
  return vh === 100 ? "calc(100svh - 4rem)" : `${vh}svh`;
}

function SlideImage({ slide, device, eager }: { slide: HeroSlide; device: HeroDevice; eager: boolean }) {
  const desktop = slide.desktopImage || slide.mobileImage;
  const mobile = slide.mobileImage || slide.desktopImage;
  if (!desktop || !mobile) return null;

  const usesContain =
    device === "auto"
      ? slide.fitDesktop === "contain" || slide.fitMobile === "contain"
      : (device === "mobile" ? slide.fitMobile : slide.fitDesktop) === "contain";

  const picture = (className: string, alt: string) =>
    device === "auto" ? (
      <picture>
        <source media="(max-width: 767px)" srcSet={mobile} />
        <img
          src={desktop}
          alt={alt}
          className={className}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
        />
      </picture>
    ) : (
      <img src={device === "mobile" ? mobile : desktop} alt={alt} className={className} />
    );

  const fit =
    device === "auto"
      ? cn(fitClass(slide.fitMobile), slide.fitDesktop === "contain" ? "md:object-contain" : "md:object-cover")
      : fitClass(device === "mobile" ? slide.fitMobile : slide.fitDesktop);

  return (
    <>
      {/* Blurred fill behind images shown whole, so vertical/horizontal photos never leave black bars. */}
      {usesContain && picture("absolute inset-0 h-full w-full object-cover blur-2xl scale-110 opacity-60", "")}
      {picture(cn("absolute inset-0 h-full w-full", fit), slide.alt)}
    </>
  );
}

export function Hero({ hero, lang, device = "auto", onViewMenu }: Props) {
  const slides = hero.slides.filter((s) => s.desktopImage || s.mobileImage);
  const shown = hero.mode === "carousel" ? slides : slides.slice(0, 1);
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);
  const count = shown.length;
  const active = count > 0 ? index % count : 0;

  useEffect(() => {
    if (count < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), Math.max(2, hero.intervalSeconds) * 1000);
    return () => clearInterval(timer);
  }, [count, hero.intervalSeconds, index]);

  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);

  const heightStyle =
    device === "auto"
      ? ({
          "--hero-h-m": heightCss(HERO_HEIGHTS[hero.heightMobile].vh, device),
          "--hero-h-d": heightCss(HERO_HEIGHTS[hero.heightDesktop].vh, device),
        } as React.CSSProperties)
      : { height: heightCss(HERO_HEIGHTS[device === "mobile" ? hero.heightMobile : hero.heightDesktop].vh, device) };

  const size = <T,>(mobile: T, desktop: T, auto: T) => (device === "mobile" ? mobile : device === "desktop" ? desktop : auto);

  return (
    <section
      className={cn("relative w-full overflow-hidden bg-carbon", device === "auto" && "h-[var(--hero-h-m)] md:h-[var(--hero-h-d)]")}
      style={heightStyle}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null || count < 2) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      {shown.map((slide, i) => (
        <div
          key={slide.id}
          className={cn("absolute inset-0 transition-opacity duration-1000", i === active ? "opacity-100" : "opacity-0")}
          aria-hidden={i !== active}
        >
          <SlideImage slide={slide} device={device} eager={i === 0} />
        </div>
      ))}

      <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${hero.overlay / 100})` }} />

      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white">
        {hero.showLogo && (
          <div className={size("w-28", "w-44", "w-36 md:w-52")}>
            <Image
              src="/images/logo-grillhousejac.webp"
              alt="Logo de Grill House Jac"
              width={640}
              height={640}
              sizes="(max-width: 768px) 144px, 208px"
              className="mx-auto h-auto w-full rounded-full shadow-[0_0_0_2px_#C9A15A,0_10px_40px_rgba(0,0,0,0.6)]"
              priority
            />
          </div>
        )}
        {(hero.tagline[lang] || hero.tagline.es) && (
          <p
            className={cn("font-accent mt-5 max-w-2xl text-oro", size("text-xs", "text-base", "text-sm md:text-base"))}
            style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}
          >
            {hero.tagline[lang] || hero.tagline.es}
          </p>
        )}
        {hero.showButtons && (
          <div className={cn("flex flex-wrap justify-center gap-3", size("mt-4", "mt-8", "mt-8"))}>
            <Button asChild size="lg" className="font-semibold">
              <a href="#menu" onClick={() => onViewMenu?.(lang)}>Ver menú</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-oro bg-transparent font-semibold text-oro hover:bg-oro hover:text-carbon">
              <a href="#ubicacion">Ubicación</a>
            </Button>
          </div>
        )}
      </div>

      {count > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {shown.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Imagen ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn("h-2.5 rounded-full transition-all", i === active ? "w-6 bg-primary" : "w-2.5 bg-white/50 hover:bg-white")}
            />
          ))}
        </div>
      )}
    </section>
  );
}
