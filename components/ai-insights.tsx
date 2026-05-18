'use client'

import { Badge } from '@/components/ui/badge'
import { Sparkles } from 'lucide-react'
import { useCluster } from '@/context/cluster-context'
import { InsightsEngine } from '@/components/insights/insights-engine'

/** Dashboard section — live AI insights with compact cards */
export function AIInsightsSection() {
  const { insights } = useCluster()

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-end">
        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
          <Sparkles className="mr-1 h-3 w-3" />
          {insights.length} active
        </Badge>
      </div>
      <InsightsEngine variant="compact" />
    </section>
  )
}
