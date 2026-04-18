# Design Token 规范（Semi 严格版）

> 说明：具体 token 名称以当前项目接入的 Semi 版本为准；若版本差异导致变量名不同，必须保持“语义层 -> Semi 官方 token”映射关系不变。

## 1. 使用原则
1. 仅使用 Semi 官方 Token 或其语义映射。
2. 业务代码只能使用“语义 token”，不直接散落原子 token。
3. 若新增语义 token，必须映射到 Semi token，不得引入硬编码值。

## 2. 语义 Token 映射

### 2.1 颜色
- `token.color.bg.page` -> `var(--semi-color-bg-0)`
- `token.color.bg.card` -> `var(--semi-color-bg-1)`
- `token.color.bg.layer` -> `var(--semi-color-bg-2)`
- `token.color.text.primary` -> `var(--semi-color-text-0)`
- `token.color.text.secondary` -> `var(--semi-color-text-1)`
- `token.color.text.tertiary` -> `var(--semi-color-text-2)`
- `token.color.border.default` -> `var(--semi-color-border)`
- `token.color.border.focus` -> `var(--semi-color-border-focus)`
- `token.color.primary.default` -> `var(--semi-color-primary)`
- `token.color.primary.hover` -> `var(--semi-color-primary-hover)`
- `token.color.primary.active` -> `var(--semi-color-primary-active)`
- `token.color.success` -> `var(--semi-color-success)`
- `token.color.warning` -> `var(--semi-color-warning)`
- `token.color.danger` -> `var(--semi-color-danger)`
- `token.color.info` -> `var(--semi-color-info)`

### 2.2 字体
- `token.font.family.base` -> Semi 默认字体栈
- `token.font.size.small` -> `var(--semi-font-size-small)`
- `token.font.size.base` -> `var(--semi-font-size-regular)`
- `token.font.size.h6` -> `var(--semi-font-size-header-6)`
- `token.font.size.h5` -> `var(--semi-font-size-header-5)`
- `token.font.weight.normal` -> `var(--semi-font-weight-normal)`
- `token.font.weight.medium` -> `var(--semi-font-weight-medium)`
- `token.font.weight.bold` -> `var(--semi-font-weight-bold)`

### 2.3 间距
- `token.space.xs` -> `var(--semi-spacing-extra-tight)`
- `token.space.sm` -> `var(--semi-spacing-tight)`
- `token.space.md` -> `var(--semi-spacing-base-tight)`
- `token.space.lg` -> `var(--semi-spacing-base)`
- `token.space.xl` -> `var(--semi-spacing-loose)`

### 2.4 圆角
- `token.radius.sm` -> `var(--semi-border-radius-small)`
- `token.radius.md` -> `var(--semi-border-radius-medium)`
- `token.radius.lg` -> `var(--semi-border-radius-large)`
- `token.radius.full` -> `var(--semi-border-radius-circle)`

### 2.5 阴影
- `token.shadow.card` -> `var(--semi-shadow-elevated)`
- `token.shadow.modal` -> Semi 弹层官方阴影 token（按当前版本映射）

## 3. 实施要求
1. 页面样式优先使用组件 props 和主题配置，CSS 变量仅作补充。
2. 若出现 token 缺失，先在 `ConfigProvider` 主题层扩展语义 token 映射，再使用。
3. 所有 token 变更要在 PR 描述里说明影响范围。

## 4. 变更流程
1. 提交 token 变更申请。
2. 设计/前端评审确认。
3. 更新文档与示例页面。
4. 通过视觉回归后合并。
