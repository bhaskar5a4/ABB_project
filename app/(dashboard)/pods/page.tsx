'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Box,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Cpu,
  MemoryStick,
  RotateCcw,
  Server,
  ChevronDown,
  ExternalLink,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { cn } from '@/lib/utils'
import type { Pod } from '@/lib/k8s-data'
import { getPodHistory } from '@/lib/k8s-data'
import { useCluster } from '@/context/cluster-context'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

const statusColors = {
  Running: { bg: 'bg-success/10', text: 'text-success', icon: CheckCircle2 },
  Pending: { bg: 'bg-warning/10', text: 'text-warning', icon: Clock },
  Failed: { bg: 'bg-destructive/10', text: 'text-destructive', icon: XCircle },
  CrashLoopBackOff: { bg: 'bg-destructive/10', text: 'text-destructive', icon: AlertTriangle },
}

// Restart analytics data
const restartAnalytics = [
  { name: 'notification', restarts: 15, namespace: 'production' },
  { name: 'payment', restarts: 3, namespace: 'production' },
  { name: 'database', restarts: 2, namespace: 'production' },
  { name: 'analytics', restarts: 1, namespace: 'analytics' },
  { name: 'gateway', restarts: 0, namespace: 'production' },
]

export default function PodMonitoringPage() {
  const { pods: mockPods, tick, refresh } = useCluster()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNamespace, setSelectedNamespace] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedPod, setSelectedPod] = useState<Pod | null>(null)

  const podHistory = selectedPod ? getPodHistory(selectedPod.name, tick) : []

  const filteredPods = mockPods.filter(pod => {
    const matchesSearch = pod.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesNamespace = selectedNamespace === 'all' || pod.namespace === selectedNamespace
    const matchesStatus = selectedStatus === 'all' || pod.status === selectedStatus
    return matchesSearch && matchesNamespace && matchesStatus
  })

  const namespaces = ['all', ...Array.from(new Set(mockPods.map(p => p.namespace)))]
  const statuses = ['all', 'Running', 'Pending', 'Failed', 'CrashLoopBackOff']

  const podStats = {
    running: mockPods.filter(p => p.status === 'Running').length,
    pending: mockPods.filter(p => p.status === 'Pending').length,
    failed: mockPods.filter(p => p.status === 'Failed' || p.status === 'CrashLoopBackOff').length,
    total: mockPods.length,
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pod Monitoring</h1>
          <p className="mt-1 text-muted-foreground">
            Real-time pod health, metrics, and restart analytics
          </p>
        </div>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={refresh}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Running', value: podStats.running, icon: CheckCircle2, color: 'success' },
          { label: 'Pending', value: podStats.pending, icon: Clock, color: 'warning' },
          { label: 'Failed/Crash', value: podStats.failed, icon: XCircle, color: 'destructive' },
          { label: 'Total Pods', value: podStats.total, icon: Box, color: 'primary' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.02, y: -2 }}
            className="glass-card rounded-xl p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={cn(
                'rounded-lg p-2.5',
                `bg-${stat.color}/10 text-${stat.color}`
              )}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search pods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-card/50 py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        
        <div className="relative">
          <select
            value={selectedNamespace}
            onChange={(e) => setSelectedNamespace(e.target.value)}
            className="appearance-none rounded-lg border border-border bg-card/50 py-2.5 pl-4 pr-10 text-sm outline-none transition-colors focus:border-primary"
          >
            {namespaces.map(ns => (
              <option key={ns} value={ns}>{ns === 'all' ? 'All Namespaces' : ns}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="appearance-none rounded-lg border border-border bg-card/50 py-2.5 pl-4 pr-10 text-sm outline-none transition-colors focus:border-primary"
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status === 'all' ? 'All Status' : status}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pod Table */}
        <motion.div variants={itemVariants} className="glass-card rounded-xl p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Pod List</h2>
            <span className="text-sm text-muted-foreground">{filteredPods.length} pods</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Pod Name</th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">CPU</th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Memory</th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Restarts</th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Age</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredPods.map((pod) => {
                  const StatusIcon = statusColors[pod.status].icon
                  return (
                    <motion.tr
                      key={pod.id}
                      whileHover={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}
                      className="cursor-pointer transition-colors"
                      onClick={() => setSelectedPod(pod)}
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Box className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{pod.name}</p>
                            <p className="text-xs text-muted-foreground">{pod.namespace}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                          statusColors[pod.status].bg,
                          statusColors[pod.status].text
                        )}>
                          <StatusIcon className="h-3 w-3" />
                          {pod.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn(
                                'h-full rounded-full',
                                pod.cpuUsage > 80 ? 'bg-destructive' : pod.cpuUsage > 60 ? 'bg-warning' : 'bg-primary'
                              )}
                              style={{ width: `${pod.cpuUsage}%` }}
                            />
                          </div>
                          <span className="text-xs">{pod.cpuUsage}%</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn(
                                'h-full rounded-full',
                                pod.memoryUsage > 80 ? 'bg-destructive' : pod.memoryUsage > 60 ? 'bg-warning' : 'bg-accent'
                              )}
                              style={{ width: `${pod.memoryUsage}%` }}
                            />
                          </div>
                          <span className="text-xs">{pod.memoryUsage}%</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={cn(
                          'text-sm',
                          pod.restartCount > 5 ? 'font-medium text-destructive' : 
                          pod.restartCount > 0 ? 'text-warning' : 'text-muted-foreground'
                        )}>
                          {pod.restartCount}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">{pod.age}</td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Pod Details Panel */}
        <motion.div variants={itemVariants} className="glass-card rounded-xl p-6">
          <h2 className="mb-4 text-lg font-semibold">Pod Details</h2>
          
          <AnimatePresence mode="wait">
            {selectedPod ? (
              <motion.div
                key={selectedPod.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pod Name</p>
                    <p className="font-semibold">{selectedPod.name}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="rounded-lg bg-primary/10 p-2 text-primary"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </motion.button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Namespace</p>
                    <p className="text-sm font-medium">{selectedPod.namespace}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Node</p>
                    <p className="text-sm font-medium">{selectedPod.node}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Age</p>
                    <p className="text-sm font-medium">{selectedPod.age}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Restarts</p>
                    <p className={cn(
                      'text-sm font-medium',
                      selectedPod.restartCount > 5 ? 'text-destructive' : ''
                    )}>{selectedPod.restartCount}</p>
                  </div>
                </div>
                
                <div className="pt-2">
                  <p className="mb-2 text-xs text-muted-foreground">CPU Usage (Last 12m)</p>
                  <div className="h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={podHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                        <Line
                          type="monotone"
                          dataKey="cpu"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <p className="mb-2 text-xs text-muted-foreground">Memory Usage (Last 12m)</p>
                  <div className="h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={podHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                        <Line
                          type="monotone"
                          dataKey="memory"
                          stroke="hsl(var(--accent))"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-64 flex-col items-center justify-center text-center"
              >
                <Box className="mb-3 h-12 w-12 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Select a pod to view details</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Restart Analytics */}
      <motion.div variants={itemVariants} className="glass-card rounded-xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Restart Analytics</h2>
            <p className="text-sm text-muted-foreground">Pods with highest restart counts</p>
          </div>
          <RotateCcw className="h-5 w-5 text-muted-foreground" />
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={restartAnalytics} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${value} restarts`, 'Count']}
              />
              <Bar
                dataKey="restarts"
                fill="hsl(var(--destructive))"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </motion.div>
  )
}
