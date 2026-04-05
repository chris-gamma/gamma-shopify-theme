---
name: locale-audit
description: "Detect and fix hardcoded shopper-facing or editor-facing strings in Gamma's Horizon-based theme, then align new copy with the repo's locale key conventions and JavaScript translation bridge. Use when a change spans Liquid, schema JSON, or assets."
argument-hint: "Describe the affected surface, any hardcoded strings to audit, and whether the copy is storefront or editor facing"
---

# Locale Audit

Use this skill when a theme change introduces copy, moves copy between surfaces, or needs a targeted sweep for hardcoded strings. In Gamma, the goal is not broad translation cleanup. It is a narrow audit that moves customer-facing and merchant-facing text into the right locale path without breaking existing conventions.

## When to Use

- Adding or changing shopper-facing copy in Liquid or JavaScript
- Adding or changing merchant-facing labels in schema or settings JSON
- Auditing a section, block, snippet, or asset for hardcoded UI strings
- Replacing inline English fallbacks with locale-backed values
- Renaming or removing locale keys touched by the current change

## Do Not Use

- Merchant-authored page content, RTE content, or seeded marketing copy that intentionally belongs in content settings
- Release note writing
- Large multi-language translation updates across non-English locale files

## Read First

- [../../copilot-instructions.md](../../copilot-instructions.md)
- [../../instructions/locales.instructions.md](../../instructions/locales.instructions.md)
- [../../instructions/theme-liquid.instructions.md](../../instructions/theme-liquid.instructions.md)
- [../../instructions/theme-json.instructions.md](../../instructions/theme-json.instructions.md)
- [../../instructions/assets.instructions.md](../../instructions/assets.instructions.md)
- [./audit-patterns.md](./audit-patterns.md)

## Workflow

### 1. Define the Audit Scope

Start with the specific files or feature area. A good locale audit is scoped, for example:

- One section and its child blocks
- One asset and the Liquid surface that feeds it
- One schema change plus the labels and help text it introduced

### 2. Find Candidate Hardcoded Strings

Check Liquid, JSON, and JavaScript for:

- Button labels
- Headings and helper text
- Empty states and error messages
- `aria-label`, live-region, and status strings
- JavaScript fallback messages

Ignore values that are not user-facing, plus merchant-authored content fields that intentionally hold editable text.

### 3. Classify Each String Correctly

For every real UI string, decide whether it belongs in:

- `locales/en.default.json` for storefront copy
- `locales/en.default.schema.json` for theme editor labels, help text, presets, names, and options
- The existing `Theme.translations` bridge when JavaScript needs locale-backed runtime copy

Reuse existing domains like `actions`, `content`, `accessibility`, `settings`, `options`, and `names` before inventing a new namespace.

### 4. Replace the Narrowest Possible Code Path

Use the appropriate mechanism for the surface:

- Liquid: `{{ 'key' | t }}`
- Schema JSON: locale references in labels, content, names, presets, and options
- JavaScript: existing `Theme.translations` values or locale-backed text already rendered into the DOM

Do not create a new translation bridge in JS if the repo already exposes the string through `Theme.translations` or nearby Liquid markup.

### 5. Normalize the Locale Keys

Keep keys:

- Hierarchical
- `snake_case`
- No deeper than three levels
- Named for location or purpose, not the English sentence itself

Use interpolation for dynamic values and avoid concatenating translated fragments.

### 6. Clean Up Touched References

If you rename or remove a key in this change:

- Update every touched Liquid, JSON, or JS reference in the same change
- Do not add non-English locale entries in code
- Keep key ordering close to related siblings instead of appending unrelated entries at the end

### 7. Validate the Audit

Run:

- `shopify theme check`
- Shopify Dev MCP theme validation when available

If JS uses locale-backed strings, confirm the final value still flows through the existing `Theme.translations` pattern or an equivalent server-rendered source.

## Repo-Specific Reminders

- Gamma already exposes several strings through `Theme.translations` in `snippets/scripts.liquid`. Reuse that path before inventing new inline fallbacks.
- Shopper-facing strings belong in `en.default.json`; schema strings belong in `en.default.schema.json`.
- Keep the diff narrow. A locale audit should not turn into a broad copy rewrite unless the user asked for that.

## Example Uses

- "Audit `sections/main-cart.liquid` and related assets for hardcoded cart status copy."
- "Move newly added schema labels into the correct locale file and clean up the references."
- "Replace hardcoded success and error strings in a JS component with the theme's existing translation bridge."