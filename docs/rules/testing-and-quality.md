# 测试与质量门禁（详情）

## 一、单测（Vitest）

- 命令：`pnpm test:unit`（vitest run --dom）。
- 配置：`vitest.config.ts` + 各包内 `vitest.config.ts`。
- 环境：`happy-dom`。
- 覆盖：纯函数（`@vben/utils`）、store（`@vben/stores`）、复合组件（`@vben/common-ui`）。

模板：

```ts
import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../format-currency';

describe('formatCurrency', () => {
  it('formats CNY', () => {
    expect(formatCurrency(1234.5, 'CNY')).toBe('¥1,234.50');
  });

  it('handles zero', () => {
    expect(formatCurrency(0, 'CNY')).toBe('¥0.00');
  });
});
```

## 二、质量门禁

```bash
pnpm check                   # circular + dep + type + cspell
pnpm check:circular           # vsh check-circular
pnpm check:dep                # vsh check-dep
pnpm check:type               # turbo typecheck
pnpm check:cspell             # 拼写
pnpm lint                     # oxlint + oxfmt + eslint + stylelint
pnpm test:unit                # vitest
```

CI（`.github/workflows/ci.yml`）默认全跑；PR 必须全绿。

## 三、E2E（Playwright）

`.playwright-mcp/` 目录提供本地 Playwright MCP 集成；正式 E2E 用例尚未在仓库内，集成方式由各团队按需接入。

## 四、变更前自检

- [ ] `pnpm lint` 无 error。
- [ ] `pnpm check:type` 通过。
- [ ] `pnpm test:unit` 通过；新增纯函数已加单测。
- [ ] 跨包改动 `pnpm check:circular` 通过。
- [ ] 涉及 `@vben/*` / `@vben-core/*` 已 `pnpm changeset`。

## 五、覆盖率

当前仓库未强制覆盖率门槛；新增纯函数 / composable / store 至少有一个正向 + 一个反向用例。覆盖率报告通过 `pnpm test:unit --coverage` 产生（需在 vitest 配置中开启）。
