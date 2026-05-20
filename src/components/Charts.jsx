import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { formatMoney, formatMoneyCompact, monthLabel } from "../utils/format";
import { CATEGORY_COLORS, CHART_PALETTE, colorForCategory } from "../utils/colors";
import { TRANSLATIONS } from "../i18n";

function CustomTooltip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px", boxShadow: "var(--shadow)" }}>
      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 12, color: p.color, fontWeight: 600 }}>
          {p.name}: {formatMoney(p.value, currency)}
        </div>
      ))}
    </div>
  );
}

export function CategoryPie({ data, lang, currency }) {
  const t = TRANSLATIONS[lang];
  if (!data.length) return null;
  return (
    <div className="card" data-testid="chart-category-pie">
      <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>{t.expensesByCategory}</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
            {data.map((e, i) => <Cell key={i} fill={colorForCategory(e.name, i)} />)}
          </Pie>
          <Tooltip content={(p) => <CustomTooltip {...p} currency={currency} />} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
        {data.slice(0, 6).map((c, i) => (
          <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-soft)" }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: colorForCategory(c.name, i) }} />
            {c.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TopCategories({ data, totalGastos, lang, currency }) {
  const t = TRANSLATIONS[lang];
  return (
    <div className="card" data-testid="chart-top-categories">
      <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>{t.topCategories}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {data.slice(0, 6).map((c, i) => {
          const pct = totalGastos > 0 ? (c.value / totalGastos) * 100 : 0;
          const color = colorForCategory(c.name, i);
          return (
            <div key={c.name}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{formatMoney(c.value, currency)}</span>
              </div>
              <div className="progress">
                <div className="progress-bar" style={{ width: `${pct}%`, background: color }} />
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{pct.toFixed(1)}%</div>
            </div>
          );
        })}
        {data.length === 0 && <div className="muted" style={{ fontSize: 13, textAlign: "center", padding: 12 }}>—</div>}
      </div>
    </div>
  );
}

export function MonthlyBars({ data, lang, currency }) {
  const t = TRANSLATIONS[lang];
  if (data.length < 1) return null;
  const display = data.map(d => ({ ...d, mes: monthLabel(d.mes, lang) }));
  return (
    <div className="card" data-testid="chart-monthly">
      <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>{t.monthlyTrend}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={display} barGap={6}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "var(--text-soft)" }} />
          <YAxis tick={{ fontSize: 11, fill: "var(--text-soft)" }} tickFormatter={(v) => formatMoneyCompact(v, currency)} width={60} />
          <Tooltip content={(p) => <CustomTooltip {...p} currency={currency} />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="ingresos" name={t.totalIncome} fill="#00B894" radius={[6, 6, 0, 0]} />
          <Bar dataKey="gastos" name={t.totalExpense} fill="#E84545" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BalanceLine({ data, lang, currency }) {
  const t = TRANSLATIONS[lang];
  if (data.length < 2) return null;
  return (
    <div className="card" data-testid="chart-balance-evolution">
      <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>{t.balanceEvolution}</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: "var(--text-soft)" }} />
          <YAxis tick={{ fontSize: 11, fill: "var(--text-soft)" }} tickFormatter={(v) => formatMoneyCompact(v, currency)} width={60} />
          <Tooltip content={(p) => <CustomTooltip {...p} currency={currency} />} />
          <Line type="monotone" dataKey="saldo" name={t.balance2} stroke="#FF9F43" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryBars({ data, lang, currency }) {
  const t = TRANSLATIONS[lang];
  if (!data.length) return null;
  return (
    <div className="card" data-testid="chart-category-bars">
      <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>{t.topCategories}</h3>
      <ResponsiveContainer width="100%" height={Math.max(220, data.length * 40)}>
        <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: "var(--text-soft)" }} tickFormatter={(v) => formatMoneyCompact(v, currency)} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--text-soft)" }} width={140} />
          <Tooltip content={(p) => <CustomTooltip {...p} currency={currency} />} />
          <Bar dataKey="value" name={t.totalExpense} radius={[0, 6, 6, 0]}>
            {data.map((e, i) => <Cell key={i} fill={colorForCategory(e.name, i)} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
