# Vue Component Authoring

Create, split, or substantially refactor Vue 3 components with typed contracts, explicit slots, and stable imports or Nuxt component registration. See [SKILL.md](SKILL.md) for the agent instructions.

## Example requests

```text
Use $vue-component-authoring to extract this reusable card into a component with typed props, emits, and slots while preserving its callers.
```

```text
Use $vue-component-authoring to split this Nuxt component into related children, preserving its public name and configured auto-imports.
```

## Project conventions

The consuming project's README always takes priority over the skill. The skill follows existing project structure and keeps narrow fixes local. Without a stronger convention, reusable components use `user-card/user-card.vue` with contracts in `user-card/index.ts`; trivial private leaves may stay flat.

Keep project-specific preferences in the consuming project's instructions or the request. Use the installed SCSS BEM or class-generation skills for their respective rules and APIs.
