'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/sidebar'
import { Navbar } from '@/components/navbar'
import { AIAssistant } from '@/components/ai-assistant'
import { ClusterProvider } from '@/context/cluster-context'
import { SidebarProvider, useSidebar } from '@/context/sidebar-context'

function MainContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()
  const [aiOpen, setAiOpen] = useState(false)
  const margin = collapsed ? 72 : 260

  return (
    <>
      <Navbar onAIAssistantToggle={() => setAiOpen(true)} sidebarCollapsed={collapsed} />
      <motion.main
        initial={false}
        animate={{
          marginLeft: margin,
          width: `calc(100% - ${margin}px)`,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="min-h-screen pt-16"
      >
        <div className="p-6">{children}</div>
      </motion.main>
      <AIAssistant isOpen={aiOpen} onClose={() => setAiOpen(false)} />
    </>
  )
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ClusterProvider>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen bg-background"
        >
          <Sidebar />
          <MainContent>{children}</MainContent>
        </motion.div>
      </ClusterProvider>
    </SidebarProvider>
  )
}
