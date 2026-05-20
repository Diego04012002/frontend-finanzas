import { Upload, FileSpreadsheet, X, Sparkles } from "lucide-react";
import { TRANSLATIONS } from "../i18n";

export default function FileBar({ files, activeFile, setActiveFile, onAdd, onRemove, lang, fileInputRef }) {
  const t = TRANSLATIONS[lang];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 20 }} data-testid="file-bar">
      {files.map(f => (
        <div
          key={f.name}
          className={"file-chip" + (activeFile === f.name ? " active" : "")}
          onClick={() => setActiveFile(f.name)}
          data-testid={`file-chip-${f.name}`}
        >
          <FileSpreadsheet size={14} />
          <span style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
          <span style={{ fontSize: 11, opacity: 0.8 }}>· {f.rows.length}</span>
          <button
            onClick={(e) => { e.stopPropagation(); if (window.confirm(t.confirmRemove)) onRemove(f.name); }}
            style={{ background: "transparent", border: "none", padding: 2, display: "flex", color: "inherit", opacity: 0.6 }}
            title={t.removeFile}
            data-testid={`remove-file-${f.name}`}
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <button className="btn btn-primary btn-sm" onClick={() => fileInputRef.current?.click()} data-testid="add-excel-btn">
        <Upload size={15} /> {t.addExcel}
      </button>
      {files.length > 0 && files.some(f => f.autoCount > 0) && (
        <span className="chip" style={{ background: "var(--success-soft)", color: "#0a7a5e" }}>
          <Sparkles size={12} /> {files.reduce((s, f) => s + (f.autoCount || 0), 0)} {t.autoCategorized}
        </span>
      )}
    </div>
  );
}
