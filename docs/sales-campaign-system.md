# Sales Campaign System

## Purpose and scope

The Sales Campaign System (SCS) is Gamma's metaobject-driven promotions subsystem.

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
- `banner_text`
- `sale_list_text`
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

## Fields defined but not currently used

The exported `sales_campaigns` definition includes fields that are not currently used by the theme code:

- `sales_campaigns.sale_paused`
- `sales_campaigns.banner_priority`
- `sales_campaigns.sale_list_priority`

## Route/helper rule

`snippets/scs-campaign-url.liquid` resolves campaign URLs as follows:

- use `campaign.system.url` when present
- otherwise fall back to `routes.root_url` + `pages/promotions/` + `campaign.system.handle`

This documents the current helper behavior only. It does not make broader claims about Shopify platform URL guarantees beyond what the code currently does.

## Visibility/date behavior as currently implemented

Lifecycle and visibility rules are not fully centralized today.

Current behavior is split by surface:

- the PDP banner checks `start_date` and `end_date`
- the campaign index optionally hides ended campaigns via `show_ended_campaigns`
- the campaign detail section has no extra in-section date gate
- `sale_paused` is defined in the exported metaobject definition but is not currently used by theme code

## PDP banner winner-selection rule

`snippets/scs-banner-content.liquid` currently preserves this winner-selection behavior:

- the earliest ending applicable active campaign wins
- a blank `end_date` is treated as far-future
- ties keep the first encountered campaign because the comparison is strict
- priority fields are not currently used

## Banner content fallback

When a winning campaign is found, the PDP banner body uses this fallback order:

1. the matched offer's `offer_description`
2. the campaign's `sale_list_text`
3. the campaign's `banner_text`

## Banner image/link fallback

The PDP banner currently uses offer-level media first when a matched offer supplies descriptive banner content:

- matched offer image: `offer_image`
- matched offer image link: `offer_image_link`

If that matched-offer path is active and no offer image link is present, the link target falls back to the winning campaign's `sale_image_url`.

If no matched-offer image is available, the banner does not currently fall back to rendering `campaign.sale_image`; the banner renders without media instead.

If no image link field is available, the snippet remains safe by falling back to the campaign URL or to non-linked media markup.

## Index/detail/PDP surfaces

Main SCS surfaces and helpers:

- `sections/scs-sales-index.liquid` — renders the promotions landing page and campaign card grid
- `sections/scs-sales-campaign.liquid` — renders the campaign detail page for a sales-campaign metaobject
- `blocks/scs-product-sale-banner.liquid` — renders the PDP banner block wrapper and passes display settings into the shared banner snippet
- `snippets/scs-banner-content.liquid` — resolves the winning campaign for the current product and renders the PDP banner content
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

## Known intentional limitations

Current intentional limitations to keep in mind:

- lifecycle and visibility rules are not fully centralized today
- `sale_paused` is not currently used
- priority fields are not currently used
- PDP winner selection is end-date driven, not priority-driven
- banner matching still scans campaign metaobjects and nested offers/products, though the current implementation reduces repeated work inside that scan
