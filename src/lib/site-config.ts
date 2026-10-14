// Business data for Grill House Jac. Update it here and it changes across the site
// (header, contact buttons, footer, /links, /qr and the SEO structured data).
// Empty values = data still pending from the client: the button still shows, but
// points to the contact section until the real link is filled in.

export const SITE = {
  name: "Grill House Jac",
  slogan: "Sabor que se siente",
  url: "https://grillhousejac.com.mx",
  description:
    "Grill House Jac: parrilla de inspiración texana en la Ciudad de México. Cortes a la parrilla, brisket y costillas. Sabor que se siente.",
  keywords: [
    "Grill House Jac",
    "parrilla CDMX",
    "cortes de carne CDMX",
    "steakhouse CDMX",
    "brisket CDMX",
    "costillas a la parrilla",
    "restaurante de cortes",
    "parrilla texana",
  ],
  cuisine: ["Parrilla", "Cortes de carne", "Steakhouse", "Barbecue texano"],

  /** Street address as it should be printed. Pending from the client. */
  address: "",
  locality: "Ciudad de México",
  region: "CDMX",
  country: "MX",
  geo: { lat: 19.4766019, lng: -99.084934 },
  mapsUrl: "https://maps.app.goo.gl/CGaBcqYQiGLLJz7Q6",

  /** Digits only with country code, e.g. "525512345678". Pending. */
  whatsapp: "",
  /** Digits only, e.g. "5512345678". Pending. */
  phone: "",
  /** e.g. "Lun a Dom · 1:00 pm – 11:00 pm". Pending. */
  hours: "",

  social: {
    facebook: "https://www.facebook.com/profile.php?id=61595077393536",
    instagram: "https://www.instagram.com/parrillajac/",
    instagramHandle: "@parrillajac",
    /** Pending: not known yet whether the account exists. */
    tiktok: "",
  },
} as const;

const PENDING_HREF = "/#contacto";

export const whatsappHref = SITE.whatsapp ? `https://wa.me/${SITE.whatsapp}` : PENDING_HREF;
export const phoneHref = SITE.phone ? `tel:+52${SITE.phone}` : PENDING_HREF;
export const tiktokHref = SITE.social.tiktok || PENDING_HREF;
export const mapsEmbedSrc = `https://www.google.com/maps?q=${SITE.geo.lat},${SITE.geo.lng}&z=17&output=embed`;

/** True when a link points to real data (used to open it in a new tab). */
export const isExternal = (href: string) => href.startsWith("http");
