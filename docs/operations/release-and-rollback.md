# 发布与回滚

## 发布流程

1. **PR 合并到 `main`** 每次对 `@vben/*` / `@vben-core/*` 的可发布包变更都附 `pnpm changeset` 生成的 `.changeset/*.md`。

2. **Changesets Version（自动 / 手动）** 合并后由 `.github/workflows/release.yml` 触发 `changeset version`：
   - 自动 bump 受 changeset 影响的包；
   - 更新 `CHANGELOG.md`；
   - 创建 `Version Packages` PR。

3. **Publish** `Version Packages` PR 合并后，自动 publish 到 npm（带 provenance）。
   - 固定组 `[@vben-core/*, @vben/*]` 同步版本号（见 `.changeset/config.json` 的 `fixed`）。

4. **GitHub Release** workflow 自动按 tag 创建 GitHub Release 与 changelog 摘要。

## 手动发布（维护者）

```bash
pnpm changeset version
pnpm install --no-frozen-lockfile
git add . && git commit -m "chore: version packages"
git push
# merge 后触发 release workflow
```

## 回滚

- **包回滚**：npm 不支持撤回已发布版本；推荐做法是 publish 一个 patch 版本回退有问题的改动。
- **应用回滚**：
  - 当前版本：`<https://github.com/vbenjs/vue-vben-admin/releases>` 下载对应 tag 的 `dist.zip`，部署。
  - 旧版本镜像：见 `apps/<app>/Dockerfile` 与 `scripts/deploy/`。
- **数据库 / 迁移回滚**：本仓库纯前端，无 DB；如有后端迁移需要协调上游。

## 紧急修复（hotfix）

```bash
git switch -c fix/<scope>-<hotfix-desc> main
# 最小修复 + 单测 + changeset
git push
# 走正常 PR 流程，PR 标题标 [HOTFIX]
```

CI 全绿后通过 changesets patch 发布；不要绕过 CI。

## Snapshot 发布

`.changeset/config.json` 中 `snapshot.prereleaseTemplate = "{tag}-{datetime}"`；snapshot 由维护者按需触发，不进 GitHub Release。
