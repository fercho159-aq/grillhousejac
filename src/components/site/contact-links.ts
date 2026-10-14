import { Facebook, Instagram, MapPin, MessageCircle, Phone, UtensilsCrossed } from "lucide-react";
import { TiktokIcon } from "@/components/icons/tiktok-icon";
import { SITE, phoneHref, tiktokHref, whatsappHref } from "@/lib/site-config";

export type ContactLink = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  className: string;
};

/** Every contact button is always shown; pending data falls back to the contact section. */
export const CONTACT_LINKS: ContactLink[] = [
  { label: "WhatsApp", href: whatsappHref, icon: MessageCircle, className: "bg-[#25D366] text-white hover:bg-[#1DA851]" },
  {
    label: "Instagram",
    href: SITE.social.instagram,
    icon: Instagram,
    className: "bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white hover:opacity-90",
  },
  { label: "TikTok", href: tiktokHref, icon: TiktokIcon, className: "bg-black text-white ring-1 ring-white/15 hover:bg-neutral-900" },
  { label: "Facebook", href: SITE.social.facebook, icon: Facebook, className: "bg-[#1877F2] text-white hover:bg-[#166FE5]" },
  { label: "Ubicación", href: SITE.mapsUrl, icon: MapPin, className: "bg-[#EA4335] text-white hover:bg-[#D33426]" },
  { label: "Llamar", href: phoneHref, icon: Phone, className: "bg-oro text-carbon hover:bg-oro-claro" },
];

export const MENU_LINK: ContactLink = {
  label: "Ver menú",
  href: "/#menu",
  icon: UtensilsCrossed,
  className: "bg-carbon-2 text-oro ring-1 ring-oro/60 hover:bg-oro hover:text-carbon",
};
