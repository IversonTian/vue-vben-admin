# AGENTS.md / CLAUDE.md

> 仓库上下文与编码指引。`.ruler/` 提供给 AI 的默认注入规则（短、可审查），按任务的详细规则见 `docs/rules/`，流程类（生成页面 / 审查 / 创建分支）见 `.claude/skills/`。

## 沟通与文档

- 默认使用简体中文思考与回复；`AGENTS.md` / `CLAUDE.md` / `.ruler` / `docs/` 一律中文。
- 英文仅保留在：标识符（变量/函数/类/文件名）、第三方库与接口字段名、i18n 源语言（默认英文）。

## 技术栈快照

Vue 3.5 + Vite 8 + TypeScript 6 + pnpm 11.16 + turbo 2；多 UI 变体应用（`apps/web-naive` 当前主推，`web-antd` / `web-ele` / `web-tdesign` / `web-antdv-next` 保留）；Pinia 4、Vue Router 5、Vue I18n 11、VueUse 14、Naive UI 2.44、Tailwind CSS 4、Vitest 4、lefthook、changesets。

## 开发命令

```bash
# 安装（首次会触发 postinstall：pnpm -r run --if-present stub）
pnpm install

# 启动
pnpm dev                     # turbo-run dev，并行启动所有 apps
pnpm dev:naive               # 仅 @vben/web-naive

# 构建
pnpm build                   # 全仓
pnpm build:naive             # 仅 web-naive
pnpm build:analyze           # 产出 bundle 分析报告

# 校验（CI 等价）
pnpm check                   # circular + dep + type + cspell
pnpm check:type              # turbo typecheck
pnpm lint                    # vsh lint（oxlint+oxfmt+eslint+stylelint）
pnpm format                  # vsh lint --format
pnpm test:unit               # vitest run --dom

# 单包
pnpm -F @vben/web-naive run dev
pnpm -F @vben/web-naive run typecheck
pnpm -F @vben/web-naive run build:analyze
```

## Git 分支

详见 `.ruler/git-branch-workflow.md`：

- 分支名：`<type>/<scope-or-task>-<description>`，type 取 commitlint 允许列表。
- 单 UI 变体 scope 分支（如 `feat/web-naive-xxx`）禁止改其他 `apps/*`、`packages/@core/**`、`internal/**`。
- 信息不完整时先向用户确认，不猜任务编号或来源分支。
- 不自动 stash / 丢弃 / 覆盖未提交修改。

## 架构（高层）

- **多 UI 变体 Monorepo**，通过 turbo 编排 `apps/*`；不同 UI 变体共享同一套 `@vben/*` 业务包。
- **`apps/`**：最终用户应用，一个 UI 一份（`web-naive` / `web-antd` / `web-ele` / `web-tdesign` / `web-antdv-next`），加 `backend-mock` 提供本地 mock 服务。
- **`packages/`**：可发布的业务/UI 包。`@vben/*` 是面向应用的稳定 API，`@vben-core/*` 是共享 UI 复合组件；`packages/effects/*` 是跨应用 effects（`common-ui` / `hooks` / `request` / `access` / `plugins`）。
- **`internal/`**：构建/工具链本地包（`vite-config` / `tsconfig` / `tailwind-config` / `lint-configs` / `node-utils`），仅本仓消费，不发布。
- **`scripts/`**：仓库级运维脚本（`clean` / `deploy` / `turbo-run` / `vsh`）。

包速查：

| 名字 | 路径 | 角色 |
| --- | --- | --- |
| `@vben/web-naive` | `apps/web-naive` | Naive UI 变体应用（默认主推） |
| `@vben/common-ui` | `packages/effects/common-ui` | 跨应用 UI 页面（About / Authentication / Dashboard / Fallback / Profile）+ 通用组件（`api-component`/`captcha`/`tree`/`json-viewer` 等） |
| `@vben/request` | `packages/effects/request` | Axios 实例与拦截器（`src/index.ts` + `request-client/`） |
| `@vben/stores` | `packages/stores` | 全局 Pinia stores（`useUserStore` / `useAccessStore` / `useTabbarStore` / `useTimezoneStore`） |
| `@vben/hooks` | `packages/effects/hooks` | 业务 hooks（`useAppConfig` / `usePagination` / `useRefresh` / `useTabs` / `useDesignTokens` 等） |
| `@vben/preferences` | `packages/preferences` | 用户偏好包（独立包，非 store；提供 `preferences` / `usePreferences()`） |
| `@vben/locales` | `packages/locales` | vue-i18n 接入与多语言文案（`langs/*.ts`） |
| `@vben/access` | `packages/effects/access` | 权限（`<AccessControl>` 组件、`v-access` 指令、`useAccess()`） |
| `@vben/utils` | `packages/utils` | 纯函数工具 |
| `@vben/icons` | `packages/icons` | Iconify 封装 |
| `@vben/constants` | `packages/constants` | 全局常量与枚举 |
| `@vben/types` | `packages/types` | 共享 TS 类型 |
| `@vben/styles` | `packages/styles` | 全局样式与 CSS 变量 |
| `@vben/plugins` | `packages/effects/plugins` | Vben 插件集合（`setupVxeTable` 等） |
| `@vben/layouts` | `packages/effects/layouts` | 通用布局组件（含 lock-screen / preferences-drawer 等 widgets） |
| `@vben-core/ui-kit` | `packages/@core/ui-kit/{form-ui,layout-ui,menu-ui,popup-ui,shadcn-ui,tabs-ui}` | 跨包共享 UI 复合组件 |
| `@vben-core/base` | `packages/@core/base/{design,typings,shared,icons}` | 基础设计 token / 共享类型与工具 / Iconify 内核 |
| `@vben-core/composables` | `packages/@core/composables` | 跨包 composables（含 `useSimpleLocale`） |
| `@vben-core/preferences` | `packages/@core/preferences` | 默认偏好 schema（被 `@vben/preferences` 扩展） |

## 专题规范

`.ruler/` 只保留默认注入的摘要，按任务的详细规则见 `docs/rules/`：

- API 请求与 useRequest：`.ruler/api-request.md` + `docs/rules/api-request.md`。
- Vue3 / Naive UI 写法：`.ruler/vue-and-naive-ui.md`。
- 页面与路由：`.ruler/pages-and-routing.md` + `docs/rules/pages-and-routing.md`。
- 状态管理（Pinia）：`.ruler/state-and-stores.md` + `docs/rules/state-and-stores.md`。
- 国际化（vue-i18n）：`.ruler/i18n.md`。
- 多 UI 变体差异：`docs/rules/ui-variants.md`。
- 包边界：`.ruler/monorepo-boundaries.md` + `docs/rules/monorepo-boundaries.md`。
- 单测与质量门禁：`docs/rules/testing-and-quality.md`。
- 变更集与发布：`docs/operations/release-and-rollback.md`。

## AI 协作

生成、修改或审查代码前必读 `.ruler/ai-development.md`。要点：

- 先判断任务类型，再读对应 `.ruler/*` 规则，不凭空生成代码。
- 先找当前 UI 变体或相邻 UI 的真实代码样例，优先复用项目已有组件、hook、API、类型。
- 涉及 Naive UI / Element Plus / Ant Design Vue 等组件 props 时按包文档查询，禁止凭记忆使用废弃 props。
- 明确区分标准写法与兼容写法；历史兼容不能沉淀为新增代码规范。
- 临时产物放仓库根 `tmp/`，禁止写入 `docs/`、应用源码、共享库或加入 Git 暂存区。
- 修改 `.ruler` 后同步检查相关 `docs/` 与 `.claude/skills/`，避免脱节。
