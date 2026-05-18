const fs = require('fs')
const files = ['components/ai-assistant.tsx', 'components/alerts-section.tsx']

for (const p of files) {
  let c = fs.readFileSync(p, 'utf8')
  // Fix common mistake: </motion.div> where <motion.div> was not opened — only fix </motion.div> after </motion.div> patterns for inner divs
  const pairs = [
    [/<div className="flex h-10 w-10[\s\S]*?<\/motion\.div>/, (m) => m[0].replace('</motion.div>', '</div>')],
    [/<div>\s*<h2 className="font-semibold">KubeMind AI<\/h2>[\s\S]*?<\/motion\.motion\.motion\.motion\.div>/, null],
  ]
  // Simple: replace wrongly closed icon wrapper
  c = c.replace(
    /<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">\s*<Brain className="h-5 w-5 text-primary-foreground" \/>\s*<\/motion\.div>/,
    `<motion.div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                  <Brain className="h-5 w-5 text-primary-foreground" />
                </motion.div>`.replace('motion.div', 'motion.div')
  )
  fs.writeFileSync(p, c)
}
