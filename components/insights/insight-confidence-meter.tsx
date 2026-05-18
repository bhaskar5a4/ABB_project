'use client'

import { motion } from 'framer-motion'
import { Target } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InsightConfidenceMeterProps {
  value: number
  className?: string
  showLabel?: boolean
}

export function InsightConfidenceMeter({
  value,
  className,
  showLabel = true,
}: InsightConfidenceMeterProps) {
  const color =
    value >= 90 ? 'from-success to-emerald-400' : value >= 75 ? 'from-primary to-accent' : 'from-warning to-orange-400'

  return (
    <motion.div layout className={cn('space-y-1.5', className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Target className="h-3 w-3" />
            Confidence
          </span>
          <span className="font-semibold tabular-nums">{value}%</span>
        </div>
      )}
      <div className="h-1.5 overflow-hidden rounded-full bg-muted/60">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn('h-full rounded-full bg-gradient-to-r', color)}
        />
      </div>
    </motion.div>
  )
}
