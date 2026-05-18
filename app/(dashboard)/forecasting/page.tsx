'use client'

import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Cpu,
  MemoryStick,
  Activity,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Calendar,
  Info,
} from 'lucide-react'
import {
  AreaChart,
  Area,
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
import { forecastData } from '@/lib/mock-data'

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

// Extended forecast data
const cpuForecastData = [
  { time: 'Now', actual: 67, predicted: 67, lower: 62, upper: 72 },
  { time: '+1h', actual: null, predicted: 72, lower: 65, upper: 79 },
  { time: '+2h', actual: null, predicted: 78, lower: 70, upper: 86 },
  { time: '+4h', actual: null, predicted: 85, lower: 75, upper: 95 },
  { time: '+6h', actual: null, predicted: 82, lower: 72, upper: 92 },
  { time: '+8h', actual: null, predicted: 78, lower: 68, upper: 88 },
  { time: '+12h', actual: null, predicted: 75, lower: 65, upper: 85 },
  { time: '+24h', actual: null, predicted: 68, lower: 58, upper: 78 },
]

const memoryForecastData = [
  { time: 'Now', actual: 72, predicted: 72, lower: 68, upper: 76 },
  { time: '+1h', actual: null, predicted: 74, lower: 69, upper: 79 },
  { time: '+2h', actual: null, predicted: 78, lower: 72, upper: 84 },
  { time: '+4h', actual: null, predicted: 83, lower: 76, upper: 90 },
  { time: '+6h', actual: null, predicted: 88, lower: 80, upper: 96 },
  { time: '+8h', actual: null, predicted: 85, lower: 77, upper: 93 },
  { time: '+12h', actual: null, predicted: 80, lower: 72, upper: 88 },
  { time: '+24h', actual: null, predicted: 75, lower: 67, upper: 83 },
]

const downtimeRiskData = [
  { service: 'notification-service', risk: 78, trend: 'up' },
  { service: 'database-service', risk: 45, trend: 'stable' },
  { service: 'payment-service', risk: 32, trend: 'down' },
  { service: 'gateway-api', risk: 12, trend: 'stable' },
  { service: 'auth-service', risk: 8, trend: 'down' },
]

const weeklyTrend = [
  { day: 'Mon', cpu: 65, memory: 70, incidents: 2 },
  { day: 'Tue', cpu: 68, memory: 72, incidents: 1 },
  { day: 'Wed', cpu: 72, memory: 75, incidents: 3 },
  { day: 'Thu', cpu: 70, memory: 78, incidents: 2 },
  { day: 'Fri', cpu: 75, memory: 80, incidents: 4 },
  { day: 'Sat', cpu: 60, memory: 65, incidents: 1 },
  { day: 'Sun', cpu: 55, memory: 60, incidents: 0 },
]

export default function ForecastingPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Forecasting</h1>
          <p className="mt-1 text-muted-foreground">
            Predictive analytics and resource planning
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2">
          <Activity className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">ML Model: Active</span>
        </div>
      </motion.div>

      {/* Prediction Summary Cards */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-4">
        {[
          {
            label: 'Peak CPU (24h)',
            value: '85%',
            time: 'in 4 hours',
            icon: Cpu,
            trend: 'up',
            color: 'warning',
          },
          {
            label: 'Peak Memory (24h)',
            value: '88%',
            time: 'in 6 hours',
            icon: MemoryStick,
            trend: 'up',
            color: 'destructive',
          },
          {
            label: 'Downtime Risk',
            value: '34%',
            time: 'next 4 hours',
            icon: AlertTriangle,
            trend: 'up',
            color: 'warning',
          },
          {
            label: 'Scaling Events',
            value: '3',
            time: 'predicted today',
            icon: Zap,
            trend: 'stable',
            color: 'primary',
          },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.02, y: -2 }}
            className="glass-card rounded-xl p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <p className="text-3xl font-bold">{stat.value}</p>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="h-4 w-4 text-destructive" />
                  ) : stat.trend === 'down' ? (
                    <ArrowDownRight className="h-4 w-4 text-success" />
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{stat.time}</p>
              </div>
              <div className={cn('rounded-lg p-2.5', `bg-${stat.color}/10 text-${stat.color}`)}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Forecast Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* CPU Forecast */}
        <motion.div variants={itemVariants} className="glass-card rounded-xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">CPU Usage Forecast</h2>
              <p className="text-sm text-muted-foreground">24-hour prediction with confidence interval</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>Actual</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-accent" />
                <span>Predicted</span>
              </div>
            </div>
          </div>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cpuForecastData}>
                <defs>
                  <linearGradient id="cpuConfidence" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="upper"
                  stroke="none"
                  fill="url(#cpuConfidence)"
                  name="Upper Bound"
                />
                <Area
                  type="monotone"
                  dataKey="lower"
                  stroke="none"
                  fill="hsl(var(--background))"
                  name="Lower Bound"
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))' }}
                  name="Actual"
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: 'hsl(var(--accent))' }}
                  name="Predicted"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-warning/10 p-3">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-sm">
              CPU usage predicted to exceed 80% threshold in approximately 4 hours
            </span>
          </div>
        </motion.div>

        {/* Memory Forecast */}
        <motion.div variants={itemVariants} className="glass-card rounded-xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Memory Usage Forecast</h2>
              <p className="text-sm text-muted-foreground">24-hour prediction with trend analysis</p>
            </div>
            <div className="flex items-center gap-2 rounded bg-destructive/10 px-2 py-1">
              <TrendingUp className="h-3 w-3 text-destructive" />
              <span className="text-xs font-medium text-destructive">Rising Trend</span>
            </div>
          </div>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={memoryForecastData}>
                <defs>
                  <linearGradient id="memConfidence" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="upper"
                  stroke="none"
                  fill="url(#memConfidence)"
                />
                <Area
                  type="monotone"
                  dataKey="lower"
                  stroke="none"
                  fill="hsl(var(--background))"
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="hsl(var(--accent))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--accent))' }}
                  name="Actual"
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: 'hsl(var(--destructive))' }}
                  name="Predicted"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm">
              Memory leak detected. OOM predicted in ~47 minutes at current rate
            </span>
          </div>
        </motion.div>
      </div>

      {/* Downtime Risk & Scaling Recommendations */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Downtime Risk Assessment */}
        <motion.div variants={itemVariants} className="glass-card rounded-xl p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Downtime Risk Assessment</h2>
              <p className="text-sm text-muted-foreground">Service failure probability (next 4 hours)</p>
            </div>
            <Target className="h-5 w-5 text-muted-foreground" />
          </div>
          
          <div className="space-y-4">
            {downtimeRiskData.map((service) => (
              <motion.div
                key={service.service}
                whileHover={{ x: 4 }}
                className="flex items-center gap-4"
              >
                <div className="w-40 truncate font-medium text-sm">{service.service}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${service.risk}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={cn(
                          'h-full rounded-full',
                          service.risk > 60 ? 'bg-destructive' :
                          service.risk > 30 ? 'bg-warning' : 'bg-success'
                        )}
                      />
                    </div>
                    <span className={cn(
                      'w-12 text-right text-sm font-semibold',
                      service.risk > 60 ? 'text-destructive' :
                      service.risk > 30 ? 'text-warning' : 'text-success'
                    )}>
                      {service.risk}%
                    </span>
                    {service.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-destructive" />
                    ) : service.trend === 'down' ? (
                      <TrendingDown className="h-4 w-4 text-success" />
                    ) : (
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              { label: 'Next 1h', value: `${forecastData.downtimeProbability.next1h}%`, color: 'success' },
              { label: 'Next 4h', value: `${forecastData.downtimeProbability.next4h}%`, color: 'warning' },
              { label: 'Next 24h', value: `${forecastData.downtimeProbability.next24h}%`, color: 'destructive' },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-muted/30 p-3 text-center">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className={cn('text-xl font-bold', `text-${item.color}`)}>{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Scaling Recommendations */}
        <motion.div variants={itemVariants} className="glass-card rounded-xl p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Scaling Recommendations</h2>
              <p className="text-sm text-muted-foreground">AI-suggested resource adjustments</p>
            </div>
            <Zap className="h-5 w-5 text-primary" />
          </div>
          
          <div className="space-y-4">
            {forecastData.scalingRecommendations.map((rec, i) => (
              <motion.div
                key={rec.pod}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  'rounded-lg border p-4',
                  rec.recommendedReplicas > rec.currentReplicas
                    ? 'border-warning/30 bg-warning/5'
                    : 'border-border/50 bg-card/30'
                )}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">{rec.pod}</span>
                  {rec.recommendedReplicas > rec.currentReplicas ? (
                    <span className="flex items-center gap-1 rounded bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                      <ArrowUpRight className="h-3 w-3" />
                      Scale Up
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                      Optimal
                    </span>
                  )}
                </div>
                
                <div className="mb-2 flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Current</p>
                    <p className="text-lg font-bold">{rec.currentReplicas}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Recommended</p>
                    <p className={cn(
                      'text-lg font-bold',
                      rec.recommendedReplicas > rec.currentReplicas && 'text-warning'
                    )}>
                      {rec.recommendedReplicas}
                    </p>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground">{rec.reason}</p>
                
                {rec.recommendedReplicas > rec.currentReplicas && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-3 w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground"
                  >
                    Apply Recommendation
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Weekly Trend Analysis */}
      <motion.div variants={itemVariants} className="glass-card rounded-xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Weekly Trend Analysis</h2>
            <p className="text-sm text-muted-foreground">Historical patterns and incident correlation</p>
          </div>
          <Calendar className="h-5 w-5 text-muted-foreground" />
        </div>
        
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="cpu" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Avg CPU %" />
              <Bar dataKey="memory" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Avg Memory %" />
              <Bar dataKey="incidents" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} name="Incidents" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-primary/10 p-3">
          <Info className="h-4 w-4 text-primary" />
          <span className="text-sm">
            Pattern detected: Incident spikes correlate with Friday deployments. Consider implementing deployment freezes or enhanced monitoring.
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}
