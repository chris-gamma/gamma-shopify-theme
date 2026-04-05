---
applyTo: "sections/*.liquid,blocks/*.liquid"
---

# Sections And Blocks

Sections and blocks are the main authoring surfaces in this theme. Keep the responsibility boundary clear: sections compose page modules, blocks expose merchant-editable content inside those modules, snippets render helpers, and assets provide behavior.

## Section responsibilities

- Sections are page-level modules. Each section file must contain exactly one `{% schema %}` block.
- Use a section when the feature owns page layout, pagination, product/result iteration, or a major content area such as collection results, product information, or a campaign landing page.
- Namespace every instance-specific DOM id and ARIA target with `section.id` or `block.id`, use stable CamelCase id prefixes, and keep repeated instances isolated so multiple copies can coexist safely.
- If a section grows into a large composed view, capture child fragments and hand them to a wrapper snippet instead of keeping every branch inline. The repo already does this in collection and product information flows.
- Keep section settings focused on page-module concerns such as spacing, layout mode, color scheme, and enablement flags. Do not move fine-grained card or nested content settings up into the section if those settings logically belong to a block.

## Block responsibilities

- Blocks are merchant-configurable nested units. Every block file must contain exactly one `{% schema %}` block.
- `block.shopify_attributes` is required on the outer rendered element for every block. Without it, editor selection and drag/drop break.
- Public block files such as `blocks/group.liquid` or `blocks/variant-picker.liquid` are merchant-addable building blocks.
- Underscore-prefixed block files such as `blocks/_product-card.liquid` are static infrastructure blocks rendered through `content_for 'block'`. They are part of a template contract, not freeform editor content.
- Static blocks that mirror parent resources should keep using `closest.product`, `closest.collection`, or similar context rather than adding redundant settings.

## Dynamic children and nested trees

- Render dynamic children with exactly one `{% content_for 'blocks' %}` call per Liquid file. If the same child markup is needed in multiple branches or positions, capture it once and reuse the captured output.
- When a block accepts nested theme or app content, declare that explicitly in schema:

```json
"blocks": [
  { "type": "@theme" },
  { "type": "@app" }
]
```

- Use nested blocks when the parent owns layout and the children are editor-managed content slots.
- Use static nested blocks when the parent must always render a fixed internal structure, such as shared product-card or product-detail composition.

## Static versus dynamic decisions

- Use a dynamic block when the merchant should add, remove, reorder, or duplicate it freely in the editor.
- Use a static block when the parent always needs that block to exist and the structure must stay aligned with template JSON.
- Shared IDs like `product-card`, `filters`, `media-gallery`, and `product-details` are part of the configuration contract. Renaming them can strand merchant settings and break JSON wiring.
- Any static block change must be reflected in the template JSON tree. Follow [static-blocks.instructions](./static-blocks.instructions.md).

## Schema design

- Add a schema setting when the merchant should reasonably control the result. Do not hardcode merchant-facing options in markup, CSS, or JS.
- If a block uses `"tag": null` in schema, render an explicit outer wrapper and keep `{{ block.shopify_attributes }}` on that wrapper.
- Keep resource picker settings first, then layout settings, then typography, then color, and then spacing controls.
- Use header settings to group related controls when a schema becomes large.
- Keep schema labels concise.
- Use the narrowest valid setting type.
- Use `visible_if` to gate dependent controls instead of exposing settings that are inactive most of the time.
- Use locale keys for every `label`, `content`, option label, preset name, and category label.
- Add presets only for surfaces merchants can insert directly. Static infrastructure blocks do not need pretend presets just to satisfy symmetry.

## Styling decisions

- One setting that maps to one CSS value should usually become a CSS custom property. Reset that property inline on the rendered section or block wrapper through the `style` attribute instead of generating selector-per-ID CSS.
- One setting that changes multiple rules should usually become a semantic class or data attribute.
- Keep spacing, border, and layout helpers aligned with the existing wrapper snippets and utility snippets already used throughout Horizon.

## App block acceptance

- Add `@app` only when the surface is a real merchant extension point and unknown third-party content can be rendered safely there.
- Good candidates are group-like containers and card or content stacks that intentionally invite extensibility.
- Avoid `@app` on tightly-coupled infrastructure blocks whose layout, semantics, or data contract depend on a fixed internal tree.

## Repo-backed patterns

- `sections/main-collection.liquid` owns pagination, result counts, filters, and the product grid. It delegates repeated card markup to a shared static `_product-card` tree.
- `sections/product-information.liquid` captures media and detail subtrees, then renders a wrapper snippet that controls the full product layout.
- `blocks/_product-card.liquid` captures nested card children and passes them to the `product-card` snippet, keeping product-card markup centralized.
- `blocks/group.liquid` renders dynamic child blocks and passes the resulting children into the `group` snippet, which owns the actual wrapper markup.
- `blocks/filters.liquid` shows how a block can own complex filter and sorting composition without taking over page-level collection pagination.

## Anti-patterns

- Do not duplicate product-card or product-detail markup into multiple sections when a shared block or snippet already exists.
- Do not let blocks reach sideways into sibling markup owned by another block.
- Do not move page-level loops or pagination into a block just because the UI is nested visually.
- Do not add section settings for content that should remain resource-derived through `closest.*`.

## Validation focus

- After changing a section or block, verify the storefront and the theme editor.
- Specifically test drag/drop, selection outlines, nested block controls, and any repeating layouts that use the edited surface.

## Supporting references

- Placement examples live in [surface-patterns](../reference/surface-patterns.md).
- Family-specific extension guidance lives in [component-families](../reference/component-families.md).
