'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  generateTimeSeriesData,
  getNamespaceResourceData,
  getNetworkThroughputData,
} from '@/lib/k8s-data'
import { useCluster } from '@/context/cluster-context'
import { cn } from '@/lib/utils'

const chartColors = {
  primary: 'oklch(0.7 0.18 250)',
  accent: 'oklch(0.65 0.22 170)',
  warning: 'oklch(0.75 0.18 80)',
  success: 'oklch(0.7 0.2 150)',
  destructive: 'oklch(0.6 0.22 25)',
}

function ChartCard({
  title,
  subtitle,
  children,
  delay = 0,
  className,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn('glass-card overflow-hidden rounded-xl border border-border/50 p-5', className)}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <motion.div className="flex items-center gap-1">
          <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
          <span className="text-xs text-muted-foreground">Live</span>
        </motion.div>
      </div>
      {children}
    </motion.div>
  )
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; name: string; color: string }>
  label?: string
}) {
  if (active && payload?.length) {
    return (
      <div className="glass-card rounded-lg border border-border/50 p-3 shadow-xl">
        <p className="mb-2 text-xs text-muted-foreground">{label}</p>
        {payload.map((entry, index) => (
          <motion.div key={index} className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm font-medium">{entry.value}%</span>
          </motion.div>
        ))}
      </div>
    )
  }
  return null
}

export function ChartsSection() {
  const { pods, tick, dashboardMetrics } = useCluster()

  const cpuData = useMemo(
    () =>
      generateTimeSeriesData(24, dashboardMetrics.cpu.value, 25, 100 + tick).map((d, i) => ({
        time: `${24 - i}h`,
        value: d.value,
      })),
    [dashboardMetrics.cpu.value, tick]
  )

  const memData = useMemo(
    () =>
      generateTimeSeriesData(24, dashboardMetrics.memory.value, 15, 200 + tick).map((d, i) => ({
        time: `${24 - i}h`,
        value: d.value,
      })),
    [dashboardMetrics.memory.value, tick]
  )

  const nsData = useMemo(() => getNamespaceResourceData(200 + tick), [tick])
  const netData = useMemo(() => getNetworkThroughputData(300 + tick), [tick])

  const restartData = useMemo(
    () =>
      [...pods]
        .filter((p) => p.restartCount > 0)
        .sort((a, b) => b.restartCount - a.restartCount)
        .slice(0, 6)
        .map((pod) => ({
          name: pod.name.split('-')[0],
          fullName: pod.name,
          restarts: pod.restartCount,
        })),
    [pods]
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="CPU Usage Trends" subtitle="Last 24 hours" delay={0.1}>
          <motion.div key={tick} initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cpuData}>
                <defs>
                  <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.02 260 / 0.5)" />
                <XAxis dataKey="time" stroke="oklch(0.65 0 0)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.65 0 0)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke={chartColors.primary} strokeWidth={2} fill="url(#cpuGradient)" isAnimationActive />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </ChartCard>

        <ChartCard title="Memory Usage Trends" subtitle="Last 24 hours" delay={0.2}>
          <motion.div key={tick} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={memData}>
                <defs>
                  <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.accent} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={chartColors.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.02 260 / 0.5)" />
                <XAxis dataKey="time" stroke="oklch(0.65 0 0)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.65 0 0)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke={chartColors.accent} strokeWidth={2} fill="url(#memGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Namespace Resource Comparison" subtitle="CPU & Memory by namespace" delay={0.3}>
          <motion.div key={tick} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={nsData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.02 260 / 0.5)" />
                <XAxis dataKey="name" stroke="oklch(0.65 0 0)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.65 0 0)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>} />
                <Bar dataKey="cpu" name="CPU" fill={chartColors.primary} radius={[4, 4, 0, 0]} />
                <Bar dataKey="memory" name="Memory" fill={chartColors.accent} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </ChartCard>

        <ChartCard title="Pod Restart Analytics" subtitle="Pods with highest restart counts" delay={0.4}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={restartData} layout="vertical" barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.02 260 / 0.5)" horizontal={false} />
                <XAxis type="number" stroke="oklch(0.65 0 0)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" stroke="oklch(0.65 0 0)" fontSize={11} tickLine={false} axisLine={false} width={50} />
                <Bar dataKey="restarts" fill={chartColors.destructive} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Network Throughput" subtitle="Inbound & Outbound (MB/s)" delay={0.5} className="lg:col-span-2">
        <motion.div key={tick} className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={netData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.02 260 / 0.5)" />
              <XAxis dataKey="time" stroke="oklch(0.65 0 0)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.65 0 0)" fontSize={12} tickLine={false} axisLine={false} />
              <Legend />
              <Line type="monotone" dataKey="inbound" name="Inbound" stroke={chartColors.success} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="outbound" name="Outbound" stroke={chartColors.warning} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </ChartCard>
    </div>
  )
}
