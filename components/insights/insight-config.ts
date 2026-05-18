import {
  AlertTriangle,
  AlertCircle,
  Info,
  Cpu,
  MemoryStick,
  RotateCcw,
  Network,
  Layers,
  HeartPulse,
} from 'lucide-react'
import type { InsightCategory, InsightSeverity } from '@/lib/insight-types'

export const severityStyles: Record<
  InsightSeverity,
  {
    border: string
    bg: string
    badge: string
    text: string
    glow: string
    icon: typeof AlertTriangle
  }
> = {
  critical: {
    border: 'border-destructive/40',
    bg: 'bg-gradient-to-br from-destructive/15 via-destructive/5 to-transparent',
    badge: 'bg-destructive/20 text-destructive border-destructive/40',
    text: 'text-destructive',
    glow: '0 0 40px oklch(0.6 0.22 25 / 0.2)',
    icon: AlertTriangle,
  },
  warning: {
    border: 'border-warning/40',
    bg: 'bg-gradient-to-br from-warning/15 via-warning/5 to-transparent',
    badge: 'bg-warning/20 text-warning border-warning/40',
    text: 'text-warning',
    glow: '0 0 40px oklch(0.75 0.18 80 / 0.15)',
    icon: AlertCircle,
  },
  info: {
    border: 'border-primary/30',
    bg: 'bg-gradient-to-br from-primary/10 via-accent/5 to-transparent',
    badge: 'bg-primary/15 text-primary border-primary/30',
    text: 'text-primary',
    glow: '0 0 40px oklch(0.7 0.18 250 / 0.12)',
    icon: Info,
  },
}

export const categoryMeta: Record<
  InsightCategory,
  { label: string; icon: typeof Cpu }
> = {
  cpu: { label: 'CPU', icon: Cpu },
  memory: { label: 'Memory', icon: MemoryStick },
  restart: { label: 'Restarts', icon: RotateCcw },
  network: { label: 'Network', icon: Network },
  namespace: { label: 'Namespace', icon: Layers },
  health: { label: 'Health', icon: HeartPulse },
}
