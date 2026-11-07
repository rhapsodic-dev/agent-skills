import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  accessSync,
  constants,
  mkdirSync,
  realpathSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { delimiter, dirname, isAbsolute, join, resolve } from 'node:path';

const defaultSchedule = '0 3 * * *';
const defaultPath = '/usr/local/bin:/usr/bin:/bin';
const packageSource = '@rhapsodic/agent-skills@latest';
const scheduleError = '--schedule requires a quoted five-field cron expression.';
const scheduleBounds = [
  [0, 59],
  [0, 23],
  [1, 31],
  [1, 12],
  [0, 7],
];

export function configureCron(args) {
  const options = parseCronOptions(args);
  const scope = resolveJobScope(options.project);
  const existing = readCrontab();
  const job = options.remove ? null : createCronJob(options, scope);
  const updated = replaceCronEntry(existing, scope.marker, job?.entry);

  if (updated !== existing) {
    writeCrontab(updated);
  }

  if (options.remove) {
    console.log('Automatic skill upgrades removed for this scope.');
    return;
  }

  console.log(`Automatic skill upgrades scheduled: ${options.schedule}`);
  console.log(`Log: ${job.logPath}`);
}

function parseCronOptions(args) {
  const options = {
    schedule: defaultSchedule,
    project: false,
    remove: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--project':
        options.project = true;
        break;
      case '--global':
        options.project = false;
        break;
      case '--remove':
        options.remove = true;
        break;
      case '--schedule':
        options.schedule = args[++i];
        break;
      default:
        if (!arg.startsWith('--schedule=')) {
          throw new Error(`Unknown cron option: ${arg}`);
        }
        options.schedule = arg.slice('--schedule='.length);
    }
  }

  if (args.includes('--project') && args.includes('--global')) {
    throw new Error('Choose either --project or --global.');
  }

  options.schedule = validateSchedule(options.schedule);

  if (process.platform === 'win32') {
    throw new Error('Cron setup requires a Unix system with crontab and flock.');
  }

  return options;
}

function resolveJobScope(project) {
  const projectPath = project ? realpathSync(process.cwd()) : null;
  let id = 'global';

  if (projectPath) {
    const projectHash = createHash('sha256')
      .update(projectPath)
      .digest('hex')
      .slice(0, 16);

    id = `project-${projectHash}`;
  }

  return {
    id,
    projectPath,
    marker: ` # agent-skills:auto-upgrade:${id}`,
  };
}

function readCrontab() {
  const result = runCrontab(['-l']);

  if (result.error) {
    throw new Error(
      `Cannot read crontab: ${result.error.message}. ` +
      'Install cron before running setup.',
    );
  }

  const hasNoCrontab = result.status === 1 &&
    /no crontab for /i.test(result.stderr);

  if (hasNoCrontab) {
    return '';
  }

  if (result.status !== 0) {
    throw new Error(`Cannot read crontab: ${describeFailure(result)}`);
  }

  return result.stdout;
}

function writeCrontab(contents) {
  const result = runCrontab(['-'], contents);

  if (result.error || result.status !== 0) {
    throw new Error(`Cannot write crontab: ${describeFailure(result)}`);
  }
}

function runCrontab(args, input) {
  return spawnSync('crontab', args, {
    input,
    encoding: 'utf8',
    env: { ...process.env, LC_ALL: 'C' },
  });
}

function describeFailure(result) {
  return result.error?.message ||
    result.stderr.trim() ||
    `exit status ${result.status}`;
}

function replaceCronEntry(existing, marker, entry) {
  const lines = existing.split('\n');

  if (lines.at(-1) === '') {
    lines.pop();
  }

  const unrelatedEntries = lines.filter((line) => !line.endsWith(marker));

  if (entry) {
    unrelatedEntries.push(entry);
  }

  return unrelatedEntries.length ? `${unrelatedEntries.join('\n')}\n` : '';
}

function createCronJob(options, scope) {
  const paths = resolveJobPaths(scope.id);
  const runtime = resolveRuntime();
  const script = buildRunnerScript(options, scope, paths, runtime);

  writeRunnerScript(paths, script);

  // Keep the crontab short and independent of npm's temporary package cache.
  const command = `/bin/sh ${shellQuote(paths.runnerPath)}`;
  const escapedEntry = `${options.schedule} ${command}`.replaceAll('%', '\\%');

  return {
    entry: escapedEntry + scope.marker,
    logPath: paths.logPath,
  };
}

function resolveJobPaths(id) {
  const stateHome = process.env.XDG_STATE_HOME;
  const stateRoot = stateHome && isAbsolute(stateHome)
    ? stateHome
    : join(homedir(), '.local/state');
  const statePath = join(stateRoot, 'agent-skills/cron');

  return {
    statePath,
    logPath: join(statePath, `${id}.log`),
    lockPath: join(statePath, `${id}.lock`),
    runnerPath: join(statePath, `${id}.sh`),
  };
}

function resolveRuntime() {
  const nodeDirectory = dirname(process.execPath);
  const callerDirectories = (process.env.PATH || defaultPath)
    .split(delimiter)
    .map((directory) => resolve(directory));
  const runtimeDirectories = [...new Set([nodeDirectory, ...callerDirectories])];
  const runtimePath = runtimeDirectories.join(delimiter);
  const npxSearchPath = [...callerDirectories, nodeDirectory].join(delimiter);

  return {
    npx: findExecutable('npx', npxSearchPath),
    flock: findExecutable('flock', runtimePath),
    env: findExecutable('env', runtimePath),
    environment: captureEnvironment(runtimePath),
  };
}

function captureEnvironment(path) {
  const environment = [`PATH=${path}`, `HOME=${homedir()}`];
  const overrides = ['CODEX_HOME', 'XDG_CONFIG_HOME', 'XDG_STATE_HOME'];

  for (const name of overrides) {
    if (process.env[name]) {
      environment.push(`${name}=${resolve(process.env[name])}`);
    }
  }

  return environment;
}

function buildRunnerScript(options, scope, paths, runtime) {
  const commandArgs = [
    runtime.env,
    ...runtime.environment,
    runtime.flock,
    '-n',
    paths.lockPath,
    runtime.npx,
    '--yes',
    packageSource,
    '--upgrade',
  ];

  if (options.project) {
    commandArgs.push('--project');
  }

  const command = commandArgs.map(shellQuote).join(' ');
  const redirect = `>> ${shellQuote(paths.logPath)} 2>&1`;
  const changeDirectory = scope.projectPath
    ? `cd ${shellQuote(scope.projectPath)} && `
    : '';

  return `#!/bin/sh\n${changeDirectory}exec ${command} ${redirect}\n`;
}

function writeRunnerScript(paths, script) {
  const temporaryPath = `${paths.runnerPath}.${process.pid}.tmp`;

  mkdirSync(paths.statePath, { recursive: true, mode: 0o700 });

  try {
    writeFileSync(temporaryPath, script, { mode: 0o700, flag: 'wx' });
    renameSync(temporaryPath, paths.runnerPath);
  } finally {
    rmSync(temporaryPath, { force: true });
  }
}

function findExecutable(name, path) {
  for (const directory of path.split(delimiter)) {
    const candidate = resolve(directory, name);

    try {
      accessSync(candidate, constants.X_OK);

      if (statSync(candidate).isFile()) {
        return candidate;
      }
    } catch {}
  }

  throw new Error(`${name} is required for cron setup but was not found in PATH.`);
}

function shellQuote(value) {
  if (/[\r\n\0]/.test(value)) {
    throw new Error('Cron commands cannot contain newlines or null bytes.');
  }

  return `'${value.replaceAll("'", "'\"'\"'")}'`;
}

function validateSchedule(value) {
  if (typeof value !== 'string' || /[\r\n\0]/.test(value)) {
    throw new Error(scheduleError);
  }

  const fields = value.trim().split(/\s+/);

  if (fields.length !== scheduleBounds.length) {
    throw new Error(scheduleError);
  }

  for (let i = 0; i < fields.length; i++) {
    validateScheduleField(fields[i], scheduleBounds[i]);
  }

  return fields.join(' ');
}

function validateScheduleField(field, [min, max]) {
  for (const part of field.split(',')) {
    const match = /^(\*|\d+(?:-\d+)?)(?:\/(\d+))?$/.exec(part);
    const hasInvalidStep = match?.[2] !== undefined && Number(match[2]) < 1;

    if (!match || hasInvalidStep) {
      throw new Error(`Invalid cron field: ${field}`);
    }

    const range = match[1];

    if (range === '*') {
      continue;
    }

    const [start, end = start] = range.split('-').map(Number);
    const isOutOfRange = start < min || end > max || start > end;

    if (isOutOfRange) {
      throw new Error(`Cron field out of range: ${field}`);
    }
  }
}
