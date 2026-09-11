# 故障排查

## pnpm install 失败

- `pnpm: command not found` → `corepack enable && corepack prepare pnpm@11.16.0 --activate`。
- `ERR_PNPM_PEER_DEP_ISSUES` → 检查 `pnpm-workspace.yaml` 的 `overrides` 是否覆盖了冲突 peer。
- `lockfile is incompatible` → `pnpm install` 重新生成；如需强一致 `pnpm install --frozen-lockfile`。
- `Cannot find module '@vben/...'` → 工作区包未 stub：`pnpm install` 重新触发 `postinstall`；或在 IDE 里 Reload TS Server。

## 启动端口冲突

`apps/<app>/vite.config.ts` 的 `server.port`；可改为空闲端口。turbo 任务并行启动所有应用，确保每个应用端口唯一。

```ts
// apps/web-naive/vite.config.ts
export default defineConfig({
  server: { port: 5173, host: '0.0.0.0' },
});
```

## turbo 缓存异常

```bash
rm -rf .turbo node_modules/.cache
pnpm install
pnpm build --force
```

## dev 任务并行启动卡死

`turbo.json` 的 `dev.cache = false` + `persistent = true`；如 IDE 报端口占用，逐个 app 单独启动：

```bash
pnpm -F @vben/web-naive run dev
pnpm -F @vben/backend-mock run dev   # 另一终端
```

## 类型错误 / vue-tsc 卡死

- 关闭 IDE 的 Vue Language Server，改用 vue-tsc 命令行。
- `pnpm check:type` 长时间无输出 → 检查是否有循环依赖（`pnpm check:circular`）。
- 单包先验证：`pnpm -F @vben/web-naive run typecheck`。

## lefthook 没生效

```bash
pnpm prepare
# 检查 .git/hooks/pre-commit 存在并指向 lefthook
ls -la .git/hooks/pre-commit
```

如果 `.git/hooks/pre-commit` 不存在或没指向 lefthook，重新跑 `pnpm prepare`。

## i18n 文案缺失

- 检查 `packages/locales/src/langs/<locale>.ts`；缺 key 时临时 fallback 到 `zh-CN`，并在 PR 描述里推动补齐。
- 跑 `pnpm -F @vben/locales run extract` 让 key 重新对齐。

## 跨包循环依赖

`pnpm check:circular` 会基于 `circular-dependency-scanner` 输出循环；修复方式：抽公共类型到 `@vben/types` 或 `@vben/constants`。

## 构建报 `Cannot find module '@vben/...'`

- 工作区包未 stub：`pnpm install` 重新触发 `postinstall`。
- 或在 IDE 里 Reload TS Server。
- 检查 `apps/<app>/package.json` 是否声明 `"@vben/<name>": "workspace:*"`。

## cspell 报错

- 仓库根 `cspell.json` 维护白名单；新增业务术语加到 `words` 数组。
- 临时跳过：`pnpm check:cspell -- --exclude=<glob>`。

## ESlint / Oxlint 冲突

仓库同时使用 `oxlint` 与 `eslint`：oxlint 跑得快、负责大批量规则；eslint 负责 Vue / 风格细节。两者规则集由 `internal/lint-configs/` 统一管理；不要在包内单独覆盖。

## SSR / Hydration 异常

本仓库为 SPA，不存在 hydration 问题；如果误启用了 SSR 相关插件（如 `vite-plugin-ssr`），检查 `apps/<app>/vite.config.ts` 是否被其它插件错误注入。

## Memory 报错（Node）

```bash
NODE_OPTIONS=--max-old-space-size=8192 pnpm build
```

仓库 `build` 脚本已默认设置该值。
