#!/usr/bin/env python3
"""
Clean token descriptions by removing duplicate or inaccurate segments while preserving values.
- Operates on description fields only; leaves values, references, and $themes untouched.
- Supports dry-run (default) and apply modes.
"""
import argparse
import csv
import json
import re
from pathlib import Path
from typing import Dict, List, Tuple

ROOT = Path(__file__).resolve().parents[1]
TOKENS_PATH = ROOT / "src" / "tokens.json"
DEFAULT_REPORT = ROOT / ".agents" / "reports" / "token-description-dedupe.csv"

PLACEHOLDER_STRINGS = {
    "no description provided",
    "same as above",
    "same as default",
    "tbd",
    "n/a",
    "na",
    "none",
    "placeholder",
    "todo",
}

BULLET = "•"


def dedupe_bullets(desc: str, reasons: List[str]) -> str:
    if BULLET not in desc:
        return desc
    parts = [p.strip() for p in desc.split(BULLET)]
    seen = set()
    unique_parts = []
    for part in parts:
        if not part:
            continue
        key = part.casefold()
        if key in seen:
            reasons.append("duplicate-segment")
            continue
        seen.add(key)
        unique_parts.append(part)
    return f" {BULLET} ".join(unique_parts) if unique_parts else ""


def dedupe_dash_repeat(desc: str, reasons: List[str]) -> str:
    """Collapse repeated halves like 'A — A' or 'A - A'."""
    dash_pattern = re.compile(r"^\s*(.+?)\s*[—–-]\s*(.+?)\s*$")
    match = dash_pattern.match(desc)
    if not match:
        return desc
    left, right = match.group(1).strip(), match.group(2).strip()
    if left and right and left.casefold() == right.casefold():
        reasons.append("dash-duplicate")
        return left
    return desc


def clean_description(desc: str) -> Tuple[str, List[str]]:
    reasons: List[str] = []
    original = desc
    trimmed = desc.strip()

    if trimmed.casefold() in PLACEHOLDER_STRINGS:
        return "", ["placeholder"]

    desc = dedupe_bullets(desc, reasons)
    desc = dedupe_dash_repeat(desc, reasons)

    # Collapse duplicate hex bullets specifically (keep first occurrence)
    hex_pattern = re.compile(rf"\s*{BULLET}\s*#([0-9a-fA-F]{{6}})")
    seen_hex = set()
    parts = []
    idx = 0
    for match in hex_pattern.finditer(desc):
        start, end = match.span()
        hex_value = match.group(1).upper()
        # Add preceding text
        parts.append(desc[idx:start])
        if hex_value in seen_hex:
            reasons.append("duplicate-hex")
        else:
            parts.append(match.group(0))
            seen_hex.add(hex_value)
        idx = end
    parts.append(desc[idx:])
    desc = "".join(parts)

    # Normalize spacing
    desc = re.sub(r"\s{2,}", " ", desc).strip()

    if desc == original.strip():
        return desc, []
    return desc, reasons or ["normalized"]


def iterate_tokens(node, path: List[str], report: List[Dict], apply: bool, stats: Dict[str, int]):
    if isinstance(node, dict):
        if any(k.startswith("$") for k in node.keys()):
            # Skip token studio metadata branches entirely
            pass
        # Clean description if present
        if "description" in node and isinstance(node["description"], str):
            cleaned, reasons = clean_description(node["description"])
            stats["descriptions_seen"] += 1
            if reasons:
                stats["flagged"] += 1
                action = "removed" if cleaned == "" else "updated"
                report.append({
                    "path": "/".join(path),
                    "action": action,
                    "reasons": ";".join(reasons),
                    "before": node["description"],
                    "after": cleaned,
                })
                if apply:
                    if cleaned:
                        node["description"] = cleaned
                    else:
                        del node["description"]
        # Decide whether to treat as leaf
        is_leaf = "value" in node or "type" in node
        if not is_leaf:
            for key, child in node.items():
                if key in {"description", "value", "$extensions", "$type"}:
                    continue
                if key.startswith("$"):
                    continue
                iterate_tokens(child, path + [key], report, apply, stats)
    elif isinstance(node, list):
        for idx, child in enumerate(node):
            iterate_tokens(child, path + [str(idx)], report, apply, stats)


def main():
    parser = argparse.ArgumentParser(description="Clean token descriptions (dedupe inaccuracies and duplicates)")
    parser.add_argument("--apply", action="store_true", help="Write changes to tokens.json")
    parser.add_argument("--report", type=Path, default=DEFAULT_REPORT, help="Path to write CSV report")
    args = parser.parse_args()

    with TOKENS_PATH.open("r", encoding="utf-8") as f:
        data = json.load(f)

    report: List[Dict] = []
    stats = {"descriptions_seen": 0, "flagged": 0}

    iterate_tokens(data, [], report, apply=args.apply, stats=stats)

    args.report.parent.mkdir(parents=True, exist_ok=True)
    with args.report.open("w", newline="", encoding="utf-8") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=["path", "action", "reasons", "before", "after"])
        writer.writeheader()
        writer.writerows(report)

    if args.apply:
        with TOKENS_PATH.open("w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write("\n")

    print(f"Descriptions scanned: {stats['descriptions_seen']}")
    print(f"Flagged: {stats['flagged']}")
    print(f"Changes {'applied' if args.apply else 'not applied (dry-run)'}")
    print(f"Report: {args.report}")


if __name__ == "__main__":
    main()
