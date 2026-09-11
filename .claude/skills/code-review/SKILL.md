---
name: code-review
description: Use when reviewing a diff or PR for correctness, reuse, simplification, and rule compliance in vue-vben-admin.
---

# code-review 审查改动

## 适用范围

- 一次 PR / 一次提交 / `git diff` 工作区改动。
- 关注：规则合规、复用、简化、潜在正确性 bug。

## 必读

- [`.ruler/AGENTS.md`](../../../.ruler/AGENTS.md)
- [`.ruler/coding-style.md`](../../../.ruler/coding-style.md) + [`.ruler/naming.md`](../../../.ruler/naming.md)
- [`.ruler/ai-development.md`](../../../.ruler/ai-development.md)（硬约束）

## 审查维度

### 1. 规则合规（最高优先级）

- [ ] 命名遵守 `.ruler/naming.md`。
- [ ] API 类型符合 `.ruler/api-request.md`。
- [ ] Vue3 写法符合 `.ruler/vue-and-naive-ui.md`。
- [ ] i18n 走 `t(...)`，没有写死中文。
- [ ] 跨包改动符合 `.ruler/monorepo-boundaries.md`。
- [ ] commit message 符合 commitlint。

### 2. 复用

- [ ] 类似组件是否已在 `@vben/common-ui` / `@vben-core/ui-kit` 中存在？
- [ ] 类似 API 封装是否已在 `apps/<app>/src/api/` 存在？
- [ ] 类似 store 是否已在 `@vben/stores` 存在？
- [ ] 是否重新发明了 `useDebounceFn` / `useStorage` 等 VueUse 已提供的工具？

### 3. 简化

- [ ] 是否有可以收敛的分支 / 重复代码？
- [ ] 抽象是否过度（一个实现一个接口）？
- [ ] 是否有未使用的 import / 类型 / 变量？
- [ ] inline style 能否改为 Tailwind utility？

### 4. 正确性

- [ ] 路由参数缺失是否守卫（`useRouteParams`）？
- [ ] 请求失败是否走统一拦截器，没有重复 `message.error`？
- [ ] 副作用是否清理（`onUnmounted` / `useEventListener`）？
- [ ] 类型是否有 `as any` / `// @ts-ignore` 偷懒？
- [ ] 是否有遗漏的边界（空数组 / null / undefined）？

## 输出格式

按"按维度列出 → 严重度排序 → 给修复建议"输出。不要列出已经符合规则的点。

## 反例

- ❌ 全仓格式化作为审查反馈的"顺手建议"。
- ❌ 给出风格化偏好（如"我觉得这里用 NButton 比 NInputButton 好"）作为强制项。
- ❌ 提 bug 但不给具体行号 / 文件路径。
- ❌ 把"风格建议"和"正确性 bug"混在一起不分级。