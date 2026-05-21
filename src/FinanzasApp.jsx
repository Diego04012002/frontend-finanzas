import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { LayoutDashboard, List, BarChart3, Target, PiggyBank, Loader2, AlertCircle, LogOut } from "lucide-react";
import { parseExcel } from "./utils/excel";
import { monthKey } from "./utils/format";
import { TRANSLATIONS } from "./i18n";
import { api, formatApiError } from "./api";

import TopBar from "./components/TopBar";
import FileBar from "./components/FileBar";
import Welcome from "./components/Welcome";
import Filters from "./components/Filters";
import KpiCards from "./components/KpiCards";
import MovementsTable from "./components/MovementsTable";
import Budgets from "./components/Budgets";
import Goals from "./components/Goals";
import AuthScreen from "./components/AuthScreen";
import { CategoryPie, TopCategories, MonthlyBars, BalanceLine, CategoryBars } from "./components/Charts";

const LS_LANG = "finanzas:lang";

export default function FinanzasApp() {
  const [authState, setAuthState] = useState("checking"); // checking | unauth | auth
  const [user, setUser] = useState(null);

  const [lang, setLangRaw] = useState(() => localStorage.getItem(LS_LANG) || "es");
  const [currency, setCurrency] = useState("EUR");

  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [tab, setTab] = useState("dashboard");
  const [filters, setFilters] = useState({ desde: "", hasta: "", tipo: "todos", categoria: "todas", busqueda: "" });
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);

  const fileInputRef = useRef(null);
  const dropRef = useRef(null);
  const syncedOnce = useRef(false);

  const t = TRANSLATIONS[lang];
  const setLang = (l) => { setLangRaw(l); localStorage.setItem(LS_LANG, l); };

  // Bootstrap session
  useEffect(() => {
    (async () => {
      try {
        const res = await api.me();
        setUser(res.data);
        setAuthState("auth");
      } catch {
        setAuthState("unauth");
      }
    })();
  }, []);

  // Load user data after auth
  useEffect(() => {
    if (authState !== "auth") return;
    (async () => {
      try {
        const { data } = await api.getData();
        setFiles(data.files || []);
        setBudgets(data.budgets || []);
        setGoals(data.goals || []);
        const s = data.settings || {};
        if (s.lang) setLangRaw(s.lang);
        if (s.currency) setCurrency(s.currency);
        if (s.activeFile) setActiveFile(s.activeFile);
        else if ((data.files || []).length) setActiveFile(data.files[0].name);
        syncedOnce.current = true;
      } catch (e) {
        console.warn("data load failed", e);
      }
    })();
  }, [authState]);

  // Sync settings
  useEffect(() => {
    if (!syncedOnce.current || authState !== "auth") return;
    api.putSettings({ lang, currency, activeFile }).catch(() => {});
  }, [lang, currency, activeFile, authState]);

  // Sync budgets
  useEffect(() => {
    if (!syncedOnce.current || authState !== "auth") return;
    api.putBudgets(budgets).catch(() => {});
  }, [budgets, authState]);

  // Sync goals
  useEffect(() => {
    if (!syncedOnce.current || authState !== "auth") return;
    api.putGoals(goals).catch(() => {});
  }, [goals, authState]);

  // Sync files
  useEffect(() => {
    if (!syncedOnce.current || authState !== "auth") return;
    api.putFiles(files).catch(() => {});
  }, [files, authState]);

  // Ensure activeFile valid
  useEffect(() => {
    if (files.length && !files.find(f => f.name === activeFile)) setActiveFile(files[0].name);
    if (!files.length && activeFile) setActiveFile(null);
  }, [files, activeFile]);

  const datos = useMemo(() => {
    if (!activeFile) return [];
    const f = files.find(x => x.name === activeFile);
    return f ? f.rows : [];
  }, [files, activeFile]);

  const filtered = useMemo(() => {
    return datos.filter(r => {
      const fechaR = new Date(r.fecha);
      if (filters.desde && fechaR < new Date(filters.desde)) return false;
      if (filters.hasta && fechaR > new Date(filters.hasta + "T23:59:59")) return false;
      if (filters.tipo !== "todos" && r.tipo !== filters.tipo) return false;
      if (filters.categoria !== "todas" && r.categoria !== filters.categoria) return false;
      if (filters.busqueda) {
        const q = filters.busqueda.toLowerCase();
        if (!r.descripcion.toLowerCase().includes(q)
          && !(r.subcategoria || "").toLowerCase().includes(q)
          && !(r.categoria || "").toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [datos, filters]);

  const totalIngresos = useMemo(() => filtered.filter(r => r.tipo === "ingreso").reduce((s, r) => s + r.importe, 0), [filtered]);
  const totalGastos = useMemo(() => filtered.filter(r => r.tipo === "gasto").reduce((s, r) => s + Math.abs(r.importe), 0), [filtered]);
  const balance = totalIngresos - totalGastos;

  const daysInRange = useMemo(() => {
    if (!filtered.length) return 0;
    const dates = filtered.map(r => new Date(r.fecha).getTime());
    return Math.max(1, Math.ceil((Math.max(...dates) - Math.min(...dates)) / 86400000));
  }, [filtered]);

  const categorias = useMemo(() => [...new Set(datos.map(r => r.categoria))].sort(), [datos]);

  const byCategoria = useMemo(() => {
    const map = {};
    filtered.filter(r => r.tipo === "gasto").forEach(r => {
      map[r.categoria] = (map[r.categoria] || 0) + Math.abs(r.importe);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  const byMonth = useMemo(() => {
    const map = {};
    filtered.forEach(r => {
      const key = monthKey(new Date(r.fecha));
      if (!map[key]) map[key] = { mes: key, ingresos: 0, gastos: 0 };
      if (r.tipo === "ingreso") map[key].ingresos += r.importe;
      else map[key].gastos += Math.abs(r.importe);
    });
    return Object.values(map).sort((a, b) => a.mes.localeCompare(b.mes)).map(m => ({
      ...m,
      ingresos: parseFloat(m.ingresos.toFixed(2)),
      gastos: parseFloat(m.gastos.toFixed(2)),
    }));
  }, [filtered]);

  const evolucionSaldo = useMemo(() => {
    if (!datos.length) return [];
    const sorted = [...datos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    return sorted.map(r => ({
      fecha: new Date(r.fecha).toLocaleDateString(lang === "en" ? "en-US" : "es-ES", { day: "2-digit", month: "2-digit" }),
      saldo: r.saldo,
    }));
  }, [datos, lang]);

  const currentMonthExpensesByCat = useMemo(() => {
    const key = monthKey(new Date());
    const map = {};
    datos.filter(r => r.tipo === "gasto" && monthKey(new Date(r.fecha)) === key).forEach(r => {
      map[r.categoria] = (map[r.categoria] || 0) + Math.abs(r.importe);
    });
    return map;
  }, [datos]);

  const handleFiles = useCallback(async (newFiles) => {
    setLoading(true);
    setError(null);
    const additions = [];
    for (const f of newFiles) {
      if (files.find(x => x.name === f.name)) continue;
      try {
        const { rows, autoCount } = await parseExcel(f);
        additions.push({ name: f.name, rows, autoCount });
      } catch (e) {
        setError(`Error: "${f.name}" — ${e.message}`);
      }
    }
    if (additions.length) {
      setFiles(prev => [...prev, ...additions]);
      setActiveFile(additions[additions.length - 1].name);
    }
    setLoading(false);
  }, [files]);

  const removeFile = (name) => setFiles(prev => prev.filter(f => f.name !== name));

  const handleClearAll = async () => {
    try { await api.clearData(); } catch {}
    setFiles([]); setActiveFile(null); setBudgets([]); setGoals([]);
  };

  const handleLogout = async () => {
    try { await api.logout(); } catch {}
    localStorage.removeItem("finanzas:token");   // ← línea añadida
    syncedOnce.current = false;
    setUser(null);
    setFiles([]); setActiveFile(null); setBudgets([]); setGoals([]);
    setAuthState("unauth");
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    dropRef.current?.classList.remove("drag-over");
    const list = [...e.dataTransfer.files].filter(f => f.name.match(/\.(xls|xlsx)$/i));
    if (list.length) handleFiles(list);
  }, [handleFiles]);

  // Auth screen
  if (authState === "checking") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "var(--text-soft)" }}>
        <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> Cargando...
      </div>
    );
  }
  if (authState === "unauth") {
    return <AuthScreen lang={lang} setLang={setLang} onAuth={(u) => { setUser(u); setAuthState("auth"); }} />;
  }

  const hasData = files.length > 0;
  const summary = { ingresos: totalIngresos, gastos: totalGastos, balance };

  const TABS = [
    { key: "dashboard", label: t.tabDashboard, icon: LayoutDashboard },
    { key: "movements", label: t.tabMovements, icon: List },
    { key: "charts", label: t.tabCharts, icon: BarChart3 },
    { key: "budgets", label: t.tabBudgets, icon: Target },
    { key: "goals", label: t.tabGoals, icon: PiggyBank },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px 40px" }}>
      <TopBar
        lang={lang} setLang={setLang} currency={currency} setCurrency={setCurrency}
        onClearAll={handleClearAll} hasData={hasData}
        user={user} onLogout={handleLogout}
      />

      <input ref={fileInputRef} type="file" accept=".xls,.xlsx" multiple
        onChange={(e) => { handleFiles([...e.target.files]); e.target.value = ""; }}
        style={{ display: "none" }} data-testid="file-input" />

      {hasData && (
        <FileBar files={files} activeFile={activeFile} setActiveFile={setActiveFile} onRemove={removeFile} lang={lang} fileInputRef={fileInputRef} />
      )}

      {!hasData ? (
        <div ref={dropRef}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); dropRef.current?.classList.add("drag-over"); }}
          onDragLeave={() => dropRef.current?.classList.remove("drag-over")}>
          <Welcome lang={lang} onPickFile={() => fileInputRef.current?.click()} />
        </div>
      ) : (
        <>
          {loading && (
            <div className="card" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> {t.loading}
            </div>
          )}
          {error && (
            <div className="card" style={{ background: "var(--danger-soft)", borderColor: "var(--danger)", color: "var(--danger)", marginBottom: 16, display: "flex", gap: 10, alignItems: "center" }}>
              <AlertCircle size={18} /> {String(error)}
            </div>
          )}

          <div className="tabs" style={{ marginBottom: 20 }} data-testid="view-tabs">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button key={key} className={"tab" + (tab === key ? " active" : "")} onClick={() => setTab(key)} data-testid={`tab-${key}`}>
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          {tab !== "budgets" && tab !== "goals" && (
            <Filters filters={filters} setFilters={setFilters} categorias={categorias} lang={lang} />
          )}

          {tab !== "budgets" && tab !== "goals" && (
            <KpiCards ingresos={totalIngresos} gastos={totalGastos} balance={balance} count={filtered.length} days={daysInRange} lang={lang} currency={currency} />
          )}

          {tab === "dashboard" && (
            <div className="fade-in">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14, marginBottom: 14 }}>
                <CategoryPie data={byCategoria} lang={lang} currency={currency} />
                <TopCategories data={byCategoria} totalGastos={totalGastos} lang={lang} currency={currency} />
              </div>
              {byMonth.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <MonthlyBars data={byMonth} lang={lang} currency={currency} />
                </div>
              )}
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{t.recentMovements}</h3>
                  <button className="btn btn-ghost btn-sm" onClick={() => setTab("movements")} data-testid="see-all-btn">{t.seeAll} →</button>
                </div>
                <MovementsTable rows={filtered.slice(0, 8)} lang={lang} currency={currency} summary={summary} compact />
              </div>
            </div>
          )}

          {tab === "movements" && (
            <div className="fade-in">
              <MovementsTable rows={filtered} lang={lang} currency={currency} summary={summary} />
            </div>
          )}

          {tab === "charts" && (
            <div className="fade-in" style={{ display: "grid", gap: 14 }}>
              <CategoryBars data={byCategoria} lang={lang} currency={currency} />
              {byMonth.length > 0 && <MonthlyBars data={byMonth} lang={lang} currency={currency} />}
              {evolucionSaldo.length > 1 && <BalanceLine data={evolucionSaldo} lang={lang} currency={currency} />}
              <CategoryPie data={byCategoria} lang={lang} currency={currency} />
            </div>
          )}

          {tab === "budgets" && (
            <div className="fade-in">
              <Budgets
                budgets={budgets} setBudgets={setBudgets}
                allCategories={categorias}
                monthlyExpensesByCat={currentMonthExpensesByCat}
                lang={lang} currency={currency}
              />
            </div>
          )}

          {tab === "goals" && (
            <div className="fade-in">
              <Goals goals={goals} setGoals={setGoals} lang={lang} currency={currency} />
            </div>
          )}
        </>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
