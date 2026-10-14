"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { MenuCategory, MenuItem } from "@/lib/content/types";
import { ImageUpload } from "./image-upload";
import { ColorSelect, LocalizedField } from "./fields";

export type CategoryOption = { id: string; label: string; depth: number };

const ROOT = "__root__";

function CategoryPicker({
  value, onChange, options, allowRoot,
}: { value: string | null; onChange: (id: string | null) => void; options: CategoryOption[]; allowRoot: boolean }) {
  return (
    <Select value={value ?? ROOT} onValueChange={(v) => onChange(v === ROOT ? null : v)}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent className="max-h-80">
        {allowRoot && <SelectItem value={ROOT}>— Categoría principal (pestaña del menú) —</SelectItem>}
        {options.map((o) => (
          <SelectItem key={o.id} value={o.id}>
            <span style={{ paddingLeft: `${o.depth * 14}px` }}>{o.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function CategoryDialog({
  category, open, onOpenChange, onSave, parentOptions,
}: {
  category: MenuCategory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (c: MenuCategory) => Promise<boolean>;
  parentOptions: CategoryOption[];
}) {
  const [draft, setDraft] = useState<MenuCategory | null>(category);
  const [saving, setSaving] = useState(false);
  useEffect(() => setDraft(category), [category]);
  if (!draft) return null;
  const set = (patch: Partial<MenuCategory>) => setDraft({ ...draft, ...patch });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{category?.name.es ? `Editar “${category.name.es}”` : "Nueva categoría"}</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-5"
          onSubmit={async (e) => {
            e.preventDefault();
            setSaving(true);
            const ok = await onSave(draft);
            setSaving(false);
            if (ok) onOpenChange(false);
          }}
        >
          <LocalizedField label="Nombre" required value={draft.name} onChange={(name) => set({ name })} placeholder="Ej. Tacos" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Ubicación</Label>
              <CategoryPicker value={draft.parentId} onChange={(parentId) => set({ parentId })} options={parentOptions} allowRoot />
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <ColorSelect value={draft.color} onChange={(color) => set({ color })} />
            </div>
          </div>
          <LocalizedField
            label="Descripción"
            multiline
            value={draft.description}
            onChange={(description) => set({ description })}
            hint="Texto opcional debajo del título de la categoría."
          />
          <LocalizedField
            label="Aviso de promoción"
            multiline
            value={draft.note}
            onChange={(note) => set({ note })}
            hint="Si lo llenas, aparece un recuadro “¡PROMOCIÓN!” dentro de la categoría."
          />
          <div className="space-y-2">
            <Label>Si tiene subcategorías, mostrarlas como</Label>
            <RadioGroup
              value={draft.childrenDisplay}
              onValueChange={(v) => set({ childrenDisplay: v as MenuCategory["childrenDisplay"] })}
              className="grid gap-2 sm:grid-cols-2"
            >
              {[
                { value: "tabs", label: "Pestañas", hint: "Como Bebidas → Cerveza, Coctelería…" },
                { value: "sections", label: "Secciones una debajo de otra", hint: "Como Desayunos → Huevos, Chilaquiles…" },
              ].map((o) => (
                <label key={o.value} htmlFor={`display-${o.value}`} className="flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm">
                  <RadioGroupItem id={`display-${o.value}`} value={o.value} className="mt-0.5" />
                  <span>
                    <span className="font-medium">{o.label}</span>
                    <span className="block text-xs text-muted-foreground">{o.hint}</span>
                  </span>
                </label>
              ))}
            </RadioGroup>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="cat-visible">Visible en el sitio</Label>
            <Switch id="cat-visible" checked={draft.visible} onCheckedChange={(visible) => set({ visible })} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving || !draft.name.es.trim()}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ItemDialog({
  item, open, onOpenChange, onSave, categoryOptions,
}: {
  item: MenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: MenuItem) => Promise<boolean>;
  categoryOptions: CategoryOption[];
}) {
  const [draft, setDraft] = useState<MenuItem | null>(item);
  const [saving, setSaving] = useState(false);
  useEffect(() => setDraft(item), [item]);
  if (!draft) return null;
  const set = (patch: Partial<MenuItem>) => setDraft({ ...draft, ...patch });
  const setPrice = (index: number, patch: Partial<MenuItem["prices"][number]>) =>
    set({ prices: draft.prices.map((p, i) => (i === index ? { ...p, ...patch } : p)) });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item?.name.es ? `Editar “${item.name.es}”` : "Nuevo producto"}</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-5"
          onSubmit={async (e) => {
            e.preventDefault();
            setSaving(true);
            const ok = await onSave({
              ...draft,
              prices: draft.prices
                .map((p) => ({ ...p, price: p.price.replace(/^\s*\$\s*/, "").trim() }))
                .filter((p) => p.price || p.label.es || p.label.en),
            });
            setSaving(false);
            if (ok) onOpenChange(false);
          }}
        >
          <LocalizedField label="Nombre" required value={draft.name} onChange={(name) => set({ name })} placeholder="Ej. Taco de arrachera" />
          <LocalizedField label="Cantidad / porción" value={draft.quantity} onChange={(quantity) => set({ quantity })} placeholder="Ej. 1 pza - 70 g" />
          <LocalizedField label="Descripción" multiline value={draft.description} onChange={(description) => set({ description })} />

          <div className="space-y-2">
            <Label>Precios</Label>
            <p className="text-xs text-muted-foreground">
              Un solo precio: deja la etiqueta vacía. Varios precios: ponles nombre (ej. Copeo / Botella, Normal / Paquete).
            </p>
            {draft.prices.map((p, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_110px_auto] items-center gap-2">
                <Input placeholder="Etiqueta (ES)" value={p.label.es} onChange={(e) => setPrice(i, { label: { ...p.label, es: e.target.value } })} />
                <Input placeholder="Label (EN)" value={p.label.en} onChange={(e) => setPrice(i, { label: { ...p.label, en: e.target.value } })} />
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input className="pl-6" inputMode="decimal" placeholder="0.00" value={p.price} onChange={(e) => setPrice(i, { price: e.target.value })} />
                </div>
                <Button type="button" size="icon" variant="ghost" onClick={() => set({ prices: draft.prices.filter((_, j) => j !== i) })} aria-label="Quitar precio">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {draft.prices.length < 6 && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => set({ prices: [...draft.prices, { label: { es: "", en: "" }, price: "" }] })}
              >
                <Plus className="mr-1.5 h-4 w-4" /> Agregar precio
              </Button>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Foto del producto (opcional)</Label>
              <ImageUpload value={draft.image} onChange={(image) => set({ image })} maxSize={1200} aspect="aspect-[4/3]" />
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Categoría</Label>
                <CategoryPicker value={draft.categoryId} onChange={(id) => id && set({ categoryId: id })} options={categoryOptions} allowRoot={false} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label htmlFor="item-visible">Visible en el sitio</Label>
                <Switch id="item-visible" checked={draft.visible} onCheckedChange={(visible) => set({ visible })} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving || !draft.name.es.trim()}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
