<!-- markdownlint-disable MD025 MD001 -->

# Executive summary

This report summarizes the current Gamma-only custom work present on the `dev` branch after comparing the theme against pure upstream Horizon 3.4.0 at commit `df79657df860c120cee4925d218915b524bd2b76`.

It is written for a progress-report meeting, so the plain-language impact comes first and the technical notes stay secondary. Collection templates are intentionally excluded from this report, and deleted `notes.md` and `scs-notes.md` files are not treated as active work. Items that are still being stabilized are separated into the `In Progress / Incomplete` section.

Change-size numbers below are best-effort estimates based on current-state file comparison, not a line-perfect local git diff.

# Changelog of completed or currently functional unique custom changes

### Localized bilingual CAD pricing

**What changed**  
Gamma added a custom pricing layer so shoppers see French-style CAD formatting in French and English-style CAD formatting in English, instead of relying on one default money format everywhere.

**Scope**  
Product cards, product pages, filters, cart pricing, gift cards, and quantity or volume-pricing displays.

**Purpose**  
The storefront needs bilingual CAD presentation that Shopify's default Liquid money filters do not provide by themselves.

**Change size**  
Total lines of code added or modified: estimated 220

**Associated files and assets**  

- `snippets/qc-money.liquid`
- `snippets/price.liquid`
- `snippets/format-price.liquid`
- `snippets/price-filter.liquid`
- `snippets/filter-remove-buttons.liquid`
- `snippets/cart-products.liquid`
- `snippets/cart-summary.liquid`
- `snippets/quantity-selector.liquid`
- `snippets/volume-pricing-info.liquid`
- `blocks/buy-buttons.liquid`
- `blocks/_featured-product-price.liquid`
- `templates/gift_card.liquid`
- `snippets/meta-tags.liquid`

**Developer notes**  

- Attribution: mixed-over-upstream
- Attribution basis: `snippets/qc-money.liquid` is upstream-absent, and upstream `snippets/price.liquid` plus `snippets/format-price.liquid` use standard `money` and `money_with_currency` filters where Gamma routes output through `qc-money`.
- Short technical summary of how it was implemented: Gamma centralized formatting in `qc-money` and then replaced key price-rendering branches across cart, filter, unit-price, and volume-pricing surfaces.
- Any important conformity, maintainability, localization, duplication, brittleness, or architecture notes: this is a deliberate localization customization with broad storefront reach; the helper reduces repetition, but the number of integration points means future upstream price-template changes still need careful review.

### French header menu override

**What changed**  
French shoppers are served a dedicated navigation menu when a `main-menu-fr` link list exists, while other visitors continue to use the standard configured menu.

**Scope**  
Desktop and mobile header navigation.

**Purpose**  
This allows Gamma to maintain a French-first menu structure without duplicating the entire header system or changing the default menu for all locales.

**Change size**  
Total lines of code added or modified: estimated 35

**Associated files and assets**  

- `blocks/_header-menu.liquid`

**Developer notes**  

- Attribution: mixed-over-upstream
- Attribution basis: upstream Horizon 3.4.0 does not contain the `main-menu-fr` locale swap logic; Gamma added it directly inside the existing header-menu block.
- Short technical summary of how it was implemented: the block resolves a `dynamic_menu`, swaps to `linklists['main-menu-fr']` for `fr` and `fr-CA` when available, and then passes that menu through the standard header and drawer rendering flow.
- Any important conformity, maintainability, localization, duplication, brittleness, or architecture notes: the hardcoded French menu selection is intentional and still fits Horizon's header family rather than creating a parallel navigation system, but the menu handle remains a maintenance dependency.

### Legacy rental search bridge

**What changed**  
Search now helps shoppers reach Gamma's legacy rental catalog by showing external rental results in predictive search and by adding a direct rental-search path from the search results page.

**Scope**  
Predictive search modal, search results page, and the bridge between the current storefront and `locationgamma.com`.

**Purpose**  
Gamma still has rental inventory living outside the main Shopify storefront, so this bridge reduces dead ends and keeps search useful while that split remains in place.

**Change size**  
Total lines of code added or modified: estimated 420

**Associated files and assets**  

- `assets/predictive-search-legacy.js`
- `assets/predictive-search.js`
- `snippets/search-modal.liquid`
- `sections/search-header.liquid`
- `locales/en.default.json`
- `locales/fr.json`

**Developer notes**  

- Attribution: mixed-over-upstream
- Attribution basis: `assets/predictive-search-legacy.js` is upstream-absent, and the local `assets/predictive-search.js`, `snippets/search-modal.liquid`, and `sections/search-header.liquid` add legacy-specific attributes, rendering, and external-link behavior that upstream does not have.
- Short technical summary of how it was implemented: Gamma added data attributes for a legacy base URI and labels, fetches remote rental results through a dedicated JS bridge, injects those results into predictive search, and exposes a search CTA to the older rental catalog.
- Any important conformity, maintainability, localization, duplication, brittleness, or architecture notes: this is functional current-state behavior, but it is intentionally transitional because it depends on an external catalog and cross-site search flow.

### Product availability and system badges

**What changed**  
Product cards and product pages now communicate backorder, special-order, and battery-system information more clearly instead of relying only on default stock states.

**Scope**  
Product cards, product pages, buy-button messaging, cart status messaging, and custom product badges.

**Purpose**  
Gamma needs clearer merchandising and fulfillment guidance so customers can tell whether an item is backordered, special-order only, or part of a specific battery system before purchase.

**Change size**  
Total lines of code added or modified: estimated 320

**Associated files and assets**  

- `blocks/product-system-badges.liquid`
- `snippets/inventory-status.liquid`
- `blocks/availability-notice.liquid`
- `blocks/_product-card-gallery.liquid`
- `blocks/buy-buttons.liquid`
- `snippets/cart-products.liquid`
- `snippets/cart-summary.liquid`
- `templates/product.json`
- `locales/en.default.json`
- `locales/fr.json`

**Developer notes**  

- Attribution: mixed-over-upstream
- Attribution basis: `blocks/product-system-badges.liquid`, `snippets/inventory-status.liquid`, and `blocks/availability-notice.liquid` are upstream-absent, while the product-card and product-template surfaces were modified to consume them.
- Short technical summary of how it was implemented: Gamma introduced a reusable inventory-status snippet, custom availability notices, product-card badge logic, and a battery-system block backed by product metafields.
- Any important conformity, maintainability, localization, duplication, brittleness, or architecture notes: this is a business-specific inventory model layered onto Horizon's product system; it is cohesive, but it adds custom metafield and tag dependencies that need to stay documented.

### Product detail information panels

**What changed**  
Product pages now expose a richer set of product-specific information panels, such as included items, technical specifications, Gamma's advice, spare parts and accessories, manuals and documentation, and warranty information.

**Scope**  
Product detail pages and the internal content model used to populate them.

**Purpose**  
This gives customers more decision-making information directly on the product page and reduces the need to chase down specs or support details elsewhere.

**Change size**  
Total lines of code added or modified: estimated 210

**Associated files and assets**  

- `templates/product.json`

**Developer notes**  

- Attribution: mixed-over-upstream
- Attribution basis: the upstream product template does not include these Gamma-specific accordion rows or the embedded custom-liquid metafield rendering used to populate them.
- Short technical summary of how it was implemented: Gamma extended the product template's accordion tree with custom-liquid blocks that pull from variant metafields and warranty metaobjects.
- Any important conformity, maintainability, localization, duplication, brittleness, or architecture notes: the feature is effective and merchant-visible, but most of the logic lives inside editor-managed JSON rather than reusable snippet files, which makes future template maintenance more manual.

### Store location, hours, and map modules

**What changed**  
Gamma added reusable location blocks for a privacy-gated map, holiday-aware store hours, and structured contact information that appear in the contact page and footer.

**Scope**  
Contact page, footer, store information surfaces, and shopper access to directions and business hours.

**Purpose**  
This helps customers find the store, check hours, and open maps without depending on a single static content block.

**Change size**  
Total lines of code added or modified: estimated 560

**Associated files and assets**  

- `blocks/map-block.liquid`
- `blocks/hours-table.liquid`
- `templates/page.contact.json`
- `sections/footer-group.json`
- `locales/en.default.json`
- `locales/fr.json`

**Developer notes**  

- Attribution: mixed-over-upstream
- Attribution basis: both `blocks/map-block.liquid` and `blocks/hours-table.liquid` are upstream-absent, and Gamma-specific JSON wiring places them into the contact page and footer.
- Short technical summary of how it was implemented: the map block uses an OpenStreetMap/umap embed with placeholder imagery, consent-cookie control, and directions links, while the hours block reads metaobject-driven business hours with holiday overrides.
- Any important conformity, maintainability, localization, duplication, brittleness, or architecture notes: this is a clean reusable pattern rather than one-off page markup, but it depends on configured metaobjects and editor-managed JSON content to stay accurate.

### Warranty information page

**What changed**  
Gamma added a dedicated warranty information page that pulls policy content from warranty metaobjects instead of relying on one long static page.

**Scope**  
Customer-facing warranty content and policy communication.

**Purpose**  
This gives the business a clearer way to present different warranty policies and update them from structured content rather than rewriting page body text.

**Change size**  
Total lines of code added or modified: estimated 170

**Associated files and assets**  

- `templates/page.warranty-info.json`

**Developer notes**  

- Attribution: custom
- Attribution basis: `templates/page.warranty-info.json` is upstream-absent and is wired specifically to Gamma warranty metaobjects.
- Short technical summary of how it was implemented: the page template builds accordion rows from `warranty_policy` metaobjects such as `gamma-warranty-new` and `used-items`.
- Any important conformity, maintainability, localization, duplication, brittleness, or architecture notes: the structured-content approach is maintainable, but the page depends on stable metaobject handles and editor-managed JSON.

# In Progress / Incomplete custom changes

### Sales Campaign System

**What changed**  
Gamma has built a custom promotions system that can power a promotions landing page, campaign detail pages, and product-level sale banners using sales-campaign metaobjects.

**Scope**  
Promotions pages, product merchandising, metaobject-driven campaign content, shared product-card rendering, and campaign-specific translation/schema surfaces.

**Purpose**  
The goal is to let Gamma promote time-based campaigns through reusable structured content instead of hand-building every promotion page and product callout.

**Current status**  
The storefront surfaces are implemented, lifecycle and visibility behavior is now formalized across index/detail/PDP surfaces, ended-campaign display is time-limited by a runtime-based ended window, and landing/index ordering now applies `sale_list_priority`. This should still be treated as in development/stabilization for reporting purposes.

**Change size**  
Total lines of code added or modified: estimated 1,050

**Associated files and assets**  

- `sections/scs-sales-index.liquid`
- `sections/scs-sales-campaign.liquid`
- `snippets/scs-banner-content.liquid`
- `snippets/scs-campaign-card.liquid`
- `snippets/scs-richtext.liquid`
- `blocks/scs-product-sale-banner.liquid`
- `templates/metaobject/sales_campaigns.json`
- `templates/page.promotions.json`
- `templates/product.json`
- `locales/en.default.json`
- `locales/fr.json`
- `locales/en.default.schema.json`
- `locales/fr.schema.json`

**Developer notes**  

- Attribution: mixed-over-upstream
- Attribution basis: the core SCS sections, snippets, and block are upstream-absent, and Gamma also modified existing product and template wiring to expose the system.
- Short technical summary of how it was implemented: Gamma now classifies campaigns through canonical lifecycle states (`paused`, `invalid_date`, `not_started`, `ended`, `open_ended`, `active`), applies `sale_paused` as a hard visibility override, gates ended-campaign visibility through a reusable runtime-based ended-window helper, and sorts index cards by live/ended bucket then `sale_list_priority` (blank as `10`) with deterministic tie-breakers.
- Any important conformity, maintainability, localization, duplication, fragility, or architecture notes: `banner_priority` remains intentionally unused, PDP winner selection remains end-date-driven among eligible campaigns, sales index pagination remains absent (not reintroduced), and grouped/ungrouped detail rendering remains unchanged for campaigns that are allowed to render.

# Resolved previously uncertain surfaces

- `_header-menu.liquid` is now classified as `mixed-over-upstream` because the upstream Horizon 3.4.0 file does not contain the `main-menu-fr` swap logic. It belongs in the main changelog under `French header menu override`.
- `snippets/price.liquid` and `snippets/format-price.liquid` are now classified as `mixed-over-upstream` because upstream formats prices directly with Shopify money filters, while Gamma routes those paths through `qc-money`. They belong in the main changelog under `Localized bilingual CAD pricing`.
- `snippets/search-modal.liquid`, `sections/search-header.liquid`, and `assets/predictive-search.js` are now classified as `mixed-over-upstream` because upstream does not contain the legacy rental attributes, CTA, or injected rental-results renderer. They belong in the main changelog under `Legacy rental search bridge`.
- `blocks/product-system-badges.liquid`, `snippets/inventory-status.liquid`, and `blocks/availability-notice.liquid` are now classified as `custom` because those files are absent from upstream Horizon 3.4.0. They belong in the main changelog under `Product availability and system badges`.
- `blocks/map-block.liquid` and `blocks/hours-table.liquid` are now classified as `custom` because both files are absent from upstream Horizon 3.4.0. They belong in the main changelog under `Store location, hours, and map modules`.
- `blocks/scs-product-sale-banner.liquid`, `sections/scs-sales-index.liquid`, `sections/scs-sales-campaign.liquid`, and `templates/metaobject/sales_campaigns.json` are now classified as `custom` because they are upstream-absent promotions surfaces. They belong in the `In Progress / Incomplete` section under `Sales Campaign System`.
- `templates/page.warranty-info.json` is now classified as `custom` because the page template is absent from upstream Horizon 3.4.0. It belongs in the main changelog under `Warranty information page`.
- `templates/page.leaf-blower-chart.json` is now classified as `custom` because the template is absent from upstream Horizon 3.4.0, but it is not included in the main changelog because the current file reads as lightweight page wiring rather than a distinct implementation system.

# Final summary

In its current state, the `dev` branch contains a meaningful set of Gamma-specific storefront improvements that go beyond a standard Horizon update. The completed work is concentrated in bilingual pricing, French navigation, legacy rental search support, richer product communication, and structured contact and warranty content.

The largest unfinished investment is the Sales Campaign System, which already has real storefront surfaces but should still be treated as in-development for planning and meeting discussions. Excluding collection templates and deleted notes files, the current custom footprint is substantial and clearly separated between stable business-facing work and a still-maturing promotions system.
