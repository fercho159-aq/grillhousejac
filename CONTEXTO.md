# Grill House Jac — Contexto del proyecto

> Documento para personas y para otras IA que trabajen en este proyecto.
> Léelo completo antes de tocar código. Actualízalo cuando algo cambie.

## Qué es

**Grill House Jac** es un restaurante tipo parrilla / steakhouse texano.
Es un **proyecto hermano de BarJac** (`../barjac`, repo `github.com/fercho159-aq/BarJac`),
del mismo cliente y hecho por **Maw Soluciones**.

- Lema: **"Sabor que se siente"**
- Concepto visual del logo: cráneo de toro longhorn dorado (con un mapa de Texas y cortes
  de carne grabados: brisket, sirloin, ribs), "GRILL HOUSE" en letra slab, "JAC" en letra
  cursiva negra con borde dorado, un trazo dorado con estrella y un aro dorado alrededor.
- Logo original: [`marca/logo-grillhousejac-original.jpeg`](marca/logo-grillhousejac-original.jpeg)
  (JPG 1080×1080 con fondo blanco; todavía no hay PNG transparente ni versión vectorial).

## Qué pidió el cliente (13 oct 2026)

Lo pidió Carla (Maw Soluciones) por WhatsApp:

1. **Dominio `grillhousejac.com.mx`.** Se eligió este en lugar de `.com`. Ya lo compró Alex
   (14 oct 2026); falta conectarlo a Vercel.
2. **Hacer una página "como la de BarJac"**, con menú y todo lo demás.
3. **El menú puede estar vacío al inicio.** No inventar platillos ni precios. El 16 oct 2026 llegó
   el menú real (`Menú Grill House jac.xlsx`): está en `src/lib/content/seed.ts` y se carga solo en
   la base si el menú está vacío (`importMenuIfEmpty` en `src/lib/db.ts`). Después se edita en el panel.
4. Que la página se parezca a los colores del logo.
5. En Google Maps el lugar todavía se llama "La Tanga de Luiggi" y hay que cambiarle el
   nombre a "Grill House Jac". Eso se hace desde el Perfil de Negocio de Google del dueño,
   **no se arregla con código**.

## Datos del negocio

| Dato | Valor |
|---|---|
| Nombre | Grill House Jac |
| Dominio | `grillhousejac.com.mx` (comprado; falta conectarlo a Vercel) |
| Repo | https://github.com/fercho159-aq/grillhousejac |
| Facebook | https://www.facebook.com/profile.php?id=61595077393536 |
| Instagram | https://www.instagram.com/parrillajac/ (@parrillajac) |
| Ubicación (Maps) | Ficha nueva de Grill House Jac: https://share.google/hSqN2FAPnpTB72JM1 (la vieja, "La Tanga de Luiggi", era https://maps.app.goo.gl/CGaBcqYQiGLLJz7Q6) — coordenadas 19.4766019, -99.084934 |
| Dirección | Puerto San José del Cabo 58, Col. Casas Alemán, Gustavo A. Madero, 07580, CDMX |
| Teléfono / WhatsApp | **Pendiente** |
| Horario | **Pendiente** |
| TikTok | https://www.tiktok.com/@parrillajac (@parrillajac) |

No inventes datos de contacto. Todos se editan en **`src/lib/site-config.ts`**. Por decisión de
Alex, los botones de contacto (WhatsApp, Llamar) **se muestran siempre**, aunque falte el
dato: mientras esté vacío, el botón lleva a la sección `#contacto`. En cuanto llegue el dato, se
llena ahí y todo el sitio (botones, `/links`, pie de página y datos para Google) se actualiza solo.

## Relación con BarJac (cómo reutilizar)

BarJac ya tiene resuelto casi todo lo que necesita este sitio. La idea es **copiar su base y
cambiarle la marca**, no empezar de cero.

Stack de BarJac (`../barjac`):
- Next.js 15 (App Router) + React 18 + Tailwind 3 + componentes shadcn/ui
- Contenido en Neon Postgres (`@neondatabase/serverless`). En local, sin `DATABASE_URL`,
  usa PGlite embebido y lo llena con `src/lib/content/seed.ts`.
- Panel admin en `/admin`, protegido con `ADMIN_PASSWORD`, para editar banner, menú
  (categorías y platillos) y promociones (por días y fechas, hora de CDMX).
- Sitio público: `src/app/page.tsx` (server) → `src/app/home-client.tsx` (client).
- Página de enlaces tipo Linktree en `/links` y QR imprimible en `/qr`.
- Se despliega en Vercel desde `main`.

Lecciones de BarJac que conviene no repetir:
- `next.config.mjs` tiene `typescript.ignoreBuildErrors: true`. Por eso un import faltante
  (`UtensilsCrossed`) pasó el build y tumbó el sitio en producción. **Aquí no lo desactives**:
  deja que el build falle si hay errores de tipos.
- Las imágenes que vienen del admin pueden ser cualquier URL o `/api/images/...`. Usa `<img>`
  en lugar de `next/image`, o configura bien `remotePatterns`.
- Las promos y el menú deben salir del panel, no escritos a mano en el código.

## Identidad visual

La paleta, la tipografía y las reglas de uso están en [`marca/PALETA.md`](marca/PALETA.md).

## Cómo está armado este proyecto

Se copió la base de BarJac (commit `960e49c`) y se le cambió la marca:

- `src/lib/site-config.ts`: nombre, lema, dominio, redes, ubicación y datos pendientes.
- `src/app/home-client.tsx`: página principal (escrita desde cero, solo en español): banner,
  Nosotros, Menú, Promociones (solo si hay activas hoy), Ubicación con mapa, Contacto y pie.
- `src/components/site/contact-links.ts`: los botones de contacto, compartidos por la página
  principal y `/links`.
- `src/components/site/hero.tsx`: banner editable desde el admin, con el logo circular.
- `src/lib/content/seed.ts`: contenido inicial. **Menú y promociones vacíos**; el menú muestra
  "Estamos afinando la parrilla" hasta que se agregue el primer platillo desde `/admin/menu`.
- Panel admin igual al de BarJac (`/admin`, contraseña en `ADMIN_PASSWORD`).
- `/links` (tipo Linktree) y `/qr` (tarjeta imprimible). El QR apunta a `grillhousejac.com.mx/contacto`,
  que redirige a la sección `#contacto` de la página principal (redirect en `next.config.mjs`).
  Archivos impresos del QR: `marca/qr/`.
- Logos: `marca/logo-grillhousejac-circulo.png` (recorte circular sin fondo), y en el sitio
  `public/images/logo-grillhousejac.{webp,png}`, `src/app/icon.png`, `apple-icon.png`,
  `favicon.ico` y `opengraph-image.jpg` (imagen al compartir en redes).
- Fotos de banner y "Nosotros": de Unsplash, provisionales hasta tener fotos reales.
- Servidor local: `npm run dev` (puerto 9003). Sin `DATABASE_URL` usa una base local en `.data/`.

SEO:
- Título, descripción, canonical, Open Graph y Twitter en `src/app/layout.tsx`.
- Datos estructurados `Restaurant` (schema.org) en `src/lib/structured-data.ts`. Incluyen el menú
  con precios cuando hay platillos, y teléfono y dirección cuando se llenan en `site-config.ts`.
- `sitemap.xml`, `robots.txt` (bloquea `/admin`, `/api` y `/qr`) y `manifest.webmanifest`.
- `<html lang="es-MX">`, un solo `h1`, fuentes con `next/font` (sin bloquear la carga).
- El build **sí falla** con errores de TypeScript (no se copió `ignoreBuildErrors`).

## Estado

- [x] Carpeta del proyecto, logo y contexto (14 oct 2026)
- [x] Paleta aprobada (14 oct 2026)
- [x] Dominio `grillhousejac.com.mx` comprado
- [x] Logo circular, favicon e imagen para redes
- [x] Proyecto creado a partir de BarJac, con la marca cambiada y SEO
- [x] Subido a GitHub
- [ ] Deploy en Vercel: crear el proyecto, conectar Neon (`DATABASE_URL`), definir `ADMIN_PASSWORD`
- [ ] Conectar el dominio `grillhousejac.com.mx` en Vercel
- [x] Dirección y ficha de Google (16 oct 2026)
- [x] TikTok (16 oct 2026)
- [ ] Datos pendientes: teléfono/WhatsApp y horario
- [ ] Cambiar en Google Maps el nombre "La Tanga de Luiggi" a "Grill House Jac" (lo hace el dueño)
- [x] Menú real (16 oct 2026), con "Preparado de chelada +$10" en Cervezas
- [ ] Fotos reales de platillos
- [ ] Logo en mejor calidad (PNG sin fondo o vector) si el diseñador lo tiene
