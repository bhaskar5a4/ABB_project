'use client'

import { AnimatePresence } from 'framer-motion'
import type { AIInsight, InsightSeverity } from '@/lib/insight-types'
import { InsightCard } from './insight-card'

interface InsightsGridProps {
  insights: AIInsight[]
  compact?: boolean
  selectedId?: string | null
  onSelect?: (insight: AIInsight) => void
  columns?: '2' | '3'
}

export function InsightsGrid({
  insights,
  compact,
  selectedId,
  onSelect,
  columns = '3',
}: InsightsGridProps) {
  const gridClass =
    columns === '2'
      ? 'grid gap-4 lg:grid-cols-2'
      : 'grid gap-4 md:grid-cols-2 xl:grid-cols-3'

  return (
    <AnimatePresence mode="popLayout">
      <div className={gridClass}>
        {insights.map((insight, index) => (
          <InsightCard
            key={insight.id}
            insight={insight}
            index={index}
            compact={compact}
            selected={selectedId === insight.id}
            onClick={onSelect ? () => onSelect(insight) : undefined}
          />
        ))}
      </div>
    </AnimatePresence>
  )
}

export type { InsightSeverity }
