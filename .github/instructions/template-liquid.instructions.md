---
applyTo: "templates/**/*.liquid"
---

# Template Liquid Files

Template Liquid files are specialized page contracts. This repo currently uses `templates/gift_card.liquid`, but the same rules apply to future standalone customer or utility templates.

## Responsibilities

- Preserve the page contract Shopify expects for the template's object model, forms, metadata, and assets.
- Keep the template thin. Shared rendering should still flow through snippets and assets where practical.
- Use template-local asset loading only when the page does not run through the standard layout shell.

## Current repo pattern

- `templates/gift_card.liquid` is standalone and uses `{% layout none %}`.
- It owns its own import map, template-specific stylesheet, metadata, and object-specific markup for the `gift_card` object.
- It still preserves core platform plumbing such as `{{ content_for_header }}`, canonical URL, theme color, favicon, locale-aware `<html>`, and translated shopper copy.

## Safe modification patterns

- Keep required Shopify objects and actions intact. For gift cards that includes values such as the balance, code, expiration state, QR identifier, and Apple Wallet link.
- Keep template-specific assets explicit. If a feature only exists on the standalone template, do not move it into the global layout.
- Prefer snippet reuse for repeated markup or formatting helpers.

## Future customer templates

- If customer templates are added under `templates/customers/**`, preserve Shopify form actions, error surfaces, and built-in object contracts.
- Do not swap platform forms or authentication flows for custom JavaScript-only flows.

## Anti-patterns

- Do not copy the full global layout shell into a standalone template just to reuse a small component.
- Do not remove `layout none` from a template that intentionally opts out of the shared layout.
- Do not inline shopper copy that should live in locales.

## Validation focus

- Test the real template object state after edits, not just visual structure.
- For standalone templates, verify asset loading and metadata because they do not inherit the standard layout shell.