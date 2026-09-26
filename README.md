# Agent Skills

A collection of reusable agent skills.

The repository works directly with the `skills` CLI, while the published npm package exposes the same `skills/` directory to `skills-npm`.

## Installation

### Global

Install every skill for Codex at user scope:

```bash
npx skills add /path/to/agent-skills --global --agent codex --skill '*' --yes
```

From GitHub:

```bash
npx skills add rhapsodic-dev/agent-skills --global --agent codex --skill '*' --yes
```

Global skills are available across repositories.

```bash
npx skills list --global --agent codex
```

### Project-local

From the target project, omit `--global`:

```bash
npx skills add /path/to/agent-skills --agent codex --skill '*' --yes
```

From GitHub:

```bash
npx skills add rhapsodic-dev/agent-skills --agent codex --skill '*' --yes
```

Use project-local installation when the skills should apply only to that repository.

### skills-npm

[`skills-npm`](https://www.npmjs.com/package/skills-npm) discovers skills shipped inside npm dependencies and links them into the consuming project. It is project-scoped and does not install skills globally.

After `@rhapsodic/agent-skills` is published, consumers can install it with:

```bash
npm install --save-dev @rhapsodic/agent-skills skills-npm
npx skills-npm setup
```

## Skills

- [`filament-resources`](skills/filament-resources/SKILL.md): create, migrate, or update Filament resources in Laravel applications.
- [`git-commit`](skills/git-commit/SKILL.md): review repository changes and create one logical Git commit.
- [`laravel-migrations`](skills/laravel-migrations/SKILL.md): create Laravel database migrations through Artisan.
- [`scss-bem`](skills/scss-bem/SKILL.md): write or refactor component SCSS using BEM naming.
