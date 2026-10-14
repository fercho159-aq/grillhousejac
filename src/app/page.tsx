import { getSiteContent } from "@/lib/content/repository";
import { isActiveOn, mexicoToday } from "@/lib/content/schedule";
import { restaurantJsonLd } from "@/lib/structured-data";
import HomeClient from "./home-client";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getSiteContent();
  // Only promotions published in the admin panel and active today (Mexico City time).
  const today = mexicoToday();
  const promotions = content.promotions
    .filter((p) => isActiveOn(p, today))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const jsonLd = JSON.stringify(restaurantJsonLd(content)).replace(/</g, "\u003c");
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <HomeClient content={{ ...content, promotions }} />
    </>
  );
}
