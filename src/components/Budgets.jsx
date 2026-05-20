import { useState } from "react";
import { Plus, Trash2, Target, CheckCircle2, AlertTriangle } from "lucide-react";
import { formatMoney } from "../utils/format";
import { colorForCategory } from "../utils/colors";
import { TRANSLATIONS } from "../i18n";

export default function Budgets({ budgets, setBudgets, allCategories, monthlyExpensesByCat, lang, currency }) {
  const t = TRANSLATIONS[lang];
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ categoria: "", limite: "" });

  const addBudget = () => {
    if (!form.categoria || !form.limite) return;
    const next = budgets.filter(b => b.categoria !== form.categoria);
    next.push({ categoria: form.categoria, limite: parseFloat(form.limite) });
    setBudgets(next);
    setShowModal(false);
    setForm({ categoria: "", limite: "" });
  };

  const remove = (cat) => setBudgets(budgets.filter(b => b.categoria !== cat));

  return (
    <div data-testid="budgets-view">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800 }}>{t.budgetsTitle}</h2>
          <p className="muted" style={{ margin: 0, fontSize: 13 }}>{t.budgetsHint}</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)} data-testid="add-budget-btn">
          <Plus size={15} /> {t.addBudget}
        </button>
      </div>

      {budgets.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <Target size={36} color="var(--text-muted)" style={{ marginBottom: 8 }} />
          <p className="muted" style={{ margin: 0 }}>{t.noBudgets}</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          {budgets.map(b => {
            const spent = monthlyExpensesByCat[b.categoria] || 0;
            const pct = b.limite > 0 ? (spent / b.limite) * 100 : 0;
            const remaining = b.limite - spent;
            const over = remaining < 0;
            const warning = pct >= 80 && !over;
            const color = over ? "var(--danger)" : warning ? "var(--warning)" : colorForCategory(b.categoria);
            return (
              <div key={b.categoria} className="card" data-testid={`budget-${b.categoria}`}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 12, height: 12, borderRadius: 4, background: colorForCategory(b.categoria) }} />
                      <span style={{ fontSize: 15, fontWeight: 700 }}>{b.categoria}</span>
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-danger btn-sm" onClick={() => remove(b.categoria)} style={{ padding: 4 }} data-testid={`del-budget-${b.categoria}`}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color }}>{formatMoney(spent, currency)}</span>
                  <span className="muted" style={{ fontSize: 12 }}>{t.of} {formatMoney(b.limite, currency)}</span>
                </div>
                <div className="progress">
                  <div className="progress-bar" style={{ width: `${Math.min(100, pct)}%`, background: color }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, fontSize: 12 }}>
                  <span style={{ color }}>{pct.toFixed(0)}%</span>
                  <span style={{ color, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {over ? <><AlertTriangle size={12} /> {t.over}: {formatMoney(Math.abs(remaining), currency)}</> :
                      warning ? <><AlertTriangle size={12} /> {formatMoney(remaining, currency)} {t.remaining}</> :
                      <>{formatMoney(remaining, currency)} {t.remaining}</>}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" data-testid="budget-modal">
            <h3 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 700 }}>{t.addBudget}</h3>
            <label style={{ fontSize: 12, color: "var(--text-soft)", fontWeight: 600, marginBottom: 4, display: "block" }}>{t.category}</label>
            <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} style={{ marginBottom: 12 }} data-testid="budget-category-select">
              <option value="">—</option>
              {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <label style={{ fontSize: 12, color: "var(--text-soft)", fontWeight: 600, marginBottom: 4, display: "block" }}>{t.budgetAmount}</label>
            <input type="number" step="0.01" value={form.limite} onChange={(e) => setForm({ ...form, limite: e.target.value })} placeholder="500" data-testid="budget-amount-input" />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>{t.cancel}</button>
              <button className="btn btn-primary btn-sm" onClick={addBudget} data-testid="budget-save-btn">{t.save}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
