# Gamma Shopify Theme

Gamma Equipment Rental's theme is a Shopify Horizon fork. It is buildless by design: Liquid, JSON, CSS, and JavaScript ship directly through Shopify CLI with no package manager, bundler, or schema generation step. This root file stays short on purpose. Use it for the non-negotiable operating model, then move to the matching scoped files and reference docs.

## Always-on rules

- Keep Horizon's server-rendered model intact. Liquid owns structure and commerce state; JavaScript only enhances what already works.
- This repo is downstream of `Shopify/horizon`. During upstream sync work, Gamma behavior is the primary contract and must survive merges.
- Put work in the correct surface: `layout/` for the global shell, `sections/` for page modules, `blocks/` for merchant-configurable nested pieces, `snippets/` for render helpers, `assets/` for flat JS/CSS/SVG files, `config/` for global settings, `templates/` for page wiring, and `locales/` for copy.
- Merchant-facing controls belong in schema or settings JSON. Shopper-facing copy belongs in locale files, not inline Liquid.
- Keep diffs focused. Do not refactor unrelated Horizon code during a targeted change.
- Preserve editor-managed JSON, stable IDs, and existing static block contracts unless the task explicitly requires changing them.
- If a task reveals a new reusable pattern, edge case, pitfall, workflow correction, or guidance gap, update the nearest relevant instruction, prompt, or reference file in the same change instead of leaving the documentation stale.

## Upstream sync rules

- Use branch roles, not fixed branch names. The correct abstraction is the current receiving branch, not `main`, `dev`, or any permanent integration branch name.
- Use a specific clean upstream version branch such as `horizon/v3.4.0` as the vendor source for sync work. Each `horizon/vX.Y.Z` branch must remain a clean Horizon snapshot with no Gamma commits.
- Start sync work from the current receiving branch, create a temporary `upstream-sync/*` branch, merge the selected `horizon/vX.Y.Z` branch into it, and land the result by pull request into the receiving branch.
- Treat [CHANGES.md](../CHANGES.md) as a primary source of Gamma-specific behavior that must survive merges.
- Before resolving merge conflicts in contract-sensitive surfaces, consult [README.md](../README.md), [locales.instructions.md](./instructions/locales.instructions.md), [theme-json.instructions.md](./instructions/theme-json.instructions.md), and [static-blocks.instructions.md](./instructions/static-blocks.instructions.md).
- Classify upstream-sync changes into five buckets before editing: `safe upstream`, `safe Gamma`, `manual re-integration`, `delete-after-merge locale files`, and `contract-risk files requiring human review`.
- If upstream and Gamma both changed a file, do not overwrite Gamma with upstream. Start from upstream's newer structure and re-integrate Gamma behavior into it.
- Never use blanket `theirs`, blanket `ours`, or `git merge -X theirs` on customized theme code.
- Never reintroduce non-allowlisted locale files, rewrite large template JSON files wholesale, or drop Gamma-only behavior just because upstream looks newer.
- Require human review for `config/settings_schema.json`, `config/settings_data.json`, `templates/**/*.json`, `locales/*.json`, `sections/*.liquid`, `blocks/_*.liquid`, shared product/search/header/cart surfaces, and anything called out in [CHANGES.md](../CHANGES.md).
- Produce merge summaries that explain what came from upstream, what Gamma behavior was preserved, what was manually re-integrated, and what still requires review or testing.

## Source priority

1. Official Shopify, Horizon, Shopify tooling, VS Code, and GitHub Copilot documentation
2. Shopify Dev MCP docs and validation tools
3. Current workspace code and configuration
4. Residual local guidance only when it still exists and does not conflict with the sources above

## Required validation

1. Run `shopify theme dev` and verify the affected surface in both the storefront and the theme editor.
2. Run `shopify theme check` and fix any new issues introduced by the change.
3. For repeated sections, blocks, or heavy Liquid paths, run `shopify theme profile` or inspect with Theme Inspector.
4. Run `python3 .github/scripts/validate_locale_allowlist.py` for upstream-sync work and after locale file changes.
5. Treat Lighthouse regressions as blockers if a Lighthouse workflow exists for the touched area. This repo does not currently ship one.

## Instruction map

- `.github/instructions/theme-liquid.instructions.md`: shared Liquid conventions for all Liquid files
- `.github/instructions/layout.instructions.md`: global document shell and section-group rendering in `layout/*.liquid`
- `.github/instructions/blocks-sections.instructions.md`: section and block responsibilities, schema design, and extension boundaries
- `.github/instructions/snippets.instructions.md`: snippet contracts, LiquidDoc, and render-only composition
- `.github/instructions/template-liquid.instructions.md`: specialized standalone Liquid templates such as `templates/gift_card.liquid`
- `.github/instructions/assets.instructions.md`: JavaScript and CSS rules for `assets/*`
- `.github/instructions/theme-json.instructions.md`: `config/*.json` and `templates/**/*.json`
- `.github/instructions/section-groups.instructions.md`: section-group JSON files such as `sections/header-group.json`
- `.github/instructions/locales.instructions.md`: locale structure, copy style, and interpolation
- `.github/instructions/static-blocks.instructions.md`: static `content_for 'block'` contracts and JSON synchronization

## Reference map

- `.github/reference/surface-patterns.md`: repo-backed examples that show where changes belong
- `.github/reference/component-families.md`: Horizon family responsibilities, safe extension paths, and anti-patterns
- `.github/reference/copilot-workflows.md`: how prompts, skills, and hooks fit together for internal theme work
- `.github/reference/upstream-sync-playbook.md`: the required branch-role workflow for upstream Horizon syncs
- `.github/reference/merge-hotspots.md`: a compact map of recurring merge-sensitive Gamma hotspots
- `.github/reference/maintenance.md`: how to keep this instruction system current after theme changes

## Working method

- Read every scoped file that matches the paths you touch.
- If work spans multiple surfaces, apply all matching scoped files together.
- Use the reference docs when deciding where a new variation should live or how an existing family is expected to extend.
- Use `.github/reference/copilot-workflows.md` when you need to choose the right prompt or skill for a task.
- After finishing, report assumptions, files changed, merchant-setting impact, validation performed, and remaining risks.
