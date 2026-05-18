"""Find lines where </motion.div> closes a plain <div> (common typo)."""
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
issues = []

for path in root.rglob("*.tsx"):
    if "node_modules" in str(path) or ".next" in str(path):
        continue
    text = path.read_text(encoding="utf-8")
    for i, line in enumerate(text.splitlines(), 1):
        if "</motion.div>" in line and "<motion.div" not in line:
            # likely wrong close for div
            if "<div" in line or "</motion.div>" in line:
                issues.append((path.relative_to(root), i, line.strip()[:120]))

for item in issues[:40]:
    print(item)
