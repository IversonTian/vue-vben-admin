# Vue3 / Naive UI 写法规范

## 一、组件写法

- **统一 `<script setup lang="ts">`**：禁 Options API。
- **`defineProps` / `defineEmits` / `defineModel` 宏**：不用 `setup()` 函数式声明。
- **`defineOptions({ name: 'Xxx' })`**：当文件名与组件用途不一致 / 多词组件名需要明确时显式声明。
- **`ref` vs `reactive`**：基础类型与对象都优先 `ref`；`reactive` 仅用于跨多个属性一起变化的复杂对象（表单内部状态除外）。
- **`computed` / `watch` / `watchEffect`**：默认懒求值，按需 `immediate: true`；副作用拆到 composables。
- **泛型组件**（Vue 3.3+）：`<script setup lang="ts" generic="T extends { id: string }">`。

## 二、Naive UI（web-naive）

- 业务代码按需从 `naive-ui` 引入基础组件：`NButton` / `NCard` / `NSpace` / `NDataTable` / `NForm` / `NFormItem` / `NInput` / `NSelect` / `NModal` / `NDrawer` 等。
- **不要**自己封装表格 / 表单 / 弹窗的"Basic 系列"——仓库不提供 `BasicTable` / `BasicForm` / `BasicModal` / `BasicDrawer` 这类复合组件。仓库真实提供的复合组件见 `@vben/common-ui`，但它们是**完整页面级**（`AuthenticationLoginExpiredModal` / `Fallback` / `About` / `Profile` / `Authentication` 等），不是基础原子。
- 主题：通过 `NConfigProvider` + `@vben/preferences` 注入；切换主题时由 `usePreferences()` 触发。
- 国际化：`NConfigProvider` 的 `locale` 与 `@vben/locales` 对齐，切换语言时通过 `usePreferences` 触发。
- 表格：业务统一用 `useVxeGrid`（见 `.ruler/api-request.md` 第四节），不要直接用 `NDataTable`（避免每个页面重复实现列设置、虚拟滚动、密度切换）。
- 表单：业务统一用 `useVbenForm`（见 `.ruler/api-request.md` 第五节），不要直接用 `NForm`。
- 弹窗：优先用 Naive UI 的 `useModal` / `NModal`；如需"打开时加载数据、关闭时清理"的复合弹窗，写在 `packages/effects/common-ui/src/components/` 内（如 `captcha`、`api-component` 等模式）。

## 三、其他 UI 变体

- `web-antd`：Ant Design Vue；`web-ele`：Element Plus；`web-tdesign`：TDesign；`web-antdv-next`：Antdv Next。
- 同一套 `@vben-core/form-ui` + `@vben-core/ui-kit` 跨变体通用；个别基础组件 API 不同（如 `Modal.confirm` vs `ElMessageBox.confirm`），差异封装在 `packages/effects/<ui-variant>/`。
- 详见 [`../docs/rules/ui-variants.md`](../docs/rules/ui-variants.md)。

## 四、TypeScript + 类型

- `withDefaults(defineProps<Props>(), { ... })` 处理可选默认值。
- props 解构后保留响应性：避免解构丢失响应性，需要时 `computed(() => props.x)`。
- 模板 ref：`useTemplateRef('xxx')`（Vue 3.5+）替代旧的 `ref<InstanceType<...>>()`。
- 避免在模板里写复杂表达式；复杂逻辑放 `<script setup>` 用 `computed`。

## 五、生命周期 / Hooks

- `onMounted` / `onUnmounted` / `onActivated` / `onDeactivated` 用于副作用清理；副作用逻辑优先抽到 composables（`useXxx`）。
- `@vueuse/core` 提供的高质量 hook 优先复用：`useDebounceFn` / `useThrottleFn` / `useEventListener` / `useStorage` / `useDark` / `useToggle` / `useTitle` / `useScroll` / `useDraggable` 等。
- **业务 hooks** 优先用 `@vben/hooks` 已提供的（见 [`.ruler/AGENTS.md`](AGENTS.md) 的包速查），不要重新实现 `usePagination` / `useRefresh` / `useTabs`。

## 六、反例

- ❌ 封装 `BasicTable` / `BasicForm` / `BasicModal` / `BasicDrawer` —— 仓库已有 `useVxeGrid` + `useVbenForm` + Naive UI 原生组件。
- ❌ `setup() { return { count: ref(0) } }` 而非 `<script setup>`。
- ❌ Options API + `data()` / `methods` 写法。
- ❌ 业务里写 `document.querySelector` / `addEventListener`；用 `useTemplateRef` / `useEventListener`。
- ❌ 自己造 `useRequest` / `useTable` / `useForm` / `useDict` —— 仓库已有 `useVxeGrid` / `useVbenForm` / `useAsyncState`。
- ❌ 在模板里 `v-if="loading && list.length === 0"` 之类多层嵌套；抽 computed。
