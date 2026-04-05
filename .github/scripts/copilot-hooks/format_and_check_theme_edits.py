from __future__ import annotations

import json
from collections.abc import Mapping
from pathlib import Path
from typing import TypeAlias

from hook_common import (
    JSONObject,
    JSONValue,
    REPO_ROOT,
    as_int,
    as_list,
    as_object,
    as_string,
    emit_json,
    extract_file_changes,
    find_prettier,
    get_shopify_command,
    is_theme_surface_path,
    load_payload,
    normalize_path,
    parse_apply_patch_added_chunks,
    run_command,
    top_level_dirs,
)


FULL_THEME_CHECK_DIRS = {'config', 'locales', 'templates'}
FORMATTABLE_EXTENSIONS = {'.css', '.js'}
CHECKABLE_EXTENSIONS = {'.json', '.liquid'}
MAX_SUMMARY_OFFENSES = 6
LineRange: TypeAlias = tuple[int, int]
LineRangesByPath: TypeAlias = dict[str, list[LineRange] | None]


def should_format(path: str) -> bool:
    parsed = Path(path)
    if parsed.suffix not in FORMATTABLE_EXTENSIONS:
        return False
    return bool(parsed.parts) and parsed.parts[0] == 'assets'


def should_theme_check(path: str) -> bool:
    parsed = Path(path)
    return parsed.suffix in CHECKABLE_EXTENSIONS and bool(parsed.parts) and parsed.parts[0] != 'assets'


def maybe_run_prettier(paths: list[str]) -> None:
    prettier = find_prettier()
    if not prettier:
        return

    eligible = [path for path in paths if should_format(path)]
    if not eligible:
        return

    run_command([prettier, '--write', *eligible], timeout=45)


def theme_check_scope(paths: list[str]) -> str:
    directories = top_level_dirs(paths)
    if len(directories) != 1:
        return '.'
    if directories[0] in FULL_THEME_CHECK_DIRS:
        return '.'
    return directories[0]


def parse_theme_check_output(raw_output: str) -> list[JSONObject]:
    if not raw_output.strip():
        return []
    try:
        parsed = json.loads(raw_output)
    except json.JSONDecodeError:
        return []

    parsed_list = as_list(parsed)
    if parsed_list is None:
        return []

    entries: list[JSONObject] = []
    for item in parsed_list:
        entry = as_object(item)
        if entry is not None:
            entries.append(entry)
    return entries


def filter_entries(entries: list[JSONObject], changed_paths: set[str]) -> list[JSONObject]:
    filtered: list[JSONObject] = []
    for entry in entries:
        rel_path = normalize_path(as_string(entry.get('path')))
        if rel_path and rel_path in changed_paths:
            filtered.append(entry)
    return filtered


def locate_added_chunk_ranges(path: str, chunks: list[list[str]]) -> list[tuple[int, int]]:
    file_path = REPO_ROOT / path
    if not file_path.exists():
        return []

    try:
        file_lines = file_path.read_text(encoding='utf-8').splitlines()
    except UnicodeDecodeError:
        return []

    ranges: list[tuple[int, int]] = []

    for chunk in chunks:
        if not chunk:
            continue

        matches: list[tuple[int, int]] = []
        chunk_length = len(chunk)

        for index in range(0, len(file_lines) - chunk_length + 1):
            if file_lines[index:index + chunk_length] == chunk:
                matches.append((index + 1, index + chunk_length))

        if len(matches) == 1:
            ranges.append(matches[0])

    return ranges


def current_tool_line_ranges(tool_name: str | None, tool_input: Mapping[str, JSONValue], change_map: Mapping[str, Mapping[str, object]], checkable_paths: list[str], cwd: str | None) -> LineRangesByPath:
    line_ranges_by_path: LineRangesByPath = {path: None for path in checkable_paths}

    if tool_name == 'create_file':
        for path in checkable_paths:
            change = change_map.get(path)
            content_lines = as_int(change.get('content_lines')) if change is not None else 0
            content_lines = content_lines or 0
            if content_lines > 0:
                line_ranges_by_path[path] = [(1, content_lines)]
        return line_ranges_by_path

    if tool_name == 'apply_patch':
        patch_text = as_string(tool_input.get('input'))
        if patch_text is None:
            return line_ranges_by_path

        chunks_by_path = parse_apply_patch_added_chunks(patch_text, cwd)
        for path in checkable_paths:
            chunks = chunks_by_path.get(path)
            if not chunks:
                continue

            ranges = locate_added_chunk_ranges(path, chunks)
            line_ranges_by_path[path] = ranges or None

    return line_ranges_by_path


def offense_overlaps_ranges(offense: Mapping[str, JSONValue], ranges: list[LineRange] | None) -> bool:
    if ranges is None:
        return True

    start_row = as_int(offense.get('start_row')) or 0
    end_row = as_int(offense.get('end_row')) or start_row or 0
    if start_row <= 0:
        return True

    for range_start, range_end in ranges:
        if not (end_row < range_start or start_row > range_end):
            return True

    return False


def summarize_offenses(entries: list[JSONObject], line_ranges_by_path: Mapping[str, list[LineRange] | None]) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []

    for entry in entries:
        rel_path = normalize_path(as_string(entry.get('path'))) or '<unknown>'
        offenses = as_list(entry.get('offenses')) or []
        relevant_ranges = line_ranges_by_path.get(rel_path)
        for raw_offense in offenses:
            offense = as_object(raw_offense)
            if offense is None:
                continue
            if not offense_overlaps_ranges(offense, relevant_ranges):
                continue

            start_row = as_int(offense.get('start_row')) or '?'
            check_name = as_string(offense.get('check')) or 'ThemeCheck'
            message = (as_string(offense.get('message')) or '').strip()
            summary = (
                f"{rel_path}:{start_row} "
                f"{check_name} - {message}"
            )
            severity = (as_string(offense.get('severity')) or '').lower()
            if severity in {'error', 'crash'}:
                errors.append(summary)
            elif severity in {'warning', 'style', 'suggestion', 'info'}:
                warnings.append(summary)

    return errors, warnings


def main() -> int:
    payload = load_payload()
    tool_name = as_string(payload.get('tool_name'))
    tool_input = as_object(payload.get('tool_input')) or {}
    cwd = as_string(payload.get('cwd'))
    change_map = extract_file_changes(tool_name, tool_input, cwd)

    theme_paths = sorted(path for path in change_map if is_theme_surface_path(path))
    if not theme_paths:
        return 0

    maybe_run_prettier(theme_paths)

    checkable_paths = [path for path in theme_paths if should_theme_check(path)]
    if not checkable_paths:
        return 0

    shopify = get_shopify_command()
    if not shopify:
        emit_json({'systemMessage': 'Skipping theme check hook because the Shopify CLI is not available on PATH.'})
        return 0

    scope = theme_check_scope(checkable_paths)
    result = run_command([shopify, 'theme', 'check', '--path', scope, '-o', 'json', '--no-color'], timeout=120)
    entries = parse_theme_check_output(result.stdout)
    relevant_entries = filter_entries(entries, set(checkable_paths))
    line_ranges_by_path = current_tool_line_ranges(tool_name, tool_input, change_map, checkable_paths, cwd)
    error_summaries, _warning_summaries = summarize_offenses(relevant_entries, line_ranges_by_path)

    if not error_summaries:
        return 0

    trimmed = error_summaries[:MAX_SUMMARY_OFFENSES]
    additional_context = 'shopify theme check found error-level issues in changed files:\n- ' + '\n- '.join(trimmed)
    if len(error_summaries) > len(trimmed):
        additional_context += f"\n- ...and {len(error_summaries) - len(trimmed)} more"

    emit_json(
        {
            'decision': 'block',
            'reason': 'shopify theme check reported error-level issues in files changed by the last tool call.',
            'hookSpecificOutput': {
                'hookEventName': 'PostToolUse',
                'additionalContext': additional_context,
            },
        }
    )
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
