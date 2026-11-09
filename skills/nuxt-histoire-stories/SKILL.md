---
name: nuxt-histoire-stories
description: Add or update colocated Vue stories in Nuxt projects already using Histoire, including typed interactive state and shared-layer story discovery. Follow the installed Histoire setup; do not convert Storybook projects or introduce a story framework without a request.
---

# Nuxt Histoire Stories

## Follow the installed setup

- Inspect `package.json`, `histoire.config.*`, its setup file, and one comparable story. Confirm Histoire is configured before applying this workflow. If the project uses Storybook, follow that setup; do not migrate it as part of a story task.
- Use the installed version's story format and helpers. In the established Vue setup, stories are colocated as `<component>.story.vue`; do not create Storybook `stories.ts` files from stale guidance.
- Read the component's props, emits, models, slots, and exported contracts before choosing scenarios. Preserve existing story titles and variant IDs when editing so links remain useful.
- Preserve the existing component imports, theme providers, aliases, and plugin isolation. A story task does not imply changing app initialization or story infrastructure.

## Demonstrate useful states

- Show the states or interactions changed by the task. Include an overview matrix when variants, sizes, or disabled states are easier to compare together.
- Add an interactive playground when controls reveal meaningful behavior. Use named typed state and an initializer function following the sibling story pattern. Return fresh objects and arrays per initialization so variants do not share mutable fixtures.
- Import public component contract types rather than re-declaring variant unions. Keep controls and displayed variants aligned with supported values.
- Bind models in both directions with the actual component's `v-model` contract. A bound prop alone does not demonstrate emitted updates. For actions without a model, show a small visible result or use the established event logger.
- Make default slots explicit when mixed with named slots. Demonstrate required providers or slots so the example represents actual component usage.
- Use deterministic local fixtures and scoped mocks for product data, including fixed dates for time-sensitive content. Avoid live authentication/API dependencies in a reusable control story. Restore global mocks and listeners when the story unmounts.
- Reuse existing story layout helpers; do not introduce a competing matrix or demo helper for one story.
- Follow local `auto-props` conventions when manual controls own the state; avoid presenting duplicate controls for the same value.

## Examples: typed playground and overview

These examples use the existing Magic UI button contracts and registered component names. Adapt imports, casing, prop names, and helpers to the target project; `HstKit*` helpers require the kit setup. Keep the repository's Vue block order and formatting.

A colocated `button.story.vue` can give controls and rendered content the same variant-owned state:

```vue
<template>
  <story title="Buttons/Button">
    <variant
      id="playground"
      title="Playground"
      :init-state="initPlaygroundState"
      auto-props-disabled
    >
      <template #default="{ state }">
        <mui-button
          :variant="state.variant"
          :size="state.size"
          :is-disabled="state.isDisabled"
        >
          <template #icon>
            <mi-arrow-left />
          </template>
          <template #default>
            {{ state.label }}
          </template>
        </mui-button>
      </template>

      <template #controls="{ state }">
        <hst-select v-model="state.variant" title="Variant" :options="variants" />
        <hst-select v-model="state.size" title="Size" :options="sizes" />
        <hst-text v-model="state.label" title="Label" />
        <hst-checkbox v-model="state.isDisabled" title="Disabled" />
      </template>
    </variant>
  </story>
</template>

<script setup lang="ts">
import type { ButtonSize, ButtonVariant } from '.';

interface PlaygroundState {
  variant: ButtonVariant;
  size: ButtonSize;
  label: string;
  isDisabled: boolean;
}

const variants: ButtonVariant[] = ['primary', 'secondary'];
const sizes: ButtonSize[] = ['tiny', 'small', 'large'];

function initPlaygroundState(): PlaygroundState {
  return {
    variant: 'primary',
    size: 'small',
    label: 'Back',
    isDisabled: false,
  };
}
</script>
```

For a model-driven component such as the existing `mui-checkbox`, use `v-model="state.checked"` in the default slot and bind an `hst-checkbox` control to the same field. Add `checked: boolean` to the state and initialize it to `false`. Clicking the component should update the control, and changing the control should update the component. Use a named `v-model` when that is the component's public contract.

For a static comparison, add this variant inside the same `<story>`, reusing the typed `variants` array above. Expand the matrix only along dimensions relevant to the task:

```vue
<variant id="overview" title="Overview" auto-props-disabled>
  <HstKitMatrix :gap="12">
    <HstKitMatrixRow is-header>
      <span />
      <span>Enabled</span>
      <span>Disabled</span>
    </HstKitMatrixRow>
    <HstKitMatrixRow v-for="variant in variants" :key="variant">
      <HstKitLabel>{{ variant }}</HstKitLabel>
      <mui-button :variant="variant">Button</mui-button>
      <mui-button :variant="variant" is-disabled>Button</mui-button>
    </HstKitMatrixRow>
  </HstKitMatrix>
</variant>
```

## Nuxt layers and verification

- Inspect layer discovery and prefixing before registering stories manually. Check whether `.story.vue` files are excluded from production component auto-registration; story discovery and Nuxt component registration are separate concerns.
- If a story requires a plugin/provider, use the established setup extension point. Keep the dependency scoped rather than enabling every product plugin in isolated stories.
- If a story is missing, check its filename, configured story globs, resolved Nuxt layers, and tree prefix before adding a duplicate path. If it fails to render, check component registration, aliases, required providers, and console errors before changing bundler settings.
- Run focused lint on changed stories using the project's package manager and scripts. Run the supported typecheck when contracts or setup change, and confirm that it includes stories; passing an app-only check does not verify excluded story files.
- Open the relevant story/variants using the configured browser workflow. Exercise controls and the component itself, check model synchronization and disabled behavior where relevant, and inspect console errors. For an overview, check that labels match the rendered states.
- Use the repository's `build-histoire` script when static story output is affected or requested; it is not a mandatory gate for every local story edit.
- Change Histoire configuration, patch packages, or optimization entries only when necessary for the requested work. Diagnose an infrastructure issue before expanding a story task into tooling changes.
- Report the scenarios changed, checks completed, and any blocked browser or static-output verification. Do not claim rendered behavior from lint or typecheck alone.

## Rhapsodic Histoire kit, when installed

- Inspect the installed `@rhapsodic/histoire-kit` and a current sibling story before copying APIs; supported helpers may differ by version.
- Use `defineHistoireKitNuxtConfig` from `@rhapsodic/histoire-kit/config/nuxt`. `discoverNuxtLayerStories.rootStoryPrefix` groups the current project's stories; `discoverNuxtLayerStories.prefixLayerStories` separately groups discovered layers. Neither option changes Nuxt component names.
- Setup uses `defineHistoireKitSetup` from `@rhapsodic/histoire-kit/setup` and exports `setupVue3`. A setup callback receives `{ app }` for installing a required service. Import theme styles through the project's configured assets or aliases.
- Stories use `<story>` and `<variant>`. Common layout helpers include `HstKitOverview`, `HstKitSection`, `HstKitExamples`, `HstKitMatrix`, `HstKitMatrixRow`, `HstKitLabel`, and `HstKitGroup`. Reuse the subset present in a comparable story rather than assuming every helper exists.
- Interactive variants commonly bind `:init-state="initPlaygroundState"`, use `#default="{ state }"` and `#controls="{ state }"`, and set `auto-props-disabled`. Controls such as `hst-select`, `hst-text`, and `hst-checkbox` bind that state.
- If `@rhapsodic/pnpm-plugin-histoire-patches` is installed as a pnpm config dependency, inspect its supported upstream versions before an explicitly requested upgrade. Use the package's documented `pnpm add --config` setup rather than hand-editing integrity entries or adding duplicate `patchedDependencies` patches.

### Example: consuming app with layer stories

When layer discovery is part of the requested change and the installed kit supports these options, the consuming app's `histoire.config.ts` can use:

```ts
import { defineHistoireKitNuxtConfig } from '@rhapsodic/histoire-kit/config/nuxt';

export default await defineHistoireKitNuxtConfig({
  discoverNuxtLayerStories: {
    rootStoryPrefix: 'PRODUCT',
    prefixLayerStories: true,
  },
  setupFile: '/.histoire/setup.ts',
});
```

Discovery follows the app's resolved Nuxt layers, including local and installed package layers. Preserve the existing layer resolution; do not hardcode sibling checkout paths just to find stories. Inspect the installed kit's defaults before overriding globs or optimizer entries.

The corresponding `.histoire/setup.ts` can retain the shared registrations without adding product services:

```ts
import { defineHistoireKitSetup } from '@rhapsodic/histoire-kit/setup';

export const setupVue3 = defineHistoireKitSetup();
```

Keep the project's existing theme style imports. When a story needs a service, use the callback form `defineHistoireKitSetup(({ app }) => { /* install the required service */ })` with the existing installer or plugin. Scope mutable service state to the supported setup lifecycle rather than sharing it between stories accidentally. These examples describe extension points, not a reason to replace working configuration.
