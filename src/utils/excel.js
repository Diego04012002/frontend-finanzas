import * as XLSX from "xlsx";
import { autoCategorize } from "./autoCategory";

const HEADER_HINTS = {
  fecha: ["F. VALOR", "FECHA", "DATE", "F.OPERACION", "F.VALOR"],
  categoria: ["CATEGORÍA", "CATEGORIA", "CATEGORY"],
  subcategoria: ["SUBCATEGORÍA", "SUBCATEGORIA", "SUBCATEGORY"],
  descripcion: ["DESCRIPCIÓN", "DESCRIPCION", "DESCRIPTION", "CONCEPTO"],
  comentario: ["COMENTARIO", "COMMENT", "NOTES"],
  importe: ["IMPORTE", "AMOUNT", "MONTO"],
  saldo: ["SALDO", "BALANCE"],
};

function findHeaderIndex(headers, hints) {
  for (let i = 0; i < headers.length; i++) {
    const h = headers[i];
    if (!h) continue;
    const hs = h.toString().toUpperCase().trim();
    if (hints.some(hint => hs.includes(hint.toUpperCase()))) return i;
  }
  return -1;
}

function parseDate(value) {
  if (value instanceof Date) return value;
  if (typeof value === "number") {
    const d = XLSX.SSF.parse_date_code(value);
    if (d) return new Date(d.y, d.m - 1, d.d);
  }
  if (typeof value === "string") {
    const parts = value.split(/[/\-]/);
    if (parts.length === 3) {
      const [a, b, c] = parts.map(p => parseInt(p, 10));
      if (a > 1900) return new Date(a, b - 1, c);
      if (c > 1900) return new Date(c, b - 1, a);
    }
    const t = Date.parse(value);
    if (!isNaN(t)) return new Date(t);
  }
  return null;
}

export function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "array", cellDates: true });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        // Find header row
        let headerRowIdx = -1;
        for (let i = 0; i < Math.min(20, raw.length); i++) {
          const r = raw[i];
          if (!r) continue;
          const hasFecha = r.some(c => c && HEADER_HINTS.fecha.some(h => c.toString().toUpperCase().includes(h)));
          const hasImporte = r.some(c => c && HEADER_HINTS.importe.some(h => c.toString().toUpperCase().includes(h)));
          if (hasFecha && hasImporte) { headerRowIdx = i; break; }
        }
        if (headerRowIdx === -1) throw new Error("No valid header found");
        const headers = raw[headerRowIdx];
        const idx = {
          fecha: findHeaderIndex(headers, HEADER_HINTS.fecha),
          categoria: findHeaderIndex(headers, HEADER_HINTS.categoria),
          subcategoria: findHeaderIndex(headers, HEADER_HINTS.subcategoria),
          descripcion: findHeaderIndex(headers, HEADER_HINTS.descripcion),
          importe: findHeaderIndex(headers, HEADER_HINTS.importe),
          saldo: findHeaderIndex(headers, HEADER_HINTS.saldo),
        };
        const rows = [];
        let autoCount = 0;
        for (let i = headerRowIdx + 1; i < raw.length; i++) {
          const r = raw[i];
          if (!r || !r[idx.fecha]) continue;
          const fecha = parseDate(r[idx.fecha]);
          if (!fecha) continue;
          const importeVal = parseFloat(String(r[idx.importe]).replace(",", "."));
          if (isNaN(importeVal)) continue;
          let categoria = (idx.categoria >= 0 ? r[idx.categoria] : "") || "";
          let subcategoria = (idx.subcategoria >= 0 ? r[idx.subcategoria] : "") || "";
          const descripcion = (idx.descripcion >= 0 ? r[idx.descripcion] : "") || "";
          if (!categoria || categoria === "Sin categoría") {
            const auto = autoCategorize(descripcion, importeVal);
            if (auto) {
              categoria = auto.categoria;
              if (!subcategoria) subcategoria = auto.subcategoria;
              autoCount++;
            }
          }
          rows.push({
            id: `${fecha.getTime()}-${i}-${importeVal}`,
            fecha: fecha.toISOString(),
            categoria: categoria || "Sin categoría",
            subcategoria: String(subcategoria || ""),
            descripcion: String(descripcion || "").trim(),
            importe: importeVal,
            saldo: idx.saldo >= 0 ? (parseFloat(r[idx.saldo]) || 0) : 0,
            tipo: importeVal >= 0 ? "ingreso" : "gasto",
          });
        }
        rows.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        resolve({ rows, autoCount });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export function exportToExcel(rows, filename = "movimientos.xlsx") {
  const data = rows.map(r => ({
    Fecha: new Date(r.fecha).toLocaleDateString("es-ES"),
    Categoría: r.categoria,
    Subcategoría: r.subcategoria,
    Descripción: r.descripcion,
    Importe: r.importe,
    Saldo: r.saldo,
    Tipo: r.tipo,
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Movimientos");
  XLSX.writeFile(wb, filename);
}
