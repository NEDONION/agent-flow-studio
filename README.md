# Agent Flow Studio

基于 `React + TypeScript + Vite + Electron` 的桌面应用项目。

## 环境要求

- Node.js `20.x`（建议 LTS，`>=18` 也可）
- npm `9+`
- 本地桌面环境（Electron 需要图形界面）

## 初始化项目

1. 克隆仓库

```bash
git clone <你的仓库地址>
cd agent-flow-studio
```

2. 安装依赖

```bash
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
- `npm run preview`：预览前端打包结果（仅 Vite 静态资源）

## 常见问题

- `npm run dev` 没有弹出窗口：确认当前环境有图形界面（非纯 SSH 无桌面环境）。
- 首次安装依赖失败：删除 `node_modules` 后重试 `npm install`。
- 需要修改安装包名称或平台配置：编辑 `electron-builder.json5`（如 `productName`、`mac/win/linux` 目标配置）。
