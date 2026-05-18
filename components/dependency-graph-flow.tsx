'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  type Node,
  type Edge,
  Position,
  Handle,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GitBranch, AlertTriangle } from 'lucide-react'
import { mockDependencies } from '@/lib/k8s-data'
import { useCluster } from '@/context/cluster-context'

type Health = 'healthy' | 'warning' | 'critical'

function ServiceNode({
  data,
}: {
  data: { label: string; status: Health; namespace: string; anomaly: number }
}) {
  const colors = {
    healthy: 'border-success/50 bg-success/10 text-success',
    warning: 'border-warning/50 bg-warning/10 text-warning',
    critical: 'border-destructive/50 bg-destructive/10 text-destructive animate-pulse',
  }
  return (
    <motion.div
      layout
      className={cn(
        'min-w-[140px] rounded-xl border-2 px-3 py-2 shadow-lg backdrop-blur-md',
        colors[data.status]
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-primary" />
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold">{data.label}</span>
        {data.status === 'critical' && <AlertTriangle className="h-3 w-3" />}
      </div>
      <p className="mt-0.5 text-[10px] opacity-70">{data.namespace}</p>
      <p className="text-[10px] opacity-60">anomaly {data.anomaly}%</p>
      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
    </motion.div>
  )
}

const nodeTypes = { service: ServiceNode }

function getHealth(pod?: { status: string; cpuUsage: number; memoryUsage: number; restartCount: number; anomalyScore: number }): Health {
  if (!pod) return 'healthy'
  if (pod.status === 'CrashLoopBackOff' || pod.status === 'Failed' || pod.restartCount > 10) return 'critical'
  if (pod.cpuUsage > 80 || pod.memoryUsage > 80 || pod.anomalyScore > 60 || pod.restartCount > 0) return 'warning'
  return 'healthy'
}

interface DependencyGraphFlowProps {
  compact?: boolean
  className?: string
}

export function DependencyGraphFlow({ compact = false, className }: DependencyGraphFlowProps) {
  const { pods } = useCluster()
  const [selected, setSelected] = useState<string | null>(null)

  const layout = useMemo(() => {
    const services = new Set<string>()
    mockDependencies.forEach((d) => {
      services.add(d.source)
      services.add(d.target)
    })
    const list = Array.from(services)
    const cols = compact ? 3 : 4
    const positions: Record<string, { x: number; y: number }> = {}
    list.forEach((name, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      positions[name] = { x: col * 220, y: row * 130 }
    })
    return positions
  }, [compact])

  const nodes: Node[] = useMemo(
    () =>
      Object.entries(layout).map(([name, pos]) => {
        const pod = pods.find((p) => p.name === name)
        return {
          id: name,
          type: 'service',
          position: pos,
          data: {
            label: name,
            status: getHealth(pod),
            namespace: pod?.namespace ?? 'production',
            anomaly: pod?.anomalyScore ?? 0,
          },
        }
      }),
    [layout, pods]
  )

  const edges: Edge[] = useMemo(
    () =>
      mockDependencies.map((dep, i) => {
        const targetPod = pods.find((p) => p.name === dep.target)
        const critical = dep.latency > 100 || getHealth(targetPod) === 'critical'
        const warning = dep.latency > 50 || getHealth(targetPod) === 'warning'
        return {
          id: `e-${i}`,
          source: dep.source,
          target: dep.target,
          animated: true,
          label: `${dep.latency}ms`,
          style: {
            stroke: critical ? 'oklch(0.6 0.22 25)' : warning ? 'oklch(0.75 0.18 80)' : 'oklch(0.7 0.18 250)',
            strokeWidth: Math.max(1.5, dep.traffic / 600),
          },
          markerEnd: { type: MarkerType.ArrowClosed },
        }
      }),
    [pods]
  )

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelected(node.id)
  }, [])

  const criticalCount = nodes.filter((n) => n.data.status === 'critical').length

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('glass-card overflow-hidden rounded-xl border border-border/50', className)}
    >
      <div className="flex items-center justify-between border-b border-border/50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <GitBranch className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">Dependency Mapping</h2>
            <p className="text-sm text-muted-foreground">Interactive service graph</p>
          </div>
        </div>
        <Badge variant="outline" className="border-destructive/30 text-destructive">
          {criticalCount} issues
        </Badge>
      </div>

      <div className={cn('w-full bg-gradient-to-br from-muted/20 to-transparent', compact ? 'h-80' : 'h-[520px]')}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          proOptions={{ hideAttribution: true }}
          className="!bg-transparent"
        >
          <Background gap={16} color="oklch(0.35 0.02 260 / 0.4)" />
          <Controls className="!border-border/50 !bg-card/90 !shadow-lg" />
          {!compact && <MiniMap className="!bg-card/80" />}
        </ReactFlow>
      </div>

      {selected && (
        <div className="border-t border-border/50 p-3 text-sm">
          <span className="text-muted-foreground">Selected: </span>
          <span className="font-medium">{selected}</span>
          <Button variant="link" size="sm" className="ml-2 h-auto p-0" onClick={() => setSelected(null)}>
            Clear
          </Button>
        </div>
      )}
    </motion.section>
  )
}
