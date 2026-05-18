'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Box,
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { useCluster } from '@/context/cluster-context'

interface MetricCardProps {
  title: string
  value: string | number
  unit?: string
  subtitle?: string
  icon: React.ReactNode
  trend?: number
  status: 'healthy' | 'warning' | 'critical'
  delay?: number
}

function MetricCard({ title, value, unit, subtitle, icon, trend, status, delay = 0 }: MetricCardProps) {
  const statusColors = {
    healthy: 'from-success/20 to-success/5 border-success/30',
    warning: 'from-warning/20 to-warning/5 border-warning/30',
    critical: 'from-destructive/20 to-destructive/5 border-destructive/30',
  }

  const iconColors = {
    healthy: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    critical: 'text-destructive bg-destructive/10',
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        'glass-card relative overflow-hidden rounded-xl border p-5',
        `bg-gradient-to-br ${statusColors[status]}`
      )}
    >
      <div className="flex items-start justify-between">
        <motion.div key={String(value)} className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-1">
            <motion.span
              key={String(value)}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className="text-3xl font-bold tracking-tight"
            >
              {value}
            </motion.span>
            {unit && <span className="text-lg text-muted-foreground">{unit}</span>}
          </div>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          {trend !== undefined && (
            <div
              className={cn(
                'flex items-center gap-1 text-sm font-medium',
                trend > 0 ? 'text-destructive' : 'text-success'
              )}
            >
              {trend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{Math.abs(trend)}%</span>
              <span className="text-muted-foreground">vs last hour</span>
            </div>
          )}
        </motion.div>
        <motion.div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', iconColors[status])}>
          {icon}
        </motion.div>
      </div>

      {typeof value === 'number' && value <= 100 && (
        <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-muted/50">
          <motion.div
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.8 }}
            className={cn(
              'absolute inset-y-0 left-0 rounded-full',
              status === 'healthy' && 'bg-success',
              status === 'warning' && 'bg-warning',
              status === 'critical' && 'bg-destructive'
            )}
          />
        </div>
      )}
    </motion.div>
  )
}

export function MetricsGrid() {
  const { dashboardMetrics: metrics } = useCluster()

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard title="CPU Usage" value={metrics.cpu.value} unit="%" icon={<Cpu className="h-6 w-6" />} trend={metrics.cpu.trend} status={metrics.cpu.status} />
      <MetricCard title="Memory Usage" value={metrics.memory.value} unit="%" icon={<MemoryStick className="h-6 w-6" />} trend={metrics.memory.trend} status={metrics.memory.status} delay={0.05} />
      <MetricCard title="Disk Usage" value={metrics.disk.value} unit="%" icon={<HardDrive className="h-6 w-6" />} trend={metrics.disk.trend} status={metrics.disk.status} delay={0.1} />
      <MetricCard title="Network Traffic" value={metrics.network.value} unit={metrics.network.unit} icon={<Network className="h-6 w-6" />} trend={metrics.network.trend} status={metrics.network.status} delay={0.15} />
      <MetricCard title="Active Pods" value={metrics.activePods.value} subtitle={`of ${metrics.activePods.total} total`} icon={<Box className="h-6 w-6" />} status={metrics.activePods.status} delay={0.2} />
      <MetricCard title="Critical Alerts" value={metrics.criticalAlerts.value} icon={<AlertTriangle className="h-6 w-6" />} trend={metrics.criticalAlerts.trend} status={metrics.criticalAlerts.status} delay={0.25} />
      <MetricCard title="Healthy Services" value={metrics.healthyServices.value} subtitle={`of ${metrics.healthyServices.total} services`} icon={<CheckCircle className="h-6 w-6" />} trend={metrics.healthyServices.trend} status={metrics.healthyServices.status} delay={0.3} />
      <MetricCard title="Restart Count" value={metrics.restartCount.value} subtitle="Last 24 hours" icon={<RotateCcw className="h-6 w-6" />} trend={metrics.restartCount.trend} status={metrics.restartCount.status} delay={0.35} />
    </div>
  )
}
