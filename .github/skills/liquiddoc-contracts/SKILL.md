---
name: liquiddoc-contracts
description: "Add or repair LiquidDoc for reusable snippets and static blocks in Gamma's Horizon-based theme, including parameter contracts, `closest.*` context, and examples that match real call sites. Use when docs must stay aligned with reusable Liquid interfaces."
argument-hint: "Describe the snippet or static block, the contract drift, and any affected call sites"
---

# LiquidDoc Contracts

Use this skill when reusable Liquid surfaces need accurate contract docs, not generic comments. In Gamma, that means snippet headers and underscore-block headers should explain exactly what callers pass, what stays global, and how the surface is supposed to be reused.

## When to Use

- Adding a new reusable snippet
- Changing parameters accepted by an existing snippet
- Adding or updating an underscore-prefixed static block
- Repairing stale `@param` or `@example` entries after a refactor
- Auditing whether a reusable surface is documented tightly enough for another developer or agent to call correctly

## Do Not Use

- Section or public block schema documentation
- One-off inline code comments
- Copy or locale work with no reusable Liquid contract change

## Read First

- [../../copilot-instructions.md](../../copilot-instructions.md)
- [../../instructions/theme-liquid.instructions.md](../../instructions/theme-liquid.instructions.md)
- [../../instructions/snippets.instructions.md](../../instructions/snippets.instructions.md)
- [../../instructions/static-blocks.instructions.md](../../instructions/static-blocks.instructions.md)
- [./examples.md](./examples.md)

## Workflow

### 1. Identify the Real Contract Owner

Decide whether the file is:

- A render-only snippet in `snippets/*.liquid`
- A static infrastructure block in `blocks/_*.liquid`

Snippets and static blocks are the main targets for LiquidDoc in this repo. Do not broaden the header to describe behavior owned elsewhere.

### 2. Audit Call Sites Before Writing the Header

For snippets:

- Search for every `render 'snippet-name'` call
- Record which parameters are passed explicitly
- Ignore globals that are available without being passed

For static blocks:

- Search for every `content_for 'block', type: '_block-name'` call
- Record any keyword arguments such as `closest.product`, `closest.collection`, or explicit IDs

### 3. Separate Explicit Parameters From Ambient Globals

Document only what the caller must know.

Usually that means:

- Required passed-in objects or strings
- Optional parameters in brackets
- Captured markup like `children`, `media_gallery`, or `product_details`
- `closest.*` resource context for underscore blocks

Do not document `settings`, `shop`, `routes`, `request`, or other globals unless the caller passes them explicitly.

### 4. Write a Tight LiquidDoc Header

Every header should include:

- One sentence describing what the file renders or wraps
- Every accepted parameter with `@param`
- Optional parameters in brackets
- At least one `@example` that matches a real repo usage pattern

Keep descriptions brief. The point is call-site clarity, not prose.

### 5. Match the Example to the Real Usage

Examples should look like a real Gamma call site, including:

- The actual snippet name
- A realistic static block ID when documenting an underscore block
- `closest.*` arguments when the parent passes resource context

If there are multiple call shapes, show the representative one, not every variant.

### 6. Fix Drift You Discover

If the header and file behavior disagree, do one of these in the same change:

- Update the LiquidDoc to match the real contract
- Tighten the file so it matches the documented contract
- Remove stale examples that imply unsupported parameters

### 7. Validate the Surface

After updating the header:

- Run `shopify theme check`
- Use Shopify Dev MCP theme validation when the edited file is part of a broader theme change
- Re-read one or two representative call sites to ensure the example still mirrors reality

## Repo-Specific Reminders

- Snippets stay render-only in Gamma. Do not let a LiquidDoc update normalize `content_for` inside snippets.
- Underscore blocks are template-contract surfaces. Document `closest.*` and static block expectations when they matter to the caller.
- Reusable wrapper snippets in this repo often accept captured markup strings. Call that out directly instead of describing them as generic "content."

## Example Uses

- "Update the LiquidDoc for `snippets/product-card.liquid` after adding a new captured region."
- "Document the `closest.product` contract for a new `_product-card` child block."
- "Audit stale examples in shared wrapper snippets after a product layout refactor."