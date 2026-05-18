const fs = require('fs')
const p = 'components/ai-assistant.tsx'
let c = fs.readFileSync(p, 'utf8')

// Fix: </motion.div> used where </div> was intended (closes plain <motion.div>)
const wrong = '</motion.div>'
const rightDiv = '</div>'

const fixes = [
  ['Infrastructure assistant</p>\n                </motion.div>\n              </motion.div>', 'Infrastructure assistant</p>\n                </div>\n              </div>'],
  ['<Bot className="h-4 w-4 text-primary" />}\n                    </motion.div>\n                    <div', '<Bot className="h-4 w-4 text-primary" />}\n                    </motion.div>\n                    <div'.replace('</motion.div>', '</motion.div>')],
]

// Global: replace </motion.div> that follows avatar icon div close pattern  
c = c.replace(
  /(\{message\.role === 'user' \? <User[\s\S]*?<\/motion\.div>)\n                    <div/,
  (m) => m[0].replace(wrong, rightDiv)
)

c = c.replace(
  /(\{formatContent\(message\.content\)\})\n                    <\/motion\.div>\n                  <\/motion\.motion\.motion\.div>/,
  '$1\n                    </motion.div>\n                  </motion.div>'
)

// Manual multi-replace for known broken lines
const replacements = [
  ['                  <p className="text-xs text-muted-foreground">Infrastructure assistant</p>\n                </motion.div>\n              </motion.div>', '                  <p className="text-xs text-muted-foreground">Infrastructure assistant</p>\n                </motion.div>\n              </motion.div>'],
]

for (const [from, to] of replacements) {
  if (c.includes(from)) c = c.replace(from, to)
}

// Brute: replace all </motion.div> with </motion.div> then fix motion.div pairs
// Actually: split and fix known structure - rewrite lines 124-211 from template

const header = `            <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/10 to-accent/10 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                  <Brain className="h-5 w-5 text-primary-foreground" />
                </motion.div>
                <div>
                  <h2 className="font-semibold">KubeMind AI</h2>
                  <p className="text-xs text-muted-foreground">Infrastructure assistant</p>
                </motion.div>
              </motion.div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </motion.div>`

const headerFixed = `            <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/10 to-accent/10 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                  <Brain className="h-5 w-5 text-primary-foreground" />
                </motion.div>
                <div>
                  <h2 className="font-semibold">KubeMind AI</h2>
                  <p className="text-xs text-muted-foreground">Infrastructure assistant</p>
                </motion.div>
              </motion.div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </motion.div>`

// Use regex to find header block and replace
c = c.replace(
  /<div className="flex items-center justify-between border-b[\s\S]*?<\/motion\.div>\s*<ScrollArea/,
  `<div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/10 to-accent/10 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                  <Brain className="h-5 w-5 text-primary-foreground" />
                </motion.div>
                <div>
                  <h2 className="font-semibold">KubeMind AI</h2>
                  <p className="text-xs text-muted-foreground">Infrastructure assistant</p>
                </motion.div>
              </motion.div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </motion.div>

            <ScrollArea`
)

fs.writeFileSync(p, c)
console.log('patched')
