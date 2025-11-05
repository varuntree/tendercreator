'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Check, Lock } from 'lucide-react'

interface WorkflowTabsProps {
  workPackageId: string
  currentTab: 'requirements' | 'strategy' | 'generate' | 'edit' | 'export'
  onTabChange: (tab: string) => void
  completedSteps: string[]
  children: React.ReactNode
}

export function WorkflowTabs({
  currentTab,
  onTabChange,
  completedSteps,
  children,
}: WorkflowTabsProps) {
  const tabs = [
    { id: 'requirements', label: 'Requirements' },
    { id: 'strategy', label: 'Strategy' },
    { id: 'generate', label: 'Generate' },
    { id: 'edit', label: 'Edit' },
    { id: 'export', label: 'Export' },
  ]

  const isTabAccessible = (tabId: string) => {
    if (tabId === 'requirements') return true
    return completedSteps.includes(tabId) || currentTab === tabId
  }

  return (
    <Tabs value={currentTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="w-full">
        {tabs.map(tab => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            disabled={!isTabAccessible(tab.id)}
            className="flex-1"
          >
            {completedSteps.includes(tab.id) ? (
              <Check className="mr-1 size-4" />
            ) : !isTabAccessible(tab.id) ? (
              <Lock className="mr-1 size-4" />
            ) : null}
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  )
}
