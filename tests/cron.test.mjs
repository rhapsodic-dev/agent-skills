import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const cli = fileURLToPath(new URL('../bin/cli.mjs', import.meta.url));
const unrelatedJob = '0 0 * * * echo keep-me\n';
const jobMarker = /agent-skills:auto-upgrade:/g;
const globalJobMarker = /agent-skills:auto-upgrade:global/g;

function withCron(run) {
  const root = mkdtempSync(join(tmpdir(), "agent-skills-cron % ' test-"));

  try {
    run(createCronFixture(root));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function createCronFixture(root) {
  const bin = join(root, 'bin');
  const env = {
    ...process.env,
    HOME: join(root, 'home'),
    CODEX_HOME: join(root, 'custom codex'),
    XDG_STATE_HOME: join(root, 'state'),
    PATH: `${bin}:${process.env.PATH}`,
    CRON_TEST_FILE: join(root, 'crontab'),
  };

  mkdirSync(bin);
  installFakeCrontab(bin);
  installFakeNpx(bin);

  function invoke(args = [], overrides = {}) {
    return spawnSync(process.execPath, [cli, 'cron', ...args], {
      cwd: root,
      env,
      encoding: 'utf8',
      ...overrides,
    });
  }

  function crontab() {
    return readFileSync(env.CRON_TEST_FILE, 'utf8');
  }

  return { root, bin, env, invoke, crontab };
}

function scheduledCommand(crontab) {
  // Cron removes escaped percent signs before passing a command to the shell.
  return crontab.trim()
    .slice('0 3 * * * '.length)
    .replaceAll('\\%', '%');
}

function findLogPath(env) {
  const statePath = join(env.XDG_STATE_HOME, 'agent-skills/cron');
  const logName = readdirSync(statePath).find((name) => name.endsWith('.log'));

  return join(statePath, logName);
}

test('cron setup preserves unrelated jobs on repeat and reschedule', () => {
  withCron(({ env, invoke, crontab }) => {
    const unrelated = 'MAILTO=owner@example.test\n15 4 * * * echo existing-job\n';
    writeFileSync(env.CRON_TEST_FILE, unrelated);

    const result = invoke();
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /scheduled: 0 3 \* \* \*/);

    const initial = crontab();
    assert.ok(initial.startsWith(unrelated));
    assert.equal(initial.match(globalJobMarker).length, 1);

    assert.equal(invoke().status, 0);
    assert.equal(crontab(), initial);

    const rescheduled = invoke(['--schedule=15 */6 * * 1-5']);
    assert.equal(rescheduled.status, 0, rescheduled.stderr);
    assert.ok(crontab().startsWith(unrelated));
    assert.match(crontab(), /15 \*\/6 \* \* 1-5 \/bin\/sh/);
    assert.equal(crontab().match(globalJobMarker).length, 1);
  });
});

test('cron setup creates a crontab when none exists', () => {
  withCron(({ invoke, crontab }) => {
    const result = invoke();

    assert.equal(result.status, 0, result.stderr);
    assert.match(crontab(), /^0 3 \* \* \* \/bin\/sh /);
  });
});

test('cron removal affects only the selected scope and project', () => {
  withCron(({ root, env, invoke, crontab }) => {
    const otherProject = join(root, 'other-project');
    mkdirSync(otherProject);
    writeFileSync(env.CRON_TEST_FILE, unrelatedJob);

    const installations = [
      { args: [] },
      { args: ['--project'] },
      { args: ['--project'], overrides: { cwd: otherProject } },
    ];

    for (const { args, overrides } of installations) {
      const result = invoke(args, overrides);
      assert.equal(result.status, 0, result.stderr);
    }

    assert.equal(crontab().match(jobMarker).length, 3);
    assert.equal(invoke(['--project', '--remove']).status, 0);

    const removed = crontab();
    assert.equal(removed.match(jobMarker).length, 2);
    assert.ok(removed.startsWith(unrelatedJob));

    assert.equal(invoke(['--project', '--remove']).status, 0);
    assert.equal(crontab(), removed);

    assert.equal(invoke(['--remove']).status, 0);
    assert.equal(crontab().match(jobMarker).length, 1);

    const otherRemoval = invoke(['--project', '--remove'], {
      cwd: otherProject,
    });

    assert.equal(otherRemoval.status, 0, otherRemoval.stderr);
    assert.equal(crontab(), unrelatedJob);
  });
});

test('cron runner preserves quoted paths, scope, environment, and locking', () => {
  withCron(({ root, env, invoke, crontab }) => {
    const result = invoke(['--project']);
    assert.equal(result.status, 0, result.stderr);

    const job = scheduledCommand(crontab());
    const run = spawnSync('/bin/sh', ['-c', job], {
      cwd: '/',
      env: { PATH: '/usr/bin:/bin', HOME: '/' },
      encoding: 'utf8',
    });

    assert.equal(run.status, 0, run.stderr);

    const logPath = findLogPath(env);
    const record = JSON.parse(readFileSync(logPath, 'utf8'));

    assert.deepEqual(record.args, [
      '--yes',
      '@rhapsodic/agent-skills@latest',
      '--upgrade',
      '--project',
    ]);
    assert.equal(record.cwd, root);
    assert.equal(record.home, env.HOME);
    assert.equal(record.codexHome, env.CODEX_HOME);
    assert.equal(record.stateHome, env.XDG_STATE_HOME);
    assert.equal(record.path.split(':')[0], dirname(process.execPath));

    const before = readFileSync(logPath, 'utf8');
    const lockPath = logPath.replace(/\.log$/, '.lock');
    const lockArgs = ['-n', lockPath, '/bin/sh', '-c', job];
    const overlap = spawnSync('flock', lockArgs, { encoding: 'utf8' });

    assert.equal(overlap.status, 1, overlap.stderr);
    assert.equal(readFileSync(logPath, 'utf8'), before);
  });
});

test('cron setup rejects invalid input without changing the crontab', () => {
  withCron(({ env, invoke, crontab }) => {
    writeFileSync(env.CRON_TEST_FILE, unrelatedJob);

    const invalidOptions = [
      ['--schedule'],
      ['--schedule', '0 * *'],
      ['--schedule', '60 0 * * *'],
      ['--schedule', '0 24 * * *'],
      ['--schedule', '0 0 0 * *'],
      ['--schedule', '0 0 * 13 *'],
      ['--schedule', '0 0 * * 8'],
      ['--schedule', '*/0 * * * *'],
      ['--schedule', '5-2 * * * *'],
      ['--schedule', '0 3 * * *\n* * * * * echo injected'],
      ['--schedule', '* * * * * echo injected'],
      ['--project', '--global'],
      ['--unknown'],
    ];

    for (const args of invalidOptions) {
      const result = invoke(args);

      assert.equal(result.status, 1, result.stdout);
      assert.ok(result.stderr, args.join(' '));
      assert.equal(crontab(), unrelatedJob);
    }
  });
});

test('cron setup reports failures without overwriting existing jobs', () => {
  withCron(({ env, invoke, crontab }) => {
    writeFileSync(env.CRON_TEST_FILE, unrelatedJob);

    for (const status of ['1', '2']) {
      const result = invoke([], {
        env: { ...env, CRON_TEST_READ_ERROR: status },
      });

      assert.equal(result.status, 1);
      assert.match(result.stderr, /Cannot read crontab:.*permission denied/);
      assert.equal(crontab(), unrelatedJob);
    }

    const result = invoke([], {
      env: { ...env, CRON_TEST_WRITE_ERROR: '1' },
    });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /Cannot write crontab:.*write denied/);
    assert.equal(crontab(), unrelatedJob);
  });
});

test('cron removal needs no existing crontab and setup reports missing cron', () => {
  withCron(({ bin, env, invoke }) => {
    assert.equal(invoke(['--remove']).status, 0);
    assert.equal(existsSync(env.CRON_TEST_FILE), false);

    renameSync(join(bin, 'crontab'), join(bin, 'crontab-disabled'));

    const result = invoke([], { env: { ...env, PATH: bin } });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /Install cron before running setup/);
    assert.equal(existsSync(env.CRON_TEST_FILE), false);
  });
});

function installFakeCrontab(bin) {
  const script = `#!${process.execPath}
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const file = process.env.CRON_TEST_FILE;

if (process.argv[2] === '-l') {
  if (process.env.CRON_TEST_READ_ERROR) {
    console.error('crontab: permission denied');
    process.exit(Number(process.env.CRON_TEST_READ_ERROR));
  }

  if (!existsSync(file)) {
    console.error('no crontab for test-user');
    process.exit(1);
  }

  process.stdout.write(readFileSync(file, 'utf8'));
} else if (process.argv[2] === '-') {
  if (process.env.CRON_TEST_WRITE_ERROR) {
    console.error('crontab: write denied');
    process.exit(1);
  }

  writeFileSync(file, readFileSync(0, 'utf8'));
} else {
  process.exit(2);
}
`;

  writeFileSync(join(bin, 'crontab'), script, { mode: 0o755 });
}

function installFakeNpx(bin) {
  const script = `#!${process.execPath}
console.log(JSON.stringify({
  args: process.argv.slice(2),
  cwd: process.cwd(),
  home: process.env.HOME,
  codexHome: process.env.CODEX_HOME,
  stateHome: process.env.XDG_STATE_HOME,
  path: process.env.PATH,
}));
`;

  writeFileSync(join(bin, 'npx'), script, { mode: 0o755 });
}
