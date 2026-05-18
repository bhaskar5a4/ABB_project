'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { InsightSeverity } from '@/lib/insight-types'
import { severityStyles } from './insight-config'

interface InsightSeverityBadgeProps {
  severity: InsightSeverity
  className?: string
  pulse?: boolean
}

export function InsightSeverityBadge({ severity, className, pulse }: InsightSeverityBadgeProps) {
  const styles = severityStyles[severity]
  return (
    <Badge
      variant="outline"
      className={cn(
        'text-[10px] font-semibold uppercase tracking-wider',
        styles.badge,
        pulse && severity === 'critical' && 'animate-pulse',
        className
      )}
    >
      {severity}
    </Badge>
  )
}
