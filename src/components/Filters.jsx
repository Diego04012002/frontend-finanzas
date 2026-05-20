import { Search, X } from "lucide-react";
import { TRANSLATIONS } from "../i18n";

export default function Filters({ filters, setFilters, categorias, lang }) {
  const t = TRANSLATIONS[lang];

  const applyPreset = (preset) => {
    const now = new Date();
    let desde, hasta;
    if (preset === "thisMonth") {
      desde = new Date(now.getFullYear(), now.getMonth(), 1);
      hasta = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (preset === "lastMonth") {
      desde = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      hasta = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (preset === "last3Months") {
      desde = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      hasta = now;
    } else if (preset === "thisYear") {
      desde = new Date(now.getFullYear(), 0, 1);
      hasta = new Date(now.getFullYear(), 11, 31);
    }
    setFilters({ ...filters, desde: desde.toISOString().slice(0, 10), hasta: hasta.toISOString().slice(0, 10) });
  };

  const reset = () => setFilters({ desde: "", hasta: "", tipo: "todos", categoria: "todas", busqueda: "" });

  return (
    <div className="card" style={{ marginBottom: 20, padding: 16 }} data-testid="filters-card">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, alignItems: "end" }}>
        <div>
          <label style={{ fontSize: 12, color: "var(--text-soft)", fontWeight: 600, marginBottom: 4, display: "block" }}>{t.from}</label>
          <input type="date" value={filters.desde} onChange={(e) => setFilters({ ...filters, desde: e.target.value })} data-testid="filter-from" />
        </div>
        <div>
          <label style={{ fontSize: 12, color: "var(--text-soft)", fontWeight: 600, marginBottom: 4, display: "block" }}>{t.to}</label>
          <input type="date" value={filters.hasta} onChange={(e) => setFilters({ ...filters, hasta: e.target.value })} data-testid="filter-to" />
        </div>
        <div>
          <label style={{ fontSize: 12, color: "var(--text-soft)", fontWeight: 600, marginBottom: 4, display: "block" }}>{t.type}</label>
          <select value={filters.tipo} onChange={(e) => setFilters({ ...filters, tipo: e.target.value })} data-testid="filter-type">
            <option value="todos">{t.all}</option>
            <option value="ingreso">{t.income}</option>
            <option value="gasto">{t.expense}</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, color: "var(--text-soft)", fontWeight: 600, marginBottom: 4, display: "block" }}>{t.category}</label>
          <select value={filters.categoria} onChange={(e) => setFilters({ ...filters, categoria: e.target.value })} data-testid="filter-category">
            <option value="todas">{t.allFem}</option>
            {categorias.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ position: "relative" }}>
          <label style={{ fontSize: 12, color: "var(--text-soft)", fontWeight: 600, marginBottom: 4, display: "block" }}>{t.search}</label>
          <Search size={14} style={{ position: "absolute", left: 10, top: 32, color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder={t.search}
            value={filters.busqueda}
            onChange={(e) => setFilters({ ...filters, busqueda: e.target.value })}
            style={{ paddingLeft: 30 }}
            data-testid="filter-search"
          />
        </div>
        <button className="btn btn-ghost btn-sm" onClick={reset} data-testid="filter-clear" style={{ justifyContent: "center" }}>
          <X size={14} /> {t.clear}
        </button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
        <span style={{ fontSize: 12, color: "var(--text-soft)", fontWeight: 600, alignSelf: "center" }}>{t.quickFilters}</span>
        {[["thisMonth", t.thisMonth], ["lastMonth", t.lastMonth], ["last3Months", t.last3Months], ["thisYear", t.thisYear]].map(([k, label]) => (
          <button key={k} className="chip" onClick={() => applyPreset(k)} style={{ border: "none", cursor: "pointer" }} data-testid={`preset-${k}`}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
