# Sales Campaigns Production App Plan

## Document control

- **File purpose:** Canonical, self-contained implementation specification for the production `sales-campaign-system` Shopify app.
- **Audience:** Future implementation agents and human developers.
- **Distribution model:** Public unlisted Shopify App Store app.
- **Target merchant plan:** Shopify Grow.
- **Primary admin architecture:** Embedded admin app using Shopify's current React Router framework-mode template, App Bridge, and the current Shopify-recommended admin UI layer.
- **Core storefront target:** Online Store 2.0 themes.
- **Last updated:** 2026-05-08.
- **Status:** Implementation-ready plan, with explicit platform gates called out where Shopify approval is required.

### Self-contained rule

This file must be sufficient to implement the app even if no other repository documentation is available.

Future implementation work may use Shopify Dev MCP and Context7 for:

- current GraphQL syntax
- current TOML syntax
- current Function API details
- current theme extension limits and review guidance

Future implementation work must **not** depend on any other repo planning file to understand the product contract, data model, route model, storefront behavior, validation rules, or rollout sequence. If this file conflicts with older notes, this file wins.

### How this file must be maintained

1. Preserve all accepted product requirements unless a later edit explicitly supersedes them.
2. Update this file in-place instead of creating side plans.
3. Keep a clear distinction between:
   - required product behavior
   - implementation choices
   - platform constraints
   - open gates and approvals
4. When a platform fact changes, update the affected section immediately.
5. Do not remove exact behavioral rules just because the production implementation uses different APIs than the prototype.

### Decision legend

- **Accepted:** Required and intentionally chosen.
- **Conditional:** Accepted only if a named gate or approval succeeds.
- **Open gate:** Must be proven before the dependent work can be considered production-ready.
- **Rejected:** Intentionally excluded from v1.

---

## Executive summary

Sales Campaigns is a Shopify app that replaces Gamma's theme-only sales campaign prototype with a portable, production-ready app architecture. The app preserves the prototype's shopper-facing behavior while moving canonical campaign management into app-managed Shopify resources and checkout enforcement into Shopify discount infrastructure.

The app must provide all of the following without requiring merchants to edit theme code:

- a sales index page
- clean campaign detail pages
- a product-page sales banner
- cart gift messaging and best-effort auto-add UX
- checkout-enforced discount behavior
- optional visible price automation with snapshots and rollback
- localization via Shopify translations
- spreadsheet import
- diagnostics, reconciliation, and rollback tooling

The default canonical route model for v1 is:

- sales index page: `/pages/{index_handle}`
- campaign detail page: `/pages/{index_handle}/{campaign_handle}`

The default example is:

- `/pages/promotions`
- `/pages/promotions/spring-tools-sale`

That nested detail model is the default product assumption for v1. If Shopify platform behavior prevents that model from shipping without merchant code edits, the app may fall back only to another clean, path-based route model that still satisfies all non-negotiable requirements. Any such fallback must be documented in this file before it is implemented.

---

## Non-negotiable product requirements

### Merchant setup rules

These are hard requirements:

1. **No merchant code edits.** Merchants must never be asked to open the theme code editor, create or edit Liquid files, paste snippets, or manually edit JSON templates.
2. **Theme editor participation is expected.** Merchants may be asked to place app blocks, enable app embeds, select templates, and configure section or block settings in the theme editor.
3. **Automatic page creation is preferred.** If the platform allows it, onboarding should create the sales index page automatically and assign the correct template.
4. **Merchant-created page flow must also exist.** A merchant may create their own index page and choose the included `page.sales-index` template when the store is using managed template mode.
5. **No query-string identity.** Campaign identity must never depend on `?campaign=`, `?sale=`, `?handle=`, or similar query parameters.
6. **No Shopify Plus dependency in v1.**
7. **No Cart Transform dependency in v1.**
8. **No Checkout UI extension dependency for core behavior.**
9. **No external database as canonical campaign truth.**
10. **No merchant-owned canonical campaign schema.** Canonical campaign resources are app-managed Shopify resources.

### Required shopper-facing outcomes

The shopper-facing contract must include:

- lifecycle-aware campaign visibility
- optional ended-campaign display windows on index and detail pages
- deterministic sales index sorting
- grouped and ungrouped detail rendering
- first-match-wins product de-duplication across offer groups
- a single winning PDP banner campaign per product view
- link stability through canonical clean URLs
- accessible markup and empty/unavailable states

### Required merchant-facing outcomes

The merchant experience must include:

- embedded onboarding
- campaign management
- offer management
- routing and page setup
- theme setup guidance
- translation support
- import tooling
- diagnostics and rollback tooling
- clear publish blockers and warnings

### Explicit v1 exclusions

The app must not depend on or require any of the following in v1:

- manual merchant theme code edits
- Shopify Plus
- Checkout UI extensions for core behavior
- Cart Transform
- automated Gift Card API issuance
- automated store credit issuance
- app proxy URLs as canonical shopper-facing campaign pages
- URL query parameters for campaign identity

---

## Platform constraints and stage gates

### Confirmed platform constraints

The implementation must respect all of the following:

1. **Public-app Function requirement for Grow:** Production Function-based behavior on Grow must ship through the reviewed public unlisted app path. Do not treat a custom-app install as production-equivalent for Grow.
2. **Theme app extensions do not ship full templates or sections:** They can ship app blocks, app embeds, assets, snippets, and locale files, but not full `templates/*.json` or `sections/*.liquid` files.
3. **Managed theme-file writes are approval-sensitive:** If the app writes theme files directly, it will require the appropriate theme scopes and any Shopify approval/exemption required for public-app theme file modification.
4. **`onlineStore` metaobject capability is not assumed declarative:** The production implementation must verify and, if necessary, provision storefront-facing metaobject capabilities through Admin GraphQL rather than assuming TOML alone is sufficient.
5. **Checkout-step Checkout UI extensions are out of scope on Grow:** They are not the foundation for this product.
6. **Cart Transform line update/update operations are not a viable v1 dependency on Grow:** Gift and price logic must not rely on them.
7. **Discount scale must be bounded:** Shopify stores have a limit on active Function-backed discounts, so the app must not create one Function discount per campaign as its primary scale model.

### Stage gates

The following gates must be treated as real delivery gates, not footnotes:

| Gate | Status | What must be proven |
|---|---|---|
| Public app review path for Grow Function features | Accepted | Production install works through the reviewed public unlisted app path |
| Managed theme support approval | Open gate | Theme-file installation/update/rollback is allowed for the intended public-app review path |
| Nested detail route viability | Open gate | Default nested route model can be delivered without merchant code edits |
| Campaign detail storefront resource model | Open gate | The chosen renderable campaign resource can produce the intended clean URLs and template wiring |

### Consequence of a failed gate

If managed theme support approval or nested detail route viability fails, this plan must be revised before the dependent work is considered production-ready. The app may still ship a reduced baseline experience, but it may not be called feature-complete against this document until the dependency is resolved or the requirement is formally changed here.

---

## Delivery modes

### Mode A — Universal theme-editor mode

This mode must always exist.

In this mode, the app provides:

- theme app extension assets
- app blocks for PDP and cart surfaces
- an app embed for cart automation UX
- an index rendering option that can be placed through the theme editor where compatible

This mode supports:

- PDP banner
- cart gift messaging
- cart auto-add enhancement
- partial or fallback index rendering

This mode is the guaranteed baseline no-code-edit integration.

### Mode B — Managed template mode

This is the preferred full-contract mode and is **Conditional** on managed theme support approval.

In this mode, the app installs and versions a small managed theme support package that contains the files needed to deliver:

- `page.sales-index.json`
- a managed sales-index section
- the campaign detail template for the storefront campaign resource type
- a managed campaign detail section
- helper snippets shared by those surfaces

Merchants still do not edit code. The app installs, updates, verifies, and, when possible, rolls back its managed theme package.

### GA rule

The full Gamma-style product contract described in this file assumes Mode B is available. If Mode B is not approved, GA scope must be explicitly revised in this file.

---

## Recommended implementation topology

The implementation should use a standard embedded Shopify app layout with a clear separation between admin UI, domain logic, Shopify API adapters, extension code, and background jobs.

### Recommended top-level structure

```text
/app
  /routes
  /components
  /domain
  /services
  /graphql
  /jobs
  /webhooks
  /lib
/extensions
  /sales-campaigns-theme
  /sales-campaigns-discount
/tests
  /unit
  /integration
  /e2e
```

### Required domain modules

At minimum, the app should have domain modules for:

- lifecycle classification
- ended-window evaluation
- campaign index sorting
- canonical URL generation
- PDP winner selection
- cart gift entitlement calculation
- volume tier selection
- import validation
- diagnostics classification
- rollback planning

### Required service modules

At minimum, the app should have service modules for:

- auth/session management
- capability verification
- campaign CRUD
- offer CRUD
- route config management
- page creation/adoption
- theme support package installation/update/rollback
- theme extension verification
- translations
- discount runtime compilation
- price automation
- imports
- diagnostics
- background jobs

---

## Canonical domain model

The app must separate **public storefront campaign content** from **private operational configuration**.

### Ownership map

| Concern | Canonical resource |
|---|---|
| Sales index shell page | Shopify Page |
| Public campaign page resource | App-managed storefront campaign resource |
| Campaign public content and lifecycle | App-managed campaign metaobject |
| Offer public content and grouping | App-managed offer metaobject |
| Route settings | App-managed route config resource |
| Gift rules | App-managed rule resource |
| Volume rules | App-managed rule resource |
| Price automation rules | App-managed rule resource |
| Future reward intent | App-managed rule resource |
| Discount execution | Shopify discount nodes + owner metafields |
| Images | Shopify Files |
| Localized content | Shopify translations |
| Jobs, audits, idempotency, rollback records | External backend operational storage only |

### Public campaign resource

The logical campaign entity must preserve the following prototype field semantics.

If the final app-owned type handle differs because of Shopify app-owned naming rules, the implementation must map it through a constant. The **logical** campaign type is still `sales_campaigns` for behavior and template planning.

The campaign resource must be:

- publishable
- translatable
- renderable
- online-store-capable

#### Campaign fields

| Field key | Type | Required | Meaning |
|---|---|---:|---|
| `sale_name` | single-line text | Yes | Public campaign title; display name key |
| `sale_collection` | collection reference | Conditional | Collection used for collection-backed detail rendering and collection membership checks; may be blank for offer-only campaigns |
| `start_date` | date-time | No | Start timestamp for lifecycle evaluation |
| `end_date` | date-time | No | End timestamp for lifecycle evaluation and sorting |
| `sale_paused` | boolean | No | Hard pause override; when true, campaign is paused regardless of dates |
| `banner_text` | rich text | No | Secondary text fallback for detail header and PDP banner |
| `banner_priority` | integer | No | Reserved field; **unused in v1 runtime behavior** |
| `sale_list_text` | rich text | No | Primary descriptive copy for index cards, detail header, and PDP fallback |
| `sale_list_priority` | integer | No | Index sort priority; blank means `10` |
| `sale_image` | image file reference | No | Primary image for index cards, detail header, and PDP fallback |
| `sale_image_url` | URL | No | Link target for campaign image when relevant |
| `offers` | list of offer references | No | Ordered offer group list |
| `system.handle` | system field | Generated | Canonical campaign handle |
| `system.url` | system field | Generated | Canonical storefront URL when storefront capability is configured |

#### Campaign field notes

- `banner_priority` exists in the current data export but is intentionally not used by the prototype storefront logic. Preserve it as reserved for future use; do not quietly start using it in v1.
- `sale_collection` is treated as conditional rather than always-required in this production plan because grouped rendering works without it and the prototype already contains a grouped fallback when no collection is present.
- Campaigns with neither a valid collection nor any offer products must not be publishable.

### Public offer resource

The logical offer type is `promo_offers`.

The offer resource must be:

- publishable
- translatable
- not renderable
- not online-store-capable

#### Offer fields

| Field key | Type | Required | Meaning |
|---|---|---:|---|
| `offer_name` | single-line text | Yes | Public group heading |
| `offer_description` | rich text | No | Group copy and PDP offer-specific body copy |
| `offer_image` | image file reference | No | Group image and PDP offer-specific image |
| `offer_image_link` | URL | No | Optional link target for PDP/banner imagery |
| `products` | list of product references | Yes | Ordered product list for the offer group |
| `system.handle` | system field | Generated | Stable offer handle for grouping attributes |

### Private route config resource

There must be exactly one active route config per shop.

#### Required route config fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `schemaVersion` | integer | Yes | Start at `1` |
| `routeMode` | enum | Yes | `nested_under_index`, `page_level_detail`, or another explicitly supported clean path mode |
| `indexPageHandle` | string | Yes | Default `promotions` |
| `indexPathPattern` | string | Yes | Default `/pages/{index_handle}` |
| `detailPathPattern` | string | Yes | Default `/pages/{index_handle}/{campaign_handle}` |
| `canonicalUrlPolicy` | enum | Yes | Default `system_url_first` |
| `managedIndexPageId` | string/null | No | Shopify Page GID when app-created or adopted |
| `managedThemeSupportEnabled` | boolean | Yes | Whether Mode B is installed for the active theme |
| `managedThemeId` | string/null | No | Active theme GID using the managed package |
| `detailTypeHandle` | string | Yes | Logical campaign storefront type handle |
| `lastVerifiedAt` | datetime | No | Verification timestamp |

#### Default route config payload

```json
{
  "schemaVersion": 1,
  "routeMode": "nested_under_index",
  "indexPageHandle": "promotions",
  "indexPathPattern": "/pages/{index_handle}",
  "detailPathPattern": "/pages/{index_handle}/{campaign_handle}",
  "canonicalUrlPolicy": "system_url_first",
  "managedIndexPageId": null,
  "managedThemeSupportEnabled": false,
  "managedThemeId": null,
  "detailTypeHandle": "sales_campaigns",
  "lastVerifiedAt": null
}
```

### Private rule resources

Private rule resources may be implemented as app-owned metaobjects, app-owned metafields containing structured JSON, or another app-managed Shopify resource model. Regardless of storage model, they must preserve the semantics below.

#### Gift rule fields

| Field | Required | Meaning |
|---|---:|---|
| `id` | Yes | Stable internal rule identifier |
| `campaignId` | Yes | Parent campaign ID |
| `qualifierType` | Yes | `product`, `variant`, `collection`, `campaign_products`, or `cart_subtotal` |
| `qualifierIds` | Conditional | IDs used by qualifier types that need resource references |
| `minimumQuantity` | Conditional | Minimum qualifying quantity |
| `minimumSubtotalMinor` | Conditional | Minimum cart subtotal in minor units |
| `rewardVariantId` | Yes | Gift variant |
| `rewardQuantity` | Yes | Entitled free quantity |
| `maxRewardQuantityPerOrder` | Yes | Hard cap per cart/order |
| `autoAddEnabled` | Yes | Whether storefront embed may attempt auto-add |
| `messageTemplateKey` | No | Message selector for the cart block |
| `status` | Yes | `active` or `inactive` |

#### Volume rule fields

| Field | Required | Meaning |
|---|---:|---|
| `id` | Yes | Stable internal rule identifier |
| `campaignId` | Yes | Parent campaign ID |
| `targetType` | Yes | `product`, `variant`, `collection`, or `campaign_products` |
| `targetIds` | Yes | Target resources |
| `tiers` | Yes | Ordered list of `minimumQuantity`, `discountType`, `discountValue` |
| `stackPolicy` | Yes | `best_only` or another explicitly supported rule |
| `status` | Yes | `active` or `inactive` |

#### Price automation rule fields

| Field | Required | Meaning |
|---|---:|---|
| `id` | Yes | Stable internal rule identifier |
| `campaignId` | Yes | Parent campaign ID |
| `targetVariantIds` | Yes | Variants to mutate |
| `pricingMode` | Yes | `percentage_off`, `fixed_amount_off`, or `set_price` |
| `value` | Yes | Numeric rule value |
| `snapshotId` | No | Associated snapshot record after preview/apply |
| `status` | Yes | `draft`, `approved`, `applied`, `rolled_back`, `errored` |

#### Future reward rule fields

| Field | Required | Meaning |
|---|---:|---|
| `id` | Yes | Stable internal rule identifier |
| `campaignId` | Yes | Parent campaign ID |
| `rewardType` | Yes | `manual_coupon` or `manual_service_credit` in v1 |
| `message` | No | Merchant/internal note |
| `reportCodeTemplate` | No | Export aid |
| `status` | Yes | `active` or `inactive` |

---

## Workflow status model

The app must distinguish **merchant workflow state** from **computed lifecycle state**.

### Workflow state

Each campaign must have a merchant workflow state:

- `draft`
- `published`
- `archived`

### Computed lifecycle state

Each campaign must also have a computed lifecycle state derived from pause + dates:

- `paused`
- `invalid_date`
- `not_started`
- `ended`
- `open_ended`
- `active`

### Visibility rule

A campaign may only render on storefront surfaces when:

- workflow state is `published`, and
- the surface-specific lifecycle rules allow it

The admin UI may label `published + not_started` as **Scheduled**, but the underlying workflow state is still `published` and the lifecycle remains `not_started`.

---

## Route and page model

### Default canonical model

The default model for v1 is:

- index page: `/pages/{index_handle}`
- detail page: `/pages/{index_handle}/{campaign_handle}`

Default `index_handle`: `promotions`

### Allowed fallback models

Only the following clean-path fallback families are allowed if the default cannot ship without code edits:

- `/pages/{campaign_handle}`
- another Shopify-doc-backed path pattern that remains path-based and stable

### Disallowed route models

These must not be used as canonical storefront URLs:

- `/apps/...`
- `/a/...`
- app proxy URLs
- query-string routes such as `?campaign=foo`

### Page creation and adoption rules

On onboarding, the app must:

1. verify the shop's active theme and whether managed theme support is installed
2. load the current route config or create a default one
3. look for an existing Shopify Page at `indexPageHandle`
4. if missing, offer to create it automatically
5. if present, offer to adopt it rather than overwrite it
6. when Mode B is enabled, assign `templateSuffix = sales-index`
7. store the adopted or created page ID in route config

The app must not silently overwrite merchant-authored page content on an existing page.

### Canonical URL helper contract

The URL helper must resolve campaign URLs in this priority order:

1. `campaign.system.url` when present and valid
2. configured route builder output from `detailPathPattern`
3. non-canonical fallback only for internal diagnostics

The production helper must **not** hardcode `promotions` into its fallback. The prototype did that; the production app must not.

### Handle changes

If the index handle or campaign handle changes after publication, the app must:

- warn the merchant before save
- update all internally generated canonical links
- create redirects when the chosen route strategy supports them
- run diagnostics immediately after the change

---

## Managed theme package inventory

This section defines the full storefront support package the app must deliver.

### Theme app extension package

The theme app extension must include at minimum:

- `scs-sales-index` app block for universal mode
- `scs-product-sale-banner` app block
- `scs-cart-gift-message` app block
- `scs-cart-automation` app embed
- shared CSS and JavaScript assets required by those surfaces
- extension locale files for English and French
- schema locale files for English and French

### Managed theme support package

Mode B must install and version the following managed files:

- `templates/page.sales-index.json`
- `sections/scs-sales-index.liquid`
- `templates/metaobject/sales_campaigns.json` if the logical campaign type handle remains `sales_campaigns`; otherwise `templates/metaobject/{actual_type}.json`
- `sections/scs-sales-campaign.liquid`
- `snippets/scs-campaign-lifecycle.liquid`
- `snippets/scs-campaign-ended-window.liquid`
- `snippets/scs-campaign-url.liquid`
- `snippets/scs-campaign-card.liquid`
- `snippets/scs-richtext.liquid`
- any additional helper snippets required by the managed sections

### Theme package ownership rules

The app must:

- touch only app-owned managed files
- record file paths, checksums, and app version for each managed file
- capture prior contents before modifying an existing file
- restore prior contents on rollback when safe
- never overwrite unrelated merchant customizations silently

### Theme package audit record

For each install or update, store:

- shop ID
- theme ID
- theme role at time of change
- app version
- managed file list
- pre-change checksum list
- post-change checksum list
- prior file contents or `didNotExist`
- installed timestamp
- operator (`merchant`, `support`, or `automation`)

---

## Exact storefront behavior specification

This section is normative. It defines the behavior that must be preserved regardless of how the production app is implemented.

### Lifecycle classification algorithm

Use the following exact precedence:

```text
Input: campaign, now

If campaign is blank:
  lifecycle = invalid_date
Else if sale_paused == true:
  lifecycle = paused
Else:
  parse start_date if present
  parse end_date if present

  If both start_date and end_date exist and end_date < start_date:
    lifecycle = invalid_date
  Else if start_date exists and start_date > now:
    lifecycle = not_started
  Else if end_date exists and end_date < now:
    lifecycle = ended
  Else if end_date does not exist:
    lifecycle = open_ended
  Else:
    lifecycle = active
```

### Ended-window algorithm

Ended-window eligibility exists only for index and detail surfaces. It does **not** apply to the PDP banner.

```text
Input: campaign, now

If lifecycle != ended:
  return false

If start_date is blank or end_date is blank:
  return false

If end_date < start_date:
  return false

campaign_runtime = end_date - start_date
ended_window_end = end_date + campaign_runtime

Return now <= ended_window_end
```

### Surface visibility rules

#### Index page

Eligible campaigns:

- `active`
- `open_ended`
- `ended` only when `show_ended_campaigns == true` **and** the campaign is inside its ended window

Ineligible campaigns:

- `paused`
- `invalid_date`
- `not_started`
- `ended` outside its ended window

#### Detail page

Renderable campaigns:

- `active`
- `open_ended`
- `ended` only when inside its ended window

Non-renderable campaigns:

- `paused`
- `invalid_date`
- `not_started`
- `ended` outside its ended window

#### PDP banner

Eligible campaigns:

- `active`
- `open_ended`

Ineligible campaigns:

- `paused`
- `invalid_date`
- `not_started`
- all `ended` campaigns, including those still inside their ended window

---

## Sales index contract

### Required settings

The managed sales-index section must expose exactly these meaningful settings:

| Setting | Type | Default |
|---|---|---|
| `heading` | text | `Promotions` |
| `body` | rich text | blank |
| `show_ended_campaigns` | checkbox | `false` |
| `color_scheme` | color scheme | `scheme-1` |
| `padding-block-start` | range | `48` |
| `padding-block-end` | range | `48` |

Do **not** reintroduce the stale `campaigns_per_page` setting from the prototype `page.promotions.json`; it no longer affects runtime behavior and must not be shipped in the production template.

### Index selection and sorting algorithm

For every published campaign:

1. compute lifecycle
2. decide whether the campaign is renderable on the index according to the index visibility rules
3. assign `bucket_rank = 0` for live campaigns (`active`, `open_ended`)
4. assign `bucket_rank = 1` for ended-window campaigns that are still allowed to show
5. assign `priority = sale_list_priority` or `10` when blank
6. assign `end_ts = campaign end timestamp` or far-future sentinel when blank
7. sort by the tuple:
   - `bucket_rank` ascending
   - `priority` ascending
   - `end_ts` ascending
   - `campaign handle` ascending

The prototype achieved this by composing natural-sort records. The production app may use any implementation that produces the exact same ordering semantics.

### Index card rendering contract

Each campaign card must render:

- title: `sale_name`
- link: canonical campaign URL
- image: `sale_image` if present, otherwise the first `offer_image` found in offer order
- body: `sale_list_text` if present, otherwise `banner_text` if present
- CTA text: translation key `scs.storefront.index.view_sale`

If no card image resolves, the card renders text-only.

### Index empty state

If zero campaigns are eligible after filtering, render the translation key `scs.storefront.empty.no_campaigns`.

### Accessibility contract

The index must render:

- one list/grid container with `role="list"`
- one list item per campaign
- one heading per card
- clickable title link to the canonical URL

---

## Campaign detail contract

### Required settings

The managed campaign detail section must expose exactly these runtime-backed settings:

| Setting | Type | Default |
|---|---|---|
| `show_image` | checkbox | `true` |
| `hero_image_height` | range | `180` |
| `group_by_offer` | checkbox | `true` |
| `products_per_page` | range | `20` |
| `color_scheme` | color scheme | `scheme-1` |
| `layout_type` | select (`grid`,`organic`) | `grid` |
| `product_card_size` | select | `medium` |
| `mobile_product_card_size` | select (`small`,`large`) | `small` |
| `product_grid_width` | select (`centered`,`full-width`) | `centered` |
| `full_width_on_mobile` | checkbox | `true` |
| `enable_infinite_scroll` | checkbox | `true` |
| `columns_gap_horizontal` | range | `16` |
| `columns_gap_vertical` | range | `16` |
| `padding-inline-start` | range | `0` |
| `padding-inline-end` | range | `0` |
| `padding-block-start` | range | `48` |
| `padding-block-end` | range | `48` |

### Detail page header contract

When the campaign is renderable, the detail page header must render:

- title: `sale_name`
- optional image: `sale_image` when `show_image == true`
- optional image link: `sale_image_url`
- body copy: `sale_list_text` if present, otherwise `banner_text`

The header lead area is shown when at least one of the following is true:

- `show_image == true` and `sale_image` exists
- descriptive copy exists

### Detail page no-products evaluation

Before rendering products, calculate:

- `has_offer_products`: at least one offer has at least one product
- `has_collection_products`: `sale_collection` exists and contains products
- `has_any_products = has_offer_products OR has_collection_products`

If the campaign is renderable but `has_any_products == false`, render the translation key `scs.storefront.empty.no_products`.

### Grouped vs ungrouped mode

`group_by_offer` is a theme setting, not a campaign field.

#### Forced grouped fallback

If `group_by_offer == false` but `sale_collection` is blank, the runtime must force grouped mode. This is deliberate behavior and must be preserved.

#### Grouped mode algorithm

Grouped mode must behave exactly as follows:

1. Start with `seen_product_ids = empty set`.
2. Iterate offers in stored order.
3. For each offer, iterate `offer.products` in stored order.
4. For each product:
   - if not in `seen_product_ids`, render it in that offer group and add it to the set
   - if already seen, skip it
5. Only render an offer group if at least one unique product was added to it.
6. Group heading is `offer_name`.
7. Group image is `offer_image` if present.
8. Group body is `offer_description` if present.
9. After all offer groups, if `sale_collection` exists, iterate the collection products as a remainder set.
10. Any collection product not in `seen_product_ids` must render in a catch-all group.
11. The catch-all group heading is translation key `scs.storefront.grouping.other_deals`, **but only if at least one named offer group rendered first**.
12. Pagination applies only to the collection-backed catch-all remainder group.
13. Offer-product groups are **not** paginated.

This means the same product can appear at most once across grouped offer sections and the remainder group.

#### Ungrouped mode algorithm

When ungrouped mode is active and `sale_collection` exists:

- render the standard collection-style grid
- use the shared `filters` static block
- paginate `sale_collection.products` by `products_per_page`
- use infinite scroll when enabled
- render shared product-card blocks

### Detail empty and unavailable states

If the campaign is not renderable according to lifecycle rules, render the translation key `scs.storefront.empty.unavailable`.

If the campaign is renderable but no products resolve, render the translation key `scs.storefront.empty.no_products`.

### Detail template block tree contract

The managed detail template must seed a shared static block tree so the merchant configures the product-card family once and the campaign surface reuses it.

That block tree must include:

- one static `filters` block
- one static `_product-card` block
- within `_product-card`:
  - gallery/media block
  - title block
  - price block
  - swatches block

Exact default settings for that tree are defined in the appendices.

---

## PDP banner contract

### Banner block settings

The banner app block must expose exactly these settings:

| Setting | Type | Default |
|---|---|---|
| `show_image` | checkbox | `true` |
| `image_height` | range | `88` |
| `compact_spacing` | checkbox | `false` |

### Product eligibility matching

For the current product page:

1. Build a set of the current product's collection IDs.
2. Iterate all published campaigns.
3. Ignore any campaign whose lifecycle is not `active` or `open_ended`.
4. A campaign is eligible if either of the following is true:
   - the product belongs to the campaign's `sale_collection`
   - the product appears in any `offer.products` list inside the campaign

### Winner selection rule

The prototype selects the winning campaign by **earliest ending eligible campaign**. Blank end dates are treated as far future.

Production v1 must preserve that rule.

To avoid hidden provider-order drift, production should stabilize equal-end-time ties by campaign handle ascending. This is an intentional hardening step; it must not otherwise change the earliest-ending rule.

### Copy fallback chain

Once a winning campaign is chosen:

1. If a matched offer exists **and** `offer_description` is present, use `offer_description` as banner body.
2. Otherwise, if `sale_list_text` is present, use `sale_list_text`.
3. Otherwise, if `banner_text` is present, use `banner_text`.
4. If no body copy resolves, render no banner.

### Image and link fallback chain

The current prototype behavior is intentionally nuanced and must be preserved:

1. Initialize the default banner CTA URL to the canonical campaign URL.
2. If a matched offer exists **and** `offer_description` is present:
   - use `offer_image` if present
   - use `offer_image_link` if present
   - otherwise, if `sale_image_url` is present, use `sale_image_url` as the image link target
3. If no offer-specific image resolved, use `sale_image` if present
4. If the image link target is still the canonical campaign URL and `sale_image_url` exists, replace the image link target with `sale_image_url`
5. If the image link target equals the CTA campaign URL, render the image without a separate image link wrapper

### Important nuance

Offer-specific image and link fallback only activate when `offer_description` is present. If an offer matches the product but has no `offer_description`, the banner falls back to campaign-level copy and media.

### Banner output rules

- If no winning campaign exists, render nothing.
- If a winning campaign exists but no body copy resolves, render nothing.
- If a canonical campaign URL exists, render the CTA link using `scs.storefront.index.view_sale`.
- If `show_image == false`, render a text-only banner.

---

## Cart gift messaging and automation contract

This portion is design-new rather than prototype-carried, so it must be implemented exactly as defined here.

### Surfaces

The cart experience has two separate surfaces:

1. **Cart gift message app block** — visible messaging and progress.
2. **Cart automation app embed** — background enhancement that may attempt best-effort cart updates.

### Core principles

- The cart UI may help the shopper qualify or receive an eligible gift.
- The discount Function remains authoritative for final discount eligibility.
- The automation embed may attempt to add a gift, but it must not claim success as final discount authority.
- The app must never require Cart Transform.

### Required entitlement model

Given the current cart and active campaign rules, the entitlement service must determine:

- whether the cart qualifies for a gift
- which gift variant is eligible
- entitled free quantity
- already present gift quantity in cart
- missing entitled quantity
- extra paid quantity above entitlement

### Required cart message states

The cart message block must support at least these states:

- not qualified
- progress toward qualification
- qualified but gift missing
- qualified and gift present
- qualified but gift unavailable
- rule inactive or campaign paused

### Auto-add rules

When `autoAddEnabled == true` for the qualifying gift rule, the cart automation embed may:

1. detect that the shopper qualifies and that entitled gift quantity is missing
2. attempt a normal storefront cart add for the missing quantity
3. limit retries per cart revision to avoid loops
4. stop retrying if the gift variant is unavailable or cart add fails repeatedly

The embed must not:

- create infinite add/remove loops
- remove paid extra quantities automatically
- modify non-gift cart lines
- imply that checkout will definitely discount the gift unless the Function confirms eligibility

### Gift discount enforcement rule

The discount Function must discount only the entitled quantity and must fail closed when:

- the campaign is not published
- the campaign lifecycle is not eligible
- the rule config is missing or invalid
- the reward variant is unavailable
- the cart no longer satisfies the qualifier

---

## Discount architecture

### Core scale decision

The app must **not** create one active Function discount per campaign as its primary architecture. Stores have a bounded limit on active Function-backed discounts.

Instead, the app must use a bounded, aggregated model.

### Required bounded model

Use one or a small bounded set of discount nodes per shop, for example:

1. one node for percentage/fixed amount product or order discounts
2. one node for gift-with-purchase rules
3. one node for shipping discounts only if shipping discounts are included in v1

The exact shard count may vary, but it must remain bounded and independent of campaign count.

### Runtime config payload requirements

Every discount node managed by the app must receive owner-metafield JSON containing at minimum:

```json
{
  "schemaVersion": 1,
  "generatedAt": "2026-05-08T00:00:00Z",
  "configHash": "sha256:...",
  "campaigns": [
    {
      "campaignId": "gid://shopify/Metaobject/...",
      "campaignHandle": "spring-tools-sale",
      "startsAt": "2026-03-01T00:00:00Z",
      "endsAt": "2026-03-31T23:59:59Z",
      "paused": false,
      "rules": []
    }
  ]
}
```

Each rule inside the payload must include:

- stable internal rule ID
- rule type
- target IDs
- normalized date boundaries when applicable
- numeric values in a Function-safe representation
- any caps or stack policies needed by the Function

### Function behavior rules

The Function must:

- fail closed on invalid config
- ignore paused, invalid, not-started, or expired campaigns
- evaluate only the relevant rule families for its node
- apply the best valid discount according to the rule family contract

### Supported v1 offer families

The app must support:

- message-only campaigns
- percentage or fixed-amount discounts
- buy X get Y / gift with purchase
- volume discounts
- optional shipping discounts only if specifically included during implementation
- optional visible price automation outside the Function path

---

## Price automation contract

Visible price automation is optional and must be merchant-approved.

### Required safeguards

Before any variant price mutation, the app must:

1. build a preview diff
2. capture a snapshot of current `price` and `compare_at_price`
3. persist the snapshot in operational storage with variant IDs and checksums
4. require explicit merchant approval

### Apply rules

When a price rule is applied:

- update only targeted variants
- record before and after values
- record the app version and rule ID that performed the mutation
- surface diagnostics if another workflow changed the same variants after the snapshot

### Rollback rules

Rollback must:

- restore the original price state from the snapshot
- refuse silent rollback when current variant values no longer match the app-written expected values
- offer a force-rollback path only with an explicit merchant confirmation and warning

### Publish blocker

If a campaign uses price automation and no valid snapshot exists, the campaign must not publish.

---

## Localization architecture

### Core rules

- source content lives on campaign and offer resources
- translated content lives in Shopify translations
- bundled app/theme chrome must ship in English and French
- the app database must not become a parallel canonical translation store
- do not create language-specific source fields such as `sale_name_fr`

### Translation workflow

For each translatable resource:

1. determine the shop's base/source locale
2. update source-locale content directly on the resource fields
3. fetch translatable resource digests for non-source locales
4. register translations for non-source locales using Shopify translations APIs
5. persist translation status and errors for diagnostics only

Do not use translation registration for the shop's base locale.

### Rich text handling

Campaign and offer rich-text content may be authored in admin as rich text and imported from HTML or another structured authoring format. The import pipeline must normalize that content into the field format required by the chosen Shopify resource type.

### Required locale keys and defaults

The following storefront and schema keys must exist.

#### Storefront keys

| Key | English | French |
|---|---|---|
| `scs.storefront.index.view_sale` | `View sale` | `Voir la promotion` |
| `scs.storefront.grouping.other_deals` | `Other deals` | `Autres promotions` |
| `scs.storefront.loading.more_products` | `Loading more products…` | `Chargement d’autres produits…` |
| `scs.storefront.empty.no_campaigns` | `No promotions are currently available.` | `Aucune promotion n’est disponible pour le moment.` |
| `scs.storefront.empty.unavailable` | `This promotion is currently unavailable.` | `Cette promotion n’est pas disponible pour le moment.` |
| `scs.storefront.empty.no_products` | `No products are available for this campaign.` | `Aucun produit n'est disponible pour cette promotion.` |
| `scs.storefront.empty.no_collection` | `No sale collection is connected to this campaign` | `Aucune collection promotionnelle n’est liée à cette campagne` |

#### Schema keys

| Key | English | French |
|---|---|---|
| `scs.banner_block.name` | `Sales banner` | `Bannière promotionnelle` |
| `scs.banner_block.settings.show_image` | `Show image` | `Afficher l’image` |
| `scs.banner_block.settings.image_height` | `Image height` | `Hauteur de l’image` |
| `scs.banner_block.settings.compact_spacing` | `Use compact spacing` | `Utiliser un espacement compact` |
| `scs.index_section.name` | `Sales index` | `Liste des promotions` |
| `scs.index_section.settings.heading` | `Heading` | `Titre` |
| `scs.index_section.settings.body` | `Body` | `Texte` |
| `scs.index_section.settings.show_ended_campaigns` | `Show ended campaigns` | `Afficher les campagnes terminées` |
| `scs.index_section.settings.color_scheme` | `Color scheme` | `Combinaison de couleurs` |
| `scs.index_section.settings.padding_top` | `Top padding` | `Espacement supérieur` |
| `scs.index_section.settings.padding_bottom` | `Bottom padding` | `Espacement inférieur` |
| `scs.campaign_section.name` | `Sales campaign` | `Campagne promotionnelle` |
| `scs.campaign_section.settings.show_image` | `Show image` | `Afficher l’image` |
| `scs.campaign_section.settings.hero_image_height` | `Hero image height` | `Hauteur de l’image principale` |
| `scs.campaign_section.settings.group_by_offer` | `Group products by offer` | `Regrouper les produits par offre` |
| `scs.campaign_section.settings.products_per_page` | `Products per page` | `Produits par page` |
| `scs.campaign_section.settings.color_scheme` | `Color scheme` | `Combinaison de couleurs` |
| `scs.campaign_section.settings.padding_top` | `Top padding` | `Espacement supérieur` |
| `scs.campaign_section.settings.padding_bottom` | `Bottom padding` | `Espacement inférieur` |

### Reserved-but-currently-unused keys

- `scs.storefront.banner` namespace currently has no specific runtime text keys.
- `scs.storefront.detail` namespace currently has no specific runtime text keys.
- `scs.storefront.empty.no_collection` exists, but the current detail implementation does not render it. Keep it reserved for future diagnostics or UX refinements.

---

## Import workbook specification

The importer must support deterministic dry-run and commit flows.

### Required sheets

1. `Campaigns`
2. `Offers`
3. `Targets`
4. `PriceRules`
5. `GiftRules`
6. `VolumeTiers`
7. `FutureRewards`
8. `Content`
9. `Translations`
10. `Settings`

### Required columns by sheet

#### `Campaigns`

| Column | Required | Meaning |
|---|---:|---|
| `campaign_key` | Yes | Stable import key |
| `handle` | Yes | Desired campaign handle |
| `sale_name` | Yes | Public title |
| `sale_collection_handle` | No | Collection handle |
| `start_date` | No | ISO datetime |
| `end_date` | No | ISO datetime |
| `sale_paused` | No | `true` / `false` |
| `sale_list_priority` | No | Integer, blank means `10` |
| `banner_priority` | No | Reserved integer |
| `sale_image_source` | No | File URL or existing file reference |
| `sale_image_url` | No | Optional click-through URL |
| `workflow_state` | Yes | `draft`, `published`, `archived` |

#### `Offers`

| Column | Required | Meaning |
|---|---:|---|
| `offer_key` | Yes | Stable import key |
| `campaign_key` | Yes | Parent campaign |
| `handle` | Yes | Desired offer handle |
| `offer_name` | Yes | Public group heading |
| `offer_image_source` | No | File URL or existing file reference |
| `offer_image_link` | No | Optional link target |
| `sort_order` | No | Integer order within campaign |

#### `Targets`

| Column | Required | Meaning |
|---|---:|---|
| `owner_type` | Yes | `campaign` or `offer` |
| `owner_key` | Yes | `campaign_key` or `offer_key` |
| `target_type` | Yes | `product`, `variant`, or `collection` |
| `identifier_type` | Yes | `gid`, `handle`, or `sku` |
| `identifier` | Yes | Identifier value |
| `sort_order` | No | Order for `offer.products` |

#### `PriceRules`

| Column | Required | Meaning |
|---|---:|---|
| `rule_key` | Yes | Stable import key |
| `campaign_key` | Yes | Parent campaign |
| `pricing_mode` | Yes | `percentage_off`, `fixed_amount_off`, `set_price` |
| `value` | Yes | Numeric rule value |
| `target_identifier_type` | Yes | `gid`, `sku`, or `handle` |
| `target_identifier` | Yes | Variant or product selector |

#### `GiftRules`

| Column | Required | Meaning |
|---|---:|---|
| `rule_key` | Yes | Stable import key |
| `campaign_key` | Yes | Parent campaign |
| `qualifier_type` | Yes | `product`, `variant`, `collection`, `campaign_products`, `cart_subtotal` |
| `qualifier_identifier` | Conditional | Target selector |
| `minimum_quantity` | Conditional | Minimum quantity |
| `minimum_subtotal_minor` | Conditional | Minimum subtotal |
| `reward_variant_identifier` | Yes | Gift variant selector |
| `reward_quantity` | Yes | Free quantity |
| `max_reward_quantity_per_order` | Yes | Cap |
| `auto_add_enabled` | Yes | `true` / `false` |

#### `VolumeTiers`

| Column | Required | Meaning |
|---|---:|---|
| `rule_key` | Yes | Stable import key |
| `campaign_key` | Yes | Parent campaign |
| `target_identifier_type` | Yes | `gid`, `sku`, `handle` |
| `target_identifier` | Yes | Target selector |
| `minimum_quantity` | Yes | Tier threshold |
| `discount_type` | Yes | `percentage_off` or `fixed_amount_off` |
| `discount_value` | Yes | Numeric value |

#### `FutureRewards`

| Column | Required | Meaning |
|---|---:|---|
| `rule_key` | Yes | Stable import key |
| `campaign_key` | Yes | Parent campaign |
| `reward_type` | Yes | `manual_coupon` or `manual_service_credit` |
| `message` | No | Internal note |
| `report_code_template` | No | Export aid |

#### `Content`

| Column | Required | Meaning |
|---|---:|---|
| `entity_type` | Yes | `campaign` or `offer` |
| `entity_key` | Yes | Related import key |
| `field_key` | Yes | `sale_list_text`, `banner_text`, or `offer_description` |
| `locale` | Yes | Locale code |
| `content_format` | Yes | `source_richtext`, `html`, or another supported format |
| `content_value` | Yes | Content payload |

#### `Translations`

| Column | Required | Meaning |
|---|---:|---|
| `entity_type` | Yes | `campaign` or `offer` |
| `entity_key` | Yes | Related import key |
| `field_key` | Yes | Field being translated |
| `locale` | Yes | Non-source locale |
| `translated_value` | Yes | Translation payload |

#### `Settings`

| Column | Required | Meaning |
|---|---:|---|
| `key` | Yes | Setting name |
| `value` | Yes | Setting value |

Required settings keys must include:

- `index_page_handle`
- `index_path_pattern`
- `detail_path_pattern`
- `canonical_url_policy`

### Import validation rules

The importer must reject:

- invalid datetimes
- `end_date < start_date`
- campaigns with no valid targets
- duplicate handles in the same import batch
- route settings that use query parameters for campaign identity
- route settings that attempt to use app proxy paths as canonical URLs
- translation registrations for the source locale

### Import execution phases

Every import must support:

1. file parse
2. resource resolution
3. validation report
4. merchant review
5. commit
6. post-commit diagnostics

---

## Embedded admin UX contract

### Required primary navigation

The embedded admin must provide the following primary sections:

- Dashboard
- Campaigns
- Offers
- Imports
- Storefront setup
- Discounts
- Translations
- Diagnostics
- Rollback
- Settings

### Required admin modules and responsibilities

| Module | Responsibilities |
|---|---|
| Dashboard | campaign counts, publish blockers, diagnostics summary, quick actions |
| Campaign list | search, filter, create, status overview |
| Campaign editor | campaign fields, lifecycle preview, publish blockers, preview links |
| Offer editor | offer ordering, product selection, copy, media |
| Storefront setup | route config, page creation/adoption, theme package state, theme editor checklist |
| Discounts | rule compilation status, node IDs, config hash, last sync |
| Translations | locale readiness, source locale, missing translations, import/export support |
| Imports | workbook upload, dry-run report, commit, rollback reference |
| Diagnostics | blocker/warning/info checks, exportable support bundle |
| Rollback | price rollback, theme package rollback, emergency discount disable |
| Settings | shop-wide defaults, feature flags, support info |

### Publish blockers

The admin must block publication when any of the following are true:

- `sale_name` is blank
- `workflow_state` is invalid
- no valid target collection and no offer products resolve
- lifecycle is `invalid_date`
- required discount rule data is missing for a discount-bearing campaign
- required translations are missing according to the merchant's chosen locale policy
- route config is invalid
- managed theme support is required but not installed or not verified
- price automation is enabled but no valid snapshot exists

### Theme editor verification checklist

The app must provide a setup checklist that verifies:

- banner block placed on the product template where required
- cart gift message block placed where required
- cart automation embed enabled when used
- index page exists and resolves
- managed template is assigned when Mode B is active

---

## Jobs, webhooks, diagnostics, and rollback

### Required background jobs

At minimum, implement the following jobs:

- `campaign-publish-sync`
- `discount-config-rebuild`
- `translation-sync`
- `price-apply`
- `price-rollback`
- `theme-package-verify`
- `diagnostics-snapshot`
- `import-commit`

### Recommended webhook coverage

Use webhooks or polling fallbacks for changes that can create drift, including:

- app uninstall
- theme publish/change
- product change/delete
- collection change/delete
- discount change/delete
- locale changes when relevant

### Diagnostics severity levels

| Severity | Meaning |
|---|---|
| Blocker | Prevents publish or invalidates the current storefront contract |
| Warning | Storefront may still work, but configuration is incomplete or degraded |
| Info | Useful operational context |

### Required diagnostics checks

Diagnostics must cover at minimum:

- schema drift
- route config drift
- index page missing or wrong template
- managed theme package drift
- missing app block placement
- disabled app embed
- campaign target drift (deleted products/collections)
- discount node missing/disabled/hash mismatch
- translation coverage gaps
- price snapshot drift
- image/file missing

### Rollback surfaces

Rollback tooling must support at minimum:

- price rollback
- managed theme file rollback
- emergency discount disable
- import execution rollback where writes are reversible

### Emergency controls

The app must provide:

- shop-wide emergency disable for Function-managed discount nodes
- campaign-level pause control
- support bundle export
- safe read-only diagnostic mode when config is inconsistent

### Uninstall rule

Because app uninstall removes API access, the app must provide a pre-uninstall teardown path inside the admin. The `APP_UNINSTALLED` webhook can clean only external operational state. It must not be relied upon for theme or Shopify resource teardown after access is gone.

---

## Permissions and approvals

### Base scopes

The app requires at minimum:

- `read_products`
- `write_products` only when price automation is enabled
- `read_metaobjects`
- `write_metaobjects`
- `read_metaobject_definitions`
- `write_metaobject_definitions`
- `read_discounts`
- `write_discounts`
- `read_files`
- `write_files`
- `read_translations`
- `write_translations`
- `read_locales`
- `read_content` or `read_online_store_pages`
- `write_content` or `write_online_store_pages`

### Conditional scopes and approvals

Mode B additionally requires the appropriate theme scopes and any Shopify approval/exemption required for public-app theme file mutation.

### Explicit v1 non-goals for scopes

Do not request v1 base scopes for:

- customers
- orders
- gift cards
- store credit
- Cart Transform
- checkout-step UI customization

---

## Testing and acceptance matrix

### Required unit tests

Unit tests must cover at minimum:

- lifecycle classification
- ended-window calculation
- index sorting
- canonical URL building
- grouped de-duplication
- forced grouped fallback when no collection exists
- PDP winner selection
- PDP copy fallback chain
- PDP image/link fallback chain
- gift entitlement calculation
- volume tier selection
- price snapshot diffing
- translation registration rules
- import validation rules

### Required integration tests

Integration tests must cover at minimum:

- app installation and auth
- schema definition verification
- index page creation and adoption
- route config persistence
- managed theme package install/update/rollback
- campaign CRUD
- offer CRUD
- discount config compilation and sync
- translation sync
- import dry-run and commit

### Required storefront QA scenarios

Manual or automated storefront QA must include:

- no campaigns
- one active campaign
- one open-ended campaign
- one paused campaign
- one invalid-date campaign
- one ended campaign inside ended window
- one ended campaign outside ended window
- mixed active/open-ended/ended campaigns on the index
- grouped detail with overlapping offer products
- ungrouped detail with collection products
- grouped fallback when collection is missing
- PDP with one matching campaign
- PDP with multiple matching campaigns and different end dates
- PDP with multiple matching campaigns and equal end dates
- cart gift qualification and missing-gift auto-add
- extra paid gift quantity above entitlement
- English storefront
- French storefront

### Required theme and storefront validation when theme surfaces change

Whenever implementation changes theme surfaces, run and document all of the following:

1. `shopify theme dev` and verify the affected storefront surface.
2. Verify the same surface in the theme editor.
3. `shopify theme check` and fix any new issues introduced by the change.
4. If repeated Liquid paths changed, run `shopify theme profile` or inspect with Theme Inspector.
5. If locale files changed, run any locale validation required by the repo or release process.

### Required platform QA

Before release, verify:

- public unlisted app installation flow
- discount behavior on a Grow-compatible store
- no Checkout UI extension dependency
- no Cart Transform dependency
- no merchant code-edit requirement
- theme editor-only setup path for merchant actions

---

## Phased implementation order

### WP0 — Feasibility gates and proof spikes

Deliverables:

- verify public-app Grow Function path
- verify storefront campaign resource model
- verify nested route viability
- verify managed theme support approval path

Exit criteria:

- all open gates are either proven or formally revised in this file

### WP1 — App shell and operational foundation

Deliverables:

- app scaffold
- auth/session storage
- embedded admin shell
- base navigation
- job runner and logging foundation

### WP2 — Canonical schema and domain services

Deliverables:

- campaign/offer resource definitions
- route config resource
- rule resource definitions
- CRUD services
- lifecycle, sorting, and URL domain modules

### WP3 — Theme app extension surfaces

Deliverables:

- product banner block
- cart gift message block
- cart automation embed
- universal index block
- extension locales

### WP4 — Managed theme support package

Deliverables:

- managed index template and section
- managed detail template and section
- helper snippets
- install/update/verify/rollback service

This work is conditional on the managed-theme-support gate.

### WP5 — Route and page orchestration

Deliverables:

- page create/adopt flow
- route config UI
- canonical URL helper
- link verification

### WP6 — Discount and cart rule engine

Deliverables:

- bounded discount-node strategy
- Function config compiler
- gift entitlement service
- discount sync UI and diagnostics

### WP7 — Localization and import

Deliverables:

- translation status service
- translation sync service
- workbook import dry-run and commit

### WP8 — Price automation, diagnostics, and rollback

Deliverables:

- snapshotting and rollback
- diagnostics engine
- emergency controls

### WP9 — Production hardening and review readiness

Deliverables:

- QA evidence
- review-readiness package
- support runbooks
- merchant onboarding copy and checklists

---

## Definition of production ready

The app is production ready only when all of the following are true:

- the app is installable as a reviewed public unlisted app
- the no-merchant-code-edit rule is preserved end to end
- merchants can complete required setup using embedded admin and theme editor only
- the sales index page can be created or adopted safely
- canonical campaign detail pages resolve through a supported clean route model
- index, detail, PDP banner, cart messaging, and discount behavior match this file
- bounded Function discount architecture is in place
- localization and import flows work
- rollback exists for every destructive reversible action
- diagnostics detect setup and runtime drift
- no unsupported Plus-only dependency exists in v1
- all open gates in this document are closed or the document has been revised accordingly

---

## Implementation invariants

1. Never require a merchant to edit theme code manually.
2. Always prefer theme-editor placement and configuration over code instructions.
3. Preserve the default nested route model unless this file is explicitly revised.
4. Preserve lifecycle, ended-window, index ordering, detail grouping, and PDP banner behavior as defined here.
5. Do not use query parameters for canonical campaign identity.
6. Do not use Cart Transform in v1.
7. Do not use storefront JavaScript as discount authority.
8. Do not silently start using `banner_priority` in v1.
9. Do not reintroduce sales-index pagination unless this file is explicitly revised after a measured performance review.
10. Do not overwrite merchant pages, theme files, or price data silently.
11. Do not store canonical campaign or translation truth outside Shopify.
12. If a platform fact invalidates an accepted decision, update this file before continuing implementation.

---

## Appendix A — Default managed index template

Use the following default `templates/page.sales-index.json` shape in Mode B:

```json
{
  "sections": {
    "main": {
      "type": "scs-sales-index",
      "settings": {
        "heading": "Promotions",
        "body": "",
        "show_ended_campaigns": false,
        "color_scheme": "scheme-1",
        "padding-block-start": 48,
        "padding-block-end": 48
      }
    }
  },
  "order": ["main"]
}
```

There must be no `campaigns_per_page` setting in this template.

---

## Appendix B — Default managed detail template block tree

Use the following logical block tree for the campaign detail template:

| Path | Type | Static | Default settings summary |
|---|---|---:|---|
| `sections.main` | `scs-sales-campaign` | No | Section settings default to the values listed in the campaign detail contract |
| `sections.main.blocks.filters` | `filters` | Yes | filtering on, horizontal style, centered width, sorting on, grid density on, inherited colors, top/bottom padding `8`, side padding `0`, margins `8`/`20` |
| `sections.main.blocks.product-card` | `_product-card` | Yes | gap `4`, inherited colors, no border, border width `1`, opacity `100`, radius `0`, all padding `0` |
| `...product-card.blocks.card-gallery` | `_product-card-gallery` | No | image ratio `adapt`, no border, border width `1`, opacity `100`, radius `0`, all padding `0` |
| `...product-card.blocks.product-title` | `product-title` | No | width `100%`, alignment `left`, preset `rte`, font body, size `1rem`, wrap `pretty`, foreground color, no background, top padding `4` |
| `...product-card.blocks.price` | `price` | No | sale price first, no installments, no tax info, preset `h5`, width `100%`, alignment `left`, size `1rem`, all padding `0` |
| `...product-card.blocks.swatches` | `swatches` | No | alignment `flex-start`, mobile alignment `flex-start`, top padding `4`, remaining padding `0` |

If the actual storefront campaign type handle differs from `sales_campaigns`, substitute that handle consistently in the `templates/metaobject/{type}.json` filename and resource wiring.

---

## Appendix C — Prototype behaviors intentionally preserved in production

This appendix exists to prevent accidental drift.

- Index pages remain non-paginated by default.
- `sale_list_priority` affects index ordering; blank means `10`.
- `banner_priority` remains unused in v1.
- Ended-window behavior applies to index and detail, not PDP.
- Grouped detail pages de-duplicate by first match wins.
- The `Other deals` heading appears only when a named offer group rendered before the remainder group.
- If `group_by_offer == false` and no collection exists, grouped mode is forced.
- PDP winner selection is end-date-driven among eligible campaigns.
- PDP offer-specific media is only used when the matched offer also has `offer_description`.
- If no banner body copy resolves, no banner renders.
