---
applyTo: "assets/*.js,assets/*.css"
---

# Assets

## General

- Store code-referenced images and icons in `assets/`. When Liquid must inline an icon, render it through `inline_asset_content` instead of duplicating raw SVG markup across templates.

## JavaScript

- This theme has no build pipeline. Write modern JavaScript and CSS that can ship directly through Shopify.
- Follow the existing module style already present in the repo. Internal modules are imported from other flat assets, commonly through the `@theme/...` alias contract or a template-local import map for standalone pages.
- Do not introduce npm dependencies, framework runtimes, or tooling assumptions that require bundling.
- The `assets/` directory is flat. Do not create subdirectories.
- Prefer `const` over `let` unless reassignment is required.
- Prefer `for...of` over `.forEach()` for iteration with side effects.
- Use `async` and `await` instead of `.then()` chains.
- Annotate complex objects, public methods, function parameters, and return types with JSDoc.
- Use `URL` and `URLSearchParams` for URL construction and mutation instead of string concatenation.
- Validate required DOM elements before using them.
- Debounce expensive input-driven work such as predictive search and live filtering.
- Cancel stale async work with `AbortController`, and abort outstanding requests in `disconnectedCallback()`.
- Expose clear public methods for parent-to-child communication when a parent owns a child component.
- Use semantic custom events with typed `detail` payloads for child-to-parent communication.
- Handle errors defensively and fail with a stable UI state instead of leaving controls half-updated.

### Component model

- The default pattern is a custom element that progressively enhances server-rendered markup.
- Extend the shared `Component` base when the element needs `ref` collection, `requiredRefs`, mutation-driven ref refresh, or compatibility with section re-rendering.
- Use plain `HTMLElement` only for genuinely simple one-off elements that do not need the shared lifecycle contract.
- Register elements once and guard registration:

```js
class HeaderComponent extends Component {
  requiredRefs = ['headerMenu'];

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }
}

if (!customElements.get('header-component')) {
  customElements.define('header-component', HeaderComponent);
}
```

### Lifecycle and cleanup

- Initialize listeners, observers, and state in `connectedCallback()`.
- Always clean up observers, document listeners, animation frame handles, timers, and abort controllers in `disconnectedCallback()`.
- Implement `updatedCallback()` when the component must refresh after section rendering or DOM morphing.
- Prefer `AbortController`, `ResizeObserver`, `IntersectionObserver`, requestAnimationFrame throttling, typed JSDoc contracts, and `URL` and `URLSearchParams` APIs over ad hoc global state, string-built URLs, or untyped cross-component payloads.

Concise example:

```js
class ProductInventory extends Component {
  requiredRefs = ['status'];
  #requestController;

  connectedCallback() {
    super.connectedCallback();
    this.#requestController = new AbortController();
  }

  disconnectedCallback() {
    this.#requestController?.abort();
    super.disconnectedCallback();
  }
}
```

### Refs and DOM access

- Use `ref` attributes in Liquid and let the shared component base collect them into `this.refs`.
- Declare `requiredRefs` when the component cannot function without certain nodes.
- Prefer refs and closest-scope queries over broad document queries.
- Query outside the component only when the target is intentionally global, such as the cart icon or body-level shell.

### Events and cross-component communication

- Use the shared event model in `assets/events.js` for cross-component behavior. Reuse `ThemeEvents` constants and event classes instead of inventing new string names when the event belongs to the global theme contract.
- Dispatch semantic custom events with useful `detail` payloads rather than making siblings call each other directly.
- Keep event ownership clear: product-card, product-form, filters, and header components already rely on theme-wide events.

### Performance and UX

- Defer non-critical work, preload only what the interaction actually needs, and yield back to the main thread when an operation can trigger style or layout work.
- Keep scroll and resize handlers throttled.
- Preserve the non-JavaScript buying path. Variant changes, cart actions, filters, and media should still degrade meaningfully when enhancement fails.

## CSS

- `assets/base.css` is loaded globally. Touch it only for true theme-wide rules, tokens, resets, or first-paint requirements.
- Component-level styles belong in `{% stylesheet %}` blocks inside the matching section, block, or snippet whenever possible.
- `assets/custom.css` is the override layer for store-specific adjustments that do not belong to the reusable Horizon surfaces.
- Keep selectors narrow and class-based. Never use ID selectors, avoid element selectors and `!important`, keep specificity at `0 1 0` when possible and at or below `0 4 0` unless a pseudo-class requirement makes that impossible, and name component classes with BEM.
- Never use ID selectors.
- Avoid element selectors and complex selectors. Prefer a single class selector whenever possible.
- Avoid `!important`. If it is truly unavoidable, add a code comment explaining why.
- Keep selector specificity at `0 1 0` when possible and at or below `0 4 0` unless a pseudo-class requirement makes that impossible.
- Use BEM for component classes. Use utility classes only for single-purpose global overrides.
- Never hardcode colors. Use theme color-scheme tokens or CSS custom properties.
- Namespace component CSS custom properties.
- Define global CSS custom properties on `:root` in `snippets/theme-styles-variables.liquid`. Keep component- or instance-specific custom properties on the rendered wrapper.
- Use logical properties where appropriate so layouts remain RTL-friendly.
- Default to mobile-first `screen and (min-width: ...)` media queries.
- Use at most one level of selector nesting, except for media queries and tightly coupled parent-modifier relationships. Do not use the `&` operator except for direct state or modifier relationships.
- Use `dvh` instead of `vh` when full-height UI must respond to mobile browser chrome.
- Constrain `:has()` selectors tightly and prefer server-rendered state classes when the same state can be expressed without subtree scanning.
- Maintain a consistent property order inside declarations: layout and positioning, box model, typography, visual styles, then animation and transforms.
- Avoid magic numbers. Prefer variables, tokens, or `calc()`.
- Use `contain`, Grid, and Flexbox for layout performance where they simplify the rendering path.

Concise example:

```liquid
<section
  class="promo-banner"
  style="--promo-banner-padding: {{ section.settings.padding }}px; --promo-banner-accent: {{ section.settings.accent_color }};"
>
  ...
</section>
```

```css
.promo-banner {
  padding: var(--promo-banner-padding);
  border-color: var(--promo-banner-accent);
}
```

## Connecting JavaScript to Liquid output

- Pass Liquid data into JS through `data-*` attributes, real form controls, and element attributes.
- Do not expect Liquid to render inside JavaScript source.
- Custom element tag names must match the registration exactly and stay kebab-case.
- Preserve semantic controls and focus behavior already present in the markup.

## Upstream sync safeguards

- For `assets/*.js` and `assets/*.css`, taking upstream is appropriate only when Gamma did not customize the file.
- If both Gamma and upstream changed the same asset, manually re-integrate Gamma behavior into the upstream structure instead of accepting one side wholesale.
- Treat pricing, predictive search, cart, header, and product assets as merge-sensitive because they overlap documented Gamma behavior.

## Anti-patterns

- Do not attach permanent document listeners without cleanup.
- Do not hardcode DOM assumptions that break when a section is rendered twice on the same page.
- Do not bypass existing component families by writing a parallel implementation for the same job.
- Do not move page-specific CSS into `base.css` just because it is easier.

## Supporting references

- See [component-families](../reference/component-families.md) for safe extension paths.
- See [surface-patterns](../reference/surface-patterns.md) for end-to-end Liquid-to-JS examples.
