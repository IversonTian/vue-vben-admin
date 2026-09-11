# 状态管理（Pinia）规范摘要

完整规则见 [`../docs/rules/state-and-stores.md`](../docs/rules/state-and-stores.md)。

## 一、Store 划分

仓库当前只有 **4 个全局 store**，集中在 `packages/stores/src/modules/`：

- `useUserStore`（`user.ts`）：当前用户信息、token、权限码、角色。
- `useAccessStore`（`access.ts`）：权限点 → 路由 / 按钮 / 菜单计算。
- `useTabbarStore`（`tabbar.ts`）：标签页状态（打开的标签、激活标签、固定标签等）。
- `useTimezoneStore`（`timezone.ts`）：全局时区（影响日期格式化、表格列等）。

应用内私有 store 放 `apps/<app>/src/store/`（如 `apps/web-naive/src/store/auth.ts` 的 `useAuthStore`）；不要在 `packages/` 下放应用专属 store。

> **注意**：用户偏好（主题、布局、语言、动画）走 `@vben/preferences`（独立包，`preferences` 对象 + `usePreferences()` composable），**不是 store**。不要新建 `usePreferencesStore` / `useApplicationStore` 这种不存在的 store。

## 二、定义风格

- **Setup Store**（`<script setup>` 风格）优先：

```ts
import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', () => {
  const token = ref<string>('');
  const userInfo = ref<UserInfo | null>(null);

  const isLoggedIn = computed(() => Boolean(token.value));

  function setToken(value: string) {
    token.value = value;
  }

  function logout() {
    token.value = '';
    userInfo.value = null;
  }

  return { token, userInfo, isLoggedIn, setToken, logout };
});
```

- 不写 Options Store（`state() / actions: {}`）风格，仓库统一 setup store。
- 仓库示例见 `packages/stores/src/modules/user.ts`。

## 三、持久化

- 用 `pinia-plugin-persistedstate`，通过 store 的 `persist` 选项配置。
- 持久化键名集中在 `packages/stores/src/modules/<store>.ts` 内的 `persist.key`；当前 store 使用 `pinia` 默认键（`${storeId}`）即可。
- 禁止直接 `localStorage.setItem` / `getItem` 存业务关键状态；走 store 的 `persist` 配置或 VueUse 的 `useStorage`。

## 四、跨应用复用

- store 导出经过 `packages/stores/src/index.ts`；不要从 `packages/stores/src/modules/*` 直接 deep import。
- 业务代码：

```ts
import { useUserStore, useAccessStore } from '@vben/stores';
```

## 五、异步数据来源

- 表单 / 列表 / 字典等运行时数据不要进 store；用组件内的 `onMounted + request` 或 `useVxeGrid`（表格场景）管理。
- store 只放：用户态、权限点、标签页状态、时区——长期不变的全局缓存。
- `@vben/preferences` 通过 `usePreferences()` 读写偏好，本质上是 `useStorage`-like 的 reactive 对象；不要把它包装成 store。
