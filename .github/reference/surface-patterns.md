# Theme Surface Patterns

Use this file when the main question is "where should this change live?" Every example below comes from a real pattern already present in the repo.

## Surface map

| Surface | Owns | Do not put here | Repo examples |
| --- | --- | --- | --- |
| `layout/*.liquid` | Global document shell, section-group renders, global modals, body-level variables | Page-specific product or collection logic | `layout/theme.liquid` |
| `sections/*-group.json` | Site-wide header/footer section instances | Section presentation logic or page content | `sections/header-group.json` |
| `sections/*.liquid` | Page modules, result loops, major composition, section schema | Reusable tiny wrappers or shared card shells | `sections/main-collection.liquid`, `sections/product-information.liquid`, `sections/scs-sales-campaign.liquid` |
| `blocks/*.liquid` | Merchant-configurable nested units, shared static infrastructure blocks | Global page shell, top-level pagination | `blocks/group.liquid`, `blocks/filters.liquid`, `blocks/_product-card.liquid`, `blocks/variant-picker.liquid` |
| `snippets/*.liquid` | Render helpers, shared wrappers, small style bundles | Schema, editor-owned block trees | `snippets/group.liquid`, `snippets/product-card.liquid`, `snippets/button.liquid`, `snippets/sorting.liquid` |
| `assets/*.js` | Progressive enhancement, events, custom elements | Server-rendered content ownership, hardcoded shopper copy | `assets/component.js`, `assets/events.js`, `assets/header.js`, `assets/product-card.js`, `assets/product-form.js`, `assets/variant-picker.js` |
| `assets/*.css` | Global CSS only when needed outside surface-local styles | Component-specific styles better placed in `{% stylesheet %}` | `assets/base.css`, `assets/custom.css` |
| `config/*.json` | Global merchant settings and store data | Section-local configuration | `config/settings_schema.json`, `config/settings_data.json` |
| `templates/**/*.json` | Section instance wiring and block trees per template | Reusable markup or logic | `templates/collection.json`, `templates/product.json`, `templates/metaobject/sales_campaigns.json` |
| `templates/**/*.liquid` | Specialized standalone template contracts | Shared global shell if the template intentionally bypasses it | `templates/gift_card.liquid` |
| `locales/*.json` | Shopper and editor copy | Hardcoded UI text elsewhere | `locales/en.default.json`, `locales/en.default.schema.json` |

## Composition patterns worth reusing

## Section owns the loop, static block owns the repeated card

Use this when the page controls pagination or results, but the repeated card layout should stay centralized and merchant-configurable.

```liquid
{% paginate collection.products by products_per_page %}
  {% capture children %}
    {% for product in collection.products %}
      <li class="product-grid__item">
        {% content_for 'block', type: '_product-card', id: 'product-card', closest.product: product %}
      </li>
    {% endfor %}
  {% endcapture %}

  {% render 'product-grid', section: section, children: children, paginate: paginate %}
{% endpaginate %}
```

Use this shape for collection-like result grids, not for single-instance product details.

## Static block captures dynamic children then delegates to a snippet

Use this when a shared block needs a stable JSON-backed shell but should still render a nested block tree.

```liquid
{% capture children %}
  {% content_for 'blocks', closest.product: product %}
{% endcapture %}

{% render 'product-card', children: children, product: product %}
```

This keeps the card shell in one snippet while the nested child tree stays merchant-configurable.

## Public block delegates wrapper markup to a snippet

Use this when a block owns schema and allowed child types but the wrapper markup is reusable.

```liquid
{% capture children %}
  {% content_for 'blocks' %}
{% endcapture %}

{% render 'group', children: children, settings: block.settings, shopify_attributes: block.shopify_attributes %}
```

This is the right place for group-like layout primitives.

## Section captures multiple static regions before rendering the full layout

Use this when a section owns a complex page region such as product information.

```liquid
{% capture media_gallery %}
  {% content_for 'block', type: '_product-media-gallery', id: 'media-gallery', closest.product: closest.product %}
{% endcapture %}

{% capture product_details %}
  {% content_for 'block', type: '_product-details', id: 'product-details', closest.product: closest.product %}
{% endcapture %}

{% render 'product-information-content', media_gallery: media_gallery, product_details: product_details %}
```

Use this when the section truly owns the full composition. Do not push that page-level layout responsibility down into a block.

## Liquid-to-JS bridging pattern

Use real attributes and semantic controls, then let JS enhance them.

```liquid
<product-card
  data-product-id="{{ product.id }}"
  data-featured-media-url="{{ featured_media_url }}"
  on:click="/handleViewTransition"
>
```

```js
export class ProductCard extends ProductCardLink {
  requiredRefs = ['productCardLink'];

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this.navigateToProduct);
  }
}
```

Prefer this over inline script that reconstructs server state manually.

## JSON tree patterns

## Shared product-card block tree inside a template section

Use this when a section always needs the same static infrastructure block and its nested children.

```json
"main-collection": {
  "type": "main-collection",
  "blocks": {
    "product-card": {
      "type": "_product-card",
      "static": true,
      "blocks": {
        "product-title": { "type": "product-title" }
      }
    }
  }
}
```

The key lesson is not the exact tree. It is that Liquid and JSON must agree on IDs, types, and nesting.

## Section-group JSON is global shell wiring, not template content

Use section-group JSON only for globally rendered groups such as header and footer. If a change should appear on one template type, it belongs in template JSON or a section, not in a section group.

## Quick placement checks

- If the merchant should add or reorder it inside a section: block.
- If it is a fixed internal child the section always needs: static block plus template JSON.
- If several sections or blocks share the same wrapper markup: snippet.
- If it changes page structure or data iteration: section.
- If it changes site-wide shell behavior: layout or section-group JSON.
- If it is behavior attached to rendered markup: asset.
- If it is merchant-facing configuration across the whole storefront: `settings_schema.json`.
- If it is shopper or editor copy: locale files.
