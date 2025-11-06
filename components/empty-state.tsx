import { LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon: LucideIcon
  heading: string
  description: string
  ctaLabel?: string
  ctaAction?: () => void
}

export function EmptyState({
  icon: Icon,
  heading,
  description,
  ctaLabel,
  ctaAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>

      <h3 className="text-lg font-semibold mb-2">{heading}</h3>

      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {description}
      </p>

      {ctaLabel && ctaAction && (
        <Button onClick={ctaAction}>
          {ctaLabel}
        </Button>
      )}
    </div>
  )
}
