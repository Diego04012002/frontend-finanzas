import { TrendingUp, TrendingDown, Scale, PiggyBank } from "lucide-react";
import { formatMoney } from "../utils/format";
import { TRANSLATIONS } from "../i18n";

export default function KpiCards({ ingresos, gastos, balance, count, days, lang, currency }) {
  const t = TRANSLATIONS[lang];
  const savingsRate = ingresos > 0 ? ((ingresos - gastos) / ingresos) * 100 : 0;
  const dailyAvg = days > 0 ? gastos / days : 0;

  const items = [
    { label: t.totalIncome, value: formatMoney(ingresos, currency), icon: TrendingUp, color: "var(--success)", bg: "var(--success-soft)", sub: `${count} ${t.transactions}`, testid: "kpi-income" },
    { label: t.totalExpense, value: formatMoney(gastos, currency), icon: TrendingDown, color: "var(--danger)", bg: "var(--danger-soft)", sub: `${t.avgDailySpend}: ${formatMoney(dailyAvg, currency)}`, testid: "kpi-expense" },
    { label: t.balance, value: formatMoney(balance, currency), icon: Scale, color: balance >= 0 ? "var(--info)" : "var(--danger)", bg: balance >= 0 ? "var(--info-soft)" : "var(--danger-soft)", sub: "", testid: "kpi-balance" },
    { label: t.savingsRate, value: `${savingsRate.toFixed(1)}%`, icon: PiggyBank, color: "var(--primary)", bg: "var(--primary-soft)", sub: savingsRate >= 20 ? "👍" : savingsRate >= 0 ? "👌" : "⚠️", testid: "kpi-savings" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 20 }} data-testid="kpi-cards">
      {items.map((k) => {
        const Icon = k.icon;
        return (
          <div key={k.label} className="kpi" data-testid={k.testid}>
            <div className="kpi-label">
              <span style={{ background: k.bg, color: k.color, padding: 6, borderRadius: 8, display: "inline-flex" }}>
                <Icon size={14} />
              </span>
              {k.label}
            </div>
            <div className="kpi-value" style={{ color: k.color }}>{k.value}</div>
            {k.sub && <div className="kpi-sub">{k.sub}</div>}
          </div>
        );
      })}
    </div>
  );
}
