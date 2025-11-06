'use client'

import { CalendarDays, CircleUserRound, NotebookPen } from 'lucide-react'
import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface ProjectDetails {
  id: string
  name: string
  client_name?: string | null
  start_date?: string | null
  deadline?: string | null
  instructions?: string | null
}

export interface ProjectUpdatePayload {
  name: string
  client_name: string | null
  start_date: string | null
  deadline: string | null
  instructions: string | null
}

interface EditProjectDetailsDialogProps {
  project: ProjectDetails
  onSubmit: (updates: ProjectUpdatePayload) => Promise<void>
  trigger?: ReactNode
}

const toInputDate = (value?: string | null) => {
  if (!value) return ''
  try {
    return new Date(value).toISOString().slice(0, 10)
  } catch {
    return value.slice(0, 10)
  }
}

export function EditProjectDetailsDialog({ project, onSubmit, trigger }: EditProjectDetailsDialogProps) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formState, setFormState] = useState({
    name: project.name,
    client_name: project.client_name ?? '',
    start_date: toInputDate(project.start_date),
    deadline: toInputDate(project.deadline),
    instructions: project.instructions ?? '',
  })

  const defaultTrigger = useMemo(
    () => (
      <Button variant="outline" size="sm">
        Edit project details
      </Button>
    ),
    []
  )

  useEffect(() => {
    if (!open) return
    setFormState({
      name: project.name,
      client_name: project.client_name ?? '',
      start_date: toInputDate(project.start_date),
      deadline: toInputDate(project.deadline),
      instructions: project.instructions ?? '',
    })
    setErrorMessage(null)
  }, [open, project])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    const trimmedName = formState.name.trim()
    if (!trimmedName) {
      setErrorMessage('Project name is required')
      return
    }

    try {
      setSubmitting(true)
      setErrorMessage(null)
      await onSubmit({
        name: trimmedName,
        client_name: formState.client_name.trim() ? formState.client_name.trim() : null,
        start_date: formState.start_date || null,
        deadline: formState.deadline || null,
        instructions: formState.instructions.trim() ? formState.instructions.trim() : null,
      })
      setOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update project'
      setErrorMessage(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] w-full overflow-hidden border-none bg-transparent p-0 sm:max-w-[680px]">
        <div className="grid overflow-hidden rounded-3xl border bg-card shadow-xl sm:grid-cols-[240px_1fr]">
          <aside className="flex flex-col gap-5 bg-muted/60 p-8">
            <div className="space-y-3">
              <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <CircleUserRound className="size-6" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Edit project details</h3>
              <p className="text-sm text-muted-foreground">
                Keep client facts, key milestones, and AI notes up to date so the team sees the latest context.
              </p>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 rounded-2xl border border-muted/60 bg-background/70 p-3">
                <CalendarDays className="size-4 text-primary" />
                <span>Adjust dates to refresh timeline badges across the dashboard.</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-muted/60 bg-background/70 p-3">
                <NotebookPen className="size-4 text-primary" />
                <span>Summaries inform AI prompts and the project overview banner.</span>
              </div>
            </div>
          </aside>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-8">
            <header className="space-y-2">
              <DialogTitle className="text-2xl font-semibold text-foreground">Project information</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Changes save instantly after you hit “Save changes”.
              </DialogDescription>
            </header>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-project-name">Project name *</Label>
                <Input
                  id="edit-project-name"
                  value={formState.name}
                  onChange={event => setFormState(prev => ({ ...prev, name: event.target.value }))}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="edit-project-client">Client name</Label>
                  <Input
                    id="edit-project-client"
                    value={formState.client_name}
                    onChange={event => setFormState(prev => ({ ...prev, client_name: event.target.value }))}
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-project-start">Start date</Label>
                  <Input
                    id="edit-project-start"
                    type="date"
                    value={formState.start_date}
                    onChange={event => setFormState(prev => ({ ...prev, start_date: event.target.value }))}
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-project-deadline">Deadline</Label>
                  <Input
                    id="edit-project-deadline"
                    type="date"
                    value={formState.deadline}
                    onChange={event => setFormState(prev => ({ ...prev, deadline: event.target.value }))}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-project-instructions">Project summary</Label>
                <Textarea
                  id="edit-project-instructions"
                  rows={4}
                  placeholder="Outline scope, strengths, and key constraints for collaborators."
                  value={formState.instructions}
                  onChange={event => setFormState(prev => ({ ...prev, instructions: event.target.value }))}
                  disabled={submitting}
                />
              </div>
            </div>

            {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                className={cn('justify-center sm:justify-start')}
                onClick={() => setOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                {submitting ? <LoadingSpinner className="mr-2" /> : null}
                {submitting ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
