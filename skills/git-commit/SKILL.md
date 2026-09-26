---
name: git-commit
description: Use when reviewing repository changes and creating a Git commit.
---

# Git Commit

- Review the diff and stage only intended changes; preserve unrelated work.
- Create one logical commit using lowercase Conventional Commits: `type(scope): description`.
- For one dependency update, use `chore(deps): update <package> to v<version>` with the exact package and version, even when described as an upgrade.
- Require GPG signing when configured. Never retry unsigned after signing fails.
- If GPG is unavailable, do not commit unless the user explicitly authorizes an unsigned commit.
- Do not format, test, amend, bypass hooks, change Git configuration, or push unless explicitly requested.
- Report the commit hash, message, and remaining changes. If nothing is relevant, do not create an empty commit.
