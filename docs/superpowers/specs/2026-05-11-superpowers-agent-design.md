# Superpowers Agent Design

## 概述

为 OpenCode 新增一套独立于 `opencodeAgent` 的 agent 体系，用于更贴近 `superpowers` 所倡导的 skill-first、subagent-driven 开发方式。

该体系的核心目标不是替换现有通用代理，而是在保留 `opencodeAgent` 的前提下，增加一套更适合以下流程的主代理与子代理：

- 先加载和遵循 `superpowers` skill
- 根据任务阶段选择 brainstorming、writing-plans、debugging、verification 等流程
- 将实现工作拆分给专门的执行型 subagent
- 用只读型 subagent 提供探索、文档扫描、仓库结构分析
- 用审查型 subagent 提供 diff review、日志排查和安全初筛

## 目标

- 新增 `superpowersAgent`，并与 `opencodeAgent` 并存
- 保持默认 agent 不变，继续使用 `opencodeAgent`
- 新增一个专门的执行型 subagent `plan-executor`
- 为 `plan-executor` 使用 `deepseek-v4-pro`
- 为 `plan-executor` 启用推理，并将思考强度设为 `max`
- 为只读探索类 agent 使用 `deepseek-v4-flash`
- 让 `superpowersAgent` 能调用探索、审查、诊断和执行型 subagent
- 让 `plan-executor` 只允许调用少量只读 subagent，避免失控扩 scope
- 保持配置结构清晰，便于后续继续调优并写入报告

## 非目标

- 不替换或删除现有 `opencodeAgent`
- 不把 `superpowersAgent` 设为默认 agent
- 不构建一个可以无限递归派发任务的自治代理
- 不为了 agent 体系而重写现有全部子代理逻辑

## 当前配置基线

从现有 `~/.config/opencode/opencode.jsonc` 可确认：

- 当前默认主代理为 `opencodeAgent`
- 当前主模型为 `openai/gpt-5.4`
- 已接入 `superpowers` 插件
- 已配置一批只读 / 半只读 subagent，包括：
  - `explore`
  - `repo-map`
  - `diff-review-lite`
  - `log-triage`
  - `docs-scan`
  - `local-security-scout`
- 现有只读子代理主要使用 `deepseek-v4-flash`

新的 agent 体系应尽量复用这些成功经验，但不要直接与现有命名冲突。

## 新体系结构

建议新增如下 agent：

- `superpowersAgent`
- `plan-executor`
- `project-explore`
- `project-repo-map`
- `project-docs-scan`
- `project-diff-review`
- `project-log-triage`
- `project-security-scout`

## 主代理设计

### superpowersAgent

`superpowersAgent` 是一名偏编排型的主代理，而不是“自己包办一切”的全能代理。

建议模型：

- `openai/gpt-5.4`
- `reasoningEffort: high`

职责：

- 优先遵循 `superpowers` skill
- 识别当前任务应走哪条 workflow
- 在合适时机调用读型 subagent 获取上下文
- 在实现阶段调用 `plan-executor`
- 在 review、debug 或 verification 阶段调用辅助 subagent
- 汇总子代理结果并决定下一步动作

其设计重点是编排、约束和整合，而不是承担全部执行工作。

## 执行型子代理设计

### plan-executor

`plan-executor` 是整套设计里最关键的子代理。

建议模型：

- `deepseek/deepseek-v4-pro`
- `thinking: { type: "enabled" }`
- `reasoningEffort: max`
- 低温度，降低发散
- 中等 `steps`，限制为单 task 执行代理

其角色不是“万能开发代理”，而是：

- 执行 implementation plan 的单个 task
- 或执行同一 task 内一小段紧密相关的步骤

默认行为：

- 先读取与当前 task 直接相关的文件
- 只做最小正确改动
- 运行与当前 task 直接相关的最小验证
- 返回结构化结果，包括：
  - 改了什么
  - 跑了什么验证
  - 当前结果如何
  - 是否存在阻塞、风险、未完成项

明确禁止：

- 擅自扩大需求范围
- 擅自改写 spec 或 plan
- 一次吞掉整个项目的大量工作
- 调用其他执行型 subagent
- 在没有验证的情况下声称任务已完成

## 读型子代理设计

### project-explore

- 用于快速定位文件、符号、路由、导入、配置和直接仓库问题
- 模型使用 `deepseek-v4-flash`
- 保持只读和低成本高速度

### project-repo-map

- 用于仓库架构梳理、入口点、模块边界、依赖方向与主要数据流
- 模型使用 `deepseek-v4-flash`
- 可保留较强推理配置

### project-docs-scan

- 用于扫描本地文档、注释、README、配置约定、脚本和项目说明
- 模型使用 `deepseek-v4-flash`
- 偏快速文档理解

这些 agent 的行为可以尽量继承当前现有只读 agent 的权限与工具使用风格。

## 审查与诊断型子代理设计

### project-diff-review

- 用于 first-pass diff review
- 查找明显 bug、回归风险、测试缺口和危险改动

### project-log-triage

- 用于错误日志、测试失败、CI 输出和异常信息排查

### project-security-scout

- 用于本地安全初筛，如 secrets、注入面、危险 API、可疑日志等

这些 agent 保持只读，主要由 `superpowersAgent` 调用，而不是交给 `plan-executor` 自由调度。

## 权限边界

### superpowersAgent 的 task 权限

允许调用：

- `project-explore`
- `project-repo-map`
- `project-docs-scan`
- `plan-executor`
- `project-diff-review`
- `project-log-triage`
- `project-security-scout`

这样可以覆盖：

- 探索
- 规划辅助
- 执行
- 审查
- 调试
- 安全检查

### plan-executor 的 task 权限

只允许调用：

- `project-explore`
- `project-repo-map`
- `project-docs-scan`

不允许调用：

- `project-diff-review`
- `project-log-triage`
- `project-security-scout`
- 任何其他执行型 agent

这能防止 `plan-executor` 在执行过程中递归扩展为另一个“总控代理”。

## 模型策略

### 主代理

- `superpowersAgent` 使用 `openai/gpt-5.4`
- `reasoningEffort: high`

原因：

- 主代理更适合承担 workflow 判断、skill 编排和跨阶段整合
- GPT-5.4 更适合做全局任务管理与复杂上下文整合

### 读型与审查型子代理

- 继续优先使用 `deepseek-v4-flash`

原因：

- 这类任务以读取、搜索、归纳为主
- 低成本高吞吐更重要
- 已符合当前你的使用经验

### 执行型子代理

- `plan-executor` 使用 `deepseek-v4-pro`
- 启用推理
- `reasoningEffort: max`

原因：

- 执行型子代理需要在单 task 范围内做较强代码推理与局部实现
- 其工作粒度比读型代理更重，更需要深度思考能力

## 配置落地方式

建议采用两层落地：

1. 全局 `~/.config/opencode/opencode.jsonc`
2. 全局 `~/.config/opencode/agents/*.md`

### opencode.jsonc

负责：

- 注册 `deepseek-v4-pro` 模型
- 保留现有默认 agent 为 `opencodeAgent`
- 新增或纳入 `superpowersAgent` 的全局 agent 配置控制

### agents 目录

负责：

- 存放 `superpowersAgent.md`
- 存放 `plan-executor.md`
- 存放 `project-*` 系列子代理配置

这样做的好处：

- 结构清晰
- prompt 独立、便于维护
- 更适合后续演示和报告说明
- 方便以后单独调整某个 agent，而不是频繁修改一大段 JSON

## 预期收益

完成这套配置后，将得到：

- 一套与 `opencodeAgent` 并存的、面向 `superpowers` 的独立主代理
- 一套更符合 skill-first、subagent-driven 理念的 agent 拓扑
- 一个高推理强度的执行型 subagent，可用于 implementation plan 的 task-by-task 落地
- 一套结构化、可解释、便于写入报告的 OpenCode 工程化增强方案

## 实施范围

本次实施只覆盖 agent 配置层，不直接开始网页项目代码实现。

完成后，下一步再切回网页项目本身，可通过：

- 继续使用现有 `opencodeAgent`
- 或切换到新建的 `superpowersAgent`

来执行此前已经完成的网页项目 spec 和 implementation plan。
