# Laravel Database Migrations

Use this skill to create database migrations in Laravel applications through Artisan. See [SKILL.md](SKILL.md) for the agent instructions.

## Example request

```text
Use $laravel-migrations to add a nullable published_at timestamp to posts.
```

## Project context

Describe the schema change and relevant tables or models. Document the project's Artisan runner in its README, such as `./manage artisan`; the skill otherwise uses `php artisan`.

Identify a separate testing database when one is configured. The skill runs the migration there before applying it to the application database. If no separate testing database exists or that check fails, it asks you to run the migration.

State whether existing migrations are fresh and uncommitted or have already been committed or deployed. The skill preserves committed and deployed migration history by default.
