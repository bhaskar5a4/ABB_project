'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlertTriangle, AlertCircle, Info, Clock, ChevronRight, Bell, Filter } from 'lucide-react'
import { useCluster } from '@/context/cluster-context'
import type { Pod } from '@/lib/k8s-data'

export function ActiveAlerts() {
  const { alerts } = useCluster()
  const severityIcon = {
    critical: <AlertTriangle className="h-4 w-4" />,
    warning: <AlertCircle className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />,
  }
  const severityColors = {
    critical: { bg: 'bg-destructive/10', border: 'border-destructive/30', text: 'text-destructive', badge: 'bg-destructive/20 text-destructive border-destructive/30' },
    warning: { bg: 'bg-warning/10', border: 'border-warning/30', text: 'text-warning', badge: 'bg-warning/20 text-warning border-warning/30' },
    info: { bg: 'bg-accent/10', border: 'border-accent/30', text: 'text-accent', badge: 'bg-accent/20 text-accent border-accent/30' },
  }
  const criticalCount = alerts.filter((a) => a.severity === 'critical').length
  const warningCount = alerts.filter((a) => a.severity === 'warning').length

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden rounded-xl border border-border/50"
    >
      <div className="flex items-center justify-between border-b border-border/50 p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
              <Bell className="h-5 w-5 text-destructive" />
            </div>
            {criticalCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                {criticalCount}
              </span>
            )}
          </div>
          <div>
            <h2 className="font-semibold">Active Alerts</h2>
            <p className="text-sm text-muted-foreground">{criticalCount} critical, {warningCount} warnings</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>
      <ScrollArea className="h-80">
        <div className="divide-y divide-border/30">
          {alerts.slice(0, 8).map((alert, index) => {
            const colors = severityColors[alert.severity]
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn('group cursor-pointer p-4 transition-colors hover:bg-muted/30', alert.severity === 'critical' && 'bg-destructive/5')}
              >
                <motion.div className="flex items-start gap-3">
                  <div className={cn('mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg', colors.bg, colors.text)}>
                    {severityIcon[alert.severity]}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{alert.title}</h4>
                      <Badge variant="outline" className={colors.badge}>{alert.severity}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{alert.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{alert.timestamp}</span>
                      {alert.pod && <Badge variant="secondary" className="text-xs">{alert.pod}</Badge>}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100" />
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </ScrollArea>
    </motion.section>
  )
}

export function PodStatusList() {
  const { pods } = useCluster()
  const unhealthyPods = pods.filter(
    (pod) => pod.status !== 'Running' || pod.restartCount > 2 || pod.cpuUsage > 80 || pod.memoryUsage > 80
  )

  const getStatusColor = (pod: Pod) => {
    if (pod.status === 'CrashLoopBackOff' || pod.status === 'Failed') return { dot: 'bg-destructive', text: 'text-destructive' }
    if (pod.status === 'Pending') return { dot: 'bg-warning', text: 'text-warning' }
    if (pod.restartCount > 5 || pod.cpuUsage > 85 || pod.memoryUsage > 85) return { dot: 'bg-destructive', text: 'text-destructive' }
    if (pod.restartCount > 0 || pod.cpuUsage > 70 || pod.memoryUsage > 70) return { dot: 'bg-warning', text: 'text-warning' }
    return { dot: 'bg-success', text: 'text-success' }
  }

  return (
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden rounded-xl border border-border/50">
      <motion.div className="border-b border-border/50 p-4">
        <h2 className="font-semibold">Pods Requiring Attention</h2>
        <p className="text-sm text-muted-foreground">{unhealthyPods.length} pods need review</p>
      </motion.div>
      <ScrollArea className="h-64">
        <div className="divide-y divide-border/30">
          {unhealthyPods.map((pod) => {
            const colors = getStatusColor(pod)
            return (
              <motion.div key={pod.id} layout className="flex items-center justify-between p-4 hover:bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className={cn('h-2 w-2 rounded-full', colors.dot)} />
                  <div>
                    <p className="font-medium">{pod.name}</p>
                    <p className="text-xs text-muted-foreground">{pod.namespace}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className={pod.cpuUsage > 80 ? 'text-destructive' : 'text-muted-foreground'}>CPU {pod.cpuUsage}%</span>
                  <span className={pod.memoryUsage > 80 ? 'text-destructive' : 'text-muted-foreground'}>Mem {pod.memoryUsage}%</span>
                  <Badge variant="outline">{pod.status}</Badge>
                </div>
              </motion.div>
            )
          })}
        </div>
      </ScrollArea>
    </motion.section>
  )
}
