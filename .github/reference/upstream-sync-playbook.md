# Upstream Sync Playbook

Use this playbook for every Gamma sync from Shopify Horizon. It is branch-role based on purpose so it stays correct even if the repo's named branches change later.

## Branch roles

- Protected deployment branch: any branch that can serve production or a live campaign theme.
- Receiving branch: the branch that currently aggregates the next deployable state.
- Temporary upstream-sync branch: a fresh `upstream-sync/*` branch created from the current receiving branch for each upstream update.
- Clean upstream version branch: an immutable branch in this repo that matches a specific upstream Horizon version or commit exactly, named `horizon/vX.Y.Z`.
- Feature branch: isolated work that should consume completed upstream syncs rather than each merging upstream independently.
- Release candidate branch: optional, only if the repo currently uses that role.

## Vendor baselines

- `horizon/v3.4.0` is the current example vendor baseline for upstream Horizon `df79657df860c120cee4925d218915b524bd2b76`.
- Every `horizon/vX.Y.Z` branch must remain a clean upstream snapshot with no Gamma commits.
- Upstream sync pull requests must identify the exact Horizon source branch plus the source tag, release, or commit SHA.

## Required sources before conflict resolution

- `CHANGES.md` for Gamma-specific behavior that must survive.
- `README.md` for repo operating context and merge workflow entry points.
- `.github/instructions/locales.instructions.md` for locale allowlist and key rules.
- `.github/instructions/theme-json.instructions.md` for merchant contract and template JSON rules.
- `.github/instructions/static-blocks.instructions.md` for static block wiring rules.
- `.github/reference/merge-hotspots.md` for a compact map of recurring technical hotspots.

## Core policy

1. Gamma behavior is the primary contract.
2. If upstream and Gamma both changed a file, do not overwrite Gamma with upstream.
3. Start from upstream's newer structure and re-integrate Gamma behavior into it.
4. Never use blanket `accept theirs`, blanket `accept ours`, or `git merge -X theirs` on customized theme code.
5. Files affecting merchant configuration, shopper-facing behavior, template wiring, static block trees, locale keys, pricing/search/product/header/cart behavior, or campaign/metaobject flows are manual-review territory.
6. Non-allowlisted locale files must not remain tracked after an upstream sync.

## Merge workflow

1. Fetch the latest refs.

```sh
git fetch origin
git fetch upstream --tags
```

1. Update the current receiving branch locally.

```sh
git switch <receiving-branch>
git pull --ff-only origin <receiving-branch>
```

1. Create the sync branch from the current receiving branch.

```sh
git switch -c upstream-sync/2026-04-23-horizon-v3.4.0
```

1. Merge the selected clean upstream version branch into the sync branch.

```sh
git merge --no-ff --no-commit horizon/v3.4.0
```

1. Classify changed files before resolving anything:

- safe upstream
- safe Gamma
- manual re-integration
- delete-after-merge locale files
- contract-risk files requiring human review

1. Resolve conflicts with the file-category policy below.
1. Remove non-allowlisted locale files from the sync branch.
1. Run the required validation.
1. Open a pull request from the sync branch into the current receiving branch.

Use the upstream-sync PR template by appending `?template=upstream-sync.md` to the GitHub new-pull-request URL. The template is at `.github/PULL_REQUEST_TEMPLATE/upstream-sync.md` and is not automatically selected.

If no integration branch exists, that pull request is the review path before anything reaches a protected deployment branch.

## File-category merge policy

| Category | Default action | Notes |
| --- | --- | --- |
| Changed upstream, unchanged by Gamma | Take upstream | Review if it touches documented hotspots or contracts |
| Changed only by Gamma | Keep Gamma | Unless the surrounding upstream surface was deleted or replaced |
| Changed by both | Manual re-integration | Start from upstream structure, then port Gamma behavior |
| Deleted by Gamma, reintroduced upstream | Keep deleted by default | Especially true for non-allowlisted locales |
| `config/settings_data.json` | Keep ours | Merchant/store data |
| `config/settings_schema.json` | Manual review | Merchant-facing configuration contract |
| `templates/**/*.json` | Manual review | Preserve stable IDs, `order`, `block_order`, and static block tree shape |
| Allowlisted `locales/*.json` | Manual review | Preserve Gamma-required keys and merge upstream additions selectively |
| Non-allowlisted `locales/*.json` | Remove after merge | Validate with `.github/scripts/validate_locale_allowlist.py` |
| `sections/*.liquid`, `blocks/*.liquid`, `snippets/*.liquid`, `assets/*.js`, `assets/*.css` | Take upstream only if Gamma never touched the file | Otherwise re-integrate Gamma behavior into upstream structure |
| `.github/**` and repo-operating files | Prefer ours when appropriate | Selectively port useful upstream ideas if they are still relevant |

## Conflict-resolution rules

- Upstream bug fix plus Gamma customization: keep the fix and reapply Gamma behavior inside the fixed structure.
- Upstream refactor plus Gamma custom behavior: follow the refactor and relocate Gamma behavior to the new abstraction boundary.
- Upstream new feature overlapping Gamma logic: preserve Gamma's shopper-facing and merchant-facing behavior first, then adopt compatible upstream improvements.
- Upstream deletion of code Gamma extended: decide whether the Gamma behavior still belongs. If yes, move it to the surviving upstream surface instead of reviving dead code blindly.
- Renamed or moved files: port Gamma behavior into the new path. Do not keep parallel legacy files unless the repo intentionally needs both.
- Schema or locale key changes: do not leave partial migrations. Update every reference in the same pull request.
- Static block changes: verify the matching template JSON node, nested block tree, and `block_order` entry before approval.

## Locale allowlist policy

- The tracked locale set must match `.github/locale-allowlist.txt` exactly.
- Current allowlist:
  - `locales/en.default.json`
  - `locales/en.default.schema.json`
  - `locales/fr.json`
  - `locales/fr.schema.json`
- Extra locale files from upstream must be removed from the sync branch before approval.
- Run:

```sh
python3 .github/scripts/validate_locale_allowlist.py
```

## Validation after sync

Run all of the following before approval:

```sh
python3 .github/scripts/validate_locale_allowlist.py
shopify theme check
```

Then verify the affected surfaces in both:

- `shopify theme dev` storefront preview
- Shopify theme editor

Profile repeated or Liquid-heavy surfaces with `shopify theme profile` when the sync changed nested block trees, repeated cards, or other server-rendered hot paths.

## Feature branch guidance

- Active feature branches should merge or rebase from the receiving branch after an upstream sync is completed.
- Feature branches should not each merge Horizon independently.

## Local Git recommendations

These are recommended but not enforced by the repo:

```sh
git config merge.ours.driver true
git config rerere.enabled true
git config rerere.autoupdate true
```

The `merge.ours.driver` setting is required for `.gitattributes` to automatically keep the repo's version of `config/settings_data.json` during a merge. Without it, Git uses its default three-way merge on that file instead.

Use rerere to reduce repeat conflict work across future Horizon updates.
