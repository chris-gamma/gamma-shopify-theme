---
name: validate-theme
description: "Run Gamma's standard post-change validation flow for internal theme work, including Theme Check, storefront plus theme-editor verification, and profiling guidance when repeated Liquid changed. Use when preparing a change for review, QA, or deployment."
argument-hint: "Describe the change scope, affected files or routes, and whether store access is available"
---

# Validate Theme

Use this skill to run or document the required validation flow after a theme change. In Gamma, validation is part of the deliverable, not an optional close-out step.

## When to Use

- Before handing a change to review or QA
- After schema, locale, layout, or static-block contract work
- After repeated Liquid, nested block tree, or route-heavy asset changes
- When you need one consistent validation summary across multiple touched surfaces

## Do Not Use

- Planning before any edits have happened
- Broad performance diagnosis as the first step; use `/performance-pass` for that
- Release note writing with no concrete validation work

## Read First

- [../../copilot-instructions.md](../../copilot-instructions.md)
- [../../instructions/theme-liquid.instructions.md](../../instructions/theme-liquid.instructions.md)
- [../../instructions/theme-json.instructions.md](../../instructions/theme-json.instructions.md)
- [../../instructions/locales.instructions.md](../../instructions/locales.instructions.md)
- [../../instructions/static-blocks.instructions.md](../../instructions/static-blocks.instructions.md)
- [../../reference/copilot-workflows.md](../../reference/copilot-workflows.md)
- [./checklist.md](./checklist.md)

## Workflow

### 1. Confirm the Scope

Start from the actual change set and capture:

- Changed files or diff scope
- Affected routes, templates, or section families
- Merchant settings impact
- Locale impact

Use [./checklist.md](./checklist.md) as the working structure for this pass.

### 2. Run Theme Check First

- Run `shopify theme check`
- Treat any new issues introduced by the change as blockers
- If a warning or error is outside the changed scope, call that out separately instead of mixing it into the change validation

### 3. Verify Storefront and Theme Editor Behavior

When store access is available:

- Run `shopify theme dev`
- Verify the affected storefront surface
- Verify the affected surface in the theme editor

When store access is not available, say so explicitly and record the gap in the final validation summary.

### 4. Profile Repeated or Liquid-Heavy Changes

When the change affects repeated sections, nested block trees, route-heavy snippets, or server-rendered hot paths:

- Run `shopify theme profile` for the affected route when possible
- Use Theme Inspector if a deeper Liquid trace is required

If profiling is not required, say why. If profiling is required but not possible, record that as a validation gap.

### 5. Check Contract-Sensitive Surfaces

Pay extra attention to:

- Template JSON and static block synchronization
- Locale key references after locale or schema changes
- Merchant editor integrity for stable IDs, block trees, and `block_order`
- Layout and global asset changes that affect multiple routes

### 6. Finish With a Validation Summary

Report:

- Validation performed
- Validation still required
- Merchant settings impact
- Locale impact
- Residual risks or follow-up work

## Repo-Specific Reminders

- `shopify theme check` is non-negotiable in this repo.
- `config/settings_data.json` remains merchant store data, not authored source.
- Static `content_for 'block'` changes are incomplete unless the matching template JSON trees stay aligned.
- Gamma is buildless and Horizon-compatible by design; validate the shipped Liquid, JSON, CSS, and JS directly.

## Example Uses

- "Validate the product page schema and locale changes before review."
- "Run the final validation pass for the updated sales campaign page."
- "Check whether the recent header and locale edits are ready for QA even though store access is not available."
