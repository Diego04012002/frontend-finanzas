import { CURRENCIES } from "../i18n";

export function formatMoney(n, currencyCode = "EUR") {
  const c = CURRENCIES[currencyCode] || CURRENCIES.EUR;
  try {
    return new Intl.NumberFormat(c.locale, {
      style: "currency",
      currency: c.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n || 0);
  } catch {
    return `${(n || 0).toFixed(2)} ${c.symbol}`;
  }
}

export function formatMoneyCompact(n, currencyCode = "EUR") {
  const c = CURRENCIES[currencyCode] || CURRENCIES.EUR;
  const abs = Math.abs(n);
  if (abs >= 1000) {
    return `${(n / 1000).toFixed(1)}k${c.symbol}`;
  }
  return `${Math.round(n)}${c.symbol}`;
}

export function formatDate(d, lang = "es") {
  const locale = lang === "en" ? "en-US" : "es-ES";
  if (!(d instanceof Date)) d = new Date(d);
  return d.toLocaleDateString(locale, { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDateLong(d, lang = "es") {
  const locale = lang === "en" ? "en-US" : "es-ES";
  if (!(d instanceof Date)) d = new Date(d);
  return d.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
}

export function monthKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(key, lang = "es") {
  const [y, m] = key.split("-");
  const T = lang === "en"
    ? ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    : ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  return `${T[parseInt(m, 10) - 1]} ${y}`;
}
