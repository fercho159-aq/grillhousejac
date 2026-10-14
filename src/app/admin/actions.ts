"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { checkPassword, createSessionToken, isAuthConfigured, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-session";
import * as repo from "@/lib/content/repository";
import { PALETTE } from "@/lib/content/palette";
import type { HeroSettings, MenuCategory, MenuItem, Promotion } from "@/lib/content/types";

// ---------- Auth ----------

export async function login(_prev: { error?: string } | undefined, formData: FormData) {
  if (!isAuthConfigured()) {
    return { error: "Falta configurar la variable ADMIN_PASSWORD en el servidor." };
  }
  const password = String(formData.get("password") ?? "");
  if (!(await checkPassword(password))) {
    await new Promise((r) => setTimeout(r, 800));
    return { error: "Contraseña incorrecta." };
  }
  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  redirect("/admin");
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

// ---------- Validation ----------

const text = (max: number) => z.string().max(max).transform((s) => s.trim());
const localized = (max: number) => z.object({ es: text(max), en: text(max) });
const imageUrl = z
  .string()
  .max(2000)
  .refine((u) => u.startsWith(repo.IMAGE_URL_PREFIX) || /^https:\/\//.test(u), "URL de imagen inválida")
  .nullable();
const colorKey = z.enum(Object.keys(PALETTE) as [keyof typeof PALETTE, ...(keyof typeof PALETTE)[]]);
const id = z.string().min(1).max(100).regex(/^[\w-]+$/);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable();

const categorySchema = z.object({
  id,
  parentId: id.nullable(),
  sortOrder: z.number().int(),
  visible: z.boolean(),
  name: localized(120),
  description: localized(1000),
  note: localized(500),
  color: colorKey,
  childrenDisplay: z.enum(["tabs", "sections"]),
});

const itemSchema = z.object({
  id,
  categoryId: id,
  sortOrder: z.number().int(),
  visible: z.boolean(),
  name: localized(200),
  quantity: localized(120),
  description: localized(1500),
  prices: z.array(z.object({ label: localized(60), price: text(30) })).max(6),
  image: imageUrl,
});

const promotionSchema = z.object({
  id,
  sortOrder: z.number().int(),
  visible: z.boolean(),
  title: localized(200),
  description: localized(1500),
  icon: z.enum(["bottle", "beer", "wine", "briefcase", "utensils", "party", "star", "gift", "percent", "music", "trophy", "clock"]),
  color: colorKey,
  image: imageUrl,
  days: z.array(z.number().int().min(0).max(6)).max(7),
  startDate: isoDate,
  endDate: isoDate,
});

const heroFit = z.enum(["cover", "contain"]);
const heroHeight = z.enum(["short", "medium", "tall", "full"]);
const heroSchema = z.object({
  mode: z.enum(["single", "carousel"]),
  slides: z.array(z.object({
    id,
    desktopImage: imageUrl,
    mobileImage: imageUrl,
    fitDesktop: heroFit,
    fitMobile: heroFit,
    alt: text(200),
  })).max(12),
  intervalSeconds: z.number().min(2).max(60),
  heightDesktop: heroHeight,
  heightMobile: heroHeight,
  overlay: z.number().min(0).max(90),
  showLogo: z.boolean(),
  showButtons: z.boolean(),
  tagline: localized(300),
});

type Result<T = void> = { ok: true; data: T } | { ok: false; error: string };

async function mutate<T>(fn: () => Promise<T>, touchesImages = false): Promise<Result<T>> {
  try {
    await requireAdmin();
    const data = await fn();
    revalidateTag(repo.CONTENT_TAG);
    revalidatePath("/");
    if (touchesImages) await repo.deleteOrphanImages().catch((e) => console.error("[images] cleanup", e));
    return { ok: true, data };
  } catch (err) {
    console.error("[admin]", err);
    if (err instanceof z.ZodError) {
      return { ok: false, error: "Datos inválidos: " + err.issues.map((i) => i.message).join(", ") };
    }
    return { ok: false, error: err instanceof Error ? err.message : "Error inesperado" };
  }
}

// ---------- Menu ----------

export async function saveCategoryAction(input: MenuCategory) {
  return mutate(async () => {
    const c = categorySchema.parse(input);
    if (c.parentId === c.id) throw new Error("Una categoría no puede ser su propia subcategoría.");
    if (!c.name.es) throw new Error("El nombre en español es obligatorio.");
    await repo.saveCategory(c);
    return c;
  });
}

export async function deleteCategoryAction(categoryId: string) {
  return mutate(() => repo.deleteCategory(id.parse(categoryId)), true);
}

export async function saveItemAction(input: MenuItem) {
  return mutate(async () => {
    const item = itemSchema.parse(input);
    if (!item.name.es) throw new Error("El nombre en español es obligatorio.");
    await repo.saveItem(item);
    return item;
  }, true);
}

export async function deleteItemAction(itemId: string) {
  return mutate(() => repo.deleteItem(id.parse(itemId)), true);
}

export async function reorderAction(kind: "categories" | "items" | "promotions", ids: string[]) {
  return mutate(() => repo.reorder(z.enum(["categories", "items", "promotions"]).parse(kind), z.array(id).parse(ids)));
}

// ---------- Promotions ----------

export async function savePromotionAction(input: Promotion) {
  return mutate(async () => {
    const p = promotionSchema.parse(input);
    if (!p.title.es) throw new Error("El título en español es obligatorio.");
    if (p.startDate && p.endDate && p.startDate > p.endDate) {
      throw new Error("La fecha de inicio debe ser anterior a la fecha de fin.");
    }
    await repo.savePromotion(p);
    return p;
  }, true);
}

export async function deletePromotionAction(promotionId: string) {
  return mutate(() => repo.deletePromotion(id.parse(promotionId)), true);
}

// ---------- Hero ----------

export async function saveHeroAction(input: HeroSettings) {
  return mutate(async () => {
    const hero = heroSchema.parse(input);
    await repo.saveHero(hero);
    return hero;
  }, true);
}
