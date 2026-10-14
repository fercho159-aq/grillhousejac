import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ExternalLink, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isAdmin } from "@/lib/admin-session";
import { isDbConfigured } from "@/lib/db";
import { logout } from "../actions";
import { AdminNav } from "./admin-nav";

export const metadata: Metadata = { title: "Grill House Jac Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-3 sm:gap-4 sm:px-4">
          <Link href="/admin" className="flex shrink-0 items-center gap-2">
            <Image src="/images/logo-grillhousejac.webp" alt="" width={32} height={32} className="rounded-full" />
            <span className="hidden font-display text-oro sm:inline">Admin</span>
          </Link>
          <AdminNav />
          <div className="ml-auto flex shrink-0 items-center">
            <Button asChild variant="ghost" size="sm">
              <a href="/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Ver sitio</span>
              </a>
            </Button>
            <form action={logout}>
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        {isDbConfigured ? (
          children
        ) : (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
            <h1 className="text-xl font-bold">Falta conectar la base de datos</h1>
            <p className="mt-2 text-muted-foreground">
              Agrega la variable de entorno <code>DATABASE_URL</code> con la cadena de conexión de Neon en Vercel y vuelve a desplegar.
              Mientras tanto el sitio muestra el menú por defecto.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
