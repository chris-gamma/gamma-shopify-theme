---
applyTo: "snippets/*.liquid"
---

# Snippets

Snippets are render-only Liquid helpers. They package markup, styling, and small surface-local behavior so sections and blocks stay focused on composition and schema.

## LiquidDoc contract

Every snippet must begin with a `{% doc %}` block. Keep it accurate whenever the snippet signature changes.

Required contents:

- One sentence describing what the snippet renders or wraps
- Every accepted parameter documented with `@param`
- Optional parameters wrapped in brackets
- At least one representative `@example`

```liquid
{% doc %}
  Renders a shared product-card wrapper.

  @param {object} product - The product resource for the card
  @param {string} children - Captured child markup rendered inside the card shell
  @param {object} [block] - The originating block

  @example
  {% render 'product-card', product: product, children: children %}
{% enddoc %}
```

## Scope rules

- Snippets do not inherit caller locals. Pass every required non-global value explicitly.
- Global Liquid objects such as `settings`, `request`, `routes`, `cart`, and `shop` remain available.
- If a snippet needs child markup, pass it in as a captured string instead of asking the snippet to render caller-owned blocks.

## Responsibilities

- Snippets own rendering logic, wrapper markup, and small reusable style bundles.
- They must not contain `{% schema %}`.
- They must not define merchant-editable blocks or call `{% content_for 'blocks' %}`. Block trees belong to sections and blocks.
- They may include one `{% stylesheet %}` block and one `{% javascript %}` block when the styles or behavior are truly snippet-local.

## Repo-backed patterns

- `snippets/button.liquid` shows a small render helper that expects a block contract and forwards `block.shopify_attributes`.
- `snippets/group.liquid` shows a wrapper snippet that accepts captured `children`, settings, and optional wrapper classes.
- `snippets/product-card.liquid` shows a shared structural shell for a static product-card block tree.
- `snippets/sorting.liquid` shows a richer component snippet with local styles, accessibility wiring, and JS-oriented attributes.

## Design guidance

- Use a snippet when multiple sections or blocks need the same markup contract.
- Keep snippet names aligned with the concept they render, not the page where they first appeared.
- Favor explicit parameters over hidden assumptions. If a wrapper expects `children`, `settings`, `shopify_attributes`, or a resource object, declare that directly, assign defaults for optional parameters, and validate required parameters before rendering.

## Validation

- Assign defaults for optional snippet parameters.
- Validate required parameters at the top of the snippet.
- Fail safely with a no-op or explicit HTML comment when a required parameter is missing instead of rendering against incomplete data.
- Document representative test scenarios when a snippet’s output varies by product state, media state, or other branching data.

## Anti-patterns

- Do not let snippets depend on section-only or block-only locals that were never passed in.
- Do not move editor-specific responsibilities into snippets.
- Do not hide large amounts of business logic in snippets if a section or block should own the decision.

## Supporting references

- See `.github/reference/surface-patterns.md` for examples of when a wrapper snippet is preferable to inline markup.
