import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { checkPassword } from "@/lib/auth";
import { CONTENT_TAG } from "@/lib/content/repository";

/**
 * Fuerza a Next.js a releer el contenido desde la BD. Lo usa el script de carga
 * de imágenes (scripts/upload-menu-images.js) para que las nuevas fotos salgan
 * en el sitio sin esperar a que el admin toque algo.
 *
 * Autenticación: Authorization: Bearer <ADMIN_PASSWORD>.
 */
export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!token || !(await checkPassword(token))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  revalidateTag(CONTENT_TAG);
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
