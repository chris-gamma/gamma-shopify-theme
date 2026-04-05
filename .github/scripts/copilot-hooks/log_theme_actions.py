from __future__ import annotations

import json
from collections.abc import Mapping

from hook_common import JSONValue, append_ndjson, as_object, as_string, extract_file_changes, git_branch_name, is_theme_surface_path, load_payload


VALIDATION_MARKERS: tuple[str, ...] = (
    'shopify theme check',
    'shopify theme dev',
    'shopify theme profile',
)


def find_validation_marker(tool_input: Mapping[str, JSONValue]) -> str | None:
    serialized = json.dumps(tool_input, ensure_ascii=True).lower()
    for marker in VALIDATION_MARKERS:
        if marker in serialized:
            return marker
    return None


def main() -> int:
    payload = load_payload()
    tool_name = as_string(payload.get('tool_name'))
    tool_input = as_object(payload.get('tool_input')) or {}
    cwd = as_string(payload.get('cwd'))
    change_map = extract_file_changes(tool_name, tool_input, cwd)
    theme_paths = sorted(path for path in change_map if is_theme_surface_path(path))
    validation_marker = find_validation_marker(tool_input)

    if not theme_paths and not validation_marker:
        return 0

    log_entry: dict[str, object] = {
        'timestamp': as_string(payload.get('timestamp')),
        'sessionId': as_string(payload.get('sessionId')),
        'hookEventName': as_string(payload.get('hookEventName')),
        'toolName': tool_name,
        'toolUseId': as_string(payload.get('tool_use_id')),
        'branch': git_branch_name(),
        'paths': theme_paths,
        'pathCount': len(theme_paths),
        'validationMarker': validation_marker,
    }

    append_ndjson(
        'theme-actions.ndjson',
        log_entry,
    )
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
