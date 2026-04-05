---
name: snippet
description: Create or refactor a reusable snippet with an explicit LiquidDoc contract.
argument-hint: snippet purpose, callers, refactor goal, constraints
---

# Task

Create or refactor a snippet for this theme change:

${input:task:Describe the reusable markup or refactor goal and the expected callers}

Treat this as a single-client theme. Only introduce a new snippet when it meaningfully reduces duplication or clarifies a stable render contract.

Read and follow:
- [../copilot-instructions.md](../copilot-instructions.md)
- [../instructions/snippets.instructions.md](../instructions/snippets.instructions.md)
- [../instructions/theme-liquid.instructions.md](../instructions/theme-liquid.instructions.md)
- [../reference/surface-patterns.md](../reference/surface-patterns.md)
- [../reference/component-families.md](../reference/component-families.md)

If you use Shopify dev-mcp, call `mcp_shopify-dev-m_learn_shopify_api` with the `liquid` API first and reuse the returned `conversationId` for docs search and theme validation.

Before editing, confirm that a snippet is the right surface. If the logic should stay inside a single section or block, say so and keep the change local.

When you implement:

1. Start every snippet with an accurate `{% doc %}` block.
2. Treat the snippet as render-only. Do not add schema or `content_for 'blocks'`.
3. Pass every required non-global input explicitly.
4. Keep caller and callee contracts aligned in the same diff.
5. Move only the reusable wrapper or helper logic into the snippet. Keep page- or block-owned decisions in their original surface.
6. Keep shopper-facing copy in locales and merchant-facing controls in section or block schema.
7. Keep the diff narrow.
8. Validate theme changes when the tooling is available.

Finish with:

1. Files changed.
2. Merchant settings impact.
3. Locale impact.
4. Validation performed or still required.
5. Risks or follow-up work.