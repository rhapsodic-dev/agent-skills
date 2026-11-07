# Agent Skills

A collection of reusable agent skills.

Install the published [`@rhapsodic/agent-skills`](https://npmx.dev/package/@rhapsodic/agent-skills) package with its bundled installer, which uses [`skills`](https://npmx.dev/package/skills) for skill selection and installation.

## Navigation

- [Installation](#installation)
  - [npm](#npm)
    - [Global installation](#global)
    - [Project-local installation](#project-local)
    - [Select specific skills](#select-specific-skills)
    - [skills-npm](#skills-npm)
  - [GitHub](#github)
- [Upgrading](#upgrading)
  - [Automatic upgrades with cron](#automatic-upgrades-with-cron)
- [Skills](#skills)
- [Development](#development)
- [Contributing](#contributing)

## Installation

### npm

Select skills interactively. The installer targets global Codex skills by default and preselects skills already installed there:

```bash
npx @rhapsodic/agent-skills@latest
```

Use arrow keys to navigate, Space to select, and Enter to confirm. The optional `find-skills` skill is not installed. The installer uses the skills bundled with the selected npm release. To use a specific version, replace `@latest` with that version.

#### Global

Install every skill for Codex at user scope from npm:

```bash
npx @rhapsodic/agent-skills@latest --yes
```

Global skills are available across repositories.

```bash
npx skills list --global --agent codex
```

#### Project-local

From the target project, use `--project` to install from npm:

```bash
npx @rhapsodic/agent-skills@latest --project --yes
```

Use project-local installation when the skills should apply only to that repository.

#### Select specific skills

Pass skill names to install only those skills without prompts:

```bash
npx @rhapsodic/agent-skills@latest --skill git-commit scss-bem
```

To select skills interactively for Codex, omit `--skill` and `--yes`:

```bash
npx @rhapsodic/agent-skills@latest
```

List available skills without installing:

```bash
npx @rhapsodic/agent-skills@latest --list
```

Use `--agent <name>` to target another agent and `--global` to make the default scope explicit. The installer passes other installation options through to the `skills` CLI, including `--copy`. Use `--skill` or `--yes` when running without an interactive terminal.

#### skills-npm

[`skills-npm`](https://npmx.dev/package/skills-npm) discovers skills shipped inside npm dependencies and links them into the consuming project. It is project-scoped and does not install skills globally.

Install the published npm package and set up project-local links:

```bash
npm install --save-dev @rhapsodic/agent-skills skills-npm
npx skills-npm setup
```

### GitHub

Alternatively, install directly from the [GitHub repository](https://github.com/rhapsodic-dev/agent-skills).

For all repositories:

```bash
npx skills add rhapsodic-dev/agent-skills --global --agent codex --skill '*' --yes
```

For the current project:

```bash
npx skills add rhapsodic-dev/agent-skills --agent codex --skill '*' --yes
```

## Upgrading

Run the installer with `@latest` again to replace installed skills with the latest npm release. It preselects skills already installed for Codex in the global scope, so press Enter to upgrade those skills or adjust the selection first:

Upgrade the installed global Codex skills from this package:

```bash
npx @rhapsodic/agent-skills@latest
```

For project-local skills, run the command from the target project with `--project`; installed project skills are preselected there. To upgrade specific skills without prompts, pass their names with `--skill`, such as `--skill git-commit scss-bem`. Use `--yes` to install or upgrade every bundled skill.

To upgrade only already installed bundled skills without prompts:

```bash
npx --yes @rhapsodic/agent-skills@latest --upgrade
```

`--upgrade` replaces installed skill files with the versions bundled in the selected npm release. It skips bundled skills that are not installed and leaves skills with other names alone. If no bundled skills are installed, it exits successfully without installing anything. Add `--project` and run from the target project to upgrade that scope. `--yes` does not expand the selection when combined with `--upgrade`; `--skill`, `--all`, `--list`, and `--subagent` cannot be combined with it.

If you use `skills-npm`, update the dependency and refresh its project-local links:

```bash
npm install --save-dev @rhapsodic/agent-skills@latest
npx skills-npm setup
```

### Automatic upgrades with cron

Set up daily upgrades at 03:00 for already installed global Codex skills:

```bash
npx --yes @rhapsodic/agent-skills@latest cron
```

Run this as the user who installed the skills, with that user's Node environment active. Setup requires `crontab`, `flock`, and `npx` on a Unix system; on Linux, install your distribution's cron service and enable it if needed. The command adds the job to your user crontab, preserves unrelated entries, and replaces its own entry when run again. Upgrades run on the cron service's timezone and use the latest published npm release.

Choose a different schedule with a quoted five-field cron expression. Numeric values, wildcards, ranges, lists, and steps are supported:

```bash
npx --yes @rhapsodic/agent-skills@latest cron --schedule '0 6 * * 1'
```

To schedule project-local upgrades, run setup from the target project:

```bash
npx --yes @rhapsodic/agent-skills@latest cron --project
```

Each project gets its own job. Setup captures the current Node executable directory, executable paths, `HOME`, and any `CODEX_HOME`, `XDG_CONFIG_HOME`, and `XDG_STATE_HOME` overrides, so jobs work without an interactive shell profile. Rerun setup after moving a Node installation; remove a project's job before moving or deleting that project.

Setup prints the log path. Runner scripts, append-only logs, and locks live under `${XDG_STATE_HOME:-$HOME/.local/state}/agent-skills/cron`. The job uses `flock` to skip overlapping runs. These jobs upgrade this package's installed bundled skills; they do not update `skills-npm` dependencies.

Remove the global job, or remove a project's job from that project directory:

```bash
npx --yes @rhapsodic/agent-skills@latest cron --remove
npx --yes @rhapsodic/agent-skills@latest cron --project --remove
```

Removal leaves the runner, logs, and lock files in place.

## Skills

- [`actions-workflows`](skills/actions-workflows/README.md): create or refactor readable GitHub Actions, Forgejo, and Gitea CI/release workflows.
- [`filament-page-constructor-block`](skills/filament-page-constructor-block/README.md): create or migrate blocks in Laravel Filament projects already using a page-constructor package.
- [`filament-resources`](skills/filament-resources/README.md): create, migrate, or update Filament resources in Laravel applications.
- [`git-commit`](skills/git-commit/README.md): plan, review, or create Git commits.
- [`laravel-migrations`](skills/laravel-migrations/README.md): create Laravel database migrations through Artisan.
- [`manage-projects`](skills/manage-projects/README.md): run, test, build, or troubleshoot Laravel Docker Compose projects using `./manage` and `.manage.json`.
- [`project-skill-creator`](skills/project-skill-creator/README.md): create or update project-local agent skills from a project's workflows and conventions.
- [`scss-bem`](skills/scss-bem/README.md): write or refactor component SCSS using BEM naming.
- [`vue-component-authoring`](skills/vue-component-authoring/README.md): create, split, or refactor Vue 3 components with typed contracts and stable imports or Nuxt registration.
- [`worksession`](skills/worksession/README.md): manage persistent workspace services and interactive terminals through the `worksession` CLI.

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for installing skills from a local checkout.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines and validation steps.
