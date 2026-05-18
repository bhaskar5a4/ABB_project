import type { Alert, Pod } from './k8s-data'

export function getChatResponse(
  query: string,
  pods: Pod[],
  alerts: Alert[]
): string {
  const q = query.toLowerCase()

  if (q.includes('fail') || q.includes('crash') || q.includes('unhealthy')) {
    const failing = pods.filter(
      (p) =>
        p.status !== 'Running' ||
        p.healthScore < 50 ||
        p.restartCount > 5
    )
    if (failing.length === 0) {
      return 'All core services are within healthy thresholds. No failing pods detected.'
    }
    const list = failing
      .map(
        (p) =>
          `• **${p.name}** (${p.namespace}) — ${p.status}, health ${p.healthScore}%, ${p.restartCount} restarts`
      )
      .join('\n')
    return `**Pods requiring attention:**\n\n${list}\n\nHighest priority: **${failing[0].name}** due to ${failing[0].status === 'CrashLoopBackOff' ? 'crash loop' : 'degraded health'}.`
  }

  if (q.includes('cpu') || q.includes('high usage')) {
    const top = [...pods].sort((a, b) => b.cpuUsage - a.cpuUsage).slice(0, 3)
    return `**Top CPU consumers:**\n\n${top
      .map((p) => `• **${p.name}**: ${p.cpuUsage}% (anomaly score ${p.anomalyScore})`)
      .join(
        '\n'
      )}\n\n**payment-service** shows the strongest spike pattern. Recommend query optimization and horizontal scaling.`
  }

  if (q.includes('abnormal') || q.includes('anomal')) {
    const abnormal = pods.filter((p) => p.anomalyScore > 50)
    const nsSet = [...new Set(abnormal.map((p) => p.namespace))]
    return `**Abnormal services detected:** ${abnormal.length}\n\n${abnormal
      .map((p) => `• ${p.name} — anomaly ${p.anomalyScore}%`)
      .join('\n')}\n\n**Namespaces affected:** ${nsSet.join(', ')}`
  }

  if (q.includes('predict') || q.includes('forecast') || q.includes('future')) {
    const risky = pods
      .filter((p) => p.anomalyScore > 60 || p.memoryUsage > 80)
      .sort((a, b) => b.anomalyScore - a.anomalyScore)
    return `**Failure predictions (next 6h):**\n\n${risky
      .slice(0, 3)
      .map(
        (p, i) =>
          `${i + 1}. **${p.name}** — ${Math.min(95, p.anomalyScore + 10)}% risk (${p.memoryUsage > 80 ? 'memory pressure' : 'CPU/instability'})`
      )
      .join('\n')}\n\nEnable auto-scaling on payment-service and analytics-engine.`
  }

  if (q.includes('memory') || q.includes('leak')) {
    const mem = [...pods].sort((a, b) => b.memoryUsage - a.memoryUsage)[0]
    return `**${mem.name}** has the highest memory at **${mem.memoryUsage}%**. Anomaly score ${mem.anomalyScore}. Suspected leak if growth continues — capture heap profile before restart.`
  }

  if (q.includes('alert')) {
    const critical = alerts.filter((a) => a.severity === 'critical')
    return `**${critical.length} critical alerts** active.\n\n${critical
      .slice(0, 4)
      .map((a) => `• ${a.title}: ${a.description}`)
      .join('\n')}`
  }

  if (q.includes('restart') || q.includes('auth')) {
    const auth = pods.find((p) => p.name === 'auth-service')
    if (auth) {
      return `**auth-service** status: ${auth.status}, **${auth.restartCount} restarts**, health ${auth.healthScore}%. Service is stable. For restart spikes, check **notification-service** (${pods.find((p) => p.name === 'notification-service')?.restartCount ?? 0} restarts).`
    }
  }

  return `I analyzed your cluster (${pods.length} pods, ${alerts.length} alerts). Ask about failing pods, CPU spikes, anomalies, predictions, or memory issues.`
}
