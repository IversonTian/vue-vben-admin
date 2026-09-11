# 功能开发 SOP

从需求到合并的最小流程。

## 1. 需求澄清

- 与 PO / PM 确认页面路径、UI 变体（默认 web-naive）、交互、权限、状态机。
- 关联后端接口：用 `@vben/request` 的 `request` 函数 + `*.types.ts`。
- 横切项：i18n、字典、上传下载、导出、审批流、租户字段。

## 2. 分支

按 [`.ruler/git-branch-workflow.md`](../../.ruler/git-branch-workflow.md) 命名；默认从 `main` 拉：

```bash
git switch -c feat/<scope>-<description> main
```

## 3. 实现

- 路由：在 `apps/<app>/src/router/routes/<module>.ts` 加静态路由 + meta。
- 页面：`apps/<app>/src/views/<module>/<page>/index.vue`。
- API：`apps/<app>/src/api/<module>.ts` + `*.types.ts`。
- 组件：跨页复用放 `packages/effects/common-ui/src/<Xxx>/`；仅本页面用放 `views/<page>/components/`。
- i18n：组件里 `t('module.<page>.<semantic>')`；新增翻译后跑 `pnpm -F @vben/locales run extract`。
- 校验：`pnpm check:type` + `pnpm test:unit` + `pnpm -F @vben/web-naive run build`。

## 4. 自检 checklist

- [ ] `pnpm lint` 无 warning。
- [ ] `pnpm check:type` 通过。
- [ ] `pnpm test:unit` 通过；新增纯函数已加单测。
- [ ] i18n key 已抽离；新增翻译已跑 `extract`。
- [ ] 改动跨包时 `pnpm check:circular` 通过。
- [ ] 涉及可发布包（`@vben/*`、`@vben-core/*`）已 `pnpm changeset`。

## 5. 提交

```bash
git add .
pnpm commit        # cz-git 交互式提交
git push
```

commitlint 类型：`feat` / `fix` / `refactor` / `perf` / `chore` / `docs` / `test` / `build` / `ci` / `style`。

## 6. 合并

- PR 标题与 commit message 同规范。
- PR 描述必须包含：变更面、新增配置 / 迁移步骤、截图或录屏、关联 issue。
- 至少 1 位 maintainer approve；CI 全绿。
- merge 后由 maintainer 触发 release 工作流（changeset version + publish）。
