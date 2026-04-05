#!/usr/bin/env python3

from __future__ import annotations

import subprocess
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
ALLOWLIST_PATH = REPO_ROOT / '.github' / 'locale-allowlist.txt'


def read_allowlist() -> list[str]:
    try:
        lines = ALLOWLIST_PATH.read_text(encoding='utf-8').splitlines()
    except OSError as exc:
        message = exc.strerror or str(exc)
        raise RuntimeError(f'Unable to read {ALLOWLIST_PATH.relative_to(REPO_ROOT)}: {message}') from exc

    entries: list[str] = []
    for raw_line in lines:
        line = raw_line.strip()
        if not line or line.startswith('#'):
            continue
        entries.append(line)
    return entries


def tracked_locale_files() -> list[str]:
    try:
        result = subprocess.run(
            ['git', '-C', str(REPO_ROOT), 'ls-files', '--', 'locales/*.json'],
            check=True,
            capture_output=True,
            text=True,
        )
    except FileNotFoundError as exc:
        raise RuntimeError('git is not available on PATH.') from exc
    except subprocess.CalledProcessError as exc:
        detail = exc.stderr.strip()
        suffix = f': {detail}' if detail else '.'
        raise RuntimeError(f'Unable to list tracked locale files{suffix}') from exc

    return [line.strip() for line in result.stdout.splitlines() if line.strip()]


def main() -> int:
    try:
        allowlisted = read_allowlist()
        tracked = tracked_locale_files()
    except RuntimeError as exc:
        print(str(exc), file=sys.stderr)
        return 2

    allowlisted_set = set(allowlisted)
    tracked_set = set(tracked)

    unexpected = sorted(tracked_set - allowlisted_set)
    missing = [path for path in allowlisted if path not in tracked_set]

    if not unexpected and not missing:
        print('Locale allowlist check passed.')
        print('Tracked locale files:')
        for path in tracked:
            print(f'  - {path}')
        return 0

    print('Locale allowlist check failed.', file=sys.stderr)
    print(f'Allowlist manifest: {ALLOWLIST_PATH.relative_to(REPO_ROOT)}', file=sys.stderr)

    if unexpected:
        print('\nTracked locale files that must be removed from the branch:', file=sys.stderr)
        for path in unexpected:
            print(f'  - {path}', file=sys.stderr)

    if missing:
        print('\nAllowlisted locale files that are missing from the branch:', file=sys.stderr)
        for path in missing:
            print(f'  - {path}', file=sys.stderr)

    print('\nReview the upstream-sync branch and update tracked locale files before approval.', file=sys.stderr)
    return 1


if __name__ == '__main__':
    raise SystemExit(main())
