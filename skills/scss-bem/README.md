# SCSS BEM

Use this skill to write or refactor component SCSS with BEM naming. See [SKILL.md](SKILL.md) for the agent instructions.

## Example request

```text
Use $scss-bem to extract the product card into a component and update its styles.
```

## Project conventions

Check the project's shared styles for reusable mixins. Prefer `above` for responsive overrides when the styles apply from a breakpoint upward. Use `below` when they apply up to a breakpoint.

By default, extraction gives the component its own root BEM block and renames classes accordingly. For projects that need to keep existing classes, add this instruction to the project's `AGENTS.md` or include it in your request:

```text
Preserve existing CSS classes when extracting components.
```

Keep this preference in the consuming project so different projects can use different extraction conventions. Layout-owned wrappers still stay in the parent.
