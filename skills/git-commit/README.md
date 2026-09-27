# Git Commit

Use this skill to plan, review, or create Git commits. See [SKILL.md](SKILL.md) for the agent instructions.

## Example requests

- `Use $git-commit to suggest a commit plan for the current changes.`
- `Use $git-commit to commit staged changes.`
- `Use $git-commit to review and commit the intended changes.`
- `Use $git-commit to split the changes into two logical commits.`

Planning leaves the index and commits unchanged. A staged-only request commits exactly the staged set. For other commit requests, specify the intended files or scope when the working tree contains unrelated changes.

## Commit conventions

The skill uses lowercase Conventional Commits and respects configured GPG signing. State requested actions such as pushing or amending explicitly; a commit request alone does not include them.
