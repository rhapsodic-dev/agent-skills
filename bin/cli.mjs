#!/usr/bin/env node

import { fileURLToPath } from 'node:url';

const cliUrl = import.meta.resolve('skills/bin/cli.mjs');
const cliPath = fileURLToPath(cliUrl);
const skillsPath = fileURLToPath(new URL('../skills/', import.meta.url));

// Keep the caller's working directory and terminal for scope selection and prompts.
process.argv = [process.execPath, cliPath, 'add', skillsPath, ...process.argv.slice(2)];
await import(cliUrl);
