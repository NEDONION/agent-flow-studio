# agent-flow-studio PRD 增量（用 Agent Lab 替换 LLMOps 监控巡检）

> 文档日期：2026-04-18  
> 文档类型：V1.0 增量方案（替换模块）  
> 适用范围：桌面端（Electron）

## 一、变更背景与决策

当前 `LLMOps 监控巡检` 模块存在两个问题：
1. 用户感知价值偏低，演示吸引力不足。
2. 与“Agent 工作台”主线关联较弱，难以体现差异化能力。

本次决策：下线 `LLMOps 监控巡检`，替换为新模块 `Agent Lab（研究 + 编排 + 沙箱）`。

替换目标：
1. 提升功能“可见智能度”和演示冲击力。
2. 强化多 Agent 协作与可控执行能力。
3. 保持项目可在本地完成闭环，不引入重型后端依赖。

## 二、产品定位

`Agent Lab` 是面向复杂任务的实验与执行工作台，核心强调：
1. 深度研究（证据驱动的结论产出）。
2. 多 Agent 协作与流程编排（可视化、可重试、可追踪）。
3. 沙箱执行（可隔离、可回放、可回滚）。

## 三、目标与非目标

### 3.1 目标（Goals）
1. 支持将自然语言任务自动拆解为可执行工作流。
2. 支持并行 Agent 执行、状态追踪与失败重试。
3. 支持每次执行在沙箱中运行，并输出可审计轨迹。
4. 支持研究结论附证据来源、置信度与冲突提示。

### 3.2 非目标（Non-Goals）
1. 不做生产级分布式调度系统（先不做 k8s / 队列集群）。
2. 不做跨团队权限体系（先做单机用户）。
3. 不做企业级可观测平台（Prometheus/Grafana 深集成后置）。

## 四、模块结构（替换后的三大模块）

1. AI Agent 回归测试平台（保留）
2. Agent Lab（新增，替换原 LLMOps）
3. RLHF 标注平台（保留）

`Agent Lab` 下包含 4 个子能力：
1. `Deep Research`
- 任务拆解、检索、证据聚合、结论生成
- 结论附引用、置信度、冲突来源

2. `Multi-Agent Workflow`
- Planner / Researcher / Coder / Reviewer / Critic 角色编排
- 串行、并行、条件分支、失败重试
- 运行态可视化（节点状态、耗时、成本）

3. `Sandbox Run`
- 每次执行创建独立运行上下文（文件、命令、工具权限）
- 命令日志、文件 diff、产物归档
- 快照与回滚

4. `Evaluation Arena`（轻量）
- 同任务多策略对比
- 质量/耗时/成本排行
- 自动输出推荐策略

## 五、核心用户场景

1. 研究员场景：输入“调研某技术选型”，系统输出结构化报告与证据链接。
2. 工程场景：将需求拆为多 Agent 并行实现，自动汇总结果与风险点。
3. 安全场景：高风险操作进入审批节点（人工确认后继续）。
4. 复盘场景：失败任务回放执行轨迹并基于快照重跑。

## 六、信息架构与路由草案

建议替换原 `llmops` 路由组为 `lab`：

1. `/#/lab/research`
- 页面：Agent Lab - Deep Research
- 说明：任务输入、研究计划、证据与结论报告

2. `/#/lab/workflow`
- 页面：Agent Lab - Multi-Agent 编排
- 说明：流程画布、节点配置、执行控制

3. `/#/lab/sandbox`
- 页面：Agent Lab - Sandbox 执行舱
- 说明：运行记录、命令日志、文件 diff、快照回滚

4. `/#/lab/arena`
- 页面：Agent Lab - 策略对战评测
- 说明：多方案对比、评分与 winner 推荐

## 七、关键交互流程

### 7.1 Deep Research 主流程
1. 用户输入研究任务与边界条件。
2. Planner 生成研究子问题与执行计划。
3. Researcher 并行检索并提取证据。
4. Synthesizer 聚合结论并标注置信度。
5. Critic 生成反方观点与冲突提示。
6. 输出可导出报告（Markdown/PDF）。

### 7.2 Workflow 执行流程
1. 用户创建或加载工作流模板。
2. 配置节点角色、模型、工具、超时与重试策略。
3. 点击执行后进入实时状态图（pending/running/success/failed）。
4. 失败节点支持单点重跑或从检查点恢复。
5. 输出节点级产物与全链路总结。

### 7.3 Sandbox 审计流程
1. 每次 run 自动生成 sandbox id 与上下文目录。
2. 记录命令、输入、输出、退出码、耗时。
3. 对关键文件生成 diff 与快照。
4. 支持回放与回滚到指定快照。

## 八、核心数据模型（MVP）

### 8.1 Workflow
- `id`
- `name`
- `description`
- `nodes[]`
- `edges[]`
- `version`
- `createdAt/updatedAt`

### 8.2 Node
- `id`
- `role`（planner/researcher/coder/reviewer/critic）
- `promptTemplate`
- `modelConfig`
- `tools[]`
- `retryPolicy`
- `timeoutMs`

### 8.3 Run
- `id`
- `workflowId`
- `status`（pending/running/success/failed/cancelled）
- `startedAt/endedAt`
- `cost`
- `tokenUsage`
- `summary`

### 8.4 SandboxRun
- `id`
- `runId`
- `workspacePath`
- `permissions`（fs/network/command）
- `commandLogs[]`
- `snapshots[]`

### 8.5 Evidence & Citation
- `id`
- `runId`
- `sourceType`（web/doc/local）
- `sourceRef`
- `snippet`
- `confidence`
- `conflictGroupId`

### 8.6 Artifact
- `id`
- `runId`
- `type`（report/code/diff/log）
- `path`
- `meta`

## 九、MVP 范围与里程碑（4 周）

### Week 1：Deep Research MVP
1. 任务输入 + 计划生成 + 证据列表 + 结论报告。
2. 引用展示与置信度标签。
3. Markdown 导出。

### Week 2：Workflow MVP
1. 固定节点模板（Planner/Researcher/Writer）。
2. 串行 + 并行执行。
3. 节点状态与重试。

### Week 3：Sandbox MVP
1. 每次 run 独立上下文。
2. 命令日志与退出码。
3. 文件 diff 与单次回滚。

### Week 4：Arena + 打磨
1. 双策略对比（A/B）。
2. 质量/耗时/成本三维评分。
3. 异常处理、空态、演示路径优化。

## 十、验收标准（MVP）

1. 可从自然语言任务生成可执行研究流程并完成一次端到端 run。
2. 工作流最少支持 3 节点执行，且可视化显示节点状态变化。
3. 沙箱日志可回放，至少包含命令、输出、耗时、退出码。
4. 研究报告中每条结论可追溯到至少 1 个证据源。
5. 对战评测页可对比至少 2 个策略并输出推荐结果。

## 十一、与现有代码的改造边界（建议）

1. 路由层
- 替换 `llmops` 分组为 `lab` 分组。
- 新增 `lab/research`、`lab/workflow`、`lab/sandbox`、`lab/arena` 页面。

2. 文案与导航
- 顶部 Tab 从 `LLMOps 监控巡检` 改为 `Agent Lab`。
- About 页同步更新模块介绍。

3. 文档体系
- 在 `docs/功能拆解` 下新增 `02_AgentLab研究编排执行舱/` 文档树。
- 原 `02_LLMOps监控巡检控制台/` 目录标记为 deprecated（先保留，避免一次性删除）。

## 十二、风险与缓解

1. 风险：多 Agent 编排复杂度高，状态一致性难。
- 缓解：MVP 先固定节点类型与状态机，减少动态能力。

2. 风险：Sandbox 安全边界不清晰。
- 缓解：默认最小权限，危险命令走人工确认。

3. 风险：研究结果可信度不足。
- 缓解：强制证据引用 + 冲突提示 + 反方观点输出。

## 十三、后续增强（MVP 后）

1. 工作流模板市场（行业模板、角色模板）。
2. 成本守卫（预算上限、超额自动中断）。
3. 人工审批流（高风险节点前置确认）。
4. 任务复盘助手（自动生成“问题-原因-改进”报告）。

