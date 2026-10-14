import type { Metadata } from "next";
import Image from "next/image";
import { CONTACT_LINKS, MENU_LINK } from "@/components/site/contact-links";
import { SITE, isExternal } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Enlaces",
  description: `Menú, WhatsApp, redes sociales y ubicación de ${SITE.name}.`,
  alternates: { canonical: "/links" },
};

export default function LinksPage() {
  const links = [MENU_LINK, ...CONTACT_LINKS];
  return (
    <main className="flex min-h-[100svh] flex-col items-center bg-carbon px-4 py-12">
      <div className="mx-auto flex w-full max-w-md flex-col items-center">
        <Image
          src="/images/logo-grillhousejac.webp"
          alt={`Logo de ${SITE.name}`}
          width={128}
          height={128}
          priority
          className="animate-fade-up rounded-full ring-2 ring-oro"
        />
        <h1 className="font-display stagger-1 mt-4 animate-fade-up text-3xl text-hueso">{SITE.name}</h1>
        <p className="font-accent stagger-2 mb-8 mt-2 animate-fade-up text-xs text-oro">{SITE.slogan}</p>

        <nav aria-label="Enlaces" className="w-full space-y-3">
          {links.map(({ label, href, icon: Icon, className }, index) => (
            <a
              key={label}
              href={href}
              target={isExternal(href) ? "_blank" : undefined}
              rel={isExternal(href) ? "noopener noreferrer" : undefined}
              className={cn(
                "flex w-full animate-fade-up items-center gap-4 rounded-2xl px-6 py-4 text-lg font-semibold shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]",
                className,
              )}
              style={{ animationDelay: `${(index + 3) * 80}ms` }}
            >
              <Icon className="h-6 w-6 shrink-0" />
              <span className="flex-1 text-center">{label}</span>
            </a>
          ))}
        </nav>

        <footer className="mt-12 text-center text-xs text-arena/70">
          {SITE.address && <p>{SITE.address}</p>}
          <p>{SITE.locality}</p>
          <p className="mt-2">&copy; {new Date().getFullYear()} {SITE.name}</p>
        </footer>
      </div>
    </main>
  );
}
