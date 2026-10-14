import "server-only";
import { unstable_cache } from "next/cache";
import { getDb, isDbConfigured } from "@/lib/db";
import { buildSeedContent, defaultHero } from "./seed";
import type { HeroSettings, MenuCategory, MenuItem, Promotion, SiteContent } from "./types";

export const CONTENT_TAG = "site-content";

type Row = { id: string; sort_order: number; visible: boolean; data: any };

const toCategory = (r: Row & { parent_id: string | null }): MenuCategory => ({
  ...r.data, id: r.id, parentId: r.parent_id, sortOrder: r.sort_order, visible: r.visible,
});
const toItem = (r: Row & { category_id: string }): MenuItem => ({
  ...r.data, id: r.id, categoryId: r.category_id, sortOrder: r.sort_order, visible: r.visible,
});
const toPromotion = (r: Row): Promotion => ({
  ...r.data, id: r.id, sortOrder: r.sort_order, visible: r.visible,
});

export async function loadContent(): Promise<SiteContent> {
  const db = await getDb();
  const [categories, items, promotions, hero] = await Promise.all([
    db.query(`SELECT id, parent_id, sort_order, visible, data FROM menu_categories ORDER BY sort_order, id`),
    db.query(`SELECT id, category_id, sort_order, visible, data FROM menu_items ORDER BY sort_order, id`),
    db.query(`SELECT id, sort_order, visible, data FROM promotions ORDER BY sort_order, id`),
    db.query(`SELECT value FROM settings WHERE key = 'hero'`),
  ]);
  return {
    categories: categories.map(toCategory),
    items: items.map(toItem),
    promotions: promotions.map(toPromotion),
    hero: { ...defaultHero(), ...(hero[0]?.value ?? {}) },
  };
}

const cachedContent = unstable_cache(loadContent, [CONTENT_TAG], { tags: [CONTENT_TAG] });

/** Content for the public site. Falls back to the built-in menu if the database is unavailable. */
export async function getSiteContent(): Promise<SiteContent> {
  if (!isDbConfigured) return buildSeedContent();
  try {
    return await cachedContent();
  } catch (err) {
    console.error("[content] No se pudo leer la base de datos, usando menú por defecto:", err);
    return buildSeedContent();
  }
}

// ---------- Writes ----------

export async function saveCategory(c: MenuCategory) {
  const { id, parentId, sortOrder, visible, ...data } = c;
  const db = await getDb();
  await db.query(
    `INSERT INTO menu_categories (id, parent_id, sort_order, visible, data) VALUES ($1, $2, $3, $4, $5::jsonb)
     ON CONFLICT (id) DO UPDATE SET parent_id = EXCLUDED.parent_id, sort_order = EXCLUDED.sort_order,
       visible = EXCLUDED.visible, data = EXCLUDED.data`,
    [id, parentId, sortOrder, visible, JSON.stringify(data)],
  );
}

export async function deleteCategory(id: string) {
  const db = await getDb();
  await db.query(`DELETE FROM menu_categories WHERE id = $1`, [id]);
}

export async function saveItem(item: MenuItem) {
  const { id, categoryId, sortOrder, visible, ...data } = item;
  const db = await getDb();
  await db.query(
    `INSERT INTO menu_items (id, category_id, sort_order, visible, data) VALUES ($1, $2, $3, $4, $5::jsonb)
     ON CONFLICT (id) DO UPDATE SET category_id = EXCLUDED.category_id, sort_order = EXCLUDED.sort_order,
       visible = EXCLUDED.visible, data = EXCLUDED.data`,
    [id, categoryId, sortOrder, visible, JSON.stringify(data)],
  );
}

export async function deleteItem(id: string) {
  const db = await getDb();
  await db.query(`DELETE FROM menu_items WHERE id = $1`, [id]);
}

export async function savePromotion(p: Promotion) {
  const { id, sortOrder, visible, ...data } = p;
  const db = await getDb();
  await db.query(
    `INSERT INTO promotions (id, sort_order, visible, data) VALUES ($1, $2, $3, $4::jsonb)
     ON CONFLICT (id) DO UPDATE SET sort_order = EXCLUDED.sort_order, visible = EXCLUDED.visible, data = EXCLUDED.data`,
    [id, sortOrder, visible, JSON.stringify(data)],
  );
}

export async function deletePromotion(id: string) {
  const db = await getDb();
  await db.query(`DELETE FROM promotions WHERE id = $1`, [id]);
}

const REORDER_TABLES = {
  categories: "menu_categories",
  items: "menu_items",
  promotions: "promotions",
} as const;

export async function reorder(kind: keyof typeof REORDER_TABLES, orderedIds: string[]) {
  const db = await getDb();
  await db.query(
    `UPDATE ${REORDER_TABLES[kind]} t SET sort_order = r.sort_order
     FROM jsonb_to_recordset($1::jsonb) AS r(id text, sort_order int) WHERE t.id = r.id`,
    [JSON.stringify(orderedIds.map((id, i) => ({ id, sort_order: i })))],
  );
}

export async function saveHero(hero: HeroSettings) {
  const db = await getDb();
  await db.query(
    `INSERT INTO settings (key, value, updated_at) VALUES ('hero', $1::jsonb, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [JSON.stringify(hero)],
  );
}

// ---------- Images ----------

export const IMAGE_URL_PREFIX = "/api/images/";

export async function insertImage(id: string, mime: string, bytes: Buffer) {
  const db = await getDb();
  await db.query(
    `INSERT INTO images (id, mime, size, data) VALUES ($1, $2, $3, decode($4, 'base64'))`,
    [id, mime, bytes.length, bytes.toString("base64")],
  );
}

export async function readImage(id: string): Promise<{ mime: string; bytes: Buffer } | null> {
  const db = await getDb();
  const rows = await db.query<{ mime: string; b64: string }>(
    `SELECT mime, encode(data, 'base64') AS b64 FROM images WHERE id = $1`, [id],
  );
  if (!rows[0]) return null;
  return { mime: rows[0].mime, bytes: Buffer.from(rows[0].b64.replace(/\s/g, ""), "base64") };
}

/** Deletes uploaded images no longer referenced anywhere (kept for 1 hour so unsaved uploads survive). */
export async function deleteOrphanImages() {
  const db = await getDb();
  await db.query(
    `DELETE FROM images i
     WHERE i.created_at < now() - interval '1 hour'
       AND NOT EXISTS (SELECT 1 FROM menu_items m WHERE strpos(m.data::text, i.id) > 0)
       AND NOT EXISTS (SELECT 1 FROM menu_categories c WHERE strpos(c.data::text, i.id) > 0)
       AND NOT EXISTS (SELECT 1 FROM promotions p WHERE strpos(p.data::text, i.id) > 0)
       AND NOT EXISTS (SELECT 1 FROM settings s WHERE strpos(s.value::text, i.id) > 0)`,
  );
}
