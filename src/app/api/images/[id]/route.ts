import { NextResponse } from "next/server";
import { readImage } from "@/lib/content/repository";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f0-9]{32}$/.test(id)) return new NextResponse("Not found", { status: 404 });

  const image = await readImage(id);
  if (!image) return new NextResponse("Not found", { status: 404 });

  // Image ids are never reused, so responses can be cached forever by browsers and the CDN.
  return new NextResponse(new Uint8Array(image.bytes), {
    headers: {
      "Content-Type": image.mime,
      "Content-Length": String(image.bytes.length),
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
