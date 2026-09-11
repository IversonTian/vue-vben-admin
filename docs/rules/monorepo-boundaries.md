# Monorepo 边界规则（详情）

[`.ruler/monorepo-boundaries.md`](../../.ruler/monorepo-boundaries.md) 已给出硬约束摘要，本文件补充：实际依赖图、Core 包细分、跨包迁移 checklist、新包创建步骤。

## 一、依赖图（自检命令）

```bash
pnpm check:dep               # 输出违规依赖
pnpm check:circular          # 输出循环依赖
```

`vsh check-dep` 基于 `@manypkg/get-packages` 扫描 `dependencies` / `devDependencies` / `peerDependencies`，禁止逆向依赖（`apps → packages`、`packages → packages/@core`）。

## 二、`@vben-core` 包细分

`packages/@core/` 下分四组（独立 workspace 包，全部以 `@vben-core/*` 命名发布）：

| 包 | 路径 | 依赖 |
| --- | --- | --- |
| `@vben-core/base` | `packages/@core/base/{design,typings,shared,icons}` | 仅第三方（最低层） |
| `@vben-core/composables` | `packages/@core/composables` | → `@vben-core/base` |
| `@vben-core/preferences` | `packages/@core/preferences` | → `@vben-core/base` |
| `@vben-core/ui-kit` | `packages/@core/ui-kit/{form-ui,layout-ui,menu-ui,popup-ui,shadcn-ui,tabs-ui}` | → `@vben-core/base`（不依赖 `@vben/*`） |

`@vben-core/ui-kit` 的 `form-ui` 提供 `useVbenForm`；`layout-ui` / `menu-ui` / `popup-ui` / `tabs-ui` 是底层 UI 复合组件。

## 三、跨包迁移 checklist

把 `apps/<app>/src/X` 抽到 `packages/<scope>/<name>`：

- [ ] 在 `packages/<scope>/<name>/package.json` 声明依赖与 peer。
- [ ] 在 `packages/<scope>/<name>/src/index.ts` re-export 对外 API。
- [ ] `apps/<app>/package.json` 加入 `"@vben/<name>": "workspace:*"`。
- [ ] `pnpm install` 触发 stub。
- [ ] `pnpm check:dep` 确认依赖方向无破规。
- [ ] 如果涉及可发布 API，更新 [docs/architecture/overview.md](../architecture/overview.md) 与本文件。

## 四、新包创建步骤

1. `packages/<scope>/<name>/package.json`，name 形如 `@vben/<name>` 或 `@vben-core/<name>`。
2. `packages/<scope>/<name>/tsconfig.json`，extends `@vben/tsconfig`。
3. `packages/<scope>/<name>/src/index.ts`，按需 re-export。
4. 提交 PR 时附 changeset（如果会发布）。
5. 更新 [docs/architecture/overview.md](../architecture/overview.md) 的包速查表。

## 五、新 UI 变体创建

不推荐在当前仓库新增 UI 变体（详见 commit `c9f27864f` 精简背景）；如必须：

- 复制 `apps/web-naive` 目录并重命名。
- 在 `packages/effects/<ui-variant>/` 建立独立封装。
- `pnpm-workspace.yaml` 不变（`apps/*` 已在 workspace 内）。
- `turbo.json` 的 task 拓扑不变。
- 在 [docs/rules/ui-variants.md](ui-variants.md) 记录差异。

## 六、跨包 deep import 禁止

```ts
// ❌ 禁止
import { useVbenForm } from '@vben-core/form-ui/src/use-vben-form';
import { useVxeGrid } from '@vben/plugins/vxe-table/src/use-vxe-grid.vue';

// ✅ 正确
import { useVbenForm } from '@vben-core/form-ui';
import { useVxeGrid } from '@vben/plugins/vxe-table';
```

各包通过 `package.json` 的 `exports` 字段约束对外入口；deep import 绕过了版本控制，未来重构会失效。
