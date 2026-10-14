"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Monitor, Plus, Save, Smartphone, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Hero } from "@/components/site/hero";
import { saveHeroAction } from "@/app/admin/actions";
import { HERO_HEIGHTS } from "@/lib/content/palette";
import { cn } from "@/lib/utils";
import type { HeroFit, HeroHeight, HeroSettings, HeroSlide } from "@/lib/content/types";
import { ImageUpload } from "./image-upload";
import { LocalizedField, newId, runAction } from "./fields";

const FIT_OPTIONS: { value: HeroFit; label: string; hint: string }[] = [
  { value: "cover", label: "Rellenar", hint: "Cubre todo el banner (puede recortar orillas)" },
  { value: "contain", label: "Completa", hint: "Muestra la imagen entera con fondo difuminado" },
];

function FitPicker({ value, onChange, id }: { value: HeroFit; onChange: (v: HeroFit) => void; id: string }) {
  return (
    <RadioGroup value={value} onValueChange={(v) => onChange(v as HeroFit)} className="gap-1.5">
      {FIT_OPTIONS.map((o) => (
        <label key={o.value} htmlFor={`${id}-${o.value}`} className="flex cursor-pointer items-start gap-2 text-sm">
          <RadioGroupItem id={`${id}-${o.value}`} value={o.value} className="mt-0.5" />
          <span>
            <span className="font-medium">{o.label}</span>
            <span className="block text-xs text-muted-foreground">{o.hint}</span>
          </span>
        </label>
      ))}
    </RadioGroup>
  );
}

function HeightSelect({ value, onChange }: { value: HeroHeight; onChange: (v: HeroHeight) => void }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as HeroHeight)}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>
        {(Object.keys(HERO_HEIGHTS) as HeroHeight[]).map((h) => (
          <SelectItem key={h} value={h}>{HERO_HEIGHTS[h].label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function HeroEditor({ initial }: { initial: HeroSettings }) {
  const [hero, setHero] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const dirty = JSON.stringify(hero) !== JSON.stringify(saved);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update = (patch: Partial<HeroSettings>) => setHero((h) => ({ ...h, ...patch }));
  const updateSlide = (id: string, patch: Partial<HeroSlide>) =>
    setHero((h) => ({ ...h, slides: h.slides.map((s) => (s.id === id ? { ...s, ...patch } : s)) }));
  const moveSlide = (index: number, delta: number) =>
    setHero((h) => {
      const slides = [...h.slides];
      const [s] = slides.splice(index, 1);
      slides.splice(index + delta, 0, s);
      return { ...h, slides };
    });
  const addSlide = () =>
    update({
      slides: [...hero.slides, { id: newId("slide"), desktopImage: null, mobileImage: null, fitDesktop: "cover", fitMobile: "cover", alt: "" }],
    });

  async function save() {
    setSaving(true);
    const result = await runAction(() => saveHeroAction(hero), "Banner guardado. Ya se ve en el sitio.");
    if (result) {
      setHero(result);
      setSaved(result);
    }
    setSaving(false);
  }

  const slidesShown = hero.mode === "carousel" ? hero.slides : hero.slides.slice(0, 1);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Tipo de banner</CardTitle>
            <CardDescription>Una sola imagen fija o varias imágenes que cambian solas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={hero.mode} onValueChange={(v) => update({ mode: v as HeroSettings["mode"] })} className="grid gap-3 sm:grid-cols-2">
              {[
                { value: "single", label: "Imagen única" },
                { value: "carousel", label: "Carrusel de imágenes" },
              ].map((o) => (
                <label
                  key={o.value}
                  htmlFor={`mode-${o.value}`}
                  className={cn("flex cursor-pointer items-center gap-3 rounded-lg border p-3", hero.mode === o.value && "border-primary bg-primary/5")}
                >
                  <RadioGroupItem id={`mode-${o.value}`} value={o.value} />
                  {o.label}
                </label>
              ))}
            </RadioGroup>
            {hero.mode === "carousel" && (
              <div className="flex items-center gap-3">
                <Label htmlFor="interval" className="shrink-0">Cambiar cada</Label>
                <Input
                  id="interval"
                  type="number"
                  min={2}
                  max={60}
                  value={hero.intervalSeconds}
                  onChange={(e) => update({ intervalSeconds: Math.min(60, Math.max(2, Number(e.target.value) || 5)) })}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">segundos</span>
              </div>
            )}
          </CardContent>
        </Card>

        {slidesShown.map((slide, index) => (
          <Card key={slide.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">{hero.mode === "carousel" ? `Imagen ${index + 1}` : "Imagen del banner"}</CardTitle>
              {hero.mode === "carousel" && (
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" disabled={index === 0} onClick={() => moveSlide(index, -1)} aria-label="Subir">
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" disabled={index === hero.slides.length - 1} onClick={() => moveSlide(index, 1)} aria-label="Bajar">
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={hero.slides.length === 1}
                    onClick={() => update({ slides: hero.slides.filter((s) => s.id !== slide.id) })}
                    aria-label="Eliminar"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <Label className="flex items-center gap-2"><Monitor className="h-4 w-4" /> Computadora</Label>
                <p className="text-xs text-muted-foreground">Recomendado horizontal, 1920 × 1080 px.</p>
                <ImageUpload
                  value={slide.desktopImage}
                  onChange={(url) => updateSlide(slide.id, { desktopImage: url })}
                  maxSize={2400}
                  aspect="aspect-video"
                />
                <FitPicker id={`${slide.id}-d`} value={slide.fitDesktop} onChange={(v) => updateSlide(slide.id, { fitDesktop: v })} />
              </div>
              <div className="space-y-3">
                <Label className="flex items-center gap-2"><Smartphone className="h-4 w-4" /> Celular (opcional)</Label>
                <p className="text-xs text-muted-foreground">Recomendado vertical, 1080 × 1920 px. Si no subes una, se usa la de computadora.</p>
                <ImageUpload
                  value={slide.mobileImage}
                  onChange={(url) => updateSlide(slide.id, { mobileImage: url })}
                  maxSize={2000}
                  aspect="aspect-video"
                />
                <FitPicker id={`${slide.id}-m`} value={slide.fitMobile} onChange={(v) => updateSlide(slide.id, { fitMobile: v })} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor={`${slide.id}-alt`}>Descripción de la imagen (para buscadores y accesibilidad)</Label>
                <Input
                  id={`${slide.id}-alt`}
                  value={slide.alt}
                  placeholder="Ej. Cortes a la parrilla"
                  onChange={(e) => updateSlide(slide.id, { alt: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {hero.mode === "carousel" && hero.slides.length < 12 && (
          <Button variant="outline" className="w-full" onClick={addSlide}>
            <Plus className="mr-2 h-4 w-4" /> Agregar imagen al carrusel
          </Button>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Apariencia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-2"><Monitor className="h-4 w-4" /> Altura en computadora</Label>
                <HeightSelect value={hero.heightDesktop} onChange={(v) => update({ heightDesktop: v })} />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-2"><Smartphone className="h-4 w-4" /> Altura en celular</Label>
                <HeightSelect value={hero.heightMobile} onChange={(v) => update({ heightMobile: v })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Oscurecer imagen: {hero.overlay}%</Label>
              <Slider value={[hero.overlay]} min={0} max={90} step={5} onValueChange={([v]) => update({ overlay: v })} />
              <p className="text-xs text-muted-foreground">Oscurecer ayuda a que el logo y el texto se lean mejor. Usa 0% si la imagen ya trae su propio texto.</p>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
              <Label htmlFor="showLogo">Mostrar logo de Grill House Jac encima de la imagen</Label>
              <Switch id="showLogo" checked={hero.showLogo} onCheckedChange={(v) => update({ showLogo: v })} />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
              <Label htmlFor="showButtons">Mostrar botones “Ver Menú / View Menu”</Label>
              <Switch id="showButtons" checked={hero.showButtons} onCheckedChange={(v) => update({ showButtons: v })} />
            </div>
            <LocalizedField
              label="Frase debajo del logo"
              value={hero.tagline}
              onChange={(tagline) => update({ tagline })}
              hint="Déjala vacía para no mostrar texto."
            />
          </CardContent>
        </Card>
      </div>

      <div className="xl:sticky xl:top-20 xl:self-start">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">Vista previa</CardTitle>
            <div className="flex rounded-lg border p-0.5">
              <Button size="sm" variant={device === "desktop" ? "secondary" : "ghost"} onClick={() => setDevice("desktop")}>
                <Monitor className="mr-1.5 h-4 w-4" /> Computadora
              </Button>
              <Button size="sm" variant={device === "mobile" ? "secondary" : "ghost"} onClick={() => setDevice("mobile")}>
                <Smartphone className="mr-1.5 h-4 w-4" /> Celular
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "relative mx-auto overflow-hidden bg-background [container-type:size]",
                device === "desktop"
                  ? "aspect-video w-full rounded-lg border"
                  : "aspect-[9/19] w-[260px] rounded-[2rem] border-[6px] border-neutral-700",
              )}
            >
              <Hero hero={hero} lang="es" device={device} />
              <div className="space-y-2 p-4">
                <div className="mx-auto h-4 w-1/2 rounded bg-muted" />
                <div className="h-16 rounded bg-muted/60" />
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              La vista previa se actualiza al instante. Los cambios se publican al presionar “Guardar”.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="sticky bottom-0 z-20 -mx-4 flex items-center justify-end gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur xl:col-span-2">
        {dirty && <span className="text-sm text-muted-foreground">Tienes cambios sin guardar</span>}
        <Button variant="ghost" disabled={!dirty || saving} onClick={() => setHero(saved)}>Descartar</Button>
        <Button disabled={!dirty || saving} onClick={save} className="font-bold">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Guardar cambios
        </Button>
      </div>
    </div>
  );
}
