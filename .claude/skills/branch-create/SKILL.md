---
name: branch-create
description: Use when creating a feature/fix branch following vue-vben-admin conventions.
---

# branch-create 创建分支

## 适用

- 新功能、Bug 修复、重构等任务的开发分支。

## 必读

- [`.ruler/git-branch-workflow.md`](../../../.ruler/git-branch-workflow.md)

## 步骤

### 1. 确认来源分支

默认 `main`；维护者创建的 `release/*` 长生命周期分支按需使用。

### 2. 命名

`<type>/<scope-or-task>-<description>`：

- `feat/web-naive-add-user-export`
- `fix/stores-clear-token-on-401`
- `refactor/request-unify-error`
- `chore/deps-bump-vite-8`

### 3. 命令

```bash
git fetch origin
git switch -c feat/web-naive-add-user-export main
git push -u origin feat/web-naive-add-user-export
```

## 自检

- [ ] type 在 commitlint 允许列表内。
- [ ] scope 与改动面匹配；单 UI 变体改动用该 UI 名作 scope。
- [ ] description 简洁（kebab-case、动词开头）。

## 反例

- ❌ `my-branch` / `dev` / `test` 等模糊命名。
- ❌ 不推送就开 PR。
- ❌ 跨 UI 变体改动用单 UI 变体 scope。
- ❌ 直接 `git checkout -b` 不指定来源分支（容易从旧 feature 分支派生）。