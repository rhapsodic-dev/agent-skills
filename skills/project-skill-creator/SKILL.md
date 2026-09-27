---
name: project-skill-creator
description: Use when creating or updating agent skills inside a specific project from its workflows and conventions. Does not apply to installing third-party skills or changing global agent configuration.
---

# Project Skill Creator

## Project context

- Read project instructions, README, relevant configuration, and one related skill. Use actual project commands and conventions.
- Honor the requested destination; otherwise use the project's skill directory or `.agents/skills/<name>/`. Preserve unrelated work.
- Match the folder with a lowercase, kebab-case name under 64 characters. Update existing skills narrowly and preserve supplied rules unless rewriting is requested.

## Instructions

- Include `name` and a precise task description in YAML frontmatter, with relevant prerequisites and exclusions.
- Make skills concise: keep only rules that change decisions, use direct verbs, and remove repetition, generic advice, tutorials, and speculative cases.
- Give each bullet one related decision, naming necessary commands, APIs, conditions, and constraints. Use installed versions and the documented runner.
- Separate defaults from requirements; allow project and task overrides. Honor existing authorization and diagnose failures without expanding scope or resetting data.
- Keep essential rules in `SKILL.md`; use sections, references, or scripts only when useful. Add README examples and agent metadata only when requested or required by project conventions.
- Use an available initializer or create minimal files directly. Avoid new scaffolding dependencies, reinitializing existing skills, and unfinished placeholders.

## Validation

- Check frontmatter, naming, references, and discovery with available validators.
- Verify relevant behavior and scope boundaries when applicable; avoid unrelated formatting and wording-only tests.
- Report paths, project scope, checks, and unavailable validation.
