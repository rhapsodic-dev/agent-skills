---
name: manage-projects
description: Use when running, testing, building, or troubleshooting Laravel projects using Docker Compose with ./manage and .manage.json. Does not apply to Django manage.py.
---

# Laravel projects with ./manage

## Project context

- Read project instructions and the README; run `./manage help` and `./manage version`. Inspect `.manage.json` and relevant Compose files rather than assuming commands are identical across versions. The executable may be compiled; do not read or edit it as text.
- Run from the project root, or use `./manage --project-dir /absolute/project/path <command>` when supported.
- Confirm the effective `APP_ENV`: production/staging select their Compose overrides; other values select development. Artisan and stack commands target that environment; Composer and Node shortcuts use development containers.

## Commands and checks

- Prefer `./manage artisan`, `./manage composer`, and `./manage pnpm` (or the project's declared npm/yarn equivalent) over host tools. Preserve arguments and the wrapper's host UID/GID behavior.
- Use `./manage test [args...]` for the isolated MySQL test stack. `./manage artisan test` may use the selected application's database.
- Use `./manage stack ps` for status, `stack config` for configuration, and `stack up`, `logs`, or `down` as needed. Configuration output may contain secrets.
- `./manage init` creates `.env` if needed, installs dependencies, and generates `APP_KEY`; use it when setup is needed.
- Verify with the smallest relevant wrapper command. Diagnose failures using help, status, configuration, and relevant Dockerfiles/entrypoints; do not substitute host dependencies or reset data merely because the wrapper failed. Report unavailable checks and their cause.

## Data and updates

- `./manage dump [name]` and `./manage seed [dir]` export database/storage data. Laravel seeders use `./manage artisan db:seed`. Before `dump restore <name>` or `seed restore [dir]`, confirm the target environment, source, and authorized scope. Check `.manage.json` for paths and exclusions.
- `./manage update [version]` replaces the executable and may change its release pin; run it only when updating the wrapper is in scope.
