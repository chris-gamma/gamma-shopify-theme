---
name: review
description: Review a completed theme change for merchant impact, accessibility, localization, and maintainability.
argument-hint: current diff or specific files to review
---

# Task

Review this completed theme change:

${input:task:Use the current diff unless you specify files, a branch, or a narrower scope}

Treat this as a review of a single-client Horizon fork, not a public theme product. Review the actual change, not a wishlist of unrelated improvements.

Read and follow:
- [../copilot-instructions.md](../copilot-instructions.md)
- [../instructions/theme-liquid.instructions.md](../instructions/theme-liquid.instructions.md)
- [../instructions/blocks-sections.instructions.md](../instructions/blocks-sections.instructions.md)
- [../instructions/snippets.instructions.md](../instructions/snippets.instructions.md)
- [../instructions/theme-json.instructions.md](../instructions/theme-json.instructions.md)
- [../instructions/locales.instructions.md](../instructions/locales.instructions.md)
- [../instructions/static-blocks.instructions.md](../instructions/static-blocks.instructions.md)

Review for:

1. Merchant impact: settings behavior, stable IDs, editor drag/drop, section/block contracts, and JSON wiring.
2. Accessibility: semantics, accessible names, keyboard behavior, toggles, dialogs, focus, and live regions.
3. Localization: no hardcoded shopper or editor copy, correct locale file split, and safe interpolation.
4. Maintainability: correct surface choice, reuse of existing component families, narrow diff, and no duplicated product-card or product-detail logic.
5. Validation gaps: Theme Check, storefront plus editor verification, and profiling when repeated heavy Liquid changed.

Return findings first, ordered by severity, with file references. If there are no findings, say so explicitly. Then briefly note merchant settings impact, locale impact, validation gaps, and residual risks.