---
name: typescript-authoring
description: Use when writing, reviewing, or refactoring TypeScript, including Vue script blocks. Apply preferences for declaration grouping, array wrapping, object destructuring, explicit control flow, and precise types.
---

# TypeScript Authoring

Apply these preferences to authored code within the scope of the change. Preserve generated output, behavior, and public contracts unless the task calls for a change. Follow the project's formatter and existing conventions for punctuation and imports.

## Formatting and declaration groups

- Declare values near their first use and keep related declarations and their immediate guards together. Separate distinct groups and steps such as validation, calculation, side effects, and return with blank lines. Prefer `const`. Use `let` when reassignment makes the flow clearer.
- When reading four or more properties from one object, prefer keeping a descriptively named object and accessing its properties directly. Destructuring up to three properties is fine.
- Give substantial object literals, destructuring patterns, argument lists, and type members one entry per line. Keep simple forms compact and import specifier lists together without blank lines.
- Wrap crowded arrays with one item per line. Consider item count, item width, and the surrounding code together. Four short codes can stay inline, while four strings of around 15 characters each usually read better on separate lines.

```ts
const locales = ['en', 'de', 'fr', 'es'];

const fulfillmentStates = [
  'awaiting-payment',
  'ready-to-dispatch',
  'out-for-delivery',
  'delivery-delayed',
];
```

## Explicit control flow

- Use multiline braced bodies for branches, loops, and `catch`, including single-statement guards. Prefer early returns that make the normal path clear.
- Use `if`/`else` or `switch` for meaningful decisions and conditional side effects. Reserve ternaries for simple, standalone choices.
- Use optional chaining and `??` for nullish access and defaults. Preserve valid values such as `0`, `false`, and `''`.
- Name intermediate values and compound conditions when the name explains their purpose. Split expressions that combine distinct steps into local declarations. Keep simple logic local.

## Precise, useful types

- Reuse existing domain contracts and generated API types. Give drafts, payloads, rows, and results precise named types. Prefer a small domain interface when it expresses the shape clearly.
- Let TypeScript infer obvious locals. Annotate public boundaries and values where inference would be misleading.
- Use `unknown` for untrusted values. Validate or narrow them at the boundary with schemas, type guards, or explicit checks, then pass concrete types internally. Resolve type errors without `any`, unchecked assertions, or non-null assertions that bypass validation.
- Model absence explicitly with optional properties, `null`, or `undefined`. Use discriminated unions when a tag makes valid state combinations clear.
- Use `satisfies` to check a value against a contract while preserving inference. Validate external data at runtime.

## Example: calculate a line total

```ts
interface QuantityDraft {
  productId: string;
  quantity?: number;
  unitPrice?: number;
  discountRate?: number;
}

interface LineTotal {
  productId: string;
  subtotal: number;
  total: number;
}

function calculateLineTotal(draft: QuantityDraft): LineTotal | undefined {
  if (draft.quantity === undefined || draft.unitPrice === undefined) {
    return undefined;
  }

  const subtotal = draft.quantity * draft.unitPrice;
  const discountRate = draft.discountRate ?? 0;

  let total = subtotal;

  if (discountRate > 0) {
    const discount = subtotal * discountRate;
    total -= discount;
  }

  return {
    productId: draft.productId,
    subtotal,
    total,
  };
}
```

## Finish the change

Run the relevant project typecheck and focused lint. When restructuring control flow, verify that short-circuiting, evaluation order, async sequencing, and error behavior are preserved.
