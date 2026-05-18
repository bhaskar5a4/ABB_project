'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Filter, AlertTriangle, Info } from 'lucide-react'
import type { InsightSeverity } from '@/lib/insight-types'

export type SeverityFilter = InsightSeverity | 'all'

interface InsightFilterBarProps {
  value: SeverityFilter
  onChange: (value: SeverityFilter) => void
  counts: { critical: number; warning: number; info: number; total: number }
}

const filters: { id: SeverityFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'critical', label: 'Critical' },
  { id: 'warning', label: 'Warning' },
  { id: 'info', label: 'Info' },
]

export function InsightFilterBar({ value, onChange, counts }: InsightFilterBarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <motion.div layout className="flex flex-wrap items-center gap-2">
        <div className="mr-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          Filter
        </div>
        {filters.map((f) => {
          const active = value === f.id
          const count =
            f.id === 'all'
              ? counts.total
              : f.id === 'critical'
                ? counts.critical
                : f.id === 'warning'
                  ? counts.warning
                  : counts.info
          return (
            <motion.button
              key={f.id}
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange(f.id)}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm font-medium transition-all',
                active
                  ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'border-border/60 bg-muted/30 text-muted-foreground hover:border-primary/40 hover:text-foreground'
              )}
            >
              {f.label}
              <span className={cn('ml-1.5 tabular-nums', active ? 'opacity-90' : 'opacity-60')}>
                ({count})
              </span>
            </motion.button>
          )
        })}
      </motion.div>

      <div className="flex flex-wrap gap-2">
        <StatChip icon={AlertTriangle} label="Critical" value={counts.critical} variant="destructive" />
        <StatChip icon={AlertTriangle} label="Warning" value={counts.warning} variant="warning" />
        <StatChip icon={Info} label="Info" value={counts.info} variant="primary" />
      </div>
    </div>
  )
}

function StatChip({
  icon: Icon,
  label,
  value,
  variant,
}: {
  icon: typeof AlertTriangle
  label: string
  value: number
  variant: 'destructive' | 'warning' | 'primary'
}) {
  const colors = {
    destructive: 'bg-destructive/10 text-destructive border-destructive/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    primary: 'bg-primary/10 text-primary border-primary/20',
  }
  return (
    <div className={cn('flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm', colors[variant])}>
      <Icon className="h-4 w-4" />
      <span className="font-medium">{value}</span>
      <span className="hidden sm:inline opacity-80">{label}</span>
    </div>
  )
}
