# Superpowers Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new `superpowersAgent`-centered OpenCode agent stack that coexists with `opencodeAgent`, uses `deepseek-v4-pro` for `plan-executor`, and keeps read-only helper agents on `deepseek-v4-flash`.

**Architecture:** Keep the model/provider registry in `~/.config/opencode/opencode.jsonc`, then define each new custom agent as a dedicated markdown file under `~/.config/opencode/agents/`. Let `superpowersAgent` act as the orchestrator, `plan-executor` handle single-task implementation, and `project-*` agents provide focused read-only support.

**Tech Stack:** OpenCode config, YAML-frontmatter markdown agents, DeepSeek provider, GPT-5.4, superpowers plugin

---

## Context Notes

- The existing global config file is `C:\Users\RookiesTwo\.config\opencode\opencode.jsonc`.
- There is currently no `C:\Users\RookiesTwo\.config\opencode\agents\` directory.
- The current default agent is `opencodeAgent` and must remain unchanged.
- The current DeepSeek provider already defines `deepseek-v4-flash`; this plan adds `deepseek-v4-pro`.
- This is user-environment configuration work, so git commit steps are intentionally omitted.

## File Structure And Responsibilities

- `C:\Users\RookiesTwo\.config\opencode\opencode.jsonc`: register `deepseek-v4-pro` and keep existing default-agent behavior intact
- `C:\Users\RookiesTwo\.config\opencode\agents\superpowersAgent.md`: orchestrating primary agent that uses superpowers workflows and dispatches subagents
- `C:\Users\RookiesTwo\.config\opencode\agents\plan-executor.md`: execution-focused subagent using `deepseek-v4-pro`
- `C:\Users\RookiesTwo\.config\opencode\agents\project-explore.md`: read-only fast repository exploration
- `C:\Users\RookiesTwo\.config\opencode\agents\project-repo-map.md`: read-only architecture and data-flow mapping
- `C:\Users\RookiesTwo\.config\opencode\agents\project-docs-scan.md`: read-only docs and config scanning
- `C:\Users\RookiesTwo\.config\opencode\agents\project-diff-review.md`: read-only diff review
- `C:\Users\RookiesTwo\.config\opencode\agents\project-log-triage.md`: read-only log triage
- `C:\Users\RookiesTwo\.config\opencode\agents\project-security-scout.md`: read-only security scouting

### Task 1: Add DeepSeek Pro Model Support

**Files:**
- Modify: `C:\Users\RookiesTwo\.config\opencode\opencode.jsonc`

- [ ] **Step 1: Read the current global config and confirm the DeepSeek provider block location**

Run:

```powershell
Get-Content "C:\Users\RookiesTwo\.config\opencode\opencode.jsonc"
```

Expected: the config contains a `provider.deepseek.models.deepseek-v4-flash` entry.

- [ ] **Step 2: Add `deepseek-v4-pro` under the existing DeepSeek provider**

Insert this model entry in the `models` object:

```json
"deepseek-v4-pro": {
  "name": "DeepSeek-V4-Pro",
  "limit": {
    "context": 1048576,
    "output": 393216
  }
}
```

- [ ] **Step 3: Re-read the file to verify the new model entry is present and JSONC shape is intact**

Run:

```powershell
Get-Content "C:\Users\RookiesTwo\.config\opencode\opencode.jsonc"
```

Expected: both `deepseek-v4-flash` and `deepseek-v4-pro` appear in the `models` block.

### Task 2: Create The Global Agents Directory

**Files:**
- Create: `C:\Users\RookiesTwo\.config\opencode\agents\`

- [ ] **Step 1: Confirm the parent OpenCode config directory exists**

Run:

```powershell
Get-ChildItem "C:\Users\RookiesTwo\.config\opencode"
```

Expected: the directory listing shows `opencode.jsonc` and other existing files.

- [ ] **Step 2: Create the `agents` directory**

Run:

```powershell
New-Item -ItemType Directory -Force "C:\Users\RookiesTwo\.config\opencode\agents"
```

Expected: PowerShell reports the created directory path.

- [ ] **Step 3: Verify the new directory exists**

Run:

```powershell
Get-ChildItem "C:\Users\RookiesTwo\.config\opencode"
```

Expected: the listing now includes an `agents` directory.

### Task 3: Create The Orchestrating Primary Agent

**Files:**
- Create: `C:\Users\RookiesTwo\.config\opencode\agents\superpowersAgent.md`

- [ ] **Step 1: Create `superpowersAgent.md` with primary-agent frontmatter and prompt**

```md
---
description: Use when a task should be executed with superpowers workflows, specialized subagents, and stronger task orchestration than the default coding agent
mode: primary
model: openai/gpt-5.4
reasoningEffort: high
permission:
  skill: allow
  webfetch: allow
  edit: ask
  bash:
    "*": ask
    "pwd": allow
    "git status": allow
    "git status *": allow
    "git diff": allow
    "git diff *": allow
    "git log": allow
    "git log *": allow
    "git show": allow
    "git show *": allow
    "rg *": allow
    "grep *": allow
    "ls": allow
    "ls *": allow
    "dir": allow
    "dir *": allow
    "cat *": allow
    "type *": allow
    "Get-Content *": allow
    "head *": allow
    "tail *": allow
  task:
    "*": deny
    "project-explore": allow
    "project-repo-map": allow
    "project-docs-scan": allow
    "plan-executor": allow
    "project-diff-review": allow
    "project-log-triage": allow
    "project-security-scout": allow
---
You are a superpowers-oriented primary agent.

Your role is to orchestrate work, not to greedily do everything yourself.

Operating rules:
- Follow superpowers skills when they apply.
- Prefer a skill-first, workflow-aware approach.
- Break implementation into bounded tasks.
- Dispatch `plan-executor` for implementation work when a plan or bounded task exists.
- Use `project-explore`, `project-repo-map`, and `project-docs-scan` for read-only context gathering.
- Use `project-diff-review`, `project-log-triage`, and `project-security-scout` for review and diagnosis.
- Keep task boundaries explicit and do not expand scope casually.
- Integrate subagent results, decide next actions, and keep the user informed.
```

- [ ] **Step 2: Verify the file contents after creation**

Run:

```powershell
Get-Content "C:\Users\RookiesTwo\.config\opencode\agents\superpowersAgent.md"
```

Expected: the file includes `mode: primary`, `model: openai/gpt-5.4`, and the task allowlist.

### Task 4: Create The Execution Subagent

**Files:**
- Create: `C:\Users\RookiesTwo\.config\opencode\agents\plan-executor.md`

- [ ] **Step 1: Create `plan-executor.md` with DeepSeek Pro execution settings**

```md
---
description: Use when a single implementation-plan task needs direct code changes, minimal scope, local verification, and structured execution reporting
mode: subagent
model: deepseek/deepseek-v4-pro
temperature: 0.1
steps: 10
reasoningEffort: max
thinking:
  type: enabled
permission:
  skill: allow
  webfetch: allow
  edit: allow
  bash:
    "*": ask
    "pwd": allow
    "git status": allow
    "git status *": allow
    "git diff": allow
    "git diff *": allow
    "git log": allow
    "git log *": allow
    "git show": allow
    "git show *": allow
    "rg *": allow
    "grep *": allow
    "ls": allow
    "ls *": allow
    "dir": allow
    "dir *": allow
    "cat *": allow
    "type *": allow
    "Get-Content *": allow
    "head *": allow
    "tail *": allow
  task:
    "*": deny
    "project-explore": allow
    "project-repo-map": allow
    "project-docs-scan": allow
---
You are a bounded execution subagent.

Your job is to execute one implementation-plan task or one tightly related bundle of steps.

Rules:
- Do not expand scope.
- Read the minimum relevant files first.
- Make the smallest correct change.
- Run the smallest direct verification needed.
- Do not declare success without verification evidence.
- Do not rewrite the plan.
- Do not dispatch other execution agents.

Your final response must include:
- Files changed
- Commands run
- Verification outcome
- Remaining risks or blockers
```

- [ ] **Step 2: Verify the file contents after creation**

Run:

```powershell
Get-Content "C:\Users\RookiesTwo\.config\opencode\agents\plan-executor.md"
```

Expected: the file includes `model: deepseek/deepseek-v4-pro`, `reasoningEffort: max`, and `thinking.type: enabled`.

### Task 5: Create Read-Only Context Subagents

**Files:**
- Create: `C:\Users\RookiesTwo\.config\opencode\agents\project-explore.md`
- Create: `C:\Users\RookiesTwo\.config\opencode\agents\project-repo-map.md`
- Create: `C:\Users\RookiesTwo\.config\opencode\agents\project-docs-scan.md`

- [ ] **Step 1: Create `project-explore.md`**

```md
---
description: Use when quick read-only repository exploration is needed for files, symbols, imports, routes, config, or direct codebase questions
mode: subagent
model: deepseek/deepseek-v4-flash
temperature: 0.1
steps: 8
thinking:
  type: disabled
permission:
  edit: deny
  webfetch: deny
  bash:
    "*": ask
    "pwd": allow
    "git status": allow
    "git status *": allow
    "git diff": allow
    "git diff *": allow
    "git log": allow
    "git log *": allow
    "git show": allow
    "git show *": allow
    "rg *": allow
    "grep *": allow
    "ls": allow
    "ls *": allow
    "dir": allow
    "dir *": allow
    "cat *": allow
    "type *": allow
    "Get-Content *": allow
    "head *": allow
    "tail *": allow
---
You are a fast, read-only exploration agent.
Find the answer quickly, keep results focused, and do not modify files.
```

- [ ] **Step 2: Create `project-repo-map.md`**

```md
---
description: Use when a read-only repository map is needed for architecture, entry points, module boundaries, dependency direction, or major data flows
mode: subagent
model: deepseek/deepseek-v4-flash
steps: 10
reasoningEffort: max
thinking:
  type: enabled
permission:
  edit: deny
  webfetch: deny
  bash:
    "*": ask
    "pwd": allow
    "git status": allow
    "git status *": allow
    "git diff": allow
    "git diff *": allow
    "git log": allow
    "git log *": allow
    "git show": allow
    "git show *": allow
    "rg *": allow
    "grep *": allow
    "ls": allow
    "ls *": allow
    "dir": allow
    "dir *": allow
    "cat *": allow
    "type *": allow
    "Get-Content *": allow
    "head *": allow
    "tail *": allow
---
You are a read-only repository mapper.
Summarize structure, boundaries, entry points, and data flow without changing files.
```

- [ ] **Step 3: Create `project-docs-scan.md`**

```md
---
description: Use when local documentation, comments, readmes, scripts, and config conventions need a quick read-only summary
mode: subagent
model: deepseek/deepseek-v4-flash
temperature: 0.1
steps: 8
thinking:
  type: disabled
permission:
  edit: deny
  webfetch: deny
  bash:
    "*": ask
    "pwd": allow
    "rg *": allow
    "grep *": allow
    "ls": allow
    "ls *": allow
    "dir": allow
    "dir *": allow
    "cat *": allow
    "type *": allow
    "Get-Content *": allow
    "head *": allow
    "tail *": allow
---
You are a read-only documentation scanner.
Summarize only what is relevant to the current question.
```

- [ ] **Step 4: Verify the three files exist and contain the expected model names**

Run:

```powershell
Get-ChildItem "C:\Users\RookiesTwo\.config\opencode\agents"
Get-Content "C:\Users\RookiesTwo\.config\opencode\agents\project-explore.md"
Get-Content "C:\Users\RookiesTwo\.config\opencode\agents\project-repo-map.md"
Get-Content "C:\Users\RookiesTwo\.config\opencode\agents\project-docs-scan.md"
```

Expected: all three files exist and each uses `deepseek/deepseek-v4-flash`.

### Task 6: Create Review And Diagnosis Subagents

**Files:**
- Create: `C:\Users\RookiesTwo\.config\opencode\agents\project-diff-review.md`
- Create: `C:\Users\RookiesTwo\.config\opencode\agents\project-log-triage.md`
- Create: `C:\Users\RookiesTwo\.config\opencode\agents\project-security-scout.md`

- [ ] **Step 1: Create `project-diff-review.md`**

```md
---
description: Use when a read-only first-pass review is needed for diffs, regression risk, missing tests, or risky code changes
mode: subagent
model: deepseek/deepseek-v4-flash
steps: 8
reasoningEffort: max
thinking:
  type: enabled
permission:
  edit: deny
  webfetch: deny
  bash:
    "*": ask
    "pwd": allow
    "git status": allow
    "git status *": allow
    "git diff": allow
    "git diff *": allow
    "git log": allow
    "git log *": allow
    "git show": allow
    "git show *": allow
    "rg *": allow
    "grep *": allow
    "ls": allow
    "ls *": allow
    "dir": allow
    "dir *": allow
    "cat *": allow
    "type *": allow
    "Get-Content *": allow
    "head *": allow
    "tail *": allow
---
You are a read-only diff reviewer.
Prioritize bugs, regressions, missing tests, and risky logic changes.
```

- [ ] **Step 2: Create `project-log-triage.md`**

```md
---
description: Use when logs, stack traces, failing tests, or error output need read-only triage and likely-cause analysis
mode: subagent
model: deepseek/deepseek-v4-flash
steps: 8
reasoningEffort: max
thinking:
  type: enabled
permission:
  edit: deny
  webfetch: deny
  bash:
    "*": ask
    "pwd": allow
    "git status": allow
    "git status *": allow
    "git diff": allow
    "git diff *": allow
    "rg *": allow
    "grep *": allow
    "ls": allow
    "ls *": allow
    "dir": allow
    "dir *": allow
    "cat *": allow
    "type *": allow
    "Get-Content *": allow
    "head *": allow
    "tail *": allow
---
You are a read-only log triage agent.
Explain likely causes, relevant files, and next debugging steps.
```

- [ ] **Step 3: Create `project-security-scout.md`**

```md
---
description: Use when a read-only first-pass local security scan is needed for secrets, injection surfaces, exposed config, or unsafe patterns
mode: subagent
model: deepseek/deepseek-v4-flash
steps: 8
reasoningEffort: max
thinking:
  type: enabled
permission:
  edit: deny
  webfetch: deny
  bash:
    "*": ask
    "pwd": allow
    "git status": allow
    "git status *": allow
    "git diff": allow
    "git diff *": allow
    "rg *": allow
    "grep *": allow
    "ls": allow
    "ls *": allow
    "dir": allow
    "dir *": allow
    "cat *": allow
    "type *": allow
    "Get-Content *": allow
    "head *": allow
    "tail *": allow
---
You are a read-only security scout.
Report preliminary security findings without editing files.
```

- [ ] **Step 4: Verify the three files exist and remain read-only by config**

Run:

```powershell
Get-Content "C:\Users\RookiesTwo\.config\opencode\agents\project-diff-review.md"
Get-Content "C:\Users\RookiesTwo\.config\opencode\agents\project-log-triage.md"
Get-Content "C:\Users\RookiesTwo\.config\opencode\agents\project-security-scout.md"
```

Expected: each file has `mode: subagent` and `permission.edit: deny`.

### Task 7: Final Validation Of The Agent Stack

**Files:**
- Modify: none
- Verify: `C:\Users\RookiesTwo\.config\opencode\opencode.jsonc`, `C:\Users\RookiesTwo\.config\opencode\agents\*.md`

- [ ] **Step 1: Re-read the global config and all agent files together**

Run:

```powershell
Get-Content "C:\Users\RookiesTwo\.config\opencode\opencode.jsonc"
Get-ChildItem "C:\Users\RookiesTwo\.config\opencode\agents"
```

Expected: `deepseek-v4-pro` is registered and all new agent markdown files are present.

- [ ] **Step 2: Manually confirm the core invariants**

Expected checks:

- `default_agent` is still `opencodeAgent`.
- `superpowersAgent` exists as a primary agent.
- `plan-executor` uses `deepseek/deepseek-v4-pro`.
- `plan-executor` has `thinking.type: enabled` and `reasoningEffort: max`.
- `superpowersAgent` can call `plan-executor` and the `project-*` helper agents.
- `plan-executor` can call only `project-explore`, `project-repo-map`, and `project-docs-scan`.
- The review and diagnostic agents are read-only by config.

- [ ] **Step 3: Restart or refresh OpenCode and visually verify the new agents appear**

Manual action:

- Restart the OpenCode session or reload configuration.
- Check that `superpowersAgent` is selectable as a primary agent.
- Check that the new subagents are available for dispatch.

Expected: the new agent stack is visible without replacing `opencodeAgent`.

## Self-Review Notes

- Spec coverage check: the plan covers a new primary agent, execution subagent, read-only helper agents, review/diagnostic helpers, DeepSeek Pro model registration, coexistence with `opencodeAgent`, and bounded task permissions.
- Placeholder scan: no `TODO`, `TBD`, or vague “handle later” language remains.
- Type consistency: all agent names, file paths, and model IDs are consistent with the design spec.
