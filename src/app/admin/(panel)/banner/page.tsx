import { HeroEditor } from "@/components/admin/hero-editor";
import { loadContent } from "@/lib/content/repository";

export default async function BannerPage() {
  const { hero } = await loadContent();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold">Banner de inicio</h1>
        <p className="text-muted-foreground">La imagen principal que se ve al entrar al sitio.</p>
      </div>
      <HeroEditor initial={hero} />
    </div>
  );
}
