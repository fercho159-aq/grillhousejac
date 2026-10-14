import Link from "next/link";
import { BadgePercent, Image as ImageIcon, UtensilsCrossed } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loadContent } from "@/lib/content/repository";

export default async function AdminHome() {
  const content = await loadContent();
  const sections = [
    {
      href: "/admin/banner",
      title: "Banner de inicio",
      description: `Imagen única o carrusel, versión para computadora y celular. ${content.hero.slides.length} imagen(es).`,
      Icon: ImageIcon,
    },
    {
      href: "/admin/menu",
      title: "Menú y precios",
      description: `Agrega, edita o elimina productos, precios y fotos. ${content.items.length} productos en ${content.categories.length} categorías.`,
      Icon: UtensilsCrossed,
    },
    {
      href: "/admin/promociones",
      title: "Promociones",
      description: `Crea promociones y elige qué días o semanas se muestran. ${content.promotions.length} promociones.`,
      Icon: BadgePercent,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Hola 👋</h1>
        <p className="text-muted-foreground">¿Qué quieres actualizar hoy? Los cambios se publican en el sitio en cuanto guardas.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {sections.map(({ href, title, description, Icon }) => (
          <Link key={href} href={href} className="group">
            <Card className="h-full transition-colors group-hover:border-primary">
              <CardHeader>
                <Icon className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
