'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCluster } from '@/context/cluster-context'
import { useSidebar } from '@/context/sidebar-context'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Server,
  Box,
  Brain,
  GitBranch,
  AlertTriangle,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
  Cpu,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
}

const baseNavItems: Omit<NavItem, 'badge'>[] = [
  { label: 'Dashboard', href: '/', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Cluster Overview', href: '/cluster', icon: <Server className="h-5 w-5" /> },
  { label: 'Pod Monitoring', href: '/pods', icon: <Box className="h-5 w-5" /> },
  { label: 'AI Insights', href: '/insights', icon: <Brain className="h-5 w-5" /> },
  { label: 'Dependency Mapping', href: '/dependencies', icon: <GitBranch className="h-5 w-5" /> },
  { label: 'Alerts & Anomalies', href: '/alerts', icon: <AlertTriangle className="h-5 w-5" /> },
  { label: 'Forecasting', href: '/forecasting', icon: <TrendingUp className="h-5 w-5" /> },
  { label: 'Settings', href: '/settings', icon: <Settings className="h-5 w-5" /> },
]

export function Sidebar() {
  const { collapsed, toggle } = useSidebar()
  const { insights, alerts } = useCluster()
  const pathname = usePathname()

  const navItems: NavItem[] = baseNavItems.map((item) => {
    if (item.href === '/insights') return { ...item, badge: insights.length }
    if (item.href === '/alerts')
      return { ...item, badge: alerts.filter((a) => a.severity === 'critical').length }
    return item
  })

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar"
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 glow-primary">
                <Cpu className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-foreground">KubeMind</h1>
                <p className="text-xs text-muted-foreground">AI Observability</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {collapsed && (
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 glow-primary">
            <Cpu className="h-5 w-5 text-primary" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 to-accent/10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                <span className={cn('relative z-10', isActive && 'text-primary')}>
                  {item.icon}
                </span>
                
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative z-10 truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                
                {item.badge && !collapsed && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="relative z-10 ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-semibold text-destructive-foreground"
                  >
                    {item.badge}
                  </motion.span>
                )}
                
                {item.badge && collapsed && (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-sidebar-border p-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={toggle}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-sidebar-accent/50 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.aside>
  )
}
