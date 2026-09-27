# Filament Page Constructor Blocks

Use this skill only in Laravel Filament projects already using a page-constructor package, such as `scope/filament-page-constructor`. It creates constructor blocks or migrates static Blade page content into them. See [SKILL.md](SKILL.md) for the agent instructions.

## Example requests

```text
Use $filament-page-constructor-block to create a reusable link-grid block using the project's existing UI components.
```

```text
Use $filament-page-constructor-block to migrate this static Blade section into an infographic block with an idempotent seeder.
```

## Project context

Identify the installed page-constructor package, target markup, related UI components, and one existing block. Point to the package README and document the project's Artisan runner. If the project does not use a page-constructor package, this skill does not apply.

The skill preserves project translation, upload, and component conventions. It delivers the registered block, normalized content schema, relationship form, and public view together. For static content migration, it preserves order and retains the source until the constructor output is verified.

State any permission to run application database migrations explicitly, including the target environment. Creating migration files alone does not authorize applying them.
