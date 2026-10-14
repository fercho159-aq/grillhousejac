import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin-session";
import { IMAGE_URL_PREFIX, insertImage } from "@/lib/content/repository";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
// Vercel functions accept request bodies up to 4.5 MB; the admin compresses before uploading.
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host")) {
    return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No se recibió ninguna imagen" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Formato no permitido. Usa JPG, PNG, WebP, GIF o AVIF." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "La imagen pesa más de 4 MB." }, { status: 413 });
  }

  const id = crypto.randomUUID().replace(/-/g, "");
  await insertImage(id, file.type, Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `${IMAGE_URL_PREFIX}${id}` });
}
