---
applyTo: "config/*.json,templates/**/*.json"
---

# Theme JSON Files

JSON files in `config/` and `templates/` are part source code and part editor-managed state. Treat them carefully and keep diffs minimal.

## General handling

- Preserve existing key order, structural shape, and stable instance IDs unless the task explicitly requires changing them.
- Avoid broad reformatting or object reordering in editor-managed files.
- A small JSON diff is better than a cosmetically cleaner rewrite that obscures real behavioral changes.

## `config/settings_schema.json`

- Edit this file only for global merchant settings.
- Keep the `theme_info` entry intact unless the task is truly about theme metadata.
- Use the narrowest valid Shopify setting type and keep categories organized for merchant scanning.
- All merchant-visible strings must reference locale keys from `en.default.schema.json`.
- Prefer section or block schema when the setting only matters to one surface. Do not promote local options into theme settings without a real cross-theme need.

## `config/settings_data.json`

- Treat this file as store data, not authored source.
- Do not edit it unless the request explicitly asks for seeded settings, preview data, or merchant data changes.
- During merges, default to keeping the repo's version of this file. It is merchant/store data, not vendor code.
- If a feature needs a new default-capable setting, add it to `settings_schema.json` first.

## Template JSON responsibilities

- Template JSON wires section instances to templates. Preserve the top-level `sections` object and `order` array.
- Section instance `type` values must match real section filenames.
- Keep section instance IDs stable unless the task explicitly requires replacing the instance. Renaming IDs can orphan merchant configuration.
- When a section instance owns blocks, preserve the `blocks` map plus the matching `block_order` array.
- Keep nested block trees aligned with the Liquid that renders them.

## Upstream sync safeguards

- `config/settings_schema.json` is always manual-review territory if both Gamma and upstream changed it.
- `templates/**/*.json` are always manual-review territory if both Gamma and upstream changed them.
- Preserve stable IDs, `order`, `block_order`, and static block tree shape unless a deliberate migration is being performed.
- Do not rewrite template JSON wholesale during conflict resolution.
- If upstream added useful structure, rebuild the merged JSON carefully instead of accepting one side wholesale.
- Treat settings and template contracts as merchant-facing behavior, not cosmetic formatting.

## Static and nested block trees

- Static block wiring in JSON is not optional. Shared IDs like `product-card`, `filters`, `media-gallery`, and `product-details` are part of the runtime contract between the template and Liquid.
- Nested static blocks belong inside the parent block's `blocks` object, not only at the section root.
- Collection, product, and metaobject templates in this repo are canonical references for how deep block trees are wired.
- Any change to static block IDs, types, or nesting must be mirrored in the Liquid source and validated through [static-blocks.instructions](./static-blocks.instructions.md).

## Metaobject and future customer templates

- `templates/metaobject/**/*.json` follows the same rules as collection and product templates. Treat metaobject pages as first-class templates, not a side channel.
- If customer JSON templates are added later, keep the same stable section-instance and block-tree rules.

## Anti-patterns

- Do not rename instance IDs just to make them prettier.
- Do not move merchant-managed block configuration into section settings.
- Do not change JSON structure without checking the matching Liquid surface.
- Do not resolve template or schema conflicts without a human review pass.

## Supporting references

- See [surface-patterns](../reference/surface-patterns.md) for template JSON examples.
- See [maintenance](../reference/maintenance.md) for when JSON structure changes must trigger guidance updates.