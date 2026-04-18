# UI样式要求（严格 Semi）

## 1. 总原则
1. 只使用 Semi Design 的设计语言与组件体系。
2. 不引入第二套视觉规范（颜色、间距、圆角、阴影、字体）。
3. 所有页面必须通过 Semi Token 驱动，不写硬编码视觉值（如 `#xxx`、`12px`、`box-shadow` 自定义）。

## 2. 组件规范
1. 优先使用 Semi 官方组件：`Button`、`Input`、`Form`、`Table`、`Tabs`、`Modal`、`Card`、`Tag`、`Message`、`Notification`、`Progress`、`Spin`、`Typography`、`Space`。
2. 禁止自研基础组件替代 Semi 基础组件（按钮、输入框、弹窗、表格等）。
3. 允许业务封装组件，但封装层仅做组合，不重写视觉基础样式。

## 3. 颜色规范
1. 主色、语义色、背景色、文字色、边框色必须来自 Semi Token。
2. 状态色统一：成功、警告、危险、信息均使用 Semi 语义色。
3. 禁止直接写 `background: #fff`、`color: #333` 等硬编码。

## 4. 字体规范
1. 字体族使用 Semi 默认字体栈。
2. 字号、字重、行高使用 Semi 字体 Token。
3. 标题层级使用 `Typography` 体系，不手写临时标题样式。

## 5. 间距与布局规范
1. 组件间距统一使用 Semi spacing token。
2. 页面布局优先使用 `Space`、`Grid`、`Layout` 能力。
3. 禁止随意写 magic number（如 `margin: 13px`）。

## 6. 圆角与阴影规范
1. 圆角统一使用 Semi radius token。
2. 阴影统一使用 Semi elevation token。
3. 禁止自定义重阴影和拟物风格。

## 7. 交互反馈规范
1. 异步加载使用 `Spin`。
2. 操作反馈使用 `Message` 或 `Notification`。
3. 危险操作必须二次确认（`Modal.confirm`）。

## 8. 主题与定制边界
1. 仅允许通过 Semi 官方主题机制定制（如 `ConfigProvider` + token override）。
2. 允许做轻量品牌化（主色、圆角、字体级别小范围调整）。
3. 禁止引入与 Semi 冲突的全局 reset 或全局样式覆盖。

## 9. 代码评审检查项
1. 是否存在硬编码视觉值。
2. 是否使用了非 Semi 基础组件替代。
3. 是否破坏 Semi 组件默认状态（hover/active/disabled）。
4. 是否在暗色/亮色主题下可读。
5. 是否在桌面端窗口缩放下仍保持一致。

## 10. 禁止项（硬约束）
1. 禁止新增独立 UI 框架（AntD/MUI/Tailwind UI 等）。
2. 禁止在业务页面写大段覆盖 Semi 组件内部 class。
3. 禁止绕过 token 直接写视觉常量。
