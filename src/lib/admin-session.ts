import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export async function isAdmin() {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/** Every admin mutation re-checks the session; middleware alone is not trusted. */
export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("No autorizado. Vuelve a iniciar sesión.");
}
