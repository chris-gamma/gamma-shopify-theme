from __future__ import annotations

import re

from hook_common import ChangeInfo, as_object, as_string, emit_json, extract_command_text, extract_file_changes, load_payload


SETTINGS_DATA_PATH = 'config/settings_data.json'
TEMPLATE_REWRITE_THRESHOLD = 120
LOCALE_REWRITE_THRESHOLD = 80
CONTROL_PATHS = {
    '.shopifyignore',
    '.theme-check.yml',
    'shopify.theme.toml',
}
COMMAND_APPROVAL_PATTERNS: tuple[tuple[re.Pattern[str], str], ...] = (
    (
        re.compile(r'\bshopify\s+theme\s+publish\b'),
        'Publishing a Shopify theme requires manual approval because it changes live or preview theme state.',
    ),
    (
        re.compile(r'\bshopify\s+theme\s+push\b'),
        'Pushing a Shopify theme requires manual approval because it updates remote theme files.',
    ),
    (
        re.compile(r'\bshopify\s+theme\s+pull\b'),
        'Pulling a Shopify theme requires manual approval because it can overwrite local working files.',
    ),
    (
        re.compile(r'\bshopify\s+auth\s+logout\b'),
        'Logging out of Shopify CLI requires manual approval because it changes local authentication state.',
    ),
    (
        re.compile(r'\bgit\s+push\b[^\n]*(?:--force|-f)(?:\s|$)'),
        'Force-pushing git history requires manual approval because it rewrites remote branch state.',
    ),
)
COMMAND_DENY_PATTERNS: tuple[tuple[re.Pattern[str], str], ...] = (
    (
        re.compile(r'\bgit\s+reset\s+--hard\b'),
        'Running git reset --hard is blocked because it discards local changes.',
    ),
    (
        re.compile(r'\bgit\s+checkout\s+--\b'),
        'Running git checkout -- is blocked because it discards local file changes.',
    ),
    (
        re.compile(r'\bgit\s+clean\b[^\n]*-[^\n]*f'),
        'Running git clean with force is blocked because it removes untracked files.',
    ),
    (
        re.compile(r'\bshopify\s+theme\s+delete\b'),
        'Deleting a Shopify theme is blocked because it is a destructive remote operation.',
    ),
)
NEGATION_MARKERS: tuple[str, ...] = ('do not', "don't", 'avoid', 'never', 'without', 'skip', 'instead of')


def is_template_json(path: str) -> bool:
    return path.startswith('templates/') and path.endswith('.json')


def is_locale_json(path: str) -> bool:
    return path.startswith('locales/') and path.endswith('.json')


def is_control_path(path: str) -> bool:
    return path.startswith('.github/') or path in CONTROL_PATHS


def total_delta(change_map: dict[str, ChangeInfo], paths: list[str]) -> int:
    total = 0
    for path in paths:
        change = change_map[path]
        total += change['added'] + change['removed'] + change['content_lines']
    return total


def append_once(items: list[str], message: str) -> None:
    if message not in items:
        items.append(message)


def has_unnegated_match(command_text: str, pattern: re.Pattern[str]) -> bool:
    for match in pattern.finditer(command_text):
        window_start = max(0, match.start() - 80)
        window = command_text[window_start:match.start()]
        if any(marker in window for marker in NEGATION_MARKERS):
            continue
        return True

    return False


def main() -> int:
    payload = load_payload()
    tool_name = as_string(payload.get('tool_name'))
    tool_input = as_object(payload.get('tool_input')) or {}
    cwd = as_string(payload.get('cwd'))
    change_map = extract_file_changes(tool_name, tool_input, cwd)
    command_text = extract_command_text(tool_name, tool_input).lower()

    if not change_map and not command_text:
        return 0

    deny_reasons: list[str] = []
    ask_reasons: list[str] = []
    context_notes: list[str] = []

    control_paths = [path for path in change_map if is_control_path(path)]
    if control_paths:
        append_once(
            ask_reasons,
            'Editing Copilot customization, validation, or store-targeting control files requires manual approval because these files change repo-wide automation behavior.',
        )
        context_notes.append('Keep control-file diffs minimal and revalidate prompt, skill, hook, and CLI behavior after approval.')

    settings_data_change = change_map.get(SETTINGS_DATA_PATH)
    if settings_data_change:
        if 'delete' in settings_data_change['actions']:
            append_once(deny_reasons, 'Deleting config/settings_data.json is blocked because it is live merchant store data.')
        else:
            append_once(ask_reasons, 'Editing config/settings_data.json requires manual approval because it is editor-managed store data.')
            context_notes.append('Prefer schema, locale, or template changes unless seeded store data was explicitly requested.')

    template_paths = [path for path in change_map if is_template_json(path)]
    if template_paths:
        template_delta = total_delta(change_map, template_paths)
        template_actions = {action for path in template_paths for action in change_map[path]['actions']}
        if len(template_paths) > 1 or template_delta >= TEMPLATE_REWRITE_THRESHOLD or {'add', 'delete'} & template_actions:
            append_once(ask_reasons, 'Large template JSON rewrites require manual approval because stable section and block IDs are editor-managed.')
            context_notes.append('Keep template JSON diffs narrow and preserve sections, order, blocks, and block_order contracts.')

    locale_paths = [path for path in change_map if is_locale_json(path)]
    if locale_paths:
        locale_delta = total_delta(change_map, locale_paths)
        locale_actions = {action for path in locale_paths for action in change_map[path]['actions']}
        if len(locale_paths) > 1 or locale_delta >= LOCALE_REWRITE_THRESHOLD or {'add', 'delete'} & locale_actions:
            append_once(ask_reasons, 'Broad locale rewrites require manual approval because these files are generated, ordered, and easy to churn accidentally.')
            context_notes.append('Keep locale changes near related keys and validate references with shopify theme check after approval.')

    if command_text:
        for pattern, reason in COMMAND_DENY_PATTERNS:
            if has_unnegated_match(command_text, pattern):
                append_once(deny_reasons, reason)

        for pattern, reason in COMMAND_APPROVAL_PATTERNS:
            if has_unnegated_match(command_text, pattern):
                append_once(ask_reasons, reason)

        if deny_reasons or ask_reasons:
            context_notes.append('Prefer non-destructive validation and inspection commands unless the user explicitly approves a state-changing action.')

    if deny_reasons:
        emit_json(
            {
                'hookSpecificOutput': {
                    'hookEventName': 'PreToolUse',
                    'permissionDecision': 'deny',
                    'permissionDecisionReason': ' '.join(deny_reasons),
                    'additionalContext': ' '.join(context_notes),
                }
            }
        )
        return 0

    if ask_reasons:
        emit_json(
            {
                'hookSpecificOutput': {
                    'hookEventName': 'PreToolUse',
                    'permissionDecision': 'ask',
                    'permissionDecisionReason': ' '.join(ask_reasons),
                    'additionalContext': ' '.join(context_notes),
                }
            }
        )

    return 0


if __name__ == '__main__':
    raise SystemExit(main())
