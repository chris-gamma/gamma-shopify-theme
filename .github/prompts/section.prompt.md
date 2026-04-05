---
name: section
description: Scaffold or modify a section with the repo's existing theme patterns.
argument-hint: section change, page/template, data source, constraints
---

# Task

Implement this section-level theme change:

${input:task:Describe the section change, where it appears, and any business rules}

Treat this as a single-client Horizon-based customization. Extend existing repo patterns before creating a brand-new section or a generic abstraction.

Read and follow:
- [../copilot-instructions.md](../copilot-instructions.md)
- [../instructions/blocks-sections.instructions.md](../instructions/blocks-sections.instructions.md)
- [../instructions/static-blocks.instructions.md](../instructions/static-blocks.instructions.md)
- [../instructions/theme-liquid.instructions.md](../instructions/theme-liquid.instructions.md)
- [../instructions/theme-json.instructions.md](../instructions/theme-json.instructions.md)
- [../reference/surface-patterns.md](../reference/surface-patterns.md)
- [../reference/component-families.md](../reference/component-families.md)

Before editing, confirm that the request belongs in a section rather than a block, snippet, layout, or asset. If it does not, say so and switch to the correct surface with the smallest justified change.

If you use Shopify dev-mcp, call `mcp_shopify-dev-m_learn_shopify_api` with the `liquid` API first and reuse the returned `conversationId` for docs search and theme validation.

When you implement:

1. Reuse the closest existing section family or wrapper snippet instead of duplicating structure.
2. Keep the section responsible for page-level composition, iteration, pagination, or major layout only.
3. Keep exactly one `{% schema %}` block and keep merchant-facing controls in schema.
4. Put shopper-facing copy in locale files, not inline Liquid.
5. Preserve static block IDs, nested block contracts, and template JSON wiring unless the change explicitly requires coordinated updates.
6. Keep the diff narrow and avoid unrelated refactors.
7. Use official Shopify docs and dev-mcp when you need filter, object, or schema specifics.
8. Validate theme changes when the tooling is available.

Finish with:

1. Files changed.
2. Merchant settings impact.
3. Locale impact.
4. Validation performed or still required.
5. Risks or follow-up work.