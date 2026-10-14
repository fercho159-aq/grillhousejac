import { PromotionsEditor } from "@/components/admin/promotions-editor";
import { loadContent } from "@/lib/content/repository";

export default async function PromotionsAdminPage() {
  const { promotions } = await loadContent();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold">Promociones</h1>
      </div>
      <PromotionsEditor initial={promotions} />
    </div>
  );
}
