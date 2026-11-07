import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
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

function invokeInstaller(root, env, args = []) {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd: root,
    env,
    encoding: 'utf8',
  });
}

function installSkills(root, env, args) {
  const result = invokeInstaller(root, env, args);
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

function bundledSkillContent(name) {
  const sourceUrl = new URL(`../skills/${name}/SKILL.md`, import.meta.url);

  return readFileSync(sourceUrl, 'utf8');
}

test('installs selected skills globally for Codex without find-skills', () => {
  withIsolatedHome((root, env) => {
    installSkills(root, env, ['--skill', 'scss-bem']);

    const installed = join(env.HOME, '.agents/skills/scss-bem/SKILL.md');

    assert.equal(readFileSync(installed, 'utf8'), bundledSkillContent('scss-bem'));
    assert.equal(existsSync(join(env.HOME, '.agents/skills/find-skills')), false);
    assert.equal(existsSync(join(root, '.agents/skills/scss-bem')), false);
  });
});

test('--project installs only in the current project', () => {
  withIsolatedHome((root, env) => {
    installSkills(root, env, ['--project', '--skill=worksession']);

    assert.equal(existsSync(join(root, '.agents/skills/worksession/SKILL.md')), true);
    assert.equal(existsSync(join(env.HOME, '.agents/skills/worksession')), false);
  });
});

test('noninteractive invocation without a selection installs nothing', () => {
  withIsolatedHome((root, env) => {
    const result = invokeInstaller(root, env);

    assert.equal(result.status, 1);
    assert.match(result.stderr, /Use --skill <names>, --yes, or --upgrade/);
    assert.equal(existsSync(join(env.HOME, '.agents/skills')), false);
  });
});

test('--upgrade refreshes only installed bundled skills without prompts', () => {
  withIsolatedHome((root, env) => {
    installSkills(root, env, ['--skill', 'scss-bem']);

    const skillsDir = join(env.HOME, '.agents/skills');
    const installed = join(skillsDir, 'scss-bem/SKILL.md');
    const bundled = readFileSync(installed, 'utf8');
    writeFileSync(installed, `${bundled}\nOld installed content.\n`);

    const customPath = join(skillsDir, 'custom-skill/SKILL.md');
    const customContent = [
      '---',
      'name: custom-skill',
      'description: A local skill.',
      '---',
      'Custom content.',
      '',
    ].join('\n');

    mkdirSync(join(skillsDir, 'custom-skill'));
    writeFileSync(customPath, customContent);

    for (const extra of [[], ['--yes']]) {
      const result = invokeInstaller(root, env, ['--upgrade', ...extra]);

      assert.equal(result.status, 0, result.stderr || result.stdout);
      assert.equal(readFileSync(installed, 'utf8'), bundled);
      assert.deepEqual(readdirSync(skillsDir).sort(), ['custom-skill', 'scss-bem']);
      assert.equal(readFileSync(customPath, 'utf8'), customContent);
      assert.equal(existsSync(join(root, '.agents/skills')), false);
    }
  });
});

test('--upgrade --project preserves the global selection and content', () => {
  withIsolatedHome((root, env) => {
    installSkills(root, env, ['--skill', 'scss-bem']);
    installSkills(root, env, ['--project', '--skill', 'worksession', '--copy']);

    const projectSkill = join(root, '.agents/skills/worksession/SKILL.md');
    const globalSkill = join(env.HOME, '.agents/skills/scss-bem/SKILL.md');
    const bundled = readFileSync(projectSkill, 'utf8');
    const globalContent = `${readFileSync(globalSkill, 'utf8')}\nGlobal content.\n`;

    writeFileSync(projectSkill, `${bundled}\nOld project content.\n`);
    writeFileSync(globalSkill, globalContent);

    const result = invokeInstaller(root, env, [
      '--upgrade',
      '--project',
      '--copy',
    ]);

    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.equal(readFileSync(projectSkill, 'utf8'), bundled);
    assert.equal(readFileSync(globalSkill, 'utf8'), globalContent);
    assert.deepEqual(readdirSync(join(root, '.agents/skills')), ['worksession']);
  });
});

test('--upgrade succeeds when no bundled skills are installed', () => {
  withIsolatedHome((root, env) => {
    const result = invokeInstaller(root, env, ['--upgrade']);

    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.match(result.stdout, /No installed bundled skills to upgrade/);
    assert.equal(existsSync(join(env.HOME, '.agents/skills')), false);
    assert.equal(existsSync(join(root, '.agents/skills')), false);
  });
});

test('--upgrade --project leaves an empty project unchanged', () => {
  withIsolatedHome((root, env) => {
    installSkills(root, env, ['--skill', 'scss-bem']);

    const result = invokeInstaller(root, env, [
      '--upgrade',
      '--project',
      '--json',
    ]);

    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.deepEqual(JSON.parse(result.stdout), []);
    assert.equal(existsSync(join(root, '.agents/skills')), false);
  });
});

test('--upgrade supports JSON output when skills are installed', () => {
  withIsolatedHome((root, env) => {
    installSkills(root, env, ['--skill', 'scss-bem']);

    const result = invokeInstaller(root, env, ['--upgrade', '--json']);
    assert.equal(result.status, 0, result.stderr || result.stdout);

    const skills = JSON.parse(result.stdout);

    assert.deepEqual(skills.map(({ name }) => name), ['scss-bem']);
    assert.equal(skills[0].status, 'installed');
  });
});

test('--upgrade rejects options that change its selection before installing', () => {
  withIsolatedHome((root, env) => {
    const conflictingOptions = [
      ['--all'],
      ['--skill', '*'],
      ['--list'],
      ['--subagent', 'worker'],
      ['--project', '--global'],
      ['--agent'],
    ];

    for (const args of conflictingOptions) {
      const result = invokeInstaller(root, env, ['--upgrade', ...args]);

      assert.equal(result.status, 1, result.stderr || result.stdout);
      assert.equal(existsSync(join(env.HOME, '.agents/skills')), false);
      assert.equal(existsSync(join(root, '.agents/skills')), false);
    }
  });
});
