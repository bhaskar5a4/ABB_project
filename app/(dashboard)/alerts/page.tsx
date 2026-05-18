'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Filter,
  Search,
  Clock,
  Bell,
  BellOff,
  XCircle,
  RefreshCw,
  ChevronRight,
  Activity,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Alert } from '@/lib/k8s-data'
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

const severityConfig = {
  critical: {
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    text: 'text-destructive',
    icon: XCircle,
  },
  warning: {
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    text: 'text-warning',
    icon: AlertTriangle,
  },
  info: {
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    text: 'text-primary',
    icon: Info,
  },
}

const staticExtraAlerts: Alert[] = [
  { id: '6', severity: 'warning', title: 'Disk Usage Warning', description: 'Storage utilization at 75% on node-1', timestamp: '2 hours ago', createdAt: 0 },
  { id: '7', severity: 'info', title: 'Auto-scaling Triggered', description: 'gateway-api scaled up to 4 replicas', timestamp: '3 hours ago', createdAt: 0 },
  { id: '8', severity: 'critical', title: 'Network Latency Spike', description: 'P99 latency increased to 500ms', timestamp: '4 hours ago', createdAt: 0 },
]

// Anomaly detection history
const anomalyHistory = [
  { id: '1', type: 'Memory Leak', service: 'notification-service', detected: '2 hours ago', status: 'active', confidence: 87 },
  { id: '2', type: 'Traffic Anomaly', service: 'gateway-api', detected: '4 hours ago', status: 'resolved', confidence: 92 },
  { id: '3', type: 'CPU Spike Pattern', service: 'payment-service', detected: '6 hours ago', status: 'investigating', confidence: 78 },
  { id: '4', type: 'Restart Loop', service: 'database-service', detected: '8 hours ago', status: 'resolved', confidence: 95 },
  { id: '5', type: 'Latency Degradation', service: 'analytics-engine', detected: '12 hours ago', status: 'resolved', confidence: 81 },
]

const anomalyStatusColors = {
  active: { bg: 'bg-destructive/10', text: 'text-destructive' },
  investigating: { bg: 'bg-warning/10', text: 'text-warning' },
  resolved: { bg: 'bg-success/10', text: 'text-success' },
}

export default function AlertsPage() {
  const { alerts: liveAlerts } = useCluster()
  const extendedAlerts = [...liveAlerts, ...staticExtraAlerts]
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [mutedAlerts, setMutedAlerts] = useState<Set<string>>(new Set())

  const filteredAlerts = extendedAlerts.filter(alert => {
    const matchesSeverity = selectedSeverity === 'all' || alert.severity === selectedSeverity
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          alert.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSeverity && matchesSearch
  })

  const alertCounts = {
    critical: extendedAlerts.filter(a => a.severity === 'critical').length,
    warning: extendedAlerts.filter(a => a.severity === 'warning').length,
    info: extendedAlerts.filter(a => a.severity === 'info').length,
  }

  const toggleMute = (alertId: string) => {
    setMutedAlerts(prev => {
      const next = new Set(prev)
      if (next.has(alertId)) {
        next.delete(alertId)
      } else {
        next.add(alertId)
      }
      return next
    })
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
          <h1 className="text-3xl font-bold tracking-tight">Alerts & Anomalies</h1>
          <p className="mt-1 text-muted-foreground">
            Monitor incidents and AI-detected anomalies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium"
          >
            <BellOff className="h-4 w-4" />
            Mute All
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Critical', value: alertCounts.critical, icon: XCircle, color: 'destructive' },
          { label: 'Warning', value: alertCounts.warning, icon: AlertTriangle, color: 'warning' },
          { label: 'Info', value: alertCounts.info, icon: Info, color: 'primary' },
          { label: 'Active Anomalies', value: anomalyHistory.filter(a => a.status === 'active').length, icon: Zap, color: 'accent' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.02, y: -2 }}
            className={cn(
              'glass-card rounded-xl p-5',
              stat.color === 'destructive' && alertCounts.critical > 0 && 'border border-destructive/30'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={cn('rounded-lg p-2.5', `bg-${stat.color}/10 text-${stat.color}`)}>
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
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-card/50 py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary"
          />
        </div>
        
        <div className="flex items-center gap-2">
          {['all', 'critical', 'warning', 'info'].map((severity) => (
            <motion.button
              key={severity}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedSeverity(severity)}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                selectedSeverity === severity
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {severity.charAt(0).toUpperCase() + severity.slice(1)}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Alert Timeline */}
        <motion.div variants={itemVariants} className="glass-card rounded-xl p-6 lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Alert Timeline</h2>
              <p className="text-sm text-muted-foreground">Recent incidents and notifications</p>
            </div>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
          
          <div className="relative space-y-4">
            {/* Timeline line */}
            <div className="absolute bottom-0 left-5 top-0 w-px bg-border" />
            
            <AnimatePresence>
              {filteredAlerts.map((alert, index) => {
                const config = severityConfig[alert.severity]
                const SeverityIcon = config.icon
                const isMuted = mutedAlerts.has(alert.id)
                
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: isMuted ? 0.5 : 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedAlert(alert)}
                    className={cn(
                      'relative cursor-pointer rounded-lg border p-4 pl-14 transition-all hover:bg-muted/30',
                      config.border,
                      selectedAlert?.id === alert.id && 'ring-2 ring-primary'
                    )}
                  >
                    {/* Timeline dot */}
                    <div className={cn(
                      'absolute left-2.5 top-5 flex h-5 w-5 items-center justify-center rounded-full',
                      config.bg
                    )}>
                      <div className={cn('h-2 w-2 rounded-full', `bg-${alert.severity === 'critical' ? 'destructive' : alert.severity === 'warning' ? 'warning' : 'primary'}`)} />
                    </div>
                    
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <SeverityIcon className={cn('h-4 w-4', config.text)} />
                          <span className={cn(
                            'rounded-full px-2 py-0.5 text-xs font-medium',
                            config.bg, config.text
                          )}>
                            {alert.severity}
                          </span>
                          <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                        </div>
                        <h3 className="font-medium">{alert.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{alert.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleMute(alert.id)
                          }}
                          className="rounded-lg p-2 hover:bg-muted"
                        >
                          {isMuted ? (
                            <BellOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Bell className="h-4 w-4 text-muted-foreground" />
                          )}
                        </motion.button>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Anomaly Detection */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="glass-card rounded-xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Anomaly Detection</h2>
              <Activity className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <div className="space-y-3">
              {anomalyHistory.map((anomaly) => {
                const statusConfig = anomalyStatusColors[anomaly.status as keyof typeof anomalyStatusColors]
                
                return (
                  <motion.div
                    key={anomaly.id}
                    whileHover={{ scale: 1.02 }}
                    className="rounded-lg border border-border/50 bg-card/30 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium text-sm">{anomaly.type}</span>
                      <span className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        statusConfig.bg, statusConfig.text
                      )}>
                        {anomaly.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{anomaly.service}</span>
                      <span>{anomaly.detected}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${anomaly.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs">{anomaly.confidence}%</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Alert Details */}
          {selectedAlert && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-xl p-6"
            >
              <h3 className="mb-4 font-semibold">Alert Details</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">Title</p>
                  <p className="font-medium">{selectedAlert.title}</p>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground">Description</p>
                  <p className="text-sm">{selectedAlert.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Severity</p>
                    <span className={cn(
                      'inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-medium',
                      severityConfig[selectedAlert.severity].bg,
                      severityConfig[selectedAlert.severity].text
                    )}>
                      {selectedAlert.severity}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Time</p>
                    <p className="text-sm">{selectedAlert.timestamp}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground"
                  >
                    Acknowledge
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 rounded-lg border border-border py-2 text-sm font-medium"
                  >
                    Dismiss
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
