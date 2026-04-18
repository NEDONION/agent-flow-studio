import { ipcMain, app, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { existsSync, readFileSync } from "node:fs";
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
function loadEnvFile(filepath) {
  if (!existsSync(filepath)) {
    return;
  }
  const content = readFileSync(filepath, "utf8");
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const index = trimmed.indexOf("=");
    if (index < 1) {
      continue;
    }
    const key = trimmed.slice(0, index).trim();
    const rawValue = trimmed.slice(index + 1).trim();
    if (!key || process.env[key] !== void 0) {
      continue;
    }
    const quoted = rawValue.startsWith('"') && rawValue.endsWith('"') || rawValue.startsWith("'") && rawValue.endsWith("'");
    process.env[key] = quoted ? rawValue.slice(1, -1) : rawValue;
  }
}
function loadLocalEnvFiles() {
  loadEnvFile(path.join(process.env.APP_ROOT, ".env"));
  loadEnvFile(path.join(process.env.APP_ROOT, ".env.local"));
}
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
loadLocalEnvFiles();
const DEFAULT_CHAT_API_URL = "https://api.siliconflow.cn/v1/chat/completions";
const DEFAULT_CHAT_MODEL = "Qwen/Qwen3-8B";
function normalizeContent(content) {
  if (typeof content === "string") {
    return content.trim();
  }
  if (!Array.isArray(content)) {
    return "";
  }
  return content.map((part) => {
    if (typeof part === "string") {
      return part;
    }
    if (part && typeof part === "object" && "text" in part && typeof part.text === "string") {
      return part.text;
    }
    return "";
  }).join("\n").trim();
}
ipcMain.handle("llm:chat", async (_event, payload) => {
  var _a, _b, _c, _d, _e;
  const message = (_a = payload == null ? void 0 : payload.message) == null ? void 0 : _a.trim();
  if (!message) {
    throw new Error("message 不能为空");
  }
  const apiKey = (_b = process.env.SILICONFLOW_API_KEY) == null ? void 0 : _b.trim();
  if (!apiKey) {
    throw new Error("缺少 SILICONFLOW_API_KEY，请在 .env 或系统环境变量里配置");
  }
  const apiUrl = (process.env.SILICONFLOW_API_URL_CHAT || DEFAULT_CHAT_API_URL).trim();
  const model = (process.env.SILICONFLOW_MODEL_CHAT || DEFAULT_CHAT_MODEL).trim();
  const messages = [];
  const systemPrompt = (_c = payload == null ? void 0 : payload.systemPrompt) == null ? void 0 : _c.trim();
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: message });
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7
    })
  });
  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`SiliconFlow 请求失败（${response.status}）: ${responseText.slice(0, 500)}`);
  }
  let data;
  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(`SiliconFlow 返回非 JSON: ${responseText.slice(0, 500)}`);
  }
  const choice = (_d = data == null ? void 0 : data.choices) == null ? void 0 : _d[0];
  const reply = normalizeContent((_e = choice == null ? void 0 : choice.message) == null ? void 0 : _e.content);
  if (!reply) {
    throw new Error("SiliconFlow 返回内容为空，请检查模型配置");
  }
  return {
    reply,
    model,
    usage: data.usage ?? null
  };
});
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(createWindow);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
