# Instruction Maintenance

This instruction system is meant to stay current with the theme. Treat it like source code.

## When guidance must change

Update the instruction or reference layer in the same change when you do any of the following:

- Add a new reusable section, block, snippet, asset family, or template surface
- Introduce a pattern that will likely be reused in more than one place
- Change how a major family is extended, configured, or wired in JSON
- Add a new static block contract or nested JSON pattern that the existing docs do not describe
- Add a new theme surface that is not currently covered by an `applyTo` rule
- Add, remove, or reroute a prompt, skill, or hook used for repeated internal theme workflows
- Discover a reusable pattern, edge case, pitfall, better command, or workflow correction while doing the work; update the owning instruction, prompt, skill, or reference in the same change instead of waiting to be asked

## Where to update

- Change affects Liquid rules across multiple surfaces: `theme-liquid.instructions.md`
- Change affects layout shell behavior: `layout.instructions.md`
- Change affects section or block responsibilities: `blocks-sections.instructions.md`
- Change affects snippet contracts: `snippets.instructions.md`
- Change affects standalone template Liquid: `template-liquid.instructions.md`
- Change affects global settings or template JSON wiring: `theme-json.instructions.md`
- Change affects section groups: `section-groups.instructions.md`
- Change affects static block contracts: `static-blocks.instructions.md`
- Change adds a new real-world example or clarifies placement: `surface-patterns.md`
- Change alters how a family should be extended: `component-families.md`
- Change affects how prompts, skills, or hooks should be chosen: `copilot-workflows.md`
- Change affects upstream Horizon sync procedure or branch-role merge policy: `upstream-sync-playbook.md`
- Change affects recurring merge-sensitive Gamma surfaces: `merge-hotspots.md`
- Change creates a brand-new surface: add a new scoped instruction file and link it from `.github/copilot-instructions.md`

## Done criteria for guidance updates

- The root file remains short and always-on.
- Scoped files describe enforceable rules, not vague style preferences.
- Reference docs point to real patterns already present in the repo.
- No dead links or obsolete file names remain in the index.
- Validation requirements still match the repo's actual tooling.
- Wording stays original and repo-specific.

## Self-check before closing a change

- If another teammate touched the same files tomorrow, would the correct surface for the next change be obvious?
- If a new static block were added, would the docs tell them how to wire JSON correctly?
- If a new variation were added to an existing family, would the docs tell them whether it belongs in a section, block, snippet, or asset?
- If a merchant-facing setting or string changed, would the docs point them to the correct JSON or locale file?

## What not to do

- Do not let the root file absorb file-type detail.
- Do not add prompt files or skills unless there is a repeated workflow that needs one.
- Do not copy wording from legacy guidance. Re-express the rule in the language that best fits the current repo.
