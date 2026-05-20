import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL ;
export const API = `http://localhost:8000/api`;
console.log("Using API URL:", API);
const client = axios.create({
  baseURL: API,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Attach token from localStorage too (fallback when cookies blocked)
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("finanzas:token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function formatApiError(detail) {
  if (detail == null) return "Something went wrong.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export const api = {
  register: (data) => client.post("/auth/register", data),
  login: (data) => client.post("/auth/login", data),
  logout: () => client.post("/auth/logout"),
  me: () => client.get("/auth/me"),
  getData: () => client.get("/data"),
  putFiles: (files) => client.put("/files", files),
  putBudgets: (budgets) => client.put("/budgets", budgets),
  putGoals: (goals) => client.put("/goals", goals),
  putSettings: (settings) => client.put("/settings", settings),
  clearData: () => client.delete("/data"),
};

export default client;
