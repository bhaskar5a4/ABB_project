'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Bell,
  Sparkles,
  ChevronDown,
  Settings,
  LogOut,
  User,
  Moon,
  Sun,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useCluster } from '@/context/cluster-context'
import { useSidebar } from '@/context/sidebar-context'

interface NavbarProps {
  onAIAssistantToggle: () => void
  sidebarCollapsed?: boolean
}

export function Navbar({ onAIAssistantToggle, sidebarCollapsed }: NavbarProps) {
  const { collapsed } = useSidebar()
  const isCollapsed = sidebarCollapsed ?? collapsed
  const { alerts } = useCluster()
  const [searchFocused, setSearchFocused] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const criticalAlerts = alerts.filter((a) => a.severity === 'critical')

  return (
    <motion.header
      initial={false}
      animate={{ 
        marginLeft: isCollapsed ? 72 : 260,
        width: isCollapsed ? 'calc(100% - 72px)' : 'calc(100% - 260px)'
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed right-0 top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-xl"
    >
      <div className="flex h-full items-center justify-between px-6">
        {/* Global Search */}
        <div className="relative max-w-md flex-1">
          <motion.div
            animate={{ 
              scale: searchFocused ? 1.02 : 1,
              boxShadow: searchFocused 
                ? '0 0 0 2px var(--ring), 0 0 20px var(--glow-primary)' 
                : '0 0 0 0px transparent'
            }}
            className="relative rounded-lg"
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search pods, services, namespaces..."
              className="h-10 border-border/50 bg-muted/50 pl-10 pr-4 transition-all focus:bg-muted"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground sm:inline">
              ⌘K
            </kbd>
          </motion.div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* AI Assistant Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onAIAssistantToggle}
              className="group relative overflow-hidden bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg hover:shadow-xl"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 transition-opacity group-hover:opacity-100"
              />
              <Sparkles className="relative mr-2 h-4 w-4" />
              <span className="relative hidden sm:inline">AI Assistant</span>
            </Button>
          </motion.div>

          {/* Notifications */}
          <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {criticalAlerts.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground"
                  >
                    {criticalAlerts.length}
                  </motion.span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 glass-card p-0">
              <div className="border-b border-border p-3">
                <h3 className="font-semibold">Notifications</h3>
                <p className="text-xs text-muted-foreground">{alerts.length} new alerts</p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                <AnimatePresence>
                  {alerts.slice(0, 5).map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-border/50 p-3 transition-colors last:border-0 hover:bg-muted/50"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 h-2 w-2 rounded-full ${
                          alert.severity === 'critical' ? 'bg-destructive animate-pulse-glow' :
                          alert.severity === 'warning' ? 'bg-warning' : 'bg-accent'
                        }`} />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{alert.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{alert.description}</p>
                          <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <div className="border-t border-border p-2">
                <Button variant="ghost" className="w-full text-sm">
                  View all notifications
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon">
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarImage src="/avatar.png" alt="User" />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    JD
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-muted-foreground">Admin</p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass-card">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-muted-foreground">john@kubemind.ai</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  )
}
