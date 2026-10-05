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

If you use `skills-npm`, update the dependency and refresh its project-local links:

```bash
npm install --save-dev @rhapsodic/agent-skills@latest
npx skills-npm setup
```

## Skills

- [`filament-page-constructor-block`](skills/filament-page-constructor-block/README.md): create or migrate blocks in Laravel Filament projects already using a page-constructor package.
- [`filament-resources`](skills/filament-resources/README.md): create, migrate, or update Filament resources in Laravel applications.
- [`git-commit`](skills/git-commit/README.md): plan, review, or create Git commits.
- [`laravel-migrations`](skills/laravel-migrations/README.md): create Laravel database migrations through Artisan.
- [`manage-projects`](skills/manage-projects/README.md): run, test, build, or troubleshoot Laravel Docker Compose projects using `./manage` and `.manage.json`.
- [`project-skill-creator`](skills/project-skill-creator/README.md): create or update project-local agent skills from a project's workflows and conventions.
- [`scss-bem`](skills/scss-bem/README.md): write or refactor component SCSS using BEM naming.
- [`worksession`](skills/worksession/README.md): manage persistent workspace services and interactive terminals through the `worksession` CLI.

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for installing skills from a local checkout.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines and validation steps.
