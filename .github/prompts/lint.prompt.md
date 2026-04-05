---
name: lint
description: Review and fix current Theme Check issues only.
argument-hint: optional file, rule, or scope; defaults to the current theme
---

# Task

Review and fix current Theme Check issues only for this scope:

${input:task:Optional file path, rule, or scope. Leave broad to lint the current theme.}

Treat `shopify theme check` as the source of truth. Do not expand this into a general cleanup pass.

Read and follow:
- [../copilot-instructions.md](../copilot-instructions.md)
- [../instructions/theme-liquid.instructions.md](../instructions/theme-liquid.instructions.md)
- [../instructions/theme-json.instructions.md](../instructions/theme-json.instructions.md)
- [../instructions/locales.instructions.md](../instructions/locales.instructions.md)

When you implement:

1. Run Theme Check first and fix the currently reported issues with the smallest safe diff.
2. Do not refactor unrelated code or redesign markup just because you are in the file already.
3. If a false positive appears around an established static block pattern, use the narrowest documented suppression possible and explain why.
4. Re-run Theme Check after each fix batch until the scoped issues are resolved or you are blocked.
5. Keep merchant settings, locale keys, and static block contracts intact unless a fix truly requires a coordinated update.

Finish with:

1. Files changed.
2. Fixed issues.
3. Remaining issues or blockers.
4. Merchant settings impact.
5. Locale impact.
6. Validation performed.
7. Risks or follow-up work.