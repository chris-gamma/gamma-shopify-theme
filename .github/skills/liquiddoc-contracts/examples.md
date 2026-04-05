# LiquidDoc Examples

Use these as structure references. Adjust names and parameters to the file you are actually documenting.

## Shared Snippet

```liquid
{% doc %}
  Renders the shared product-card shell around captured child markup.

  @param {object} product - Product resource rendered by the card
  @param {string} children - Captured child markup rendered inside the card shell
  @param {object} [block] - Originating block when block settings or attributes are needed

  @example
  {% render 'product-card', product: product, children: children %}
{% enddoc %}
```

## Wrapper Snippet With Settings

```liquid
{% doc %}
  Renders a reusable group wrapper around captured child blocks.

  @param {string} children - Captured child markup rendered inside the group
  @param {object} settings - Block settings that control layout and styling
  @param {string} shopify_attributes - Theme editor attributes for the outer wrapper
  @param {string} [class] - Additional wrapper classes

  @example
  {% render 'group', children: children, settings: block.settings, shopify_attributes: block.shopify_attributes %}
{% enddoc %}
```

## Static Underscore Block

```liquid
{% doc %}
  Captures the shared product-card child tree for a collection-like grid item.

  @param {object} closest.product - Product resource passed from the parent section

  @example
  {% content_for 'block', type: '_product-card', id: 'product-card', closest.product: product %}
{% enddoc %}
```

## Quick Checks

- Prefer the real call shape used in the repo over a made-up example.
- Use brackets only for optional parameters.
- Document captured markup as `string` when the caller passes rendered HTML.
- Document `closest.*` when a static block depends on parent resource context.