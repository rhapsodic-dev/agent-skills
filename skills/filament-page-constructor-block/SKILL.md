---
name: filament-page-constructor-block
description: Use only when creating constructor blocks or migrating static Blade content into them in a Laravel Filament project already using a page-constructor package, such as scope/filament-page-constructor.
---

# Filament Page Constructor Blocks

## Inspect

- Confirm the project already uses a Filament page-constructor package through its Composer dependencies and plugin registration. If no such package is used, this skill does not apply. Follow the installed package's APIs and schema conventions when its names differ from the examples below.
- First inspect the package README, `BlockType`, registration, base relation manager, target markup, related UI, and one existing block. Preserve project translation, upload, and component conventions.

## Data

- Name blocks after reusable presentation or behavior, such as `link-grid`, `infographic`, or `entry-carousel`, rather than after a particular page.
- Reserve `page_blocks` for package metadata: type, internal title, visibility, and order. Give each type a normalized content table with a unique cascading `page_block_id`; never put content or JSON there.
- If every block is a UI section, keep shared instance content in a one-to-one table such as `page_block_sections`. Store only per-instance variation; leave fixed container mode, spacing, and header expansion in templates until editors need control.
- Typed tables own semantic content: public headings and text belong to the block record; `page_blocks.title` stays an internal Filament label. Repeatable children need cascading foreign keys, `is_active`, `order`, and an index such as `(parent_id, is_active, order)`.
- Locale-specific `PageTranslation` ownership already translates blocks; add no second layer unless the owner is not locale-specific.
- Register dynamic relations with `RegistersBlockRelations`; in `render()`, call `loadMissing()` and pass explicit data to a dedicated `page-blocks/*` view.

## Forms and rendering

- Keep forms compact, linear, and tab-free. Show only type-relevant settings; omit unsupported controls instead of hiding dehydrated fields, and enforce fixed values in code.
- A small section-schema helper may define shared editable fields, but each block chooses which to expose.
- Use relationship `Group` for one-to-one records and relationship repeaters with `orderColumn('order')` for children; show no manual order input.
- Use plain controls for plain text and `RichEditor` only for intentional HTML. Constrain presentation with selects or enums; never store arbitrary components or CSS classes.
- When a block extends another visual pattern, reuse its UI component or schema fragments without introducing model inheritance unless the persisted domain is genuinely shared.
- Block views are model-aware adapters. Keep `x-ui.*` independent of Eloquent and Filament, composed through props and slots where practical.
- Render one `x-ui.section` per section block. Pass shared relation values; keep heading markup, title size, container defaults, and wrapper choice in its template.
- Preserve explicit `section__*` styling hooks, including type-specific `section__info-grid` and `section__control-grid`; never store wrapper names.
- Escape database plain text; store intended characters instead of entities such as `&nbsp;`. Render trusted rich content deliberately under project sanitization.

## Delivery

- Register the class in `PageConstructorPlugin`; deliver its model, normalized schema, Filament relationship form, and public view together.
- Generate one migration per independent block type; related parent and item tables may share that migration.
- Migrate static content through an idempotent dedicated seeder or established importer. Preserve order and retain the source until constructor output is verified.
- Use the documented Artisan runner and migration workflow. Never migrate the application database without explicit task and environment permission.
- Verify only changed behavior: PHP syntax, relation/panel discovery, missing-optional-data rendering, and the smallest relevant application check. Do not format unrelated files.
