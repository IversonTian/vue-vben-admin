# 命名规范摘要

生成或修改代码时，组件、interface/type、文件/目录、Pinia store、API 函数的命名必须遵守以下硬约束。

## 一、Vue 组件

- 组件名**不加** `Page` / `Index` / `View` 后缀：
  - 列表页：`UserList`（不是 `UserListIndex`）
  - 详情页：`UserDetail`（不是 `UserDetailPage`）
  - 表单弹窗：`UserForm`、`UserFormModal`
- **多词组件名强制**：除 `App` / `Default` / `Home` 等根级组件外，自定义组件名必须 ≥ 2 个词（`UserCard` 而非 `Card`），避免与原生 HTML 元素冲突并通过 ESLint 校验。
- 统一 `<script setup lang="ts">` + 组合式 API；不写 Options API。
- 命名导出：`<script setup>` 默认即闭合组件；纯工具组件用 `export function Xxx(...)`。
- 多词组件名 + 文件名一致：`<UserCard />` 写在 `UserCard.vue`。

## 二、TypeScript Interface / Type

- **禁止** interface/type 与组件同名；用后缀区分：
  - 组件 props：`组件名 + Props`（如 `UserCardProps`）。
  - 业务数据类型：`UserInfo` / `UserItem` / `UserRecord`。
  - API 请求：`XxxRequest`（按语义细化为 `XxxQueryRequest` / `XxxListRequest` / `XxxCreateRequest` / `XxxUpdateRequest` / `XxxDeleteRequest`）。
  - API 响应：`XxxResponse`（`XxxListResponse`、`XxxDetailResponse`）。
  - 嵌套业务结构：用 `Item` / `Info` / `Config` / `Group` / `Record`，不套 `Request`/`Response`。
- **前端 API 类型禁止**新增 `Param` / `Params` / `Payload` / `DTO` / `VO` 后缀；迁移历史类型时改为项目命名。
- 类型只在一处 `export`，其他文件 `import type` 引用；禁止重复定义。

## 三、文件与目录

- 目录：**kebab-case**（如 `user-card/`、`balance-settlement/`）。
- Vue 组件文件：**PascalCase**（如 `UserCard.vue` / `UserFormModal.vue`）。
- 页面入口：`index.vue`；动态参数文件：`[id].vue`。
- 子组件目录：`components/`（小写）；工具目录：`utils/` / `composables/` / `hooks/` / `stores/`。
- Pinia store 文件：`useXxxStore.ts`（如 `useUserStore.ts`）。
- API 函数文件：`xxx.ts` + 配套 `xxx.types.ts`；函数名采用动词开头（`fetchXxx` / `createXxx` / `updateXxx` / `deleteXxx` / `exportXxx`）。
- 测试文件：`*.test.ts` 或 `*.spec.ts`，与被测文件同目录或集中在 `__tests__/`。

## 四、CSS / i18n key

- 业务 key 加命名空间前缀 `模块.子模块.语义`（如 `system.user.form.title`），由 `vue-i18n` 提取工具按文件归集到 `packages/locales/src/langs/<locale>.ts`。
- 模板里写 `t('system.user.form.title')`，不要在模板或脚本里拼接字符串。
