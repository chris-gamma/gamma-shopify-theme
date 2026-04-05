---
name: schema
description: Update schema or editor-managed theme JSON without breaking stable IDs or locale contracts.
argument-hint: target schema or JSON file, merchant control, constraints
---

# Task

Implement this schema or theme JSON change:

${input:task:Describe the section schema, template JSON, or theme setting change}

Treat this as a single-client Horizon fork. Favor a minimal data-shape change over broad JSON churn.

Read and follow:
- [../copilot-instructions.md](../copilot-instructions.md)
- [../instructions/theme-json.instructions.md](../instructions/theme-json.instructions.md)
- [../instructions/static-blocks.instructions.md](../instructions/static-blocks.instructions.md)
- [../instructions/locales.instructions.md](../instructions/locales.instructions.md)
- [../instructions/blocks-sections.instructions.md](../instructions/blocks-sections.instructions.md)

If you use Shopify dev-mcp, call `mcp_shopify-dev-m_learn_shopify_api` with the `liquid` API first and reuse the returned `conversationId` for docs search and theme validation.

Focus this prompt on:

1. Section or block schema.
2. `templates/**/*.json` wiring.
3. `config/settings_schema.json`.
4. Related locale keys in `locales/en.default.schema.json` or `locales/en.default.json`.

When you implement:

1. Preserve stable section IDs, block IDs, ordering, and editor-managed structure unless the request explicitly requires a contract change.
2. Keep static block IDs, types, and nesting synchronized with the Liquid source.
3. Add or update locale keys for labels, help text, presets, options, and storefront strings in the correct locale file.
4. Do not edit `config/settings_data.json` unless the request explicitly needs seeded data.
5. If the request is mostly markup or behavior rather than schema or JSON, keep schema edits minimal and say which prompt or surface should own the larger change.
6. Keep the diff narrow.
7. Validate theme changes when the tooling is available.

Finish with:

1. Files changed.
2. Merchant settings impact.
3. Locale impact.
4. Validation performed or still required.
5. Risks or follow-up work.