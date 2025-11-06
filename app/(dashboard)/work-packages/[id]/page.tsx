'use client'

import { Loader2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { TabsContent } from '@/components/ui/tabs'
import { EditorScreen } from '@/components/workflow-steps/editor-screen'
import { ExportScreen } from '@/components/workflow-steps/export-screen'
import { GenerationScreen } from '@/components/workflow-steps/generation-screen'
import { RequirementsView } from '@/components/workflow-steps/requirements-view'
import { StrategyScreen } from '@/components/workflow-steps/strategy-screen'
import { WorkflowTabs } from '@/components/workflow-steps/workflow-tabs'
import { WorkPackage } from '@/libs/repositories/work-packages'

interface WorkPackagePageProps {
  params: Promise<{
    id: string
  }>
}

export default function WorkPackagePage({ params }: WorkPackagePageProps) {
  const [workPackageId, setWorkPackageId] = useState<string | null>(null)
  const [workPackage, setWorkPackage] = useState<WorkPackage | null>(null)
  const [project, setProject] = useState<{ id: string; name: string } | null>(null)
  const [content, setContent] = useState<Record<string, unknown> | null>(null)
  const [currentTab, setCurrentTab] = useState<'requirements' | 'strategy' | 'generate' | 'edit' | 'export'>('requirements')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    params.then(p => setWorkPackageId(p.id))
  }, [params])

  const loadData = useCallback(async () => {
    if (!workPackageId) return

    try {
      // Load work package
      const wpRes = await fetch(`/api/work-packages/${workPackageId}`)
      const wpData = await wpRes.json()
      setWorkPackage(wpData)

      // Load project (from work package)
      const projRes = await fetch(`/api/projects/${wpData.project_id}`)
      const projData = await projRes.json()
      setProject(projData)

      // Load content (may not exist yet)
      try {
        const contentRes = await fetch(`/api/work-packages/${workPackageId}/content`)
        if (contentRes.ok) {
          const contentData = await contentRes.json()
          setContent(contentData)

          // Determine current tab based on progress
          if (contentData.content) {
            setCurrentTab('edit')
          } else if (contentData.win_themes && contentData.win_themes.length > 0) {
            setCurrentTab('strategy')
          }
        }
      } catch {
        // Content doesn't exist yet
      }

      setLoading(false)
    } catch {
      setLoading(false)
    }
  }, [workPackageId])

  useEffect(() => {
    if (workPackageId) {
      loadData()
    }
  }, [workPackageId, loadData])

  const getCompletedSteps = () => {
    const steps = ['requirements']
    if (content?.win_themes && Array.isArray(content.win_themes) && content.win_themes.length > 0) {
      steps.push('strategy')
    }
    if (content?.content) {
      steps.push('generate', 'edit')
    }
    if (workPackage?.status === 'completed') {
      steps.push('export')
    }
    return steps
  }

  if (loading || !workPackage || !project) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!workPackageId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full flex-1 flex-col overflow-hidden">
      <div className="mx-auto flex h-full max-w-5xl flex-1 flex-col py-8">
      <WorkflowTabs
        currentTab={currentTab}
        onTabChange={(tab: string) => setCurrentTab(tab as typeof currentTab)}
        completedSteps={getCompletedSteps()}
        className="flex flex-1 flex-col min-h-0"
      >
        <TabsContent value="requirements" className="flex flex-1 flex-col min-h-0 overflow-auto">
          <RequirementsView
            workPackage={workPackage}
            projectId={project.id}
            onContinue={() => setCurrentTab('strategy')}
          />
        </TabsContent>

        <TabsContent value="strategy" className="flex flex-1 flex-col min-h-0 overflow-auto">
          <StrategyScreen
            workPackageId={workPackageId}
            initialWinThemes={content?.win_themes as string[] | undefined}
            onContinue={() => setCurrentTab('generate')}
            onBack={() => setCurrentTab('requirements')}
          />
        </TabsContent>

        <TabsContent value="generate" className="flex flex-1 flex-col min-h-0 overflow-auto">
          <GenerationScreen
            workPackageId={workPackageId}
            workPackage={workPackage}
            winThemesCount={Array.isArray(content?.win_themes) ? content.win_themes.length : 0}
            onContinue={() => setCurrentTab('edit')}
            onBack={() => setCurrentTab('strategy')}
          />
        </TabsContent>

        <TabsContent value="edit" className="flex flex-1 flex-col min-h-0">
          <EditorScreen
            workPackageId={workPackageId}
            initialContent={(content?.content as string) || ''}
            onContinue={() => setCurrentTab('export')}
            onBack={() => setCurrentTab('generate')}
          />
        </TabsContent>

        <TabsContent value="export" className="flex flex-1 flex-col min-h-0 overflow-auto">
          <ExportScreen
            workPackageId={workPackageId}
            workPackage={workPackage}
            projectId={project.id}
          />
        </TabsContent>
      </WorkflowTabs>
      </div>
    </div>
  )
}
