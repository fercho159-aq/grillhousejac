export type Lang = "es" | "en";

export type Localized = { es: string; en: string };

export type Price = { label: Localized; price: string };

export type ColorKey =
  | "blue" | "green" | "yellow" | "orange" | "magenta" | "red" | "cyan" | "violet" | "gray"
  | "sky" | "purple" | "amber" | "lime" | "tangerine" | "gold" | "rust" | "crimson" | "rose" | "pink";

export type IconKey =
  | "bottle" | "beer" | "wine" | "briefcase" | "utensils" | "party" | "star"
  | "gift" | "percent" | "music" | "trophy" | "clock";

export type MenuCategory = {
  id: string;
  parentId: string | null;
  sortOrder: number;
  visible: boolean;
  name: Localized;
  description: Localized;
  /** Highlighted notice shown in the category (e.g. a promo). */
  note: Localized;
  color: ColorKey;
  /** How subcategories render: as tabs or as stacked sections. */
  childrenDisplay: "tabs" | "sections";
};

export type MenuItem = {
  id: string;
  categoryId: string;
  sortOrder: number;
  visible: boolean;
  name: Localized;
  quantity: Localized;
  description: Localized;
  prices: Price[];
  image: string | null;
};

export type Promotion = {
  id: string;
  sortOrder: number;
  visible: boolean;
  title: Localized;
  description: Localized;
  icon: IconKey;
  color: ColorKey;
  image: string | null;
  /** Days of week (0 = Sunday … 6 = Saturday). Empty = every day. */
  days: number[];
  /** Inclusive YYYY-MM-DD bounds, Mexico City time. */
  startDate: string | null;
  endDate: string | null;
};

export type HeroFit = "cover" | "contain";
export type HeroHeight = "short" | "medium" | "tall" | "full";

export type HeroSlide = {
  id: string;
  desktopImage: string | null;
  mobileImage: string | null;
  fitDesktop: HeroFit;
  fitMobile: HeroFit;
  alt: string;
};

export type HeroSettings = {
  mode: "single" | "carousel";
  slides: HeroSlide[];
  intervalSeconds: number;
  heightDesktop: HeroHeight;
  heightMobile: HeroHeight;
  /** Darkening overlay, 0–90 (%). */
  overlay: number;
  showLogo: boolean;
  showButtons: boolean;
  tagline: Localized;
};

export type SiteContent = {
  categories: MenuCategory[];
  items: MenuItem[];
  promotions: Promotion[];
  hero: HeroSettings;
};
