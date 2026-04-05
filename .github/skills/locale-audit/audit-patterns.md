# Locale Audit Patterns

Use these prompts and checks when you need a narrow copy audit.

## Good Search Targets

- Liquid text nodes and attributes with quoted English strings
- Schema JSON fields like `label`, `content`, `name`, `info`, `placeholder`, and option labels
- JavaScript assignments to `textContent`, `innerHTML`, `ariaLabel`, `title`, or live-region helpers
- Inline fallbacks such as `|| 'Some message'`

## Common False Positives

- Merchant-authored rich text defaults that are intentionally content, not UI chrome
- Resource data such as `product.title`, `collection.title`, or page content
- Non-user-facing values like class names, handles, IDs, and route fragments

## Gamma-Specific JS Bridge

Gamma already exposes runtime strings through `Theme.translations` in `snippets/scripts.liquid`.

Use that pattern for shared JS copy such as:

- Added-to-cart messaging
- Gift card recipient form status text
- Other global runtime messages needed by assets

If a new asset string is broadly reusable, add it to `Theme.translations` instead of hardcoding English in the asset.

## Key Naming Shortlist

- `actions.*` for buttons and primary UI actions
- `content.*` for shopper-facing messages and helper text
- `accessibility.*` for aria and assistive labels
- `settings.*`, `options.*`, and `names.*` for editor-facing schema strings