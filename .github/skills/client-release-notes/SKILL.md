---
name: client-release-notes
description: "Turn Gamma theme changes into internal developer-facing and merchant-facing release notes, using the actual diff, affected component families, and validation status instead of a public-theme marketing changelog. Use when internal teams need a clear summary of what changed and who is affected."
argument-hint: "Describe the release scope, comparison point, and whether to summarize the current diff, a branch, or a specific set of files"
---

# Client Release Notes

Use this skill to summarize actual theme work for internal development and client communication. The output should reflect Gamma's single-client workflow, not a public theme launch or a Theme Store style changelog.

The skill should produce two views from the same source change:

- A developer-facing summary of surfaces, contracts, and validation
- A merchant-facing summary of behavior, settings, and operational impact

## When to Use

- Preparing release notes for a completed batch of theme work
- Summarizing the current diff or a branch against `main`
- Converting implementation details into concise merchant-impact language
- Building a handoff note for internal deploy or QA review

## Do Not Use

- Public marketing copy
- One-file code explanations
- Issue triage with no concrete change set

## Read First

- [../../copilot-instructions.md](../../copilot-instructions.md)
- [../../reference/component-families.md](../../reference/component-families.md)
- [../../reference/surface-patterns.md](../../reference/surface-patterns.md)
- [../../../release-notes-horizon.md](../../../release-notes-horizon.md)
- [./templates.md](./templates.md)

## Workflow

### 1. Gather the Real Change Scope

Start from an actual source of truth:

- Current git diff
- A branch compared with `main`
- A named set of files
- A completed task description backed by code changes

Do not write release notes from intent alone if the actual change set is available.

### 2. Group Changes by Theme Surface or Family

Organize the summary around the repo's real owning concepts, such as:

- Header and global shell
- Collection discovery and filters
- Product-card system
- Product detail and variants
- Cart flows
- Metaobject or campaign pages

This keeps the notes grounded in how Gamma is maintained.

### 3. Split Developer and Merchant Impact Early

For each change, decide whether it belongs in:

- Developer-facing notes: files, surfaces, contracts, validation, migration details, technical risks
- Merchant-facing notes: visible behavior, new controls, removed controls, QA expectations, action required

Internal refactors with no merchant effect should stay out of merchant-facing notes.

### 4. Use a Tight Changelog Shape

Follow the concise style already present in `release-notes-horizon.md`:

- `Added`
- `Changed`
- `Fixes and improvements`

Use those headings when they fit. Do not stretch every release to fill each section.

### 5. Call Out Settings and Validation Explicitly

Always note:

- New or changed merchant settings
- Locale or content migration impact when relevant
- Validation completed, such as `shopify theme check`, `shopify theme dev`, or profiling for heavy Liquid changes

If validation was not performed, say so plainly.

### 6. Trim Low-Signal Technical Noise

Remove details that do not help the intended reader, such as:

- File-by-file churn with no behavioral outcome
- Renames that do not affect maintenance or deployment
- Small implementation details that matter only inside a code review

Keep developer notes technical, but still summary-level.

### 7. Finish With Clear Release Artifacts

Produce:

- Developer-facing notes
- Merchant-facing notes
- Open risks, follow-up QA, or deployment notes if any

Use [./templates.md](./templates.md) as a starting structure when helpful.

## Repo-Specific Reminders

- Gamma release notes are for an internal team and a single client, not for public theme distribution.
- Tie notes back to actual component families and merchant impact instead of generic theme language.
- If a change affects static block wiring, schema contracts, or locale behavior, make that explicit in the developer-facing notes even if the merchant summary stays short.

## Example Uses

- "Summarize the current branch against `main` into developer and merchant release notes for the next client deploy."
- "Turn this completed promotions-page refactor into an internal handoff note plus a short merchant-facing summary."
- "Write release notes for the current diff, separating settings impact from implementation detail."