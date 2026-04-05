---
applyTo: "layout/*.liquid,sections/*.liquid,blocks/*.liquid,snippets/*.liquid,templates/**/*.liquid"
---

# Shared Liquid Conventions

This file covers rules that apply to every Liquid surface in the theme. Pair it with the narrower surface file for the path you are editing.

## Rendering model

- Prefer server-rendered HTML that remains useful without JavaScript. Theme JS enhances the output; it does not replace the core path to browse, choose a variant, or buy.
- Match existing Horizon composition before inventing a new structure. This repo already leans on capture-plus-render wrappers, static block trees, and snippet-based layout helpers.
- Keep control flow readable. Use `{% liquid %}` for multi-step logic, nested `{% if %}` blocks instead of dense boolean expressions, and inline `{{ }}` output when a value is only used once.
- For simple one-off values, prefer inline output over extra `assign` or `capture` steps. Introduce variables only when the value is reused or the logic is materially clearer.
- Liquid has no ternary operator. Use explicit `{% if %}` branches.

## Liquid Syntax

- Never invent Liquid tags, filters, or objects.
- Use object dot notation instead of bracket notation unless a real key shape makes dot notation impossible.
- Use `{% # comment %}` for inline comments.

## Data flow and composition

- Use `{% render 'snippet-name', param: value %}` for snippet composition. `{% include %}` is deprecated and must not appear.
- Snippets do not inherit caller locals. Pass every non-global input explicitly.
- Use `{% capture %}` when markup needs to be passed into a wrapper snippet or reordered. Two common repo patterns are:

```liquid
{% capture children %}
	{% content_for 'blocks', closest.product: product %}
{% endcapture %}

{% render 'product-card', children: children, product: product %}
```

```liquid
{% capture media_gallery %}
	{% content_for 'block', type: '_product-media-gallery', id: 'media-gallery', closest.product: closest.product %}
{% endcapture %}

{% render 'product-information-content', media_gallery: media_gallery, product_details: product_details %}
```

- Treat `closest.*` as part of the data contract for reusable static blocks. If a block renders the parent product, collection, or metaobject through `closest`, keep that contract instead of replacing it with a global lookup or a duplicate setting.
- Prefer native elements already used in the theme such as `<details>`, `<summary>`, `<dialog>`, lists, fieldsets, and buttons before creating custom interaction markup.

## Whitespace and output hygiene

- Use trim delimiters when whitespace would leak into rendered HTML, especially inside attributes and inline text.
- Do not over-trim just to make source files look dense. Preserve readability when whitespace is not semantically important.
- Use `contains` only for substring checks or simple array membership. Avoid turning it into a stand-in for richer data modeling.

## Locale and schema strings

- All shopper-facing copy, accessibility copy, status text, and error or confirmation messaging must go through the `t` filter. Never concatenate translated fragments into a sentence, and escape interpolated variables when they are not intended to render HTML.
- Put schema labels, headings, help text, and option labels in `locales/en.default.schema.json`.
- Put storefront strings, status messages, empty states, and accessibility copy in `locales/en.default.json`.
- Use locale interpolation for dynamic values:

```liquid
{{ 'content.item_count' | t: count: products_count }}
```

- Do not concatenate translated fragments into a sentence.

## Upstream sync safeguards

- This instruction applies to `sections/*.liquid`, `blocks/*.liquid`, `snippets/*.liquid`, `layout/*.liquid`, and `templates/**/*.liquid`.
- If upstream changed a Liquid surface that Gamma never customized, taking upstream is usually correct.
- If Gamma customized the same Liquid surface, do not accept upstream or Gamma wholesale. Start from upstream's newer structure and re-integrate Gamma behavior into it.
- Shared product, search, header, cart, pricing, campaign, and metaobject flows are recurring manual-review hotspots in this repo.
- For overlap cases, treat [CHANGES.md](../../CHANGES.md) and the contract-sensitive instruction files as the behavioral source of truth.

## Embedded assets

- Use `{% stylesheet %}` and `{% javascript %}` blocks instead of raw `<style>` or `<script>` tags inside sections, blocks, and snippets.
- Keep embedded JavaScript small and surface-specific. Global behavior belongs in `assets/*.js`.
- Inline script in Liquid is acceptable only when it is truly layout-critical or page-contract-specific, such as the standalone import map and QR code wiring in `templates/gift_card.liquid`.

## Global Accessibility

- Require a valid `lang` attribute on `<html>` that matches the active storefront locale.
- Keep a viewport meta tag that allows zoom. Never use `maximum-scale=1.0` or `user-scalable=no`.
- Do not use `title` attributes on non-iframe elements.
- Require a descriptive `title` on every iframe.
- Keep the skip link as one of the first focusable elements in the document.
- Target the skip link at the main content container, keep the target focusable with `tabindex="-1"`, and hide the link visually without using `display: none` or `visibility: hidden`.
- Keep substantive page content inside landmarks.
- Use exactly one primary `main` landmark per page.
- Do not duplicate single-instance landmarks such as `banner`, `main`, or `contentinfo`.
- Give repeated landmarks of the same type distinct accessible names.
- Give major content sections headings.
- Start the main content area with a single page-level `h1`.
- Do not skip heading levels.
- Do not place heading elements inside links. Wrap the link inside the heading instead.

## Theme editor and preview behavior

- `request.design_mode` and `request.visual_preview_mode` are for editor and preview adjustments only. Do not route primary storefront behavior through them.
- Keep `block.shopify_attributes` intact on block wrappers and preserve editor-safe DOM anchors used for drag and drop.
- If Theme Check produces a false positive around a proven static block pattern, disable the rule narrowly around that line and re-enable it immediately after.

## Accessibility and semantics

- Use semantic HTML first. Prefer native interactive elements such as `details` and `summary`, `dialog`, `button`, `search`, `output`, lists, fieldsets, and real form controls before creating custom interaction markup. Use ARIA only when native semantics cannot express the interaction.
- Interactive controls must have an accessible name, visible focus styling, keyboard interaction that matches the pattern, and explicit state and relationship attributes when the pattern requires them. Use `aria-expanded`, `aria-controls`, `aria-current`, `aria-selected`, `aria-checked`, `aria-pressed`, or `aria-activedescendant` only when the underlying pattern calls for them, and keep the controlled content in a stable DOM relationship to the trigger.
- Preserve skip links, live regions, button text, visually hidden labels, and `aria-*` wiring already present in the theme.

## Focus, Motion, Contrast, and Mobile Interaction

- Never use positive `tabindex`.
- Never remove focus styles without providing a replacement that is clearly visible, high-contrast, and unobscured.
- Use `:focus-visible` or an equivalent keyboard-only focus pattern.
- Use positive outline offsets or equivalent box-shadow rings so focus indicators are not clipped or obscured.
- Support Windows High Contrast Mode with `@media (forced-colors: active)` when custom focus treatment would otherwise replace native behavior.
- When dynamic content is added, move focus to the first logical interactive element in the new content.
- When dynamic content is removed, restore focus to the next logical surviving control.
- Respect `prefers-reduced-motion` for all non-essential motion.
- Provide pause, stop, or reduced-motion alternatives for autoplaying or looping motion.
- Keep text contrast at at least 4.5:1 for normal text and 3:1 for large text.
- Keep non-text UI indicators, component outlines, borders, and focus indicators at at least 3:1 contrast.
- Do not lock orientation. Layouts must remain usable in portrait and landscape.
- Size touch targets to at least 24px by 24px, prefer 44px by 44px, and keep at least 8px between adjacent touch targets.

## Image, SVG, and Table Semantics

- Every `img` element must have an `alt` attribute.
- Use `alt=""` only for decorative images.
- Keep alt text concise, descriptive, and free of phrases such as `image of`, `picture of`, `graphic of`, or `icon of`.
- When a complex image cannot be described concisely, keep the alt text short and provide the extended description through `aria-describedby`.
- Decorative inline SVGs must use `aria-hidden="true"`.
- Informative inline SVGs must use `role="img"` and an accessible name through `aria-label`, `aria-labelledby`, or `title` and `desc`.
- Any active element that relies on a background image must still expose an accessible name.
- Use real tables for tabular data.
- Use `th` for header cells, add `scope` or `headers` relationships, and provide a descriptive `caption` or accessible name.
- Use `thead`, `tbody`, and `tfoot` for complex tables.
- Do not use tables for layout.

## Native HTML and Form Controls

- Treat native elements as the default choice. Use custom ARIA widget patterns only when native semantics or an existing documented family contract cannot meet the UX.
- Prefer native `details` and `summary` for expandable content before building custom disclosure UI.
- Prefer native `dialog` for modal content before building custom modal containers.
- Prefer native `popover` for floating help or menu surfaces before building custom popover plumbing.
- Prefer native `search` for search form containers and `output` for computed form results when those semantics match the UI.
- Use semantic input types and native validation attributes when they match the data being collected.

## Form Accessibility

- Associate every form control with a programmatic label.
- Do not use placeholder text as the only label.
- Group related radios and checkboxes with `fieldset` and `legend`.
- Associate help text, input restrictions, and error text with the relevant control through `aria-describedby` or `aria-errormessage`.
- When a control is invalid, set `aria-invalid="true"` and keep the error message visible.
- Move focus to the error summary heading when validation fails.
- Move focus to the success message heading when submission succeeds.
- Make error and success headings programmatically focusable with `tabindex="-1"`.
- Provide `autocomplete` hints for personal-data fields where applicable.
- Provide confirmation, review, or reversibility for critical submissions.

## Interactive Accessibility Patterns

- For disclosure and accordion triggers, use native buttons or `role="button"`, keep `aria-expanded` in sync, set `aria-controls` when the controlled content has an ID, and support Enter, Space, and Escape as appropriate.
- Keep disclosure content as a DOM sibling of its trigger.
- For accordion items, pair the trigger with a heading and keep the controlled panel labeled by that heading.
- For tabs, use `role="tablist"`, `role="tab"`, and `role="tabpanel"`, keep `aria-selected`, `aria-controls`, and `aria-labelledby` in sync, and support Arrow keys, Home, End, Enter, and Space.
- For comboboxes, use `role="combobox"`, `aria-expanded`, `aria-haspopup="listbox"`, `aria-controls`, `aria-autocomplete`, and `aria-activedescendant` while open. Render the popup as a `role="listbox"` with `role="option"` children and provide a status region for result counts.
- For sliders, expose `role="slider"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, an accessible label, and keyboard support for Arrow keys, Home, End, and optional Page Up and Page Down.
- For switches, expose `role="switch"`, keep `aria-checked` in sync, use a stable visible label, and support Space to toggle.
- For tooltips, pair the trigger with `aria-controls` and a `role="tooltip"` container, manage `aria-expanded`, and support hover, focus, and Escape. Do not place interactive controls inside the tooltip itself.

## Navigation, Media, Card, and Dialog Accessibility Patterns

- For breadcrumbs, use a labeled `nav` containing an ordered list and mark the current page with `aria-current="page"`.
- For site navigation and dropdown navigation, use labeled `nav` landmarks and semantic lists. Do not use menu roles for standard site navigation.
- Use disclosure buttons with `aria-expanded` and `aria-controls` for dropdown navigation, and use the modal dialog pattern for mobile navigation launchers.
- For product cards, wrap each card in `article`, keep a single keyboard tab-stop for the primary navigation link, label the article from the product title heading, and keep the heading-link semantics intact.
- For filter disclosures, keep the filter content as a sibling of its trigger, use `fieldset` and `legend` for option groups, use radios for mutually exclusive sort choices, and announce product counts through a `role="status"` region.
- For color swatches, back the UI with accessible radio inputs, keep visible or programmatic labels for each swatch, and never hide the actual inputs with `display: none`.
- For sale pricing, provide visually hidden context so screen readers can distinguish the regular price from the sale price.
- For media galleries, wrap the gallery in a labeled region, keep thumbnails as buttons with `aria-current`, `aria-controls`, and `aria-describedby`, announce media changes through a `role="status"` region, and restore focus when the zoom dialog closes.
- For carousels, use labeled carousel and slide roles, provide pause and play plus previous and next controls, keep auto-rotation at 5 seconds or slower, pause rotation on focus and hover, hide inactive slides from assistive technology, and wrap navigation instead of disabling end controls.
- For modal dialogs and cart drawers, use the dialog pattern: `role="dialog"`, `aria-modal="true"`, a visible or programmatic label, initial focus inside the dialog, Escape-to-close, focus trapping, and focus restoration to the launcher.
- For chat windows, use `role="log"` for message history, keep messages in chronological DOM order, provide multi-sensory notifications, trap focus when chat opens as a dialog, announce new messages and timeout warnings, and keep unread counts in the launcher’s accessible name when the chat is closed.
- For flip cards, use a real button with `aria-pressed` to toggle between front and back states, keep only one side visible at a time, and respect reduced-motion preferences.

## Performance

- Keep repeated Liquid paths cheap. Product grids, filter panels, mega menus, and nested card trees should not accumulate unnecessary loops or duplicate snippet work.
- Reuse captured output or wrapper snippets instead of duplicating large markup branches.
- After changing repeated surfaces, validate render cost with `shopify theme profile` or Theme Inspector.

## Supporting references

- For surface placement examples, read [surface-patterns](../reference/surface-patterns.md).
- For family-specific extension guidance, read [component-families](../reference/component-families.md).
