// Color palette for categories - warm & friendly
export const CATEGORY_COLORS = {
  "Alimentación": "#FF9F43",
  "Otros gastos": "#A0A4A8",
  "Compras": "#7C5CE6",
  "Vehículo y transporte": "#3DB2FF",
  "Hogar": "#00B894",
  "Ocio y viajes": "#FF6B9D",
  "Educación y salud": "#E84545",
  "Nómina y otras prestaciones": "#1ABC9C",
  "Otros ingresos": "#27AE60",
  "Transferencias recibidas": "#3498DB",
  "Sin categoría": "#B0B0B0",
};

export const CHART_PALETTE = [
  "#FF9F43", "#7C5CE6", "#00B894", "#3DB2FF", "#FF6B9D",
  "#E84545", "#1ABC9C", "#F39C12", "#9B59B6", "#34495E",
  "#16A085", "#E67E22", "#2980B9", "#C0392B", "#27AE60",
];

export function colorForCategory(cat, fallbackIdx = 0) {
  return CATEGORY_COLORS[cat] || CHART_PALETTE[fallbackIdx % CHART_PALETTE.length];
}
