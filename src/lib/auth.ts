// Signed admin session cookie. Uses Web Crypto so it also runs in middleware (edge).

export const SESSION_COOKIE = "grillhousejac_admin";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const encoder = new TextEncoder();

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

async function hmac(message: string) {
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const isAuthConfigured = () => Boolean(process.env.ADMIN_PASSWORD);

export async function checkPassword(password: string) {
  if (!isAuthConfigured()) return false;
  // Compare digests so timing does not leak the password length or prefix.
  return safeEqual(await hmac(`pw:${password}`), await hmac(`pw:${process.env.ADMIN_PASSWORD}`));
}

export async function createSessionToken() {
  const expires = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  return `${expires}.${await hmac(`session:${expires}`)}`;
}

export async function verifySessionToken(token: string | undefined) {
  if (!token || !isAuthConfigured()) return false;
  const [expires, sig] = token.split(".");
  if (!expires || !sig || Number(expires) < Date.now() / 1000) return false;
  return safeEqual(sig, await hmac(`session:${expires}`));
}
