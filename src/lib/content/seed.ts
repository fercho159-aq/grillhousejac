// Initial content for an empty database, and the read-only fallback when no
// database is configured. The menu comes from "Menú Grill House jac.xlsx" sent by
// the client on 16 oct 2026 (plus the 29 oct changes); after that it is managed from the admin panel.
import type { HeroSettings, Localized, MenuCategory, MenuItem, Price, SiteContent } from "./types";

const L = (esText = "", enText = esText): Localized => ({ es: esText, en: enText });
const EMPTY = L();

type Dish = [name: string, quantity: string, prices: number | [label: string, price: number][], description?: string];

const price = (p: Dish[2]): Price[] =>
  typeof p === "number" ? [{ label: EMPTY, price: String(p) }] : p.map(([label, value]) => ({ label: L(label), price: String(value) }));

function buildMenu() {
  const categories: MenuCategory[] = [];
  const items: MenuItem[] = [];
  const category = (slug: string, name: string, parent: MenuCategory | null, dishes: Dish[], extra: Partial<MenuCategory> = {}) => {
    const c: MenuCategory = {
      id: `cat-${slug}`, parentId: parent?.id ?? null,
      sortOrder: categories.filter((x) => x.parentId === (parent?.id ?? null)).length,
      visible: true, name: L(name), description: EMPTY, note: EMPTY, color: "yellow", childrenDisplay: "sections", ...extra,
    };
    categories.push(c);
    dishes.forEach(([name, quantity, prices, description = ""], i) => items.push({
      id: `${c.id}-item-${i + 1}`, categoryId: c.id, sortOrder: i, visible: true,
      name: L(name), quantity: L(quantity), description: L(description), prices: price(prices), image: null,
    }));
    return c;
  };

  category("entradas", "Entradas", null, [
    ["Queso fundido tradicional", "200 g", 90],
    ["Queso fundido con chistorra", "200 g + 100 g", 125],
    ["Queso fundido con arrachera", "200 g + 100 g", 125],
    ["Queso fundido con aguja norteña", "200 g + 100 g", 125],
    ["Queso fundido con rib eye", "200 g + 100 g", 135],
    ["Queso fundido con New York", "200 g + 100 g", 135],
    ["Queso fundido con sirloin", "200 g + 100 g", 135],
  ]);
  category("sopas", "Sopas", null, [
    ["Sopa de tortilla", "350 g", 45, "Con chicharrón, queso panela, crema, aguacate y juliana de tortilla."],
    ["Frijoles charros", "350 g", 45, "Con tocino, salchicha, chicharrón y longaniza."],
  ]);
  category("cortes", "Cortes", null, [
    ["Aguja norteña a la parrilla", "400 g", 218],
    ["Arrachera a la parrilla", "400 g", 260],
    ["New York a la parrilla", "350 g", 280],
    ["Rib eye a la parrilla", "350 g", 280],
    ["Sirloin a la parrilla", "350 g", 280],
    ["Picaña", "350 g", 280],
    ["T-bone", "350 g", 295],
    ["Cowboy", "350 g", 329],
    ["Costillar de puerco", "400 g", 349],
    ["Pechuga a la plancha", "300 g", 145],
    ["Tomahawk (pieza completa)", "1.2 kg", 1189],
  ]);
  category("tacos", "Tacos", null, [
    ["Taco de arrachera prime", "1 pza - 80 g", 53],
    ["Taco de aguja norteña", "1 pza - 80 g", 45],
    ["Taco de rib eye prime", "1 pza - 80 g", 60],
    ["Taco de New York prime", "1 pza - 80 g", 60],
    ["Taco de sirloin prime", "1 pza - 80 g", 60],
    ["Taco de T-bone", "1 pza - 80 g", 60],
    ["Taco de picaña", "1 pza - 80 g", 60],
    ["Taco de pork belly", "1 pza - 80 g", 60],
    ["Taco de pechuga al limón", "1 pza - 80 g", 48],
    ["Taco de pechuga al chipotle", "1 pza - 80 g", 48],
    ["Taco queso carne", "110 g", 48],
    ["Taco de chistorra", "1 pza - 80 g", 40],
    ["Taco de salchichón sinaloense", "1 pza - 80 g", 40],
    ["Queso extra", "", 15, "Agrégalo a cualquier taco por $15 más."],
  ], { note: L("Con queso extra +$15") });
  category("costras", "Costras", null, [
    ["Costra de queso con arrachera marinada", "80 g", 68],
    ["Costra de queso con rib eye", "80 g", 78],
    ["Costra de queso con sirloin", "80 g", 78],
    ["Costra de queso con New York", "80 g", 78],
    ["Costra de queso con picaña", "80 g", 78],
  ]);
  category("volcanes", "Volcanes", null, [
    ["Volcán de queso con arrachera marinada", "80 g", 68],
    ["Volcán de queso con rib eye", "80 g", 78],
    ["Volcán de queso con sirloin", "80 g", 78],
    ["Volcán de queso con New York", "80 g", 78],
    ["Volcán de queso con chistorra", "80 g", 78],
    ["Volcán de queso con picaña", "80 g", 78],
  ]);
  category("hamburguesas", "Hamburguesas", null, [
    ["Hamburguesa de sirloin", "1 pza - 110 g", [["Sola", 135], ["Con papas", 170]]],
    ["Hamburguesa de arrachera", "1 pza - 110 g", [["Sola", 120], ["Con papas", 155]]],
  ]);
  category("snacks", "Snacks", null, [
    ["Alitas", "500 g", [["Solas", 70], ["Con papas", 105]]],
    ["Boneless", "250 g", [["Solos", 88], ["Con papas", 125]]],
    ["Dedos de queso (5 pzas)", "150 g", [["Solos", 88], ["Con papas", 125]]],
  ]);
  category("para-compartir", "Para compartir", null, [
    ["Charola Grill House Jac", "1 kg", 580, "Chorizo argentino, pork belly, arrachera, sirloin, chistorra y salchichón."],
    ["Pork belly", "1 kg", 580],
    ["Chicharrón de rib eye", "350 g", 279],
    ["Molcajete mar y tierra", "", 348],
    ["Molcajete tierra", "", 328],
    ["Molcajete pork belly", "", 480],
  ]);
  const bebidas = category("bebidas", "Bebidas", null, []);
  category("refrescos", "Refrescos", bebidas, [
    ["Coca-Cola", "355 ml", 30],
    ["Coca-Cola Light", "355 ml", 30],
    ["Sprite", "355 ml", 30],
    ["Sidral Mundet", "355 ml", 30],
    ["Valle Frut Mango", "355 ml", 30],
    ["Valle Frut Guayaba", "355 ml", 30],
    ["Ciel Mineral", "600 ml", 35],
  ]);
  category("aguas", "Aguas y limonadas", bebidas, [
    ["Agua de frutas de temporada", "", [["500 ml", 35], ["1 L", 60]]],
    ["Limonada", "355 ml", 25],
    ["Naranjada", "355 ml", 25],
  ]);
  category("cervezas", "Cervezas", bebidas, [
    ["Victoria", "355 ml", 55],
    ["Corona", "355 ml", 55],
    ["Modelo Especial", "355 ml", 55],
    ["Negra Modelo", "355 ml", 55],
    ["Preparado de chelada", "", 10, "Prepara tu cerveza como chelada por $10 más."],
  ], { note: L("Preparado de chelada +$10") });
  category("clericot", "Clericot", bebidas, [
    ["Jarra de clericot", "1 L", 250],
  ]);

  return { categories, items };
}

export function buildSeedContent(): SiteContent {
  return { ...buildMenu(), promotions: [], hero: defaultHero() };
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
