# Laravel Projects with ./manage

Use this skill to run, test, build, or troubleshoot Laravel projects using Docker Compose with `./manage` and `.manage.json`. It does not apply to Django's `manage.py`. See [SKILL.md](SKILL.md) for the agent instructions.

## Example requests

```text
Use $manage-projects to run the relevant tests through this Laravel project's isolated test stack.
```

```text
Use $manage-projects to troubleshoot this project's pnpm build through the documented wrapper.
```

## Project context

Point to the project instructions, README, `.manage.json`, and relevant Compose files. Identify the intended environment and command arguments. The skill checks the wrapper's help and version before relying on commands that may vary between releases.

The skill uses the project's wrapper for verification and preserves its host UID/GID behavior. It distinguishes `./manage test`, which uses an isolated MySQL test stack, from `./manage artisan test`, which may use the selected application's database.

For a data restore, specify the source, target environment, and authorized scope. Request wrapper updates explicitly when they are part of the task.
