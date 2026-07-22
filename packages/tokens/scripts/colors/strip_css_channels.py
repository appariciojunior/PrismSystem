#!/usr/bin/env python3
import re, sys
F = "packages/theme-css/src/variables.css"
lines = open(F).read().split("\n")
out = []
skip = False
th = re.compile(r'^\[data-theme="([^"]+)"\]\s*\{')
for ln in lines:
    m = th.match(ln.strip())
    if m:
        if m.group(1) != "core":
            skip = True          # drop whole channel block
            continue
        skip = False
        out.append(ln)
        continue
    if skip:
        if ln.strip() == "}":
            skip = False
        continue
    if "-channel" in ln:          # drop channel vars inside kept blocks
        continue
    out.append(ln)
open(F, "w").write("\n".join(out))
print("lines", len(lines), "->", len(out))
