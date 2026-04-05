---
name: performance-pass
description: "Run Gamma's documented theme performance review flow for a slow route or component family, using Shopify profiling tools and repo-specific hot-path checks to produce actionable recommendations. Use when a change affects repeated Liquid, nested block trees, or route-level interaction cost."
argument-hint: "Describe the route, template, symptom, and any suspected section, block, snippet, or asset"
---

# Performance Pass

Use this skill for a real performance investigation, not generic optimization advice. In Gamma, the most expensive problems usually come from repeated Liquid paths, nested static block trees, or route-specific JS work layered onto already heavy markup.

This skill is intentionally focused on profiling and actionable recommendations. It is not a browser testing workflow.

## When to Use

- A route feels slow to render or update
- A repeated section or nested block tree has grown materially more expensive
- A collection, campaign, product, header, or cart surface needs a focused performance review
- You need evidence-backed recommendations before making a fix

## Do Not Use

- Visual QA or cross-browser compatibility checks
- Broad cleanup passes with no concrete symptom
- Tiny asset refactors that do not affect a meaningful route or interaction

## Read First

- [../../copilot-instructions.md](../../copilot-instructions.md)
- [../../instructions/theme-liquid.instructions.md](../../instructions/theme-liquid.instructions.md)
- [../../instructions/assets.instructions.md](../../instructions/assets.instructions.md)
- [../../reference/surface-patterns.md](../../reference/surface-patterns.md)
- [../../reference/component-families.md](../../reference/component-families.md)
- [./report-template.md](./report-template.md)

## Workflow

### 1. Define the Performance Question

Start with one concrete symptom:

- Slow initial render on a route
- Slow section re-render after filtering or pagination
- Slow product or cart interaction after a user action
- Suspicious growth in Liquid work after a theme change

Record the route, template, section family, and whether the cost looks server-side, client-side, or mixed.

### 2. Collect Evidence With Shopify's Tooling First

When store context is available:

- Run `shopify theme profile` for the affected route
- Use Theme Inspector when you need deeper Liquid flame-graph or call-tree evidence

When store context is not available, fall back to static analysis, but say so explicitly.

### 3. Trace the Hot Path Back to the Owning Surface

Map expensive work to the correct repo family:

- Section-level loops and pagination
- Static block trees and nested block composition
- Shared snippets rendered inside repeated loops
- Route-level assets and custom elements

Use the repo's component families and surface patterns before suggesting a change.

### 4. Check Gamma's Common Cost Centers

Look specifically for:

- Repeated product-card or card-like rendering paths
- Duplicate snippet work inside collection-like loops
- Nested static block trees that render more than needed
- Expensive capture or render branches repeated per item
- Global CSS or JS that should stay surface-local
- Unthrottled or duplicated client listeners on route-heavy assets

For cart interactions, check whether the existing instrumentation in `assets/performance.js` and the `cartPerformance` markers already cover the path before inventing new diagnostics.

### 5. Separate Findings by Evidence Type

Be explicit about what each finding is based on:

- Profiling evidence from `shopify theme profile`
- Theme Inspector traces
- Static code inspection
- Existing performance markers in assets

If a suspected bottleneck is still an inference, label it as an inference.

### 6. Recommend the Smallest Credible Fix

Prefer changes that:

- Remove duplicated work
- Reuse an existing snippet or family pattern
- Reduce repeated rendering inside loops
- Tighten route-specific asset behavior

Do not jump to broad rewrites unless the evidence clearly points there.

### 7. Re-Validate After Any Change

If you make code changes:

- Re-run `shopify theme check`
- Re-profile the same route when possible
- Note whether merchant settings or locale behavior changed as a side effect

If you only diagnose, finish with a clear next step and validation gap.

## Repo-Specific Reminders

- Gamma is buildless and server-render-first. Start with Liquid and surface ownership before blaming front-end micro-optimizations.
- Repeated collection-like grids, product-detail composition, header navigation, and cart flows are the most likely places to find meaningful cost.
- Use existing instrumentation and family patterns before inventing a parallel performance path.

## Example Uses

- "Profile the promotions campaign page after reusing the shared product-card tree."
- "Investigate slow collection filtering and determine whether the cost is in Liquid, result replacement, or route-specific assets."
- "Run a performance pass on product information after adding a new nested static block subtree."