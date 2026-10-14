"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, CalendarDays, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { deletePromotionAction, reorderAction, savePromotionAction } from "@/app/admin/actions";
import { PROMO_ICONS } from "@/components/site/promo-icons";
import { colorCss } from "@/lib/content/palette";
import {
  currentWeekRange, DAY_SHORT, describeDays, formatShortDate, mexicoToday, promoStatus, type PromoStatus,
} from "@/lib/content/schedule";
import { cn } from "@/lib/utils";
import type { IconKey, Promotion } from "@/lib/content/types";
import { ConfirmButton } from "./confirm-button";
import { ImageUpload } from "./image-upload";
import { ColorSelect, LocalizedField, newId, runAction } from "./fields";

const STATUS: Record<PromoStatus, { label: string; className: string }> = {
  active: { label: "Activa hoy", className: "bg-green-600/20 text-green-400 border-green-600/40" },
  "not-today": { label: "No aplica hoy", className: "bg-muted text-muted-foreground" },
  upcoming: { label: "Programada", className: "bg-blue-600/20 text-blue-400 border-blue-600/40" },
  expired: { label: "Vencida", className: "bg-red-600/20 text-red-400 border-red-600/40" },
  hidden: { label: "Oculta", className: "bg-muted text-muted-foreground" },
};

// Monday-first order for the day picker.
const WEEK = [1, 2, 3, 4, 5, 6, 0];

function scheduleSummary(p: Promotion) {
  const parts = [describeDays(p.days, "es")];
  if (p.startDate && p.endDate) parts.push(`del ${formatShortDate(p.startDate, "es")} al ${formatShortDate(p.endDate, "es")}`);
  else if (p.startDate) parts.push(`desde el ${formatShortDate(p.startDate, "es")}`);
  else if (p.endDate) parts.push(`hasta el ${formatShortDate(p.endDate, "es")}`);
  return parts.join(", ");
}

function PromotionDialog({
  promotion, open, onOpenChange, onSave,
}: {
  promotion: Promotion | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (p: Promotion) => Promise<boolean>;
}) {
  const [draft, setDraft] = useState<Promotion | null>(promotion);
  const [saving, setSaving] = useState(false);
  useEffect(() => setDraft(promotion), [promotion]);
  if (!draft) return null;
  const set = (patch: Partial<Promotion>) => setDraft({ ...draft, ...patch });
  const toggleDay = (d: number) =>
    set({ days: draft.days.includes(d) ? draft.days.filter((x) => x !== d) : [...draft.days, d].sort() });
  const invalidRange = Boolean(draft.startDate && draft.endDate && draft.startDate > draft.endDate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{promotion?.title.es ? `Editar “${promotion.title.es}”` : "Nueva promoción"}</DialogTitle>
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
          <LocalizedField label="Título" required value={draft.title} onChange={(title) => set({ title })} placeholder="Ej. Jueves de alitas 2x1" />
          <LocalizedField label="Descripción" multiline value={draft.description} onChange={(description) => set({ description })} />

          <div className="space-y-3 rounded-lg border p-4">
            <Label className="flex items-center gap-2 text-base"><CalendarDays className="h-4 w-4" /> ¿Cuándo se muestra?</Label>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Días de la semana (si no eliges ninguno, se muestra todos los días)</p>
              <div className="flex flex-wrap gap-1.5">
                {WEEK.map((d) => (
                  <Button
                    key={d}
                    type="button"
                    size="sm"
                    variant={draft.days.includes(d) ? "default" : "outline"}
                    className="w-14"
                    onClick={() => toggleDay(d)}
                  >
                    {DAY_SHORT.es[d]}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <Button type="button" size="sm" variant="ghost" onClick={() => set({ days: [] })}>Todos los días</Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => set({ days: [1, 2, 3, 4, 5] })}>Lunes a viernes</Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => set({ days: [0, 6] })}>Fin de semana</Button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Vigencia (opcional)</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="promo-start" className="text-xs">Desde</Label>
                  <Input id="promo-start" type="date" value={draft.startDate ?? ""} onChange={(e) => set({ startDate: e.target.value || null })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="promo-end" className="text-xs">Hasta</Label>
                  <Input id="promo-end" type="date" value={draft.endDate ?? ""} onChange={(e) => set({ endDate: e.target.value || null })} />
                </div>
              </div>
              {invalidRange && <p className="text-sm text-destructive">La fecha “Desde” debe ser antes de “Hasta”.</p>}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const { start, end } = currentWeekRange();
                    set({ startDate: start, endDate: end });
                  }}
                >
                  Solo esta semana
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const { date } = mexicoToday();
                    set({ startDate: date, endDate: date });
                  }}
                >
                  Solo hoy
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => set({ startDate: null, endDate: null })}>Sin fecha límite</Button>
              </div>
            </div>
            <p className="rounded bg-muted/50 p-2 text-sm">
              Resumen: <strong>{scheduleSummary(draft)}</strong>
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Imagen o flyer (opcional)</Label>
              <ImageUpload value={draft.image} onChange={(image) => set({ image })} maxSize={1600} aspect="aspect-[4/5]" />
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Ícono (se usa si no hay imagen)</Label>
                <Select value={draft.icon} onValueChange={(v) => set({ icon: v as IconKey })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(PROMO_ICONS) as IconKey[]).map((key) => {
                      const { Icon, label } = PROMO_ICONS[key];
                      return (
                        <SelectItem key={key} value={key}>
                          <span className="flex items-center gap-2"><Icon className="h-4 w-4" /> {label}</span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Color</Label>
                <ColorSelect value={draft.color} onChange={(color) => set({ color })} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label htmlFor="promo-visible">Publicada</Label>
                <Switch id="promo-visible" checked={draft.visible} onCheckedChange={(visible) => set({ visible })} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving || !draft.title.es.trim() || invalidRange}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function PromotionsEditor({ initial }: { initial: Promotion[] }) {
  const [promotions, setPromotions] = useState(() => [...initial].sort((a, b) => a.sortOrder - b.sortOrder));
  const [editing, setEditing] = useState<Promotion | null>(null);
  // Status depends on today's date; compute it on the client only to avoid hydration mismatches.
  const [today, setToday] = useState<ReturnType<typeof mexicoToday> | null>(null);
  useEffect(() => setToday(mexicoToday()), []);

  async function save(draft: Promotion) {
    const saved = await runAction(() => savePromotionAction(draft), "Promoción guardada");
    if (!saved) return false;
    setPromotions((list) =>
      list.some((p) => p.id === saved.id) ? list.map((p) => (p.id === saved.id ? saved : p)) : [...list, saved],
    );
    return true;
  }

  async function remove(p: Promotion) {
    const ok = await runAction(() => deletePromotionAction(p.id), "Promoción eliminada");
    if (ok !== null) setPromotions((list) => list.filter((x) => x.id !== p.id));
  }

  async function move(index: number, delta: number) {
    const list = [...promotions];
    const [p] = list.splice(index, 1);
    list.splice(index + delta, 0, p);
    const ordered = list.map((x, i) => ({ ...x, sortOrder: i }));
    setPromotions(ordered);
    await runAction(() => reorderAction("promotions", ordered.map((x) => x.id)));
  }

  function create() {
    setEditing({
      id: newId("promo"),
      sortOrder: promotions.length,
      visible: true,
      title: { es: "", en: "" },
      description: { es: "", en: "" },
      icon: "party",
      color: "yellow",
      image: null,
      days: [],
      startDate: null,
      endDate: null,
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Las promociones se muestran automáticamente según el día y la fecha (hora de Ciudad de México).
        </p>
        <Button onClick={create} className="font-bold">
          <Plus className="mr-1.5 h-4 w-4" /> Nueva promoción
        </Button>
      </div>

      {promotions.length === 0 && (
        <Card><CardContent className="py-10 text-center text-muted-foreground">No hay promociones todavía.</CardContent></Card>
      )}

      <div className="space-y-3">
        {promotions.map((p, index) => {
          const color = colorCss(p.color);
          const { Icon } = PROMO_ICONS[p.icon] ?? PROMO_ICONS.bottle;
          const status = today ? STATUS[promoStatus(p, today)] : null;
          return (
            <Card key={p.id} className={cn(!p.visible && "opacity-60")}>
              <CardContent className="flex flex-wrap items-center gap-4 p-3">
                <div className="flex flex-col">
                  <Button size="icon" variant="ghost" className="h-7 w-7" disabled={index === 0} onClick={() => move(index, -1)} aria-label="Subir">
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" disabled={index === promotions.length - 1} onClick={() => move(index, 1)} aria-label="Bajar">
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(p)}
                  className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2"
                  style={{ borderColor: color, color }}
                >
                  {p.image ? <img src={p.image} alt="" className="h-full w-full object-cover" /> : <Icon className="h-7 w-7" />}
                </button>
                <button type="button" onClick={() => setEditing(p)} className="min-w-[180px] flex-1 text-left">
                  <p className="font-semibold">{p.title.es}</p>
                  <p className="line-clamp-1 text-sm text-muted-foreground">{p.description.es}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" /> {scheduleSummary(p)}
                  </p>
                </button>
                {status && <Badge variant="outline" className={status.className}>{status.label}</Badge>}
                <div className="flex items-center gap-1">
                  <Switch
                    checked={p.visible}
                    onCheckedChange={(visible) => save({ ...p, visible })}
                    aria-label="Publicada"
                  />
                  <Button size="icon" variant="ghost" onClick={() => setEditing(p)} aria-label="Editar">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <ConfirmButton
                    title={`¿Eliminar “${p.title.es}”?`}
                    description="La promoción desaparecerá del sitio. Si solo quieres pausarla, apágala con el interruptor."
                    onConfirm={() => remove(p)}
                  >
                    <Button size="icon" variant="ghost" aria-label="Eliminar">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </ConfirmButton>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <PromotionDialog promotion={editing} open={editing !== null} onOpenChange={(open) => !open && setEditing(null)} onSave={save} />
    </div>
  );
}
