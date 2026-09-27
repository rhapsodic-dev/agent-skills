# Agent Skills

A collection of reusable agent skills.

Install the published [`@rhapsodic/agent-skills`](https://npmx.dev/package/@rhapsodic/agent-skills) package with [`skills`](https://npmx.dev/package/skills) or [`skills-npm`](https://npmx.dev/package/skills-npm).

## Installation

### npm

#### Global

Install every skill for Codex at user scope from npm:

```bash
npx skills@latest add "$(npm view @rhapsodic/agent-skills dist.tarball)" --global --agent codex --skill '*' --yes
```

The `skills` CLI accepts the npm package's tarball URL. `npm view` resolves the latest published release; use `@rhapsodic/agent-skills@0.1.0` to select a specific version.

Global skills are available across repositories.

```bash
npx skills list --global --agent codex
```

#### Project-local

From the target project, omit `--global` to install from npm:

```bash
npx skills@latest add "$(npm view @rhapsodic/agent-skills dist.tarball)" --agent codex --skill '*' --yes
```

Use project-local installation when the skills should apply only to that repository.

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

## Skills

- [`filament-resources`](skills/filament-resources/SKILL.md): create, migrate, or update Filament resources in Laravel applications.
- [`git-commit`](skills/git-commit/SKILL.md): review repository changes and create one logical Git commit.
- [`laravel-migrations`](skills/laravel-migrations/SKILL.md): create Laravel database migrations through Artisan.
- [`scss-bem`](skills/scss-bem/SKILL.md): write or refactor component SCSS using BEM naming.

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for installing skills from a local checkout.
