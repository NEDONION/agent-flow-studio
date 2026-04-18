# AGENT.md（UI执行规范 - 严格 Semi）

## 1. 适用范围
本规范适用于 `agent-flow-studio` 的所有前端页面、组件、样式和交互实现。

## 2. 强制规则
1. 只允许使用 Semi Design 组件与 Semi Token。
2. 不允许引入其他 UI 体系作为主视觉实现。
3. 不允许硬编码视觉样式值（颜色、字号、间距、圆角、阴影）。
4. 不允许通过覆盖 Semi 内部 class 名实现大规模视觉改造。

## 3. 开发执行标准
1. 优先使用 Semi 组件 props 与官方能力实现样式。
2. 页面结构优先使用 Semi 布局组件（`Layout`/`Space`/`Grid`）。
3. 状态反馈统一：加载 `Spin`，轻提示 `Message`，系统通知 `Notification`。
4. 风险操作统一二次确认：`Modal.confirm`。

## 4. Token 使用标准
1. 统一使用 `docs/UI规范/design-token.md` 中定义的语义 token。
2. 新增 token 必须建立到 Semi token 的映射关系。
3. 禁止直接出现硬编码颜色值（如 `#1677ff`、`rgb(...)`）。

## 5. 代码审查清单（PR 必查）
1. 是否新增了非 Semi 基础组件替代。
2. 是否出现硬编码视觉常量。
3. 是否破坏 Semi 默认交互状态（hover/active/disabled）。
4. 是否在 125%/150% 桌面缩放下保持布局稳定。
5. 是否更新相关文档（UI样式要求/design-token）。

## 6. 示例约束
- 可以：通过 `ConfigProvider` 统一主题 token。
- 可以：基于 Semi 组件封装业务组件。
- 不可以：手写一个非 Semi 风格按钮替代 `Button`。
- 不可以：直接写全局 CSS 覆盖 `.semi-button` 大面积样式。

## 7. 违规处理
若实现不符合本规范，必须在合并前整改；必要时回退到最近符合规范的实现。
