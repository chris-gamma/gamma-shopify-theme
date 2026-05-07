# SCS Development Memory

## 1. Working Summary

The Sales Campaign System, or SCS, is Gamma’s metaobject-driven promotions subsystem. It renders three shopper-facing surfaces inside the Shopify theme:

- a promotions index page
- a campaign detail page for each `sales_campaigns` metaobject
- a product detail page sale banner that selects one applicable campaign for the current product

SCS fits into the theme as a server-rendered extension of Horizon’s collection and product-card patterns. The index surface is wired by `templates/page.promotions.json` and `sections/scs-sales-index.liquid`. The campaign detail surface is wired by `templates/metaobject/sales_campaigns.json` and `sections/scs-sales-campaign.liquid`. The PDP surface is wired by `templates/product.json`, `blocks/scs-product-sale-banner.liquid`, and `snippets/scs-banner-content.liquid`.

The core data contract is the `sales_campaigns` metaobject definition, with optional nested `promo_offers`. Campaign visibility is governed by `sale_paused`, `start_date`, `end_date`, and a reusable ended-window helper. Campaign cards and banners use `sale_name`, `sale_list_text`, `banner_text`, `sale_image`, `sale_image_url`, `sale_collection`, `offers`, `system.url`, and `system.handle`. Index ordering uses `sale_list_priority`. PDP winner selection does not use `banner_priority`.

SCS is implemented and editor diagnostics are clean across the branch-modified files. The committed metaobject definition exports were verified current during this analysis with `npm run metaobjects:check`. SCS is still in stabilization rather than finished production hardening because storefront QA, theme-editor QA, Theme Check, route fallback assumptions, lifecycle edge cases, accessibility checks, and performance profiling are not proven by the branch-modified file set.

Highest-priority remaining work:

- validate campaign routing and the hardcoded `/pages/promotions/<handle>` fallback
- validate lifecycle and ended-window behavior against live campaign data and time boundaries
- reconcile template and schema drift, especially `campaigns_per_page` in `templates/page.promotions.json`
- verify theme-editor behavior for the metaobject template block tree and detail-section settings
- run accessibility, performance, and regression QA on index, detail, and PDP surfaces
- align internal documentation with current code where drift already exists

## 2. Branch Scope and Source of Truth

- Current branch: `sales-campaign-system`
- Base branch: `dev`
- Merge base commit: `05a29f0b6ad53e2b3e3e6af9ac8efe6773188df0`
- Unique commit count analyzed: `11`
- Modified file count analyzed: `19`

Unique commits analyzed:

- `a4cb3d2a5caed1a26f24c0ee8025b0503da6e3ee` Start work on sales-campaign-system
- `f202706a9652128f9126f20de28d1cd76db9da94` Refactor campaign URL handling and add campaign URL snippet
- `818f6352b44a83fc8a60986adc1d7d8dcc6cb6a6` Fix sales campaign detail rendering and image URL handling
- `95f30e8bca2a8a04a1b6c67bec0d856666b5140e` Add French translations for promotional campaign sections in schema
- `c98d01b998a993554ad10555958fb256126d9e7c` Update Sales Campaign System documentation and improve PDP banner logic
- `fac0d7d11293f12e8cbdf846fd9c7dadf4c3f2ec` Adjust maximum products per page limit in sales campaign settings
- `ef27c481df376b329c28303b7074430a7d024e74` Add campaign lifecycle classification and improve visibility handling in sales campaigns
- `980e6f7dac443125cf7af613ba8dfb9a7f686b70` Refactor sales campaign rendering logic and remove pagination settings
- `04012b18dc4da92c4cdb6d1ddf91724cdb6c07ae` Enhance sales campaign lifecycle management and visibility handling; implement ended-window checks and sorting by sale_list_priority
- `9516d893f56fa5d0a3fb3f60ddd6d1ee3041d721` Rename sales page template to promotions
- `e154e0d2ef02f077547bc4db04bec160f08dc4e4` Enhance sales campaign display and functionality; add no promotions message, improve accessibility with ARIA attributes, and refactor banner content rendering

Files modified by unique branch commits:

- `CHANGES.md`
- `blocks/scs-product-sale-banner.liquid`
- `docs/sales-campaign-system.md`
- `locales/en.default.json`
- `locales/en.default.schema.json`
- `locales/fr.json`
- `locales/fr.schema.json`
- `sections/scs-sales-campaign.liquid`
- `sections/scs-sales-index.liquid`
- `snippets/product-grid.liquid`
- `snippets/scs-banner-content.liquid`
- `snippets/scs-campaign-card.liquid`
- `snippets/scs-campaign-ended-window.liquid`
- `snippets/scs-campaign-lifecycle.liquid`
- `snippets/scs-campaign-url.liquid`
- `snippets/scs-richtext.liquid`
- `templates/metaobject/sales_campaigns.json`
- `templates/page.promotions.json`
- `templates/product.json`

Files outside the branch-modified set that are referenced as external dependencies:

- `docs/metaobjects/index.json` — maps exported metaobject definition files
- `docs/metaobjects/sales_campaigns.definition.json` — authoritative `sales_campaigns` field contract
- `docs/metaobjects/promo_offers.definition.json` — authoritative `promo_offers` field contract
- `blocks/filters.liquid` — shared filter block used by ungrouped campaign detail rendering
- `blocks/_product-card.liquid` — shared product-card static block used on campaign detail pages
- `blocks/_product-card-gallery.liquid` — nested product-card gallery block seeded by `templates/metaobject/sales_campaigns.json`
- `blocks/product-title.liquid` — nested product-card title block seeded by `templates/metaobject/sales_campaigns.json`
- `blocks/price.liquid` — nested product-card price block seeded by `templates/metaobject/sales_campaigns.json`
- `blocks/swatches.liquid` — nested product-card swatch block seeded by `templates/metaobject/sales_campaigns.json`
- `snippets/image.liquid` — shared image rendering used by cards, detail headers, offer groups, and banners
- `snippets/pagination-controls.liquid` — shared pagination output used by grouped other-deals and shared product grid
- `snippets/spacing-style.liquid` — shared section spacing helper used by the index
- `snippets/util-product-grid-card-size.liquid` — shared card-size helper used by grouped and ungrouped product grids
- `sections/product-information.liquid` — host section for the SCS banner block inserted in `templates/product.json`
- `assets/results-list.js` — runtime for the `<results-list>` wrapper used by ungrouped rendering

Scope boundaries for this memory file:

- This memory analyzes only the 19 files modified by commits unique to `sales-campaign-system` versus `dev`.
- Unmodified dependencies are listed only when their contracts are necessary to understand the changed files.
- This memory does not treat unmodified theme files as part of the main implementation scope.
- This memory does not treat internal notes as source of truth when current branch code says otherwise.

Source of truth used for this memory:

- the current code in the 19 branch-modified files
- Git comparison against `dev`
- repo instructions and reference docs
- exported metaobject definitions in `docs/metaobjects/`, verified current with `npm run metaobjects:check`
- current editor diagnostics, which are clean across the 19 modified files

## 3. System Purpose

SCS gives shoppers a consistent promotions system inside the Gamma storefront. Shoppers can browse a promotions index, open a specific campaign page, and see campaign messaging directly on a relevant product detail page.

SCS gives merchants and theme editors a structured promotions model instead of a one-off page-building workflow. Campaign content lives in `sales_campaigns` metaobjects, optional offer groups live in `promo_offers` metaobjects, the promotions index is a page template, the campaign detail page is a metaobject template, and the PDP banner is a product-template block.

SCS solves the business problem of running time-based and campaign-based merchandising across multiple storefront surfaces without duplicating campaign copy, images, and product membership by hand. Campaign lifecycle, visibility, ordering, and routing are expressed in shared helpers so the same campaign state governs the index, detail page, and PDP banner.

The relationship between campaigns, products, offers, banners, and landing pages is direct:

- a `sales_campaigns` metaobject represents one campaign
- `sale_collection` defines the collection-backed campaign population
- `offers` optionally define grouped sub-offers and explicit product subsets
- the promotions index lists renderable campaigns as cards
- the campaign detail page renders the campaign header and product grid
- the PDP banner resolves one applicable live campaign and renders its messaging inline on the product page

## 4. Component Inventory

### `CHANGES.md`

- Component type: documentation
- Responsibility: records repo-level Gamma custom work and classifies SCS as an in-progress or stabilization feature area
- Inputs and data dependencies: branch history and human-maintained release reporting
- Outputs and rendered behavior: no storefront output; internal summary for reviewers and maintainers
- Important contract details: records that lifecycle handling, ended-window behavior, `sale_list_priority`, and the `page.promotions` template are current SCS themes on this branch
- Related SCS components: `docs/sales-campaign-system.md`
- External dependencies outside branch scope: none required for runtime
- Completion state: updated to reflect the current SCS feature set
- Risks and implementation cautions: the line-count estimate is stale relative to the actual diff and the changelog is never fresher than the code

### `blocks/scs-product-sale-banner.liquid`

- Component type: block
- Responsibility: renders the PDP campaign banner wrapper and exposes banner presentation settings
- Inputs and data dependencies: `product`; `block.settings.show_image`; `block.settings.image_height`; `block.settings.compact_spacing`
- Outputs and rendered behavior: outputs a wrapper `div` with `block.shopify_attributes` and delegates banner selection and markup to `snippets/scs-banner-content.liquid`
- Important contract details: schema keys live under `scs.banner_block.*`; the block is reusable and contains no selection logic of its own
- Related SCS components: `snippets/scs-banner-content.liquid`, `templates/product.json`
- External dependencies outside branch scope: `sections/product-information.liquid`
- Completion state: implemented and wired into the product template
- Risks and implementation cautions: editing this block changes display controls and CSS only; winner selection and visibility rules live in the snippet

### `docs/sales-campaign-system.md`

- Component type: documentation
- Responsibility: records the intended SCS runtime contract for maintainers
- Inputs and data dependencies: current theme code and exported metaobject definitions
- Outputs and rendered behavior: no storefront output; internal system reference
- Important contract details: documents lifecycle states, ended-window math, index sorting, grouped versus ungrouped rendering, and banner selection rules
- Related SCS components: all SCS Liquid surfaces and templates
- External dependencies outside branch scope: `docs/metaobjects/sales_campaigns.definition.json`, `docs/metaobjects/promo_offers.definition.json`
- Completion state: created and substantially detailed
- Risks and implementation cautions: it already drifts from code on banner image fallback behavior, so future work must trust runtime code over the doc when they disagree

### `locales/en.default.json`

- Component type: storefront locale file
- Responsibility: stores English shopper-facing SCS text
- Inputs and data dependencies: Liquid and JSON references under `scs.storefront.*`
- Outputs and rendered behavior: provides `View sale`, empty states, `Other deals`, and loading text for shopper-facing SCS surfaces
- Important contract details: keys exist for `index`, `grouping`, `loading`, and `empty`; `banner` and `detail` namespaces exist but contain no leaf strings; `empty.no_collection` exists but is not wired by the changed Liquid files
- Related SCS components: `sections/scs-sales-index.liquid`, `sections/scs-sales-campaign.liquid`, `snippets/scs-banner-content.liquid`, `snippets/scs-campaign-card.liquid`
- External dependencies outside branch scope: none
- Completion state: implemented for current SCS copy needs
- Risks and implementation cautions: locale coverage is partial for merchant-authored content because the promotions page heading in `templates/page.promotions.json` is still seeded as English content

### `locales/en.default.schema.json`

- Component type: schema locale file
- Responsibility: stores English theme-editor labels for SCS surfaces
- Inputs and data dependencies: schema references under `scs.banner_block.*`, `scs.index_section.*`, and `scs.campaign_section.*`
- Outputs and rendered behavior: exposes editor names and setting labels for the PDP banner block, index section, and campaign section
- Important contract details: covers display settings for banner image, compact spacing, grouped mode, products per page, and spacing labels
- Related SCS components: `blocks/scs-product-sale-banner.liquid`, `sections/scs-sales-index.liquid`, `sections/scs-sales-campaign.liquid`
- External dependencies outside branch scope: none
- Completion state: implemented
- Risks and implementation cautions: any new schema setting on SCS surfaces must update this file in the same change

### `locales/fr.json`

- Component type: storefront locale file
- Responsibility: stores French shopper-facing SCS text
- Inputs and data dependencies: same SCS storefront keys as the English locale file
- Outputs and rendered behavior: provides French CTA, empty states, grouping label, and loading text
- Important contract details: mirrors the English storefront key structure; `banner` and `detail` namespaces remain empty; `empty.no_collection` exists but is not wired by the changed Liquid files
- Related SCS components: `sections/scs-sales-index.liquid`, `sections/scs-sales-campaign.liquid`, `snippets/scs-banner-content.liquid`, `snippets/scs-campaign-card.liquid`
- External dependencies outside branch scope: none
- Completion state: implemented for current SCS storefront strings
- Risks and implementation cautions: theme locale parity exists for code-backed strings, but live campaign content still depends on metaobject translations and merchant-authored page settings

### `locales/fr.schema.json`

- Component type: schema locale file
- Responsibility: stores French theme-editor labels for SCS surfaces
- Inputs and data dependencies: same schema keys as `locales/en.default.schema.json`
- Outputs and rendered behavior: provides French labels for the banner block and index/detail sections
- Important contract details: covers grouped mode, products per page, color scheme, and spacing settings in French
- Related SCS components: `blocks/scs-product-sale-banner.liquid`, `sections/scs-sales-index.liquid`, `sections/scs-sales-campaign.liquid`
- External dependencies outside branch scope: none
- Completion state: implemented
- Risks and implementation cautions: any future schema change needs matching French updates in the same change set

### `sections/scs-sales-campaign.liquid`

- Component type: section
- Responsibility: renders the campaign detail page for the current `sales_campaigns` metaobject
- Inputs and data dependencies: `metaobject`; `campaign.sale_name`; `sale_collection`; `offers`; `sale_image`; `sale_image_url`; `sale_list_text`; `banner_text`; lifecycle helper output; ended-window helper output; section settings for grouped mode, product-grid options, filters, and spacing
- Outputs and rendered behavior: renders the campaign header, optional lead media and body copy, grouped offer sections with product de-duplication and an `Other deals` remainder group, or an ungrouped collection/filter/product-grid view; renders empty and unavailable states when required
- Important contract details: `group_by_offer` selects grouped versus ungrouped rendering; if ungrouped mode is selected but `sale_collection` is blank, the section forces grouped mode so offer products still render; active and open-ended campaigns render; ended campaigns render only inside the ended window; paused, not-started, invalid, and expired-ended campaigns render the unavailable state
- Related SCS components: `snippets/scs-campaign-lifecycle.liquid`, `snippets/scs-campaign-ended-window.liquid`, `snippets/scs-richtext.liquid`, `snippets/product-grid.liquid`, `templates/metaobject/sales_campaigns.json`
- External dependencies outside branch scope: `blocks/filters.liquid`, `blocks/_product-card.liquid`, `snippets/image.liquid`, `snippets/pagination-controls.liquid`, `snippets/util-product-grid-card-size.liquid`, `assets/results-list.js`
- Completion state: implemented with grouped and ungrouped paths
- Risks and implementation cautions: grouped offer products are intentionally unpaginated; duplicate products across offers use first-match-wins behavior; static block IDs must stay aligned with the metaobject template; `padding-inline-start` and `padding-inline-end` do not appear to feed the header CSS variables on the grouped header wrapper and need validation

### `sections/scs-sales-index.liquid`

- Component type: section
- Responsibility: renders the promotions landing page and campaign card grid
- Inputs and data dependencies: `shop.metaobjects.sales_campaigns.values`; lifecycle helper output; ended-window helper output; `sale_list_priority`; `end_date`; `system.handle`; section settings for heading, body, ended-campaign visibility, color scheme, and spacing
- Outputs and rendered behavior: renders the page heading and body, a sorted list of campaign cards, or the no-campaigns empty state
- Important contract details: active and open-ended campaigns always render; ended campaigns render only when `show_ended_campaigns` is enabled and the ended-window helper returns `true`; index ordering buckets live campaigns before ended campaigns and sorts by `sale_list_priority`, end date, and handle; the index is not paginated
- Related SCS components: `snippets/scs-campaign-lifecycle.liquid`, `snippets/scs-campaign-ended-window.liquid`, `snippets/scs-campaign-card.liquid`, `templates/page.promotions.json`
- External dependencies outside branch scope: `snippets/spacing-style.liquid`
- Completion state: implemented
- Risks and implementation cautions: the section scans all `sales_campaigns` metaobjects on each render; `templates/page.promotions.json` still contains a stale `campaigns_per_page` setting that this section ignores

### `snippets/product-grid.liquid`

- Component type: snippet
- Responsibility: renders the shared product-grid wrapper used by ungrouped campaign detail pages and other collection-like surfaces
- Inputs and data dependencies: `section`; `paginate`; `products`; `children`; optional `title`; optional `enable_infinite_scroll`; optional `results_id`; optional `grid_id`
- Outputs and rendered behavior: renders the collection-style results wrapper, product grid, optional infinite-scroll sentinels, and pagination controls
- Important contract details: branch changes generalized the snippet so callers can pass custom IDs and the inline script targets the resolved grid by ID rather than a generic first-match selector
- Related SCS components: `sections/scs-sales-campaign.liquid`
- External dependencies outside branch scope: `snippets/util-product-grid-card-size.liquid`, `snippets/pagination-controls.liquid`
- Completion state: generalized for safer SCS reuse
- Risks and implementation cautions: this is a shared cross-surface helper, so future changes affect collection and search behavior beyond SCS

### `snippets/scs-banner-content.liquid`

- Component type: snippet
- Responsibility: resolves the winning applicable campaign for the current product and renders the PDP banner content
- Inputs and data dependencies: `product`; `show_image`; `image_height`; `compact_spacing`; `shop.metaobjects.sales_campaigns.values`; campaign lifecycle helper; campaign URL helper; `sale_collection`; `offers`; `offer_description`; `offer_image`; `offer_image_link`; `sale_list_text`; `banner_text`; `sale_image`; `sale_image_url`
- Outputs and rendered behavior: renders a PDP banner only when a winning campaign exists and the banner has text content; renders optional media, rich text body, and a CTA link to the campaign page
- Important contract details: only `active` and `open_ended` campaigns are eligible; campaign applicability is determined by collection membership or explicit offer-product membership; the earliest ending eligible campaign wins; copy falls back from `offer_description` to `sale_list_text` to `banner_text`; campaign image fallback is present in code; `banner_priority` is unused
- Related SCS components: `blocks/scs-product-sale-banner.liquid`, `snippets/scs-campaign-lifecycle.liquid`, `snippets/scs-campaign-url.liquid`, `snippets/scs-richtext.liquid`
- External dependencies outside branch scope: `snippets/image.liquid`, live `sales_campaigns` and `promo_offers` entries
- Completion state: implemented
- Risks and implementation cautions: the snippet loops all campaigns and may loop all offers and offered products; documentation currently understates the campaign-image fallback path; the hardcoded route fallback in `scs-campaign-url` affects every CTA and fallback image link

### `snippets/scs-campaign-card.liquid`

- Component type: snippet
- Responsibility: renders one campaign card on the promotions index
- Inputs and data dependencies: `campaign`; campaign URL helper; `sale_name`; `sale_image`; `sale_list_text`; `banner_text`; optional first `offer_image`
- Outputs and rendered behavior: renders a campaign card `article` with optional media, linked title, body copy, and localized CTA text
- Important contract details: card image priority is `campaign.sale_image` first, then the first offer image; body copy priority is `sale_list_text` first, then `banner_text`; the title link is the primary interactive element
- Related SCS components: `sections/scs-sales-index.liquid`, `snippets/scs-campaign-url.liquid`, `snippets/scs-richtext.liquid`
- External dependencies outside branch scope: `snippets/image.liquid`
- Completion state: implemented
- Risks and implementation cautions: the CTA text is presentational text rather than a separate second link; routing correctness depends on `scs-campaign-url`

### `snippets/scs-campaign-ended-window.liquid`

- Component type: snippet
- Responsibility: returns whether an ended campaign is still allowed to display
- Inputs and data dependencies: `campaign`; lifecycle helper; `start_date`; `end_date`; current time
- Outputs and rendered behavior: returns the string `true` or `false`
- Important contract details: the ended window equals the campaign runtime, calculated as `end_date - start_date`, and only applies when lifecycle is `ended`; missing `start_date` prevents ended-window eligibility
- Related SCS components: `sections/scs-sales-index.liquid`, `sections/scs-sales-campaign.liquid`
- External dependencies outside branch scope: none
- Completion state: implemented
- Risks and implementation cautions: changing this snippet changes both index and detail visibility for ended campaigns

### `snippets/scs-campaign-lifecycle.liquid`

- Component type: snippet
- Responsibility: classifies campaign lifecycle state for all SCS runtime surfaces
- Inputs and data dependencies: `campaign`; `sale_paused`; `start_date`; `end_date`; current time
- Outputs and rendered behavior: returns one of `paused`, `invalid_date`, `not_started`, `ended`, `open_ended`, or `active`
- Important contract details: `sale_paused` is a hard override; invalid date order is detected before started or ended checks; campaigns with no end date classify as `open_ended`
- Related SCS components: `sections/scs-sales-index.liquid`, `sections/scs-sales-campaign.liquid`, `snippets/scs-banner-content.liquid`, `snippets/scs-campaign-ended-window.liquid`
- External dependencies outside branch scope: none
- Completion state: implemented
- Risks and implementation cautions: the lifecycle vocabulary is now a shared contract and must stay synchronized across code and documentation

### `snippets/scs-campaign-url.liquid`

- Component type: snippet
- Responsibility: resolves the storefront URL used for campaign cards, detail links, and PDP banner CTAs
- Inputs and data dependencies: `campaign`; `campaign.system.url`; `campaign.system.handle`; `routes.root_url`
- Outputs and rendered behavior: outputs the preferred campaign URL as a trimmed string
- Important contract details: `campaign.system.url` wins when present; fallback path is `routes.root_url + pages/promotions/<campaign-handle>`
- Related SCS components: `snippets/scs-campaign-card.liquid`, `snippets/scs-banner-content.liquid`
- External dependencies outside branch scope: the storefront page whose handle is `promotions`
- Completion state: implemented
- Risks and implementation cautions: the fallback path is hardcoded and requires validation against live routing and page handles

### `snippets/scs-richtext.liquid`

- Component type: snippet
- Responsibility: renders rich-text fields from SCS metaobjects
- Inputs and data dependencies: `field`
- Outputs and rendered behavior: renders the field with `metafield_tag` when present
- Important contract details: this helper is intentionally minimal and assumes a rich-text metafield-style object
- Related SCS components: `sections/scs-sales-campaign.liquid`, `snippets/scs-banner-content.liquid`, `snippets/scs-campaign-card.liquid`
- External dependencies outside branch scope: none
- Completion state: implemented
- Risks and implementation cautions: use it only with rich-text fields that are compatible with `metafield_tag`

### `templates/metaobject/sales_campaigns.json`

- Component type: template JSON
- Responsibility: wires the campaign detail page for `sales_campaigns` metaobjects
- Inputs and data dependencies: one `scs-sales-campaign` section instance plus static `filters` and `_product-card` block trees and nested product-card child blocks
- Outputs and rendered behavior: gives each campaign metaobject page the detail section and the shared product-card/filter infrastructure needed by grouped and ungrouped rendering
- Important contract details: the section instance type is `scs-sales-campaign`; the static IDs `filters` and `product-card` are part of the runtime contract; the product-card tree includes `_product-card-gallery`, `product-title`, `price`, and `swatches`
- Related SCS components: `sections/scs-sales-campaign.liquid`, `blocks/filters.liquid`, `blocks/_product-card.liquid`
- External dependencies outside branch scope: `blocks/filters.liquid`, `blocks/_product-card.liquid`, `blocks/_product-card-gallery.liquid`, `blocks/product-title.liquid`, `blocks/price.liquid`, `blocks/swatches.liquid`
- Completion state: implemented and seeded
- Risks and implementation cautions: the template does not show a section-level `block_order`, so storefront and theme-editor validation are still required; static IDs must not be renamed casually

### `templates/page.promotions.json`

- Component type: template JSON
- Responsibility: wires the promotions index page
- Inputs and data dependencies: one `scs-sales-index` section instance with default settings
- Outputs and rendered behavior: assigns the promotions page template to the index section with default heading, ended-campaign toggle, spacing, and color scheme
- Important contract details: `show_ended_campaigns` defaults to `false`; heading is seeded as the English word `Promotions`; the template still carries a `campaigns_per_page` setting that the section no longer uses
- Related SCS components: `sections/scs-sales-index.liquid`
- External dependencies outside branch scope: the storefront page whose handle is expected to be `promotions` by URL fallback
- Completion state: implemented with drift that needs cleanup
- Risks and implementation cautions: orphaned settings in editor-managed JSON create misleading configuration state; the hardcoded English heading is merchant-managed content rather than locale-managed copy

### `templates/product.json`

- Component type: template JSON
- Responsibility: wires the PDP SCS banner into the existing product-information block tree
- Inputs and data dependencies: product-information static tree; inserted `scs-product-sale-banner` block instance after `product-system-badges`
- Outputs and rendered behavior: causes PDPs using this template to render the SCS banner block in the product details area
- Important contract details: the inserted block uses `show_image`, `image_height`, and `compact_spacing`; block order places the SCS banner after system badges and before the variant picker path continues
- Related SCS components: `blocks/scs-product-sale-banner.liquid`, `snippets/scs-banner-content.liquid`
- External dependencies outside branch scope: `sections/product-information.liquid`, `blocks/product-system-badges.liquid`
- Completion state: implemented and wired
- Risks and implementation cautions: this is editor-managed JSON, so unrelated block-order churn should be avoided; block placement should be validated on the actual PDP layout

## 5. SCS System Contract

### Data model and metaobject contract

Status: confirmed

SCS uses the current exported `sales_campaigns` metaobject definition and the related `promo_offers` definition. The committed exports were verified current during this analysis with `npm run metaobjects:check`.

The active `sales_campaigns` contract used by theme code includes:

- `sale_name`
- `sale_collection`
- `start_date`
- `end_date`
- `sale_paused`
- `banner_text`
- `sale_list_text`
- `sale_list_priority`
- `sale_image`
- `sale_image_url`
- `offers`
- `system.url`
- `system.handle`

The active `promo_offers` contract used by theme code includes:

- `offer_name`
- `offer_description`
- `offer_image`
- `offer_image_link`
- `products`
- `system.handle`

`banner_priority` is defined on `sales_campaigns` but unused by the current branch code. `sale_collection` is required by the exported definition, but the detail section still guards the missing-collection edge case and can render grouped offer products without it.

### Campaign lifecycle contract

Status: confirmed

SCS classifies campaigns into exactly six lifecycle states:

- `paused`
- `invalid_date`
- `not_started`
- `ended`
- `open_ended`
- `active`

Classification precedence is fixed:

1. `paused` when `sale_paused` is `true`
2. `invalid_date` when both dates exist and `end_date < start_date`
3. `not_started` when `start_date > now`
4. `ended` when `end_date < now`
5. `open_ended` when no `end_date` exists and the campaign is otherwise eligible
6. `active` otherwise

The lifecycle helper is the canonical source for index, detail, and PDP banner visibility decisions.

### Campaign visibility contract

Status: confirmed

SCS uses lifecycle state plus an ended-window helper to decide whether a campaign is renderable on each surface.

- The index renders `active` and `open_ended` campaigns.
- The index may render `ended` campaigns only when `show_ended_campaigns` is enabled and the ended-window helper returns `true`.
- The detail page renders `active`, `open_ended`, and ended-window-eligible `ended` campaigns.
- The detail page renders the generic unavailable state for `paused`, `not_started`, `invalid_date`, and expired-ended campaigns.
- The PDP banner only considers `active` and `open_ended` campaigns.
- `sale_paused` is a hard visibility override across all surfaces.

### Campaign priority and ordering contract

Status: partial

Index ordering is explicit and confirmed. Cross-surface priority is not universal.

The promotions index sorts campaigns with this contract:

1. filter by lifecycle and ended-window visibility first
2. bucket live campaigns (`active`, `open_ended`) before ended-window-eligible `ended` campaigns
3. sort by `sale_list_priority` ascending inside each bucket
4. treat blank `sale_list_priority` as `10`
5. break ties by normalized `end_date` ascending, with blank `end_date` treated as far future
6. apply deterministic final tie-break by `campaign.system.handle` ascending

The PDP banner does not use `sale_list_priority` or `banner_priority`. It selects the earliest-ending eligible campaign. `banner_priority` remains intentionally unused in current code.

### Campaign URL and routing contract

Status: partial

SCS resolves campaign URLs with a two-step rule:

1. use `campaign.system.url` when present
2. otherwise fall back to `routes.root_url + pages/promotions/<campaign.system.handle>`

This contract is implemented and reused by campaign cards and PDP banners. The fallback route needs storefront validation because the template name `page.promotions.json` does not by itself guarantee that the storefront page handle remains `promotions`.

### Product-to-campaign association contract

Status: confirmed

A product is associated with a campaign in two ways:

- the product belongs to the campaign’s `sale_collection`
- the product appears explicitly in an offer’s `products` list

The detail page uses `sale_collection` as its collection-backed grid source and `offers` as optional grouping overlays. The PDP banner treats either collection membership or offer-product membership as sufficient for campaign applicability. Offer-product membership also enables offer-specific description and media fallback rules.

### Sales index contract

Status: confirmed

The promotions index is a non-paginated page-level list of renderable campaigns. It optionally renders a heading and body from section settings, loops all `sales_campaigns` metaobjects, applies lifecycle and ended-window filtering, sorts the result set, and renders one `scs-campaign-card` per campaign.

When no campaigns are renderable, the index renders `scs.storefront.empty.no_campaigns`.

### Campaign detail page contract

Status: confirmed

The campaign detail page uses the current metaobject as `campaign`. It renders a header with `sale_name`, optional `sale_image`, optional `sale_image_url`, and rich-text body copy from `sale_list_text` or `banner_text`. It then renders either grouped or ungrouped product content based on section settings and collection availability.

When a campaign is renderable but has no products, the detail page renders `scs.storefront.empty.no_products`. When a campaign is not renderable, the detail page renders `scs.storefront.empty.unavailable`.

### Grouped versus ungrouped rendering contract

Status: confirmed

Grouped mode renders each offer group directly from `campaign.offers.value`, tracks already-rendered product IDs, and prevents duplicate product cards from appearing in later offer groups. Unmatched collection products render afterward in a trailing `Other deals` group.

Grouped-mode rules:

- offer groups render all offer products with no offer-level pagination
- duplicate products across offers are de-duplicated by first-match-wins token tracking
- unmatched collection products render in a catch-all `Other deals` group
- only the catch-all collection group paginates by `products_per_page`

Ungrouped mode renders the campaign collection through the shared filter and product-grid flow. When ungrouped mode is selected but `sale_collection` is blank, the section forces grouped mode so offer products still render.

### PDP and banner contract

Status: partial

The PDP banner resolves one winning live campaign for the current product.

Confirmed rules:

- only `active` and `open_ended` campaigns are eligible
- earliest ending eligible campaign wins
- blank `end_date` is treated as far future
- ties keep the first encountered campaign because the comparison is strict
- banner copy falls back from `offer_description` to `sale_list_text` to `banner_text`
- when a matched offer provides `offer_description`, the banner may also use `offer_image` and `offer_image_link`
- the code currently falls back to `winning_campaign.sale_image` when no offer image is active
- the banner renders only when a winning campaign exists and resolved banner text is not blank

Validation is still needed for live-data behavior, route correctness, and performance on products with many applicable campaigns or offer-product matches.

### Campaign card and listing contract

Status: confirmed

Campaign cards render as `article` elements with an `aria-labelledby` relationship to the campaign title. The title is the primary link. Media fallback is `campaign.sale_image` first, then the first offer image. Body copy fallback is `sale_list_text` first, then `banner_text`. The localized CTA label is presentational text and is not a second link.

### Locale and schema contract

Status: partial

SCS has English and French locale coverage for the current code-backed storefront strings and schema labels.

Confirmed locale-backed storefront strings:

- `View sale`
- `Other deals`
- campaign empty and unavailable messages
- loading text for more products

Confirmed locale-backed schema strings:

- SCS banner block name and labels
- SCS index section name and labels
- SCS campaign section name and labels

Partial areas:

- `banner` and `detail` namespaces exist but are empty
- `scs.storefront.empty.no_collection` exists but is not wired by the changed Liquid files
- the seeded heading in `templates/page.promotions.json` is merchant content, not locale-backed content

### Theme editor and settings contract

Status: partial

Theme-editor controls exist for the three shopper-facing SCS surfaces.

- The promotions index section exposes heading, body, ended-campaign visibility, color scheme, and block padding.
- The campaign detail section exposes image display, hero height, grouped mode, products per page, layout, card size, mobile card size, width, mobile width behavior, infinite scroll, gaps, inline padding, and block padding.
- The PDP banner block exposes image display, image height, and compact spacing.

Partial and validation-needed areas:

- `templates/page.promotions.json` still contains a stale `campaigns_per_page` setting that the section no longer reads
- some campaign detail settings are mode-specific
- grouped-header inline padding variables need validation because the header CSS uses `--padding-inline-start` and `--padding-inline-end` without clearly setting them on the header wrapper
- the metaobject template block tree needs theme-editor validation because it seeds static blocks without a visible section-level `block_order`

### Accessibility and UX contract

Status: partial

SCS follows several good structural patterns:

- the index grid uses list semantics
- campaign cards render as `article` elements with headings and a primary link inside the heading
- grouped offer sections use `aria-labelledby`
- empty and unavailable states are rendered as real content, not omitted silently

Validation is still needed for keyboard flow, focus behavior, heading hierarchy across full pages, CTA clarity, image alt behavior through the shared image snippet, and real storefront accessibility on English and French routes.

### Performance contract

Status: validation needed

SCS currently favors correctness and reuse over explicit performance constraints.

Known repeated work:

- the promotions index loops all `shop.metaobjects.sales_campaigns.values`
- the PDP banner loops all campaigns and may also loop offers and offered products
- grouped detail mode renders all offer products without offer-level pagination

No branch-scoped profiling results are present. Repeated-surface validation with `shopify theme profile` or Theme Inspector is still required.

### SEO, share, and linking contract

Status: partial

Campaign cards and PDP banners resolve campaign URLs through a shared helper. Metaobject pages are renderable and online-store-enabled by definition, so SCS has a path to real campaign landing pages. The route fallback still needs validation, and no explicit share metadata work appears in the branch-modified file set.

### Error and empty-state contract

Status: partial

Confirmed empty-state behavior:

- index page renders `no_campaigns`
- renderable detail pages with no products render `no_products`
- non-renderable detail pages render `unavailable`
- ended campaigns outside the ended window disappear from the index and render as unavailable on detail pages
- paused, not-started, and invalid campaigns do not surface on the index and do not render full detail content

Partial areas:

- `no_collection` locale copy exists but is not currently rendered by the changed Liquid files
- no explicit missing-route or broken-link fallback is implemented in the branch-modified file set

## 6. Current Behavior by User Flow

### Viewing the sales and campaign index

A page using `templates/page.promotions.json` renders `sections/scs-sales-index.liquid` as the main surface. The section renders its optional heading and body from section settings, iterates all `sales_campaigns` metaobjects, classifies lifecycle, optionally applies ended-window visibility for ended campaigns, sorts the renderable set, and renders one campaign card per item. When no campaigns qualify, the section renders the localized no-campaigns empty state.

### Viewing a campaign detail page

A `sales_campaigns` metaobject page using `templates/metaobject/sales_campaigns.json` renders `sections/scs-sales-campaign.liquid`. The section classifies lifecycle, decides whether the campaign is renderable, renders the campaign title and optional lead image and rich-text body, then renders product content in grouped or ungrouped mode. Non-renderable campaigns show the localized unavailable message instead of campaign content.

### Seeing campaign cards

Each campaign card resolves a campaign URL through `scs-campaign-url`, chooses media from `sale_image` or the first offer image, renders the campaign title as the primary link, renders `sale_list_text` or `banner_text`, and shows the localized `View sale` CTA text. The card is presentational and does not carry separate lifecycle logic.

### Seeing grouped campaign content

Grouped campaign detail mode renders offer groups directly from `campaign.offers.value`. Each group can render an offer heading, optional offer image, optional offer rich text, and a deduplicated product grid. A product rendered under an earlier offer group is skipped in later groups. Collection products that are not claimed by any offer group render at the end in a catch-all `Other deals` section. Offer groups are unpaginated. The catch-all collection group paginates with `products_per_page`.

### Seeing ungrouped campaign content

Ungrouped campaign detail mode renders the shared filter and collection-style grid path against `sale_collection`. It uses `<results-list>`, the shared `filters` block, and the shared `product-grid` snippet. Infinite scroll is configurable. If the merchant selects ungrouped mode but `sale_collection` is blank, the section forces grouped mode so offer-only campaigns still render products.

### Seeing PDP or product banner sale messaging

The PDP banner block renders inside the product-information block tree. The shared banner snippet checks all live campaigns, evaluates whether the current product is in the campaign collection or an explicit offer-product list, selects the earliest-ending eligible campaign, resolves rich-text body content, resolves media and link fallbacks, and renders a banner only when text content exists. Ended, paused, not-started, and invalid campaigns do not render banners.

### Empty, expired, inactive, missing, or invalid campaign states

The index hides `paused`, `not_started`, `invalid_date`, and expired-ended campaigns. The detail page renders the localized unavailable state for those same conditions. Ended campaigns only remain visible on index and detail pages while the ended-window helper returns `true`. Campaigns with no products render the localized no-products state. Missing `sale_collection` does not crash the detail page; grouped mode can still render offer products. The `no_collection` locale key exists but is not used by the changed Liquid files.

### English and French storefront behavior

English and French storefront strings exist for the current code-backed index CTA, grouping label, and empty states. The campaign and offer content fields are translatable by metaobject capability, but this memory does not assume that live entries already contain translated content. The seeded heading in `templates/page.promotions.json` is English merchant content and not a locale-backed string.

### Theme editor and admin-facing behavior

Theme editors can configure:

- promotions index heading, body, ended visibility, color scheme, and padding
- campaign detail image display, grouped mode, products per page, grid layout, card sizes, width, infinite scroll, gaps, and padding
- PDP banner image visibility, image height, and compact spacing

The campaign detail metaobject template seeds shared static `filters` and `_product-card` trees so the same campaign section can reuse collection-like tooling. The product template inserts the banner after product system badges. Theme-editor validation is still required for stale settings, mode-specific controls, and static block behavior.

## 7. Completed Work

- [x] Added canonical campaign lifecycle classification
  - Working knowledge:
    - What is implemented: `snippets/scs-campaign-lifecycle.liquid` returns the six-state lifecycle vocabulary used by the index, campaign detail page, and PDP banner.
    - File(s): `snippets/scs-campaign-lifecycle.liquid`, `sections/scs-sales-index.liquid`, `sections/scs-sales-campaign.liquid`, `snippets/scs-banner-content.liquid`
    - Contract impact: one lifecycle helper now governs all SCS visibility decisions.
  - Evidence:
    - Relevant branch-modified file(s): same as above
    - Relevant implementation detail: each surface captures the snippet result and branches on the same state names.
  - Confidence: high
  - Notes: `sale_paused` is a hard override.

- [x] Added ended-window visibility handling for ended campaigns
  - Working knowledge:
    - What is implemented: `snippets/scs-campaign-ended-window.liquid` returns whether an ended campaign still qualifies for display after its end date.
    - File(s): `snippets/scs-campaign-ended-window.liquid`, `sections/scs-sales-index.liquid`, `sections/scs-sales-campaign.liquid`
    - Contract impact: ended campaigns now have a reusable post-end display rule instead of a permanent hide-or-show rule.
  - Evidence:
    - Relevant branch-modified file(s): same as above
    - Relevant implementation detail: the window length is the original campaign runtime and only applies when lifecycle is `ended`.
  - Confidence: high
  - Notes: missing `start_date` keeps the helper false.

- [x] Added a shared campaign URL helper
  - Working knowledge:
    - What is implemented: `snippets/scs-campaign-url.liquid` centralizes campaign URL resolution.
    - File(s): `snippets/scs-campaign-url.liquid`, `snippets/scs-campaign-card.liquid`, `snippets/scs-banner-content.liquid`
    - Contract impact: campaign cards and PDP banners now share one routing rule.
  - Evidence:
    - Relevant branch-modified file(s): same as above
    - Relevant implementation detail: the helper prefers `campaign.system.url` and falls back to `/pages/promotions/<handle>`.
  - Confidence: high
  - Notes: the fallback route still needs manual validation.

- [x] Added the promotions index section and page template
  - Working knowledge:
    - What is implemented: the branch adds a dedicated promotions landing page driven by `sections/scs-sales-index.liquid` and `templates/page.promotions.json`.
    - File(s): `sections/scs-sales-index.liquid`, `templates/page.promotions.json`
    - Contract impact: campaigns now have a centralized index surface with explicit lifecycle filtering, optional ended-campaign visibility, and deterministic ordering.
  - Evidence:
    - Relevant branch-modified file(s): same as above
    - Relevant implementation detail: the section loops `shop.metaobjects.sales_campaigns.values`, sorts records, and renders `scs-campaign-card` items.
  - Confidence: high
  - Notes: the index is intentionally non-paginated in the current branch.

- [x] Added a reusable campaign card snippet
  - Working knowledge:
    - What is implemented: `snippets/scs-campaign-card.liquid` renders one campaign card for the index surface.
    - File(s): `snippets/scs-campaign-card.liquid`, `sections/scs-sales-index.liquid`
    - Contract impact: campaign card presentation is centralized instead of inlined inside the index section.
  - Evidence:
    - Relevant branch-modified file(s): same as above
    - Relevant implementation detail: image fallback is campaign image first, then first offer image; text fallback is `sale_list_text` then `banner_text`.
  - Confidence: high
  - Notes: the title is the primary link; the CTA label is presentational text.

- [x] Added the campaign detail section with grouped and ungrouped rendering
  - Working knowledge:
    - What is implemented: `sections/scs-sales-campaign.liquid` renders campaign pages, including grouped offer rendering, ungrouped collection rendering, empty states, and unavailable states.
    - File(s): `sections/scs-sales-campaign.liquid`
    - Contract impact: campaigns can now render rich header content and product content through one section that understands lifecycle and campaign data.
  - Evidence:
    - Relevant branch-modified file(s): `sections/scs-sales-campaign.liquid`
    - Relevant implementation detail: grouped mode deduplicates products across offer groups and appends unmatched collection products as `Other deals`; ungrouped mode uses shared filters and product-grid infrastructure.
  - Confidence: high
  - Notes: the section silently forces grouped mode when no collection exists.

- [x] Seeded the metaobject template with shared filters and product-card infrastructure
  - Working knowledge:
    - What is implemented: `templates/metaobject/sales_campaigns.json` wires `scs-sales-campaign` and its shared static block tree.
    - File(s): `templates/metaobject/sales_campaigns.json`
    - Contract impact: campaign detail pages reuse the same product-card family and filter tooling as collection-like surfaces.
  - Evidence:
    - Relevant branch-modified file(s): `templates/metaobject/sales_campaigns.json`
    - Relevant implementation detail: the template seeds static `filters` and `_product-card` blocks plus nested gallery, title, price, and swatch blocks.
  - Confidence: medium
  - Notes: theme-editor validation is still required because the template shape is unusual enough to deserve confirmation.

- [x] Added the PDP sale banner block and campaign resolver
  - Working knowledge:
    - What is implemented: `blocks/scs-product-sale-banner.liquid` and `snippets/scs-banner-content.liquid` render sale messaging on product pages.
    - File(s): `blocks/scs-product-sale-banner.liquid`, `snippets/scs-banner-content.liquid`
    - Contract impact: SCS now has a shopper-facing PDP surface that resolves one winning live campaign per product.
  - Evidence:
    - Relevant branch-modified file(s): same as above
    - Relevant implementation detail: the resolver checks collection membership and explicit offer-product membership, picks the earliest-ending eligible campaign, and renders rich text plus optional media.
  - Confidence: high
  - Notes: the banner renders only when resolved text content is present.

- [x] Wired the PDP banner into the product template
  - Working knowledge:
    - What is implemented: `templates/product.json` inserts `scs-product-sale-banner` into the product-information block tree after product system badges.
    - File(s): `templates/product.json`
    - Contract impact: products using this template can display SCS sale messaging inline on the PDP.
  - Evidence:
    - Relevant branch-modified file(s): `templates/product.json`
    - Relevant implementation detail: the block instance carries `show_image`, `image_height`, and `compact_spacing` settings.
  - Confidence: high
  - Notes: placement needs manual layout validation on real PDPs.

- [x] Generalized the shared product-grid snippet for safer SCS reuse
  - Working knowledge:
    - What is implemented: `snippets/product-grid.liquid` now supports optional `results_id` and `grid_id` parameters and targets the resolved grid by ID.
    - File(s): `snippets/product-grid.liquid`
    - Contract impact: SCS can reuse the shared grid without generic DOM targeting collisions.
  - Evidence:
    - Relevant branch-modified file(s): `snippets/product-grid.liquid`
    - Relevant implementation detail: the snippet resolves IDs before rendering and the inline script looks up the grid by the resolved ID.
  - Confidence: medium
  - Notes: this is a shared helper, not an SCS-only file.

- [x] Added English and French locale coverage for current SCS storefront and schema strings
  - Working knowledge:
    - What is implemented: SCS shopper-facing and theme-editor-facing strings now exist in both English and French locale files.
    - File(s): `locales/en.default.json`, `locales/fr.json`, `locales/en.default.schema.json`, `locales/fr.schema.json`
    - Contract impact: the current code-backed SCS strings do not rely on inline hardcoded copy in Liquid or schema labels.
  - Evidence:
    - Relevant branch-modified file(s): same as above
    - Relevant implementation detail: CTA, empty states, grouping label, loading text, block names, and section setting labels are localized.
  - Confidence: high
  - Notes: merchant-seeded page content is still separate from locale-backed content.

- [x] Added internal SCS documentation and branch-level change reporting
  - Working knowledge:
    - What is implemented: the branch adds `docs/sales-campaign-system.md` and updates the SCS section in `CHANGES.md`.
    - File(s): `docs/sales-campaign-system.md`, `CHANGES.md`
    - Contract impact: the branch now carries internal documentation for lifecycle, visibility, routing, sorting, grouping, and banner behavior.
  - Evidence:
    - Relevant branch-modified file(s): same as above
    - Relevant implementation detail: both documents explicitly describe lifecycle classification, ended-window handling, and the `page.promotions` template.
  - Confidence: medium
  - Notes: documentation drift already exists and should be corrected in a follow-up change.

## 8. Remaining Work

- [ ] Validate campaign routing and fallback URLs
  - Production outcome: campaign cards and PDP banner CTAs always open the correct campaign landing page.
  - Why needed: `snippets/scs-campaign-url.liquid` hardcodes `/pages/promotions/<handle>` when `system.url` is blank.
  - Current state: the helper is implemented and shared, but storefront handle assumptions are unproven from the branch-modified file set.
  - Files likely involved: `snippets/scs-campaign-url.liquid`, `templates/page.promotions.json`, `docs/sales-campaign-system.md`
  - Risk if skipped: shoppers can land on broken or mismatched campaign URLs.
  - Suggested validation: verify live `campaign.system.url` values and manually open fallback URLs on the dev theme.
  - Priority: must
  - Confidence: high

- [ ] Reconcile stale promotions template settings
  - Production outcome: the promotions page template exposes only real settings that the section actually reads.
  - Why needed: `templates/page.promotions.json` still contains `campaigns_per_page`, but `sections/scs-sales-index.liquid` does not support pagination.
  - Current state: the template is functional, but it carries at least one orphaned setting.
  - Files likely involved: `templates/page.promotions.json`, `sections/scs-sales-index.liquid`
  - Risk if skipped: theme-editor state becomes misleading and future maintainers may assume index pagination exists.
  - Suggested validation: open the promotions page in the theme editor and confirm whether the orphaned setting is visible or silently ignored, then remove or restore the intended contract deliberately.
  - Priority: must
  - Confidence: high

- [ ] Validate and repair detail-section settings that do not clearly map to runtime output
  - Production outcome: campaign detail settings behave predictably in both grouped and ungrouped modes.
  - Why needed: grouped-header CSS uses inline-padding variables that are not clearly set on the wrapper, and several settings are mode-specific.
  - Current state: grouped and ungrouped rendering work conceptually, but not every merchant control is proven to affect output as intended.
  - Files likely involved: `sections/scs-sales-campaign.liquid`, `templates/metaobject/sales_campaigns.json`
  - Risk if skipped: theme editors can change settings that appear to do nothing or only work in one mode.
  - Suggested validation: compare grouped and ungrouped output in the theme editor while toggling padding, width, and infinite-scroll settings.
  - Priority: must
  - Confidence: medium

- [ ] Run lifecycle and ended-window QA against live campaign dates
  - Production outcome: lifecycle state changes happen at the correct times and ended campaigns display for the intended post-end window.
  - Why needed: lifecycle logic now governs index, detail, and PDP surfaces, and date math is time-sensitive.
  - Current state: helper logic is implemented and internally consistent, but real campaign data and timezone behavior are not validated in this branch memory.
  - Files likely involved: `snippets/scs-campaign-lifecycle.liquid`, `snippets/scs-campaign-ended-window.liquid`, `sections/scs-sales-index.liquid`, `sections/scs-sales-campaign.liquid`
  - Risk if skipped: campaigns can appear too early, disappear too late, or stay visible after the intended window.
  - Suggested validation: create or inspect campaigns covering each lifecycle state and compare index, detail, and PDP output before and after date thresholds.
  - Priority: must
  - Confidence: high

- [ ] Validate grouped and ungrouped campaign detail behavior on real campaign data
  - Production outcome: campaign detail pages behave correctly for collection-backed campaigns, offer-only campaigns, mixed campaigns, and duplicate-product scenarios.
  - Why needed: grouped mode, ungrouped mode, forced grouped fallback, and first-match-wins de-duplication are all active contracts.
  - Current state: the code defines these behaviors, but the branch-modified file set does not prove that merchants want every edge case exactly as implemented.
  - Files likely involved: `sections/scs-sales-campaign.liquid`, `templates/metaobject/sales_campaigns.json`
  - Risk if skipped: products can disappear unexpectedly, order can surprise merchants, or the fallback path can behave differently than intended.
  - Suggested validation: test campaigns with only offers, only collection membership, overlapping offers, and empty collections.
  - Priority: must
  - Confidence: high

- [ ] Validate PDP banner winner selection and copy or media fallback behavior
  - Production outcome: PDP banners consistently choose the intended campaign and render the intended body, image, and link.
  - Why needed: winner selection now depends on earliest end date, offer membership, and multiple fallback layers; docs already drift from code on image fallback.
  - Current state: the banner logic is implemented and rich, but it is not proven against real products with multiple matching campaigns.
  - Files likely involved: `snippets/scs-banner-content.liquid`, `snippets/scs-campaign-url.liquid`, `docs/sales-campaign-system.md`
  - Risk if skipped: shoppers can see the wrong campaign, incorrect image links, or missing banners on products that should be promoted.
  - Suggested validation: test products that match multiple campaigns through collection membership, explicit offers, and open-ended campaigns.
  - Priority: must
  - Confidence: high

- [ ] Run theme-editor validation for the campaign metaobject template and PDP banner block
  - Production outcome: section and block controls, static block trees, and editor outlines behave correctly on campaign pages and PDPs.
  - Why needed: `templates/metaobject/sales_campaigns.json` seeds static blocks and `templates/product.json` inserts a new block into an editor-managed tree.
  - Current state: JSON is diagnostics-clean, but theme-editor behavior is not captured in the branch scope.
  - Files likely involved: `templates/metaobject/sales_campaigns.json`, `templates/product.json`, `blocks/scs-product-sale-banner.liquid`, `sections/scs-sales-campaign.liquid`
  - Risk if skipped: editor selection, drag-drop expectations, or block settings can fail silently.
  - Suggested validation: open both templates in the theme editor, verify block outlines and settings, and confirm static block trees render as expected.
  - Priority: must
  - Confidence: medium

- [ ] Run accessibility QA on index, detail, and PDP surfaces
  - Production outcome: SCS pages and banners are keyboard-usable, correctly labelled, and structurally consistent.
  - Why needed: SCS introduces new cards, grouped sections, banners, empty states, and link patterns.
  - Current state: the markup includes good foundational semantics, but no manual accessibility pass is recorded in the branch-modified files.
  - Files likely involved: `sections/scs-sales-index.liquid`, `sections/scs-sales-campaign.liquid`, `snippets/scs-campaign-card.liquid`, `blocks/scs-product-sale-banner.liquid`, `snippets/scs-banner-content.liquid`
  - Risk if skipped: regressions can survive despite syntactically valid Liquid.
  - Suggested validation: verify keyboard order, focus visibility, heading hierarchy, article and list semantics, and image alt output via the shared image snippet.
  - Priority: should
  - Confidence: high

- [ ] Profile repeated SCS rendering paths and optimize if needed
  - Production outcome: the promotions index, campaign detail pages, and PDP banners remain performant with realistic campaign and offer counts.
  - Why needed: index rendering scans all campaigns, grouped detail mode renders offer products eagerly, and PDP banners can loop campaigns, offers, and offered products.
  - Current state: no profiling results are present in the branch-modified file set.
  - Files likely involved: `sections/scs-sales-index.liquid`, `sections/scs-sales-campaign.liquid`, `snippets/scs-banner-content.liquid`
  - Risk if skipped: campaign-heavy periods can introduce storefront latency on high-traffic surfaces.
  - Suggested validation: run `shopify theme profile` or Theme Inspector on the promotions index, a grouped campaign page, and a PDP with multiple matching campaigns.
  - Priority: should
  - Confidence: high

- [ ] Align internal docs with current runtime behavior
  - Production outcome: maintainers can trust branch-local SCS documentation when continuing implementation.
  - Why needed: `docs/sales-campaign-system.md` already conflicts with `snippets/scs-banner-content.liquid` on banner image fallback behavior.
  - Current state: code is ahead of docs.
  - Files likely involved: `docs/sales-campaign-system.md`, `CHANGES.md`, `snippets/scs-banner-content.liquid`
  - Risk if skipped: future agents and developers can reintroduce bugs by fixing code toward stale documentation.
  - Suggested validation: compare each documented contract against current Liquid and JSON before editing.
  - Priority: should
  - Confidence: high

- [ ] Validate English and French parity for live campaign content and seeded page content
  - Production outcome: French shoppers see a fully coherent promotions experience, not only translated UI chrome.
  - Why needed: code-backed locale strings exist, but campaign content and seeded promotions-page content still depend on metaobject translations and merchant content.
  - Current state: EN and FR locale files are in place; live content parity is unknown from the branch-modified file set.
  - Files likely involved: `locales/en.default.json`, `locales/fr.json`, `templates/page.promotions.json`, live `sales_campaigns` and `promo_offers` entries
  - Risk if skipped: the storefront can be partially bilingual on the SCS surfaces.
  - Suggested validation: review English and French storefront routes for campaign cards, empty states, campaign headers, offer copy, and page heading/body content.
  - Priority: should
  - Confidence: medium

- [ ] Run formal validation commands before calling SCS production-ready
  - Production outcome: the branch has explicit validation evidence rather than only code inspection.
  - Why needed: this memory documents implementation state, not a completed QA pass.
  - Current state: `npm run metaobjects:check` was verified during analysis and editor diagnostics are clean; Theme Check, theme dev QA, profiling, and locale allowlist validation are not recorded here.
  - Files likely involved: repo-wide validation targets plus the 19 branch-modified files
  - Risk if skipped: hidden runtime, schema, locale, or performance issues remain uncaught.
  - Suggested validation: run `shopify theme dev -e dev`, `shopify theme check`, `shopify theme profile`, and `python3 .github/scripts/validate_locale_allowlist.py` as applicable.
  - Priority: must
  - Confidence: high

## 9. Production-Readiness Checklist

### Functional correctness

- [x] Shared lifecycle, ended-window, and URL helpers are implemented.
- [x] Index, detail, and PDP banner surfaces all exist in the branch.
- [~] Real campaign permutations have not been manually validated from this branch memory.

### Shopify Liquid and theme compatibility

- [x] The 19 branch-modified files are diagnostics-clean in the editor.
- [~] Static block and template wiring is present for campaign pages and PDPs.
- [ ] `shopify theme check` execution is not recorded in this memory.

### Metaobject, metafield, and data assumptions

- [x] `sales_campaigns` and `promo_offers` exported definitions were verified current with `npm run metaobjects:check`.
- [x] SCS code relies on documented `sales_campaigns` and `promo_offers` fields rather than invented keys.
- [~] Live content population and translation completeness are not proven by the branch-modified file set.

### Campaign lifecycle and visibility

- [x] Lifecycle classification is centralized.
- [x] Ended-window logic is centralized.
- [~] Real date-boundary behavior and timezone expectations still need storefront QA.

### Campaign priority and ordering

- [x] Index ordering by live bucket, `sale_list_priority`, end date, and handle is implemented.
- [x] Blank `sale_list_priority` is normalized to `10`.
- [~] PDP campaign priority intentionally ignores `banner_priority` and uses earliest end date; real-data behavior still needs validation.

### Sales index

- [x] Promotions index page and section are wired.
- [x] Empty-state rendering exists.
- [~] Index performance with many campaigns is unprofiled.
- [~] `templates/page.promotions.json` still contains a stale `campaigns_per_page` setting.

### Campaign detail page

- [x] Campaign detail page and metaobject template are wired.
- [x] Grouped, ungrouped, empty, and unavailable branches exist.
- [~] Grouped and ungrouped editor and storefront behavior still need full QA.

### PDP and banner integration

- [x] PDP banner block is wired into `templates/product.json`.
- [x] Banner eligibility is limited to live campaigns.
- [~] Winner selection, media fallback, and route fallback still need live-data validation.

### Theme editor compatibility

- [x] SCS surfaces expose schema-backed settings.
- [~] Metaobject template static block behavior needs theme-editor confirmation.
- [~] Some campaign detail settings are mode-specific or need runtime verification.

### Accessibility

- [x] Cards use `article` semantics and headings.
- [x] Group sections use `aria-labelledby`.
- [~] Manual accessibility QA is not recorded.

### Keyboard, focus, and link semantics

- [x] Campaign titles are the primary links.
- [x] Empty and unavailable states remain real content in the DOM.
- [~] Keyboard and focus behavior still need manual verification on real pages.

### Heading hierarchy

- [x] The index renders an `h1` when a heading is configured.
- [x] Campaign detail pages render campaign title as `h1` and group titles as `h2`.
- [~] Full-page heading hierarchy with surrounding header and product templates still needs manual review.

### Image alt text

- [~] Campaign, offer, and banner images use the shared image snippet.
- [?] Final alt text output depends on image data and the shared image implementation outside branch scope.

### Empty states

- [x] Index no-campaigns state is implemented.
- [x] Detail unavailable and no-products states are implemented.
- [~] `no_collection` copy exists but is not currently wired by the changed Liquid files.

### English and French parity

- [x] Code-backed SCS storefront strings exist in English and French.
- [x] SCS schema labels exist in English and French.
- [~] Live campaign content and seeded page content parity still need storefront validation.

### SEO and share URLs

- [x] Campaign URLs resolve through a shared helper.
- [~] `campaign.system.url` fallback behavior is implemented.
- [ ] Storefront route and page-handle assumptions are not fully validated.

### Performance

- [x] Shared helpers centralize repeated logic.
- [ ] No profiling evidence is recorded for index, detail, or PDP banner paths.
- [~] PDP and index loops may be acceptable at current store scale but are not profiled contracts.

### Error handling and fallbacks

- [x] Missing text prevents empty banners from rendering.
- [x] Missing collection data on detail pages falls back to grouped rendering.
- [~] Route fallback, doc drift, and unused locale fallbacks still need cleanup.

### Regression risks

- [x] Shared helpers reduce duplicated logic.
- [~] Shared `product-grid` changes affect non-SCS surfaces too.
- [~] Template JSON changes live in editor-managed files and need cautious maintenance.

### Manual QA scenarios

- [ ] Promotions index with no campaigns
- [ ] Promotions index with active, open-ended, ended, paused, and invalid campaigns mixed together
- [ ] Campaign detail page in grouped mode with overlapping offers
- [ ] Campaign detail page in ungrouped mode with filters and infinite scroll
- [ ] Campaign detail page with no collection and offer-only products
- [ ] PDP with one matching campaign
- [ ] PDP with multiple matching campaigns and different end dates
- [ ] English and French routes for index, detail, and PDP surfaces

### Validation commands and checks available in the repo

- [x] `npm run metaobjects:update` exists to refresh exported metaobject definitions.
- [x] `npm run metaobjects:check` exists to verify exported definitions without writing files.
- [x] `shopify theme dev -e dev` is documented in `README.md`.
- [x] `shopify theme check` is documented in repo instructions and `README.md`.
- [x] `shopify theme profile` is documented in repo instructions for repeated Liquid paths.
- [x] `python3 .github/scripts/validate_locale_allowlist.py` is documented for locale validation.

## 10. Known Unknowns and Validation Needed

### Blocking

- What needs validation: campaign route fallback and page-handle assumptions
  - Why it matters: every campaign card and PDP CTA can depend on the fallback URL when `campaign.system.url` is blank.
  - Current working assumption: the storefront contains a page with handle `promotions`, or `system.url` is reliably populated.
  - Evidence or reason for uncertainty: `snippets/scs-campaign-url.liquid` hardcodes `/pages/promotions/<handle>` and the template name alone does not prove the page handle.
  - Recommended validation step: verify actual campaign `system.url` values in the store and manually open fallback URLs in the dev theme.
  - Files likely involved: `snippets/scs-campaign-url.liquid`, `templates/page.promotions.json`

- What needs validation: theme-editor behavior of the `sales_campaigns` metaobject template block tree
  - Why it matters: grouped and ungrouped campaign detail rendering depends on static `filters` and `_product-card` infrastructure seeded in JSON.
  - Current working assumption: the current template shape is sufficient for runtime and editor behavior.
  - Evidence or reason for uncertainty: `templates/metaobject/sales_campaigns.json` seeds static blocks in a way that is slightly atypical and deserves editor confirmation.
  - Recommended validation step: open a campaign metaobject page in the theme editor and verify static block outlines, settings, and storefront rendering.
  - Files likely involved: `templates/metaobject/sales_campaigns.json`, `sections/scs-sales-campaign.liquid`

### High

- What needs validation: lifecycle and ended-window behavior at real date boundaries
  - Why it matters: visibility rules now govern the index and detail page centrally.
  - Current working assumption: the helper math matches business intent.
  - Evidence or reason for uncertainty: this memory inspects code and current docs, not live clock-bound behavior.
  - Recommended validation step: test campaigns in each lifecycle state before and after start and end thresholds.
  - Files likely involved: `snippets/scs-campaign-lifecycle.liquid`, `snippets/scs-campaign-ended-window.liquid`, `sections/scs-sales-index.liquid`, `sections/scs-sales-campaign.liquid`

- What needs validation: PDP banner winner selection with multiple matching campaigns
  - Why it matters: PDPs surface one winning campaign only.
  - Current working assumption: earliest end date is the intended winner rule.
  - Evidence or reason for uncertainty: the branch-modified file set does not include live product-campaign scenarios that prove the rule against business intent.
  - Recommended validation step: test products that match multiple campaigns through collections and offers with different end dates.
  - Files likely involved: `snippets/scs-banner-content.liquid`

- What needs validation: stale `campaigns_per_page` state in `templates/page.promotions.json`
  - Why it matters: orphaned editor settings confuse maintainers and merchants.
  - Current working assumption: the setting is leftover drift from a removed pagination design.
  - Evidence or reason for uncertainty: the section schema contains no such setting and the index is explicitly non-paginated.
  - Recommended validation step: inspect the page template in the theme editor and reconcile the JSON with the section schema in one deliberate change.
  - Files likely involved: `templates/page.promotions.json`, `sections/scs-sales-index.liquid`

- What needs validation: campaign detail padding and mode-specific settings behavior
  - Why it matters: dead or misleading controls make the editor contract unreliable.
  - Current working assumption: some settings may only work in ungrouped mode and grouped-header inline padding may be ineffective.
  - Evidence or reason for uncertainty: header CSS references inline-padding variables that are not clearly set on the grouped header wrapper.
  - Recommended validation step: toggle those settings in grouped and ungrouped mode and compare rendered output.
  - Files likely involved: `sections/scs-sales-campaign.liquid`

### Medium

- What needs validation: documentation alignment for banner image fallback behavior
  - Why it matters: future maintainers need one accurate runtime contract.
  - Current working assumption: code is correct and docs are stale.
  - Evidence or reason for uncertainty: `docs/sales-campaign-system.md` says the PDP banner does not fall back to `campaign.sale_image`, while `snippets/scs-banner-content.liquid` does.
  - Recommended validation step: treat code as source of truth, then update docs to match confirmed runtime behavior.
  - Files likely involved: `docs/sales-campaign-system.md`, `snippets/scs-banner-content.liquid`

- What needs validation: English and French parity of merchant-authored promotions content
  - Why it matters: locale-backed chrome is only part of the shopper experience.
  - Current working assumption: code-backed strings are bilingual, but live campaign and page content may still be partially untranslated.
  - Evidence or reason for uncertainty: locale files are updated, but live metaobject content and page settings are not part of the branch-modified file set.
  - Recommended validation step: review index, detail, and PDP surfaces on English and French routes with translated campaign data.
  - Files likely involved: `locales/en.default.json`, `locales/fr.json`, `templates/page.promotions.json`, live `sales_campaigns` entries

- What needs validation: performance of index, grouped detail, and PDP banner paths
  - Why it matters: SCS loops can grow with campaign volume.
  - Current working assumption: current store scale may keep the feature acceptable, but the contract is not yet profiled.
  - Evidence or reason for uncertainty: no profiling output is present in the branch-modified file set.
  - Recommended validation step: profile the promotions index, one grouped campaign page, and a PDP with multiple matching campaigns.
  - Files likely involved: `sections/scs-sales-index.liquid`, `sections/scs-sales-campaign.liquid`, `snippets/scs-banner-content.liquid`

### Low

- What needs validation: unused locale branches and fallback messages
  - Why it matters: dead locale keys create maintenance noise.
  - Current working assumption: `banner`, `detail`, and `empty.no_collection` are placeholders or leftovers rather than active runtime copy.
  - Evidence or reason for uncertainty: the changed Liquid files do not reference those keys.
  - Recommended validation step: search for actual references before removing or repurposing them.
  - Files likely involved: `locales/en.default.json`, `locales/fr.json`

- What needs validation: accuracy of the SCS size estimate in `CHANGES.md`
  - Why it matters: release notes and internal summaries should not understate the branch footprint.
  - Current working assumption: the changelog estimate predates later SCS commits.
  - Evidence or reason for uncertainty: the branch diff is materially larger than the estimate recorded in `CHANGES.md`.
  - Recommended validation step: regenerate or manually update the estimate when SCS reporting is refreshed.
  - Files likely involved: `CHANGES.md`

## 11. Risks and Implementation Cautions

- Preserve the six-state lifecycle vocabulary exactly unless a deliberate cross-surface contract change is intended.
- Preserve the ended-window helper semantics unless business requirements explicitly change post-end visibility.
- Preserve `sale_list_priority` as the index ordering key and do not silently repurpose `banner_priority` without updating docs and runtime behavior together.
- Preserve the earliest-ending winner rule on PDP banners unless a deliberate banner-priority redesign is requested.
- Preserve the grouped-mode first-match-wins de-duplication rule unless a deliberate overlapping-offer strategy is approved.
- Preserve the forced grouped fallback when ungrouped mode is selected without a collection unless a replacement no-collection contract is designed.
- Do not rename static IDs such as `filters` and `product-card` in `templates/metaobject/sales_campaigns.json` without synchronizing every related Liquid and JSON contract.
- Do not assume `templates/page.promotions.json` guarantees the storefront page handle `promotions`; validate routing before relying on the fallback URL.
- Do not trust `docs/sales-campaign-system.md` over runtime code when the two disagree.
- Do not assume every campaign-detail setting affects both grouped and ungrouped modes.
- Do not widen SCS scope into unrelated theme files when continuing this branch; record external dependencies explicitly instead.
- Treat `snippets/product-grid.liquid` as shared infrastructure. Changes there can affect non-SCS collection and search flows.
- Keep future JSON changes minimal and preserve stable editor-managed IDs and block order wherever possible.
- Keep English and French locale files aligned for any new code-backed SCS copy.
- Validate campaign cards, detail pages, and PDP banners in the storefront and theme editor before summarizing work as complete.

## 12. Recommended Next Work Sessions

### Session 1: Route and template contract cleanup

- Goal: validate campaign URLs and reconcile the stale promotions template setting.
- Files likely involved: `snippets/scs-campaign-url.liquid`, `templates/page.promotions.json`, `docs/sales-campaign-system.md`
- Acceptance criteria: fallback URLs resolve correctly on the dev theme; no orphan `campaigns_per_page` setting remains or the setting is deliberately restored with matching runtime support.
- Risks: careless route changes can break existing campaign links.
- Mode: implementation
- Recommended prompt style: validate and fix SCS routing and promotions-template drift without changing unrelated lifecycle or banner logic.

### Session 2: Campaign detail settings and editor QA

- Goal: verify grouped and ungrouped settings behavior and repair any dead or misleading controls.
- Files likely involved: `sections/scs-sales-campaign.liquid`, `templates/metaobject/sales_campaigns.json`
- Acceptance criteria: grouped and ungrouped modes behave as documented in the theme editor; padding and layout controls have clear runtime effects.
- Risks: changing section settings can affect both grouped and ungrouped layouts.
- Mode: implementation
- Recommended prompt style: focus only on campaign detail settings and theme-editor behavior; preserve the grouped and ungrouped rendering contract unless validation proves it wrong.

### Session 3: Lifecycle and PDP banner validation pass

- Goal: prove live-data behavior for lifecycle states, ended-window visibility, and PDP winner selection.
- Files likely involved: `snippets/scs-campaign-lifecycle.liquid`, `snippets/scs-campaign-ended-window.liquid`, `snippets/scs-banner-content.liquid`, `sections/scs-sales-index.liquid`, `sections/scs-sales-campaign.liquid`
- Acceptance criteria: a test matrix covers active, open-ended, ended, paused, not-started, invalid, and overlapping-campaign scenarios.
- Risks: real data may reveal business-rule mismatches rather than code bugs.
- Mode: planning-only before implementation, then validation or implementation as needed
- Recommended prompt style: produce a strict QA matrix for SCS lifecycle and banner behavior, then implement only the confirmed fixes.

### Session 4: Accessibility and storefront QA hardening

- Goal: verify keyboard flow, focus, headings, image output, empty states, and English/French parity.
- Files likely involved: `sections/scs-sales-index.liquid`, `sections/scs-sales-campaign.liquid`, `snippets/scs-campaign-card.liquid`, `blocks/scs-product-sale-banner.liquid`, `snippets/scs-banner-content.liquid`, locale files
- Acceptance criteria: index, detail, and PDP surfaces pass a manual accessibility walkthrough in English and French.
- Risks: fixes may touch shared card, image, or grid patterns.
- Mode: implementation
- Recommended prompt style: keep the scope on SCS accessibility and bilingual storefront behavior; preserve existing lifecycle and routing contracts.

### Session 5: Performance pass on repeated SCS paths

- Goal: profile and optimize the promotions index, grouped campaign pages, and PDP banner loops if the measured cost is meaningful.
- Files likely involved: `sections/scs-sales-index.liquid`, `sections/scs-sales-campaign.liquid`, `snippets/scs-banner-content.liquid`
- Acceptance criteria: profiling evidence exists and any optimization preserves documented SCS behavior.
- Risks: premature optimization can break selection logic or grouped rendering.
- Mode: planning-only before implementation
- Recommended prompt style: run a performance-focused analysis on SCS repeated Liquid paths and recommend only contract-preserving optimizations.

### Session 6: Documentation and production-readiness wrap-up

- Goal: align docs with verified runtime behavior and record final validation evidence.
- Files likely involved: `docs/sales-campaign-system.md`, `CHANGES.md`, `scs-development-memory.md`
- Acceptance criteria: docs match code, unresolved risks are updated, and final validation results are recorded for the next handoff.
- Risks: stale summaries can outlive validated code if the wrap-up is skipped.
- Mode: implementation
- Recommended prompt style: update SCS documentation only after runtime behavior has been validated and avoid editing production Liquid unless the validation proved a bug.

## 13. Agent Operating Notes

- Start every future SCS session by reading this file and the current repo instructions.
- Compare future work against `dev` with Git when you need updated branch scope.
- Preserve the documented SCS contracts unless the user explicitly asks to change them.
- Verify current code before acting on older notes, changelog summaries, or stale documentation.
- Use Shopify Dev MCP or Shopify AI Toolkit behavior guidance for Shopify Liquid, theme, metaobject, storefront, and theme-editor questions when current platform behavior matters.
- Use Context7 only when current dependency, framework, API, or CLI documentation is needed.
- Keep future changes minimal, branch-scoped, and contract-preserving.
- Keep future prompts scoped to one work session at a time.
- Before editing metaobject-sensitive code in a normal implementation session, refresh or verify the exported definitions according to repo policy. Use `npm run metaobjects:update` when file writes are allowed, or `npm run metaobjects:check` when the session is intentionally read-only.
- Do not broaden the main analysis to unrelated theme files. Record external dependencies explicitly instead.
- Validate Liquid, JSON, locales, schema, accessibility, and theme-editor behavior before summarizing completion.
- Treat `templates/*.json` files as editor-managed state and keep diffs small.
- Treat `snippets/product-grid.liquid` as shared infrastructure, not an SCS-only helper.
- When documentation and code disagree, trust the current code first, then update the docs deliberately.

## 14. Appendix: Branch Facts

- Current branch: `sales-campaign-system`
- Base branch: `dev`
- Merge base: `05a29f0b6ad53e2b3e3e6af9ac8efe6773188df0`

Unique commits:

- `a4cb3d2a5caed1a26f24c0ee8025b0503da6e3ee` Start work on sales-campaign-system
- `f202706a9652128f9126f20de28d1cd76db9da94` Refactor campaign URL handling and add campaign URL snippet
- `818f6352b44a83fc8a60986adc1d7d8dcc6cb6a6` Fix sales campaign detail rendering and image URL handling
- `95f30e8bca2a8a04a1b6c67bec0d856666b5140e` Add French translations for promotional campaign sections in schema
- `c98d01b998a993554ad10555958fb256126d9e7c` Update Sales Campaign System documentation and improve PDP banner logic
- `fac0d7d11293f12e8cbdf846fd9c7dadf4c3f2ec` Adjust maximum products per page limit in sales campaign settings
- `ef27c481df376b329c28303b7074430a7d024e74` Add campaign lifecycle classification and improve visibility handling in sales campaigns
- `980e6f7dac443125cf7af613ba8dfb9a7f686b70` Refactor sales campaign rendering logic and remove pagination settings
- `04012b18dc4da92c4cdb6d1ddf91724cdb6c07ae` Enhance sales campaign lifecycle management and visibility handling; implement ended-window checks and sorting by sale_list_priority
- `9516d893f56fa5d0a3fb3f60ddd6d1ee3041d721` Rename sales page template to promotions
- `e154e0d2ef02f077547bc4db04bec160f08dc4e4` Enhance sales campaign display and functionality; add no promotions message, improve accessibility with ARIA attributes, and refactor banner content rendering

Branch-modified files:

- `CHANGES.md`
- `blocks/scs-product-sale-banner.liquid`
- `docs/sales-campaign-system.md`
- `locales/en.default.json`
- `locales/en.default.schema.json`
- `locales/fr.json`
- `locales/fr.schema.json`
- `sections/scs-sales-campaign.liquid`
- `sections/scs-sales-index.liquid`
- `snippets/product-grid.liquid`
- `snippets/scs-banner-content.liquid`
- `snippets/scs-campaign-card.liquid`
- `snippets/scs-campaign-ended-window.liquid`
- `snippets/scs-campaign-lifecycle.liquid`
- `snippets/scs-campaign-url.liquid`
- `snippets/scs-richtext.liquid`
- `templates/metaobject/sales_campaigns.json`
- `templates/page.promotions.json`
- `templates/product.json`

Commands used to derive the branch facts:

- `git rev-parse --abbrev-ref HEAD`
- `git merge-base HEAD dev`
- `git log --reverse --format='%H %s' dev..HEAD`
- `mb=$(git merge-base HEAD dev) && git diff --name-only "$mb" HEAD`
