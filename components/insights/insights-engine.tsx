'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Sparkles, RefreshCw, Radio } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCluster } from '@/context/cluster-context'
import {
  countInsightsBySeverity,
  filterInsightsBySeverity,
} from '@/lib/insight-engine'
import type { InsightSeverity } from '@/lib/insight-types'
import { InsightFilterBar, type SeverityFilter } from './insight-filter-bar'
import { InsightsGrid } from './insights-grid'
import { InsightDetailPanel } from './insight-detail-panel'

interface InsightsEngineProps {
  /** Dashboard embed: hide detail panel, use compact cards */
  variant?: 'full' | 'compact'
}

export function InsightsEngine({ variant = 'full' }: InsightsEngineProps) {
  const { insights, tick, refresh } = useCluster()
  const [severity, setSeverity] = useState<SeverityFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  const filtered = useMemo(
    () => filterInsightsBySeverity(insights, severity),
    [insights, severity]
  )

  const counts = useMemo(() => countInsightsBySeverity(insights), [insights])
  const selected = filtered.find((i) => i.id === selectedId) ?? filtered[0] ?? null

  const handleReanalyze = () => {
    setAnalyzing(true)
    refresh()
    setTimeout(() => setAnalyzing(false), 1200)
  }

  if (variant === 'compact') {
    return (
      <section className="space-y-4">
        <InsightsEngineHeader counts={counts} tick={tick} compact />
        <InsightsGrid insights={filtered.slice(0, 6)} compact columns="2" />
      </section>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <InsightsEngineHeader counts={counts} tick={tick} />
        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleReanalyze}
          disabled={analyzing}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-60"
        >
          <RefreshCw className={cn('h-4 w-4', analyzing && 'animate-spin')} />
          {analyzing ? 'Analyzing cluster…' : 'Re-analyze cluster'}
        </motion.button>
      </div>

      <InsightFilterBar value={severity} onChange={setSeverity} counts={counts} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-border/60"
            >
              <Brain className="mb-2 h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No insights for this severity filter</p>
            </motion.div>
          ) : (
            <InsightsGrid
              insights={filtered}
              selectedId={selected?.id ?? null}
              onSelect={(i) => setSelectedId(i.id)}
              columns="2"
            />
          )}
        </div>
        <InsightDetailPanel insight={selected} />
      </div>
    </div>
  )
}

function InsightsEngineHeader({
  counts,
  tick,
  compact,
}: {
  counts: ReturnType<typeof countInsightsBySeverity>
  tick: number
  compact?: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-accent/25">
        <Brain className="h-5 w-5 text-primary" />
        <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
        </span>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h2 className={cn('font-semibold', compact ? 'text-lg' : 'text-3xl font-bold tracking-tight')}>
            {compact ? 'AI Insights' : 'AI Insight Engine'}
          </h2>
          {!compact && (
            <span className="flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
              <Radio className="h-3 w-3" />
              Live
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {counts.total} insights · CPU, memory, restart & network analysis
          {tick > 0 && !compact && ' · auto-refreshing'}
        </p>
      </div>
      {!compact && (
        <span className="ml-auto hidden items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary sm:flex">
          <Sparkles className="h-3 w-3" />
          KubeMind ML
        </span>
      )}
    </div>
  )
}
