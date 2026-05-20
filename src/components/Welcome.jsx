import { Upload } from "lucide-react";
import { TRANSLATIONS } from "../i18n";

export default function Welcome({ lang, onPickFile }) {
  const t = TRANSLATIONS[lang];
  const features = [
    { icon: "📥", text: t.feature1 },
    { icon: "🏷️", text: t.feature2 },
    { icon: "🎯", text: t.feature3 },
    { icon: "🔒", text: t.feature4 },
  ];
  return (
    <div className="card card-lg fade-in" style={{ textAlign: "center", padding: "40px 24px" }} data-testid="welcome-card">
      <div className="welcome-emoji">👋</div>
      <h2 style={{ margin: "8px 0 4px", fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>{t.welcomeTitle}</h2>
      <p style={{ margin: "0 auto 28px", color: "var(--text-soft)", fontSize: 15, maxWidth: 460 }}>{t.welcomeText}</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, maxWidth: 720, margin: "0 auto 28px" }}>
        {features.map((f, i) => (
          <div key={i} style={{ background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 12px", textAlign: "left", display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 22 }}>{f.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{f.text}</span>
          </div>
        ))}
      </div>

      <button className="btn btn-primary" onClick={onPickFile} style={{ padding: "14px 22px", fontSize: 15 }} data-testid="welcome-upload-btn">
        <Upload size={18} /> {t.addExcel}
      </button>
      <p style={{ margin: "16px 0 0", fontSize: 12, color: "var(--text-muted)" }}>{t.supports}</p>
    </div>
  );
}
