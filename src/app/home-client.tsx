"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Clock, Flame, MapPin, Menu as MenuIcon, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hero } from "@/components/site/hero";
import { CONTACT_LINKS } from "@/components/site/contact-links";
import { PromoPopup } from "@/components/site/promo-popup";
import { SITE, isExternal, mapsEmbedSrc } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import type { Localized, MenuCategory, MenuItem, SiteContent } from "@/lib/content/types";

const NAV = [
  { href: "#nosotros", label: "Nosotros" },
  { href: "#menu", label: "Menú" },
  { href: "#promociones", label: "Promociones" },
  { href: "#ubicacion", label: "Ubicación" },
  { href: "#contacto", label: "Contacto" },
];

const ABOUT_IMAGE = "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?q=80&w=1200&auto=format&fit=crop";

const t = (l: Localized | null | undefined) => l?.es || "";
const byOrder = (a: { sortOrder: number }, b: { sortOrder: number }) => a.sortOrder - b.sortOrder;

function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={cn("transition-all duration-700 ease-out", visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ eyebrow, title, light = false }: { eyebrow: string; title: string; light?: boolean }) {
  return (
    <div className="mb-10 text-center">
      <p className={cn("font-accent text-xs md:text-sm", light ? "text-oro-oscuro" : "text-oro")}>{eyebrow}</p>
      <h2 className={cn("font-display mt-2 break-words text-3xl md:text-5xl", light ? "text-carbon" : "text-hueso")}>{title}</h2>
      <div className="mx-auto mt-4 h-px w-24 bg-oro" />
    </div>
  );
}

function ItemCard({ item }: { item: MenuItem }) {
  const description = t(item.description);
  const quantity = t(item.quantity);
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-[#E5DCCB] bg-white">
      {item.image && (
        // Admin uploads may be /api/images/… or any URL, so a plain img avoids next/image domain limits.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image} alt={t(item.name)} loading="lazy" className="aspect-[3/2] w-full object-cover" />
      )}
      <div className="flex flex-1 flex-col p-4">
        <h4 className="font-display text-lg leading-tight text-carbon">{t(item.name)}</h4>
        {quantity && <p className="mt-1 text-sm text-cuero">{quantity}</p>}
        {description && <p className="mt-1 text-sm text-cuero">{description}</p>}
        <div className="mt-auto flex flex-wrap gap-x-5 gap-y-1 pt-3">
          {item.prices.filter((p) => p.price).map((p, i) => (
            <p key={i} className="text-oro-oscuro">
              {t(p.label) && <span className="mr-1 text-xs uppercase tracking-wide text-cuero">{t(p.label)}</span>}
              <span className="text-lg font-semibold">${p.price}</span>
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}

/** Highlighted notice of a category (e.g. "Con queso extra +$15"); prices in the text are shown in gold. */
function CategoryNote({ text }: { text: string }) {
  const parts = text.split(/([+-]?\s?\$\s?[\d.,]+)/);
  return (
    <div className="mx-auto mb-8 flex max-w-md items-center gap-4 rounded-2xl bg-carbon px-5 py-4 shadow-lg ring-2 ring-oro">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brasa" aria-hidden="true">
        <Flame className="h-6 w-6 text-hueso" />
      </span>
      <p className="font-display text-lg leading-snug text-hueso sm:text-xl">
        {parts.map((part, i) =>
          i % 2 === 1 ? <span key={i} className="whitespace-nowrap text-2xl text-oro sm:text-3xl">{part}</span> : part,
        )}
      </p>
    </div>
  );
}

function CategoryBlock({ category, categories, items }: { category: MenuCategory; categories: MenuCategory[]; items: MenuItem[] }) {
  const own = items.filter((i) => i.categoryId === category.id).sort(byOrder);
  const children = categories.filter((c) => c.parentId === category.id).sort(byOrder);
  return (
    <div>
      {t(category.description) && <p className="mx-auto mb-6 max-w-xl text-center text-cuero">{t(category.description)}</p>}
      {t(category.note) && <CategoryNote text={t(category.note)} />}
      {own.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {own.map((item) => <ItemCard key={item.id} item={item} />)}
        </div>
      )}
      {children.map((child) => (
        <div key={child.id} className="mt-10">
          <h3 className="font-display mb-6 text-center text-2xl text-carbon">{t(child.name)}</h3>
          <CategoryBlock category={child} categories={categories} items={items} />
        </div>
      ))}
    </div>
  );
}

function MenuSection({ content }: { content: SiteContent }) {
  const categories = content.categories.filter((c) => c.visible);
  const items = content.items.filter((i) => i.visible && i.prices.some((p) => p.price));
  const top = categories.filter((c) => !c.parentId).sort(byOrder);
  const hasItems = (id: string): boolean =>
    items.some((i) => i.categoryId === id) || categories.some((c) => c.parentId === id && hasItems(c.id));
  const withItems = top.filter((c) => hasItems(c.id));

  if (withItems.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-[#E5DCCB] bg-white p-8 text-center">
        <Flame className="mx-auto h-10 w-10 text-brasa" aria-hidden="true" />
        <h3 className="font-display mt-4 text-2xl text-carbon">Estamos afinando la parrilla</h3>
        <p className="mt-2 text-cuero">
          Muy pronto publicaremos el menú completo. Mientras tanto, síguenos en redes o escríbenos para conocer los cortes del día.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild className="bg-carbon text-hueso hover:bg-carbon-2">
            <a href={SITE.social.instagram} target="_blank" rel="noopener noreferrer">Instagram {SITE.social.instagramHandle}</a>
          </Button>
          <Button asChild variant="outline" className="border-carbon bg-transparent text-carbon hover:bg-carbon hover:text-hueso">
            <a href="#contacto">Contacto</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue={withItems[0].id} className="w-full">
      <div className="-mx-4 overflow-x-auto px-4 pb-2">
        <TabsList className="mx-auto mb-8 flex h-auto w-max gap-1 rounded-full bg-carbon p-1">
          {withItems.map((c) => (
            <TabsTrigger
              key={c.id}
              value={c.id}
              className="rounded-full px-4 py-2 text-sm text-arena data-[state=active]:bg-oro data-[state=active]:text-carbon"
            >
              {t(c.name)}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {withItems.map((c) => (
        <TabsContent key={c.id} value={c.id}>
          <CategoryBlock category={c} categories={categories} items={items} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

export default function HomeClient({ content }: { content: SiteContent }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const promotions = content.promotions ?? [];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav = NAV.filter((n) => n.href !== "#promociones" || promotions.length > 0);

  return (
    <div className="flex min-h-screen flex-col bg-carbon text-hueso">
      <PromoPopup />
      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b transition-colors",
          scrolled ? "border-white/10 bg-carbon/95 backdrop-blur" : "border-transparent bg-carbon",
        )}
      >
        <div className="container flex h-16 items-center justify-between">
          <a href="#inicio" className="flex items-center gap-3" aria-label={`${SITE.name}, inicio`}>
            <Image src="/images/logo-grillhousejac.webp" alt="" width={40} height={40} className="rounded-full ring-1 ring-oro" />
            <span className="font-display text-lg text-hueso">{SITE.name}</span>
          </a>
          <nav aria-label="Principal" className="hidden items-center gap-6 md:flex">
            {nav.map((n) => (
              <a key={n.href} href={n.href} className="text-sm text-arena transition-colors hover:text-oro">{n.label}</a>
            ))}
          </nav>
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-hueso md:hidden" aria-label="Abrir menú de navegación">
                <MenuIcon className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 border-white/10 bg-carbon">
              <SheetTitle className="font-display text-oro">{SITE.name}</SheetTitle>
              <nav aria-label="Móvil" className="mt-8 flex flex-col gap-5">
                {nav.map((n) => (
                  <a key={n.href} href={n.href} onClick={() => setMenuOpen(false)} className="text-lg text-hueso hover:text-oro">{n.label}</a>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main id="inicio" className="flex-1">
        <h1 className="sr-only">{SITE.name}: parrilla y cortes de carne en la Ciudad de México</h1>
        <Hero hero={content.hero} lang="es" />

        <section id="nosotros" className="scroll-mt-16 py-16 md:py-24">
          <div className="container grid items-center gap-10 md:grid-cols-2">
            <Reveal>
              <p className="font-accent text-xs text-oro md:text-sm">{SITE.slogan}</p>
              <h2 className="font-display mt-3 text-3xl leading-tight md:text-5xl">Parrilla de inspiración texana</h2>
              <div className="mt-4 h-px w-24 bg-oro" />
              <p className="mt-6 leading-relaxed text-arena">
                En {SITE.name} encendemos la parrilla para servir cortes jugosos, brisket y costillas con el carácter del
                estilo texano. Un lugar para comer sin prisa y en buena compañía, en la Ciudad de México.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg"><a href="#menu">Ver menú</a></Button>
                <Button asChild size="lg" variant="outline" className="border-oro bg-transparent text-oro hover:bg-oro hover:text-carbon">
                  <a href="#contacto">Contacto</a>
                </Button>
              </div>
            </Reveal>
            <Reveal delay={150}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ABOUT_IMAGE}
                alt="Corte de carne a la parrilla rebanado sobre tabla de madera"
                loading="lazy"
                className="aspect-[4/3] w-full rounded-2xl object-cover ring-1 ring-oro/40"
              />
            </Reveal>
          </div>
        </section>

        <section id="menu" className="scroll-mt-16 bg-hueso py-16 text-carbon md:py-24">
          <div className="container">
            <SectionTitle eyebrow="Lo que sale de la parrilla" title="Menú" light />
            <MenuSection content={content} />
          </div>
        </section>

        {promotions.length > 0 && (
          <section id="promociones" className="scroll-mt-16 bg-carbon-2 py-16 md:py-24">
            <div className="container">
              <SectionTitle eyebrow="Para hoy" title="Promociones" />
              <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
                {promotions.map((p, i) => (
                  <Reveal key={p.id} delay={i * 120} className="h-full">
                    <article className="h-full overflow-hidden rounded-2xl border border-oro/30 bg-carbon">
                      {p.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt={t(p.title)} loading="lazy" className="aspect-[16/9] w-full object-cover" />
                      )}
                      <div className="p-6">
                        <h3 className="font-display text-xl text-oro">{t(p.title)}</h3>
                        {t(p.description) && <p className="mt-2 text-sm leading-relaxed text-arena">{t(p.description)}</p>}
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        <section id="ubicacion" className="scroll-mt-16 py-16 md:py-24">
          <div className="container">
            <SectionTitle eyebrow="Ven a visitarnos" title="Ubicación" />
            <div className="grid gap-8 md:grid-cols-5">
              <div className="overflow-hidden rounded-2xl ring-1 ring-oro/40 md:col-span-3">
                <iframe
                  title={`Mapa de ${SITE.name}`}
                  src={mapsEmbedSrc}
                  className="h-72 w-full md:h-full md:min-h-[360px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="flex flex-col justify-center gap-6 md:col-span-2">
                <div className="flex gap-4">
                  <MapPin className="mt-1 h-6 w-6 shrink-0 text-oro" aria-hidden="true" />
                  <div>
                    <h3 className="font-display text-xl">Dirección</h3>
                    <p className="mt-1 text-arena">{SITE.address || `${SITE.locality}. Encuéntranos en Google Maps.`}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Clock className="mt-1 h-6 w-6 shrink-0 text-oro" aria-hidden="true" />
                  <div>
                    <h3 className="font-display text-xl">Horario</h3>
                    <p className="mt-1 text-arena">{SITE.hours || "Escríbenos para confirmar el horario del día."}</p>
                  </div>
                </div>
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer">
                    <Navigation className="mr-2 h-5 w-5" aria-hidden="true" /> Cómo llegar
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="contacto" className="scroll-mt-16 bg-carbon-2 py-16 md:py-24">
          <div className="container max-w-3xl">
            <SectionTitle eyebrow="Estamos para servirte" title="Contacto" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {CONTACT_LINKS.map(({ label, href, icon: Icon, className }) => (
                <a
                  key={label}
                  href={href}
                  target={isExternal(href) ? "_blank" : undefined}
                  rel={isExternal(href) ? "noopener noreferrer" : undefined}
                  className={cn("flex items-center gap-4 rounded-xl px-6 py-4 text-lg font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98]", className)}
                >
                  <Icon className="h-6 w-6 shrink-0" />
                  <span className="flex-1 text-center">{label}</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-10">
        <div className="container flex flex-col items-center gap-3 text-center text-sm text-arena">
          <Image src="/images/logo-grillhousejac.webp" alt={`Logo de ${SITE.name}`} width={72} height={72} className="rounded-full ring-1 ring-oro" />
          <p className="font-display text-base text-hueso">{SITE.name}</p>
          <p className="font-accent text-[11px] text-oro">{SITE.slogan}</p>
          {SITE.address && <p>{SITE.address}</p>}
          <p>{SITE.locality}</p>
          <p className="text-xs text-arena/80">&copy; {new Date().getFullYear()} {SITE.name}. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
