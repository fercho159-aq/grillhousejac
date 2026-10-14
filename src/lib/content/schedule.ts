import type { Lang, Promotion } from "./types";

export const TIME_ZONE = "America/Mexico_City";

export const DAY_NAMES: Record<Lang, string[]> = {
  es: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
};

export const DAY_SHORT: Record<Lang, string[]> = {
  es: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

/** Today's date (YYYY-MM-DD) and weekday in Mexico City. */
export function mexicoToday(now = new Date()): { date: string; weekday: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  const date = `${get("year")}-${get("month")}-${get("day")}`;
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  return { date, weekday };
}

export const isAlwaysOn = (p: Promotion) => p.days.length === 0 && !p.startDate && !p.endDate;

export function isActiveOn(p: Promotion, today: { date: string; weekday: number }) {
  if (!p.visible) return false;
  if (p.startDate && today.date < p.startDate) return false;
  if (p.endDate && today.date > p.endDate) return false;
  if (p.days.length > 0 && !p.days.includes(today.weekday)) return false;
  return true;
}

export type PromoStatus = "active" | "not-today" | "upcoming" | "expired" | "hidden";

export function promoStatus(p: Promotion, today = mexicoToday()): PromoStatus {
  if (!p.visible) return "hidden";
  if (p.endDate && today.date > p.endDate) return "expired";
  if (p.startDate && today.date < p.startDate) return "upcoming";
  return isActiveOn(p, today) ? "active" : "not-today";
}

const sameSet = (a: number[], b: number[]) => a.length === b.length && b.every((d) => a.includes(d));

export function describeDays(days: number[], lang: Lang): string {
  const es = lang === "es";
  if (days.length === 0 || days.length === 7) return es ? "Todos los días" : "Every day";
  if (sameSet(days, [1, 2, 3, 4, 5])) return es ? "Lunes a viernes" : "Monday to Friday";
  if (sameSet(days, [0, 6])) return es ? "Fines de semana" : "Weekends";
  const names = [1, 2, 3, 4, 5, 6, 0].filter((d) => days.includes(d)).map((d) => DAY_NAMES[lang][d]);
  const joiner = es ? " y " : " and ";
  return names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")}${joiner}${names[names.length - 1]}`;
}

export function formatShortDate(date: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === "es" ? "es-MX" : "en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

/** Monday–Sunday of the current Mexico City week. */
export function currentWeekRange(): { start: string; end: string } {
  const { date, weekday } = mexicoToday();
  const base = new Date(`${date}T12:00:00Z`);
  const offset = (weekday + 6) % 7;
  const monday = new Date(base.getTime() - offset * 86400000);
  const sunday = new Date(monday.getTime() + 6 * 86400000);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { start: iso(monday), end: iso(sunday) };
}
