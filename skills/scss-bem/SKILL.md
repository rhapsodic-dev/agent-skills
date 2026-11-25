---
name: scss-bem
description: Use when writing or refactoring component styles in SCSS with BEM naming.
---

# SCSS BEM

- Prefer BEM wherever the markup and styling APIs support it. If applying BEM would cause a concrete problem, such as rewriting generated markup or working around a third-party component's styling API, pause before implementing that styling choice. Ask explicitly whether to use BEM or the alternative. Show two concrete examples for the same case, one using BEM and one using the alternative, and explain the benefit and tradeoff of each. State which approach fits the case better and why, then wait for the user's choice.
- Inspect the markup, a sibling stylesheet, and the project's shared SCSS mixin definitions. Reuse existing mixins and preserve project tokens, breakpoints, and naming conventions.
- Prefer the project's `above` mixin for overrides that start at a breakpoint and apply to wider screens (`min-width`). Use `below` for styles that apply up to and including a breakpoint (`max-width`). When changing an existing query, check the styles at the breakpoint itself.
- Use `block__element` for elements and `block_modifier` or `block_modifier_value` for modifiers. Prefer semantic lowercase names and never create elements of elements.
- Each component owns its root BEM block by default. During extraction, rename classes to use that block unless project conventions or explicit instructions require preserving existing classes; refactor the wrapper hierarchy as needed and keep layout-owned wrappers in the parent.
- In SCSS, split a modifier key and value into separate nesting levels: write `&_state { &_error { ... } }`, not `&_state_error { ... }`. Keep nesting shallow and avoid selectors coupled to DOM hierarchy, tags, or IDs.
- Use direct BEM class selectors by default for markup the component owns. Use `:where()` only when a selector condition should add zero specificity, such as scoped defaults for rendered rich text. For example, `.article-body :where(h2, h3)` keeps the specificity of `.article-body` alone. Keep the BEM class outside `:where()` unless the entire rule is meant to have zero specificity.
- Put shared styles on the base class and only differences on modifiers. Update markup and selectors together without adding unrelated global styles.
