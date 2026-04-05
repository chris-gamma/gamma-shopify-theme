---
applyTo: "sections/*-group.json"
---

# Section Group JSON

Section-group JSON files are global containers rendered from the layout with the `sections` tag. In this repo the primary examples are `sections/header-group.json` and `sections/footer-group.json`.

## Responsibilities

- Define the globally rendered section instances that belong to a named group such as `header-group` or `footer-group`.
- Preserve the `type`, `sections`, and `order` structure the layout expects.
- Keep IDs stable because the layout, editor state, and group-specific sections all depend on them.

## Safe modification patterns

- Add or remove section instances only when the group's global structure truly changes.
- Keep section instance `type` values aligned with real section filenames.
- Preserve nested block maps and `block_order` arrays for sections inside the group.
- If a group contains static blocks such as `_header-logo` or `_header-menu`, keep those IDs and types synchronized with the rendered section markup.

## Relationship to layout

- The layout must render the group with `{% sections 'group-name' %}`. Group JSON and layout usage are a pair.
- Do not create a new group JSON file without also adding or updating the layout render path.
- Do not move page-specific sections into a global group just to reuse them everywhere.

## Anti-patterns

- Do not treat section-group JSON like a general template file. It affects the shell of the whole storefront.
- Do not rename group-owned section IDs casually.
- Do not store presentation logic in JSON that belongs in the rendered section Liquid.

## Validation focus

- Verify the storefront shell after edits, especially navigation, announcements, and footer behavior.
- Recheck the theme editor in group-editing context because group JSON issues often surface there first.