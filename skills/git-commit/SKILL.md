---
name: git-commit
description: Use when planning, reviewing, or creating Git commits.
---

# Git Commit

- When asked to suggest commits, produce a commit plan without modifying the index or creating commits.
- “Commit staged” means inspect and commit exactly the staged set; do not add unstaged files. If the staged set is not coherent, report that instead of silently expanding it.
- Otherwise review the diff and stage only intended changes; preserve unrelated work.
- For a requested series, separate foundational UI components, individual constructor blocks, and integration or seeding changes, preserving dependency order.
- Keep package-manager and Composer or container changes in separate commits when they are independently reversible.
- Create one logical commit using lowercase Conventional Commits: `type(scope): description`.
- For one dependency update, use `chore(deps): update <package> to v<version>` with the exact package and version, even when described as an upgrade.
- Require GPG signing when configured. Never retry unsigned after signing fails.
- If GPG is unavailable, do not commit unless the user explicitly authorizes an unsigned commit.
- Do not format, test, amend, bypass hooks, change Git configuration, or push unless explicitly requested.
- Report the commit hash, message, and remaining changes. If nothing is relevant, do not create an empty commit.
