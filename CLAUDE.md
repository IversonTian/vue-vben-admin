# CLAUDE.md

> 仓库级入口。AI 在 vue-vben-admin 仓库工作时必读。完整规则在 [`.ruler/`](.ruler/)，按任务的详细规则在 [`docs/rules/`](docs/rules/)，流程类 Skill 在 [`.claude/skills/`](.claude/skills/)。

## 沟通与文档

- 默认简体中文思考与回复；`CLAUDE.md` / `AGENTS.md` / `.ruler` / `docs/` 一律中文。
- 标识符、第三方库、接口字段、i18n 源语言默认英文。

## 必读顺序

1. **`.ruler/AGENTS.md`** — 仓库上下文、命令、架构总览。
2. **`.ruler/ai-development.md`** — AI 协作硬约束（必读）。
3. **`.ruler/coding-style.md`** + [`.ruler/naming.md`](.ruler/naming.md) — 风格与命名。
4. **`.ruler/vue-and-naive-ui.md`** — Vue3 / Naive UI 写法。
5. **`.ruler/api-request.md`** — API / 请求封装。
6. **`.ruler/pages-and-routing.md`** + [`.ruler/state-and-stores.md`](.ruler/state-and-stores.md) + [`.ruler/i18n.md`](.ruler/i18n.md) — 路由 / 状态 / 国际化。
7. **`.ruler/monorepo-boundaries.md`** + [`.ruler/git-branch-workflow.md`](.ruler/git-branch-workflow.md) — 包边界 + 分支规范。

## 按任务读

- 新增 / 改 API → [docs/rules/api-request.md](docs/rules/api-request.md)
- 新增 / 改页面 → [docs/rules/pages-and-routing.md](docs/rules/pages-and-routing.md)
- 国际化改动 → [.ruler/i18n.md](.ruler/i18n.md) + [docs/国际化处理.md](docs/国际化处理.md)
- 跨包 / 新包 → [docs/rules/monorepo-boundaries.md](docs/rules/monorepo-boundaries.md)
- 单测 / 质量门禁 → [docs/rules/testing-and-quality.md](docs/rules/testing-and-quality.md)
- 发布 / 变更集 → [docs/operations/release-and-rollback.md](docs/operations/release-and-rollback.md)
- 故障排查 → [docs/operations/troubleshooting.md](docs/operations/troubleshooting.md)
- 架构背景 → [docs/architecture/overview.md](docs/architecture/overview.md)
- 本地启动 → [docs/development/getting-started.md](docs/development/getting-started.md)
- 功能 SOP → [docs/development/feature-development-sop.md](docs/development/feature-development-sop.md)

## Skill（流程类）

- 生成新页面 → [.claude/skills/vben-page/SKILL.md](.claude/skills/vben-page/SKILL.md)
- 封装 API → [.claude/skills/request-api/SKILL.md](.claude/skills/request-api/SKILL.md)
- 审查改动 → [.claude/skills/code-review/SKILL.md](.claude/skills/code-review/SKILL.md)
- 创建分支 → [.claude/skills/branch-create/SKILL.md](.claude/skills/branch-create/SKILL.md)
- pnpm / turbo 调试 → [.claude/skills/pnpm-turbo-tips/SKILL.md](.claude/skills/pnpm-turbo-tips/SKILL.md)

## 临时产物

AI 临时报告 / 截图 / 对比数据放仓库根 `tmp/`，禁止写入 `docs/` 或加入 Git 暂存区。详见 [`.ruler/ai-development.md`](.ruler/ai-development.md) 第七节。

## 工作流

- 不要擅自提交，等用户明确要求
- 涉及第三方组件 API 时先查文档和项目已有实现，禁止凭猜测写
- 修改接口/参数/字段时，向用户确认后端 Controller
- 确认后的改动同步更新本文档
- /code-review 时不要自作主张删除非 AI 生成的代码,应该主动询问,有可能是手到修改的代码
