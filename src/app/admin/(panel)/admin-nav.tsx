"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin/banner", label: "Banner" },
  { href: "/admin/menu", label: "Menú" },
  { href: "/admin/promociones", label: "Promociones" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex min-w-0 items-center gap-1 overflow-x-auto">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "shrink-0 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-muted sm:px-3",
            pathname.startsWith(link.href) ? "bg-primary/15 text-primary" : "text-muted-foreground",
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
