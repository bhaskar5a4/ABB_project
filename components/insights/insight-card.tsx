'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, Sparkles, Zap, Clock } from 'lucide-react'
import type { AIInsight } from '@/lib/insight-types'
import { InsightSeverityBadge } from './insight-severity-badge'
import { InsightConfidenceMeter } from './insight-confidence-meter'
import { categoryMeta, severityStyles } from './insight-config'

interface InsightCardProps {
  insight: AIInsight
  index?: number
  selected?: boolean
  compact?: boolean
  onClick?: () => void
}

export function InsightCard({
  insight,
  index = 0,
  selected,
  compact,
  onClick,
}: InsightCardProps) {
  const styles = severityStyles[insight.severity]
  const CategoryIcon = categoryMeta[insight.category].icon
  const SeverityIcon = styles.icon

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        y: -4,
        boxShadow: styles.glow,
        transition: { duration: 0.2 },
      }}
      onClick={onClick}
      className={cn(
        'glass-card group relative overflow-hidden rounded-xl border p-5 transition-colors',
        styles.border,
        styles.bg,
        onClick && 'cursor-pointer',
        selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
        compact && 'p-4'
      )}
    >
      {/* Ambient glow */}
      <motion.div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-3xl"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="relative space-y-4">
        <div className="flex items-start gap-3">
          <div className={cn('rounded-xl border p-2.5', styles.border, styles.bg)}>
            <SeverityIcon className={cn('h-5 w-5', styles.text)} />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <InsightSeverityBadge severity={insight.severity} pulse />
              <Badge variant="secondary" className="gap-1 text-[10px]">
                <CategoryIcon className="h-3 w-3" />
                {categoryMeta[insight.category].label}
              </Badge>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3" />
                {insight.timestamp}
              </span>
            </div>
            <h3 className={cn('font-semibold leading-snug', compact ? 'text-sm' : 'text-base')}>
              {insight.title}
            </h3>
          </div>
          {onClick && (
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          )}
        </div>

        <p className={cn('leading-relaxed text-muted-foreground', compact ? 'text-xs line-clamp-2' : 'text-sm')}>
          {insight.explanation || insight.description}
        </p>

        {insight.metrics && !compact && (
          <div className="flex flex-wrap gap-2">
            {insight.metrics.cpu != null && (
              <MetricPill label="CPU" value={`${insight.metrics.cpu}%`} />
            )}
            {insight.metrics.memory != null && (
              <MetricPill label="Mem" value={`${insight.metrics.memory}%`} />
            )}
            {insight.metrics.restarts != null && insight.metrics.restarts > 0 && (
              <MetricPill label="Restarts" value={String(insight.metrics.restarts)} warn />
            )}
            {insight.metrics.network != null && (
              <MetricPill label="Net" value={`${insight.metrics.network} MB/s`} />
            )}
          </div>
        )}

        {(insight.affectedPod || insight.affectedNamespace) && (
          <div className="flex flex-wrap gap-2">
            {insight.affectedPod && (
              <Badge variant="outline" className="font-mono text-[10px]">
                {insight.affectedPod}
              </Badge>
            )}
            {insight.affectedNamespace && (
              <Badge variant="outline" className="text-[10px]">
                ns/{insight.affectedNamespace}
              </Badge>
            )}
          </div>
        )}

        <div className="rounded-lg border border-border/40 bg-background/40 p-3 backdrop-blur-sm">
          <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Recommendation
          </div>
          <p className="text-sm leading-relaxed">{insight.recommendation}</p>
        </div>

        <InsightConfidenceMeter value={insight.confidence} />

        <div className="flex items-center gap-1 text-[10px] text-muted-foreground/80">
          <Sparkles className="h-3 w-3 text-primary" />
          KubeMind AI Engine
        </div>
      </div>
    </motion.article>
  )
}

function MetricPill({
  label,
  value,
  warn,
}: {
  label: string
  value: string
  warn?: boolean
}) {
  return (
    <span
      className={cn(
        'rounded-md border border-border/50 bg-muted/40 px-2 py-0.5 font-mono text-[10px]',
        warn && 'border-destructive/30 text-destructive'
      )}
    >
      {label} {value}
    </span>
  )
}
