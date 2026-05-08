# Sales Campaigns Production Implementation Plan

## Document Control

- **Repository and app handle:** `sales-campaign-system`
- **Visible Shopify admin app name:** `Sales Campaigns`
- **Distribution model:** Public unlisted Shopify App Store app.
- **Required production install path:** The merchant installs the reviewed unlisted public app from its Shopify App Store listing or developer-provided listing link. Do not treat a direct custom-app install on a Shopify Grow store as production-equivalent for Shopify Function features.
- **Target merchant plan:** Shopify Grow.
- **Storefront target:** Shopify Online Store 2.0 themes that support app blocks and app embeds.
- **Primary implementation stack:** Shopify Remix or React Router app template, Shopify Admin GraphQL API, Shopify Discount Functions, theme app extensions, Shopify Online Store pages, app-owned `$app:` metaobjects and metafields, metaobject Online Store/renderable capabilities where suitable, discount owner metafields, Shopify Files, Shopify translations, Shopify webhooks, and a minimal external backend for operational state only.
- **Default base locale:** English (`en`) for sample content and app defaults.
- **Bundled app UI locales:** English (`en`) and French (`fr`).
- **Supported campaign content locales:** Any locale enabled on the merchant's Shopify store.
- **Canonical campaign data store:** App-owned Shopify resources, not merchant-owned metaobject definitions and not an external database.
- **Canonical translation store:** Shopify's native translation system.
- **Routing model:** Configurable, handle-based, and parameter-free. The app must not hardcode any index handle, detail handle, or route prefix.

---

## 1. Executive Summary

Sales Campaigns is a Shopify app for planning, publishing, rendering, and enforcing structured sales campaigns on Shopify Grow stores. The app replaces Gamma's store-specific theme-only prototype with a portable Shopify-native architecture that can be installed from an unlisted App Store listing, configured without manual theme edits, and operated without Shopify Plus.

The app must support:

- A configurable sales index page.
- Dedicated campaign detail pages with clean path-based URLs.
- Product-page campaign banners.
- Cart gift messaging and best-effort gift add UX.
- Checkout-enforced discounts through Shopify Discount Functions.
- Optional visible sale price automation with snapshots and rollback.
- Spreadsheet import.
- Shopify-native localization.
- Diagnostics, reconciliation, and emergency rollback.

The storefront routing model must be flexible. The app must not hardcode `promotions`, `sales`, or any other handle or route prefix as a permanent assumption. The merchant or app setup may configure route patterns such as:

```text
/pages/{index_handle}
/pages/{index_handle}/{detail_handle}
/pages/{detail_handle}
/pages/{alternate_parent_handle}/{detail_handle}
/{detail_prefix}/{detail_handle}
```

Examples of valid configured outcomes include:

```text
/pages/current-offers
/pages/current-offers/spring-tools-sale
/pages/spring-tools-sale
/pages/clearance/spring-tools-sale
/sale/spring-tools-sale
```

The campaign handle must not be passed through URL query parameters. Canonical storefront links must be path-based.

The key routing rule is precise: **the app must not infer campaign detail nesting from the index route.** Detail routes may nest under the index route, under another page handle, or under a separate route prefix, but only when that pattern is explicitly configured and verified. Nesting is allowed; implicit nesting is not.

The production app preserves the prototype's broad behaviours:

- Non-paginated sales index.
- Campaign detail surfaces.
- Product-page campaign banners.
- Lifecycle-aware visibility.
- Ended-campaign display windows for index/detail only.
- Sorted campaign cards.
- Grouped and ungrouped offer rendering.
- Offer-product de-duplication with first-match-wins behaviour.
- Localized app and storefront chrome.
- Accessible cards, sections, and empty states.
- Deterministic PDP banner selection.

The production app changes the implementation model:

- Prototype merchant-owned `sales_campaigns` and `promo_offers` metaobjects become app-owned `$app:` metaobjects.
- Theme snippets and templates become theme app extension blocks, app embeds, a configurable managed index page, and configurable campaign detail route resources.
- Liquid-only selection logic becomes shared domain logic, storefront rendering logic, and Function-compatible enforcement logic.
- Shopper-facing campaign translations use Shopify's translation system.
- Discounts and gift enforcement use Shopify discount nodes, Shopify Discount Functions, and compact discount owner metafields.

---

## 2. Shopify Grow Compatibility Contract

This plan is designed for a Shopify Grow merchant that installs Sales Campaigns as a reviewed public unlisted Shopify App Store app.

### 2.1 Required Constraints

The app must comply with these constraints:

1. **Public app distribution for production Function features.** Discount Function features must be delivered through the reviewed public unlisted app. The app must not rely on direct custom-app Function installation for Grow stores.
2. **No Checkout UI extension dependency.** Core checkout-step UI customization is outside v1. Shopper messaging must live on Online Store pages, product pages, cart surfaces, theme app extensions, or app proxy data endpoints.
3. **No Cart Transform dependency.** Gift behaviour must be implemented as storefront cart UX plus Discount Function enforcement. Do not add, merge, expand, rename, update, or reprice cart lines through Cart Transform.
4. **No automated Gift Card API issuance.** Future-value rewards in v1 must use manual fulfilment, discount-code-oriented workflows, or operational reporting only.
5. **No automated store credit issuance.** Store credit automation is outside v1.
6. **No third-party carrier-calculated shipping dependency.** Delivery-rate customization and carrier-rate apps are outside v1.
7. **No Shopify Plus requirement.** Plus-only checkout branding, checkout layouts, payment customizations, delivery customizations, Shopify Scripts, or cart transformations are outside v1.
8. **No canonical app-proxy shopper routes.** App proxy may be used for signed dynamic data endpoints, but canonical shopper URLs must be configurable storefront routes, not `/apps/...`, `/a/...`, `/community/...`, or `/tools/...`.
9. **No URL parameters for campaign handles.** Canonical campaign links must not pass the campaign handle through query parameters such as `?campaign=...`, `?sale=...`, or `?handle=...`.
10. **No hardcoded route handles.** The app must not hardcode `promotions`, `sales`, or any other handle or prefix as an invariant. All storefront handles and route patterns must come from route configuration, merchant setup, or validated defaults that can be changed.

### 2.2 Grow-Compatible Feature Envelope

The app may implement:

- Embedded Shopify admin app.
- Managed Shopify Online Store index page with a configurable handle.
- Dedicated campaign detail pages with configurable path-based URL patterns.
- Theme app extension app blocks and app embeds.
- App proxy data endpoints for signed dynamic payloads where needed.
- App-owned metaobjects and metafields declared by TOML.
- Metaobject Online Store/renderable capabilities for dedicated campaign detail pages where suitable.
- Shopify Admin GraphQL reads and writes with approved scopes.
- Shopify Files for campaign imagery.
- Shopify translations for campaign and offer content.
- Shopify discount nodes and Shopify Discount Functions.
- Discount owner metafields for compact runtime configuration.
- Storefront cart UX for gift messaging and best-effort gift add actions.
- Variant price and compare-at price mutation with explicit merchant confirmation, snapshots, drift detection, and rollback.
- Manual future-value reward tracking and manual coupon/service-credit fulfilment workflows.

---

## 3. Product Scope

### 3.1 In Scope

Sales Campaigns must provide:

1. **Embedded admin**
   - Onboarding.
   - Grow compatibility checker.
   - Campaign dashboard.
   - Campaign editor.
   - Offer editor.
   - Import wizard.
   - Translation readiness dashboard.
   - Index page setup assistant.
   - Campaign detail route setup assistant.
   - Theme setup assistant.
   - Discount and gift setup assistant.
   - Diagnostics and reconciliation.
   - Emergency disable and rollback controls.

2. **Shopper-facing storefront surfaces**
   - Sales index rendered on a managed Shopify Page using a configurable handle.
   - Campaign detail pages rendered at configurable path-based URLs.
   - Product-page campaign banner app block.
   - Cart gift message app block.
   - Cart automation app embed for best-effort eligible gift add UX.

3. **Campaign and offer data model**
   - Campaign lifecycle, status, routing, priorities, visibility, product targeting, offer relationships, and operational metadata.
   - Public campaign and offer content stored in translatable app-owned resources.
   - Discount, gift, volume, price, and manual future-reward rules stored as validated executable or operational configuration.

4. **Promotion enforcement**
   - Shopify discount nodes and Shopify Discount Functions for checkout-enforced product/order/shipping discount candidates where supported by the Discount Function API.
   - Storefront JavaScript only for UX enhancement, not discount authority.
   - Function configuration through discount owner metafields.

5. **Spreadsheet import**
   - Dry-run parsing.
   - Shopify resource resolution.
   - Validation reports.
   - Commit step.
   - Optional translation seeding.
   - Rollback records for reversible writes.

6. **Localization**
   - App UI bundled in English and French.
   - Storefront extension chrome bundled in English and French.
   - Campaign and offer content translatable into any enabled Shopify locale through Shopify's translation system.
   - Optional import-seeded translations using Shopify translation APIs.

### 3.2 Out of Scope

The app must not:

- Require merchant-owned `sales_campaigns` or `promo_offers` metaobject definitions.
- Require manual theme code edits.
- Depend on a specific index page handle existing before installation; the app must create it, verify it, or guide the merchant to approve creation.
- Depend on a specific detail route prefix existing before installation; the app must create, verify, or guide setup of the configured detail route strategy.
- Use URL parameters for canonical campaign detail links.
- Infer detail URLs by appending campaign handles to the index route unless that exact pattern is explicitly configured and verified.
- Use an external database as the canonical campaign store.
- Store canonical shopper-facing translations in app database tables.
- Treat French as required by default.
- Assume English is always the merchant's source language.
- Use storefront JavaScript as discount authority.
- Use Checkout UI extensions for v1 shopper messaging.
- Use Cart Transform as a gift, bundle, or price transformation dependency.
- Use automated Gift Card API issuance for future rewards.
- Use automated store credit issuance in v1.
- Mutate variant prices without snapshots and rollback records.
- Request customer, order, gift card, or store credit scopes in the base app.
- Require Shopify Plus.
- Use `/apps/...`, `/a/...`, `/community/...`, or `/tools/...` as canonical shopper-facing campaign routes.
- Hardcode `promotions`, `sales`, or any other route handle or prefix as an invariant.

---

## 4. Routing Strategy

### 4.1 Route Configuration Model

Routes are merchant-configurable and stored in app-owned route configuration. The app must support at least these concepts:

- `index_page_handle`
- `index_path_pattern`
- `detail_parent_handle`
- `detail_path_prefix`
- `detail_path_pattern`
- `detail_handle_source`
- `canonical_url_policy`
- `route_ownership_mode`

The default values may be opinionated during onboarding, but they must be editable and must not be treated as implementation invariants.

### 4.2 Supported Index Route Patterns

The app must support index route patterns such as:

```text
/pages/{index_handle}
```

The index handle can be any valid merchant-approved page handle. The app must create, verify, or adopt the configured Shopify Page. The app must not require a specific handle.

### 4.3 Supported Campaign Detail Route Patterns

Campaign detail pages must use clean, path-based URLs without query parameters. Supported pattern families include:

```text
/pages/{index_handle}/{detail_handle}
/pages/{detail_handle}
/pages/{alternate_parent_handle}/{detail_handle}
/{detail_prefix}/{detail_handle}
```

The app must not assume that the detail route follows from the index route. The following are all conceptually valid when explicitly configured and verified:

```text
/pages/current-offers/spring-tools-sale
/pages/spring-tools-sale
/pages/clearance/spring-tools-sale
/sale/spring-tools-sale
```

The route engine must treat same-route nesting as one possible configured pattern, not as a default inference.

### 4.4 Detail Route Implementation Options

Preferred implementation order:

1. **App-owned campaign metaobjects with Online Store/renderable capabilities**
   - Campaign detail entries should expose clean Online Store URLs matching the configured detail pattern where Shopify supports the required app-owned definition configuration.
   - The route must use a theme template or app block based rendering surface.
   - Campaign SEO metadata should come from translatable public content resources or derived renderable fields.

2. **Managed Shopify page or route shell**
   - Acceptable only if it produces clean handle-based URLs without query parameters and without manual theme code edits.

3. **App proxy fallback for data only**
   - App proxy endpoints may provide signed payloads or fragments, but must not be canonical shopper-facing index or detail URLs.

### 4.5 URL Resolution Priority

For every campaign link:

1. Merchant override URL, if valid and enabled.
2. Configured canonical campaign detail pattern.
3. Merchant-selected alternate landing page URL, if configured and verified.
4. Configured index URL.

### 4.6 URL Builder Requirements

The URL builder must:

- Generate the configured index URL from `index_path_pattern` and `index_page_handle`.
- Generate campaign detail URLs from `detail_path_pattern` and the campaign detail handle.
- Reject canonical URLs that contain `?campaign=`, `?sale=`, `?handle=`, or similar query parameters for campaign identity.
- Reject unconfigured assumptions that append detail handles to the index route.
- Allow nested detail URLs only when the nested pattern is explicitly configured.
- Keep all handles lowercase, URL-safe, and stable after publish unless redirects are implemented.

---

## 5. Architecture Principles

### 5.1 Shopify Resources Are Canonical

Canonical campaign and offer state must live in app-owned Shopify resources:

- App-owned metaobjects for structured campaign data.
- App-owned metafields for app settings and compact runtime configuration.
- Shopify Online Store Page with configurable handle for the index shell.
- Dedicated campaign detail URL resources or renderable app-owned campaign metaobjects for configured detail URLs.
- Shopify discount nodes for discount activation.
- Discount owner metafields for Function configuration.
- Shopify Files for uploaded campaign imagery.
- Shopify product variants for live price and compare-at price.
- Shopify translations for localized campaign and offer content.

The external backend stores operational state only.

### 5.2 Managed Index Page

The app must treat the configured index page as the canonical index shell.

Implementation rules:

- Verify whether a Shopify Page exists for `index_page_handle`.
- If missing, create it after merchant approval or during guided setup.
- Default page title may be seeded from app setup, but must be editable.
- Keep page body minimal; do not store canonical campaign content in the page body.
- Use app block placement or a template suffix that allows the Sales Campaigns extension to render the index.
- Never overwrite merchant-authored content on an existing index page without explicit confirmation.
- If the merchant already has a page at the configured handle, offer adoption, alternate handle, or manual placement instructions.

### 5.3 Dedicated Campaign Detail Pages

The app must treat the configured detail pattern as the canonical detail route family.

Implementation rules:

- Detail pages must resolve campaign identity from a path segment, not from URL query parameters.
- Detail routes must be generated from stable campaign detail handles.
- Detail URLs must remain stable after publish unless redirect support exists.
- Detail rendering must use app-owned campaign/offer/public content resources.
- If a campaign is paused, invalid, not started, or expired outside the visible window, the detail page must show an unavailable state or 404-equivalent theme state, depending on merchant settings.

### 5.4 App-Owned Definitions by TOML

Metaobject and metafield definitions should be declared in `shopify.app.toml` wherever the schema is known at build time. App-owned definitions keep the data model version-controlled, deployable, and consistent across installations.

Use Admin GraphQL definition creation only if a future requirement genuinely needs dynamic runtime definitions. This app plan does not require merchant-owned campaign or offer definitions.

### 5.5 Minimal External Backend

Allowed backend state:

- OAuth sessions and shop installation records.
- Import files and parsed import reports.
- Job queue records.
- Webhook idempotency records.
- Price snapshot audit records.
- Rollback execution records.
- Cached app proxy data payloads.
- Diagnostics snapshots.
- Index page setup/adoption audit records.
- Detail route setup/verification records.

Disallowed backend state:

- Canonical campaign content.
- Canonical offer content.
- Canonical translations.
- Canonical discount rule definitions, except transient derived cache.
- Canonical product membership lists when Shopify references can represent them.

### 5.6 Localization Is Shopify-Native

The app must treat localization as three layers:

1. **Base content** stored directly in app-owned public content resources.
2. **Translated content** stored through Shopify translations.
3. **Static app and extension chrome** bundled in English and French.

The managed index page title/body is shell content only. Campaign and offer copy must come from app-owned translatable campaign/offer resources.

### 5.7 Checkout Enforcement Through Discount Functions Only

Checkout discount enforcement must use Shopify Discount Functions provided by the public unlisted app. Storefront blocks and app embeds may improve UX, but checkout enforcement must remain server-side in Shopify's discount pipeline.

The app must not rely on Checkout UI extensions, Shopify Scripts, Cart Transform, or client-side cart JavaScript as the authority for final discount eligibility.

---

## 6. High-Level Architecture

```text
Merchant admin / import workbook / Shopify translations
        |
        v
Sales Campaigns embedded admin app
        |
        |-- verifies Shopify Grow compatibility
        |-- creates/verifies configured index page
        |-- creates/verifies configured detail route strategy
        |-- reads shop locales, markets, products, variants, collections, files
        |-- validates campaign, offer, discount, gift, volume, price, reward rules
        |-- writes canonical app-owned Shopify resources
        |-- creates/updates Shopify discount nodes
        |-- writes compact Function config to discount owner metafields
        |-- registers optional translations after digest lookup
        |-- schedules activation, expiration, price changes, and reconciliation jobs
        |
        v
Shopify canonical state
        |
        |-- Shopify Page: /pages/{index_handle}
        |-- Campaign detail URLs from configured detail_path_pattern
        |-- $app:scs_campaign
        |-- $app:scs_offer
        |-- $app:scs_public_campaign_content
        |-- $app:scs_public_offer_content
        |-- $app:scs_route_config
        |-- $app:scs_price_rule
        |-- $app:scs_gift_rule
        |-- $app:scs_volume_rule
        |-- $app:scs_future_reward_rule
        |-- Shopify translations
        |-- Shopify discount nodes
        |-- Discount owner metafields
        |-- Shopify variants and Files
        |
        +-----------------------------+
        |                             |
        v                             v
Storefront routes + theme extension   Shopify Discount Functions
        |                             |
        |-- configured index route    |-- product/order/shipping discount candidates
        |-- configured detail routes  |-- gift discount enforcement
        |-- PDP banner                |-- volume discount enforcement
        |-- cart gift messaging       |-- fail-safe no-discount fallback
        |-- app proxy data endpoints  |
        |                             |
        v                             v
Shopper storefront pages              Checkout discount pipeline
```

---

## 7. Permissions and Scopes

Request the minimum viable scopes for the Grow-compatible first production release.

### 7.1 Likely Required Base Scopes

- `read_products`
- `write_products` only if the merchant enables visible sale price automation.
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
- `read_markets` if market-specific content readiness or market-scoped translations are enabled.
- `read_online_store_pages` or `read_content` to verify the managed index page.
- `write_online_store_pages` or `write_content` to create or update the managed index page after merchant approval.
- `write_app_proxy` only if signed app proxy data endpoints are used.

### 7.2 Excluded v1 Scopes

Do not request these in v1:

- `read_customers`
- `write_customers`
- `read_orders`
- `write_orders`
- `read_gift_cards`
- `write_gift_cards`
- `read_store_credit_accounts`
- `write_store_credit_account_transactions`
- Cart Transform scopes.
- Checkout UI extension configuration for core checkout-step UI.
- Fulfilment, inventory write, payment customization, or delivery customization scopes.

---

## 8. Canonical Data Model

### 8.1 Ownership Map

| Concern | Canonical resource |
|---|---|
| Sales index shell | Shopify Page with configured `index_page_handle` |
| Campaign detail route | Configured `detail_path_pattern` via renderable/onlineStore campaign detail resource where supported |
| Campaign identity, lifecycle, visibility, ordering | `$app:scs_campaign` |
| Offer identity, relationship, type | `$app:scs_offer` |
| Shopper-facing campaign content | `$app:scs_public_campaign_content` |
| Shopper-facing offer content | `$app:scs_public_offer_content` |
| Routing and surface settings | `$app:scs_route_config` |
| Price mutation rules and snapshots | `$app:scs_price_rule` plus backend audit records |
| Gift entitlement rules | `$app:scs_gift_rule` |
| Volume/tier discount rules | `$app:scs_volume_rule` |
| Manual future reward intent | `$app:scs_future_reward_rule` |
| Checkout discount execution | Shopify discount nodes and owner metafields |
| Live prices | Shopify product variants |
| Images | Shopify Files |
| Translations | Shopify translation records |
| Import and rollback logs | External backend operational tables |

### 8.2 `$app:scs_route_config`

Purpose: route and link configuration for the sales index and dedicated campaign detail pages.

Fields:

- `index_route_mode` — enum: `shopify_page`, `theme_block`, `external_url`.
- `index_page_handle` — single-line text, merchant-configurable.
- `index_path_pattern` — single-line text, default shape `/pages/{index_handle}`.
- `detail_route_mode` — enum: `metaobject_online_store`, `theme_block`, `external_url`.
- `detail_parent_handle` — single-line text, nullable.
- `detail_path_prefix` — single-line text, nullable.
- `detail_path_pattern` — single-line text, merchant-configurable.
- `detail_handle_source` — enum: `campaign_handle`, `route_slug_override`.
- `fallback_url` — URL.
- `canonical_url_policy` — enum: `configured_index_and_detail`, `merchant_override`.
- `managed_index_page_id` — Shopify Page GID.
- `schema_version` — integer.

Validation requirements:

- Index route must be path-based.
- Detail route must be path-based.
- Do not use URL parameters for campaign handles.
- Do not infer detail routes by appending handles to the index route unless that exact pattern is configured.
- Do not make `/apps/...` canonical for shopper-facing campaign URLs.
- Do not hardcode any specific index handle, detail parent handle, or detail prefix.

---

## 9. Shopper-Facing Surfaces

### 9.1 Sales Index at Configured Index Route

Required behaviour:

- Render active and open-ended campaigns.
- Optionally render ended-window campaigns.
- Never paginate by default.
- Sort live campaigns before ended campaigns.
- Sort by `index_priority` ascending.
- Treat blank priority as `10`.
- Tie-break by normalized `ends_at` ascending, with blank end date as far future.
- Final tie-break by `handle` ascending.
- Render an empty state if no campaigns are renderable.
- Use accessible list/card semantics.
- Link campaign cards to the configured detail URL for each campaign.

### 9.2 Campaign Detail at Configured Detail Route

Required behaviour:

- Resolve campaign by the configured path segment representing `detail_handle`.
- Render campaign title, subtitle, image, body, disclaimer, CTA, and offer groups.
- Show unavailable state for non-renderable lifecycle states.
- Support grouped mode.
- Support ungrouped collection/product grid mode.
- Force grouped mode if ungrouped mode is selected but no collection target exists.
- Support collection-style product rendering for collection-backed campaigns.
- Support an `Other deals` remainder group.
- De-duplicate products across grouped offers by first-match-wins.
- Avoid rendering duplicate product cards across groups.
- Render no-products empty state when renderable but no products resolve.

### 9.3 Product-Page Campaign Banner

Required behaviour:

- Render only when the current product matches an active or open-ended campaign.
- Resolve one winning campaign.
- Default winner strategy: earliest ending campaign, with blank end date treated as far future.
- Show offer-specific copy when product matches a specific offer.
- Link to the configured detail URL for the winning campaign.
- Do not render empty wrapper markup when no banner is eligible.

### 9.4 Cart Gift Message and Cart Automation

Required behaviour:

- Detect cart lines eligible for active gift rules using storefront-available cart context and/or a signed app proxy lookup.
- Show qualification progress and gift entitlement state.
- Distinguish free entitled quantity from paid extra quantity when the same gift variant is added manually.
- App embed may attempt to add eligible gifts through normal storefront cart interactions.
- Do not use Cart Transform.
- Never represent auto-add success as guaranteed checkout discount eligibility; the Function remains authoritative.

---

## 10. Discount and Pricing Architecture

### 10.1 Grow-Compatible Offer Families

The app must support:

1. **Message-only campaigns** — storefront surfaces only.
2. **Visible sale pricing** — optional variant `price` and `compare_at_price` mutation with snapshots, dry-run diffs, drift detection, and rollback.
3. **Amount or percentage discounts** — enforced by Shopify Discount Functions or native discount nodes where appropriate.
4. **Buy X Get Y / gift with purchase** — storefront and cart UX plus Function enforcement; no Cart Transform.
5. **Volume discounts** — Function-enforced where possible; no Cart Transform line repricing.
6. **Manual future-value rewards** — manual coupon/service-credit workflows or operational tracking only; no automated gift card or store credit issuance.

### 10.2 Discount Owner Metafield Config

Each Shopify discount node managed by the app must have compact, validated owner metafield JSON containing:

- `schemaVersion`
- `campaignId`
- `campaignHandle`
- relevant offer/rule IDs
- normalized dates
- product/variant/collection GIDs needed by the Function
- numeric values as strings or integer minor units
- `configHash`

The Function must fail closed and return no discount for missing, invalid, paused, not-started, ended, or unqualified configurations.

---

## 11. Localization Plan

- Campaign and offer base content must be stored directly in app-owned public content resources.
- Translated content must be stored through Shopify translations.
- App/admin/theme-extension chrome is bundled in English and French.
- Do not create fields named `title_en`, `title_fr`, etc.
- Do not create app DB translation tables.
- Do not treat French as required by default.
- Do not call `translationsRegister` for the shop primary/base locale; update the source resource value instead.
- Query translatable resources and digest values before registering translations.
- Report translation API user errors in import reports.

The managed index page title/body is shell content only. Campaign and offer copy must come from app-owned translatable resources.

---

## 12. Import System

Workbook sheets:

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

Routing-related settings:

- `index_page_handle`
- `index_path_pattern`
- `detail_parent_handle`
- `detail_path_prefix`
- `detail_path_pattern`
- `detail_handle_source`

The importer must reject settings that require URL query parameters for campaign identity, app proxy paths as canonical shopper URLs, or hardcoded index/detail handles that cannot be changed.

---

## 13. Embedded Admin UX

Primary navigation:

- Dashboard
- Campaigns
- Offers
- Imports
- Discounts
- Translations
- Index page setup
- Campaign detail route setup
- Theme setup
- Diagnostics
- Settings

Publish blockers:

- Missing required base content.
- Invalid dates.
- Missing targets.
- Missing required locale coverage.
- Invalid discount config.
- Unresolved Shopify resources.
- Missing Function-backed discount node for enforceable discount.
- Price snapshot missing for price mutation.
- Configured index route missing, unpublished, or not renderable.
- Configured detail route strategy missing or not verified.
- Any feature configuration that requires Checkout UI extensions, Cart Transform, automated gift card issuance, automated store credit, Plus-only capabilities, canonical app-proxy shopper URLs, or URL parameters for campaign identity.

---

## 14. Testing Strategy

### 14.1 Required Unit Tests

- Lifecycle classification.
- Ended-window calculation.
- Campaign index sorting.
- PDP winner selection.
- Product target matching.
- Offer group de-duplication.
- Locale validation.
- Translation import handling.
- Discount config schema validation.
- Gift entitlement calculation.
- Volume tier selection.
- Price snapshot diffing.
- URL builder for configurable index and detail patterns.
- Rejection of URL-parameter campaign detail links.
- Rejection of unconfigured detail nesting assumptions.
- Verification that no literal index handle or detail prefix is required for tests to pass.

### 14.2 Required Integration Tests

- App-owned definition deployment verification.
- Shopify Page create/verify/adopt flow for a configurable index handle.
- Campaign detail route create/verify flow for configurable detail patterns.
- Campaign create/update/read cycle.
- Offer create/update/read cycle.
- Translation digest lookup and registration.
- Discount node creation and owner metafield write.
- Price mutation dry-run and rollback.
- Import dry-run and commit.
- Index rendering and campaign detail rendering across at least three route patterns:

```text
/pages/{index_handle}/{detail_handle}
/pages/{detail_handle}
/{detail_prefix}/{detail_handle}
```

### 14.3 Grow Compatibility Tests

- Install through public unlisted app flow or production-equivalent app-review test path.
- Confirm no direct custom-app Function install is required for Grow.
- Confirm no Checkout UI extension is required.
- Confirm no Cart Transform extension is required.
- Confirm no gift card scopes are requested.
- Confirm no store credit scopes are requested.
- Confirm configured index route is created or verified without prior merchant setup.
- Confirm configured detail route resolves campaign detail without URL parameters.
- Confirm PDP banners link to configured detail route.
- Confirm Discount Function still enforces final discount eligibility.

---

## 15. Work Packages

### WP1 — App Shell, Installation, and Grow Guardrails

Deliverables:

- Shopify app scaffold.
- Embedded admin shell.
- OAuth/session storage.
- Public unlisted distribution-ready config.
- English and French app UI locale files.
- Grow compatibility checker.

Acceptance criteria:

- App installs on a clean development store.
- Embedded admin loads successfully.
- App does not request excluded v1 scopes.
- App clearly identifies that production Grow Function features require public unlisted app distribution.

### WP2 — App-Owned Schema

Deliverables:

- `shopify.app.toml` definitions.
- Schema version constants.
- Definition verification service.
- Drift diagnostics.

Acceptance criteria:

- App-owned definitions deploy.
- Public content definitions are translatable.
- Campaign detail resources support configured detail URLs where the selected implementation uses renderable/Online Store metaobjects.
- No merchant-owned campaign or offer definitions are created.

### WP3 — Managed Sales Index Page

Deliverables:

- Page verification service.
- Page creation service using configurable index handle.
- Page adoption flow for existing pages.
- Theme-editor setup guidance for the index app block.
- Diagnostics for missing, hidden, renamed, or conflicting pages.

Acceptance criteria:

- Configured index page exists after onboarding or explicit merchant approval.
- The app does not overwrite merchant-authored page content without confirmation.
- The app block renders the sales index on the configured page.
- No specific literal index handle is required.

### WP4 — Dedicated Campaign Detail Routes

Deliverables:

- Configurable detail route strategy.
- Campaign handle URL builder.
- Detail route verification service.
- Detail rendering block/template.
- Diagnostics for route conflicts and missing detail URLs.

Acceptance criteria:

- Configured detail route resolves campaign detail without URL parameters.
- Detail route does not depend on implicit nesting under the index route.
- PDP banners and index cards link to configured detail route.
- No specific literal detail prefix is required.

### WP5 — Campaign and Offer Domain

Deliverables:

- Domain models.
- Validation schemas.
- Campaign CRUD.
- Offer CRUD.
- Product/collection/variant targeting.

Acceptance criteria:

- Merchant can create a draft campaign.
- Merchant can add offers.
- Merchant can resolve targets by handle, SKU, or selected resource.
- Validation blockers are clear.

### WP6 — Localization Integration

Deliverables:

- Locale service.
- Translation status service.
- Digest lookup service.
- Translation registration service.
- Translation dashboard.

Acceptance criteria:

- App lists enabled locales.
- App reports translation completeness.
- App seeds imported translations.
- App does not store canonical translations in DB.

### WP7 — Theme App Extension

Deliverables:

- Sales index block.
- Campaign detail block/template support.
- PDP banner block.
- Cart gift message block.
- Cart automation app embed.
- Extension locales in English and French.

Acceptance criteria:

- Blocks appear in theme editor.
- Blocks render in a clean OS 2.0 theme.
- Sales index renders at configured index route.
- Campaign detail renders at configured detail route.
- No Checkout UI extension or Cart Transform dependency exists.

### WP8 — Discount Functions

Deliverables:

- Generic Discount Function extension.
- Shared config schema.
- Discount node creation service.
- Owner metafield writer.
- Function tests.

Acceptance criteria:

- App creates Function-backed discounts from the public app.
- Function applies gift, volume, and product/order discounts correctly.
- Invalid config fails closed.
- Implementation does not require custom-app Function installation on Grow.

---

## 16. GitHub Copilot Development Invariants

Copilot and developers must preserve these rules:

1. Do not create merchant-owned campaign or offer metaobject definitions.
2. Do not use external DB tables as canonical campaign state.
3. Do not create language-specific source fields.
4. Do not create canonical translation tables.
5. Do not hardcode English as the only base locale.
6. Do not treat French as required by default.
7. Do not hardcode any index handle, detail parent handle, detail prefix, or detail path pattern.
8. Do not pass campaign handles through URL query parameters in canonical storefront links.
9. Do not infer detail URLs by nesting campaign handles under the configured index route unless that exact nested pattern is explicitly configured.
10. Do not make `/apps/...`, `/a/...`, `/community/...`, or `/tools/...` canonical shopper-facing routes in v1.
11. Do not mutate variant prices without snapshots.
12. Do not use cart JavaScript as discount authority.
13. Do not bypass Shopify translations for shopper-facing campaign content.
14. Do not request advanced scopes before features require them.
15. Do not edit merchant theme files directly.
16. Do not hardcode shop domains, GIDs, product IDs, collection IDs, variant IDs, or locale lists.
17. Do not silently overwrite merchant changes during rollback.
18. Do not allow invalid campaign configs to publish.
19. Do not show storefront promotions that checkout enforcement would reject.
20. Do not add pagination to the campaign index unless a measured performance requirement changes the product contract.
21. Do not add Checkout UI extensions to v1.
22. Do not add Cart Transform to v1.
23. Do not add automated Gift Card API issuance to v1.
24. Do not add automated store credit issuance to v1.
25. Do not require Shopify Plus for any v1 feature.
26. Do not validate Grow production readiness through a direct custom-app Function install.
27. Do not overwrite an existing merchant-created index page without explicit merchant approval.

---

## 17. Definition of Production Ready

The app is production ready for Shopify Grow when all of the following are true:

- The app is approved and installable as a public unlisted Shopify app.
- Clean install works on a Grow-compatible store with no prior SCS data.
- App-owned definitions deploy and verify.
- Configured index route is created, adopted, or verified safely.
- Configured detail route pattern is created, verified, or otherwise supported by the chosen Grow-compatible route strategy.
- Merchant can create, validate, publish, pause, expire, and archive a campaign.
- Campaign index works at the configured index route.
- Campaign detail works at the configured detail route without URL parameters.
- PDP banner links to the configured detail route.
- Cart gift messaging works when the merchant adds the cart block.
- Cart automation app embed can be enabled and disabled safely.
- Discount Function features work through the public app install path.
- Discount Function enforcement fails closed.
- Import dry-run and commit are idempotent.
- Translation seeding works for at least one non-base locale.
- Required-locale blockers work and are not hardcoded to French.
- Price mutation, if shipped, has snapshots and rollback.
- Manual future rewards are trackable without gift card or store credit automation.
- Diagnostics identify missing resources, invalid configs, discount drift, Grow-incompatible feature drift, index route drift, and detail route drift.
- App does not require manual theme code edits.
- App does not require merchant-created campaign or offer metaobject definitions.
- App does not require Checkout UI extensions.
- App does not require Cart Transform.
- App does not require automated Gift Card API issuance.
- App does not require automated store credit issuance.
- App does not require Shopify Plus.
- App does not use app proxy as the canonical shopper-facing route.
- App has no hardcoded requirement for any literal route handle or prefix.

---

## 18. References

[^shopify-page-create]: Shopify Developers, **pageCreate — GraphQL Admin API**. The `pageCreate` mutation creates Online Store pages and requires `write_content` or `write_online_store_pages`; pages support title, handle, body, publication state, and template suffix. <https://shopify.dev/docs/api/admin-graphql/latest/mutations/pageCreate>

[^shopify-page-object]: Shopify Developers, **Page — GraphQL Admin API**. Shopify Page objects are standalone Online Store content pages with handles, publication state, template suffixes, and translations, and require `read_content` or `read_online_store_pages` to read. <https://shopify.dev/docs/api/admin-graphql/latest/objects/Page>

[^shopify-metaobject-capabilities]: Shopify Developers, **Use metaobject capabilities**. Shopify documents metaobject capabilities including `renderable` for SEO metadata and `onlineStore` for assigning a theme template and defining a URL so metaobject entries can render as Online Store web pages. <https://shopify.dev/docs/apps/build/metaobjects/use-metaobject-capabilities>

[^shopify-metaobject-storefront]: Shopify Developers, **Metaobject — Storefront API**. Metaobjects with the `online_store` capability expose an `onlineStoreUrl`, and renderable metaobjects expose SEO metadata. <https://shopify.dev/docs/api/storefront/latest/objects/metaobject>

[^shopify-functions-availability]: Shopify Developers, **About Shopify Functions**. Shopify states that stores on any plan can use public apps distributed through the Shopify App Store that contain Functions, while custom apps containing Shopify Function APIs require Shopify Plus. <https://shopify.dev/docs/apps/build/functions>

[^shopify-theme-app-extensions]: Shopify Developers, **Theme app extensions** and **Configure theme app extensions**. Theme app extensions provide app blocks, app embed blocks, assets, snippets, and locale files for Online Store 2.0 themes without merchant code edits. <https://shopify.dev/docs/apps/build/online-store/theme-app-extensions> and <https://shopify.dev/docs/apps/build/online-store/theme-app-extensions/configuration>

[^shopify-discount-functions]: Shopify Developers, **Discount Function API**. The Discount Function API supports product, order, and shipping discount generation through Shopify Functions. <https://shopify.dev/docs/api/functions/latest/discount>

[^shopify-checkout-ui-extensions]: Shopify Developers, **Checkout UI extensions**. Shopify states that Checkout UI extensions for the information, shipping, and payment step are available only to Shopify Plus stores. <https://shopify.dev/docs/api/checkout-ui-extensions/latest>

[^shopify-cart-transform]: Shopify Developers, **Cart Transform Function API**. Shopify states that only development stores or Shopify Plus stores can use apps with line update/update operations. <https://shopify.dev/docs/api/functions/latest/cart-transform>
