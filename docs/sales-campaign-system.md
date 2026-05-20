# Sales Campaign System

## Purpose and scope

The Sales Campaign System (SCS) is Gamma's metaobject-driven promotions subsystem.

Ownership boundary:

- the Gamma theme renders canonical storefront surfaces
- the `sales-campaign-manager` app verifies compatibility and reports remediation guidance
- the app does not mutate theme files in base v1

It currently powers three storefront surfaces:

- the campaign index page
- the campaign detail page
- the PDP sale banner

## Metaobject types and fields used by theme code

### `sales_campaigns`

The current theme code uses these `sales_campaigns` fields:

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

### `promo_offers`

The current theme code uses these `promo_offers` fields:

- `offer_name`
- `offer_description`
- `offer_image`
- `offer_image_link`
- `products`
- `system.handle`

## Fields defined but currently unused by theme code

The exported `sales_campaigns` definition still includes fields that are not currently used:

- `sales_campaigns.banner_priority`

## Route/helper rule

`snippets/scs-campaign-url.liquid` resolves campaign URLs as follows:

- use `campaign.system.url` when present
- otherwise build the fixed Gamma fallback URL `/pages/promotions/{campaign.system.handle}`

The helper does not infer route roots from request-path context and does not
switch to app-proxy URLs for canonical campaign links.

This documents the current helper behavior only. It does not make broader claims about Shopify platform URL guarantees beyond what the code currently does.

## Canonical lifecycle states

`snippets/scs-campaign-lifecycle.liquid` returns exactly one lifecycle state:

- `paused`
- `invalid_date`
- `not_started`
- `ended`
- `open_ended`
- `active`

Classification precedence is:

1. `paused` when `sale_paused` is true
2. `invalid_date` when both dates exist and `end_date < start_date`
3. `not_started` when `start_date > now`
4. `ended` when `end_date < now`
5. `open_ended` when no `end_date` exists and the campaign is otherwise eligible to run
6. `active` otherwise

`paused` is now an active hard-visibility override across SCS surfaces.

## Ended-display window

`snippets/scs-campaign-ended-window.liquid` controls whether an ended campaign is still displayable.

Window rule:

- `runtime = end_date_ts - start_date_ts`
- `window_end = end_date_ts + runtime`
- an ended campaign is displayable while `now <= window_end`

Edge handling:

- ended-window logic applies only when lifecycle is `ended`
- if `start_date` is missing, the ended campaign is treated as outside the window
- if dates are invalid (`end_date < start_date`), lifecycle remains `invalid_date`

## Surface visibility rules

### Landing/index (`sections/scs-sales-index.liquid`)

- shows `active` and `open_ended`
- may show `ended` only when:
	- `show_ended_campaigns` is enabled
	- and ended-window eligibility is `true`
- hides `paused`, `not_started`, `invalid_date`, and ended campaigns outside the ended window
- campaign cards remain presentational via `snippets/scs-campaign-card.liquid`
- campaign index is not paginated

### Campaign detail (`sections/scs-sales-campaign.liquid`)

- renders full detail content for `active`, `open_ended`, and ended-window-eligible `ended`
- renders the generic unavailable state for:
	- `paused`
	- `not_started`
	- `invalid_date`
	- `ended` campaigns outside the ended window
- grouped/ungrouped product rendering behavior is unchanged inside the renderable branch
- no-products empty-state behavior is unchanged inside the renderable branch

### PDP banner (`snippets/scs-banner-content.liquid`)

- eligible lifecycle states are `active` and `open_ended` only
- ineligible states are `paused`, `not_started`, `invalid_date`, and `ended`
- ineligible campaigns are skipped before expensive nested offer/product matching

## Landing/index ordering contract

Landing/index ordering now uses `sale_list_priority` only on the index surface.

Sort contract:

1. apply lifecycle and ended-window visibility filtering first
2. bucket campaigns with live (`active`, `open_ended`) before ended-window-eligible `ended`
3. sort by `sale_list_priority` ascending inside each bucket
4. treat blank `sale_list_priority` as `10`
5. sort ties by normalized `end_date` ascending (`blank end_date` as far future)
6. apply deterministic final tie-break by `campaign.system.handle` ascending

`sale_list_priority` is not used for campaign detail ordering, offer ordering, or PDP banner selection.

## PDP banner winner-selection rule

`snippets/scs-banner-content.liquid` currently preserves this winner-selection behavior:

- the earliest ending applicable eligible campaign wins
- a blank `end_date` is treated as far-future
- ties keep the first encountered campaign because the comparison is strict

`banner_priority` remains unused.

## Banner content fallback

When a winning campaign is found, the PDP banner body uses this fallback order:

1. the matched offer's `offer_description`
2. the campaign's `sale_list_text`
3. the campaign's `banner_text`

## Banner image/link fallback

The PDP banner uses offer-level media first when a matched offer supplies descriptive banner content:

- matched offer image: `offer_image`
- matched offer image link: `offer_image_link`

If that matched-offer path is active and no offer image link is present, the link target falls back to the winning campaign's `sale_image_url`.

If no matched-offer image is available, the banner falls back to `campaign.sale_image` when present.

If no image link field is available, the snippet remains safe by falling back to the campaign URL or to non-linked media markup.

## Main files

Main SCS surfaces and helpers:

- `sections/scs-sales-index.liquid` — renders the promotions landing page and campaign card grid
- `sections/scs-sales-campaign.liquid` — renders the campaign detail page for a sales-campaign metaobject
- `blocks/scs-product-sale-banner.liquid` — renders the PDP banner block wrapper and passes display settings into the shared banner snippet
- `snippets/scs-banner-content.liquid` — resolves the winning campaign for the current product and renders the PDP banner content
- `snippets/scs-campaign-lifecycle.liquid` — canonical lifecycle classification
- `snippets/scs-campaign-ended-window.liquid` — ended-window eligibility checks
- `snippets/scs-campaign-card.liquid` — renders a single campaign card for the index page
- `snippets/scs-campaign-url.liquid` — resolves campaign URLs used by shared campaign surfaces

## Grouped vs ungrouped detail-page behavior

`sections/scs-sales-campaign.liquid` supports grouped and ungrouped rendering.

### Grouped mode

- offer groups render directly from `campaign.offers.value`
- duplicate products across offer groups follow first-match-wins behavior because previously rendered product IDs are tracked and skipped on later groups
- unmatched collection products appear in the trailing “Other deals” group
- offer groups are intentionally unpaginated
- the catch-all collection group paginates according to `products_per_page`

### Ungrouped mode

- ungrouped mode uses the normal collection grid/filter path
- if ungrouped mode is selected but `sale_collection` is blank, the code falls back to grouped mode so offer-only campaigns can still render

## Current status note

SCS remains an in-progress/stabilization custom subsystem in this repo's reporting model, even though lifecycle/visibility and index ordering contracts are now formalized.

