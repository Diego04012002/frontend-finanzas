const KEYS = {
  files: "finanzas:files",
  active: "finanzas:active",
  settings: "finanzas:settings",
  budgets: "finanzas:budgets",
  goals: "finanzas:goals",
};

export function load(key, fallback) {
  try {
    const v = localStorage.getItem(KEYS[key] || key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(KEYS[key] || key, JSON.stringify(value));
  } catch (e) {
    console.warn("Storage save failed:", e);
  }
}

export function clearAll() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
}
