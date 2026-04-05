---
applyTo: "locales/*.json"
---

# Locales

## File responsibilities

- `en.default.json` is the English source of truth for storefront strings. Add all new translation keys here first.
- `en.default.schema.json` holds strings used in the theme editor (setting labels, option names, preset names, section/block names). These live in a separate file but follow the same key-structure conventions.
- Do not add translated copy to any non-English locale file. Translations for other languages are managed by translators or the Shopify admin language editor and may be overwritten.
- Tracked locale files must match `.github/locale-allowlist.txt`. Non-allowlisted locale files from upstream must be removed from the sync branch before approval.
- Preserve the generated banner comments, existing grouping, and stable key order as much as possible.

## Key structure

- Use hierarchical, `snake_case` keys with a maximum depth of three levels: `category.group.key`.
- Name keys by their UI location or semantic purpose, not by the copy they contain (e.g., `products.card.add_to_cart`, not `buttons.add_to_cart_text`).
- Group related strings under a shared parent key to make the file easier to scan and extend.
- Follow the repo's existing domains such as `actions`, `content`, `accessibility`, `names`, `settings`, `options`, and feature-specific groups before inventing a new top-level namespace.

## Copy standards

- Write in **sentence case**: capitalize only the first word and proper nouns. Use title case for schema labels.
- For strings that include dynamic values, use locale interpolation variables rather than splitting the string across multiple keys:
  ```json
  "cart": {
    "item_added": "{{ product_title }} added to cart"
  }
  ```
  ```liquid
  {{ 'cart.item_added' | t: product_title: product.title }}
  ```
- Never concatenate a translated segment with Liquid string operators; dynamic portions belong inside the locale value as `{{ variable }}` placeholders.

## Schema and storefront split

- Storefront behavior, status text, empty states, accessibility labels, and shopper messaging belong in `en.default.json`.
- Theme editor labels, help text, categories, section names, block names, option labels, and presets belong in `en.default.schema.json`.
- If a setting references `t:content.*`, `t:settings.*`, `t:names.*`, or `t:options.*`, the key should exist in the schema locale file.

## Editing rules

- Add new keys near related siblings instead of appending unrelated entries at random.
- Keep existing comments that explain usage or nuance.
- When renaming or removing a key, update every Liquid or JSON reference in the same change.
- Partial locale key renames are forbidden. If a key changes, update every reference and every required sibling key in one deliberate migration.
- Avoid gratuitous rewrites of generated locale files. Small targeted changes are easier to review and safer against admin-managed updates.

## Upstream sync safeguards

- Locale conflicts are always manual-review territory.
- For allowlisted locale files, preserve Gamma-required locale keys and merge useful upstream additions selectively.
- Do not accept one side wholesale when both Gamma and upstream changed an allowlisted locale file.
- Remove non-allowlisted locale files after merge resolution, even if upstream added them intentionally.
- Validate the tracked locale set with `python3 .github/scripts/validate_locale_allowlist.py` before approval.

## Anti-patterns

- Do not put English copy directly into schema JSON, Liquid, or JavaScript when a locale key should exist.
- Do not create duplicate keys with slightly different phrasing for the same UI concept.
- Do not add non-English keys in code.
- Do not keep newly reintroduced locale files just because `.gitignore` did not block them.

## Validation

- Run `shopify theme check` after adding, renaming, or removing locale keys. Theme Check reports both missing translation references and keys declared in locale files but never used in Liquid.
- Run `python3 .github/scripts/validate_locale_allowlist.py` after locale file changes and for upstream-sync pull requests.
