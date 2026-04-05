---
name: plan
description: Plan a narrow theme change before editing files.
argument-hint: change request, affected page or surface, business goal
---

# Task

Plan this Gamma Equipment Rental theme change before any edits:

${input:task:Describe the requested change, affected page or template, and the business goal}

Treat this repo as a single-client Horizon fork, not a reusable public theme. Prefer the narrowest change that fits the existing component families and theme contracts.

Read and follow:
- [../copilot-instructions.md](../copilot-instructions.md)
- [../instructions/theme-liquid.instructions.md](../instructions/theme-liquid.instructions.md)
- [../reference/surface-patterns.md](../reference/surface-patterns.md)
- [../reference/component-families.md](../reference/component-families.md)

Use the current repo structure and existing Horizon patterns to decide where the work belongs. Reuse existing families such as product cards, product information, collection discovery, campaign templates, and group/layout primitives before inventing new surfaces.

Do not edit files. Produce a concrete implementation plan with:

1. The correct surface or files to touch and why.
2. Existing repo patterns or files to extend.
3. The narrowest viable diff.
4. Merchant settings impact.
5. Locale impact.
6. Validation steps to run after implementation.
7. Risks, assumptions, and open questions.

If the request is under-specified, ask only the minimum questions needed to avoid choosing the wrong surface or breaking an existing contract.