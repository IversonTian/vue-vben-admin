# 页面与路由规则（详情）

[`.ruler/pages-and-routing.md`](../../.ruler/pages-and-routing.md) 已给出硬约束摘要，本文件补充：路由 meta 字段、布局组件差异、菜单生成、权限点接入。

## 一、路由 meta

```ts
export const userRoutes = [
  {
    path: '/system/user',
    name: 'SystemUser',
    component: () => import('#/views/system/user/index.vue'),
    meta: {
      title: 'system.user.title',
      icon: 'mdi:account-multiple',
      order: 100,
      keepAlive: true,
      permissions: ['system:user:read'],
    },
  },
];
```

支持的 meta 字段以 `apps/<app>/src/router/routes/` 的实际声明与 `@vben-core/typings` 的类型为准；新增字段时同步扩展类型并补中文注释。

## 二、布局（**当前只有 2 种**）

仓库**当前只有** 2 个布局组件，定义在 `apps/<app>/src/layouts/`：

- `basic.vue` —— `Basic` 布局：完整后台 chrome（侧边栏 + 顶栏 + 标签页 + 面包屑 + 设置抽屉 + 锁屏）。默认。
- `auth.vue` —— `Auth` 布局：登录、注册、找回密码等免鉴权页，无 chrome。

> **不要新增** `Blank` / `Iframe` / 自定义布局。如需"无 chrome 内容页"，复用 `auth` 或直接放在页面里；嵌入外部页面用 `<iframe>` + `useExternalUrl`。

## 三、菜单生成

`useAccessStore().generateMenus()` 根据路由 + 权限点 + `hideInMenu` 过滤；菜单组件消费 `accessStore.menus`，不要硬编码。

```vue
<script setup lang="ts">
import { useAccessStore } from '@vben/stores';
const accessStore = useAccessStore();
const menus = computed(() => accessStore.generateMenus());
</script>
```

## 四、权限点接入

- 后端返回的权限码通过 `useUserStore()` 注入；
- 路由 `meta.permissions` 在 `apps/<app>/src/router/access.ts` 内校验；
- 按钮：`v-access:code="['user:create']"` 指令或 `@vben/access` 导出的 `AccessControl` 组件；
- 函数内：`useAccess()`（来自 `@vben/access`）。
- 没有权限的路由在路由生成阶段被过滤，且 `addRoute` 不会注册（防 URL 直访）。

## 五、keepAlive

- 路由 meta `keepAlive: true` 时组件被 `<KeepAlive>` 缓存；
- 列表 → 详情 → 返回列表，列表状态保持；该行为受 `@vben/preferences` 的 `preferences.tabbar.enable` / `preferences.keepAlive` 控制；
- 业务组件如果需要在激活时刷新数据，配合 `onActivated` 而不是只依赖 `onMounted`。

## 六、动态参数与守卫

- 动态参数：直接 `useRoute().params.id`（仓库**没有** `useRouteParams` 封装）；配合 `computed` 判断空值守卫：

```vue
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const id = computed(() => useRoute().params.id as string | undefined);

async function load() {
  if (!id.value) return;
  // fetchUserDetail({ id: id.value })
}
onMounted(load);
</script>
```
