import { createSeededRandom, hashString } from './seeded-random'
import { analyzePodsAndGenerateInsights } from './insight-engine'

export const namespaces = [
  'production',
  'monitoring',
  'analytics',
  'testing',
  'security',
] as const

export type Namespace = (typeof namespaces)[number]

export type PodStatus = 'Running' | 'Pending' | 'Failed' | 'CrashLoopBackOff'

export interface Pod {
  id: string
  name: string
  namespace: Namespace
  status: PodStatus
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  networkTraffic: number
  restartCount: number
  healthScore: number
  anomalyScore: number
  age: string
  node: string
  updatedAt: string
}

export interface Alert {
  id: string
  severity: 'critical' | 'warning' | 'info'
  title: string
  description: string
  pod?: string
  namespace?: Namespace
  timestamp: string
  createdAt: number
}

export type { AIInsight, InsightSeverity, InsightCategory } from './insight-types'

export interface Metric {
  timestamp: string
  value: number
}

export interface ServiceDependency {
  source: string
  target: string
  traffic: number
  latency: number
}

const CORE_PODS: Array<{
  name: string
  namespace: Namespace
  status: PodStatus
  baseCpu: number
  baseMem: number
  baseDisk: number
  baseNet: number
  restarts: number
  health: number
  anomaly: number
  age: string
  node: string
}> = [
  { name: 'auth-service', namespace: 'production', status: 'Running', baseCpu: 45, baseMem: 62, baseDisk: 38, baseNet: 120, restarts: 0, health: 94, anomaly: 8, age: '5d', node: 'node-1' },
  { name: 'payment-service', namespace: 'production', status: 'Running', baseCpu: 89, baseMem: 78, baseDisk: 52, baseNet: 340, restarts: 3, health: 58, anomaly: 82, age: '3d', node: 'node-2' },
  { name: 'gateway-api', namespace: 'production', status: 'Running', baseCpu: 34, baseMem: 41, baseDisk: 28, baseNet: 890, restarts: 0, health: 96, anomaly: 12, age: '10d', node: 'node-3' },
  { name: 'analytics-engine', namespace: 'analytics', status: 'Running', baseCpu: 72, baseMem: 68, baseDisk: 61, baseNet: 210, restarts: 1, health: 71, anomaly: 65, age: '4d', node: 'node-1' },
  { name: 'recommendation-engine', namespace: 'analytics', status: 'Running', baseCpu: 67, baseMem: 55, baseDisk: 44, baseNet: 180, restarts: 0, health: 88, anomaly: 22, age: '7d', node: 'node-1' },
  { name: 'notification-service', namespace: 'production', status: 'CrashLoopBackOff', baseCpu: 12, baseMem: 89, baseDisk: 71, baseNet: 45, restarts: 15, health: 24, anomaly: 94, age: '2d', node: 'node-2' },
  { name: 'prometheus', namespace: 'monitoring', status: 'Running', baseCpu: 23, baseMem: 45, baseDisk: 55, baseNet: 95, restarts: 0, health: 92, anomaly: 18, age: '15d', node: 'node-3' },
  { name: 'grafana', namespace: 'monitoring', status: 'Running', baseCpu: 18, baseMem: 32, baseDisk: 22, baseNet: 60, restarts: 0, health: 97, anomaly: 5, age: '15d', node: 'node-3' },
  { name: 'vault', namespace: 'security', status: 'Running', baseCpu: 15, baseMem: 28, baseDisk: 18, baseNet: 40, restarts: 0, health: 99, anomaly: 3, age: '20d', node: 'node-1' },
  { name: 'test-runner', namespace: 'testing', status: 'Pending', baseCpu: 0, baseMem: 5, baseDisk: 2, baseNet: 0, restarts: 0, health: 50, anomaly: 10, age: '1h', node: 'node-2' },
]

function jitter(value: number, delta: number, rand: () => number, min = 0, max = 100) {
  return Math.round(Math.max(min, Math.min(max, value + (rand() - 0.5) * delta * 2)))
}

export function createInitialPods(): Pod[] {
  return CORE_PODS.map((p, i) => ({
    id: String(i + 1),
    name: p.name,
    namespace: p.namespace,
    status: p.status,
    cpuUsage: p.baseCpu,
    memoryUsage: p.baseMem,
    diskUsage: p.baseDisk,
    networkTraffic: p.baseNet,
    restartCount: p.restarts,
    healthScore: p.health,
    anomalyScore: p.anomaly,
    age: p.age,
    node: p.node,
    updatedAt: new Date(0).toISOString(),
  }))
}

export function tickPods(pods: Pod[], tick: number): Pod[] {
  const rand = createSeededRandom(42 + tick)
  return pods.map((pod) => {
    const base = CORE_PODS.find((p) => p.name === pod.name)
    if (!base) return pod

    const cpu = jitter(base.baseCpu, 8, rand)
    const memory = jitter(base.baseMem, 6, rand)
    const disk = jitter(base.baseDisk, 4, rand, 0, 95)
    const network = Math.max(0, Math.round(base.baseNet + (rand() - 0.5) * 40))
    const anomaly = jitter(base.anomaly, 5, rand, 0, 100)
    const health = jitter(base.health, 4, rand, 0, 100)

    let restartCount = pod.restartCount
    if (base.status === 'CrashLoopBackOff' && rand() > 0.85) {
      restartCount += 1
    }

    return {
      ...pod,
      cpuUsage: cpu,
      memoryUsage: memory,
      diskUsage: disk,
      networkTraffic: network,
      anomalyScore: anomaly,
      healthScore: health,
      restartCount,
      updatedAt: new Date(0).toISOString(),
    }
  })
}

export const mockPods: Pod[] = createInitialPods()

export const mockDependencies: ServiceDependency[] = [
  { source: 'gateway-api', target: 'auth-service', traffic: 1250, latency: 12 },
  { source: 'gateway-api', target: 'payment-service', traffic: 890, latency: 45 },
  { source: 'gateway-api', target: 'notification-service', traffic: 560, latency: 180 },
  { source: 'auth-service', target: 'payment-service', traffic: 320, latency: 18 },
  { source: 'payment-service', target: 'analytics-engine', traffic: 450, latency: 95 },
  { source: 'recommendation-engine', target: 'analytics-engine', traffic: 780, latency: 23 },
  { source: 'analytics-engine', target: 'auth-service', traffic: 210, latency: 28 },
  { source: 'notification-service', target: 'auth-service', traffic: 2400, latency: 35 },
  { source: 'payment-service', target: 'notification-service', traffic: 450, latency: 95 },
]

/** @deprecated Use analyzePodsAndGenerateInsights from insight-engine */
export function generateInsights(pods: Pod[], tick = 0) {
  return analyzePodsAndGenerateInsights(pods, tick)
}

export function generateAlerts(pods: Pod[]): Alert[] {
  const alerts: Alert[] = []
  let id = 1

  pods.forEach((pod) => {
    if (pod.status === 'CrashLoopBackOff') {
      alerts.push({
        id: String(id++),
        severity: 'critical',
        title: 'Pod CrashLoopBackOff',
        description: `${pod.name} has restarted ${pod.restartCount} times`,
        pod: pod.name,
        namespace: pod.namespace,
        timestamp: '2 min ago',
        createdAt: Date.now() - 120000,
      })
    }
    if (pod.cpuUsage > 85) {
      alerts.push({
        id: String(id++),
        severity: 'warning',
        title: 'CPU spike detected',
        description: `${pod.name} CPU usage at ${pod.cpuUsage}%`,
        pod: pod.name,
        namespace: pod.namespace,
        timestamp: '5 min ago',
        createdAt: Date.now() - 300000,
      })
    }
    if (pod.memoryUsage > 85) {
      alerts.push({
        id: String(id++),
        severity: 'critical',
        title: 'Memory threshold exceeded',
        description: `${pod.name} memory at ${pod.memoryUsage}%`,
        pod: pod.name,
        namespace: pod.namespace,
        timestamp: '8 min ago',
        createdAt: Date.now() - 480000,
      })
    }
    if (pod.restartCount > 2 && pod.status === 'Running') {
      alerts.push({
        id: String(id++),
        severity: 'warning',
        title: 'Restart anomaly detected',
        description: `${pod.name} restarted ${pod.restartCount} times recently`,
        pod: pod.name,
        namespace: pod.namespace,
        timestamp: '15 min ago',
        createdAt: Date.now() - 900000,
      })
    }
  })

  alerts.push({
    id: String(id++),
    severity: 'info',
    title: 'Scaling event',
    description: 'gateway-api scaled from 2 to 3 replicas',
    pod: 'gateway-api',
    namespace: 'production',
    timestamp: '1 hour ago',
    createdAt: Date.now() - 3600000,
  })

  return alerts.sort((a, b) => b.createdAt - a.createdAt)
}

export function computeDashboardMetrics(pods: Pod[], alerts: Alert[]) {
  const running = pods.filter((p) => p.status === 'Running').length
  const avgCpu = Math.round(pods.reduce((s, p) => s + p.cpuUsage, 0) / pods.length)
  const avgMem = Math.round(pods.reduce((s, p) => s + p.memoryUsage, 0) / pods.length)
  const avgDisk = Math.round(pods.reduce((s, p) => s + p.diskUsage, 0) / pods.length)
  const netMbps = Math.round(pods.reduce((s, p) => s + p.networkTraffic, 0) / 100) / 10
  const criticalAlerts = alerts.filter((a) => a.severity === 'critical').length
  const restarts = pods.reduce((s, p) => s + p.restartCount, 0)
  const healthy = pods.filter((p) => p.healthScore >= 70).length

  return {
    cpu: { value: avgCpu, trend: 5.2, status: avgCpu > 75 ? ('warning' as const) : ('healthy' as const) },
    memory: { value: avgMem, trend: -2.1, status: avgMem > 70 ? ('warning' as const) : ('healthy' as const) },
    disk: { value: avgDisk, trend: 1.8, status: 'healthy' as const },
    network: { value: netMbps, unit: 'GB/s', trend: 12.5, status: 'healthy' as const },
    activePods: { value: running, total: pods.length, trend: 0, status: 'healthy' as const },
    criticalAlerts: { value: criticalAlerts, trend: 50, status: criticalAlerts > 0 ? ('critical' as const) : ('healthy' as const) },
    healthyServices: { value: healthy, total: pods.length, trend: -5, status: healthy < pods.length ? ('warning' as const) : ('healthy' as const) },
    restartCount: { value: restarts, trend: 180, status: restarts > 10 ? ('critical' as const) : ('warning' as const) },
  }
}

export function generateTimeSeriesData(
  hours: number = 24,
  baseValue: number = 50,
  variance: number = 20,
  seed: number = 100
): Metric[] {
  const rand = createSeededRandom(seed)
  const data: Metric[] = []
  const base = new Date('2026-05-17T12:00:00Z').getTime()

  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(base - i * 60 * 60 * 1000).toISOString()
    const value = Math.max(0, Math.min(100, baseValue + (rand() - 0.5) * variance * 2))
    data.push({ timestamp, value: Math.round(value * 10) / 10 })
  }
  return data
}

export function getNamespaceResourceData(seed = 200) {
  const rand = createSeededRandom(seed)
  const cpuByNs: Record<Namespace, number> = {
    production: 72,
    monitoring: 28,
    analytics: 58,
    testing: 12,
    security: 18,
  }
  const memByNs: Record<Namespace, number> = {
    production: 68,
    monitoring: 42,
    analytics: 61,
    testing: 8,
    security: 24,
  }
  return namespaces.map((ns) => ({
    name: ns.charAt(0).toUpperCase() + ns.slice(1),
    cpu: jitter(cpuByNs[ns], 4, rand, 5, 95),
    memory: jitter(memByNs[ns], 4, rand, 5, 95),
  }))
}

export function getNetworkThroughputData(seed = 300) {
  const rand = createSeededRandom(seed)
  return Array.from({ length: 25 }, (_, i) => ({
    time: `${24 - i}h`,
    inbound: Math.floor(200 + rand() * 500),
    outbound: Math.floor(150 + rand() * 400),
  }))
}

export const forecastData = {
  cpuForecast: [
    { time: 'Now', actual: 67, predicted: 67, lower: 62, upper: 72 },
    { time: '+1h', actual: null, predicted: 72, lower: 66, upper: 78 },
    { time: '+2h', actual: null, predicted: 78, lower: 70, upper: 86 },
    { time: '+4h', actual: null, predicted: 85, lower: 76, upper: 94 },
    { time: '+8h', actual: null, predicted: 82, lower: 73, upper: 91 },
    { time: '+12h', actual: null, predicted: 75, lower: 67, upper: 83 },
  ],
  memoryLeakPrediction: {
    currentRate: 2.3,
    timeToOOM: 47,
    confidence: 87,
    pod: 'analytics-engine',
  },
  downtimeProbability: { next1h: 12, next4h: 34, next24h: 68 },
  scalingRecommendations: [
    { pod: 'payment-service', currentReplicas: 3, recommendedReplicas: 5, reason: 'High CPU utilization' },
    { pod: 'analytics-engine', currentReplicas: 2, recommendedReplicas: 4, reason: 'Memory pressure' },
    { pod: 'gateway-api', currentReplicas: 3, recommendedReplicas: 3, reason: 'Optimal' },
  ],
}

export function getPodHistory(podName: string, tick: number) {
  const rand = createSeededRandom(hashString(podName) + tick)
  return Array.from({ length: 12 }, (_, i) => ({
    time: `${11 - i}m`,
    cpu: Math.round(30 + rand() * 50),
    memory: Math.round(40 + rand() * 40),
  }))
}

// Re-export legacy names
export const mockAIInsights = generateInsights(mockPods)
export const mockAlerts = generateAlerts(mockPods)
export const dashboardMetrics = computeDashboardMetrics(mockPods, mockAlerts)
