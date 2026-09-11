# 编码风格摘要

## 一、格式化（oxfmt）

- 仓库根 `oxfmt.config.ts` 为统一配置；缩进 2 空格、LF 行尾、UTF-8、文件末尾换行；单引号、对象/数组尾随逗号（ES5 风格）、`printWidth: 100`。
- 仅格式化本次改动文件；禁止在功能改动中顺手全仓格式化。
- 全仓格式化必须作为独立任务、独立 diff / commit 收口。
- `AGENTS.md` / `CLAUDE.md` / `.changeset/*.md` 等由工具生成或审查用的文件不要手改；改 `.ruler/*` 源规则后按需格式化生成结果。

## 二、Lint 与类型

- 提交时由 lefthook 串行执行：`oxlint`（含 type-aware）→ `oxfmt` → `eslint` → `stylelint` → `cspell` → `checkDocsLinks` → `check:type`（见根 `lefthook.yml`）；新增两步只跑 `{.ruler,.claude,docs}/**/*.md,CLAUDE.md` 范围的 staged 文件。
- CI 等价：`pnpm check` = `check:circular + check:dep + check:docs + check:type + check:cspell`，缺一不可。
- TypeScript `strict: true`；禁止 `any`，必要时 `unknown` + 类型守卫；禁止 `// @ts-ignore`，必要时 `// @ts-expect-error` 附原因。

## 三、Import 顺序

按 Vue/标准库 → `@/...`（应用内 alias）→ `@vben/*` / `@vben-core/*` → 第三方 → 相对路径分组，组间空行；纯类型用 `import type`。

- **dayjs**：业务代码禁止 `import dayjs from 'dayjs'`，统一从 `@vben/utils` 引入项目标准实例（封装了 locale 与插件）。
- **axios**：禁止业务代码直接 `import axios from 'axios'`；统一通过 `@vben/request` 的 `request`。

## 四、样式与布局

- **UI 库组件优先**：`web-naive` 用 Naive UI；`web-antd` 用 Ant Design Vue；`web-ele` 用 Element Plus；`web-tdesign` 用 TDesign。容器、间距、卡片、布局、表格、表单优先用库内组件，不用原生 HTML + 自写 CSS 重造。
- **Tailwind CSS 4**：组件无法覆盖的细粒度样式用 utility class（`text-sm`、`truncate`、`rounded`）。
- **CSS Variables / 设计 token**：主题色、间距等通过 `@vben/styles` 暴露的 CSS 变量消费，禁止业务里写死 hex / px。
- **Inline style 仅用于**：动态计算值（高度、宽度、坐标），禁止用 inline style 写主题色或固定文案样式。

## 五、Vue 文件结构

每个 `.vue` 文件统一顺序：`<script setup lang="ts">` → `<template>` → `<style scoped>`；模板里只放结构与少量 `v-if`/`v-for`/class 绑定，复杂计算放 `<script setup>`。
