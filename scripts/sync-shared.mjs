#!/usr/bin/env node
// shared/*.md 를 각 스킬의 references/shared/ 로 복사한다. --check 는 복사 없이 불일치만 보고한다.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
const sources = readdirSync(join(root, 'shared')).filter((f) => f.endsWith('.md'));
const problems = [];
const dirs = (p) => (existsSync(p) ? readdirSync(p, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name) : []);

const plugins = dirs(join(root, 'plugins'));
if (!sources.length) problems.push('missing: shared/*.md 가 없다');
if (!plugins.length) problems.push('missing: plugins/ 아래에 플러그인이 없다');

for (const plugin of plugins) {
  const skillsDir = join(root, 'plugins', plugin, 'skills');
  // 모든 플러그인은 스킬을 하나 이상 가진다. 없으면 복사 대상이 사라진 것이므로 실패로 본다.
  const skills = dirs(skillsDir).filter((s) => existsSync(join(skillsDir, s, 'SKILL.md')));
  if (!skills.length) {
    problems.push(`missing: ${skillsDir} 에 SKILL.md 를 가진 스킬이 없다`);
    continue;
  }
  for (const skill of skills) {
    const target = join(skillsDir, skill, 'references', 'shared');
    const existing = existsSync(target) ? readdirSync(target) : [];
    for (const stale of existing.filter((f) => !sources.includes(f))) {
      if (check) problems.push(`stale: ${join(target, stale)}`);
      else rmSync(join(target, stale));
    }
    for (const file of sources) {
      const want = readFileSync(join(root, 'shared', file));
      const dest = join(target, file);
      if (existsSync(dest) && readFileSync(dest).equals(want)) continue;
      if (check) problems.push(`${existsSync(dest) ? 'differs' : 'missing'}: ${dest}`);
      else {
        mkdirSync(target, { recursive: true });
        writeFileSync(dest, want);
      }
    }
  }
}

if (problems.length) {
  console.error(problems.join('\n'));
  console.error('shared/ 와 복사본이 맞지 않는다. 원인을 고친 뒤 `node scripts/sync-shared.mjs` 를 실행한다.');
  process.exit(1);
}
console.log(check ? 'shared 복사본 일치' : `동기화 완료: ${sources.length}개 문서`);
