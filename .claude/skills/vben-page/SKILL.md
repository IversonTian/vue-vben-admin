---
name: vben-page
description: Use when generating or modifying a Vben admin page (list / detail / form modal / drawer) following vue-vben-admin conventions. Reads .ruler/ rules and applies them.
---

# vben-page 生成新页面

## 适用

- 新增 / 修改 `apps/<ui-variant>/src/views/<module>/<page>/`。
- 页面类型：列表、详情、表单弹窗、抽屉表单。

## 必读

1. [`.ruler/AGENTS.md`](../../../.ruler/AGENTS.md)
2. [`.ruler/coding-style.md`](../../../.ruler/coding-style.md) + [`.ruler/naming.md`](../../../.ruler/naming.md)
3. [`.ruler/vue-and-naive-ui.md`](../../../.ruler/vue-and-naive-ui.md)（或当前 UI 变体对应文件）
4. [`.ruler/pages-and-routing.md`](../../../.ruler/pages-and-routing.md) + [`docs/rules/pages-and-routing.md`](../../../docs/rules/pages-and-routing.md)
5. [`.ruler/api-request.md`](../../../.ruler/api-request.md)
6. [`.ruler/i18n.md`](../../../.ruler/i18n.md) + [`docs/国际化处理.md`](../../../docs/国际化处理.md)

## 步骤

### 1. 路由

在 `apps/<app>/src/router/routes/<module>.ts` 加静态路由（meta 含 `title` / `icon` / `permissions` / `keepAlive`），如该路由属动态注册则用 `router.addRoute` 并接入 `useAccessStore`。

### 2. API

`apps/<app>/src/api/<module>.ts` + `*.types.ts`：

```ts
import { request } from '@vben/request';

export interface UserQueryRequest {
  page: number;
  pageSize: number;
  keyword?: string;
}

export async function fetchUserList(data: UserQueryRequest) {
  return request<UserListResponse>({
    url: '/api/user/list',
    method: 'POST',
    data,
  });
}
```

类型写在同目录 `*.types.ts`，按 `.ruler/naming.md` 后缀规则命名。

### 3. 页面

`apps/<app>/src/views/<module>/<page>/index.vue`：

- **列表**：表格用 `useVxeGrid`（来自 `@vben/plugins`，注册自 `setupVxeTable`），分页 / loading / 列设置由 hook 内部管理。
- **详情**：直接展示 `onMounted` + `request` 取到的数据，无复合组件可复用；如需"标题 + 返回 + 分区"布局，参考 `apps/web-naive/src/views/_core/profile/index.vue` 风格。
- **表单弹窗 / 抽屉表单**：`useVbenForm`（来自 `@vben-core/form-ui`，通过 `apps/<app>/src/adapter/form.ts` 注入当前 UI 变体）。

子组件就近放 `views/<page>/components/`；跨页复用抽到 [`@vben/common-ui`](../../../packages/effects/common-ui/)（页面级：`Fallback` / `About` / `Profile` / `Authentication`）或 [`@vben-core/ui-kit`](../../../packages/@core/ui-kit/)（原子：`form-ui` / `layout-ui` / `menu-ui` / `popup-ui` / `tabs-ui`）。

### 4. i18n

模板里写 `t('module.<page>.<semantic>')`；新增翻译后跑：

```bash
pnpm -F @vben/locales run extract
```

### 5. 校验

```bash
pnpm exec oxlint <files>
pnpm exec oxfmt <files>
pnpm exec eslint <files>
pnpm -F @vben/web-naive run typecheck
pnpm test:unit
```

## 反例

- ❌ 列表页用 `useRequest + 自写 NDataTable`：用 `useVxeGrid`（已封装分页 / loading / 列设置 / 列宽持久化）。
- ❌ 自造 `BasicTable` / `BasicForm` / `BasicModal` / `BasicDrawer`：仓库没有这些组件，用 `useVxeGrid` + `useVbenForm` + Naive UI 原生组件。
- ❌ 自造 `useTable` / `useForm` / `useDict` / `useRequest`：仓库没有这些 hook，用 `useVxeGrid` / `useVbenForm` / `useAsyncState`（`@vueuse/core`）。
- ❌ 路由 meta 直接写中文 title：用 i18n key。
- ❌ 把通用页面级组件放到 `apps/<app>/src/components/` 后期待复用：抽到 `@vben/common-ui`（`Fallback` / `About` / `Profile` 等）。
- ❌ 业务代码 `import axios from 'axios'`：用 `@vben/request`。