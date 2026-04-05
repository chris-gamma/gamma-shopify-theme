---
applyTo: "sections/*.liquid,blocks/_*.liquid,templates/**/*.json"
---

# Static blocks and template JSON sync

## What is a static block

A static block is a block that a section's Liquid file renders directly, rather than one a merchant adds through the theme editor. It is invoked with:

```liquid
{% content_for 'block', type: '_blockname', id: 'unique-id' %}
```

The underscore prefix on `type` indicates that the block file is `blocks/_blockname.liquid`. Parameters can be passed to the block via additional keyword arguments (e.g., `closest.product: section.settings.product`).

## Template JSON requirement

**Every static `content_for` call in a section or static block must have a matching JSON entry in the template tree that renders it.**

At the section level, the entry lives under the section instance's `"blocks"` object:

```json
"blocks": {
  "unique-id": {
    "type": "_blockname",
    "static": true,
    "settings": {},
    "blocks": {}
  }
},
"block_order": ["unique-id"]
```

Key rules:
- The JSON key must match the `id` passed to `content_for`.
- The `"type"` value must match the `type` passed to `content_for`.
- The entry must include `"static": true`.
- The key must also appear in `"block_order"`.
- If the static block itself owns nested static or dynamic children, those child entries belong under that block's own `"blocks"` object.

Canonical references in this repo:

- `templates/collection.json` for a collection section with a shared `_product-card` block tree
- `templates/product.json` for deep product detail composition with nested static children
- `templates/metaobject/sales_campaigns.json` for a metaobject template mirroring collection-style shared card wiring

## Sync checklist

When you add, remove, or rename a static `content_for` call in a section or underscore block:

1. Update the `content_for` call in `sections/<section-name>.liquid`.
2. If the call lives inside a static block, find the parent JSON node that represents that block.
3. Search for every template JSON file that includes the parent section instance.
4. Add, remove, or rename the matching block entry and update `"block_order"` at the correct nesting level in each template file.
5. Confirm rendering in `shopify theme dev`.

Missing template entries cause blocks to render empty or not at all — the Liquid section code can be correct while the page still shows no content.

## Upstream sync safeguards

- Static block Liquid and template JSON must stay aligned during merge resolution.
- If upstream and Gamma both changed a static block path or its owning template tree, treat the file set as manual-review territory.
- Do not accept changes to `content_for 'block'` calls without reviewing the matching JSON node, nesting level, and `block_order` entry.
- Nested block tree mismatches are breakage risks, not cosmetic drift.
- If a static block file changed without corresponding template wiring review, stop and verify the affected template JSON trees before approval.

## Shared IDs and resource context

- Shared block IDs are intentional. The repeated use of IDs like `product-card` and `filters` lets merchants configure one shared static tree per section instance.
- Parameters such as `closest.product` are part of the runtime contract. If a static block expects resource context, pass it explicitly and keep the JSON tree aligned with that usage.

## Theme Check notes

- Some valid static block patterns in loops may require a tightly scoped `theme-check-disable` and re-enable pair.
- A Theme Check suppression is not a substitute for fixing missing JSON wiring.

## LiquidDoc requirement

All `blocks/_*.liquid` files must include a `{% doc %}` header documenting the block's purpose and any parameters it receives through `content_for` keyword arguments (e.g., `closest.product`).
