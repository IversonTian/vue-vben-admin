# 快速开始

## 环境

- Node 22.18+ 或 24.12+（见 `package.json` 的 `engines.node`）。
- pnpm 11.16+（推荐用 `corepack enable`，按 `packageManager` 自动锁定）。
- 现代浏览器：Chrome 111+ / Edge / Firefox 128+ / Safari 16.4+。

## 安装

```bash
git clone https://github.com/vbenjs/vue-vben-admin.git
cd vue-vben-admin
npm i -g corepack            # 启用 corepack
corepack enable              # 自动按 packageManager 锁定 pnpm@11.16.0
pnpm install                 # 触发 postinstall：pnpm -r run --if-present stub
```

> `postinstall` 会自动 stub 工作区包（如 `@vben/web-naive` → `apps/web-naive/src`），保证 IDE 与 TypeScript 能解析 `@vben/*` 别名。

## 启动

```bash
pnpm dev                     # turbo-run dev，并行启动所有 apps
pnpm dev:naive               # 仅启动 web-naive
```

访问 <http://localhost:5173>（默认端口），账号 `vben` / `123456`。

## 构建

```bash
pnpm build                   # 全仓
pnpm build:naive             # 仅 web-naive
pnpm build:analyze           # 生成 bundle 分析报告（rollup-plugin-visualizer）
```

## 校验

```bash
pnpm check                   # circular + dep + type + cspell
pnpm check:type              # turbo typecheck
pnpm lint                    # vsh lint（oxlint + oxfmt + eslint + stylelint）
pnpm format                  # vsh lint --format
pnpm test:unit               # vitest run --dom
```

## Mock 数据

本地默认走 `apps/backend-mock`（nitro 服务）；开启方式：

```bash
# apps/web-naive/.env.development
VITE_USE_MOCK=true
VITE_GLOB_API_URL=/api       # 由 vite proxy 转发到 backend-mock
```

详见 `apps/web-naive/vite.config.ts` 的 `server.proxy` 配置。

## 推荐 IDE

- VS Code：装官方 Vue 扩展（包含 volar，Vue 3.5+ 已合并）；可选 `TypeScript Vue Plugin (Volar)`。
- WebStorm：内置 Vue 支持，无需插件。

## 提交前

lefthook 自动跑 `oxlint` / `oxfmt` / `eslint` / `stylelint` / `check:type`；commit-msg 走 commitlint。

手动预跑：

```bash
pnpm exec oxlint --fix --type-aware <files>
pnpm exec oxfmt <files>
pnpm exec eslint --fix <files>
pnpm exec stylelint --fix <files>
pnpm check:type
```

## 故障

- `pnpm install` 报 `pnpm: command not found` → `corepack enable && corepack prepare pnpm@11.16.0 --activate`。
- 端口冲突：编辑 `apps/<app>/vite.config.ts` 的 `server.port`。
- turbo 缓存异常：`pnpm -w turbo prune` 或 `rm -rf .turbo`。
- 详见 [operations/troubleshooting.md](../operations/troubleshooting.md)。
