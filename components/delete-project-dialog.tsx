'use client'

import { AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { type ReactNode,useState } from 'react'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/loading-spinner'

interface DeleteProjectDialogProps {
  projectId: string
  projectName: string
  trigger?: ReactNode
}

export function DeleteProjectDialog({ projectId, projectName, trigger }: DeleteProjectDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      })

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error ?? 'Unable to delete project')
      }

      toast.success('Project deleted')
      setOpen(false)
      router.push('/projects')
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete project'
      toast.error(message)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
            Delete project
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete project
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 text-left">
            <span className="block">
              Are you sure you want to delete <span className="font-semibold">{projectName}</span>? This
              action cannot be undone and all associated documents and work packages will be removed.
            </span>
            {error ? (
              <span className="block rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</span>
            ) : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2 text-destructive-foreground" />
                  Deleting...
                </>
              ) : (
                'Delete project'
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
