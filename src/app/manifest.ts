import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#14110F",
    theme_color: "#14110F",
    lang: "es-MX",
    icons: [{ src: "/icon.png", sizes: "192x192", type: "image/png" }],
  };
}
