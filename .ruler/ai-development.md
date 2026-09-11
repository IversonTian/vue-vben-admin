# AI 开发协作规范

约束 AI 在 vue-vben-admin 仓库中分析、生成、修改和审查代码的工作方式。

## 一、规则读取顺序

AI 开始实现前先判断任务类型，并读取对应规则：

1. **全局必读**：`.ruler/coding-style.md`、`.ruler/naming.md`、`.ruler/vue-and-naive-ui.md`。
2. **API / 请求**：`.ruler/api-request.md`、`docs/rules/api-request.md`。
3. **页面/路由**：`.ruler/pages-and-routing.md`、`docs/rules/pages-and-routing.md`。
4. **状态管理**：`.ruler/state-and-stores.md`、`docs/rules/state-and-stores.md`。
5. **i18n**：`.ruler/i18n.md`、`docs/国际化处理.md`。
6. **多 UI 变体差异**：`docs/rules/ui-variants.md`。
7. **包边界**：`.ruler/monorepo-boundaries.md`、`docs/rules/monorepo-boundaries.md`。
8. **Git 分支**：`.ruler/git-branch-workflow.md`。
9. **单测 / 质量门禁**：`docs/rules/testing-and-quality.md`。
10. **变更集 / 发布**：`.changeset/README.md`、`docs/operations/release-and-rollback.md`。

只读规则不够时，必须再找当前 UI 变体或相邻 UI 的真实代码样例，优先模仿项目已有写法。

## 二、标准写法与兼容写法

- **标准写法**：新代码默认采用，可沉淀为模板。
- **兼容写法**：只为旧接口、旧 UI 变体、历史数据或迁移差异服务，不能作为新规范扩散。
- **临时处理**：必须限定边界，并在文档或代码附近说明后续收敛方向。

典型兼容项：

- API：成功码 `'200'` / `'APPLY_SUCCESS'` / `true`、Blob 下载非标准字段、旧 `X-Domain` header。
- UI 变体：`web-antd` / `web-ele` / `web-tdesign` / `web-antdv-next` 的临时差异封装；只为该变体服务的代码不要回流到 `packages/common-ui`。
- 主题：`@vben/preferences` 的旧 key 名（如 `app.theme.mode`）保持兼容，新代码用 `app.theme.darkMode`。
- dayjs 实例：必须从 `@vben/utils` 导入，业务代码不要单独 `import dayjs from 'dayjs'`。

新接口、新页面、新组件不得主动采用兼容写法。确需兼容时，应写清原因，并推动后端 / 平台 / 旧 UI 变体向标准契约收敛。

## 三、生成代码前的上下文要求

实现前至少确认：

- 目标 UI 变体（`web-naive` 是默认主推，其他 UI 变体需用户明确指定，且需先核对 `apps/<name>/` 是否仍在源码树内，详见 [docs/architecture/overview.md](../docs/architecture/overview.md)）。
- 页面路径、路由入口、布局（仓库**只有** `basic.vue` 与 `auth.vue` 两个布局，无 Blank / Iframe）。
- 相关 API 的请求 / 响应契约，标准分页还是旧分页兼容。
- 页面类型：列表、详情、表单弹窗、抽屉、确认弹窗、操作 hook 等。
- 是否有权限码、状态机、上传下载、导出、i18n、字典等横切要求。
- 当前目录或相邻模块是否已有可复用组件、hook、API、字典和类型。
- 涉及 Naive UI（或其他 UI 库）组件时，按包文档查询 API，不凭记忆使用 props。

信息缺失且无法从代码中推断时，先问用户；能从项目中确认时，不要让用户重复提供。

## 四、生成代码标准

- API 必须在 `api/*.ts` 封装，类型在 `*.types.ts`；页面不直接处理 `{ code, msg }`。
- 列表页用 `useVxeGrid`（来自 `@vben/plugins`，基于 `vxe-table` + `vxe-pc-ui`，分页 / 列设置 / 列宽持久化由 hook 内部管理）；筛选用 `useVbenForm`（来自 `@vben-core/form-ui`）。
- 详情页按权限分操作区，数据由 `onMounted + request` 拉取；表单弹窗 / 抽屉用 `useVbenForm`，模态层用 Naive UI 原生 `useModal` / `NModal` / `NDrawer`（**没有** `BasicModal` / `BasicDrawer` 这类复合组件）。
- 弹窗提交后调用 `useVxeGrid` 返回的 `gridApi.query()` / `gridApi.reload()` 刷新列表。
- 上传 / 下载 / 导出：用 Naive UI 原生 `NUpload` / 浏览器 `<a download>` + `request`（无 `BasicUpload` / `BasicDownload` / `ExportButton`）。
- 字典：业务代码 `onMounted + request` 自取，或 `@vueuse/core` 的 `useAsyncState`；**不要**自造 `useDict`（仓库没有此 hook）。
- 展示格式：金额、日期、空值、文件、图片等用 `@vben/utils` 的 `format*` 函数，不要在模板里写 `${formatDate(...)}`。
- 权限：按钮 `v-access:code="['user:create']"`、菜单 / 路由通过 `useAccessStore` 计算。
- i18n：模板里 `t('module.x.y')`；commit 信息、PR 标题中文；新增翻译后跑 `pnpm -F @vben/locales run extract`。
- 状态：跨页全局状态用 Pinia store（`@vben/stores`，仓库只有 4 个：`useUserStore` / `useAccessStore` / `useTabbarStore` / `useTimezoneStore`）；页面内状态用 `ref` / `reactive`。
- 不新增 `any`，不复制类型定义，优先从 API 或共享类型导入。

> 完整组件 / hook 速查见 [`docs/rules/api-request.md`](../docs/rules/api-request.md) 与 [`docs/rules/ui-variants.md`](../docs/rules/ui-variants.md)。

## 五、验证与自检

完成实现后，AI 必须按改动范围选择验证：

- 格式化：`pnpm format` 或 `pnpm exec oxfmt --write <changed-files>`。
- 静态检查：`pnpm exec oxlint <changed-files>` + `pnpm exec eslint <changed-files>`。
- 类型检查：`pnpm -F <package> run typecheck` 或 `pnpm check:type`。
- 单测：`pnpm test:unit`（vitest）；新增工具函数 / 纯函数必须附带单测。
- i18n 改动：`pnpm -F @vben/locales run extract` + 检查目标语言文件 diff。
- 构建风险较高时：`pnpm build:naive` 或 `pnpm -F <app> run build`。
- 跨包变更：`pnpm check:circular` + `pnpm check:dep`；保证依赖方向不破规则。

如果验证因环境、依赖或权限失败，必须说明失败原因和已完成的替代检查。

禁止在普通功能任务中顺手执行全仓格式化。全局格式化必须由用户明确要求，并作为独立任务、独立 diff / commit 收口。

## 六、规则与 Skill 维护

- `.ruler/` 放默认注入的短规则和硬约束摘要，要求短、明确、可审查。
- `docs/rules/` 放按任务读取的详细规则、完整示例和检查清单。
- `docs/` 其它文档放背景解释、兼容原因和迁移说明。
- `.claude/skills/` 放任务流程，例如页面生成、API 封装、代码审查。
- 当 `.ruler` 规则发生变化，相关生成类 / 审查类 Skill 必须同步更新，避免 AI 模板继续产出旧写法。
- 修改跨包边界（新增 / 移动包）时，必须同步更新 `.ruler/monorepo-boundaries.md` 与 `docs/architecture/overview.md`。

## 七、临时产物管理

- AI 临时生成的审计报告、扫描结果、对比清单、截图、日志和中间数据统一放在仓库根目录 `tmp/`。
- 临时产物禁止写入 `docs/`、应用源码、共享库或其它需要提交的目录，也不得加入 Git 暂存区或提交到代码库。
- `tmp/` 中的文件默认可随时删除，不得作为代码、测试或正式文档的运行依赖。
- 只有用户明确确认需要长期维护的内容，才可整理为正式文档迁入 `docs/`；迁入前必须移除本地路径、临时时间戳和已过期结论，并补充适用范围与维护方式。
