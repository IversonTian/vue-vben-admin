# Git 分支规范摘要

## 一、分支命名

- 格式：`<type>/<scope-or-task>-<description>`
- type：`feat` / `fix` / `refactor` / `perf` / `chore` / `docs` / `test` / `build` / `ci` / `style`（commitlint 允许列表）。
- 例子：
  - `feat/web-naive-add-user-export`
  - `fix/stores-clear-token-on-401`
  - `refactor/request-unify-error`
  - `chore/deps-bump-vite-8`

## 二、来源分支

- 默认从 `main` 拉；长生命周期分支（`release/...`）由维护者创建；日常不创建 `release/*`。
- 任务编号 / 来源分支 / 关联 issue 信息不明确时先向用户确认，不要猜。

## 三、scope 边界

- 单 UI 变体应用 scope（如 `feat/web-naive-xxx`）：只允许改该 UI 变体的 `apps/<app>/src/**`、相关 `packages/effects/<ui-variant>/**`、少量本地 styles。
- **禁止**改其他 `apps/*`、`packages/@core/**`、`internal/**`。
- 跨域改动：使用 `cross/<task>-<description>` 或 `core/<task>-<description>` 或 `monorepo/<task>-<description>`，并在 PR 描述里说明影响面。

## 四、PR 与 commit

- commit message 走 commitlint（`feat: add xxx`）；变更集走 changesets（`pnpm changeset`）。
- lefthook 自动跑 `oxlint` / `oxfmt` / `eslint` / `stylelint` / `check:type`；CI 跑 `pnpm check`。
- 不自动 stash / 丢弃 / 覆盖未提交修改；stash 需用户明确授权。

## 五、命令速记

```bash
git fetch origin
git switch -c feat/web-naive-add-user-export main
git push -u origin feat/web-naive-add-user-export
```

PR 标题与 commit message 同规范；PR 描述必须包含变更面、新增配置 / 迁移步骤、截图或录屏、关联 issue。
