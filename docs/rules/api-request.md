# API 请求规则（详情）

[`.ruler/api-request.md`](../../.ruler/api-request.md) 已给出硬约束摘要，本文件补充：拦截器字段映射、错误码兼容列表、下载 / 上传特殊场景、跨域 CORS 配置。

## 一、拦截器字段

`packages/effects/request/src/request-client/request-client.ts` 中 `request-client` 实例的拦截器（在 `preset-interceptors.ts` 注入默认行为）：

- 请求注入：`X-Token`（来自 `useUserStore().token`）。
- 响应：成功 → `data`；失败 → `message.error(msg)` 并 `reject(error)`。

具体字段映射以 `preset-interceptors.ts` 与 `modules/` 目录下的实现为准；不要在业务代码里覆盖通用 header。

## 二、错误码兼容

| code              | 含义       | 处理                |
| ----------------- | ---------- | ------------------- |
| `0`               | 成功       | 返回 `data`         |
| `'200'`           | 历史成功   | 返回 `data`         |
| `'APPLY_SUCCESS'` | 历史成功   | 返回 `data`         |
| `true`            | 历史成功   | 返回 `data`         |
| `401`             | 未登录     | 跳登录 + 清理 token |
| `403`             | 无权限     | 提示无权访问        |
| `404`             | 资源不存在 | 提示 404            |
| `500`             | 服务器异常 | 通用错误提示        |

新接口不要扩展成功码；推动后端统一 `0`。

## 三、下载（Blob）

```ts
export async function exportUsers(data: ExportRequest) {
  return request<Blob>({
    url: '/api/user/export',
    method: 'POST',
    data,
    responseType: 'blob',
  });
}
```

调用方：

```ts
const blob = await exportUsers(params);
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `users-${Date.now()}.xlsx`;
a.click();
URL.revokeObjectURL(url);
```

> 仓库**没有** `BasicDownload` / `ExportButton` 等下载复合组件；下载逻辑由 API 层返回 `Blob`，由调用方按需触发。批量导出可在 API 层循环 + 串/并行 `request` 自行拼装。

## 四、上传（FormData）

```ts
export function uploadAvatar(file: File) {
  const form = new FormData();
  form.append('file', file);
  return request<{ url: string }>({
    url: '/api/user/avatar',
    method: 'POST',
    data: form,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
```

> 仓库**没有** `BasicUpload` 等上传复合组件；上传由调用方使用 Naive UI 的 `NUpload` 或直接调用 `request` + `FormData`。分片 / 进度 / 预览由 UI 库或调用方按需实现。

## 五、CORS

本地开发通过 `vite.config.ts` 的 `server.proxy` 把 `/api` 转发到 `apps/backend-mock` 或上游网关；生产环境由网关处理 CORS，前端无需配置。

## 六、SSO / OAuth

`apps/web-naive/src/api/auth.ts` 封装 OAuth code2session、refresh token 等流程；业务页面只调用 `useUserStore().login()`，不要在页面里写 token 缓存逻辑。
