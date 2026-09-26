---
name: scss-bem
description: Use when writing or refactoring component styles in SCSS with BEM naming.
---

# SCSS BEM

- Inspect the component markup and one sibling stylesheet; preserve existing tokens, mixins, breakpoints, and naming conventions.
- Use `block__element` for elements and `block_modifier` or `block_modifier_value` for modifiers. Prefer semantic lowercase names and never create elements of elements.
- A component owns its root block; never use a parent component's element class as another component's root.
- In SCSS, split a modifier key and value into separate nesting levels: write `&_state { &_error { ... } }`, not `&_state_error { ... }`. Keep nesting shallow and avoid selectors coupled to DOM hierarchy, tags, or IDs.
- Put shared styles on the base class and only differences on modifiers. Update markup and selectors together without adding unrelated global styles.
