---
name: locale
description: Add or fix theme translation keys and move UI copy into the right locale file.
argument-hint: copy change, UI location, storefront or editor, constraints
---

# Task

Add or fix localization for this theme change:

${input:task:Describe the copy change, where it appears, and whether it is shopper-facing or editor-facing}

Treat this as a single-client theme with production copy standards. Keep wording specific to Gamma's business needs, but still follow Shopify and Horizon conventions.

Read and follow:
- [../copilot-instructions.md](../copilot-instructions.md)
- [../instructions/locales.instructions.md](../instructions/locales.instructions.md)
- [../instructions/theme-liquid.instructions.md](../instructions/theme-liquid.instructions.md)
- [../instructions/theme-json.instructions.md](../instructions/theme-json.instructions.md)

If you use Shopify dev-mcp, call `mcp_shopify-dev-m_learn_shopify_api` with the `liquid` API first and reuse the returned `conversationId` for theme validation.

When you implement:

1. Decide whether the key belongs in `locales/en.default.json` or `locales/en.default.schema.json`.
2. Keep keys hierarchical, `snake_case`, and no deeper than three levels.
3. Use sentence case and locale interpolation instead of concatenated strings.
4. Do not add non-English locale entries.
5. Replace inline shopper or editor copy in the affected Liquid, JSON, or JavaScript only where needed for this change.
6. Keep key order and grouping close to related entries.
7. Keep the diff narrow.
8. Run Theme Check or equivalent diagnostics when available.

Finish with:

1. Files changed.
2. Locale impact.
3. Merchant settings impact if schema labels or help text changed.
4. Validation performed or still required.
5. Risks or follow-up work.