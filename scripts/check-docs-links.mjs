#!/usr/bin/env node
/**
 * 校验 .ruler/、.claude/、docs/、CLAUDE.md 内 Markdown 相对链接是否悬空。
 *
 * 用法：
 *   node scripts/check-docs-links.mjs [path ...]
 *
 * 不传参：扫描 .ruler/、.claude/、docs/、CLAUDE.md 全部 .md。
 * 传参：只扫描指定路径（用于 lefthook 的 staged files 过滤）。
 *
 * 退出码：0 = 全部通过；1 = 有悬空链接或没有匹配到任何文件。
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DEFAULT_TARGETS = ['.ruler', '.claude', 'docs', 'CLAUDE.md'];

const MD_LINK_RE = /\[[^\]]+\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const IGNORE_PREFIX_RE = /^(https?:|mailto:|ftp:|#|tel:|data:|javascript:)/;
const FENCE_RE = /```[\s\S]*?```|~~~[\s\S]*?~~~/g;
const DOT_DIR_ALLOW = new Set(['.claude', '.ruler']);

// 一次 readdirSync 拿全树 Dirent，避免每子目录一次 syscall。
function walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { recursive: true, withFileTypes: true });
  } catch {
    return [];
  }
  const out = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith('.md')) continue;
    // 跳过 node_modules 与非白名单的隐藏目录（.cache / .git 等）。
    const parts = entry.parentPath.split(/[\\/]/);
    if (parts.includes('node_modules')) continue;
    if (parts.some((p) => p.startsWith('.') && !DOT_DIR_ALLOW.has(p))) continue;
    out.push(join(entry.parentPath, entry.name));
  }
  return out;
}

function listFiles(targets) {
  const files = [];
  for (const target of targets) {
    const abs = isAbsolute(target) ? target : join(ROOT, target);
    let stat;
    try {
      stat = statSync(abs);
    } catch {
      console.error(`✗ Missing root: ${target}`);
      continue;
    }
    if (stat.isFile()) {
      if (abs.endsWith('.md')) files.push(abs);
    } else {
      for (const file of walk(abs)) files.push(file);
    }
  }
  return files;
}

const targetHit = new Set();
const targetMiss = new Set();
function targetExists(p) {
  if (targetHit.has(p)) return true;
  if (targetMiss.has(p)) return false;
  if (existsSync(p)) {
    targetHit.add(p);
    return true;
  }
  targetMiss.add(p);
  return false;
}

function checkFile(file) {
  const errors = [];
  const base = dirname(file);
  const content = readFileSync(file, 'utf8').replace(FENCE_RE, '');
  for (const match of content.matchAll(MD_LINK_RE)) {
    const raw = match[1].trim();
    if (IGNORE_PREFIX_RE.test(raw)) continue;
    const pathPart = raw.split(/[#?]/, 1)[0];
    if (!pathPart) continue;
    const targetPath = isAbsolute(pathPart)
      ? pathPart
      : resolve(base, pathPart);
    if (!targetExists(targetPath)) {
      const rel = relative(ROOT, file);
      errors.push(
        `${rel}: dangling link "${raw}" → ${relative(ROOT, targetPath)}`,
      );
    }
  }
  return errors;
}

function main() {
  // lefthook 传 {staged_files} 时可能带 `--` 分隔符；过滤掉避免误判为文件名。
  const args = process.argv.slice(2).filter((a) => a !== '--');
  const targets = args.length > 0 ? args : DEFAULT_TARGETS;
  const files = listFiles(targets);

  if (files.length === 0) {
    console.error('✗ No docs files matched.');
    process.exit(1);
  }

  const allErrors = [];
  for (const file of files) {
    const errors = checkFile(file);
    if (errors.length > 0) allErrors.push(...errors);
  }

  if (allErrors.length > 0) {
    console.error('✗ Docs cross-reference check failed:');
    for (const e of allErrors) console.error(`  - ${e}`);
    console.error(
      `\n${allErrors.length} broken link(s) in ${files.length} file(s).`,
    );
    process.exit(1);
  }

  console.log(`✓ Docs cross-reference check passed (${files.length} file(s)).`);
}

main();
