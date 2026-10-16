import "server-only";
import { neon } from "@neondatabase/serverless";
import { buildSeedContent } from "@/lib/content/seed";

export type Query = { text: string; params?: unknown[] };

type Driver = {
  query: <T = any>(text: string, params?: unknown[]) => Promise<T[]>;
  transaction: (queries: Query[]) => Promise<void>;
};

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

/**
 * Neon when DATABASE_URL is set. In local development without it, an embedded
 * PGlite database under .data/ is used so the admin can be tried without an account.
 */
export const isDbConfigured = Boolean(connectionString) || process.env.NODE_ENV !== "production";

const globalForDb = globalThis as unknown as { __grillhousejacDb?: Promise<Driver> };

async function createDriver(): Promise<Driver> {
  if (connectionString) {
    const sql = neon(connectionString);
    return {
      query: async (text, params = []) => (await sql.query(text, params)) as any[],
      transaction: async (queries) => {
        await sql.transaction(queries.map((q) => sql.query(q.text, q.params ?? [])));
      },
    };
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL no está configurada.");
  }
  const { PGlite } = await import(/* webpackIgnore: true */ "@electric-sql/pglite");
  const { mkdirSync } = await import("node:fs");
  mkdirSync(".data/pglite", { recursive: true });
  const db = new PGlite(".data/pglite");
  await db.waitReady;
  return {
    query: async (text, params = []) => (await db.query<any>(text, params as any[])).rows,
    transaction: async (queries) => {
      await db.transaction(async (tx) => {
        for (const q of queries) await tx.query(q.text, q.params as any[]);
      });
    },
  };
}

const SCHEMA: Query[] = [
  { text: `CREATE TABLE IF NOT EXISTS settings (key text PRIMARY KEY, value jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())` },
  { text: `CREATE TABLE IF NOT EXISTS menu_categories (
      id text PRIMARY KEY,
      parent_id text REFERENCES menu_categories(id) ON DELETE CASCADE,
      sort_order int NOT NULL DEFAULT 0,
      visible boolean NOT NULL DEFAULT true,
      data jsonb NOT NULL)` },
  { text: `CREATE TABLE IF NOT EXISTS menu_items (
      id text PRIMARY KEY,
      category_id text NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
      sort_order int NOT NULL DEFAULT 0,
      visible boolean NOT NULL DEFAULT true,
      data jsonb NOT NULL)` },
  { text: `CREATE TABLE IF NOT EXISTS promotions (
      id text PRIMARY KEY,
      sort_order int NOT NULL DEFAULT 0,
      visible boolean NOT NULL DEFAULT true,
      data jsonb NOT NULL)` },
  { text: `CREATE TABLE IF NOT EXISTS images (
      id text PRIMARY KEY,
      mime text NOT NULL,
      size int NOT NULL,
      data bytea NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now())` },
  { text: `CREATE INDEX IF NOT EXISTS menu_items_category_idx ON menu_items (category_id, sort_order)` },
];

const MENU_IMPORT_KEY = "menu-import-2026-10-16";

/**
 * Loads the client's first menu (seed.ts) into a database that was created while the menu
 * was still empty. It only runs once, and never when the menu already has categories, so
 * nothing captured in the admin panel is overwritten.
 */
async function importMenuIfEmpty(db: Driver) {
  const done = await db.query(`SELECT 1 FROM settings WHERE key = $1`, [MENU_IMPORT_KEY]);
  if (done.length > 0) return;
  const existing = await db.query(`SELECT 1 FROM menu_categories LIMIT 1`);
  const { categories, items } = buildSeedContent();
  await db.transaction([
    ...(existing.length > 0 ? [] : menuInserts(categories, items)),
    { text: `INSERT INTO settings (key, value) VALUES ($1, 'true'::jsonb) ON CONFLICT (key) DO NOTHING`, params: [MENU_IMPORT_KEY] },
  ]);
}

function menuInserts(categories: ReturnType<typeof buildSeedContent>["categories"], items: ReturnType<typeof buildSeedContent>["items"]): Query[] {
  return [
    {
      text: `INSERT INTO menu_categories (id, parent_id, sort_order, visible, data)
             SELECT r.id, r.parent_id, r.sort_order, r.visible, r.data
             FROM jsonb_to_recordset($1::jsonb) AS r(id text, parent_id text, sort_order int, visible boolean, data jsonb)
             ON CONFLICT (id) DO NOTHING`,
      params: [JSON.stringify(categories.map(({ id, parentId, sortOrder, visible, ...data }) => ({
        id, parent_id: parentId, sort_order: sortOrder, visible, data,
      })))],
    },
    {
      text: `INSERT INTO menu_items (id, category_id, sort_order, visible, data)
             SELECT r.id, r.category_id, r.sort_order, r.visible, r.data
             FROM jsonb_to_recordset($1::jsonb) AS r(id text, category_id text, sort_order int, visible boolean, data jsonb)
             ON CONFLICT (id) DO NOTHING`,
      params: [JSON.stringify(items.map(({ id, categoryId, sortOrder, visible, ...data }) => ({
        id, category_id: categoryId, sort_order: sortOrder, visible, data,
      })))],
    },
  ];
}

async function seedIfEmpty(db: Driver) {
  const seeded = await db.query(`SELECT 1 FROM settings WHERE key = 'seeded'`);
  if (seeded.length > 0) return;

  const seed = buildSeedContent();
  const { categories, items, promotions, hero } = seed;
  // Seed ids are deterministic and inserts are idempotent, so concurrent first requests are safe.
  await db.transaction([
    ...menuInserts(categories, items),
    {
      text: `INSERT INTO promotions (id, sort_order, visible, data)
             SELECT r.id, r.sort_order, r.visible, r.data
             FROM jsonb_to_recordset($1::jsonb) AS r(id text, sort_order int, visible boolean, data jsonb)
             ON CONFLICT (id) DO NOTHING`,
      params: [JSON.stringify(promotions.map(({ id, sortOrder, visible, ...data }) => ({
        id, sort_order: sortOrder, visible, data,
      })))],
    },
    { text: `INSERT INTO settings (key, value) VALUES ('hero', $1::jsonb) ON CONFLICT (key) DO NOTHING`, params: [JSON.stringify(hero)] },
    { text: `INSERT INTO settings (key, value) VALUES ('seeded', 'true'::jsonb) ON CONFLICT (key) DO NOTHING` },
  ]);
}

export function getDb(): Promise<Driver> {
  if (!globalForDb.__grillhousejacDb) {
    globalForDb.__grillhousejacDb = (async () => {
      const db = await createDriver();
      await db.transaction(SCHEMA);
      await seedIfEmpty(db);
      await importMenuIfEmpty(db);
      return db;
    })().catch((err) => {
      globalForDb.__grillhousejacDb = undefined;
      throw err;
    });
  }
  return globalForDb.__grillhousejacDb;
}
