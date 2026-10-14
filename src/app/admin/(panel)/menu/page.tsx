import { MenuEditor } from "@/components/admin/menu-editor";
import { loadContent } from "@/lib/content/repository";

export default async function MenuAdminPage() {
  const { categories, items } = await loadContent();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold">Menú y precios</h1>
        <p className="text-muted-foreground">
          Los precios se guardan al salir del campo. Para textos, fotos y más opciones usa el lápiz.
        </p>
      </div>
      <MenuEditor initialCategories={categories} initialItems={items} />
    </div>
  );
}
