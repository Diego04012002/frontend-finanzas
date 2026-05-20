import { useState } from "react";
import { Plus, Trash2, Target, PiggyBank, CheckCircle2, Pencil } from "lucide-react";
import { formatMoney, formatDate } from "../utils/format";
import { TRANSLATIONS } from "../i18n";

export default function Goals({ goals, setGoals, lang, currency }) {
  const t = TRANSLATIONS[lang];
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: "", objetivo: "", ahorrado: "0", fecha: "" });

  const open = (g = null) => {
    if (g) {
      setEditing(g.id);
      setForm({ nombre: g.nombre, objetivo: String(g.objetivo), ahorrado: String(g.ahorrado), fecha: g.fecha || "" });
    } else {
      setEditing(null);
      setForm({ nombre: "", objetivo: "", ahorrado: "0", fecha: "" });
    }
    setShowModal(true);
  };

  const save = () => {
    if (!form.nombre || !form.objetivo) return;
    const data = {
      id: editing || `g-${Date.now()}`,
      nombre: form.nombre,
      objetivo: parseFloat(form.objetivo),
      ahorrado: parseFloat(form.ahorrado || "0"),
      fecha: form.fecha,
    };
    setGoals(editing ? goals.map(g => g.id === editing ? data : g) : [...goals, data]);
    setShowModal(false);
  };

  const remove = (id) => setGoals(goals.filter(g => g.id !== id));

  return (
    <div data-testid="goals-view">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800 }}>{t.goalsTitle}</h2>
          <p className="muted" style={{ margin: 0, fontSize: 13 }}>{t.goalsHint}</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => open()} data-testid="add-goal-btn">
          <Plus size={15} /> {t.addGoal}
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <PiggyBank size={36} color="var(--text-muted)" style={{ marginBottom: 8 }} />
          <p className="muted" style={{ margin: 0 }}>{t.noGoals}</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          {goals.map(g => {
            const pct = g.objetivo > 0 ? (g.ahorrado / g.objetivo) * 100 : 0;
            const done = pct >= 100;
            const days = g.fecha ? Math.max(0, Math.ceil((new Date(g.fecha) - new Date()) / (1000 * 60 * 60 * 24))) : null;
            return (
              <div key={g.id} className="card" data-testid={`goal-${g.id}`}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {done ? <CheckCircle2 size={18} color="var(--success)" /> : <Target size={18} color="var(--primary)" />}
                    <span style={{ fontSize: 16, fontWeight: 700 }}>{g.nombre}</span>
                  </div>
                  <div style={{ display: "flex", gap: 2 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => open(g)} style={{ padding: 4 }} data-testid={`edit-goal-${g.id}`}>
                      <Pencil size={14} />
                    </button>
                    <button className="btn btn-ghost btn-danger btn-sm" onClick={() => remove(g.id)} style={{ padding: 4 }} data-testid={`del-goal-${g.id}`}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: done ? "var(--success)" : "var(--primary)" }}>
                    {formatMoney(g.ahorrado, currency)}
                  </span>
                  <span className="muted" style={{ fontSize: 12 }}>{t.of} {formatMoney(g.objetivo, currency)}</span>
                </div>
                <div className="progress">
                  <div className="progress-bar" style={{ width: `${Math.min(100, pct)}%`, background: done ? "var(--success)" : "linear-gradient(90deg, #FF9F43, #FF6B9D)" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12 }}>
                  <span style={{ fontWeight: 700, color: done ? "var(--success)" : "var(--text-soft)" }}>
                    {done ? t.achieved : `${pct.toFixed(0)}%`}
                  </span>
                  {days !== null && !done && (
                    <span className="muted">📅 {formatDate(g.fecha, lang)} · {days} {t.daysLeft}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" data-testid="goal-modal">
            <h3 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 700 }}>{editing ? "✏️" : "🎯"} {editing ? t.goalName : t.addGoal}</h3>
            <label style={{ fontSize: 12, color: "var(--text-soft)", fontWeight: 600, marginBottom: 4, display: "block" }}>{t.goalName}</label>
            <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Vacaciones, coche..." style={{ marginBottom: 12 }} data-testid="goal-name-input" />
            <label style={{ fontSize: 12, color: "var(--text-soft)", fontWeight: 600, marginBottom: 4, display: "block" }}>{t.goalTarget}</label>
            <input type="number" step="0.01" value={form.objetivo} onChange={(e) => setForm({ ...form, objetivo: e.target.value })} placeholder="2000" style={{ marginBottom: 12 }} data-testid="goal-target-input" />
            <label style={{ fontSize: 12, color: "var(--text-soft)", fontWeight: 600, marginBottom: 4, display: "block" }}>{t.goalCurrent}</label>
            <input type="number" step="0.01" value={form.ahorrado} onChange={(e) => setForm({ ...form, ahorrado: e.target.value })} placeholder="0" style={{ marginBottom: 12 }} data-testid="goal-current-input" />
            <label style={{ fontSize: 12, color: "var(--text-soft)", fontWeight: 600, marginBottom: 4, display: "block" }}>{t.goalDeadline}</label>
            <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} data-testid="goal-date-input" />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>{t.cancel}</button>
              <button className="btn btn-primary btn-sm" onClick={save} data-testid="goal-save-btn">{t.save}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
