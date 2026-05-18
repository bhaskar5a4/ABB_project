import re

p = "components/ai-assistant.tsx"
c = open(p, encoding="utf-8").read()

# Replace erroneous </motion.div> (closes <div>) with </motion.div>
c = c.replace("</motion.div>", "</div>")

# Restore </motion.div> for actual <motion.div> elements
c = c.replace(
    'className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"\n            onClick={onClose}\n          />',
    'className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"\n            onClick={onClose}\n          />',
)
# Panel outer close
c = c.replace("            </form>\n          </motion.div>", "            </form>\n          </motion.div>")
c = re.sub(
    r"(            </form>\n          )</div>(\n        </>)",
    r"\1</motion.div>\2",
    c,
    count=1,
)
# Icon wrapper
c = re.sub(
    r"(<Brain className=\"h-5 w-5 text-primary-foreground\" />\n                )</div>(\n                <div>)",
    r"\1</motion.div>\2",
    c,
    count=1,
)
# Floating button
c = c.replace("      </motion.button>", "      </motion.button>")

open(p, "w", encoding="utf-8").write(c)
print("fixed ai-assistant")
