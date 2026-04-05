from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from collections.abc import Mapping, Sequence
from pathlib import Path
from shutil import which
from typing import Final, Literal, TypeAlias, TypeGuard, TypedDict, cast
from urllib.parse import unquote, urlparse


JSONPrimitive: TypeAlias = None | bool | int | float | str
JSONValue: TypeAlias = JSONPrimitive | dict[str, 'JSONValue'] | list['JSONValue']
JSONObject: TypeAlias = dict[str, JSONValue]
JSONArray: TypeAlias = list[JSONValue]
ChangeAction: TypeAlias = Literal['add', 'delete', 'touch', 'update']


class ChangeInfo(TypedDict):
    actions: set[ChangeAction]
    added: int
    removed: int
    content_lines: int


REPO_ROOT: Final[Path] = Path(__file__).resolve().parents[3]
THEME_SURFACES: Final[set[str]] = {
    'assets',
    'blocks',
    'config',
    'layout',
    'locales',
    'sections',
    'snippets',
    'templates',
}
PRETTIER_CONFIG_FILES: Final[tuple[str, ...]] = (
    '.prettierrc',
    '.prettierrc.json',
    '.prettierrc.js',
    '.prettierrc.cjs',
    '.prettierrc.yaml',
    '.prettierrc.yml',
    'prettier.config.js',
    'prettier.config.cjs',
)
PATCH_FILE_HEADER: Final[re.Pattern[str]] = re.compile(r'^\*\*\* (Add|Update|Delete) File: (.+)$')


def is_json_value(value: object) -> TypeGuard[JSONValue]:
    if value is None or isinstance(value, (bool, int, float, str)):
        return True
    if isinstance(value, list):
        items = cast(list[object], value)
        return all(is_json_value(item) for item in items)
    if isinstance(value, dict):
        items = cast(dict[object, object], value)
        return all(isinstance(key, str) and is_json_value(item) for key, item in items.items())
    return False


def is_json_object(value: object) -> TypeGuard[JSONObject]:
    if not isinstance(value, dict):
        return False

    items = cast(dict[object, object], value)
    return all(isinstance(key, str) and is_json_value(item) for key, item in items.items())


def is_json_array(value: object) -> TypeGuard[JSONArray]:
    if not isinstance(value, list):
        return False

    items = cast(list[object], value)
    return all(is_json_value(item) for item in items)


def as_string(value: object) -> str | None:
    return value if isinstance(value, str) else None


def as_int(value: object) -> int | None:
    if isinstance(value, bool):
        return None
    return value if isinstance(value, int) else None


def as_object(value: object) -> JSONObject | None:
    return value if is_json_object(value) else None


def as_list(value: object) -> JSONArray | None:
    return value if is_json_array(value) else None


def empty_change_info() -> ChangeInfo:
    actions: set[ChangeAction] = set()
    return {'actions': actions, 'added': 0, 'removed': 0, 'content_lines': 0}


def load_payload() -> JSONObject:
    raw = sys.stdin.read()
    if not raw.strip():
        return {}
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        return {}
    return parsed if is_json_object(parsed) else {}


def emit_json(payload: Mapping[str, object]) -> None:
    sys.stdout.write(json.dumps(payload, ensure_ascii=True))


def normalize_path(value: str | None, cwd: str | None = None) -> str | None:
    if not isinstance(value, str) or not value.strip():
        return None

    candidate = value.strip()

    if candidate.startswith('file://'):
        parsed = urlparse(candidate)
        candidate = unquote(parsed.path)

    path = Path(candidate)
    if not path.is_absolute():
        base = Path(cwd) if cwd else REPO_ROOT
        path = base / path

    try:
        resolved = path.resolve(strict=False)
    except OSError:
        resolved = path

    try:
        return resolved.relative_to(REPO_ROOT).as_posix()
    except ValueError:
        return None


def is_theme_surface_path(path: str | None) -> bool:
    if not path:
        return False
    parts = Path(path).parts
    return bool(parts) and parts[0] in THEME_SURFACES


def count_lines(value: str | None) -> int:
    if not isinstance(value, str) or not value:
        return 0
    return len(value.splitlines()) or 1


def extract_paths_from_input(value: object, cwd: str | None = None) -> set[str]:
    found: set[str] = set()

    if is_json_object(value):
        for key, child in value.items():
            key_lower = key.lower()

            if key_lower in {'filepath', 'path', 'uri'} and isinstance(child, str):
                rel_path = normalize_path(child, cwd)
                if rel_path:
                    found.add(rel_path)
                continue

            if key_lower in {'filepaths', 'paths', 'uris'} and isinstance(child, list):
                for item in child:
                    rel_path = normalize_path(as_string(item), cwd)
                    if rel_path:
                        found.add(rel_path)
                continue

            if key_lower == 'files' and isinstance(child, list):
                for item in child:
                    if isinstance(item, str):
                        rel_path = normalize_path(item, cwd)
                        if rel_path:
                            found.add(rel_path)
                    else:
                        found.update(extract_paths_from_input(item, cwd))
                continue

            found.update(extract_paths_from_input(child, cwd))

    elif is_json_array(value):
        for child in value:
            found.update(extract_paths_from_input(child, cwd))

    return found


def parse_apply_patch_changes(patch_text: str, cwd: str | None = None) -> dict[str, ChangeInfo]:
    changes: dict[str, ChangeInfo] = {}
    current_path: str | None = None

    for line in patch_text.splitlines():
        header_match = PATCH_FILE_HEADER.match(line)
        if header_match:
            action_name = header_match.group(1)
            if action_name == 'Add':
                action: ChangeAction = 'add'
            elif action_name == 'Update':
                action = 'update'
            else:
                action = 'delete'
            path = normalize_path(header_match.group(2), cwd)
            current_path = path
            if path:
                changes.setdefault(path, empty_change_info())
                changes[path]['actions'].add(action)
            continue

        if not current_path or current_path not in changes:
            continue

        if line.startswith('+') and not line.startswith('+++'):
            changes[current_path]['added'] += 1
        elif line.startswith('-') and not line.startswith('---'):
            changes[current_path]['removed'] += 1

    return changes


def parse_apply_patch_added_chunks(patch_text: str, cwd: str | None = None) -> dict[str, list[list[str]]]:
    chunks_by_path: dict[str, list[list[str]]] = {}
    current_path: str | None = None
    current_chunk: list[str] = []

    def flush_chunk() -> None:
        nonlocal current_chunk
        if current_path and current_chunk:
            chunks_by_path.setdefault(current_path, []).append(current_chunk)
        current_chunk = []

    for line in patch_text.splitlines():
        header_match = PATCH_FILE_HEADER.match(line)
        if header_match:
            flush_chunk()
            current_path = normalize_path(header_match.group(2), cwd)
            continue

        if line.startswith('@@'):
            flush_chunk()
            continue

        if not current_path:
            continue

        if line.startswith('+') and not line.startswith('+++'):
            current_chunk.append(line[1:])
            continue

        flush_chunk()

    flush_chunk()
    return chunks_by_path


def extract_file_changes(tool_name: str | None, tool_input: Mapping[str, JSONValue] | None, cwd: str | None = None) -> dict[str, ChangeInfo]:
    changes: dict[str, ChangeInfo] = {}
    tool_input = tool_input or {}

    patch_text = as_string(tool_input.get('input'))
    if patch_text and '*** ' in patch_text and 'File:' in patch_text:
        changes.update(parse_apply_patch_changes(patch_text, cwd))

    for path in extract_paths_from_input(tool_input, cwd):
        changes.setdefault(path, empty_change_info())
        if tool_name == 'create_file':
            changes[path]['actions'].add('add')
        elif tool_name == 'apply_patch':
            changes[path]['actions'].add('update')
        else:
            changes[path]['actions'].add('touch')

    if tool_name == 'create_file':
        file_path = normalize_path(as_string(tool_input.get('filePath')), cwd)
        if file_path:
            changes.setdefault(file_path, empty_change_info())
            changes[file_path]['actions'].add('add')
            changes[file_path]['content_lines'] = count_lines(as_string(tool_input.get('content')))

    return changes


def extract_command_text(tool_name: str | None, tool_input: Mapping[str, JSONValue] | None) -> str:
    tool_input = tool_input or {}
    fragments: list[str] = []

    if tool_name in {'run_in_terminal', 'send_to_terminal'}:
        command = as_string(tool_input.get('command'))
        if command:
            fragments.append(command)

    elif tool_name == 'create_and_run_task':
        task = tool_input.get('task')
        if is_json_object(task):
            command = as_string(task.get('command'))
            if command:
                fragments.append(command)

            raw_args = task.get('args')
            if is_json_array(raw_args):
                args = [arg for arg in raw_args if isinstance(arg, str)]
                if args:
                    fragments.append(' '.join(args))

    return '\n'.join(fragment for fragment in fragments if fragment).strip()


def top_level_dirs(paths: list[str]) -> list[str]:
    return sorted({Path(path).parts[0] for path in paths if Path(path).parts})


def get_shopify_command() -> str | None:
    return which('shopify')


def run_command(args: Sequence[str], timeout: int = 30) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        list(args),
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        timeout=timeout,
        check=False,
    )


def find_prettier() -> str | None:
    has_config = any((REPO_ROOT / filename).exists() for filename in PRETTIER_CONFIG_FILES)
    if not has_config:
        return None

    local_binary = REPO_ROOT / 'node_modules' / '.bin' / 'prettier'
    if local_binary.exists():
        return str(local_binary)

    return which('prettier')


def git_branch_name() -> str | None:
    git_binary = which('git')
    if not git_binary:
        return None

    result = run_command([git_binary, 'rev-parse', '--abbrev-ref', 'HEAD'], timeout=10)
    if result.returncode != 0:
        return None

    branch_name = result.stdout.strip()
    return branch_name or None


def log_root() -> Path:
    git_dir = REPO_ROOT / '.git'
    if git_dir.exists():
        path = git_dir / 'copilot-hooks'
        path.mkdir(parents=True, exist_ok=True)
        return path

    temp_root = Path(os.environ.get('TMPDIR', '/tmp')) / 'copilot-hooks' / REPO_ROOT.name
    temp_root.mkdir(parents=True, exist_ok=True)
    return temp_root


def append_ndjson(filename: str, payload: Mapping[str, object]) -> None:
    destination = log_root() / filename
    with destination.open('a', encoding='utf-8') as handle:
        handle.write(json.dumps(payload, sort_keys=True, ensure_ascii=True))
        handle.write('\n')
