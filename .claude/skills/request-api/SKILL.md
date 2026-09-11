---
name: request-api
description: Use when wrapping a backend API endpoint as a typed request function following vue-vben-admin conventions.
---

# request-api 封装 API

## 适用

- 新增 / 修改 `apps/<app>/src/api/*.ts` 或 `packages/effects/*/src/api/*.ts`。
- 需要给出请求 / 响应 TS 类型，遵循 `XxxRequest` / `XxxResponse` 命名。

## 必读

- [`.ruler/api-request.md`](../../../.ruler/api-request.md)
- [`docs/rules/api-request.md`](../../../docs/rules/api-request.md)

## 步骤

### 1. 类型先行

`apps/<app>/src/api/<module>.types.ts`：

```ts
export interface UserQueryRequest {
  page: number;
  pageSize: number;
  keyword?: string;
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
}

export interface UserListResponse {
  list: UserItem[];
  total: number;
}
```

### 2. 函数

`apps/<app>/src/api/<module>.ts`：

```ts
import { request } from '@vben/request';
import type { UserQueryRequest, UserListResponse } from './user.types';

export async function fetchUserList(data: UserQueryRequest) {
  return request<UserListResponse>({
    url: '/api/user/list',
    method: 'POST',
    data,
  });
}
```

### 3. 命名

- 查询：`fetchXxxList` / `fetchXxxDetail`
- 提交：`createXxx` / `updateXxx` / `deleteXxx` / `submitXxx` / `approveXxx`
- 导出：`exportXxx`（返回 Blob）
- 上传：`uploadXxx`（FormData）

### 4. 自检

- [ ] 入参 / 出参类型已声明。
- [ ] 函数名动词开头。
- [ ] 接口路径固定在 API 层。
- [ ] 没有 `any`。
- [ ] 没有手写 `{ code, msg, data }` 解析。

## 反例

- ❌ 函数返回 `Promise<any>`。
- ❌ 直接 `import axios`。
- ❌ 把 `URL` 写在页面里。
- ❌ 类型用 `Param` / `Params` / `Payload` / `DTO` / `VO` 后缀。
- ❌ 同一接口在多个文件重复封装。