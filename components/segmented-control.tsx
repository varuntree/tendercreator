'use client'

import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface SegmentedControlItem {
  value: string
  label: string
  icon?: LucideIcon
  disabled?: boolean
}

interface SegmentedControlProps {
  value: string
  onChange?: (value: string) => void
  items: SegmentedControlItem[]
  className?: string
  fullWidth?: boolean
}

export function SegmentedControl({ value, onChange, items, className, fullWidth = false }: SegmentedControlProps) {
  return (
    <div className={cn('inline-flex items-center gap-2 rounded-full bg-muted/60 p-1', fullWidth && 'w-full justify-between', className)}>
      {items.map(item => {
        const isActive = item.value === value
        const Icon = item.icon
        return (
          <button
            key={item.value}
            type="button"
            disabled={item.disabled}
            onClick={() => {
              if (item.disabled) return
              onChange?.(item.value)
            }}
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
              isActive ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
              item.disabled && 'cursor-not-allowed opacity-60'
            )}
          >
            {Icon ? <Icon className={cn('size-4', isActive ? 'text-primary' : 'text-muted-foreground')} /> : null}
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
