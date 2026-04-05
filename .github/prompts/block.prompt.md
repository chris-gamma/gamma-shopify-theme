---
name: block
description: Scaffold or modify a block without breaking editor or JSON contracts.
argument-hint: block change, parent section/block, static or dynamic, constraints
---

# Task

Implement this block-level theme change:

${input:task:Describe the block change, where it is used, and any business rules}

This repo is a single-client Horizon fork. Prefer extending an existing block family or static block tree over creating a new generic block.

Read and follow:
- [../copilot-instructions.md](../copilot-instructions.md)
- [../instructions/blocks-sections.instructions.md](../instructions/blocks-sections.instructions.md)
- [../instructions/theme-liquid.instructions.md](../instructions/theme-liquid.instructions.md)
- [../instructions/static-blocks.instructions.md](../instructions/static-blocks.instructions.md)
- [../instructions/theme-json.instructions.md](../instructions/theme-json.instructions.md)
- [../reference/component-families.md](../reference/component-families.md)

If you use Shopify dev-mcp, call `mcp_shopify-dev-m_learn_shopify_api` with the `liquid` API first and reuse the returned `conversationId` for docs search and theme validation.

Before editing, determine whether the request belongs in:

1. A dynamic merchant-addable block.
2. An underscore-prefixed static infrastructure block.
3. An existing snippet or section instead of a block.

When you implement:

1. Preserve `block.shopify_attributes` on the outer rendered element.
2. Keep page-level loops, pagination, and layout ownership out of blocks.
3. Preserve `closest.*` contracts for static blocks instead of adding redundant settings.
4. If you change static block IDs, types, or nesting, update matching template JSON in the same change.
5. Keep schema focused on merchant-editable controls only.
6. Put shopper-facing copy in locales.
7. Keep the diff narrow and avoid opportunistic refactors.
8. Validate theme changes when the tooling is available.

Finish with:

1. Files changed.
2. Merchant settings impact.
3. Locale impact.
4. Validation performed or still required.
5. Risks or follow-up work.