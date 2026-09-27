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

## Installation

### npm

Choose which skills, agents, and installation scope to use interactively:

```bash
npx @rhapsodic/agent-skills@latest
```

Use arrow keys to navigate, Space to select, and Enter to confirm. The installer uses the skills bundled with the selected npm release. To use a specific version, replace `@latest` with that version.

#### Global

Install every skill for Codex at user scope from npm:

```bash
npx @rhapsodic/agent-skills@latest --global --agent codex --skill '*' --yes
```

Global skills are available across repositories.

```bash
npx skills list --global --agent codex
```

#### Project-local

From the target project, omit `--global` to install from npm:

```bash
npx @rhapsodic/agent-skills@latest --agent codex --skill '*' --yes
```

Use project-local installation when the skills should apply only to that repository.

#### Select specific skills

Pass skill names to install only those skills without prompts:

```bash
npx @rhapsodic/agent-skills@latest --agent codex --skill git-commit scss-bem --yes
```

To select skills interactively for Codex, omit `--skill` and `--yes`:

```bash
npx @rhapsodic/agent-skills@latest --global --agent codex
```

List available skills without installing:

```bash
npx @rhapsodic/agent-skills@latest --list
```

The installer passes installation options through to the `skills` CLI, including `--copy`.

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

Run the installer with `@latest` again to replace installed skills with the latest npm release. Use the same agents, scope, and skill selection as your original installation.

Upgrade all global Codex skills from this package:

```bash
npx @rhapsodic/agent-skills@latest --global --agent codex --skill '*' --yes
```

For project-local skills, run the command from the target project and omit `--global`. To upgrade specific skills, replace `--skill '*'` with their names, such as `--skill git-commit scss-bem`. Omit `--skill` and `--yes` to choose skills interactively.

If you use `skills-npm`, update the dependency and refresh its project-local links:

```bash
npm install --save-dev @rhapsodic/agent-skills@latest
npx skills-npm setup
```

## Skills

- [`filament-resources`](skills/filament-resources/SKILL.md): create, migrate, or update Filament resources in Laravel applications.
- [`git-commit`](skills/git-commit/SKILL.md): review repository changes and create one logical Git commit.
- [`laravel-migrations`](skills/laravel-migrations/SKILL.md): create Laravel database migrations through Artisan.
- [`scss-bem`](skills/scss-bem/SKILL.md): write or refactor component SCSS using BEM naming.

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for installing skills from a local checkout.
