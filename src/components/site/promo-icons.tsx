import {
  Beer, Briefcase, Clock, Gift, Music, PartyPopper, Percent, Star, Trophy, UtensilsCrossed, Wine,
} from "lucide-react";
import { BottleIcon } from "@/components/icons/bottle-icon";
import type { IconKey } from "@/lib/content/types";

export const PROMO_ICONS: Record<IconKey, { label: string; Icon: React.ComponentType<{ className?: string }> }> = {
  bottle: { label: "Botella", Icon: BottleIcon },
  beer: { label: "Cerveza", Icon: Beer },
  wine: { label: "Copa", Icon: Wine },
  briefcase: { label: "Portafolio", Icon: Briefcase },
  utensils: { label: "Comida", Icon: UtensilsCrossed },
  party: { label: "Fiesta", Icon: PartyPopper },
  star: { label: "Estrella", Icon: Star },
  gift: { label: "Regalo", Icon: Gift },
  percent: { label: "Descuento", Icon: Percent },
  music: { label: "Música", Icon: Music },
  trophy: { label: "Trofeo", Icon: Trophy },
  clock: { label: "Reloj", Icon: Clock },
};
