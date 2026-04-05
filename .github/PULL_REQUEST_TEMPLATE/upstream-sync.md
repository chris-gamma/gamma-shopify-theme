# Upstream sync pull request

> **Template selection**: This template is not applied automatically. To use it, append `?template=upstream-sync.md` to the GitHub new-pull-request URL, or select it from the template chooser if your org has template choosers enabled.

## Upstream sync summary

- Receiving branch role identified:
- Horizon source branch identified (for example `horizon/v3.4.0`):
- Upstream source tag, release, or commit SHA identified:

## Review checklist

- [ ] I started from the current receiving branch and worked on a temporary `upstream-sync/*` branch.
- [ ] The selected `horizon/vX.Y.Z` branch is a clean upstream snapshot with no Gamma commits.
- [ ] I reviewed the overlap set before resolving conflicts.
- [ ] I removed all non-allowlisted locale files.
- [ ] I manually reviewed contract-sensitive files.
- [ ] I preserved Gamma behavior where both Gamma and upstream changed the same surface.
- [ ] I did not use blanket `theirs`, blanket `ours`, or `git merge -X theirs` on customized theme code.

## Validation

- [ ] `python3 .github/scripts/validate_locale_allowlist.py`
- [ ] `shopify theme check`
- [ ] Storefront verification completed
- [ ] Theme editor verification completed
- [ ] Profiling completed or explicitly marked not needed

## Merge notes

- What came from upstream:
- What Gamma behavior was preserved:
- What was manually re-integrated:
- What still requires review or follow-up testing:
