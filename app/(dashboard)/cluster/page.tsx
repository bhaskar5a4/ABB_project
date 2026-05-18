'use client'

import { motion } from 'framer-motion'
import {
  Server,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Database,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
  Box,
  Layers,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { cn } from '@/lib/utils'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

// Mock data for cluster overview
const nodes = [
  { id: 1, name: 'node-1', status: 'Ready', cpu: 67, memory: 72, pods: 18, role: 'control-plane' },
  { id: 2, name: 'node-2', status: 'Ready', cpu: 45, memory: 58, pods: 15, role: 'worker' },
  { id: 3, name: 'node-3', status: 'Ready', cpu: 82, memory: 89, pods: 14, role: 'worker' },
  { id: 4, name: 'node-4', status: 'NotReady', cpu: 0, memory: 0, pods: 0, role: 'worker' },
]

const namespaceData = [
  { name: 'production', pods: 12, cpu: 78, memory: 82, status: 'healthy' },
  { name: 'monitoring', pods: 8, cpu: 23, memory: 45, status: 'healthy' },
  { name: 'analytics', pods: 6, cpu: 67, memory: 55, status: 'warning' },
  { name: 'security', pods: 4, cpu: 15, memory: 28, status: 'healthy' },
  { name: 'testing', pods: 2, cpu: 5, memory: 12, status: 'pending' },
]

const workloadDistribution = [
  { name: 'Deployments', value: 24, color: 'hsl(var(--primary))' },
  { name: 'StatefulSets', value: 8, color: 'hsl(var(--accent))' },
  { name: 'DaemonSets', value: 5, color: 'hsl(var(--chart-3))' },
  { name: 'Jobs', value: 12, color: 'hsl(var(--chart-4))' },
  { name: 'CronJobs', value: 6, color: 'hsl(var(--chart-5))' },
]

const storageData = [
  { name: 'ssd-fast', used: 245, total: 500, type: 'SSD' },
  { name: 'hdd-standard', used: 1200, total: 2000, type: 'HDD' },
  { name: 'nfs-shared', used: 89, total: 200, type: 'NFS' },
]

const nodeMetricsHistory = Array.from({ length: 24 }, (_, i) => ({
  time: `${23 - i}h`,
  cpu: Math.round(50 + Math.random() * 30),
  memory: Math.round(55 + Math.random() * 25),
  network: Math.round(1 + Math.random() * 3),
})).reverse()

export default function ClusterOverviewPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Cluster Overview</h1>
          <p className="mt-1 text-muted-foreground">
            Monitor your Kubernetes cluster health and resources
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-success/10 px-4 py-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-success" />
          <span className="text-sm font-medium text-success">Cluster Healthy</span>
        </div>
      </motion.div>

      {/* Cluster Stats Cards */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Nodes', value: '4', sub: '3 Ready', icon: Server, status: 'warning' },
          { label: 'Total Pods', value: '47', sub: '52 Requested', icon: Box, status: 'healthy' },
          { label: 'CPU Allocated', value: '67%', sub: '16/24 cores', icon: Cpu, status: 'warning' },
          { label: 'Memory Allocated', value: '72%', sub: '48/64 GB', icon: MemoryStick, status: 'warning' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.02, y: -2 }}
            className="glass-card rounded-xl p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-3xl font-bold">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.sub}</p>
              </div>
              <div className={cn(
                'rounded-lg p-2.5',
                stat.status === 'healthy' ? 'bg-success/10 text-success' :
                stat.status === 'warning' ? 'bg-warning/10 text-warning' :
                'bg-destructive/10 text-destructive'
              )}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Nodes Section */}
      <motion.div variants={itemVariants} className="glass-card rounded-xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Node Status</h2>
            <p className="text-sm text-muted-foreground">Real-time node health and metrics</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span>3 Ready</span>
            </div>
            <div className="flex items-center gap-1.5">
              <XCircle className="h-4 w-4 text-destructive" />
              <span>1 NotReady</span>
            </div>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {nodes.map((node) => (
            <motion.div
              key={node.id}
              whileHover={{ scale: 1.02 }}
              className={cn(
                'rounded-lg border p-4 transition-all',
                node.status === 'Ready'
                  ? 'border-border/50 bg-card/50'
                  : 'border-destructive/30 bg-destructive/5'
              )}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{node.name}</span>
                </div>
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-medium',
                  node.status === 'Ready'
                    ? 'bg-success/10 text-success'
                    : 'bg-destructive/10 text-destructive'
                )}>
                  {node.status}
                </span>
              </div>
              
              {node.status === 'Ready' ? (
                <div className="space-y-3">
                  <div>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">CPU</span>
                      <span className={cn(
                        node.cpu > 80 ? 'text-destructive' : node.cpu > 60 ? 'text-warning' : 'text-foreground'
                      )}>{node.cpu}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${node.cpu}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={cn(
                          'h-full rounded-full',
                          node.cpu > 80 ? 'bg-destructive' : node.cpu > 60 ? 'bg-warning' : 'bg-primary'
                        )}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">Memory</span>
                      <span className={cn(
                        node.memory > 80 ? 'text-destructive' : node.memory > 60 ? 'text-warning' : 'text-foreground'
                      )}>{node.memory}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${node.memory}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
                        className={cn(
                          'h-full rounded-full',
                          node.memory > 80 ? 'bg-destructive' : node.memory > 60 ? 'bg-warning' : 'bg-accent'
                        )}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{node.pods} pods</span>
                    <span className="rounded bg-muted px-1.5 py-0.5">{node.role}</span>
                  </div>
                </div>
              ) : (
                <div className="flex h-20 items-center justify-center text-sm text-destructive">
                  Node unreachable
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Node Metrics History */}
        <motion.div variants={itemVariants} className="glass-card rounded-xl p-6">
          <h2 className="mb-4 text-lg font-semibold">Cluster Resource Trends</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={nodeMetricsHistory}>
                <defs>
                  <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cpu"
                  stroke="hsl(var(--primary))"
                  fill="url(#cpuGrad)"
                  strokeWidth={2}
                  name="CPU %"
                />
                <Area
                  type="monotone"
                  dataKey="memory"
                  stroke="hsl(var(--accent))"
                  fill="url(#memGrad)"
                  strokeWidth={2}
                  name="Memory %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Workload Distribution */}
        <motion.div variants={itemVariants} className="glass-card rounded-xl p-6">
          <h2 className="mb-4 text-lg font-semibold">Workload Distribution</h2>
          <div className="flex items-center gap-8">
            <div className="h-56 w-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={workloadDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {workloadDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3">
              {workloadDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Namespace Health */}
      <motion.div variants={itemVariants} className="glass-card rounded-xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Namespace Health</h2>
            <p className="text-sm text-muted-foreground">Resource allocation per namespace</p>
          </div>
          <Layers className="h-5 w-5 text-muted-foreground" />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Namespace</th>
                <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Pods</th>
                <th className="pb-3 text-left text-sm font-medium text-muted-foreground">CPU Usage</th>
                <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Memory Usage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {namespaceData.map((ns) => (
                <tr key={ns.name} className="group">
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{ns.name}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                      ns.status === 'healthy' ? 'bg-success/10 text-success' :
                      ns.status === 'warning' ? 'bg-warning/10 text-warning' :
                      'bg-muted text-muted-foreground'
                    )}>
                      {ns.status === 'healthy' ? <CheckCircle2 className="h-3 w-3" /> :
                       ns.status === 'warning' ? <AlertTriangle className="h-3 w-3" /> :
                       <Activity className="h-3 w-3" />}
                      {ns.status}
                    </span>
                  </td>
                  <td className="py-4 text-sm">{ns.pods} running</td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            ns.cpu > 70 ? 'bg-warning' : 'bg-primary'
                          )}
                          style={{ width: `${ns.cpu}%` }}
                        />
                      </div>
                      <span className="text-sm">{ns.cpu}%</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            ns.memory > 70 ? 'bg-warning' : 'bg-accent'
                          )}
                          style={{ width: `${ns.memory}%` }}
                        />
                      </div>
                      <span className="text-sm">{ns.memory}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Storage Overview */}
      <motion.div variants={itemVariants} className="glass-card rounded-xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Storage Overview</h2>
            <p className="text-sm text-muted-foreground">Persistent volume claims and usage</p>
          </div>
          <HardDrive className="h-5 w-5 text-muted-foreground" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          {storageData.map((storage) => (
            <motion.div
              key={storage.name}
              whileHover={{ scale: 1.02 }}
              className="rounded-lg border border-border/50 bg-card/50 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-medium">{storage.name}</span>
                <span className="rounded bg-muted px-2 py-0.5 text-xs">{storage.type}</span>
              </div>
              <div className="mb-2">
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-muted-foreground">Used</span>
                  <span>{storage.used} GB / {storage.total} GB</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(storage.used / storage.total) * 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={cn(
                      'h-full rounded-full',
                      (storage.used / storage.total) > 0.8 ? 'bg-destructive' :
                      (storage.used / storage.total) > 0.6 ? 'bg-warning' : 'bg-primary'
                    )}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round((storage.used / storage.total) * 100)}% utilized
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
