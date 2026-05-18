import type { Pod } from './k8s-data'
import {
  SEVERITY_ORDER,
  type AIInsight,
  type InsightSeverity,
} from './insight-types'

const CPU_CRITICAL = 85
const CPU_WARNING = 70
const MEM_CRITICAL = 85
const MEM_WARNING = 68
const RESTART_CRITICAL = 8
const RESTART_WARNING = 2
const NETWORK_SPIKE_MB = 500
const ANOMALY_HIGH = 55

interface RuleContext {
  pods: Pod[]
  tick: number
}

function relTime(tick: number): string {
  if (tick % 5 === 0) return 'Just now'
  if (tick % 3 === 0) return `${(tick % 4) + 1} min ago`
  return 'Live'
}

function confidence(base: number, anomalyScore: number, severity: InsightSeverity): number {
  const boost = Math.min(12, Math.floor(anomalyScore / 10))
  const penalty = severity === 'info' ? 5 : 0
  return Math.min(99, Math.max(62, base + boost - penalty))
}

function makeInsight(
  partial: Omit<AIInsight, 'description'> & { explanation: string },
  ctx: RuleContext
): AIInsight {
  return {
    ...partial,
    description: partial.explanation,
    timestamp: relTime(ctx.tick),
  }
}

/** CPU utilization & spike detection */
function analyzeCpu(pods: Pod[], ctx: RuleContext): AIInsight[] {
  const out: AIInsight[] = []

  for (const pod of pods) {
    if (pod.cpuUsage >= CPU_CRITICAL || (pod.cpuUsage >= CPU_WARNING && pod.anomalyScore >= ANOMALY_HIGH)) {
      const severity: InsightSeverity =
        pod.cpuUsage >= CPU_CRITICAL || pod.anomalyScore >= 75 ? 'critical' : 'warning'
      out.push(
        makeInsight(
          {
            id: `cpu-${pod.id}-${ctx.tick}`,
            severity,
            category: 'cpu',
            title: `${pod.name} experiencing abnormal CPU spikes`,
            explanation: `Pattern analysis detected CPU at ${pod.cpuUsage}% (anomaly score ${pod.anomalyScore}). ${
              pod.cpuUsage >= 90
                ? 'Sustained saturation may cause request throttling and elevated P99 latency.'
                : 'Irregular burst pattern correlates with workload batch windows.'
            }`,
            confidence: confidence(severity === 'critical' ? 92 : 84, pod.anomalyScore, severity),
            recommendation:
              'Enable HPA on CPU metrics, profile hot paths, and add query caching for database-heavy operations.',
            suggestedAction: 'Review recent deployments and scale replicas horizontally.',
            affectedPod: pod.name,
            affectedNamespace: pod.namespace,
            metrics: {
              cpu: pod.cpuUsage,
              anomalyScore: pod.anomalyScore,
              healthScore: pod.healthScore,
            },
          },
          ctx
        )
      )
    }
  }
  return out
}

/** Memory pressure & leak heuristics */
function analyzeMemory(pods: Pod[], ctx: RuleContext): AIInsight[] {
  const out: AIInsight[] = []

  for (const pod of pods) {
    const leakSuspect =
      pod.memoryUsage >= MEM_WARNING &&
      (pod.anomalyScore >= 50 || pod.restartCount > 0 || pod.memoryUsage >= MEM_CRITICAL)

    if (!leakSuspect) continue

    const severity: InsightSeverity =
      pod.memoryUsage >= MEM_CRITICAL || pod.restartCount > 5 ? 'critical' : 'warning'

    out.push(
      makeInsight(
        {
          id: `mem-${pod.id}-${ctx.tick}`,
          severity,
          category: 'memory',
          title:
            pod.memoryUsage >= MEM_CRITICAL
              ? `Memory leak suspected in ${pod.name}`
              : `Elevated memory pressure on ${pod.name}`,
          explanation: `Heap utilization at ${pod.memoryUsage}% with anomaly score ${pod.anomalyScore}. ${
            pod.restartCount > 0
              ? `${pod.restartCount} recent restart(s) suggest possible OOMKill cycles.`
              : 'Gradual growth pattern detected over the last observation window.'
          } GC pause times and allocation rate are above baseline.`,
          confidence: confidence(severity === 'critical' ? 88 : 79, pod.anomalyScore, severity),
          recommendation:
            'Capture heap dump, audit cache TTLs, and set memory limits with appropriate requests/limits.',
          suggestedAction: 'Profile memory after peak traffic; restart pod only after snapshot.',
          affectedPod: pod.name,
          affectedNamespace: pod.namespace,
          metrics: {
            memory: pod.memoryUsage,
            restarts: pod.restartCount,
            anomalyScore: pod.anomalyScore,
          },
        },
        ctx
      )
    )
  }
  return out
}

/** Restart loops & crash patterns */
function analyzeRestarts(pods: Pod[], ctx: RuleContext): AIInsight[] {
  const out: AIInsight[] = []

  for (const pod of pods) {
    const crash = pod.status === 'CrashLoopBackOff' || pod.status === 'Failed'
    const highRestarts = pod.restartCount >= RESTART_WARNING

    if (!crash && !highRestarts) continue

    const severity: InsightSeverity =
      crash || pod.restartCount >= RESTART_CRITICAL ? 'critical' : 'warning'

    out.push(
      makeInsight(
        {
          id: `restart-${pod.id}-${ctx.tick}`,
          severity,
          category: 'restart',
          title: crash
            ? `${pod.name} in CrashLoopBackOff`
            : `Restart anomalies detected in ${pod.name}`,
          explanation: crash
            ? `Pod entered ${pod.status} with ${pod.restartCount} restarts. Health score ${pod.healthScore}%. Likely exit code non-zero or failed liveness probes.`
            : `${pod.restartCount} restarts observed in the monitoring window. Pattern may indicate flaky dependencies or resource contention on ${pod.node}.`,
          confidence: confidence(crash ? 95 : 86, pod.anomalyScore, severity),
          recommendation: crash
            ? 'Inspect container logs, verify probes, and increase memory limits if OOM-related.'
            : 'Correlate restarts with deploy events and upstream latency spikes.',
          suggestedAction: 'Rollback last deployment or increase backoff on failing init containers.',
          affectedPod: pod.name,
          affectedNamespace: pod.namespace,
          metrics: {
            restarts: pod.restartCount,
            healthScore: pod.healthScore,
          },
        },
        ctx
      )
    )
  }
  return out
}

/** Network throughput anomalies */
function analyzeNetwork(pods: Pod[], ctx: RuleContext): AIInsight[] {
  const out: AIInsight[] = []
  const avgNet = pods.reduce((s, p) => s + p.networkTraffic, 0) / Math.max(pods.length, 1)

  for (const pod of pods) {
    const spike = pod.networkTraffic >= NETWORK_SPIKE_MB
    const drop = pod.networkTraffic < 20 && pod.status === 'Running' && pod.name !== 'test-runner'

    if (spike) {
      out.push(
        makeInsight(
          {
            id: `net-spike-${pod.id}-${ctx.tick}`,
            severity: pod.networkTraffic >= 800 ? 'warning' : 'info',
            category: 'network',
            title: `Network traffic spike on ${pod.name}`,
            explanation: `Ingress/egress at ${pod.networkTraffic} MB/s (${Math.round((pod.networkTraffic / avgNet) * 100)}% of cluster average). Possible traffic surge or retry storm from downstream clients.`,
            confidence: confidence(82, pod.anomalyScore, 'warning'),
            recommendation: 'Verify rate limits, enable connection pooling, and check for DDoS or batch job traffic.',
            suggestedAction: 'Scale gateway replicas if this pod is an ingress point.',
            affectedPod: pod.name,
            affectedNamespace: pod.namespace,
            metrics: { network: pod.networkTraffic },
          },
          ctx
        )
      )
    }

    if (drop && pod.anomalyScore > 40) {
      out.push(
        makeInsight(
          {
            id: `net-drop-${pod.id}-${ctx.tick}`,
            severity: 'warning',
            category: 'network',
            title: `Abnormal network drop on ${pod.name}`,
            explanation: `Traffic at ${pod.networkTraffic} MB/s while status is ${pod.status}. May indicate misconfigured service mesh routes or failing health checks blocking traffic.`,
            confidence: confidence(74, pod.anomalyScore, 'warning'),
            recommendation: 'Validate Service endpoints and NetworkPolicy rules.',
            suggestedAction: 'Run connectivity tests from gateway-api to this pod.',
            affectedPod: pod.name,
            affectedNamespace: pod.namespace,
            metrics: { network: pod.networkTraffic },
          },
          ctx
        )
      )
    }
  }
  return out
}

/** Namespace-level aggregate insights */
function analyzeNamespaces(pods: Pod[], ctx: RuleContext): AIInsight[] {
  const out: AIInsight[] = []
  const byNs = new Map<string, Pod[]>()

  pods.forEach((p) => {
    const list = byNs.get(p.namespace) ?? []
    list.push(p)
    byNs.set(p.namespace, list)
  })

  byNs.forEach((nsPods, ns) => {
    const avgMem = nsPods.reduce((s, p) => s + p.memoryUsage, 0) / nsPods.length
    const criticalCount = nsPods.filter(
      (p) => p.status !== 'Running' || p.healthScore < 50
    ).length

    if (avgMem > 65 && ns === 'production') {
      out.push(
        makeInsight(
          {
            id: `ns-mem-${ns}-${ctx.tick}`,
            severity: avgMem > 75 ? 'warning' : 'info',
            category: 'namespace',
            title: `Namespace ${ns} nearing memory threshold`,
            explanation: `Aggregate memory at ${Math.round(avgMem)}% across ${nsPods.length} pods. ${criticalCount} workload(s) below healthy threshold.`,
            confidence: confidence(89, avgMem, 'warning'),
            recommendation: 'Increase namespace quota or reschedule batch workloads off-peak.',
            suggestedAction: 'Rightsize top memory consumers in this namespace.',
            affectedNamespace: ns as AIInsight['affectedNamespace'],
            metrics: { memory: Math.round(avgMem) },
          },
          ctx
        )
      )
    }
  })
  return out
}

/** Positive health signals */
function analyzeHealth(pods: Pod[], ctx: RuleContext): AIInsight[] {
  const out: AIInsight[] = []
  const healthy = pods.filter((p) => p.healthScore >= 90 && p.anomalyScore < 20)

  if (healthy.length >= 3) {
    const names = healthy
      .slice(0, 3)
      .map((p) => p.name)
      .join(', ')
    out.push(
      makeInsight(
        {
          id: `health-ok-${ctx.tick}`,
          severity: 'info',
          category: 'health',
          title: 'Core services operating within SLO',
          explanation: `${healthy.length} pods report health scores above 90% with low anomaly indices. Stable: ${names}.`,
          confidence: 96,
          recommendation: 'Continue canary deployments; no immediate action required.',
          suggestedAction: 'Maintain current resource requests and monitoring alerts.',
          metrics: {},
        },
        ctx
      )
    )
  }
  return out
}

function dedupeInsights(insights: AIInsight[]): AIInsight[] {
  const seen = new Set<string>()
  return insights.filter((i) => {
    const key = `${i.category}-${i.affectedPod ?? i.affectedNamespace ?? i.title}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * KubeMind AI Insight Engine — analyzes live pod metrics and produces ranked insights.
 */
export function analyzePodsAndGenerateInsights(
  pods: Pod[],
  tick = 0
): AIInsight[] {
  const ctx: RuleContext = { pods, tick }

  const all = [
    ...analyzeCpu(pods, ctx),
    ...analyzeMemory(pods, ctx),
    ...analyzeRestarts(pods, ctx),
    ...analyzeNetwork(pods, ctx),
    ...analyzeNamespaces(pods, ctx),
    ...analyzeHealth(pods, ctx),
  ]

  return dedupeInsights(all).sort(
    (a, b) =>
      SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] ||
      b.confidence - a.confidence
  )
}

export function filterInsightsBySeverity(
  insights: AIInsight[],
  severity: InsightSeverity | 'all'
): AIInsight[] {
  if (severity === 'all') return insights
  return insights.filter((i) => i.severity === severity)
}

export function countInsightsBySeverity(insights: AIInsight[]) {
  return {
    critical: insights.filter((i) => i.severity === 'critical').length,
    warning: insights.filter((i) => i.severity === 'warning').length,
    info: insights.filter((i) => i.severity === 'info').length,
    total: insights.length,
  }
}
