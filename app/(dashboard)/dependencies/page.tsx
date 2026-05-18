'use client'

import { motion } from 'framer-motion'
import { GitBranch, Network, CheckCircle2, AlertTriangle } from 'lucide-react'
import { DependencyGraphFlow } from '@/components/dependency-graph-flow'
import { useCluster } from '@/context/cluster-context'
import { mockDependencies } from '@/lib/k8s-data'

export default function DependencyMappingPage() {
  const { pods } = useCluster()
  const serviceCount = new Set(mockDependencies.flatMap((d) => [d.source, d.target])).size
  const issues = pods.filter((p) => p.anomalyScore > 50 || p.status !== 'Running').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dependency Mapping</h1>
        <p className="mt-1 text-muted-foreground">
          Interactive service graph with live health and traffic flow
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Services', value: serviceCount, icon: Network },
          { label: 'Connections', value: mockDependencies.length, icon: GitBranch },
          { label: 'Healthy', value: pods.filter((p) => p.healthScore >= 70).length, icon: CheckCircle2 },
          { label: 'Issues', value: issues, icon: AlertTriangle },
        ].map((stat) => (
          <motion.div key={stat.label} whileHover={{ y: -2 }} className="glass-card rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-3xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className="h-5 w-5 text-primary" />
            </div>
          </motion.div>
        ))}
      </div>

      <DependencyGraphFlow />
    </div>
  )
}
