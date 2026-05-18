'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import {
  Settings,
  Palette,
  Bell,
  Brain,
  Server,
  Shield,
  User,
  Moon,
  Sun,
  Monitor,
  Check,
  ChevronRight,
  Slack,
  Mail,
  Webhook,
  Database,
  Cloud,
  Key,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

type SettingsSection = 'appearance' | 'notifications' | 'ai' | 'integrations' | 'security' | 'account'

const sections = [
  { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Theme and display settings' },
  { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alert and notification preferences' },
  { id: 'ai', label: 'AI Assistant', icon: Brain, description: 'Configure AI behavior and insights' },
  { id: 'integrations', label: 'Integrations', icon: Server, description: 'Cluster and service connections' },
  { id: 'security', label: 'Security', icon: Shield, description: 'Authentication and access control' },
  { id: 'account', label: 'Account', icon: User, description: 'Profile and preferences' },
] as const

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('appearance')
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState({
    criticalAlerts: true,
    warnings: true,
    info: false,
    email: true,
    slack: true,
    webhook: false,
  })
  const [aiSettings, setAiSettings] = useState({
    autoAnalysis: true,
    predictions: true,
    recommendations: true,
    anomalyDetection: true,
    confidenceThreshold: 75,
  })
  const [integrations, setIntegrations] = useState({
    prometheus: { connected: true, lastSync: '2 min ago' },
    kubernetes: { connected: true, lastSync: '30 sec ago' },
    grafana: { connected: true, lastSync: '5 min ago' },
    datadog: { connected: false, lastSync: null },
  })

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onChange}
      className={cn(
        'relative h-6 w-11 rounded-full transition-colors',
        enabled ? 'bg-primary' : 'bg-muted'
      )}
    >
      <motion.div
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md"
        animate={{ left: enabled ? 'calc(100% - 22px)' : '2px' }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </motion.button>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Theme</h3>
              <p className="mb-4 text-sm text-muted-foreground">Choose your preferred color scheme</p>
              
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { id: 'dark', label: 'Dark', icon: Moon },
                  { id: 'light', label: 'Light', icon: Sun },
                  { id: 'system', label: 'System', icon: Monitor },
                ].map((option) => (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setTheme(option.id)}
                    className={cn(
                      'flex flex-col items-center gap-3 rounded-xl border p-6 transition-all',
                      theme === option.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border/50 hover:border-border'
                    )}
                  >
                    <option.icon className={cn(
                      'h-8 w-8',
                      theme === option.id ? 'text-primary' : 'text-muted-foreground'
                    )} />
                    <span className="font-medium">{option.label}</span>
                    {theme === option.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-primary"
                      >
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="mb-4 text-lg font-semibold">Dashboard Layout</h3>
              <div className="space-y-4">
                {[
                  { label: 'Compact Sidebar', description: 'Show icons only by default' },
                  { label: 'Show Animations', description: 'Enable smooth transitions and effects' },
                  { label: 'High Contrast', description: 'Increase color contrast for accessibility' },
                ].map((setting, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                    <div>
                      <p className="font-medium">{setting.label}</p>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                    <ToggleSwitch enabled={i === 1} onChange={() => {}} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Alert Preferences</h3>
              <p className="mb-4 text-sm text-muted-foreground">Configure which alerts you want to receive</p>
              
              <div className="space-y-3">
                {[
                  { key: 'criticalAlerts', label: 'Critical Alerts', description: 'High priority incidents requiring immediate attention', color: 'destructive' },
                  { key: 'warnings', label: 'Warnings', description: 'Potential issues that may need attention', color: 'warning' },
                  { key: 'info', label: 'Informational', description: 'General updates and status changes', color: 'primary' },
                ].map((alert) => (
                  <div key={alert.key} className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                    <div className="flex items-center gap-3">
                      <div className={cn('h-3 w-3 rounded-full', `bg-${alert.color}`)} />
                      <div>
                        <p className="font-medium">{alert.label}</p>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                      </div>
                    </div>
                    <ToggleSwitch
                      enabled={notifications[alert.key as keyof typeof notifications] as boolean}
                      onChange={() => setNotifications(prev => ({
                        ...prev,
                        [alert.key]: !prev[alert.key as keyof typeof prev]
                      }))}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="mb-4 text-lg font-semibold">Notification Channels</h3>
              <div className="space-y-3">
                {[
                  { key: 'email', label: 'Email Notifications', icon: Mail, description: 'admin@company.com' },
                  { key: 'slack', label: 'Slack Integration', icon: Slack, description: '#alerts channel' },
                  { key: 'webhook', label: 'Webhook', icon: Webhook, description: 'Custom HTTP endpoint' },
                ].map((channel) => (
                  <div key={channel.key} className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-muted p-2">
                        <channel.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{channel.label}</p>
                        <p className="text-sm text-muted-foreground">{channel.description}</p>
                      </div>
                    </div>
                    <ToggleSwitch
                      enabled={notifications[channel.key as keyof typeof notifications] as boolean}
                      onChange={() => setNotifications(prev => ({
                        ...prev,
                        [channel.key]: !prev[channel.key as keyof typeof prev]
                      }))}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'ai':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">AI Features</h3>
              <p className="mb-4 text-sm text-muted-foreground">Configure AI-powered analysis and recommendations</p>
              
              <div className="space-y-3">
                {[
                  { key: 'autoAnalysis', label: 'Automatic Analysis', description: 'Continuously analyze cluster health' },
                  { key: 'predictions', label: 'Predictive Insights', description: 'Forecast resource usage and potential issues' },
                  { key: 'recommendations', label: 'Smart Recommendations', description: 'Suggest optimizations and fixes' },
                  { key: 'anomalyDetection', label: 'Anomaly Detection', description: 'Identify unusual patterns and behaviors' },
                ].map((feature) => (
                  <div key={feature.key} className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                    <div>
                      <p className="font-medium">{feature.label}</p>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                    <ToggleSwitch
                      enabled={aiSettings[feature.key as keyof typeof aiSettings] as boolean}
                      onChange={() => setAiSettings(prev => ({
                        ...prev,
                        [feature.key]: !prev[feature.key as keyof typeof prev]
                      }))}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="mb-4 text-lg font-semibold">Confidence Threshold</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Only show insights with confidence above this threshold
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="50"
                    max="99"
                    value={aiSettings.confidenceThreshold}
                    onChange={(e) => setAiSettings(prev => ({
                      ...prev,
                      confidenceThreshold: parseInt(e.target.value)
                    }))}
                    className="flex-1"
                  />
                  <span className="min-w-[3rem] rounded-lg bg-primary/10 px-3 py-1 text-center font-semibold text-primary">
                    {aiSettings.confidenceThreshold}%
                  </span>
                </div>
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>More insights (50%)</span>
                  <span>Higher accuracy (99%)</span>
                </div>
              </div>
            </div>
            
            <div className="rounded-lg bg-primary/5 p-4">
              <div className="flex items-center gap-3">
                <Brain className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">AI Model Status</p>
                  <p className="text-sm text-muted-foreground">Last trained: 2 hours ago | Accuracy: 94.2%</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'integrations':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Connected Services</h3>
              <p className="mb-4 text-sm text-muted-foreground">Manage your monitoring integrations</p>
              
              <div className="space-y-3">
                {Object.entries(integrations).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'rounded-lg p-2',
                        value.connected ? 'bg-success/10' : 'bg-muted'
                      )}>
                        <Database className={cn(
                          'h-5 w-5',
                          value.connected ? 'text-success' : 'text-muted-foreground'
                        )} />
                      </div>
                      <div>
                        <p className="font-medium capitalize">{key}</p>
                        <p className="text-sm text-muted-foreground">
                          {value.connected ? `Last sync: ${value.lastSync}` : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {value.connected && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="rounded-lg bg-muted p-2 hover:bg-muted/80"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          'rounded-lg px-4 py-2 text-sm font-medium',
                          value.connected
                            ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                            : 'bg-primary text-primary-foreground'
                        )}
                      >
                        {value.connected ? 'Disconnect' : 'Connect'}
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="mb-4 text-lg font-semibold">Cluster Configuration</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'Cluster Name', value: 'production-us-west-2' },
                  { label: 'Kubernetes Version', value: '1.28.4' },
                  { label: 'Region', value: 'us-west-2' },
                  { label: 'Provider', value: 'AWS EKS' },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border border-border/50 p-4">
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Authentication</h3>
              <p className="mb-4 text-sm text-muted-foreground">Manage access and security settings</p>
              
              <div className="space-y-3">
                {[
                  { label: 'Two-Factor Authentication', description: 'Add an extra layer of security', enabled: true },
                  { label: 'SSO Integration', description: 'Sign in with company credentials', enabled: true },
                  { label: 'API Key Access', description: 'Allow programmatic access', enabled: false },
                ].map((setting, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                    <div>
                      <p className="font-medium">{setting.label}</p>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                    <ToggleSwitch enabled={setting.enabled} onChange={() => {}} />
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="mb-4 text-lg font-semibold">API Keys</h3>
              <div className="rounded-lg border border-border/50 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Production API Key</p>
                      <p className="text-sm text-muted-foreground">Created: Jan 15, 2024</p>
                    </div>
                  </div>
                  <span className="rounded bg-success/10 px-2 py-1 text-xs font-medium text-success">Active</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value="km_prod_xxxxxxxxxxxxxxxxxxxx"
                    readOnly
                    className="flex-1 rounded-lg border border-border bg-muted/50 px-4 py-2 text-sm"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    className="rounded-lg bg-muted px-4 py-2 text-sm font-medium"
                  >
                    Copy
                  </motion.button>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 w-full rounded-lg border border-dashed border-border py-3 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary"
              >
                + Generate New API Key
              </motion.button>
            </div>
          </div>
        )

      case 'account':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Profile</h3>
              <p className="mb-4 text-sm text-muted-foreground">Manage your personal information</p>
              
              <div className="flex items-center gap-6 rounded-lg border border-border/50 p-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-2xl font-bold text-white">
                  JD
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold">John Doe</h4>
                  <p className="text-muted-foreground">john.doe@company.com</p>
                  <p className="text-sm text-muted-foreground">Platform Administrator</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-lg bg-muted px-4 py-2 text-sm font-medium"
                >
                  Edit Profile
                </motion.button>
              </div>
            </div>
            
            <div>
              <h3 className="mb-4 text-lg font-semibold">Preferences</h3>
              <div className="space-y-4">
                {[
                  { label: 'Timezone', value: 'Pacific Time (US & Canada)' },
                  { label: 'Language', value: 'English (US)' },
                  { label: 'Date Format', value: 'MM/DD/YYYY' },
                ].map((pref) => (
                  <div key={pref.label} className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                    <div>
                      <p className="font-medium">{pref.label}</p>
                      <p className="text-sm text-muted-foreground">{pref.value}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <h3 className="mb-2 font-semibold text-destructive">Danger Zone</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Irreversible actions that affect your account
              </p>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-lg border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                >
                  Delete Account
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium"
                >
                  Export Data
                </motion.button>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Configure your KubeMind AI dashboard
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Navigation */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <nav className="space-y-1">
            {sections.map((section) => (
              <motion.button
                key={section.id}
                whileHover={{ x: 4 }}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors',
                  activeSection === section.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <section.icon className="h-5 w-5" />
                <div>
                  <p className="font-medium">{section.label}</p>
                  <p className="text-xs opacity-70">{section.description}</p>
                </div>
              </motion.button>
            ))}
          </nav>
        </motion.div>

        {/* Content */}
        <motion.div
          variants={itemVariants}
          className="glass-card rounded-xl p-6 lg:col-span-3"
        >
          {renderContent()}
        </motion.div>
      </div>
    </motion.div>
  )
}
