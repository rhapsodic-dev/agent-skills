#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { access, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isCancel, multiselect } from '@clack/prompts';

const cliUrl = import.meta.resolve('skills/bin/cli.mjs');
const cliPath = fileURLToPath(cliUrl);
const skillsPath = fileURLToPath(new URL('../skills/', import.meta.url));

try {
  await main(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

async function main(argv) {
  const args = normalizeArguments(argv);

  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    return;
  }

  if (args[0] === 'cron') {
    const { configureCron } = await import('./cron.mjs');
    configureCron(args.slice(1));
    return;
  }

  const options = parseInstallOptions(args);
  validateInstallOptions(options);

  const selected = await selectSkills(options);

  if (process.exitCode === 130) {
    return;
  }

  if (options.upgrade && selected.length === 0) {
    const message = options.forwarded.includes('--json')
      ? '[]'
      : 'No installed bundled skills to upgrade.';

    console.log(message);
    return;
  }

  await runSkillInstaller(options, selected);
}

function normalizeArguments(argv) {
  return argv.flatMap((arg) => {
    for (const option of ['--agent', '--skill']) {
      if (arg.startsWith(`${option}=`)) {
        return [option, arg.slice(option.length + 1)];
      }
    }

    return [arg];
  });
}

function parseInstallOptions(args) {
  const project = args.includes('--project');
  const global = args.includes('--global') || args.includes('-g');

  if (project && global) {
    throw new Error('Choose either --project or --global.');
  }

  const forwarded = args.filter((arg) => {
    return arg !== '--project' && arg !== '--upgrade';
  });
  const agentValues = valuesAfter(forwarded, ['--agent', '-a']);
  const skillValues = valuesAfter(forwarded, ['--skill', '-s']);
  const usesSubagents = forwarded.includes('--subagent');
  const usesAllAgents = forwarded.includes('--all');
  const needsDefaultAgent = agentValues === null &&
    !usesAllAgents && !usesSubagents;
  const installAll = ['--yes', '-y', '--all'].some((flag) => {
    return forwarded.includes(flag);
  });

  return {
    project,
    forwarded,
    agentValues,
    skillValues,
    installAll,
    upgrade: args.includes('--upgrade'),
    listing: forwarded.includes('--list') || forwarded.includes('-l'),
    scopeArgs: project || global ? [] : ['--global'],
    agentArgs: needsDefaultAgent ? ['--agent', 'codex'] : [],
    agents: agentValues ?? (usesSubagents ? ['eve'] : ['codex']),
  };
}

function validateInstallOptions(options) {
  const { agentValues, skillValues, forwarded, upgrade, listing } = options;

  if (agentValues?.length === 0 || skillValues?.length === 0) {
    throw new Error('--agent and --skill require at least one value.');
  }

  const hasUpgradeConflict = listing ||
    forwarded.includes('--all') ||
    skillValues !== null ||
    forwarded.includes('--subagent');

  if (upgrade && hasUpgradeConflict) {
    throw new Error(
      '--upgrade cannot be combined with --list, --all, --skill, or --subagent.',
    );
  }

  const requiresSelection = !upgrade && !listing &&
    !options.installAll && skillValues === null;
  const hasTerminal = process.stdin.isTTY && process.stdout.isTTY;
  const noninteractive = forwarded.includes('--json') || !hasTerminal;

  if (requiresSelection && noninteractive) {
    throw new Error(
      'Interactive selection requires a terminal. ' +
      'Use --skill <names>, --yes, or --upgrade for noninteractive installation.',
    );
  }
}

async function selectSkills(options) {
  const { upgrade, listing, installAll, skillValues } = options;

  if (!upgrade && (listing || installAll || skillValues !== null)) {
    return skillValues;
  }

  const available = await bundledSkills();
  const installed = installedSkills(options.project, options.agents, upgrade);
  const installedBundled = available.filter((name) => installed.has(name));

  if (upgrade) {
    return installedBundled;
  }

  const choice = await multiselect({
    message: 'Select skills to install',
    options: available.map((name) => ({
      value: name,
      label: name,
      hint: installed.has(name) ? 'installed' : undefined,
    })),
    initialValues: installedBundled,
    required: true,
  });

  if (isCancel(choice)) {
    console.log('Installation cancelled.');
    process.exitCode = 130;
    return null;
  }

  return choice;
}

async function runSkillInstaller(options, selected) {
  const selectedArgs = options.skillValues === null && selected !== null
    ? ['--skill', ...selected]
    : [];
  // --yes suppresses the upstream find-skills prompt after selection.
  const confirmationArgs = options.listing ? [] : ['--yes'];

  process.argv = [
    process.execPath,
    cliPath,
    'add',
    skillsPath,
    ...options.forwarded,
    ...options.scopeArgs,
    ...options.agentArgs,
    ...selectedArgs,
    ...confirmationArgs,
  ];

  await import(cliUrl);
}

function valuesAfter(argv, flags) {
  let seen = false;
  const values = [];

  for (let i = 0; i < argv.length; i++) {
    if (!flags.includes(argv[i])) {
      continue;
    }

    seen = true;

    while (i + 1 < argv.length && !argv[i + 1].startsWith('-')) {
      values.push(argv[++i]);
    }
  }

  return seen ? values : null;
}

async function bundledSkills() {
  const entries = await readdir(skillsPath, { withFileTypes: true });
  const directories = entries.filter((entry) => entry.isDirectory());
  const names = await Promise.all(directories.map(async (entry) => {
    try {
      await access(join(skillsPath, entry.name, 'SKILL.md'));
      return entry.name;
    } catch {
      return null;
    }
  }));

  return names.filter(Boolean).sort();
}

function installedSkills(project, agents, includeUnlinked = false) {
  const listArgs = ['list'];

  if (!project) {
    listArgs.push('--global');
  }

  if (!agents.includes('*')) {
    listArgs.push('--agent', ...agents);
  }

  listArgs.push('--json');

  const output = execFileSync(process.execPath, [cliPath, ...listArgs], {
    encoding: 'utf8',
  });
  const listedSkills = JSON.parse(output);
  // Universal installs can have no detected agents in a cron environment.
  const visibleSkills = listedSkills.filter((skill) => {
    return includeUnlinked || skill.agents.length > 0;
  });

  return new Set(visibleSkills.map((skill) => skill.name));
}

function printHelp() {
  console.log(`Usage: npx @rhapsodic/agent-skills@latest [options]

Install bundled skills for Codex globally by default. Installed skills are preselected.

  --project            Install in the current project instead
  --agent <agents>     Install for other agents
  --skill <skills>     Install named skills without the selection menu
  --yes                Install all bundled skills without prompts
  --upgrade            Upgrade only installed bundled skills without prompts
  --list               List bundled skills without installing

Schedule unattended upgrades for installed Codex skills (requires crontab and flock):

  Set up daily upgrades at 03:00:
    npx --yes @rhapsodic/agent-skills@latest cron

  Schedule upgrades for the current project:
    npx --yes @rhapsodic/agent-skills@latest cron --project

  Use a custom five-field schedule:
    npx --yes @rhapsodic/agent-skills@latest cron --schedule "0 6 * * 1"

  Remove this scope's upgrade job (add --project for the current project):
    npx --yes @rhapsodic/agent-skills@latest cron --remove

Other skills add options are passed through. The optional find-skills skill is not installed.`);
}
