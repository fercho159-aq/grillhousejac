"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { PALETTE } from "@/lib/content/palette";
import type { ColorKey, Localized } from "@/lib/content/types";

export const newId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

export async function runAction<T>(
  action: () => Promise<{ ok: true; data: T } | { ok: false; error: string }>,
  successMessage?: string,
): Promise<T | null> {
  try {
    const res = await action();
    if (!res.ok) {
      toast({ variant: "destructive", title: "No se pudo guardar", description: res.error });
      return null;
    }
    if (successMessage) toast({ title: successMessage });
    return res.data;
  } catch (err) {
    toast({
      variant: "destructive",
      title: "Error de conexión",
      description: err instanceof Error ? err.message : "Intenta de nuevo.",
    });
    return null;
  }
}

export function LocalizedField({
  label, value, onChange, multiline = false, required = false, placeholder, hint,
}: {
  label: string;
  value: Localized;
  onChange: (value: Localized) => void;
  multiline?: boolean;
  required?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  const Control = multiline ? Textarea : Input;
  return (
    <div className="space-y-1.5">
      <Label>
        {label} {required && <span className="text-primary">*</span>}
      </Label>
      <div className="grid gap-2 sm:grid-cols-2">
        {(["es", "en"] as const).map((lang) => (
          <div key={lang} className="relative">
            <span className="pointer-events-none absolute right-2 top-2 rounded bg-muted px-1.5 text-[10px] font-bold uppercase text-muted-foreground">
              {lang === "es" ? "Español" : "Inglés"}
            </span>
            <Control
              value={value[lang]}
              placeholder={lang === "es" ? placeholder : "(opcional, usa el español si está vacío)"}
              onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
              className={multiline ? "min-h-[90px] pr-16" : "pr-16"}
            />
          </div>
        ))}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function ColorSelect({ value, onChange }: { value: ColorKey; onChange: (v: ColorKey) => void }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as ColorKey)}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(PALETTE) as ColorKey[]).map((key) => (
          <SelectItem key={key} value={key}>
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full" style={{ background: PALETTE[key].css, boxShadow: `0 0 6px ${PALETTE[key].css}` }} />
              {PALETTE[key].label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
