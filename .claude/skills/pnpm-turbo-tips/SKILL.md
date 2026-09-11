---
name: pnpm-turbo-tips
description: Use when running pnpm/turbo tasks and needing to debug slow / stuck / failed runs in vue-vben-admin.
---

# pnpm-turbo-tips 调试 monorepo 任务

## 常用命令速查

```bash
# 单包运行
pnpm -F @vben/web-naive run dev
pnpm -F @vben/web-naive run build
pnpm -F @vben/web-naive run typecheck

# 仓库根（turbo-run）
pnpm dev                    # turbo-run dev，并行启动所有 apps
pnpm build                  # turbo build

# 校验
pnpm check                  # circular + dep + type + cspell
pnpm check:circular
pnpm check:dep
pnpm check:type
pnpm check:cspell

# 单测
pnpm test:unit              # vitest run --dom
pnpm -F @vben/utils test    # 仅 utils 包

# 格式 / lint
pnpm format                 # vsh lint --format
pnpm lint                   # vsh lint

# 变更集
pnpm changeset              # czg-style 交互式
```

## 调试

### turbo 缓存异常

```bash
rm -rf .turbo node_modules/.cache
pnpm install
pnpm build --force
```

### dev 任务并行启动卡死

`turbo.json` 的 `dev.cache = false` + `persistent = true`；如 IDE 报端口占用，逐个 app 单独启动：

```bash
pnpm -F @vben/web-naive run dev
pnpm -F @vben/backend-mock run dev   # 另一终端
```

### typecheck 长时无输出

```bash
# 单包先验证
pnpm -F @vben/web-naive run typecheck
```

如仍卡住，检查 `internal/tsconfig` 是否有路径解析问题（`paths` 字段）。

### 循环依赖

```bash
pnpm check:circular
# 输出 example.circular: A -> B -> C -> A
# 修复：抽公共类型/常量到 @vben/types 或 @vben/constants
```

### pnpm store 校验失败

```bash
pnpm store prune
pnpm install
```

### 缓存与产物清理（nuclear）

```bash
pnpm clean                  # 删 dist/ .turbo/ .vite/ 等
pnpm reinstall              # clean + install
```

### 工作区包未 stub

```bash
pnpm install                # 重新触发 postinstall: pnpm -r run --if-present stub
```

## 反例

- ❌ 在 root 直接 `vite` 启动（绕过 turbo 任务编排，可能与其它 app 端口冲突）。
- ❌ 跨包改完不跑 `pnpm check:circular` / `check:dep`。
- ❌ 提交前不跑 `pnpm format`，依赖 CI 校验（CI 失败率高）。
- ❌ 不看 turbo 错误就直接 `rm -rf node_modules` 重装（应先 `turbo prune` / `pnpm store prune`）。