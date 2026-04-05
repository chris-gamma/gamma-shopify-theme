---
name: schema-migration
description: "Safely coordinate section or block schema changes with template JSON wiring, locale keys, and merchant-impact notes for Gamma's Horizon-based client theme. Use when a change spans settings, static block contracts, or editor-managed JSON."
argument-hint: "Describe the schema or template change, affected surface, and any merchant-facing constraints"
---

# Schema Migration

Use this skill when a change touches a theme contract, not just markup. In this repo that usually means one change spans Liquid schema, `templates/**/*.json`, locale keys, and a quick risk check for merchant-configured data.

Treat Gamma as a single-client Horizon fork with live merchant configuration. Favor the narrowest safe contract change over a cleaner-looking rewrite.

## When to Use

- Adding, removing, or renaming a section or block setting
- Updating `config/settings_schema.json`
- Changing a static block tree or `content_for 'block'` wiring
- Moving a control between section, block, and theme settings
- Coordinating schema labels, help text, presets, or related storefront copy in the same change

## Do Not Use

- Copy-only cleanup with no schema or JSON contract change. Use `locale-audit`.
- LiquidDoc drift in snippets or underscore blocks. Use `liquiddoc-contracts`.
- Pure markup, CSS, or JavaScript work where schema changes are incidental.

## Read First

- [../../copilot-instructions.md](../../copilot-instructions.md)
- [../../instructions/blocks-sections.instructions.md](../../instructions/blocks-sections.instructions.md)
- [../../instructions/theme-json.instructions.md](../../instructions/theme-json.instructions.md)
- [../../instructions/static-blocks.instructions.md](../../instructions/static-blocks.instructions.md)
- [../../instructions/locales.instructions.md](../../instructions/locales.instructions.md)
- [./merchant-impact-checklist.md](./merchant-impact-checklist.md)

## Workflow

### 1. Map the Contract Surface

Identify which of these are actually changing:

- Section schema in `sections/*.liquid`
- Block schema in `blocks/*.liquid`
- Global settings in `config/settings_schema.json`
- Template wiring in `templates/**/*.json`
- Merchant-facing or storefront-facing locale keys

Prefer section or block schema over global settings unless the control is genuinely cross-theme.

### 2. Inventory Dependent Files Before Editing

Search for the exact section type, block type, static block ID, and locale keys already in use.

In this repo, treat shared static IDs such as `product-card`, `filters`, `media-gallery`, and `product-details` as contract values. Do not rename them casually.

If the change touches a static block, search both:

- The Liquid source that renders `content_for 'block'`
- Every template JSON tree that owns the matching section instance or nested parent block

### 3. Plan a Stable Migration

Before you edit anything, decide:

- Which IDs must stay stable
- Whether `block_order` needs to change
- Whether locale keys can be reused instead of renamed
- Whether the request truly requires a contract change or only a default/value change

Do not edit `config/settings_data.json` unless the request explicitly involves seeded store data.

### 4. Apply the Smallest Safe Shape Change

Update the affected schema, JSON, and locale files together.

Keep these rules intact:

- Merchant labels, help text, option labels, section names, and presets belong in `locales/en.default.schema.json`
- Storefront copy belongs in `locales/en.default.json`
- Static block IDs, types, nesting, and `block_order` must stay aligned with Liquid
- Editor-managed JSON should keep its existing ordering and structure unless the contract truly changes

### 5. Record Merchant Impact While the Change Is Fresh

Use [./merchant-impact-checklist.md](./merchant-impact-checklist.md) as a working checklist.

At minimum, capture:

- New, removed, or renamed controls
- Default behavior changes
- Any manual editor follow-up
- Any risk to existing section instances or block trees

### 6. Validate the Contract

Run the repo's standard validation flow for the files you changed:

- `shopify theme check`
- Shopify Dev MCP theme validation when available
- `shopify theme dev` verification in storefront and theme editor when store access is available
- `shopify theme profile` when the schema change affects repeated or nested Liquid output enough to change render cost

### 7. Finish With a Migration Summary

Call out:

- Files changed
- Merchant settings impact
- Locale impact
- Static block or template JSON impact
- Validation performed
- Residual risks or manual follow-up

## Repo-Specific Reminders

- Shared static block trees are intentional in Gamma. Keep Liquid and template JSON synchronized in the same change.
- Preserve stable IDs in editor-managed JSON unless the request explicitly requires a coordinated replacement.
- If the change introduces a new reusable contract or JSON pattern, update the relevant instruction or reference docs in the same change.

## Example Uses

- "Add a new layout setting to the shared product-card tree without breaking existing collection and campaign templates."
- "Move a promo heading control from theme settings into the owning section and update the schema locale labels."
- "Add a static child block to product information and wire the nested JSON tree safely across the affected templates."