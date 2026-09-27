# Development

Install skills from a local checkout to try changes before publishing to npm.

## Global installation

Install every skill for Codex across repositories:

```bash
npx skills add /path/to/agent-skills --global --agent codex --skill '*' --yes
```

Replace `/path/to/agent-skills` with the path to this checkout.

## Project-local installation

Run this from the target project to install skills for that repository only:

```bash
npx skills add /path/to/agent-skills --agent codex --skill '*' --yes
```

## Testing changes

Re-run the installation command for the scope you are testing after changing a skill and before testing it. You can batch several edits before reinstalling.

The [`skills` installer](https://github.com/vercel-labs/skills/blob/main/src/installer.ts) copies files from the checkout into the installation directory. Its default symlinks point to that installed copy, so edits in the checkout do not update installed skills automatically. Reinstallation is also required when using `--copy`.

For installation from published releases, see [README.md](README.md#installation).
