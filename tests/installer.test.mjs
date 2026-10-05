import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const cli = fileURLToPath(new URL('../bin/cli.mjs', import.meta.url));

function withIsolatedHome(run) {
  const root = mkdtempSync(join(tmpdir(), 'agent-skills-test-'));
  const env = {
    ...process.env,
    HOME: join(root, 'home'),
    CODEX_HOME: join(root, 'codex'),
    XDG_STATE_HOME: join(root, 'state'),
    DISABLE_TELEMETRY: '1',
  };
  try {
    run(root, env);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('installs selected skills globally for Codex without find-skills', () => {
  withIsolatedHome((root, env) => {
    const result = spawnSync(process.execPath, [cli, '--skill', 'scss-bem'], { cwd: root, env, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const installed = join(env.HOME, '.agents/skills/scss-bem/SKILL.md');
    assert.equal(readFileSync(installed, 'utf8'), readFileSync(fileURLToPath(new URL('../skills/scss-bem/SKILL.md', import.meta.url)), 'utf8'));
    assert.equal(existsSync(join(env.HOME, '.agents/skills/find-skills')), false);
    assert.equal(existsSync(join(root, '.agents/skills/scss-bem')), false);
  });
});

test('--project installs only in the current project', () => {
  withIsolatedHome((root, env) => {
    const result = spawnSync(process.execPath, [cli, '--project', '--skill=worksession'], { cwd: root, env, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.equal(existsSync(join(root, '.agents/skills/worksession/SKILL.md')), true);
    assert.equal(existsSync(join(env.HOME, '.agents/skills/worksession')), false);
  });
});

test('noninteractive invocation without a selection installs nothing', () => {
  withIsolatedHome((root, env) => {
    const result = spawnSync(process.execPath, [cli], { cwd: root, env, encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Use --skill <names> or --yes/);
    assert.equal(existsSync(join(env.HOME, '.agents/skills')), false);
  });
});
