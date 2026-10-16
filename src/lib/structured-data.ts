import { SITE } from "@/lib/site-config";
import type { SiteContent } from "@/lib/content/types";

/** schema.org Restaurant data so Google can show the business (and its menu) in search. */
export function restaurantJsonLd(content: SiteContent) {
  const categories = content.categories.filter((c) => c.visible);
  const items = content.items.filter((i) => i.visible && i.prices.some((p) => p.price));
  const sections = categories
    .map((c) => ({
      "@type": "MenuSection",
      name: c.name.es,
      hasMenuItem: items
        .filter((i) => i.categoryId === c.id)
        .map((i) => ({
          "@type": "MenuItem",
          name: i.name.es,
          ...(i.description.es && { description: i.description.es }),
          offers: { "@type": "Offer", price: i.prices.find((p) => p.price)?.price.replace(/[^\d.]/g, ""), priceCurrency: "MXN" },
        })),
    }))
    .filter((s) => s.hasMenuItem.length > 0);

  const sameAs = [SITE.social.facebook, SITE.social.instagram, SITE.social.tiktok].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${SITE.url}/#restaurant`,
    name: SITE.name,
    slogan: SITE.slogan,
    description: SITE.description,
    url: SITE.url,
    logo: `${SITE.url}/images/logo-grillhousejac.png`,
    image: [`${SITE.url}/opengraph-image.jpg`, `${SITE.url}/images/logo-grillhousejac.png`],
    servesCuisine: SITE.cuisine,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${SITE.street}, ${SITE.neighborhood}`,
      postalCode: SITE.postalCode,
      addressLocality: `${SITE.borough}, ${SITE.locality}`,
      addressRegion: SITE.region,
      addressCountry: SITE.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: SITE.geo.lat, longitude: SITE.geo.lng },
    hasMap: SITE.mapsUrl,
    ...(SITE.phone ? { telephone: `+52${SITE.phone}` } : {}),
    sameAs,
    hasMenu:
      sections.length > 0
        ? { "@type": "Menu", url: `${SITE.url}/#menu`, inLanguage: "es-MX", hasMenuSection: sections }
        : `${SITE.url}/#menu`,
  };
}
