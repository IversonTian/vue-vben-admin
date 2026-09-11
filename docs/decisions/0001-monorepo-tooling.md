# ADR 0001: pnpm + turbo + changesets

## 状态

生效（2025-01 起）。

## 背景

vue-vben-admin 自 v5 起从 npm workspaces + lerna 切换到 pnpm + turbo + changesets，以解决：

- 多 UI 变体并行开发的依赖管理复杂度；
- 包版本同步与变更说明的发布流程；
- turbo 的 task graph 缓存显著减少 CI 时间。

## 决策

- 使用 **pnpm 11+**（含 `catalog`），所有共享依赖版本集中在 `pnpm-workspace.yaml` 的 `catalog`。
- 使用 **turbo 2** 编排 `dev` / `build` / `typecheck` / `preview` 任务，依赖关系通过 `^build` 自动拓扑排序。
- 使用 **changesets** 管理包版本与 changelog，固定组 `[@vben-core/*, @vben/*]` 同步发布（见 `.changeset/config.json` 的 `fixed`）。
- 使用 **lefthook** 替代 husky + lint-staged，串行执行 lint + format + typecheck，避免瞬时资源抢占。
- 使用 **oxlint + oxfmt** 作为快速 lint/format，配合 **eslint** 处理 Vue / 风格细节。

## 影响

- 仓库级 lint 配置集中在 `internal/lint-configs/`，所有包共享；不再在每个包内维护独立 ESLint 配置。
- 任何对 `@vben/*` / `@vben-core/*` 的可发布包变更必须 `pnpm changeset`；CI 会阻断无 changeset 的 release。
- turbo 缓存对 `dev` 任务关闭（`cache: false`），避免 HMR 误命中陈旧产物。
- catalog 化版本：升级共享依赖时改 `pnpm-workspace.yaml` 一处即可。

## 备选方案

- yarn + nx：Nx 适合多 remote 微前端；本仓为多 UI 变体 monorepo，turbo + pnpm 足够轻量。
- bun：当前包管理器为 pnpm；bun 在跨平台脚本兼容性上仍有短板，未采纳。

## 变更

- 2025-09: 精简到仅 `apps/web-naive` 主推，详见 commit `c9f27864f`。
- 2026-09: 补充 [CLAUDE.md](../../CLAUDE.md) 与 [.ruler/](../../.ruler/) AI 规则体系。
