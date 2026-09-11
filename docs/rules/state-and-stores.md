# Pinia 规则（详情）

[`.ruler/state-and-stores.md`](../../.ruler/state-and-stores.md) 已给出硬约束摘要，本文件补充：当前 4 个 store 的职责、setup store 模板、跨应用共享、SSR / 测试注意。

## 一、当前 4 个全局 store

仓库**只有** 4 个全局 store，集中在 `packages/stores/src/modules/`：

| 文件 | store | 职责 |
| --- | --- | --- |
| `user.ts` | `useUserStore` | 当前用户信息（`userInfo`）、`token`、登录登出 |
| `access.ts` | `useAccessStore` | 权限码、菜单、按钮 / 路由权限计算 |
| `tabbar.ts` | `useTabbarStore` | 标签页打开列表、激活标签、固定标签、关闭等 |
| `timezone.ts` | `useTimezoneStore` | 全局时区，影响日期格式与表格列 |

**不要**新建 `useApplicationStore` / `usePreferencesStore` 这种不存在的 store——

- 偏好数据走 `@vben/preferences`（独立包，提供 `usePreferences()` composable + `preferences` reactive 对象）。
- 应用级元数据（如版权、Logo、版本）通常在 `@vben/preferences` 的 schema 里扩展，或在 `apps/<app>/src/preferences.ts` 内 `defineOverridesPreferences()` 覆盖。

应用内私有 store 放 `apps/<app>/src/store/`（如 `apps/web-naive/src/store/auth.ts` 的 `useAuthStore`）；不要把应用专属 store 放进 `@vben/stores`。

## 二、Setup Store 模板

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

实际仓库代码见 `packages/stores/src/modules/user.ts`。

## 三、持久化

用 `pinia-plugin-persistedstate`；具体键名以 store 内 `persist` 配置为准（当前实现使用 pinia 默认键 `${storeId}`）。`persist.pick` 显式声明要持久化的字段；不要 `persist: true` 持久化整个 store。

## 四、跨应用共享

store 通过 `packages/stores/src/index.ts` 统一 re-export：

```ts
import {
  useUserStore,
  useAccessStore,
  useTabbarStore,
  useTimezoneStore,
} from '@vben/stores';
```

不要 `import { useUserStore } from '@vben/stores/src/modules/user'` 这种 deep import。

## 五、SSR / 测试注意

- store 顶层引用 `localStorage` / `window` 时必须 lazy 读取，避免 SSR 或 vitest 单测报错。
- 单测里使用 `setActivePinia(createPinia())` 隔离 store 状态。
