'use client'

import { Check, Pencil,X } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Requirement {
  id: string
  text: string
  priority: 'mandatory' | 'optional'
  source: string
}

interface RequirementEditorProps {
  requirement: Requirement
  onUpdate: (req: Requirement) => void
  onDelete: () => void
}

export function RequirementEditor({
  requirement,
  onUpdate,
  onDelete,
}: RequirementEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(requirement.text)
  const [priority, setPriority] = useState<'mandatory' | 'optional'>(
    requirement.priority
  )
  const [source, setSource] = useState(requirement.source)

  const handleSave = () => {
    onUpdate({
      ...requirement,
      text,
      priority,
      source,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setText(requirement.text)
    setPriority(requirement.priority)
    setSource(requirement.source)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="space-y-2 p-3 border rounded-lg bg-muted/50">
        <div className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Requirement text"
            className="flex-1"
          />
          <Select
            value={priority}
            onValueChange={(val: 'mandatory' | 'optional') => setPriority(val)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mandatory">Mandatory</SelectItem>
              <SelectItem value="optional">Optional</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Input
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="Source reference"
          className="text-sm"
        />
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Check className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 p-3 border-b last:border-0 hover:bg-muted/50 transition-colors group">
      <div className="flex-1 space-y-1">
        <div className="flex items-start gap-2">
          <p className="flex-1">{requirement.text}</p>
          <Badge
            variant={requirement.priority === 'mandatory' ? 'default' : 'secondary'}
          >
            {requirement.priority}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{requirement.source}</p>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setIsEditing(true)}
          className="h-7 w-7"
        >
          <Pencil className="h-3 w-3" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={onDelete}
          className="h-7 w-7 text-destructive hover:text-destructive"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
