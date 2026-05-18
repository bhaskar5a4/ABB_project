'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  GitBranch,
  ZoomIn,
  ZoomOut,
  Maximize2,
  AlertTriangle,
  Activity,
} from 'lucide-react'
import { mockDependencies, mockPods } from '@/lib/mock-data'

interface Node {
  id: string
  name: string
  x: number
  y: number
  status: 'healthy' | 'warning' | 'critical'
  connections: number
}

interface Connection {
  source: string
  target: string
  traffic: number
  latency: number
  status: 'healthy' | 'warning' | 'critical'
}

export function DependencyGraph() {
  const { nodes, connections } = useMemo(() => {
    // Extract unique services from dependencies
    const serviceSet = new Set<string>()
    mockDependencies.forEach(dep => {
      serviceSet.add(dep.source)
      serviceSet.add(dep.target)
    })

    // Create nodes with positions in a circular layout
    const services = Array.from(serviceSet)
    const centerX = 200
    const centerY = 150
    const radius = 120

    const nodes: Node[] = services.map((service, i) => {
      const angle = (i / services.length) * 2 * Math.PI - Math.PI / 2
      const pod = mockPods.find(p => p.name === service)
      
      let status: 'healthy' | 'warning' | 'critical' = 'healthy'
      if (pod) {
        if (pod.status === 'CrashLoopBackOff' || pod.status === 'Failed' || pod.restartCount > 10) {
          status = 'critical'
        } else if (pod.cpuUsage > 80 || pod.memoryUsage > 80 || pod.restartCount > 0) {
          status = 'warning'
        }
      }

      return {
        id: service,
        name: service,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        status,
        connections: mockDependencies.filter(d => d.source === service || d.target === service).length,
      }
    })

    // Create connections
    const connections: Connection[] = mockDependencies.map(dep => {
      let status: 'healthy' | 'warning' | 'critical' = 'healthy'
      if (dep.latency > 100) status = 'critical'
      else if (dep.latency > 50) status = 'warning'

      return {
        source: dep.source,
        target: dep.target,
        traffic: dep.traffic,
        latency: dep.latency,
        status,
      }
    })

    return { nodes, connections }
  }, [])

  const getNodeById = (id: string) => nodes.find(n => n.id === id)

  const statusColors = {
    healthy: {
      fill: 'fill-success/20',
      stroke: 'stroke-success',
      text: 'text-success',
      glow: '0 0 15px oklch(0.7 0.2 150 / 0.4)',
    },
    warning: {
      fill: 'fill-warning/20',
      stroke: 'stroke-warning',
      text: 'text-warning',
      glow: '0 0 15px oklch(0.75 0.18 80 / 0.4)',
    },
    critical: {
      fill: 'fill-destructive/20',
      stroke: 'stroke-destructive',
      text: 'text-destructive',
      glow: '0 0 15px oklch(0.6 0.22 25 / 0.4)',
    },
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card overflow-hidden rounded-xl border border-border/50"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <GitBranch className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">Dependency Mapping</h2>
            <p className="text-sm text-muted-foreground">
              Service communication graph
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Graph Visualization */}
      <div className="relative h-80 w-full overflow-hidden bg-gradient-to-br from-muted/20 to-transparent p-4">
        <svg
          viewBox="0 0 400 300"
          className="h-full w-full"
          style={{ filter: 'drop-shadow(0 0 2px oklch(0.7 0.18 250 / 0.3))' }}
        >
          {/* Grid pattern */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="oklch(0.25 0.02 260 / 0.3)"
                strokeWidth="0.5"
              />
            </pattern>
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="oklch(0.7 0.18 250 / 0.6)" />
              <stop offset="100%" stopColor="oklch(0.65 0.22 170 / 0.6)" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Connections */}
          {connections.map((conn, i) => {
            const source = getNodeById(conn.source)
            const target = getNodeById(conn.target)
            if (!source || !target) return null

            const strokeColor = conn.status === 'critical' 
              ? 'oklch(0.6 0.22 25 / 0.6)' 
              : conn.status === 'warning'
              ? 'oklch(0.75 0.18 80 / 0.6)'
              : 'url(#connectionGradient)'

            return (
              <motion.g key={i}>
                <motion.line
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={strokeColor}
                  strokeWidth={Math.max(1, conn.traffic / 500)}
                  strokeLinecap="round"
                />
                {/* Animated traffic indicator */}
                <motion.circle
                  r={3}
                  fill="oklch(0.7 0.18 250)"
                  animate={{
                    cx: [source.x, target.x],
                    cy: [source.y, target.y],
                  }}
                  transition={{
                    duration: 2 + Math.random(),
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </motion.g>
            )
          })}

          {/* Nodes */}
          {nodes.map((node, i) => {
            const colors = statusColors[node.status]
            
            return (
              <motion.g
                key={node.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                style={{ cursor: 'pointer' }}
              >
                {/* Glow effect for critical/warning nodes */}
                {node.status !== 'healthy' && (
                  <motion.circle
                    cx={node.x}
                    cy={node.y}
                    r={24}
                    className={cn('fill-none', colors.stroke)}
                    strokeWidth={2}
                    animate={{ 
                      opacity: [0.5, 1, 0.5],
                      r: [24, 28, 24]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  />
                )}
                
                {/* Node circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={20}
                  className={cn(colors.fill, colors.stroke)}
                  strokeWidth={2}
                  style={{ filter: node.status !== 'healthy' ? colors.glow : undefined }}
                />
                
                {/* Node label */}
                <text
                  x={node.x}
                  y={node.y + 35}
                  textAnchor="middle"
                  className="fill-foreground text-[8px] font-medium"
                >
                  {node.name.split('-')[0]}
                </text>

                {/* Status indicator icon */}
                {node.status === 'critical' && (
                  <g transform={`translate(${node.x - 4}, ${node.y - 4})`}>
                    <AlertTriangle className="h-2 w-2 text-destructive" />
                  </g>
                )}
              </motion.g>
            )
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex items-center gap-4 rounded-lg border border-border/50 bg-card/80 px-3 py-2 backdrop-blur-sm">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">Healthy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-warning" />
            <span className="text-xs text-muted-foreground">Warning</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-destructive" />
            <span className="text-xs text-muted-foreground">Critical</span>
          </div>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="grid grid-cols-3 divide-x divide-border/30 border-t border-border/50">
        <div className="p-3 text-center">
          <p className="text-lg font-semibold">{nodes.length}</p>
          <p className="text-xs text-muted-foreground">Services</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-lg font-semibold">{connections.length}</p>
          <p className="text-xs text-muted-foreground">Connections</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-lg font-semibold text-destructive">
            {nodes.filter(n => n.status === 'critical').length}
          </p>
          <p className="text-xs text-muted-foreground">Issues</p>
        </div>
      </div>
    </motion.section>
  )
}
