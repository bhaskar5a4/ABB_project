import type { Namespace } from './k8s-data'

export type InsightSeverity = 'critical' | 'warning' | 'info'

export type InsightCategory =
  | 'cpu'
  | 'memory'
  | 'restart'
  | 'network'
  | 'health'
  | 'namespace'

export interface AIInsight {
  id: string
  severity: InsightSeverity
  category: InsightCategory
  title: string
  /** Primary narrative — what the AI detected */
  explanation: string
  /** @deprecated Use explanation — kept for backward compatibility */
  description: string
  confidence: number
  recommendation: string
  suggestedAction: string
  affectedPod?: string
  affectedNamespace?: Namespace
  timestamp: string
  /** Snapshot metrics that triggered this insight */
  metrics?: {
    cpu?: number
    memory?: number
    restarts?: number
    network?: number
    anomalyScore?: number
    healthScore?: number
  }
}

export const SEVERITY_ORDER: Record<InsightSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
}
