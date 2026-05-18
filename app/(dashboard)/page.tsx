'use client'

import { motion } from 'framer-motion'
import { MetricsGrid } from '@/components/metrics-grid'
import { ChartsSection } from '@/components/charts-section'
import { AIInsightsSection } from '@/components/ai-insights'
import { ActiveAlerts, PodStatusList } from '@/components/alerts-section'
import { DependencyGraphFlow } from '@/components/dependency-graph-flow'
import { ForecastingSection } from '@/components/forecasting-section'
import { LiveClock } from '@/components/live-clock'

export default function DashboardPage() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Real-time Kubernetes cluster monitoring and AI-powered insights
            </p>
          </motion.div>
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              <span className="text-sm font-medium text-success">Live</span>
            </motion.div>
            <LiveClock className="text-sm text-muted-foreground" />
          </div>
        </motion.div>
      </motion.div>

      <section className="mb-8">
        <MetricsGrid />
      </section>

      <section className="mb-8">
        <ChartsSection />
      </section>

      <section className="mb-8">
        <AIInsightsSection />
      </section>

      <section className="mb-8 grid gap-6 lg:grid-cols-2">
        <ActiveAlerts />
        <DependencyGraphFlow compact />
      </section>

      <section className="mb-8">
        <PodStatusList />
      </section>

      <section className="mb-8">
        <ForecastingSection />
      </section>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 border-t border-border/50 py-6 text-center"
      >
        <p className="text-sm text-muted-foreground">
          KubeMind AI — Enterprise Kubernetes Observability Platform
        </p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          Powered by Machine Learning | Built for ABB Industrial AI Hackathon
        </p>
      </motion.footer>
    </>
  )
}
