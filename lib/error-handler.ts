import { toast } from 'sonner'

export function handleError(error: unknown, context?: string) {
  console.error(`[Error${context ? ` in ${context}` : ''}]:`, error)

  const message = error instanceof Error ? error.message : 'An unexpected error occurred'

  toast.error(message)
}

export function showSuccessToast(message: string) {
  toast.success(message)
}

export function showInfoToast(message: string) {
  toast.info(message)
}
