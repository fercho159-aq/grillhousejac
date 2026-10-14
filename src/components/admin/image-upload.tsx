"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const PASSTHROUGH = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/** Resizes to `maxSize` px on the longest side and re-encodes as WebP, keeping the original if it is already smaller. */
async function prepareImage(file: File, maxSize: number): Promise<File> {
  if (file.type === "image/gif") return file; // may be animated
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("No se pudo leer la imagen. Usa un archivo JPG, PNG o WebP.");
  }
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
  if (!blob || blob.type !== "image/webp") {
    const jpeg = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    if (!jpeg) return file;
    return new File([jpeg], "imagen.jpg", { type: "image/jpeg" });
  }
  if (scale === 1 && PASSTHROUGH.has(file.type) && file.size <= blob.size) return file;
  return new File([blob], "imagen.webp", { type: "image/webp" });
}

export function ImageUpload({
  value, onChange, maxSize = 1600, className, emptyLabel = "Subir imagen", aspect = "aspect-video",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  maxSize?: number;
  className?: string;
  emptyLabel?: string;
  aspect?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  async function upload(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", title: "Archivo no válido", description: "Selecciona una imagen." });
      return;
    }
    setBusy(true);
    try {
      const prepared = await prepareImage(file, maxSize);
      if (prepared.size > MAX_UPLOAD_BYTES) throw new Error("La imagen sigue pesando más de 4 MB. Prueba con otra más ligera.");
      const body = new FormData();
      body.append("file", prepared);
      const res = await fetch("/api/images", { method: "POST", body });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "No se pudo subir la imagen.");
      onChange(json.url);
    } catch (err) {
      toast({ variant: "destructive", title: "Error al subir", description: err instanceof Error ? err.message : String(err) });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "relative flex w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed bg-muted/40 transition-colors",
          aspect,
          dragging ? "border-primary bg-primary/10" : "border-border",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          upload(e.dataTransfer.files?.[0]);
        }}
      >
        {value ? (
          <img src={value} alt="" className="absolute inset-0 h-full w-full object-contain" />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center gap-2 p-4 text-sm text-muted-foreground hover:text-foreground"
          >
            <ImagePlus className="h-8 w-8" />
            {emptyLabel}
            <span className="text-xs">o arrastra una imagen aquí</span>
          </button>
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={() => inputRef.current?.click()}>
          <Upload className="mr-1.5 h-4 w-4" />
          {value ? "Cambiar" : "Elegir archivo"}
        </Button>
        {value && (
          <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => onChange(null)}>
            <Trash2 className="mr-1.5 h-4 w-4" />
            Quitar
          </Button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(e) => upload(e.target.files?.[0])}
      />
    </div>
  );
}
