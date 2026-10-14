"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown, ArrowUp, ChevronRight, EyeOff, FolderPlus, ImageIcon, Pencil, Plus, Search, Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  deleteCategoryAction, deleteItemAction, reorderAction, saveCategoryAction, saveItemAction,
} from "@/app/admin/actions";
import { colorCss } from "@/lib/content/palette";
import { cn } from "@/lib/utils";
import type { MenuCategory, MenuItem, Price } from "@/lib/content/types";
import { ConfirmButton } from "./confirm-button";
import { newId, runAction } from "./fields";
import { CategoryDialog, ItemDialog, type CategoryOption } from "./menu-dialogs";

const bySort = <T extends { sortOrder: number }>(a: T, b: T) => a.sortOrder - b.sortOrder;

function normalize(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function MenuEditor({ initialCategories, initialItems }: { initialCategories: MenuCategory[]; initialItems: MenuItem[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [items, setItems] = useState(initialItems);
  const [selectedId, setSelectedId] = useState<string | null>(
    () => initialCategories.filter((c) => !c.parentId).sort(bySort)[0]?.id ?? null,
  );
  const [query, setQuery] = useState("");
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const childrenOf = (parentId: string | null) => categories.filter((c) => c.parentId === parentId).sort(bySort);
  const itemsOf = (categoryId: string) => items.filter((i) => i.categoryId === categoryId).sort(bySort);
  const byId = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const pathOf = (id: string) => {
    const names: string[] = [];
    let current = byId.get(id);
    while (current) {
      names.unshift(current.name.es);
      current = current.parentId ? byId.get(current.parentId) : undefined;
    }
    return names.join(" › ");
  };

  const descendantsOf = (id: string): Set<string> => {
    const out = new Set<string>([id]);
    let added = true;
    while (added) {
      added = false;
      for (const c of categories) {
        if (c.parentId && out.has(c.parentId) && !out.has(c.id)) {
          out.add(c.id);
          added = true;
        }
      }
    }
    return out;
  };

  const flatOptions = (exclude?: Set<string>): CategoryOption[] => {
    const out: CategoryOption[] = [];
    const walk = (parentId: string | null, depth: number) => {
      for (const c of childrenOf(parentId)) {
        if (exclude?.has(c.id)) continue;
        out.push({ id: c.id, label: c.name.es, depth });
        walk(c.id, depth + 1);
      }
    };
    walk(null, 0);
    return out;
  };

  const selected = selectedId ? byId.get(selectedId) ?? null : null;

  // ---------- Categories ----------

  async function saveCategory(draft: MenuCategory) {
    const previous = byId.get(draft.id);
    const toSave =
      previous && previous.parentId !== draft.parentId
        ? { ...draft, sortOrder: childrenOf(draft.parentId).length }
        : draft;
    const saved = await runAction(() => saveCategoryAction(toSave), "Categoría guardada");
    if (!saved) return false;
    setCategories((list) => (previous ? list.map((c) => (c.id === saved.id ? saved : c)) : [...list, saved]));
    if (!previous) setSelectedId(saved.id);
    return true;
  }

  function newCategory(parentId: string | null) {
    const parent = parentId ? byId.get(parentId) : undefined;
    setEditingCategory({
      id: newId("cat"),
      parentId,
      sortOrder: childrenOf(parentId).length,
      visible: true,
      name: { es: "", en: "" },
      description: { es: "", en: "" },
      note: { es: "", en: "" },
      color: parent?.color ?? "yellow",
      childrenDisplay: "tabs",
    });
  }

  async function removeCategory(category: MenuCategory) {
    const ok = await runAction(() => deleteCategoryAction(category.id), "Categoría eliminada");
    if (ok === null) return;
    const removed = descendantsOf(category.id);
    setCategories((list) => list.filter((c) => !removed.has(c.id)));
    setItems((list) => list.filter((i) => !removed.has(i.categoryId)));
    setSelectedId(category.parentId ?? childrenOf(null).find((c) => c.id !== category.id)?.id ?? null);
  }

  async function moveCategory(category: MenuCategory, delta: number) {
    const siblings = childrenOf(category.parentId);
    const index = siblings.findIndex((c) => c.id === category.id);
    const target = index + delta;
    if (target < 0 || target >= siblings.length) return;
    const ordered = [...siblings];
    ordered.splice(index, 1);
    ordered.splice(target, 0, category);
    const orders = new Map(ordered.map((c, i) => [c.id, i]));
    setCategories((list) => list.map((c) => (orders.has(c.id) ? { ...c, sortOrder: orders.get(c.id)! } : c)));
    await runAction(() => reorderAction("categories", ordered.map((c) => c.id)));
  }

  async function toggleCategory(category: MenuCategory, visible: boolean) {
    const saved = await runAction(() => saveCategoryAction({ ...category, visible }), visible ? "Categoría visible" : "Categoría oculta");
    if (saved) setCategories((list) => list.map((c) => (c.id === saved.id ? saved : c)));
  }

  // ---------- Items ----------

  async function saveItem(draft: MenuItem) {
    const previous = items.find((i) => i.id === draft.id);
    // Moved to another category: append at the end of it.
    const toSave =
      previous && previous.categoryId !== draft.categoryId
        ? { ...draft, sortOrder: itemsOf(draft.categoryId).length }
        : draft;
    const saved = await runAction(() => saveItemAction(toSave), "Producto guardado");
    if (!saved) return false;
    setItems((list) => (previous ? list.map((i) => (i.id === saved.id ? saved : i)) : [...list, saved]));
    return true;
  }

  function newItem(categoryId: string) {
    // Reuse the price labels already used in this category (e.g. Copeo / Botella).
    const template = itemsOf(categoryId)[0];
    setEditingItem({
      id: newId("item"),
      categoryId,
      sortOrder: itemsOf(categoryId).length,
      visible: true,
      name: { es: "", en: "" },
      quantity: { es: "", en: "" },
      description: { es: "", en: "" },
      prices: template ? template.prices.map((p) => ({ label: p.label, price: "" })) : [{ label: { es: "", en: "" }, price: "" }],
      image: null,
    });
  }

  async function removeItem(item: MenuItem) {
    const ok = await runAction(() => deleteItemAction(item.id), "Producto eliminado");
    if (ok !== null) setItems((list) => list.filter((i) => i.id !== item.id));
  }

  async function moveItem(item: MenuItem, delta: number) {
    const siblings = itemsOf(item.categoryId);
    const index = siblings.findIndex((i) => i.id === item.id);
    const target = index + delta;
    if (target < 0 || target >= siblings.length) return;
    const ordered = [...siblings];
    ordered.splice(index, 1);
    ordered.splice(target, 0, item);
    const orders = new Map(ordered.map((i, n) => [i.id, n]));
    setItems((list) => list.map((i) => (orders.has(i.id) ? { ...i, sortOrder: orders.get(i.id)! } : i)));
    await runAction(() => reorderAction("items", ordered.map((i) => i.id)));
  }

  async function patchItem(item: MenuItem, patch: Partial<MenuItem>, message: string) {
    const saved = await runAction(() => saveItemAction({ ...item, ...patch }), message);
    if (saved) setItems((list) => list.map((i) => (i.id === saved.id ? saved : i)));
  }

  // ---------- Rendering ----------

  const searchResults = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return null;
    return items
      .filter((i) => normalize(`${i.name.es} ${i.name.en}`).includes(q))
      .sort((a, b) => a.name.es.localeCompare(b.name.es))
      .slice(0, 100);
  }, [items, query]);

  const renderNode = (category: MenuCategory, depth: number): React.ReactNode => {
    const kids = childrenOf(category.id);
    const count = itemsOf(category.id).length;
    return (
      <li key={category.id}>
        <button
          type="button"
          onClick={() => {
            setSelectedId(category.id);
            setQuery("");
          }}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
            selectedId === category.id && !searchResults && "bg-primary/15 font-semibold text-primary",
          )}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
        >
          {kids.length > 0 ? <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" /> : <span className="w-3.5 shrink-0" />}
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: colorCss(category.color) }} />
          <span className={cn("flex-1 truncate", !category.visible && "text-muted-foreground line-through")}>{category.name.es}</span>
          {count > 0 && <span className="text-xs text-muted-foreground">{count}</span>}
        </button>
        {kids.length > 0 && <ul>{kids.map((k) => renderNode(k, depth + 1))}</ul>}
      </li>
    );
  };

  const selectedSiblings = selected ? childrenOf(selected.parentId) : [];
  const selectedIndex = selected ? selectedSiblings.findIndex((c) => c.id === selected.id) : -1;
  const listItems = searchResults ?? (selected ? itemsOf(selected.id) : []);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <Card className="lg:sticky lg:top-20 lg:self-start">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Categorías</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="max-h-[40vh] overflow-y-auto pr-1 lg:max-h-[calc(100vh-16rem)]">
            {childrenOf(null).map((c) => renderNode(c, 0))}
          </ul>
          <Button variant="outline" size="sm" className="w-full" onClick={() => newCategory(null)}>
            <FolderPlus className="mr-2 h-4 w-4" /> Nueva categoría principal
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar un producto en todo el menú para cambiar su precio…"
            className="pl-9"
          />
        </div>

        {!searchResults && selected && (
          <Card>
            <CardContent className="flex flex-wrap items-center gap-3 p-4">
              <span className="h-4 w-4 rounded-full" style={{ background: colorCss(selected.color), boxShadow: `0 0 8px ${colorCss(selected.color)}` }} />
              <div className="min-w-[12rem] flex-1">
                <p className="text-xs text-muted-foreground">{pathOf(selected.id)}</p>
                <h2 className="break-words text-xl font-bold">
                  {selected.name.es}
                  {!selected.visible && <Badge variant="secondary" className="ml-2 align-middle">Oculta</Badge>}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <div className="mr-2 flex items-center gap-2 text-sm">
                  <Switch checked={selected.visible} onCheckedChange={(v) => toggleCategory(selected, v)} aria-label="Visible" />
                  Visible
                </div>
                <Button size="icon" variant="ghost" disabled={selectedIndex <= 0} onClick={() => moveCategory(selected, -1)} aria-label="Mover antes">
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" disabled={selectedIndex === selectedSiblings.length - 1} onClick={() => moveCategory(selected, 1)} aria-label="Mover después">
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingCategory(selected)}>
                  <Pencil className="mr-1.5 h-4 w-4" /> Editar
                </Button>
                <Button size="sm" variant="outline" onClick={() => newCategory(selected.id)}>
                  <FolderPlus className="mr-1.5 h-4 w-4" /> Subcategoría
                </Button>
                <ConfirmButton
                  title={`¿Eliminar “${selected.name.es}”?`}
                  description={`Se borrarán también sus subcategorías y los ${
                    items.filter((i) => descendantsOf(selected.id).has(i.categoryId)).length
                  } productos que contienen. Esta acción no se puede deshacer.`}
                  onConfirm={() => removeCategory(selected)}
                >
                  <Button size="icon" variant="ghost" aria-label="Eliminar categoría">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </ConfirmButton>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg">
              {searchResults ? `Resultados (${searchResults.length})` : `Productos (${listItems.length})`}
            </CardTitle>
            {!searchResults && selected && (
              <Button size="sm" onClick={() => newItem(selected.id)} className="font-bold">
                <Plus className="mr-1.5 h-4 w-4" /> Agregar producto
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            {listItems.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {searchResults
                  ? "No se encontraron productos."
                  : selected && childrenOf(selected.id).length > 0
                    ? "Esta categoría no tiene productos directos. Selecciona una subcategoría a la izquierda."
                    : "Todavía no hay productos en esta categoría."}
              </p>
            )}
            {listItems.map((item, index) => (
              <ItemRow
                key={item.id}
                item={item}
                path={searchResults ? pathOf(item.categoryId) : undefined}
                canMoveUp={!searchResults && index > 0}
                canMoveDown={!searchResults && index < listItems.length - 1}
                onMove={(d) => moveItem(item, d)}
                onEdit={() => setEditingItem(item)}
                onDelete={() => removeItem(item)}
                onToggle={(visible) => patchItem(item, { visible }, visible ? "Producto visible" : "Producto oculto")}
                onPrices={(prices) => patchItem(item, { prices }, "Precio actualizado")}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      <CategoryDialog
        category={editingCategory}
        open={editingCategory !== null}
        onOpenChange={(open) => !open && setEditingCategory(null)}
        onSave={saveCategory}
        parentOptions={flatOptions(editingCategory ? descendantsOf(editingCategory.id) : undefined)}
      />
      <ItemDialog
        item={editingItem}
        open={editingItem !== null}
        onOpenChange={(open) => !open && setEditingItem(null)}
        onSave={saveItem}
        categoryOptions={flatOptions()}
      />
    </div>
  );
}

function ItemRow({
  item, path, canMoveUp, canMoveDown, onMove, onEdit, onDelete, onToggle, onPrices,
}: {
  item: MenuItem;
  path?: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMove: (delta: number) => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (visible: boolean) => void;
  onPrices: (prices: Price[]) => void;
}) {
  const [prices, setPrices] = useState(item.prices.map((p) => p.price));
  const [lastSynced, setLastSynced] = useState(item.prices);
  if (lastSynced !== item.prices) {
    setLastSynced(item.prices);
    setPrices(item.prices.map((p) => p.price));
  }

  const commit = () => {
    const cleaned = prices.map((p) => p.replace(/^\s*\$\s*/, "").trim());
    if (cleaned.every((p, i) => p === item.prices[i]?.price)) return;
    onPrices(item.prices.map((p, i) => ({ ...p, price: cleaned[i] })));
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-3 rounded-lg border bg-muted/20 p-2.5", !item.visible && "opacity-60")}>
      <div className="flex flex-col">
        <Button size="icon" variant="ghost" className="h-6 w-6" disabled={!canMoveUp} onClick={() => onMove(-1)} aria-label="Subir">
          <ArrowUp className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" variant="ghost" className="h-6 w-6" disabled={!canMoveDown} onClick={() => onMove(1)} aria-label="Bajar">
          <ArrowDown className="h-3.5 w-3.5" />
        </Button>
      </div>
      <button type="button" onClick={onEdit} className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
        {item.image ? (
          <img src={item.image} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImageIcon className="m-auto h-5 w-5 text-muted-foreground" />
        )}
      </button>
      <button type="button" onClick={onEdit} className="min-w-[140px] flex-1 text-left">
        {path && <p className="text-xs text-muted-foreground">{path}</p>}
        <p className="font-semibold leading-tight">
          {item.name.es}
          {!item.visible && <EyeOff className="ml-1.5 inline h-3.5 w-3.5 text-muted-foreground" />}
        </p>
        {item.quantity.es && <p className="text-xs text-muted-foreground">{item.quantity.es}</p>}
      </button>
      <div className="flex flex-wrap items-end gap-2">
        {item.prices.map((p, i) => (
          <label key={i} className="flex flex-col text-xs text-muted-foreground">
            {p.label.es || "Precio"}
            <span className="relative">
              <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-sm">$</span>
              <Input
                value={prices[i] ?? ""}
                inputMode="decimal"
                onChange={(e) => setPrices((list) => list.map((v, j) => (j === i ? e.target.value : v)))}
                onBlur={commit}
                onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
                className="h-9 w-24 pl-5 text-sm text-foreground"
              />
            </span>
          </label>
        ))}
      </div>
      <div className="flex items-center gap-1">
        <Switch checked={item.visible} onCheckedChange={onToggle} aria-label="Visible" />
        <Button size="icon" variant="ghost" onClick={onEdit} aria-label="Editar">
          <Pencil className="h-4 w-4" />
        </Button>
        <ConfirmButton
          title={`¿Eliminar “${item.name.es}”?`}
          description="El producto desaparecerá del menú. Esta acción no se puede deshacer."
          onConfirm={onDelete}
        >
          <Button size="icon" variant="ghost" aria-label="Eliminar">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </ConfirmButton>
      </div>
    </div>
  );
}
