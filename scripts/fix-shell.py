from pathlib import Path

p = Path(__file__).resolve().parents[1] / "components" / "dashboard-shell.tsx"
c = p.read_text(encoding="utf-8")
wrong = ">{children}</motion.div>"
right = ">{children}</div>"
if wrong in c:
    c = c.replace(wrong, right)
    p.write_text(c, encoding="utf-8")
    print("fixed dashboard-shell")
else:
    print("pattern not found, line 28:", [line for line in c.splitlines() if "children" in line])
