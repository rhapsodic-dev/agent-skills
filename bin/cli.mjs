#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { access, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isCancel, multiselect } from '@clack/prompts';

const cliUrl = import.meta.resolve('skills/bin/cli.mjs');
const cliPath = fileURLToPath(cliUrl);
const skillsPath = fileURLToPath(new URL('../skills/', import.meta.url));
const args = process.argv.slice(2).flatMap((arg) => {
  for (const option of ['--agent', '--skill']) {
    if (arg.startsWith(`${option}=`)) return [option, arg.slice(option.length + 1)];
  }
  return [arg];
});

if (args.includes('--help') || args.includes('-h')) {
  console.log(`Usage: agent-skills [options]

Install bundled skills for Codex globally by default. Installed skills are preselected.

  --project            Install in the current project instead
  --agent <agents>     Install for other agents
  --skill <skills>     Install named skills without the selection menu
  --yes                Install all bundled skills without prompts
  --list               List bundled skills without installing

Other skills add options are passed through. The optional find-skills skill is not installed.`);
} else {
  const project = args.includes('--project');
  const global = args.includes('--global') || args.includes('-g');
  if (project && global) {
    console.error('Choose either --project or --global.');
    process.exitCode = 1;
  } else {
    const forwarded = args.filter((arg) => arg !== '--project');
    const scopeArgs = project || global ? [] : ['--global'];
    const agentValues = valuesAfter(forwarded, ['--agent', '-a']);
    const agentArgs = agentValues === null && !forwarded.includes('--all') && !forwarded.includes('--subagent') ? ['--agent', 'codex'] : [];
    const skillValues = valuesAfter(forwarded, ['--skill', '-s']);
    const listing = forwarded.includes('--list') || forwarded.includes('-l');
    const installAll = forwarded.includes('--yes') || forwarded.includes('-y') || forwarded.includes('--all');

    if (agentValues?.length === 0 || skillValues?.length === 0) {
      console.error('--agent and --skill require at least one value.');
      process.exitCode = 1;
    } else if (!listing && !installAll && skillValues === null && (forwarded.includes('--json') || !process.stdin.isTTY || !process.stdout.isTTY)) {
      console.error('Interactive selection requires a terminal. Use --skill <names> or --yes for noninteractive installation.');
      process.exitCode = 1;
    } else {
      let selected = skillValues;
      if (!listing && !installAll && selected === null) {
        const available = await bundledSkills();
        const installed = installedSkills(project, agentValues ?? (forwarded.includes('--subagent') ? ['eve'] : ['codex']));
        const choice = await multiselect({
          message: 'Select skills to install',
          options: available.map((name) => ({ value: name, label: name, hint: installed.has(name) ? 'installed' : undefined })),
          initialValues: available.filter((name) => installed.has(name)),
          required: true,
        });
        if (isCancel(choice)) {
          console.log('Installation cancelled.');
          process.exitCode = 130;
        } else {
          selected = choice;
        }
      }

      if (process.exitCode !== 130) {
        const selectedArgs = skillValues === null && selected !== null ? ['--skill', ...selected] : [];
        // --yes suppresses the upstream find-skills prompt after selection.
        const installArgs = listing ? [] : ['--yes'];
        process.argv = [process.execPath, cliPath, 'add', skillsPath, ...forwarded, ...scopeArgs, ...agentArgs, ...selectedArgs, ...installArgs];
        await import(cliUrl);
      }
    }
  }
}

function valuesAfter(argv, flags) {
  let seen = false;
  const values = [];
  for (let i = 0; i < argv.length; i++) {
    if (!flags.includes(argv[i])) continue;
    seen = true;
    while (i + 1 < argv.length && !argv[i + 1].startsWith('-')) values.push(argv[++i]);
  }
  return seen ? values : null;
}

async function bundledSkills() {
  const entries = await readdir(skillsPath, { withFileTypes: true });
  const names = await Promise.all(entries.filter((entry) => entry.isDirectory()).map(async (entry) => {
    try {
      await access(join(skillsPath, entry.name, 'SKILL.md'));
      return entry.name;
    } catch {
      return null;
    }
  }));
  return names.filter(Boolean).sort();
}

function installedSkills(project, agents) {
  const listArgs = ['list', ...project ? [] : ['--global'], ...agents.includes('*') ? [] : ['--agent', ...agents], '--json'];
  const output = execFileSync(process.execPath, [cliPath, ...listArgs], { encoding: 'utf8' });
  return new Set(JSON.parse(output).filter((skill) => skill.agents.length > 0).map((skill) => skill.name));
}
