---
name: laravel-migrations
description: Use when creating a database migration in a Laravel application.
---

# Laravel Database Migrations

- Inspect the README for the documented command runner, then the relevant schema and one recent migration.
- Use the project's documented Artisan runner for all migration commands, such as `./manage artisan`; otherwise use `php artisan`. Always create with `make:migration <name>`. Never create or timestamp a migration file manually; if creation fails, stop.
- Edit only the generated file and make `down()` reverse `up()` safely.
- If a separate testing database is configured, run the migration there first. Only after it succeeds, run the migration against the application database. If it fails or no separate testing database exists, do not run it against the application database; ask the user to run the migration. Report the generated path and schema change.
