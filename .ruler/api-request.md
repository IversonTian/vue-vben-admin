# API 请求规范

完整细则、错误码兼容列表与示例见 [`../docs/rules/api-request.md`](../docs/rules/api-request.md)。

> 仓库内**没有** `useRequest` / `useFetch` / `useRouteParams` / `useTable` / `useForm` / `useDict` 等通用 hook；`@vben/hooks` 只提供 `useAppConfig` / `usePagination` / `useRefresh` / `useTabs` / `useDesignTokens` / `useContentMaximize` / `useHoverToggle` / `useWatermark` 这类**单一职责** hook。表格用 `useVxeGrid`（来自 `@vben/plugins`），表单用 `useVbenForm`（来自 `@vben-core/form-ui`），一次性取数用 `request` + `onMounted`。

## 一、统一请求封装

- 所有 HTTP 请求必须走 `@vben/request` 提供的 `request` 实例（在 `packages/effects/request/src/index.ts`，由 `request-client/` 目录下的 `request-client.ts` + `preset-interceptors.ts` + `modules/` 组成），**禁止**业务代码直接 `import axios from 'axios'`。
- `request` 默认已配置：
  - 基础 URL（`VITE_GLOB_API_URL`）、超时、`X-Token` 注入。
  - 响应解包：成功返回 `data` 字段，失败自动 `message.error(msg)` 并 `Promise.reject`。
  - 401 自动跳登录并清理 token；403 提示无权访问。
- 标准成功码：`0`；兼容 `'200'` / `'APPLY_SUCCESS'` / `true`（仅历史接口，新接口不要扩展成功码）。

```ts
import { request } from '@vben/request';

export interface UserQueryRequest {
  page: number;
  pageSize: number;
  keyword?: string;
}

export interface UserItem {
  id: string;
  name: string;
}

export interface UserListResponse {
  list: UserItem[];
  total: number;
}

export async function fetchUserList(data: UserQueryRequest) {
  return request<UserListResponse>({
    url: '/api/user/list',
    method: 'POST',
    data,
  });
}
```

## 二、API 封装位置

- **应用内业务接口**：`apps/<app>/src/api/*.ts` + 配套 `*.types.ts`；函数名采用动词开头（`fetchXxx` / `createXxx` / `updateXxx` / `deleteXxx` / `exportXxx`）。
- **跨应用复用接口**：封装到 `packages/effects/<scope>/src/` 下（如 `packages/effects/access/`）。
- **Mock**：`apps/backend-mock` 通过 nitro 提供；本地开发 `VITE_USE_MOCK=true` + `VITE_GLOB_API_URL=/api` 启用，vite proxy 转发到 `http://localhost:5320/api`（见 `apps/web-naive/vite.config.ts` 的 `server.proxy`）。
- 接口路径、固定参数（如 tenant header）封装在 API 层，不散落到页面。

## 三、一次性取数（详情 / 首屏）

仓库**不提供**通用 `useRequest`；推荐两种写法之一：

### 方案 A：`onMounted` + `request`（推荐）

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchUserDetail } from '#/api/user';

const user = ref<UserInfo | null>(null);
const loading = ref(false);

async function load() {
  loading.value = true;
  try {
    user.value = await fetchUserDetail({ id });
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>
```

### 方案 B：VueUse `useAsyncState`

如果项目已依赖 `@vueuse/integrations/useAsyncState`（catalog 内有），可简化 loading 状态：

```ts
import { useAsyncState } from '@vueuse/core';

const {
  state: user,
  isLoading,
  execute,
} = useAsyncState(() => fetchUserDetail({ id }), null);
```

> 不要自己造 `function useRequest(...)`——它已经缺席多年，新代码继续造只会扩散。

## 四、表格：useVxeGrid

仓库表格统一用 **VxeGrid + `useVxeGrid`**（来自 `@vben/plugins`，注册自 `setupVxeTable` 插件）：

```vue
<script setup lang="ts">
import { useVxeGrid } from '@vben/plugins/vxe-table';
import type { VxeGridProps } from 'vxe-table';
import { fetchUserList } from '#/api/user';

interface Row {
  id: string;
  name: string;
}

const gridOptions: VxeGridProps<Row> = {
  columns: [
    { field: 'name', title: '名称' },
    { field: 'email', title: '邮箱' },
  ],
  proxyConfig: {
    ajax: {
      query: ({ page, sorts }) =>
        fetchUserList({ page: page.currentPage, pageSize: page.pageSize }),
    },
  },
};

const [Grid, gridApi] = useVxeGrid({ gridOptions });
</script>

<template>
  <Grid />
</template>
```

分页、loading、列设置、列宽持久化由 `useVxeGrid` 内部管理；**不要**在外层再用 `request + 自写分页 + 手写 loading` 包一层。

## 五、表单：useVbenForm

仓库表单统一用 **`useVbenForm`**（来自 `@vben-core/form-ui`，需先在应用入口 `setupVbenForm` 注册 Naive UI 适配）：

```vue
<script setup lang="ts">
import { useVbenForm } from '#/adapter/form';

const [Form, formApi] = useVbenForm({
  schema: [
    { fieldName: 'name', label: '姓名', component: 'Input' },
    {
      fieldName: 'email',
      label: '邮箱',
      component: 'Input',
      rules: 'required|email',
    },
  ],
  handleSubmit: async (values) => {
    await submitUser(values);
  },
});
</script>

<template>
  <Form />
</template>
```

`#/adapter/form` 在 `apps/<app>/src/adapter/form.ts` 内基于 `useVbenForm` 包装，预先注入 Naive UI 组件映射；不要在每个页面里重复包装。

## 六、特殊场景

- `responseType: 'blob'` 用于下载；调用方自行 `URL.createObjectURL` + `<a download>`。
- `FormData` 上传：API 层显式 `headers: { 'Content-Type': 'multipart/form-data' }`。
- `returnFullPayload`（若启用）：仅用于必须读取 `data` 之外字段的历史接口，必须标注兼容原因。

## 七、禁止事项

- 禁止 `import axios from 'axios'`（除非写新适配层）。
- 禁止页面解析 `{ code, msg, data }`。
- 禁止重复 `message.error`。
- 禁止 API 返回 `Promise<any>`。
- 禁止把接口路径 / 固定 header / tenant 信息散落到页面组件。
- 禁止新增 `Param` / `Payload` / `DTO` / `VO` 作为前端 API 类型后缀。
- 禁止造 `useRequest` / `useTable` / `useForm` / `useDict` —— 仓库已有 `useVxeGrid` / `useVbenForm` / `useAsyncState`，重复造只会扩散。
- 禁止列表页用 `request + 手写分页`；优先用 `useVxeGrid`。
