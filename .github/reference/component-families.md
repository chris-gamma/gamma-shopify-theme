# Component Families

This file explains the major families already present in the repo, what each family is responsible for, where new variations should live, and what to avoid.

## Global shell and navigation

Primary files:

- `layout/theme.liquid`
- `sections/header-group.json`
- header-related sections and blocks
- `assets/header.js`, `assets/header-drawer.js`, `assets/header-menu.js`

Responsibilities:

- Global header and footer rendering
- Header height and sticky-state coordination
- Navigation, drawer, and search modal shell behavior

Safe modification path:

- Layout-level shell changes go in `layout/theme.liquid`.
- Header group composition changes go in `sections/header-group.json` plus the matching header sections.
- Interactive behavior changes go in the existing header assets and should preserve the shared CSS variable and observer model.

Where new variations should live:

- New global shell affordances: layout or section-group JSON
- New header content slots: header sections or header blocks
- New sticky or observer logic: `assets/header.js`

Acceptable schema changes:

- Header appearance, transparent behavior, spacing, or menu-related merchant controls

Anti-patterns:

- Putting page-specific commerce logic in the layout
- Rebuilding sticky header behavior in a parallel asset instead of extending `assets/header.js`

## Collection discovery and filtering

Primary files:

- `sections/main-collection.liquid`
- `blocks/filters.liquid`
- `snippets/sorting.liquid`
- `assets/facets.js`, `assets/results-list.js`, `assets/search-page-input.js`

Responsibilities:

- Collection results, pagination or infinite scroll, filter controls, sorting, and result counts

Safe modification path:

- Collection result structure belongs in the section.
- Filter panel and sorting composition belong in the filters block and supporting snippets.
- Client behavior for form submission, drawers, and result replacement belongs in the existing facet and result assets.

Where new variations should live:

- New grid or layout mode: section schema plus section/snippet markup
- New filter presentation: filters block and filter-related snippets
- New interaction or event flow: existing facet/result assets

Acceptable schema changes:

- Grid size, spacing, filter orientation, sorting toggles, infinite scroll toggles

Anti-patterns:

- Moving pagination into the filters block
- Duplicating the product-card shell inside collection sections

## Product-card system

Primary files:

- `blocks/_product-card.liquid`
- `snippets/product-card.liquid`
- nested product-card child blocks
- `assets/product-card.js`
- template block trees in `templates/collection.json` and `templates/metaobject/sales_campaigns.json`

Responsibilities:

- Shared product-card composition across collection-like surfaces
- Card-specific interaction such as variant previews, quick add prefetch, and view transition support

Safe modification path:

- Shared shell changes go in the snippet.
- Static card tree changes go in the underscore block plus matching template JSON.
- Behavior changes go in `assets/product-card.js`.

Where new variations should live:

- New card child content: nested block under the `_product-card` tree
- New reusable wrapper treatment: snippet or helper snippet
- New card interaction: `assets/product-card.js` or an existing related asset

Acceptable schema changes:

- Card gap, padding, border, inherited color scheme, nested child settings

Anti-patterns:

- Creating one-off product-card markup inside each section
- Replacing `closest.product` with duplicate merchant product selection settings

## Product detail, media, and variants

Primary files:

- `sections/product-information.liquid`
- static child blocks such as `_product-media-gallery` and `_product-details`
- `blocks/variant-picker.liquid`
- `assets/variant-picker.js`, `assets/product-form.js`, `assets/media-gallery.js`, `assets/sticky-add-to-cart.js`
- `templates/product.json`

Responsibilities:

- Product media, variant selection, add-to-cart flow, sticky add to cart, product detail composition

Safe modification path:

- Page composition belongs in the product information section and its wrapper snippets.
- Variant selection UI belongs in the variant-picker block and related snippets.
- Variant state changes, URL updates, and morphing behavior belong in the existing variant-picker and product-form assets.

Where new variations should live:

- New detail modules: nested blocks in the product detail tree
- New variant UI treatment: variant-picker block and supporting snippets/styles
- New add-to-cart or sticky behavior: existing product-form or sticky-add-to-cart assets

Acceptable schema changes:

- Media layout, sticky add-to-cart toggles, variant style, swatch display, spacing

Anti-patterns:

- Building a separate variant selection engine outside the existing event model
- Hardcoding product-detail submodules directly into the section when a nested block is the right extension point

## Cart and pricing feedback

Primary files:

- `assets/cart-drawer.js`
- `assets/component-cart-items.js`
- `assets/cart-discount.js`
- `assets/price-per-item.js`
- cart-related snippets and blocks

Responsibilities:

- Cart updates, pricing feedback, error events, discount application, and cart UI refreshes

Safe modification path:

- Reuse cart event classes from `assets/events.js`.
- Keep add, update, and error flows aligned with the existing cart event payload structure.
- Preserve live region and status messaging behavior.

Where new variations should live:

- Markup changes: cart sections, blocks, or snippets
- Behavior changes: existing cart assets

Acceptable schema changes:

- Presentation and layout settings for cart surfaces, not checkout logic replacement

Anti-patterns:

- Dispatching one-off raw string events for core cart workflows when a shared event already exists
- Removing live region feedback for cart actions

## Group and layout primitives

Primary files:

- `blocks/group.liquid`
- `snippets/group.liquid`
- utility style snippets such as spacing, border, size, and layout-panel helpers

Responsibilities:

- Reusable container layout, background media, overlay support, nested content alignment, and linkable group shells

Safe modification path:

- Block schema controls what merchants can configure.
- Snippet markup owns the reusable wrapper and helper snippet calls.
- Keep layout helpers consistent with the existing spacing, border, size, and layout utility snippets.

Where new variations should live:

- New reusable container option: group block schema plus snippet wrapper
- New single-use page layout: section, not group

Acceptable schema changes:

- Width, height, alignment, gap, background media, overlay, link settings

Anti-patterns:

- Turning a generic group block into a page-specific feature bucket
- Duplicating utility wrapper markup in multiple blocks instead of reusing the snippet

## Sales campaign and metaobject pages

Primary files:

- `sections/scs-sales-campaign.liquid`
- `templates/metaobject/sales_campaigns.json`
- shared `_product-card` tree

Responsibilities:

- Campaign landing pages backed by metaobjects and sale collections
- Optional grouped offer rendering plus fallback collection rendering

Safe modification path:

- Keep campaign-specific data access in the section.
- Reuse the shared product-card infrastructure for repeated product rendering.
- Keep grouped and ungrouped modes aligned with collection/grid behavior already established elsewhere.

Where new variations should live:

- Campaign-specific layout or grouping: campaign section
- Shared card or filter behavior: existing shared families, not a campaign-only fork unless the behavior is truly unique

Acceptable schema changes:

- Campaign header display, grouping behavior, spacing, color scheme, grid settings

Anti-patterns:

- Forking the product-card family just for campaign pages when the shared block tree can be extended
- Treating metaobject templates as throwaway one-offs that do not need the same JSON and static block discipline as other templates
