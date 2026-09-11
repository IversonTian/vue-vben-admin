# UI 变体差异（详情）

当前仓库支持 `apps/web-naive`（主推）、`apps/web-antd`、`apps/web-antdv-next`、`apps/web-ele`、`apps/web-tdesign`。

## 一、共同点

- 共享同一套 `@vben/*` 业务包；
- 路由、store、i18n、request、preferences 完全一致；
- 主题色与亮 / 暗模式走 `@vben/preferences` + CSS 变量。

## 二、差异

| 变体 | UI 库 | 主题变量来源 | 表格 hook | 表单 hook |
| --- | --- | --- | --- | --- |
| `web-naive` | Naive UI 2.44 | Naive theme overrides | `useVxeGrid` | `useVbenForm`（注入 Naive UI 适配） |
| `web-antd` | Ant Design Vue | Ant Design token | 同上 | 同上（注入 Ant Design Vue 适配） |
| `web-ele` | Element Plus | Element Plus token | 同上 | 同上（注入 Element Plus 适配） |
| `web-tdesign` | TDesign | TDesign token | 同上 | 同上（注入 TDesign 适配） |
| `web-antdv-next` | Antdv Next | Antdv Next token | 同上 | 同上（注入 Antdv Next 适配） |

> 注：仓库**没有** `BasicTable` / `BasicForm` / `BasicModal` 这类复合组件；表格统一用 `useVxeGrid`（来自 `@vben/plugins`，基于 `vxe-table` + `vxe-pc-ui`），表单统一用 `useVbenForm`（来自 `@vben-core/form-ui`），不同 UI 变体的差异主要在 token 与 `useVbenForm` 注入的 UI 适配（见 `apps/<app>/src/adapter/form.ts`）。

## 三、维护策略

- 业务逻辑（store、api、utils、路由）不允许出现 `if (app === 'web-naive')` 分支。
- 差异封装在 `packages/effects/<ui-variant>/`，由各应用 import。
- 新组件只写到 `packages/effects/common-ui/`（跨变体通用）或 `packages/effects/<ui-variant>/`（仅该变体）；不要写到 `apps/<app>/src/components/` 后期待复用。

## 四、新增 / 删除 UI 变体

- 仓库曾在 commit `c9f27864f` 中精简到 `web-naive` 主推；新增 UI 变体前请评估是否真的必要（多 UI 变体的维护成本包括 token、主题、a11y、表单校验组件等）。
- 删除 UI 变体：从 `pnpm-workspace.yaml` 不需要移除（`apps/*` 已批量纳入），只需删除 `apps/<name>/` 目录；并清理 `docs/architecture/overview.md` 与本文件的变体列表。
