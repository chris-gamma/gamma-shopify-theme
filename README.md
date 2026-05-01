# Gamma-Shopify-Theme

**Version**: 0.1.0 (2026-02-12)

**Author**: Christopher Forrester

**Forked from**: [Shopify/horizon](https://github.com/Shopify/horizon) (originally based on v3.3.1)

## Table of contents

- [Gamma-Shopify-Theme](#gamma-shopify-theme)
  - [Table of contents](#table-of-contents)
  - [Setup](#setup)
    - [Staying up to date with Horizon changes](#staying-up-to-date-with-horizon-changes)
    - [Shopify AI Toolkit](#shopify-ai-toolkit)
    - [Shopify CLI](#shopify-cli)
    - [Metaobject definitions](#metaobject-definitions)
    - [One-time Git setup](#one-time-git-setup)
  - [Development](#development)
    - [Agentic workflows](#agentic-workflows)

---

Based on Shopify's Horizon theme, with customizations for the Gamma Shopify store. This repository is intended for use by developers who are building and maintaining the Gamma Shopify theme, and includes only the theme code. All project repositories will eventually live under the `gamma` organization on GitHub, but this repository is currently located in the personal account of the author. Contact Christopher Forrester (<chris@locationgamma.com>) for access.

This theme is served live on the Gamma Shopify store from a protected deployment branch, and may also be served from other branches during sales campaigns that customize the theme.

> Be aware that changes to a protected deployment branch may be reflected immediately on a live store or live campaign theme.

## Setup

This repository is designed to be used with GitHub Copilot, if desired. The existing codebase and documentation are structured to provide clear guidance for both human developers and AI tools. Other AI tools may also be used, but GitHub Copilot is the primary focus for code generation and workflow assistance.

### Staying up to date with Horizon changes

When first cloning this repository, add a remote `upstream` pointing to the Horizon repository.

1. Navigate to your local theme folder.
2. Verify the list of remotes and validate that you have both an `origin` and `upstream`:

```sh
git remote -v
```

1. If you don't see an `upstream`, you can add one that points to Shopify's Horizon repository:

```sh
git remote add upstream https://github.com/Shopify/horizon.git
```

1. Fetch the latest Horizon changes:

```sh
git fetch upstream
```

Do not use a direct `git pull upstream main` workflow for this repo's long-lived downstream branch history.

Gamma uses clean upstream version branches such as `horizon/v3.4.0` as immutable vendor baselines. Each upstream update should:

1. Start from the current receiving branch.
2. Create a temporary `upstream-sync/*` branch.
3. Merge a specific clean upstream version branch such as `horizon/v3.4.0` into that sync branch.
4. Re-integrate Gamma behavior into the upstream structure where both changed the same file.
5. Land by pull request into the current receiving branch.

See [`.github/reference/upstream-sync-playbook.md`](.github/reference/upstream-sync-playbook.md) for the required branch-role workflow, merge policy, locale allowlist policy, and validation checklist.

### Shopify AI Toolkit

If you intend to use AI development tools, you should install the [Shopify AI Toolkit](https://shopify.dev/docs/apps/build/ai-toolkit). This will allow you to use GitHub Copilot to generate code that is consistent with the existing codebase and follows Shopify's best practices.

1. Ensure the [Agent plugins](https://code.visualstudio.com/docs/copilot/customization/agent-plugins) preview is enabled in your VS Code settings.

2. Open the Command Palette (`Cmd+Shift+P` on MacOS, `Ctrl+Shift+P` on Windows/Linux) and run:

   Chat: Install Plugin From Source

3. Enter the repository URL:

   <https://github.com/Shopify/shopify-ai-toolkit>

For more information on using the Shopify AI Toolkit, refer to the [Shopify AI Toolkit documentation](https://shopify.dev/docs/apps/build/ai-toolkit).

### Shopify CLI

You should also install the [Shopify CLI](https://shopify.dev/docs/api/shopify-cli) to easily run and test your theme locally. You can install it using npm with the following command in your terminal:

```sh
npm install -g @shopify/cli@3.93.2
```

The repo CI workflow pins the same version. Update both when upgrading.

You can then use `shopify theme dev -e dev` to serve the theme locally against the dev theme and see your changes in real time at `http://localhost:9292/en`. The CLI will watch for changes in your theme files and automatically refresh the browser when you make updates.

> Note: Open the local preview at `http://localhost:9292/en`, not the root URL. This theme's preview can handle locales inconsistently at `/`, so using `/en` avoids locale-related preview issues.

The `shopify.theme.toml` at the repo root defines the following environments:

- `default` — the dev theme (`152420548781`). Bare commands with no `-e` flag target this environment, keeping unqualified operations safe.
- `dev` — the development/preview theme (`152420548781`). Equivalent to default; use `-e dev` to be explicit.
- `production` — the live store theme (`152421925037`). Always pass `-e production` explicitly; never push here without intent.

Use `shopify theme console` to view logs and debug information while developing your theme.

Use `shopify theme check` to validate your theme and ensure it meets Shopify's requirements before deploying.

For more information on using the Shopify CLI, refer to the [Shopify CLI documentation](https://shopify.dev/docs/api/shopify-cli).

### Metaobject definitions

The live Shopify store is the source of truth for Gamma's metaobject definitions. This repo exports those definitions into `docs/metaobjects/` as store schema documentation for developers and Copilot. They are not theme assets and are not deployed by Shopify theme pushes.

To configure local access for the `Metaobject Definition Exporter` app, copy `.env.example` to `.env.local` and fill in:

- `SHOPIFY_SHOP_DOMAIN`
- `SHOPIFY_CLIENT_ID`
- `SHOPIFY_CLIENT_SECRET`
- optional `SHOPIFY_API_VERSION` (defaults to `2026-04`)

The Shopify app must be installed on the target store and include the Admin API scope `read_metaobject_definitions`.

Update committed definition docs from the live store with:

```sh
npm run metaobjects:update
```

Verify that the committed docs are still current with the live store without writing files:

```sh
npm run metaobjects:check
```

The exporter writes one definition file per metaobject type plus an index file here:

- `docs/metaobjects/index.json`
- `docs/metaobjects/*.definition.json`

### One-time Git setup

After cloning the repo, run this command once to activate the `merge=ours` driver for `config/settings_data.json`:

```sh
git config merge.ours.driver true
```

This protects live merchant settings during Git merges and upstream Horizon syncs. Without it, Git falls back to a standard merge on that file and may overwrite store-specific settings. The rule in `.gitattributes` has no effect until this command is run locally.

## Development

All development work should be done in feature branches. Feature branches should consume completed upstream syncs from the current receiving branch rather than each merging Horizon independently. Completed work should land in the current receiving branch or release candidate branch, if that role is currently in use.

### Agentic workflows

This repo includes local Copilot slash commands for planning, implementation, review, validation, and follow-up documentation. For most work, start with the command that matches the owning surface instead of using a generic prompt.

Theme prompts:

- `/plan`: Read-only planning. Use this first when the correct surface, merchant impact, or validation scope is not obvious.
- `/section`: Section-level implementation.
- `/block`: Block-level implementation, including dynamic versus static block decisions.
- `/snippet`: Reusable snippet work, including LiquidDoc-aware refactors.
- `/locale`: Locale-key and copy moves.
- `/schema`: Schema, template JSON, static block wiring, and related locale-label work.
- `/lint`: Focused `shopify theme check` fixes only.
- `/review`: Read-only change review after implementation.

Workflow skills:

- `/schema-migration`: Coordinate schema changes with template JSON, locale keys, and merchant-impact checks.
- `/locale-audit`: Find and fix hardcoded shopper-facing or editor-facing copy.
- `/liquiddoc-contracts`: Add or repair LiquidDoc for reusable snippets and underscore-prefixed static blocks.
- `/performance-pass`: Investigate route or component-family performance issues.
- `/validate-theme`: Run the repo's final validation workflow across Theme Check, storefront and editor verification, and profiling guidance where needed.
- `/client-release-notes`: Turn a real diff into developer-facing and merchant-facing release notes.

Use these workflows with the repo guidance, not as a shortcut around it. The key files are:

- `.github/instructions/`: File-scoped rules that tell Copilot how to work on each theme surface.
- `.github/reference/copilot-workflows.md`: A map of how the prompts, skills, and hooks fit together.
- `.github/reference/upstream-sync-playbook.md`: The required workflow for syncing Gamma from clean Horizon vendor baselines.
- `.github/reference/merge-hotspots.md`: A compact map of the merge-sensitive Gamma hotspots that require manual review.
- `.github/copilot-instructions.md`: The repo-wide operating rules, including required validation.

In practice, pick the narrowest workflow that matches the surface you are editing, especially for repeated Liquid, nested static block trees, and editor-managed JSON, and still run `shopify theme check` plus storefront and theme-editor verification when possible.
