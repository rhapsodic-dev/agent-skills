---
name: vue-component-authoring
description: Create, extract, split, or substantially refactor Vue 3 and Nuxt components with typed props, emits, and slots while preserving imports and component registration. Follow the project's README; keep narrow bug fixes local.
---

# Vue Component Authoring

## Establish the boundary

- Read the consuming project's README, local instructions, component registration configuration, one sibling component, and relevant callers before choosing a structure. The project's README always takes priority over this skill; apply these rules where the README does not specify otherwise.
- Keep route-, store-, and API-dependent composition in the product app. Check existing shared controls before creating another presentation component.
- Keep a narrow fix local. Move or split components when the requested work benefits from that boundary, rather than applying the directory convention to unrelated files.
- Extract components around a distinct responsibility, reusable structure, or independently meaningful interaction. Do not split solely because a file is long or a section has a heading. Keep tightly coupled markup together when extraction would mostly introduce forwarding props and slots.

## Structure and contracts

- Give every component its own kebab-case directory, including trivial and private leaf components: `user-card/user-card.vue`. Apply this to components being created, extracted, or moved; leave unrelated existing files alone.
- Keep each component's external contracts in its own `index.ts` and its stories beside its SFC. Do not merge distinct components' contracts merely because they belong to the same family.
- Every component inside `layers/ui` or `app/components/ui`, including nested and trivial components, must have its own separate `index.ts` for its props, emits, and slots types.
- Colocate reusable props, public emits, slots, variants, and externally imported types. Name them after the component, such as `UserCardProps`, `UserCardEmits`, and `UserCardSlots`.
- Allow contracts inside the `.vue` file only for a product-app leaf outside `layers/ui` and `app/components/ui` with one or two primitive props, no public events, no variants, and no externally consumed types. Shared-library components should keep their public contracts discoverable even when small.
- Define props, emits, and slots as separate named interfaces, including when they stay inside the `.vue` file. Pass those interface names to Vue macros rather than anonymous inline object types; use named type aliases for variant unions.
- Declare only contracts the component actually exposes. Do not create empty interfaces, unused macros, or speculative variants.
- Use the project's typed Vue macros. Keep actual defaults in `withDefaults`; omit entries whose only default is `undefined`, and use `defineProps` directly when no defaults are needed.
- Group tightly related children by nesting their own component directories under the parent, never by placing distinct component SFCs side by side in one directory. For example, use `radio-group/radio-group.vue`, `radio-group/index.ts`, `radio-group/radio/radio.vue`, and `radio-group/radio/index.ts`. Check generated component names before changing this hierarchy.

## Templates and behavior

- Order Vue single-file component blocks as `<template>`, `<script setup lang="ts">`, then `<style>`.
- Keep script and style blocks even when empty. An empty block contains exactly two lines: the opening tag and the closing tag, with no blank line or placeholder code between them. Preserve existing block attributes.
- Use kebab-case for component tags in Vue templates, such as `<user-card />`, including locally imported components. Keep component filenames and directories in kebab-case; script import identifiers and TypeScript contract names may use PascalCase.
- For multiline opening tags, put the tag name on its own line and each attribute on a separate line indented two spaces from the tag. Align the closing `>` or `/>` with the opening `<`; do not align attributes beneath an inline first attribute. Short tags can remain on one line.
- Write `<template>` blocks across multiple lines, with the opening and closing tags on their own lines and the content indented. Apply this to named slots and conditional wrappers, including a single forwarded `<slot />`; do not compress them into one-line blocks.
- Expand object literals with multiple entries in template bindings onto multiple lines, with one property per line and trailing commas. Apply the same formatting to nested objects, including those mixing spreads and properties. Keep short single-entry objects and short arrays inline.
- Write fixed UI content and structure as template markup: cards, headings, explanatory text, legends, and fixed options should use explicit elements or component slots. Do not create placeholder data or presentation object arrays merely to render them with `v-for` unless explicitly requested. Keep real API collections, computed business results, shared domain mappings, and configuration required by an external API in script; use small slot-based components to share repeated structure.
- Preserve existing localization, schema-driven UI, and shared option definitions. Do not replace legitimate content mappings or domain configuration with duplicated markup.
- When default content accompanies named slots, use an explicit `<template #default>`. Keep named slot templates as direct children of their component.
- Prefer wrapping conditional branches in `<template v-if>`, `<template v-else-if>`, and `<template v-else>`. Put a conditional named slot's condition on its slot template.
- Keep reusable behavior in composables and low-level pure logic in utilities. Keep ordinary local expressions in the component rather than extracting a composable without a separate responsibility. Prefer named functions for reusable helpers when no local convention overrides this.
- Use `useBMC` from `@rhapsodic/bem-classnames-vue` for dynamic BEM classes when installed; follow its installed API and skills.
- Reuse existing theme tokens. Use a literal class for a static root; do not add a class-generation dependency for a local change.
- Render icons through dedicated icon components from the project's established icon directory or shared layer. Reuse existing icons; add missing icons beside the others, including in an available sibling UI library when that owns the icon system. Keep icon SVG and path data out of product components. Data-driven SVG charts remain in their chart components.
- In Nuxt apps, inspect configured prefixes and auto-imports; use explicit Vue/Nuxt imports in reusable module runtime code rather than assuming app auto-imports apply there.

## Preserve consumers

- Before a move, find direct imports, auto-registered usages, type imports, stories, and tests. Preserve the public name or migrate the affected callers within the authorized scope.
- Before completing a component creation or move, check that every affected component has its own directory and that examples, contracts, and stories follow the same layout.
- Preserve behavior, defaults, events, slots, and accessible interaction states unless the task changes them.
- Validate changed component contracts with the project's typecheck command and focused lint. For template or style changes, verify the relevant rendered state using the configured browser or story workflow.

## Complete component example

This self-contained example uses native HTML, external contracts, an optional named slot with fallback content, and a parent that supplies both slots. Adapt the names and content to the task rather than copying the example as scaffolding.

`user-card/index.ts`:

```ts
export interface UserCardProps {
  id: string;
  name: string;
  isActive?: boolean;
}

export interface UserCardEmits {
  select: [id: string];
}

export interface UserCardActionsSlotProps {
  isActive: boolean;
  select(): void;
}

export interface UserCardSlots {
  default(): unknown;
  actions?(props: UserCardActionsSlotProps): unknown;
}
```

`user-card/user-card.vue`:

```vue
<template>
  <article class="user-card">
    <h2 class="user-card__name">{{ props.name }}</h2>

    <div class="user-card__content">
      <slot />
    </div>

    <div class="user-card__actions">
      <slot
        name="actions"
        v-bind="{
          isActive: props.isActive,
          select: selectUser,
        }"
      >
        <button
          type="button"
          :disabled="!props.isActive"
          @click="selectUser"
        >
          Select user
        </button>
      </slot>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { UserCardEmits, UserCardProps, UserCardSlots } from './index';

const props = withDefaults(defineProps<UserCardProps>(), {
  isActive: true,
});

const emit = defineEmits<UserCardEmits>();

defineSlots<UserCardSlots>();

function selectUser(): void {
  if (!props.isActive) {
    return;
  }

  emit('select', props.id);
}
</script>

<style>
</style>
```

`team-panel/team-panel.vue`, with `team-panel/` beside the `user-card/` directory:

```vue
<template>
  <section>
    <h1>Team</h1>

    <user-card
      id="user-42"
      name="Ada Lovelace"
      @select="handleSelect"
    >
      <template #default>
        <p>Works on the analytical engine.</p>
      </template>

      <template #actions="{ isActive, select }">
        <button
          type="button"
          :disabled="!isActive"
          @click="select"
        >
          Choose Ada
        </button>
      </template>
    </user-card>

    <p role="status">
      <template v-if="selectedUserId">
        Selected user: {{ selectedUserId }}
      </template>
      <template v-else>
        No user selected.
      </template>
    </p>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import UserCard from '../user-card/user-card.vue';

const selectedUserId = ref<string>();

function handleSelect(id: string): void {
  selectedUserId.value = id;
}
</script>

<style>
</style>
```

## Trivial leaf example

For a trivial product-app leaf outside `layers/ui` and `app/components/ui` that qualifies to keep contracts inside its `.vue` file, still use its own directory (`status-label/status-label.vue`) and declare a separate named interface:

```vue
<template>
  <span :title="hint">{{ label }}</span>
</template>

<script setup lang="ts">
interface StatusLabelProps {
  label: string;
  hint?: string;
}

defineProps<StatusLabelProps>();
</script>

<style>
</style>
```

## Reusable logic defaults

- Prefer concern-based composable filenames such as `hover.ts`; reserve `useHover` for the exported function.
- Prefer `undefined` for optional app values while preserving `null` required by an external contract.
- Helper configuration with more than two or three fields normally stays as a named `config` or `payload` object rather than a long destructured signature.
- For SCSS BEM rules or class-generation APIs, use relevant installed skills when available rather than duplicating their guidance.
