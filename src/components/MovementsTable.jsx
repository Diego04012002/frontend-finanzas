import { useState, useMemo } from "react";
import { ArrowUpDown, FileDown, FileText, CheckSquare, Square } from "lucide-react";
import { formatMoney, formatDate } from "../utils/format";
import { colorForCategory } from "../utils/colors";
import { TRANSLATIONS } from "../i18n";
import { exportToExcel } from "../utils/excel";
import { exportToPDF } from "../utils/pdf";

export default function MovementsTable({ rows, lang, currency, summary, compact = false }) {
  const t = TRANSLATIONS[lang];
  const [sortCol, setSortCol] = useState("fecha");
  const [sortDir, setSortDir] = useState("desc");
  const [selected, setSelected] = useState(new Set());

  const toggleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("desc"); }
  };

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      let av = a[sortCol], bv = b[sortCol];
      if (sortCol === "fecha") { av = new Date(a.fecha).getTime(); bv = new Date(b.fecha).getTime(); }
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  }, [rows, sortCol, sortDir]);

  const allSelected = sorted.length > 0 && sorted.every(r => selected.has(r.id));
  const someSelected = selected.size > 0 && !allSelected;

  const toggleRow = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(sorted.map(r => r.id)));
  };

  const selectedRows = sorted.filter(r => selected.has(r.id));
  const exportRows = selected.size > 0 ? selectedRows : sorted;
  const exportSummary = selected.size > 0
    ? {
        ingresos: selectedRows.filter(r => r.tipo === "ingreso").reduce((s, r) => s + r.importe, 0),
        gastos: selectedRows.filter(r => r.tipo === "gasto").reduce((s, r) => s + Math.abs(r.importe), 0),
        balance: selectedRows.reduce((s, r) => s + r.importe, 0),
      }
    : summary;

  const handleExportExcel = () => exportToExcel(exportRows, `movimientos-${Date.now()}.xlsx`);
  const handleExportPDF = () => exportToPDF({
    filename: `informe-${Date.now()}.pdf`,
    title: t.appTitle,
    summary: exportSummary,
    rows: exportRows,
    lang,
    currency,
  });

  const cols = compact
    ? [["fecha", t.date, 100], ["descripcion", t.description, "auto"], ["importe", t.amount, 120]]
    : [["fecha", t.date, 100], ["categoria", t.category, 160], ["descripcion", t.description, "auto"], ["importe", t.amount, 120], ["saldo", t.balance2, 110]];

  return (
    <div>
      {!compact && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 14, color: "var(--text-soft)", fontWeight: 600 }}>
            {selected.size > 0
              ? <span style={{ color: "var(--primary)" }}>{selected.size} {lang === "en" ? "selected" : "seleccionados"}</span>
              : `${rows.length} ${t.transactions}`}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {selected.size > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(new Set())} data-testid="clear-selection-btn">
                {lang === "en" ? "Clear selection" : "Quitar selección"}
              </button>
            )}
            <button className="btn btn-secondary btn-sm" onClick={handleExportExcel} data-testid="export-excel-btn">
              <FileDown size={14} /> {selected.size > 0 ? (lang === "en" ? "Excel (selection)" : "Excel (selección)") : t.exportExcel}
            </button>
            <button className="btn btn-secondary btn-sm" onClick={handleExportPDF} data-testid="export-pdf-btn">
              <FileText size={14} /> {selected.size > 0 ? (lang === "en" ? "PDF (selection)" : "PDF (selección)") : t.exportPDF}
            </button>
          </div>
        </div>
      )}
      <div className="table-wrap scroll-x" data-testid="movements-table">
        <table className="table">
          <thead>
            <tr>
              {!compact && (
                <th style={{ width: 36 }}>
                  <button
                    onClick={toggleAll}
                    style={{ background: "transparent", border: "none", padding: 2, color: someSelected || allSelected ? "var(--primary)" : "var(--text-muted)", cursor: "pointer", display: "flex" }}
                    data-testid="select-all-btn"
                    title={lang === "en" ? "Select all" : "Seleccionar todo"}
                  >
                    {allSelected ? <CheckSquare size={17} /> : <Square size={17} />}
                  </button>
                </th>
              )}
              {cols.map(([col, label, w]) => (
                <th
                  key={col}
                  className="sortable"
                  onClick={() => toggleSort(col)}
                  style={{ width: w, textAlign: col === "importe" || col === "saldo" ? "right" : "left" }}
                  data-testid={`th-${col}`}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {label}
                    {sortCol === col && <span>{sortDir === "asc" ? "↑" : "↓"}</span>}
                    {sortCol !== col && <ArrowUpDown size={11} style={{ opacity: 0.3 }} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={cols.length + (compact ? 0 : 1)} style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>{t.noResults}</td></tr>
            ) : sorted.map((r) => {
              const isSel = selected.has(r.id);
              return (
                <tr key={r.id} style={isSel ? { background: "var(--primary-soft)" } : undefined}>
                  {!compact && (
                    <td style={{ width: 36 }}>
                      <button
                        onClick={() => toggleRow(r.id)}
                        style={{ background: "transparent", border: "none", padding: 2, color: isSel ? "var(--primary)" : "var(--text-muted)", cursor: "pointer", display: "flex" }}
                        data-testid={`row-check-${r.id}`}
                      >
                        {isSel ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>
                    </td>
                  )}
                  <td style={{ whiteSpace: "nowrap", color: "var(--text-soft)", fontSize: 13 }}>{formatDate(r.fecha, lang)}</td>
                  {!compact && (
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 3, background: colorForCategory(r.categoria) }} />
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{r.categoria}</span>
                      </span>
                      {r.subcategoria && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{r.subcategoria}</div>}
                    </td>
                  )}
                  <td style={{ fontSize: 13 }}>{r.descripcion}</td>
                  <td className="text-right" style={{ fontWeight: 700, color: r.importe >= 0 ? "var(--success)" : "var(--danger)", whiteSpace: "nowrap" }}>
                    {r.importe >= 0 ? "+" : ""}{formatMoney(r.importe, currency)}
                  </td>
                  {!compact && (
                    <td className="text-right muted" style={{ fontSize: 13, whiteSpace: "nowrap" }}>{formatMoney(r.saldo, currency)}</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
