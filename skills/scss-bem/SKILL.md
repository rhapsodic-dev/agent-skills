---
name: scss-bem
description: Use when writing or refactoring component styles in SCSS with BEM naming.
---

# SCSS BEM

- Inspect the component markup and one sibling stylesheet; preserve existing tokens, mixins, breakpoints, and naming conventions.
- Use `block__element` for elements and `block_modifier` or `block_modifier_value` for modifiers. Prefer semantic lowercase names and never create elements of elements.
- Each component owns its root BEM block by default. During extraction, rename classes to use that block unless project conventions or explicit instructions require preserving existing classes; refactor the wrapper hierarchy as needed and keep layout-owned wrappers in the parent.
- In SCSS, split a modifier key and value into separate nesting levels: write `&_state { &_error { ... } }`, not `&_state_error { ... }`. Keep nesting shallow and avoid selectors coupled to DOM hierarchy, tags, or IDs.
- Put shared styles on the base class and only differences on modifiers. Update markup and selectors together without adding unrelated global styles.
