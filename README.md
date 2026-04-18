# Agent Flow Studio (Desktop Only)

基于 `React + TypeScript + Vite + Electron` 的纯桌面应用项目。

## 项目定位

- 仅提供 Electron 桌面端
- 不提供 Web 端部署与运行支持

## 环境要求

- Node.js `20.x`（建议 LTS，`>=18` 也可）
- npm `9+`
- 本地桌面环境（Electron 需要图形界面）

## LLM 配置（SiliconFlow 对话）

在项目根目录创建 `.env.local`（或直接用系统环境变量）：

```bash
SILICONFLOW_API_KEY=你的key
SILICONFLOW_API_URL_CHAT=https://api.siliconflow.cn/v1/chat/completions
SILICONFLOW_MODEL_CHAT=Qwen/Qwen3-8B
```

说明：
- 当前实现只走对话接口，不使用 rerank。
- `SILICONFLOW_API_URL_CHAT`、`SILICONFLOW_MODEL_CHAT` 可不填，会使用默认值。
- `SILICONFLOW_API_KEY` 必填，且不要提交到 Git。

## 初始化项目

1. 克隆仓库

```bash
git clone <你的仓库地址>
cd agent-flow-studio
```

2. 安装依赖

> NPM 换国内源
```bash
npm config get registry
npm config delete proxy
npm config delete https-proxy
npm config set registry https://registry.npmmirror.com
npm cache clean --force
npm install react-router-dom@6.30.1
```

```bash
## npm 镜像
npm config set registry https://registry.npmmirror.com

export ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
rm -rf node_modules package-lock.json
npm install

npm install
```

## 本地启动（开发模式）

```bash
npm run dev
```

执行后会同时启动：
- Vite 开发服务
- Electron 主进程（自动打开桌面窗口）

代码修改后，前端会热更新，Electron 相关代码会自动重启。

## 构建发布包

```bash
npm run build
```

该命令会依次执行：
- `tsc`
- `vite build`
- `electron-builder`

构建产物：
- 前端静态资源：`dist/`
- Electron 构建文件：`dist-electron/`
- 安装包输出目录：`release/<version>/`

## 常用命令

- `npm run dev`：本地开发启动（Vite + Electron）
- `npm run build`：构建桌面安装包
- `npm run lint`：ESLint 检查

## 常见问题

- `npm run dev` 没有弹出窗口：确认当前环境有图形界面（非纯 SSH 无桌面环境）。
- 首次安装依赖失败：删除 `node_modules` 后重试 `npm install`。
- 需要修改安装包名称或平台配置：编辑 `electron-builder.json5`（如 `productName`、`mac/win/linux` 目标配置）。
- 为什么不能直接用浏览器打开：项目在渲染进程使用了 Electron 的 `ipcRenderer`，因此定位为桌面应用而非纯 Web 应用。
