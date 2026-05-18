from pathlib import Path

# Fix erroneous </motion.div> closing plain <div> in insights components
files = list(Path("components/insights").glob("*.tsx"))

for path in files:
    text = path.read_text(encoding="utf-8")
    original = text
    # Common typo: opened with <div but closed with </motion.div>
    text = text.replace("</motion.div>", "</div>")
    # Restore motion.div closes for motion.div opens (heuristic: lines with motion.div open)
    lines = text.splitlines()
    stack = []
    out = []
    for line in lines:
        stripped = line.strip()
        if "<motion.div" in stripped and "/>" not in stripped:
            stack.append("motion.div")
        elif stripped.startswith("<div") and "/>" not in stripped and "motion" not in stripped:
            stack.append("motion.div")
        elif "</div>" in stripped and stack:
            kind = stack.pop()
            if kind == "motion.div":
                line = line.replace("</div>", "</motion.div>", 1)
        out.append(line)
    text = "\n".join(out)
    if text != original:
        path.write_text(text, encoding="utf-8")
        print("fixed", path)
