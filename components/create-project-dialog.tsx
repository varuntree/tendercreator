'use client'

import { ClipboardList, FileText, PlaneTakeoff, Target } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { type FormEvent, type ReactNode, useMemo, useState } from 'react'

import { ProcessLoaderOverlay } from '@/components/process-loader-overlay'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const initialFormState = {
  name: '',
  client_name: '',
  deadline: '',
  instructions: '',
}

type CreateProjectDialogProps = {
  trigger?: ReactNode
}

const projectSetupSteps = [
  { id: 'workspace', label: 'Creating your project workspace' },
  { id: 'documents', label: 'Uploading tender references' },
  { id: 'indexing', label: 'Indexing compliance requirements' },
  { id: 'outputs', label: 'Preparing your starter checklist' },
]

export function CreateProjectDialog({ trigger }: CreateProjectDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState(initialFormState)

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      setFormData(initialFormState)
      setError(null)
      setLoading(false)
    }
  }

  const primaryActions = useMemo(
    () => [
      { id: 'details', label: 'Define project details', icon: ClipboardList },
      { id: 'documents', label: 'Upload client files', icon: FileText },
      { id: 'strategy', label: 'Set win themes', icon: Target },
    ],
    []
  )

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error ?? 'Unable to create project')
      }

      handleOpenChange(false)
      router.push(`/projects/${result.data.id}`)
    } catch (err) {
      console.error('Error creating project:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ProcessLoaderOverlay
        isVisible={loading}
        title="Generating the required documents"
        subtitle="We’re setting up your tender workspace and preparing the first checklist."
        steps={projectSetupSteps}
        iconLabel="TC"
      />

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {trigger ?? <Button>Create Project</Button>}
        </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto w-full border-none bg-transparent p-0 sm:max-w-[720px]">
        <div className="grid gap-0 overflow-hidden rounded-3xl border bg-card shadow-xl grid-cols-1 md:grid-cols-[260px_1fr]">
            <aside className="hidden flex-col gap-6 bg-muted/60 p-8 text-left md:flex">
              <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <PlaneTakeoff className="size-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">Create New Project</h3>
                <p className="text-sm text-muted-foreground">
                  Set up a tender workspace with the client context, submission deadlines, and guidance your team needs.
                </p>
              </div>
              <div className="space-y-3">
                {primaryActions.map(({ id, label, icon: Icon }) => (
                  <div key={id} className="flex items-start gap-3 rounded-2xl border border-muted/60 bg-background/80 p-3 text-left">
                    <span className="mt-0.5 flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </span>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                  </div>
                ))}
              </div>
            </aside>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-8">
              <header className="space-y-2">
                <DialogTitle className="text-2xl font-semibold text-foreground">Project details</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  These fields surface inside the project overview and drive downstream AI prompts.
                </DialogDescription>
              </header>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name">Project name *</Label>
                  <Input
                    id="project-name"
                    required
                    placeholder="e.g. CityLink Smart Lighting Upgrade"
                    value={formData.name}
                    onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="client-name">Client name</Label>
                    <Input
                      id="client-name"
                      placeholder="Organisation or agency"
                      value={formData.client_name}
                      onChange={(event) => setFormData({ ...formData, client_name: event.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-deadline">Submission deadline</Label>
                    <Input
                      id="project-deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(event) => setFormData({ ...formData, deadline: event.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project-instructions">AI guidance / instructions</Label>
                  <Textarea
                    id="project-instructions"
                    rows={4}
                    placeholder="Share any must-include messages, win themes, or document nuances for the AI."
                    value={formData.instructions}
                    onChange={(event) => setFormData({ ...formData, instructions: event.target.value })}
                  />
                </div>
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  className={cn('justify-center sm:justify-start')}
                  onClick={() => handleOpenChange(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                  {loading && <LoadingSpinner className="mr-2" />}
                  {loading ? 'Creating project...' : 'Create project'}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
