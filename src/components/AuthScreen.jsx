import { useState } from "react";
import { Wallet, Mail, Lock, User as UserIcon, AlertCircle, Loader2 } from "lucide-react";
import { api, formatApiError } from "../api";
import { TRANSLATIONS } from "../i18n";

const AUTH_TEXT = {
  es: {
    welcome: "Bienvenido/a a Mis Finanzas",
    subtitle: "Inicia sesión o crea una cuenta para guardar tus datos en la nube",
    login: "Iniciar sesión",
    register: "Crear cuenta",
    email: "Correo electrónico",
    password: "Contraseña",
    name: "Nombre (opcional)",
    needAccount: "¿No tienes cuenta? Regístrate",
    haveAccount: "¿Ya tienes cuenta? Inicia sesión",
    loginBtn: "Entrar",
    registerBtn: "Crear mi cuenta",
    minPass: "Mínimo 6 caracteres",
  },
  en: {
    welcome: "Welcome to My Finances",
    subtitle: "Sign in or create an account to save your data in the cloud",
    login: "Sign in",
    register: "Create account",
    email: "Email",
    password: "Password",
    name: "Name (optional)",
    needAccount: "No account? Sign up",
    haveAccount: "Have an account? Sign in",
    loginBtn: "Sign in",
    registerBtn: "Create my account",
    minPass: "Minimum 6 characters",
  },
};

export default function AuthScreen({ lang, setLang, onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const a = AUTH_TEXT[lang];

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = mode === "login"
        ? await api.login({ email: form.email, password: form.password })
        : await api.register({ email: form.email, password: form.password, name: form.name || null });
      // Save token in localStorage as fallback for mobile browsers that block cross-site cookies
      if (res?.data?.token) {
        localStorage.setItem("finanzas:token", res.data.token);
      }
      onAuth(res.data);
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="card card-lg fade-in" style={{ maxWidth: 420, width: "100%" }} data-testid="auth-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg, #FF9F43, #FF6B9D)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Wallet size={22} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 18, fontWeight: 800 }}>{TRANSLATIONS[lang].appTitle}</span>
          </div>
          <select value={lang} onChange={(e) => setLang(e.target.value)} style={{ width: "auto", padding: "6px 8px", fontSize: 13 }} data-testid="auth-lang-select">
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>

        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800 }}>{a.welcome}</h2>
        <p className="muted" style={{ margin: "0 0 20px", fontSize: 13 }}>{a.subtitle}</p>

        <div className="tabs" style={{ marginBottom: 16 }}>
          <button className={"tab" + (mode === "login" ? " active" : "")} onClick={() => { setMode("login"); setError(null); }} style={{ flex: 1, justifyContent: "center" }} data-testid="tab-login">
            {a.login}
          </button>
          <button className={"tab" + (mode === "register" ? " active" : "")} onClick={() => { setMode("register"); setError(null); }} style={{ flex: 1, justifyContent: "center" }} data-testid="tab-register">
            {a.register}
          </button>
        </div>

        <form onSubmit={submit}>
          {mode === "register" && (
            <div style={{ marginBottom: 12, position: "relative" }}>
              <UserIcon size={15} style={{ position: "absolute", left: 12, top: 33, color: "var(--text-muted)" }} />
              <label style={{ fontSize: 12, color: "var(--text-soft)", fontWeight: 600, marginBottom: 4, display: "block" }}>{a.name}</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre" style={{ paddingLeft: 34 }} data-testid="input-name" />
            </div>
          )}
          <div style={{ marginBottom: 12, position: "relative" }}>
            <Mail size={15} style={{ position: "absolute", left: 12, top: 33, color: "var(--text-muted)" }} />
            <label style={{ fontSize: 12, color: "var(--text-soft)", fontWeight: 600, marginBottom: 4, display: "block" }}>{a.email}</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="tu@email.com" style={{ paddingLeft: 34 }} data-testid="input-email" />
          </div>
          <div style={{ marginBottom: 16, position: "relative" }}>
            <Lock size={15} style={{ position: "absolute", left: 12, top: 33, color: "var(--text-muted)" }} />
            <label style={{ fontSize: 12, color: "var(--text-soft)", fontWeight: 600, marginBottom: 4, display: "block" }}>{a.password}</label>
            <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" style={{ paddingLeft: 34 }} data-testid="input-password" />
            {mode === "register" && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{a.minPass}</div>}
          </div>
          {error && (
            <div style={{ background: "var(--danger-soft)", color: "var(--danger)", padding: 10, borderRadius: 10, marginBottom: 12, fontSize: 13, display: "flex", gap: 8, alignItems: "flex-start" }} data-testid="auth-error">
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} /> {String(error)}
            </div>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "12px" }} data-testid="submit-btn">
            {loading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : (mode === "login" ? a.loginBtn : a.registerBtn)}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 13 }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(null); }} data-testid="toggle-mode-btn">
            {mode === "login" ? a.needAccount : a.haveAccount}
          </button>
        </div>
      </div>
    </div>
  );
}
