'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { Alert, Pod } from '@/lib/k8s-data'
import type { AIInsight } from '@/lib/insight-types'
import {
  computeDashboardMetrics,
  createInitialPods,
  generateAlerts,
  tickPods,
} from '@/lib/k8s-data'
import { analyzePodsAndGenerateInsights } from '@/lib/insight-engine'

interface ClusterContextValue {
  pods: Pod[]
  alerts: Alert[]
  insights: AIInsight[]
  dashboardMetrics: ReturnType<typeof computeDashboardMetrics>
  tick: number
  refresh: () => void
}

const ClusterContext = createContext<ClusterContextValue | null>(null)

const REFRESH_MS = 4000

export function ClusterProvider({ children }: { children: React.ReactNode }) {
  const [pods, setPods] = useState<Pod[]>(createInitialPods)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => {
        const next = t + 1
        setPods((prev) => tickPods(prev, next))
        return next
      })
    }, REFRESH_MS)
    return () => clearInterval(id)
  }, [])

  const refresh = useCallback(() => {
    setTick((t) => {
      const next = t + 1
      setPods((prev) => tickPods(prev, next))
      return next
    })
  }, [])

  const alerts = useMemo(() => generateAlerts(pods), [pods])
  const insights = useMemo(() => analyzePodsAndGenerateInsights(pods, tick), [pods, tick])
  const dashboardMetrics = useMemo(
    () => computeDashboardMetrics(pods, alerts),
    [pods, alerts]
  )

  const value = useMemo(
    () => ({
      pods,
      alerts,
      insights,
      dashboardMetrics,
      tick,
      refresh,
    }),
    [pods, alerts, insights, dashboardMetrics, tick, refresh]
  )

  return (
    <ClusterContext.Provider value={value}>{children}</ClusterContext.Provider>
  )
}

export function useCluster() {
  const ctx = useContext(ClusterContext)
  if (!ctx) throw new Error('useCluster must be used within ClusterProvider')
  return ctx
}
