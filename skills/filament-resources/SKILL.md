---
name: filament-resources
description: Use when creating, migrating, or updating Filament resources in a Laravel application.
---

# Filament Resources

- Check the Filament version, target model, and one sibling resource. Inspect anything else only when needed. Preserve existing translation and storage systems unless migration is requested.
- Follow the installed generator. In Filament 5, use a thin resource with separate `Pages`, `Schemas`, and `Tables`; keep domain rules outside UI classes.
- Prefer compact blocks and controls. Every resource form must have at least an `Основное` tab. Keep tabs flat and order the `Основное` fields as: visibility and activity toggles first (each full-width), the primary name or title field second (full-width when multilingual), then all other fields. Put a repeatable gallery or carousel relationship in a separate tab named `Карусель` or another equally clear carousel-specific name. Do not create a carousel tab for one or several standalone image fields; keep those with the other fields, normally in `Основное`. Keep SEO last. Avoid unnecessary sections, titles, padding, and subtitles.
- Keep related short controls on one row. Make multilingual and rich content fields full-width.
- Prefer a relation manager for ordered child entities that need their own create and edit lifecycle, such as navigation items. Expose that relation manager from the owning resource when editors should manage the children there, such as navigation from a header.
- Build translations from active languages using the installed package. Hydrate Astrotomic edit state with `getTranslationsArray()`. Define fields inline; avoid trivial component helpers.
- Use `RichEditor` only for HTML, `Toggle` for booleans, domain-clear labels, correct validation, and project upload conventions.
- Use `ToggleColumn` for editable booleans. Eager-load displayed relations and translations; search and filter their real storage. Evaluate every table for useful filters: filter by relevant resource relations, add date or date-range filters when dates are operationally meaningful (such as reviews, feedback, and applications), and make the primary name or title searchable, including translated storage. Do not add image or media-presence filters.
- Extract filters with non-trivial schemas, query logic, indicators, or repeated configuration into dedicated filter components. Keep simple built-in relation, select, and boolean filters inline.
- Render table row actions as icon buttons with clear tooltips.
- Order table columns deterministically: a numeric `id` first, an image or image preview second when one exists, the primary name or title third, then other columns, with `updated_at` last when it exists. Keep the core prefix and `updated_at` visible by default. Show other columns by default only while the table fits comfortably at its normal content width; make secondary or overflow columns toggleable and hidden by default. Hide manual order and `created_at` columns by default. Prefer drag ordering, never reorder outside the selected scope, and omit manual order inputs.
- Verify minimally: no formatter unless requested, only the smallest necessary check, and no migration unless the schema changes.
