# Monorepo 包边界摘要

完整规则见 `docs/rules/monorepo-boundaries.md`。

## 一、四层结构

| 层 | 路径 | 发布？ | 依赖方向 |
| --- | --- | --- | --- |
| 应用 | `apps/<ui-app>/*` | 否 | → `@vben/*`、`@vben-core/*`、`internal/*`、第三方 |
| 业务包 | `packages/<scope>/*` 与 `packages/effects/*` | 部分 | → `@vben-core/*`、`internal/*`、第三方 |
| Core 包 | `packages/@core/{base,composables,preferences,ui-kit}/*` | 部分（`@vben-core/*`） | → 第三方 |
| 工具链 | `internal/{vite-config,tsconfig,tailwind-config,lint-configs,node-utils}/*` | 否 | 仅自身依赖 |

### Core 包实际细分

`packages/@core/` 下分两组（各为独立 workspace 包）：

- **`@vben-core/base`**：`design`（CSS 变量 / token）、`typings`（共享类型）、`shared`（共享常量与工具）、`icons`（Iconify 内核）。最低层，不依赖任何其它 `@vben*`。
- **`@vben-core/composables`**：跨包 composables（如 `useSimpleLocale`）；依赖 `@vben-core/base`。
- **`@vben-core/preferences`**：默认偏好 schema；依赖 `@vben-core/base`。
- **`@vben-core/ui-kit`**：`form-ui` / `layout-ui` / `menu-ui` / `popup-ui` / `shadcn-ui` / `tabs-ui`；依赖 `@vben-core/base`，**不依赖 `@vben/*`**。

## 二、硬约束

- **`apps/*` 不得被任何其它层依赖**；只作为叶子节点。
- **`@vben-core/*` 不得依赖 `@vben/*`**；反之允许（`@vben/*` 可组合 `@vben-core/*`）。
- **`internal/*` 不得被 `apps/*` 直接依赖**；通过 `internal/vite-config`、`internal/tsconfig` 等在构建 / 类型层透出。
- **`packages/utils` / `packages/constants` / `packages/types` / `packages/styles`** 是纯模块，可被任何层依赖；但不得依赖 `@vben/*` 或 `apps/*`。
- **跨包复用组件**：先看 `@vben-core/ui-kit`（`form-ui` / `layout-ui` / `menu-ui` / `popup-ui` / `shadcn-ui` / `tabs-ui`）是否已有；其次 `@vben/common-ui`（`packages/effects/common-ui`）；都没有再考虑新建。

## 三、变更集（changesets）

- 任何对 `@vben/*` 或 `@vben-core/*` 的可发布包变更必须 `pnpm changeset` 提交；CI 会阻断无 changeset 的 release。
- changeset 文件放 `.changeset/*.md`，frontmatter 写 `package-name: patch|minor|major`。
- 私有包（`apps/*`、`internal/*`、部分 `packages/styles`/`packages/locales`）允许不打 changeset。

## 四、跨包复用 checklist

把 `apps/<app>/src/X` 抽到 `packages/<scope>/<name>`：

- [ ] 在 `packages/<scope>/<name>/package.json` 声明依赖与 peer。
- [ ] 在 `packages/<scope>/<name>/src/index.ts` re-export 对外 API。
- [ ] `apps/<app>/package.json` 加入 `"@vben/<name>": "workspace:*"`。
- [ ] `pnpm install` 触发 stub。
- [ ] `pnpm check:dep` 确认依赖方向无破规；`pnpm check:circular` 通过。
- [ ] 如果涉及可发布 API，更新 `docs/architecture/overview.md` 与本文件。

## 五、目录裁剪记录

仓库曾在 commit `c9f27864f` 中把多 UI 变体精简到当前 `apps/web-naive` 主推；新增 UI 变体前先确认 `apps/<name>/src` 与 `packages/effects/<name>/` 是否齐全，不要重复造已有 UI 变体的封装。
