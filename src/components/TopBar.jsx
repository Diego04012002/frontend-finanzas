import { Wallet, Globe, Coins, Trash2, Download, LogOut, User as UserIcon } from "lucide-react";
import { CURRENCIES, TRANSLATIONS } from "../i18n";

export default function TopBar({ lang, setLang, currency, setCurrency, onClearAll, hasData, user, onLogout }) {
  const t = TRANSLATIONS[lang];
  return (
    <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: "linear-gradient(135deg, #FF9F43, #FF6B9D)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 6px 18px rgba(255,159,67,0.35)",
        }}>
          <Wallet size={26} color="#fff" strokeWidth={2.5} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }} data-testid="app-title">
            {t.appTitle}
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-soft)" }}>{t.appSubtitle}</p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg-card)", border: "1.5px solid var(--border)", borderRadius: 10, padding: "4px 4px 4px 10px" }}>
          <Globe size={15} color="var(--text-soft)" />
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            style={{ border: "none", background: "transparent", padding: "6px 4px", fontWeight: 600, fontSize: 13, width: "auto", boxShadow: "none" }}
            data-testid="language-select"
          >
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg-card)", border: "1.5px solid var(--border)", borderRadius: 10, padding: "4px 4px 4px 10px" }}>
          <Coins size={15} color="var(--text-soft)" />
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            style={{ border: "none", background: "transparent", padding: "6px 4px", fontWeight: 600, fontSize: 13, width: "auto", boxShadow: "none" }}
            data-testid="currency-select"
          >
            {Object.keys(CURRENCIES).map(c => (
              <option key={c} value={c}>{c} {CURRENCIES[c].symbol}</option>
            ))}
          </select>
        </div>

        {hasData && (
          <button
            className="btn btn-ghost btn-danger btn-sm"
            onClick={() => { if (window.confirm(t.confirmClearAll)) onClearAll(); }}
            data-testid="clear-all-btn"
            title={t.clearAll}
          >
            <Trash2 size={15} /> {t.clearAll}
          </button>
        )}

        <a
          className="btn btn-secondary btn-sm"
          href="/finanzas-app.zip"
          download="finanzas-app.zip"
          data-testid="download-source-btn"
          title="Download source code"
          style={{ textDecoration: "none" }}
        >
          <Download size={15} /> .zip
        </a>

        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg-card)", border: "1.5px solid var(--border)", borderRadius: 10, padding: "6px 10px" }} data-testid="user-info">
            <UserIcon size={14} color="var(--text-soft)" />
            <span style={{ fontSize: 13, fontWeight: 600 }}>{user.name || user.email}</span>
            <button
              onClick={onLogout}
              className="btn btn-ghost btn-sm"
              style={{ padding: "4px 6px", marginLeft: 4 }}
              title={lang === "en" ? "Sign out" : "Cerrar sesión"}
              data-testid="logout-btn"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
