'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AIInsight } from '@/lib/insight-types'
import { InsightSeverityBadge } from './insight-severity-badge'
import { InsightConfidenceMeter } from './insight-confidence-meter'
import { categoryMeta } from './insight-config'

interface InsightDetailPanelProps {
  insight: AIInsight | null
  className?: string
}

export function InsightDetailPanel({ insight, className }: InsightDetailPanelProps) {
  return (
    <motion.div className={cn('glass-card sticky top-24 rounded-xl border border-border/50 p-6', className)}>
      <h2 className="mb-4 text-lg font-semibold">Insight Analysis</h2>
      <AnimatePresence mode="wait">
        {insight ? (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-5"
          >
            <div className="flex flex-wrap items-center gap-2">
              <InsightSeverityBadge severity={insight.severity} />
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {categoryMeta[insight.category].label}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold leading-tight">{insight.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{insight.timestamp}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Explanation</p>
              <p className="text-sm leading-relaxed text-foreground/90">{insight.explanation || insight.description}</p>
            </div>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-primary">
                <Zap className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Recommendation</span>
              </div>
              <p className="text-sm leading-relaxed">{insight.recommendation}</p>
              <p className="mt-2 text-xs text-muted-foreground">Action: {insight.suggestedAction}</p>
            </div>
            <InsightConfidenceMeter value={insight.confidence} />
            <div className="flex gap-2 pt-2">
              <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground">Apply</motion.button>
              <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium">Dismiss</motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-64 flex-col items-center justify-center text-center">
            <Brain className="mb-3 h-12 w-12 text-muted-foreground/25" />
            <p className="text-sm text-muted-foreground">Select an insight to view full analysis</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
