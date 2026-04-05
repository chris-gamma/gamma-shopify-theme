# Merge Hotspots

Use this as a compact review aid before resolving upstream Horizon conflicts. It points to the authoritative sources without duplicating the full business-change narrative in `CHANGES.md`.

## Primary references

- `CHANGES.md`: Gamma-specific behavior that must survive merges.
- `README.md`: repo operating model and upstream-sync entry points.
- `.github/reference/upstream-sync-playbook.md`: approved workflow and file-category policy.
- `.github/instructions/locales.instructions.md`: locale allowlist and key rules.
- `.github/instructions/theme-json.instructions.md`: merchant contract and template JSON rules.
- `.github/instructions/static-blocks.instructions.md`: static block wiring rules.

## Recurring manual-review hotspots

- Pricing and money-formatting surfaces across snippets, product blocks, cart snippets, and gift card output.
- Predictive search and legacy rental-search bridge assets and Liquid entry points.
- Shared product-card and product-detail trees, including static block wiring in `templates/product.json`, collection-style templates, and metaobject templates.
- Product availability, system badges, and Gamma-specific merchandising messaging.
- Header navigation behavior, especially locale-specific menu handling.
- Contact, footer, map, hours, and other metaobject-backed content modules.
- Sales campaign system sections, snippets, blocks, locales, and metaobject templates.

## Contract-sensitive file families

- `config/settings_schema.json`
- `config/settings_data.json`
- `templates/**/*.json`
- `locales/*.json`
- `sections/*.liquid`
- `blocks/_*.liquid`
- shared product, search, header, and cart surfaces

If a conflict touches one of these hotspots, expect manual re-integration and human review.
