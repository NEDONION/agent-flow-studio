import { ipcMain as S, app as p, BrowserWindow as T } from "electron";
import { fileURLToPath as g } from "node:url";
import n from "node:path";
import { existsSync as C, readFileSync as j } from "node:fs";
const A = n.dirname(g(import.meta.url));
process.env.APP_ROOT = n.join(A, "..");
function L(o) {
  if (!C(o))
    return;
  const f = j(o, "utf8").split(/\r?\n/);
  for (const a of f) {
    const i = a.trim();
    if (!i || i.startsWith("#"))
      continue;
    const c = i.indexOf("=");
    if (c < 1)
      continue;
    const r = i.slice(0, c).trim(), t = i.slice(c + 1).trim();
    if (!r || process.env[r] !== void 0)
      continue;
    const l = t.startsWith('"') && t.endsWith('"') || t.startsWith("'") && t.endsWith("'");
    process.env[r] = l ? t.slice(1, -1) : t;
  }
}
function F() {
  L(n.join(process.env.APP_ROOT, ".env")), L(n.join(process.env.APP_ROOT, ".env.local"));
}
const w = process.env.VITE_DEV_SERVER_URL, b = n.join(process.env.APP_ROOT, "dist-electron"), I = n.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = w ? n.join(process.env.APP_ROOT, "public") : I;
F();
const W = "https://api.siliconflow.cn/v1/chat/completions", y = "Qwen/Qwen3-8B";
function U(o) {
  return typeof o == "string" ? o.trim() : Array.isArray(o) ? o.map((e) => typeof e == "string" ? e : e && typeof e == "object" && "text" in e && typeof e.text == "string" ? e.text : "").join(`
`).trim() : "";
}
S.handle("llm:chat", async (o, e) => {
  var O, E, d, v, P;
  const f = (O = e == null ? void 0 : e.message) == null ? void 0 : O.trim();
  if (!f)
    throw new Error("message 不能为空");
  const a = (E = process.env.SILICONFLOW_API_KEY) == null ? void 0 : E.trim();
  if (!a)
    throw new Error("缺少 SILICONFLOW_API_KEY，请在 .env 或系统环境变量里配置");
  const i = (process.env.SILICONFLOW_API_URL_CHAT || W).trim(), c = (process.env.SILICONFLOW_MODEL_CHAT || y).trim(), r = [], t = (d = e == null ? void 0 : e.systemPrompt) == null ? void 0 : d.trim();
  t && r.push({ role: "system", content: t }), r.push({ role: "user", content: f });
  const l = await fetch(i, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${a}`
    },
    body: JSON.stringify({
      model: c,
      messages: r,
      temperature: 0.7
    })
  }), _ = await l.text();
  if (!l.ok)
    throw new Error(`SiliconFlow 请求失败（${l.status}）: ${_.slice(0, 500)}`);
  let m;
  try {
    m = JSON.parse(_);
  } catch {
    throw new Error(`SiliconFlow 返回非 JSON: ${_.slice(0, 500)}`);
  }
  const u = (v = m == null ? void 0 : m.choices) == null ? void 0 : v[0], h = U((P = u == null ? void 0 : u.message) == null ? void 0 : P.content);
  if (!h)
    throw new Error("SiliconFlow 返回内容为空，请检查模型配置");
  return {
    reply: h,
    model: c,
    usage: m.usage ?? null
  };
});
let s;
function R() {
  s = new T({
    icon: n.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: n.join(A, "preload.mjs")
    }
  }), s.webContents.on("did-finish-load", () => {
    s == null || s.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), w ? s.loadURL(w) : s.loadFile(n.join(I, "index.html"));
}
p.on("window-all-closed", () => {
  process.platform !== "darwin" && (p.quit(), s = null);
});
p.on("activate", () => {
  T.getAllWindows().length === 0 && R();
});
p.whenReady().then(R);
export {
  b as MAIN_DIST,
  I as RENDERER_DIST,
  w as VITE_DEV_SERVER_URL
};
