# Nuxt Histoire Stories

Add or update colocated Vue stories in Nuxt projects already using Histoire, with typed interactive state, overview matrices, and shared-layer discovery. See [SKILL.md](SKILL.md) for the agent instructions and code examples.

## Example requests

```text
Use $nuxt-histoire-stories to add a typed playground and an enabled/disabled overview to this button's colocated story.
```

```text
Use $nuxt-histoire-stories to update this checkbox story so the component and its controls stay synchronized through v-model.
```

```text
Use $nuxt-histoire-stories to diagnose why stories from this Nuxt layer are missing from the consuming app's Histoire tree.
```

## Project conventions

The skill follows the installed Histoire version, configuration, setup file, component contracts, and sibling stories. It preserves story titles and variant IDs, uses deterministic fixtures, and keeps infrastructure changes scoped to the request. It does not introduce Histoire or migrate a Storybook project.

Magic UI and `@rhapsodic/histoire-kit` examples apply when those packages and registrations are available. Adapt their component names and supported APIs to the consuming project; the kit is optional.
