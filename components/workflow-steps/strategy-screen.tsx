'use client'

import { Check, ChevronLeft, ChevronRight, Edit, Plus, Sparkles, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface StrategyScreenProps {
  workPackageId: string
  initialWinThemes?: string[]
  onContinue: () => void
  onBack: () => void
}

export function StrategyScreen({
  workPackageId,
  initialWinThemes,
  onContinue,
  onBack,
}: StrategyScreenProps) {
  const [winThemes, setWinThemes] = useState<string[]>(initialWinThemes || [])
  const [isGenerating, setIsGenerating] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editText, setEditText] = useState('')

  const handleGenerate = async () => {
    try {
      setIsGenerating(true)
      const res = await fetch(`/api/work-packages/${workPackageId}/win-themes`, {
        method: 'POST',
      })
      const data = await res.json()
      if (data.success) {
        setWinThemes(data.win_themes)
        toast.success('Win themes generated successfully')
      } else {
        toast.error(data.error || 'Failed to generate win themes')
      }
    } catch {
      toast.error('Failed to generate win themes')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    setEditText(winThemes[index])
  }

  const handleSaveEdit = (index: number) => {
    const updated = [...winThemes]
    updated[index] = editText
    setWinThemes(updated)
    setEditingIndex(null)
    setEditText('')
  }

  const handleDelete = (index: number) => {
    setWinThemes(winThemes.filter((_, i) => i !== index))
  }

  const handleAdd = () => {
    setWinThemes([...winThemes, 'New win theme...'])
    setEditingIndex(winThemes.length)
    setEditText('New win theme...')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Strategy & Planning</h2>
        <p className="text-muted-foreground">Win themes will guide content generation</p>
      </div>

      {winThemes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            {isGenerating ? (
              <LoadingSpinner size="lg" text="Generating win themes..." />
            ) : (
              <>
                <Sparkles className="mx-auto size-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Win Themes Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Generate win themes using AI to guide your document creation
                </p>
                <Button onClick={handleGenerate} disabled={isGenerating}>
                  <Sparkles className="mr-2 size-4" />
                  Generate Win Themes
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {winThemes.map((theme, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                {editingIndex === index ? (
                  <div className="flex gap-2">
                    <Input
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={() => handleSaveEdit(index)}>
                      <Check className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <p className="flex-1 text-sm">{theme}</p>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(index)}>
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(index)}
                        className="text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" onClick={handleAdd} className="w-full">
            <Plus className="mr-2 size-4" />
            Add Win Theme
          </Button>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 size-4" />
          Back to Requirements
        </Button>
        <Button onClick={onContinue} disabled={winThemes.length === 0}>
          Continue to Generation
          <ChevronRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  )
}
