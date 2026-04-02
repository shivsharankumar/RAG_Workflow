#!/usr/bin/env python3
"""Replace \\uXXXX escapes with actual Unicode characters in JSX files."""
import re
import os

SRC = "frontend/src"

def replace_unicode_escapes(text):
    # Handle surrogate pairs: \uD83D\uDCC4 -> 📄
    def repl_pair(m):
        hi = int(m.group(1), 16)
        lo = int(m.group(2), 16)
        code = 0x10000 + (hi - 0xD800) * 0x400 + (lo - 0xDC00)
        return chr(code)
    text = re.sub(
        r"\\u([Dd][89AaBb][0-9A-Fa-f]{2})\\u([Dd][CcDdEeFf][0-9A-Fa-f]{2})",
        repl_pair,
        text,
    )
    # Handle single BMP: \u2713 -> ✓
    def repl_single(m):
        return chr(int(m.group(1), 16))
    text = re.sub(r"\\u([0-9A-Fa-f]{4})", repl_single, text)
    return text

changed = 0
for root, dirs, files in os.walk(SRC):
    dirs[:] = [d for d in dirs if d != "node_modules"]
    for fname in files:
        if not (fname.endswith(".jsx") or fname.endswith(".js")):
            continue
        path = os.path.join(root, fname)
        with open(path, "r", encoding="utf-8") as f:
            original = f.read()
        updated = replace_unicode_escapes(original)
        if updated != original:
            with open(path, "w", encoding="utf-8") as f:
                f.write(updated)
            changed += 1
            print(f"✓ Fixed: {path}")
        else:
            print(f"  No change: {path}")
print(f"\nDone. {changed} file(s) updated.")
