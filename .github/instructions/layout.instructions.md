---
applyTo: "layout/*.liquid"
---

# Layout Files

Layout files own the global document shell. In this repo that mostly means `layout/theme.liquid`, plus any future standalone layout wrappers.

## Responsibilities

- Preserve platform scaffolding: `<!doctype html>`, `<html lang="{{ request.locale.iso_code }}">`, an accessible viewport meta tag that allows zoom, `{{ content_for_header }}`, canonical metadata, and the global body structure. Never introduce `maximum-scale=1.0` or `user-scalable=no`. Any iframe rendered from the layout must have a descriptive title.
- Preserve the accessibility shell: the skip link, the `#MainContent` target, and the global header and footer section-group renders. Keep the skip link as one of the first focusable elements, keep its target programmatically focusable with `tabindex="-1"`, and hide the link visually without removing it from assistive technology.
- Keep layout-owned containers global. Search modals, quick-add dialogs, theme-wide overlays, and body-level CSS variables belong here when they are consumed across multiple sections.
- Keep global asset and settings plumbing intact, including shared styles, theme variable renders, and body-level CSS custom properties used by JS and sections.

## Section groups

- Header and footer groups are rendered from the layout with `{% sections 'header-group' %}` and `{% sections 'footer-group' %}`. Do not replace these with hardcoded section markup.
- If a new section group is introduced, the layout must render it explicitly and the matching JSON group file must exist.
- Treat section groups as site-wide infrastructure. A change here affects every template.

## Safe modification patterns

- Add layout markup only when it is truly global. If it is page-specific, move it into a section or template.
- Keep inline scripts exceptional. The inline height and menu-style setup in `layout/theme.liquid` is acceptable because it primes layout-critical CSS variables before deferred modules run. Most other behavior belongs in `assets/*.js` or a surface-local `{% javascript %}` block.
- Prefer body or root-level CSS variables for values that multiple sections consume. Keep names stable when other assets already depend on them.

## Anti-patterns

- Do not move section-specific commerce logic into the layout.
- Do not duplicate modal containers or global wrappers inside individual sections.
- Do not remove or rename global IDs, data attributes, or CSS custom properties without checking the assets that consume them.
- Do not hardcode shopper copy in the layout.

## Validation focus

- Verify at least the home page, a collection page, and a product page after layout changes.
- Check both storefront rendering and theme editor rendering because section-group and modal issues often only show up in one of those contexts.

## Supporting references

- Layout and shell examples live in [surface-patterns](../reference/surface-patterns.md).
- Global navigation and shell family guidance lives in [component-families](../reference/component-families.md).