// Simple keyword-based auto-categorization
// Used only when categoría is empty / "Sin categoría"

const RULES = [
  { cat: "Alimentación", sub: "Supermercados y alimentación", kw: ["mercadona", "lidl", "carrefour", "alcampo", "dia ", "froiz", "consum", "eroski", "aldi", "hipercor", "supermarket", "grocery", "walmart", "whole foods"] },
  { cat: "Alimentación", sub: "Restaurantes", kw: ["restaurante", "restaurant", "burger", "mcdonald", "kfc", "telepizza", "domino", "starbucks", "bar ", "cafe", "café", "pizza", "sushi", "kebab"] },
  { cat: "Vehículo y transporte", sub: "Gasolina y combustible", kw: ["repsol", "cepsa", "shell", "bp ", "galp", "petronor", "gasolinera", "carbaherma", "gasoline", "fuel"] },
  { cat: "Vehículo y transporte", sub: "Transporte público", kw: ["renfe", "metro", "uber", "cabify", "bolt", "taxi", "bus ", "blablacar", "lyft"] },
  { cat: "Hogar", sub: "Teléfono, TV e internet", kw: ["vodafone", "movistar", "orange", "yoigo", "masmovil", "telefonica", "netflix", "spotify", "hbo", "disney", "amazon prime", "youtube premium"] },
  { cat: "Hogar", sub: "Suministros", kw: ["iberdrola", "endesa", "naturgy", "repsol luz", "aguas", "canal isabel", "electric", "gas natural"] },
  { cat: "Compras", sub: "Electrónica", kw: ["apple.com", "media markt", "pccomponentes", "fnac", "amazon", "aliexpress", "ebay"] },
  { cat: "Compras", sub: "Ropa y complementos", kw: ["zara", "h&m", "pull bear", "bershka", "stradivarius", "mango", "primark", "uniqlo", "nike", "adidas", "decathlon"] },
  { cat: "Ocio y viajes", sub: "Cine, teatro y espectáculos", kw: ["cines", "cinema", "yelmo", "kinepolis", "tamberlick", "teatro"] },
  { cat: "Ocio y viajes", sub: "Viajes", kw: ["booking", "airbnb", "ryanair", "iberia", "vueling", "renfe", "trivago", "expedia"] },
  { cat: "Educación y salud", sub: "Farmacia", kw: ["farmacia", "pharmacy"] },
  { cat: "Educación y salud", sub: "Salud", kw: ["clinica", "hospital", "dentista", "medico", "sanitas", "adeslas", "dkv"] },
  { cat: "Nómina y otras prestaciones", sub: "Nómina", kw: ["nomina", "nómina", "salary", "payroll"] },
  { cat: "Otros ingresos", sub: "Ingreso Bizum", kw: ["bizum recibido", "bizum received"] },
  { cat: "Otros gastos", sub: "Gasto Bizum", kw: ["bizum enviado", "bizum sent"] },
  { cat: "Otros gastos", sub: "Suscripciones", kw: ["suscrip", "membership", "subscription"] },
];

export function autoCategorize(description, amount) {
  if (!description) return null;
  const d = description.toLowerCase();
  for (const rule of RULES) {
    if (rule.kw.some(k => d.includes(k))) {
      return { categoria: rule.cat, subcategoria: rule.sub };
    }
  }
  // Fallback by sign
  if (amount > 0) return { categoria: "Otros ingresos", subcategoria: "Sin clasificar" };
  return { categoria: "Otros gastos", subcategoria: "Sin clasificar" };
}
