'use client'

import { Check, ChevronRight, Edit, Plus, Sparkles, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { cn } from '@/lib/utils'
import { type BidAnalysis } from '@/libs/ai/bid-analysis'
import { WorkPackageContent } from '@/libs/repositories/work-package-content'
import { Requirement, WorkPackage } from '@/libs/repositories/work-packages'

interface StrategyGenerationScreenProps {
  workPackageId: string
  workPackage: WorkPackage
  initialContent: WorkPackageContent | null
  contentLoaded: boolean
  onContinue: () => void
  onRefresh: () => Promise<void> | void
}

export function StrategyGenerationScreen({
  workPackageId,
  workPackage,
  initialContent,
  contentLoaded,
  onContinue,
  onRefresh,
}: StrategyGenerationScreenProps) {
  const [winThemes, setWinThemes] = useState<string[]>(initialContent?.win_themes || [])
  const [bidAnalysis, setBidAnalysis] = useState<BidAnalysis | null>(initialContent?.bid_analysis || null)
  const [isContentGenerated, setIsContentGenerated] = useState(!!initialContent?.content)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editText, setEditText] = useState('')

  const hasStrategyData = winThemes.length > 0 || !!bidAnalysis

  // Sync with latest persisted content
  useEffect(() => {
    setWinThemes(initialContent?.win_themes || [])
    setBidAnalysis(initialContent?.bid_analysis || null)
  }, [initialContent?.win_themes, initialContent?.bid_analysis])

  useEffect(() => {
    if (initialContent?.content) {
      setIsContentGenerated(true)
    }
  }, [initialContent?.content])

  const handleGenerateStrategy = useCallback(async () => {
    try {
      const res = await fetch(`/api/work-packages/${workPackageId}/generate-strategy`, {
        method: 'POST',
      })
      const data = await res.json()
      if (res.ok && data.bidAnalysis && data.winThemes) {
        setBidAnalysis(data.bidAnalysis)
        setWinThemes(data.winThemes)
        toast.success('Tender planning complete')
        onRefresh()
      } else {
        toast.error(data.error || 'Failed to generate tender planning')
      }
    } catch (error) {
      console.error('[Strategy] generate error:', error)
      toast.error('Failed to generate tender planning')
    }
  }, [workPackageId, onRefresh])

  const handleGenerateContent = async () => {
    fetch(`/api/work-packages/${workPackageId}/generate-content`, {
      method: 'POST',
      headers: { Accept: 'text/event-stream' },
    }).catch((error) => {
      console.error('[Content Generation] Error:', error)
      toast.error('Failed to start content generation')
    })

    toast.info('Generating content...')
    onContinue()
  }

  const statusMeta = useMemo(() => {
    if (!contentLoaded) {
      return {
        label: 'Loading...',
        tone: 'text-slate-600 bg-slate-100',
      }
    }
    if (hasStrategyData) {
      return {
        label: 'Ready',
        tone: 'text-emerald-600 bg-emerald-100',
      }
    }
    return {
      label: 'Unavailable',
      tone: 'text-amber-600 bg-amber-100',
    }
  }, [contentLoaded, hasStrategyData])

  const mandatoryCount = workPackage.requirements.filter((req) => req.priority === 'mandatory').length
  const optionalCount = workPackage.requirements.length - mandatoryCount

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
    setWinThemes((prev) => [...prev, 'New win theme...'])
    setEditingIndex(winThemes.length)
    setEditText('New win theme...')
  }

  const recommendationTone = bidAnalysis?.recommendation === 'bid' ? 'text-emerald-600' : 'text-rose-600'
  const recommendationLabel = bidAnalysis?.recommendation === 'bid' ? 'Bid' : 'No-Bid'

  return (
    <div className="space-y-4 p-4 pb-32">
      {/* Compact header - NO BUTTONS */}
      <div className="flex items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">Tender Planning</h2>
          <Badge className={cn('text-xs', statusMeta.tone)}>{statusMeta.label}</Badge>
        </div>
        {hasStrategyData && (
          <Button variant="ghost" size="sm" onClick={handleGenerateStrategy}>
            <Sparkles className="mr-1 size-3" />
            Regenerate
          </Button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Requirements table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Requirements ({workPackage.requirements.length})</h3>
            <div className="flex gap-2 text-xs">
              <Badge variant="outline" className="h-5 text-xs">M: {mandatoryCount}</Badge>
              <Badge variant="outline" className="h-5 text-xs">O: {optionalCount}</Badge>
            </div>
          </div>

          {workPackage.requirements.length ? (
            <div className="rounded border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-2 text-left font-medium">#</th>
                    <th className="p-2 text-left font-medium">Priority</th>
                    <th className="p-2 text-left font-medium">Requirement</th>
                    <th className="p-2 text-left font-medium">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {workPackage.requirements.map((req: Requirement, index: number) => (
                    <tr key={req.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-2 font-medium">{index + 1}</td>
                      <td className="p-2">
                        <Badge
                          variant={req.priority === 'mandatory' ? 'destructive' : 'secondary'}
                          className="h-4 text-[10px]"
                        >
                          {req.priority === 'mandatory' ? 'M' : 'O'}
                        </Badge>
                      </td>
                      <td className="p-2 leading-tight">{req.text}</td>
                      <td className="p-2 text-muted-foreground">{req.source || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded border border-dashed p-6 text-center text-xs text-muted-foreground">
              No requirements captured
            </div>
          )}
        </div>

        {/* Bid analysis compact */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Bid Guidance</h3>

          {!contentLoaded ? (
            <LoadingSpinner size="sm" text="Loading..." />
          ) : !bidAnalysis ? (
            <div className="rounded border border-dashed p-6 text-center text-xs text-muted-foreground">
              Strategy unavailable. Regenerate to unlock.
            </div>
          ) : (
            <div className="space-y-2">
              {/* Recommendation */}
              <div className="rounded border bg-muted/30 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Recommendation</span>
                    <span className={cn('text-sm font-semibold', recommendationTone)}>{recommendationLabel}</span>
                  </div>
                  <Badge variant="outline" className="h-5 text-xs">{bidAnalysis.totalScore}%</Badge>
                </div>
                {bidAnalysis.reasoning && (
                  <p className="mt-2 text-xs text-muted-foreground leading-tight">{bidAnalysis.reasoning}</p>
                )}
              </div>

              {/* Strengths & Concerns */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded border p-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Strengths</p>
                  <div className="mt-2 space-y-1">
                    {bidAnalysis.strengths.length ? (
                      bidAnalysis.strengths.map((item, i) => (
                        <div key={i} className="flex items-start gap-1 text-xs">
                          <div className="mt-1 size-1 shrink-0 rounded-full bg-emerald-500" />
                          <p className="leading-tight">{item}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">None</p>
                    )}
                  </div>
                </div>

                <div className="rounded border p-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Concerns</p>
                  <div className="mt-2 space-y-1">
                    {bidAnalysis.concerns.length ? (
                      bidAnalysis.concerns.map((item, i) => (
                        <div key={i} className="flex items-start gap-1 text-xs">
                          <div className="mt-1 size-1 shrink-0 rounded-full bg-rose-500" />
                          <p className="leading-tight">{item}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">None</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Criteria */}
              <div className="rounded border">
                <div className="border-b bg-muted/30 px-3 py-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide">Criteria</p>
                </div>
                <div className="divide-y">
                  {bidAnalysis.criteria.map((criterion) => (
                    <div key={criterion.id} className="flex items-center justify-between px-3 py-1.5">
                      <div className="flex-1">
                        <p className="text-xs font-medium">{criterion.name}</p>
                        <p className="text-[10px] text-muted-foreground">{criterion.description}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold">{criterion.score.toFixed(1)}</span>
                        <Badge variant="outline" className="h-4 text-[10px]">
                          {(criterion.weight * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Win themes inline editable list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Win Themes</h3>
          <Badge variant="secondary" className="h-5 text-xs">{winThemes.length}</Badge>
        </div>

        {!contentLoaded ? (
          <LoadingSpinner size="sm" text="Loading..." />
        ) : !winThemes.length ? (
          <div className="rounded border border-dashed p-6 text-center text-xs text-muted-foreground">
            Win themes unavailable. Regenerate to populate.
          </div>
        ) : (
          <div className="space-y-1">
            {winThemes.map((theme, index) => (
              <div key={index} className="flex items-center gap-2 rounded border bg-background p-2">
                {editingIndex === index ? (
                  <>
                    <Input
                      value={editText}
                      onChange={(event) => setEditText(event.target.value)}
                      className="h-7 flex-1 text-xs"
                    />
                    <Button size="sm" onClick={() => handleSaveEdit(index)} className="h-7 w-7 p-0">
                      <Check className="size-3" />
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="size-1.5 shrink-0 rounded-full bg-primary" />
                    <p className="flex-1 text-xs leading-tight">{theme}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleEdit(index)}
                    >
                      <Edit className="size-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(index)}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </>
                )}
              </div>
            ))}
            <Button variant="outline" onClick={handleAdd} size="sm" className="h-7 w-full text-xs">
              <Plus className="mr-1 size-3" />
              Add Theme
            </Button>
          </div>
        )}
      </div>

      {/* Floating Action Panel - V10 Style */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="flex items-center gap-3 rounded-full border border-border/50 bg-background/95 px-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-all duration-300 hover:bottom-7 hover:right-7 hover:shadow-[0_12px_48px_rgba(0,0,0,0.18)]">
          {/* Status Badge */}
          <Badge className={cn('text-xs font-semibold', statusMeta.tone)}>
            {statusMeta.label}
          </Badge>

          {/* Divider */}
          <div className="h-6 w-px bg-border/40" />

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {isContentGenerated && (
              <Button variant="outline" onClick={onContinue} size="sm" className="h-8 text-xs">
                Continue in Editor
                <ChevronRight className="ml-1.5 size-3.5" />
              </Button>
            )}
            <Button
              onClick={handleGenerateContent}
              disabled={!hasStrategyData}
              size="sm"
              className="h-8 text-xs font-semibold shadow-sm"
            >
              <Sparkles className="mr-1.5 size-3.5" />
              Generate Content
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
