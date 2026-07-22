#!/usr/bin/env python3
"""Verify Toast rollout parity and hidden-from-publishing metadata across all themes."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

TOKENS_PATH = Path("packages/tokens/src/tokens.json")
HIDDEN_KEY = "com.figma.hiddenFromPublishing"
EXCLUDED_NON_SEMANTIC = {
    "light/ brand",
    "dark/ brand",
    "light/ channels",
    "dark/ channels",
    "light/ marketing",
    "dark/ marketing",
    "light/ dataVisualisation",
    "dark/ dataVisualisation",
}


def iter_leaf_nodes(node: Any, path: str):
    if isinstance(node, dict):
        if "value" in node and "type" in node:
            yield path, node
            return
        for key, value in node.items():
            if key.startswith("$"):
                continue
            child_path = f"{path}.{key}" if path else key
            yield from iter_leaf_nodes(value, child_path)


def collect_theme_sets(data: dict[str, Any], prefix: str) -> list[str]:
    return sorted(
        key
        for key, value in data.items()
        if key.startswith(prefix)
        and isinstance(value, dict)
        and key not in EXCLUDED_NON_SEMANTIC
    )


def normalize_for_compare(node: Any) -> str:
    return json.dumps(node, sort_keys=True, separators=(",", ":"))


def main() -> int:
    if not TOKENS_PATH.exists():
        print(f"FAIL: Missing {TOKENS_PATH}")
        return 1

    data = json.loads(TOKENS_PATH.read_text())

    light_sets = collect_theme_sets(data, "light/ ")
    dark_sets = collect_theme_sets(data, "dark/ ")

    failures: list[str] = []

    if "light/ core" not in data or "dark/ core" not in data:
        failures.append("Missing light/ core or dark/ core token sets")
        for failure in failures:
            print(f"FAIL: {failure}")
        return 1

    if "toast" not in data["light/ core"] or "toast" not in data["dark/ core"]:
        failures.append("Missing toast in light/ core or dark/ core")
        for failure in failures:
            print(f"FAIL: {failure}")
        return 1

    if len(light_sets) != 14 or len(dark_sets) != 14:
        failures.append(
            f"Unexpected semantic theme counts: light={len(light_sets)} dark={len(dark_sets)} (expected 14 + 14)"
        )
        for failure in failures:
            print(f"FAIL: {failure}")
        return 1

    light_source = data["light/ core"]["toast"]
    dark_source = data["dark/ core"]["toast"]
    light_source_norm = normalize_for_compare(light_source)
    dark_source_norm = normalize_for_compare(dark_source)

    # 1) Presence + exact structure parity with per-mode source
    for theme in light_sets:
        toast = data.get(theme, {}).get("toast")
        if toast is None:
            failures.append(f"{theme} missing toast subtree")
            continue
        if normalize_for_compare(toast) != light_source_norm:
            failures.append(f"{theme} toast differs from light/ core")

    for theme in dark_sets:
        toast = data.get(theme, {}).get("toast")
        if toast is None:
            failures.append(f"{theme} missing toast subtree")
            continue
        if normalize_for_compare(toast) != dark_source_norm:
            failures.append(f"{theme} toast differs from dark/ core")

    # 2) Hidden metadata on every toast leaf token
    for theme in light_sets + dark_sets:
        toast = data.get(theme, {}).get("toast")
        if toast is None:
            continue
        for leaf_path, leaf in iter_leaf_nodes(toast, f"{theme}.toast"):
            ext = leaf.get("$extensions", {})
            if ext.get(HIDDEN_KEY) is not True:
                failures.append(f"{leaf_path} missing {HIDDEN_KEY}: true")

            # Guard: semantic toast leaves should be aliases, not raw hex
            value = leaf.get("value")
            if isinstance(value, str) and not (value.startswith("{") and value.endswith("}")):
                failures.append(f"{leaf_path} uses non-alias value: {value}")

    # 3) Report
    if failures:
        print("FAIL: Toast rollout verification failed")
        for failure in failures[:200]:
            print(f" - {failure}")
        if len(failures) > 200:
            print(f" - ... {len(failures) - 200} more")
        return 1

    print("PASS: Toast rollout parity + hidden-from-publishing verified")
    print(f"light_sets={len(light_sets)} dark_sets={len(dark_sets)} total={len(light_sets) + len(dark_sets)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
