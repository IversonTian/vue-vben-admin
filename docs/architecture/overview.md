# 架构总览

vue-vben-admin 是一个基于 Vue 3 + Vite + TypeScript 的多 UI 变体管理后台模板，使用 pnpm + turbo 编排 monorepo。

## 顶层目录

```
.
├── apps/                 # 最终用户应用（一个 UI 一份）
├── packages/             # 业务/UI 共享包
├── internal/             # 构建/工具链（仅本仓消费）
├── scripts/              # 仓库级脚本
├── docs/                 # 文档（本目录）
├── .ruler/               # AI 默认注入规则
├── .claude/skills/       # AI 流程类 Skill
└── .changeset/           # 变更集
```

## 应用层（apps/）

- `apps/web-naive`：Naive UI 2.44（**默认主推**）。
- `apps/web-antd`：Ant Design Vue（保留）。
- `apps/web-antdv-next`：Antdv Next（保留）。
- `apps/web-ele`：Element Plus（保留）。
- `apps/web-tdesign`：TDesign（保留）。
- `apps/backend-mock`：nitro mock 服务，本地 `VITE_USE_MOCK=true` 启用。

每个 UI 变体共享同一套 `@vben/*` 业务包；差异封装在 `packages/effects/<ui-variant>/`。

## 业务包层（packages/）

- `packages/effects/`：跨应用复合 UI、hooks、请求与插件。
  - `common-ui`：跨 UI 变体的**页面级**组件（`About` / `Authentication` / `Dashboard` / `Fallback` / `Profile`）+ 原子组件（`api-component` / `captcha` / `col-page` / `count-to` / `cropper` / `ellipsis-text` / `icon-picker` / `json-viewer` / `loading` / `page` / `resize` / `tippy` / `tree`）。
  - `access`：权限 `<AccessControl>` 组件、`v-access` 指令、`useAccess()` hook、`accessible` 工具。
  - `hooks`：业务 hooks（`useAppConfig` / `usePagination` / `useRefresh` / `useTabs` / `useDesignTokens` / `useContentMaximize` / `useHoverToggle` / `useWatermark`）+ `@vben-core/composables` 透出。
  - `request`：axios 实例（`src/index.ts`）+ `request-client/`（`request-client.ts` + `preset-interceptors.ts` + `modules/`）。
  - `layouts`：通用布局 widgets（`lock-screen` / `preferences-drawer` / `user-dropdown` 等）。
  - `plugins`：Vben 插件集合（`setupVxeTable` / `setupVbenForm` 等）。
- `packages/@core/`：跨包共享的纯实现，**不依赖**任何 `@vben/*`。
  - `base/`：`design`（CSS 变量 / token）、`typings`（共享类型）、`shared`（共享常量与工具）、`icons`（Iconify 内核）。
  - `composables/`：跨包 composables（`useSimpleLocale` 等）。
  - `preferences/`：默认偏好 schema。
  - `ui-kit/`：`form-ui` / `layout-ui` / `menu-ui` / `popup-ui` / `shadcn-ui` / `tabs-ui`。
- `packages/constants` / `packages/types` / `packages/styles` / `packages/locales` / `packages/icons` / `packages/stores` / `packages/utils` / `packages/preferences`：纯模块，可被任何层依赖。
- `packages/stores/src/modules/`：仅 4 个 store —— `user.ts` / `access.ts` / `tabbar.ts` / `timezone.ts`。
- `packages/preferences/`：独立包，提供 `preferences` 对象 + `usePreferences()` composable，**不是 store**。

## 工具链层（internal/）

- `internal/vite-config`：Vite 共享配置（Vue 插件、mock、analyze、compression、pwa）。
- `internal/tsconfig`：TS 基础配置（strict、paths、lib）。
- `internal/tailwind-config`：Tailwind 4 主题与 content 配置。
- `internal/lint-configs`：ESLint / Oxlint / Stylelint / commitlint 配置。
- `internal/node-utils`：仓库脚本共用的 Node 工具（路径、环境变量、git）。

## 构建与编排

- `turbo.json`：定义 `dev` / `build` / `preview` / `typecheck` 任务拓扑。
- `pnpm-workspace.yaml`：声明 workspace + catalog 版本。
- `lefthook.yml`：提交前自动 lint + format + typecheck；提交后自动 install；commit-msg 走 commitlint。
- CI：`.github/workflows/{ci.yml,build.yml,deploy.yml,codeql.yml}`。

## 依赖方向（硬约束）

```
apps/*  →  packages/*  →  packages/@core/*  →  第三方
   ↓           ↓                  ↓
internal/* (vite/tsconfig/tailwind/lint)
```

- `apps/*` 是叶子节点，不可被任何层依赖。
- `@vben-core/*` 不可依赖 `@vben/*`；反之允许。
- `internal/*` 不可被 `apps/*` 直接依赖，通过 `internal/vite-config` 等构建 / 类型层透出。

完整边界规则见 [`.ruler/monorepo-boundaries.md`](../../.ruler/monorepo-boundaries.md)。
