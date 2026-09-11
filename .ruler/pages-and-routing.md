# 页面与路由规范摘要

完整规则见 [`../docs/rules/pages-and-routing.md`](../docs/rules/pages-and-routing.md)。

## 一、路由结构

- 路由统一在 `apps/<app>/src/router/routes/` 内声明（参考 `apps/web-naive/src/router/routes/`）；**禁止**用文件驱动路由。
- `apps/<app>/src/router/` 由四个文件组成：`index.ts`（入口）、`access.ts`（路由权限控制）、`guard.ts`（全局守卫）、`routes/`（路由表）。
- 路由 meta 字段：`title` / `icon` / `order` / `keepAlive` / `hideInMenu` / `roles` / `permissions` / `i18nKey` / `affix` 等；`title` 优先 i18n key。
- 动态路由：用户登录后通过权限点动态 `router.addRoute`；集中在 `routes/async-routes.ts`（参考 `@vben/access` 提供的 `generateRoutes`）。
- 404 / 403 / 500 等兜底路由集中在 `apps/<app>/src/router/routes/fallback-routes.ts`，对应 `@vben/common-ui` 的 `Fallback` 页面。

## 二、页面布局（**当前只有 2 种**）

> 仓库**当前只有** 2 个布局组件，定义在 `apps/<app>/src/layouts/`：
>
> - `basic.vue` —— `Basic` 布局（带侧边栏、头部、面包屑、标签页、设置抽屉、锁屏）。
> - `auth.vue` —— `Auth` 布局（登录、注册等免鉴权页，无 chrome）。
>
> **不要新增** `Blank` / `Iframe` / `Layout1` 等自定义布局；如确需"无 chrome 内容页"，复用 `auth` 或新建页面级组件；嵌入外部页面用 `useExternalUrl` + `<iframe>` 直接在页面里写。

路由 `component` 必须为布局组件 + 子路由。页面根目录：`apps/<app>/src/views/<module>/<page>/index.vue`，目录采用 kebab-case。动态参数：`[id].vue`；嵌套详情子路由：`[id]/xxx.vue`。

## 三、页面与组件命名

- 列表页：`XxxList.vue`；详情页：`XxxDetail.vue`；表单弹窗：`XxxFormModal.vue`；预览：`XxxPreview.vue`。
- 组件文件：`PascalCase.vue`；子组件目录：`components/`（kebab-case）。
- 页面内子组件就近放 `views/<page>/components/`；跨页复用抽到 `@vben/common-ui`（页面级：`Fallback` / `About` / `Profile` / `Authentication`）或 `@vben-core/ui-kit`（原子：`form-ui` / `layout-ui` / `menu-ui` / `popup-ui` / `tabs-ui`）。

## 四、跳转

- `useRouter().push(to)` / `replace(to)` 跳转完整路径；`useRoute()` 仅用于读取，不用于跳转。
- `<router-link>` 仅在菜单 / 面包屑静态结构中使用；条件跳转用 `useRouter`。
- 路由参数缺失：直接 `useRoute().params.id`，配合 `computed` 判断空值守卫；不要 `if (!id) return`。
- 跳转携带 returnTo：用 `useRouter().push({ path, query: { returnTo: ... } })`。

## 五、菜单与权限

- 菜单由 `useAccessStore()` + 路由 meta 计算生成；不要在菜单组件里硬编码列表。
- 权限点接入：
  - 路由 `meta.permissions` 数组：进入路由前校验。
  - 按钮：`v-access:code="['user:create']"` 指令或 `@vben/access` 导出的 `AccessControl` 组件。
  - 函数内：`useAccess()` 组合式（来自 `@vben/access`，见 `packages/effects/access/src/use-access.ts`）。
- 没有权限的路由在路由生成阶段被过滤，且 `addRoute` 不会注册（防 URL 直访）；具体逻辑见 `apps/<app>/src/router/access.ts`。
