# Contributing

Contributions to the skills, installer, and documentation are welcome. Keep each pull request focused on one change.

## Setup

Use the Node.js version in [.nvmrc](.nvmrc) and the pnpm version specified in [package.json](package.json).

```bash
corepack enable
pnpm install
```

See [DEVELOPMENT.md](DEVELOPMENT.md) for installing skills from a checkout and testing the installer in a target project.

## Adding or updating skills

Each skill lives in `skills/<skill-name>/`. Follow the layout of an existing skill and use a lowercase, kebab-case name.

After installing dependencies, scaffold a new skill with the local `skills` CLI. Run these commands from the repository root, replacing `my-skill` with your skill's name:

```bash
cd skills
npx --no-install skills init my-skill
cd ..
```

This creates `skills/my-skill/SKILL.md` with starter frontmatter and instructions. Replace the placeholders and add `agents/openai.yaml` separately; the command only generates `SKILL.md`.

- Define the skill in `SKILL.md` with YAML frontmatter containing `name` and `description`. The description should explain when to use the skill.
- Keep instructions concise, actionable, and focused on the skill's workflow.
- Add or update the skill's `README.md` with usage examples and project-specific preferences, linking to `SKILL.md` for the agent instructions.
- Add or update `agents/openai.yaml` to match the existing agent metadata format.
- Update the skill list in [README.md](README.md#skills) when adding, renaming, or removing a skill.

Test the skill against a representative task. Reinstall from the checkout before testing edits: installed skills are copies, so changes do not propagate automatically.

## Installer changes

Keep the installer a small wrapper around the `skills` CLI. Reuse its selection menu and installation options. Preserve the caller's working directory and terminal so project-local installation and interactive prompts work correctly.

Use ESM and follow [.editorconfig](.editorconfig) for formatting.

## Validation

Run the package and installer checks used by CI:

```bash
pnpm ci
pnpm pack --dry-run --config.ignore-scripts=true
node bin/cli.mjs --list
```

For installer changes, also test interactive selection and installation of selected skills in a temporary project. Confirm that the installed files match the checkout and that cancelling a prompt leaves the project unchanged.

Include `pnpm-lock.yaml` when changing dependencies.

## Commits and pull requests

Use lowercase Conventional Commit messages, such as:

```text
feat(skills): add a new skill
fix(installer): preserve project installation scope
docs(contributing): clarify validation steps
```

Keep each commit focused on one logical change and preserve unrelated work.

Open pull requests against `master`. Describe what changed, why it changed, and how you validated it. Link related issues when applicable.
