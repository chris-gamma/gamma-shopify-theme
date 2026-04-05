# Copilot Workflows

Use this guide to choose the right Copilot customization surface for Gamma's single-client Horizon fork. The goal is to keep internal theme work predictable, narrow, and safe.

## Layers

- Instructions: always-on repo rules and file-scoped conventions. Start here for coding standards and surface ownership.
- Prompts: lightweight slash commands that focus work on the right workflow.
- Skills: reusable multi-step capabilities with checklists, templates, or examples.
- Hooks: deterministic runtime enforcement for validation, approval, and logging.
- Reference docs: stable playbooks and hotspot maps for repeated maintenance work such as upstream Horizon syncs.

Prompts, skills, and reference docs are maintained workflow assets. When repeated work reveals a better pattern, command, edge case, pitfall, or workflow correction, update the owning doc in the same change; see [maintenance](./maintenance.md).

## Default Flow

1. Plan the work with `/plan` when the correct surface, merchant impact, or validation scope is not obvious.
2. Implement with `/section`, `/block`, `/snippet`, `/locale`, `/lint`, or `/schema` depending on the owning surface.
3. Review the resulting diff with `/review`.
4. Validate the final change with `/validate-theme` when you need a single QA-ready verification pass.
5. Summarize completed work with `/client-release-notes` when the change needs an internal handoff or merchant-facing summary.

## Prompt Map

- `/plan`: plan a change before editing.
- `/review`: review a completed change.
- `/schema`: handle schema, template JSON, and locale-label work.
- `/section`: implement section-level changes.
- `/block`: implement block-level changes.
- `/snippet`: create or refactor reusable snippets.
- `/locale`: add or fix localization.
- `/lint`: run Theme Check-only fixes.

## Skill Map

- `/performance-pass`: investigate repeated Liquid or route-level performance issues.
- `/validate-theme`: run Gamma's standard post-change validation workflow.
- `/schema-migration`: coordinate schema, template JSON, and locale contract changes.
- `/locale-audit`: detect and fix hardcoded shopper or editor copy.
- `/liquiddoc-contracts`: update reusable snippet or static-block documentation.
- `/client-release-notes`: turn a completed diff into developer-facing and merchant-facing release notes.

## Hook Expectations

- Theme file edits trigger the format-and-check hook, which runs safe post-edit validation.
- Editor-managed and customization-control files may require manual approval when the protection hook is enabled.
- Theme action logging is written to `.git/copilot-hooks/` so the tracked worktree stays clean.

## Upstream sync references

- Use `.github/reference/upstream-sync-playbook.md` for the approved branch-role workflow, file-category policy, and validation checklist.
- Use `.github/reference/merge-hotspots.md` as a compact review aid before resolving conflicts in Gamma-customized surfaces.
- During upstream sync work, follow the playbook before asking Copilot to resolve contract-sensitive conflicts.

## When Not to Add More Surfaces

- Do not add a new prompt when an existing skill already owns a multi-step workflow.
- Do not add a hook when instructions or a skill are enough.
- Do not bypass the current prompts with generic ask-mode work for repetitive internal workflows.
