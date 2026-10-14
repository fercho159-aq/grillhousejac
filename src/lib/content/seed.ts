// Initial content for an empty database, and the read-only fallback when no
// database is configured. The client asked to launch with an empty menu: dishes,
// categories and promotions are added later from the admin panel.
import type { HeroSettings, Localized, SiteContent } from "./types";

const L = (esText = "", enText = esText): Localized => ({ es: esText, en: enText });

export function buildSeedContent(): SiteContent {
  return { categories: [], items: [], promotions: [], hero: defaultHero() };
}

export function defaultHero(): HeroSettings {
  return {
    mode: "single",
    slides: [{
      id: "slide-1",
      desktopImage: "https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?q=80&w=2000&auto=format&fit=crop",
      mobileImage: null,
      fitDesktop: "cover",
      fitMobile: "cover",
      alt: "Cortes de carne a la parrilla",
    }],
    intervalSeconds: 5,
    heightDesktop: "tall",
    heightMobile: "tall",
    overlay: 65,
    showLogo: true,
    showButtons: true,
    tagline: L("Sabor que se siente", "Flavor you can feel"),
  };
}
