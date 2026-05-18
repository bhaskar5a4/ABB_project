'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  TrendingUp,
  Clock,
  AlertTriangle,
  Cpu,
  MemoryStick,
  Scale,
  ChevronRight,
  Zap,
} from 'lucide-react'
import { forecastData } from '@/lib/mock-data'

function ForecastChart() {
  const data = useMemo(() => forecastData.cpuForecast, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card overflow-hidden rounded-xl border border-border/50"
    >
      <div className="border-b border-border/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Cpu className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">CPU Usage Forecast</h3>
              <p className="text-sm text-muted-foreground">Predicted usage for next 12 hours</p>
            </div>
          </div>
          <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning">
            Peak: 85% in 4h
          </Badge>
        </div>
      </div>

      <div className="h-64 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.7 0.18 250)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="oklch(0.7 0.18 250)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.65 0.22 170)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="oklch(0.65 0.22 170)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.02 260 / 0.5)" />
            <XAxis
              dataKey="time"
              stroke="oklch(0.65 0 0)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="oklch(0.65 0 0)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="glass-card rounded-lg border border-border/50 p-3 shadow-xl">
                      <p className="mb-2 text-xs font-medium">{label}</p>
                      {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-xs text-muted-foreground">{entry.name}:</span>
                          <span className="text-sm font-medium">{entry.value}%</span>
                        </div>
                      ))}
                    </div>
                  )
                }
                return null
              }}
            />
            <ReferenceLine y={80} stroke="oklch(0.6 0.22 25)" strokeDasharray="5 5" />
            <Area
              type="monotone"
              dataKey="actual"
              name="Actual"
              stroke="oklch(0.65 0.22 170)"
              strokeWidth={2}
              fill="url(#actualGradient)"
            />
            <Area
              type="monotone"
              dataKey="predicted"
              name="Predicted"
              stroke="oklch(0.7 0.18 250)"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="url(#forecastGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

function MemoryLeakPrediction() {
  const { memoryLeakPrediction } = forecastData

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card overflow-hidden rounded-xl border border-destructive/30 bg-gradient-to-br from-destructive/10 to-transparent"
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/20">
              <MemoryStick className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold">Memory Leak Detection</h3>
              <p className="text-sm text-muted-foreground">notification-service</p>
            </div>
          </div>
          <Badge variant="destructive">CRITICAL</Badge>
        </div>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-border/30 bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Leak Rate</p>
              <p className="text-xl font-bold text-destructive">{memoryLeakPrediction.currentRate} MB/min</p>
            </div>
            <div className="rounded-lg border border-border/30 bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Time to OOM</p>
              <div className="flex items-baseline gap-1">
                <p className="text-xl font-bold text-destructive">{memoryLeakPrediction.timeToOOM}</p>
                <p className="text-sm text-muted-foreground">minutes</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Confidence</span>
              <span className="font-medium">{memoryLeakPrediction.confidence}%</span>
            </div>
            <Progress value={memoryLeakPrediction.confidence} className="h-2" />
          </div>

          <Button variant="destructive" className="w-full gap-2">
            <Zap className="h-4 w-4" />
            Take Immediate Action
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

function DowntimeProbability() {
  const { downtimeProbability } = forecastData

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card overflow-hidden rounded-xl border border-border/50"
    >
      <div className="border-b border-border/50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
            <Clock className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h3 className="font-semibold">Downtime Probability</h3>
            <p className="text-sm text-muted-foreground">Risk assessment over time</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border/30 p-2">
        {[
          { label: 'Next 1 hour', value: downtimeProbability.next1h, color: 'success' },
          { label: 'Next 4 hours', value: downtimeProbability.next4h, color: 'warning' },
          { label: 'Next 24 hours', value: downtimeProbability.next24h, color: 'destructive' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex items-center justify-between p-3"
          >
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <div className="flex items-center gap-3">
              <div className="w-24">
                <Progress 
                  value={item.value} 
                  className={cn(
                    'h-2',
                    item.color === 'success' && '[&>div]:bg-success',
                    item.color === 'warning' && '[&>div]:bg-warning',
                    item.color === 'destructive' && '[&>div]:bg-destructive'
                  )}
                />
              </div>
              <span className={cn(
                'w-12 text-right font-semibold',
                item.color === 'success' && 'text-success',
                item.color === 'warning' && 'text-warning',
                item.color === 'destructive' && 'text-destructive'
              )}>
                {item.value}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function ScalingRecommendations() {
  const { scalingRecommendations } = forecastData

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card overflow-hidden rounded-xl border border-border/50"
    >
      <div className="border-b border-border/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <Scale className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold">Scaling Recommendations</h3>
              <p className="text-sm text-muted-foreground">AI-optimized resource allocation</p>
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border/30">
        {scalingRecommendations.map((rec, i) => {
          const needsScaling = rec.currentReplicas !== rec.recommendedReplicas
          
          return (
            <motion.div
              key={rec.pod}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'h-2 w-2 rounded-full',
                  needsScaling ? 'bg-warning animate-pulse' : 'bg-success'
                )} />
                <div>
                  <p className="font-medium">{rec.pod}</p>
                  <p className="text-xs text-muted-foreground">{rec.reason}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right text-sm">
                  <span className="text-muted-foreground">{rec.currentReplicas}</span>
                  <span className="mx-1 text-muted-foreground">→</span>
                  <span className={cn(
                    'font-semibold',
                    needsScaling ? 'text-warning' : 'text-success'
                  )}>
                    {rec.recommendedReplicas}
                  </span>
                </div>
                
                {needsScaling && (
                  <Button variant="outline" size="sm" className="gap-1">
                    Scale
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

export function ForecastingSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Predictive Analytics</h2>
          <p className="text-sm text-muted-foreground">
            AI-powered forecasting and recommendations
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ForecastChart />
        <div className="space-y-4">
          <MemoryLeakPrediction />
          <DowntimeProbability />
        </div>
      </div>
      
      <ScalingRecommendations />
    </motion.section>
  )
}
