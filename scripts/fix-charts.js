const fs = require('fs')
const p = 'components/charts-section.tsx'
let c = fs.readFileSync(p, 'utf8')

c = c.replace(
  /<motion\.div className="flex items-center gap-1">\s*<span className="h-2 w-2 animate-pulse rounded-full bg-success" \/>\s*<span className="text-xs text-muted-foreground">Live<\/span>\s*<\/div>/,
  `<motion.div className="flex items-center gap-1">
          <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
          <span className="text-xs text-muted-foreground">Live</span>
        </motion.div>`
)

c = c.replace(
  /<span className="text-sm font-medium">\{entry\.value\}%<\/span>\s*<\/motion.div>/,
  `<span className="text-sm font-medium">{entry.value}%</span>
          </motion.div>`
)

fs.writeFileSync(p, c)
console.log('done')
