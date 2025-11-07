'use client'

import { Check, ChevronRight, Edit, Plus, Sparkles, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
        label: 'Loading strategy...',
        tone: 'text-slate-600 bg-slate-100 border-slate-200',
        helper: 'Fetching saved bid guidance and win themes.',
      }
    }
    if (hasStrategyData) {
      return {
        label: 'Strategy ready',
        tone: 'text-emerald-600 bg-emerald-100 border-emerald-200',
        helper: 'Bid decision and win themes generated during analysis.',
      }
    }
    return {
      label: 'Strategy unavailable',
      tone: 'text-amber-600 bg-amber-100 border-amber-200',
      helper: 'Regenerate strategy to populate this section.',
    }
  }, [contentLoaded, hasStrategyData])

  const mandatoryCount = workPackage.requirements.filter((req) => req.priority === 'mandatory').length
  const optionalCount = workPackage.requirements.length - mandatoryCount

  const requirementList = workPackage.requirements.length ? (
    <div className="space-y-3">
      {workPackage.requirements.map((req: Requirement, index: number) => (
        <div key={req.id} className="rounded-2xl border border-border/60 bg-background p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
              <span className="font-semibold text-foreground">#{index + 1}</span>
              <Badge
                variant={req.priority === 'mandatory' ? 'destructive' : 'secondary'}
                className="capitalize"
              >
                {req.priority}
              </Badge>
            </div>
            {req.source && <span className="text-xs text-muted-foreground">{req.source}</span>}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-foreground">{req.text}</p>
        </div>
      ))}
    </div>
  ) : (
    <div className="rounded-2xl border border-dashed border-muted-foreground/40 p-10 text-center">
      <p className="text-sm text-muted-foreground">No requirements captured for this document yet.</p>
    </div>
  )

  const recommendationTone = bidAnalysis?.recommendation === 'bid' ? 'text-emerald-600' : 'text-rose-600'
  const recommendationLabel = bidAnalysis?.recommendation === 'bid' ? 'Bid' : 'No-Bid'

  const renderBidSection = () => {
    if (!contentLoaded) {
      return <LoadingSpinner size="sm" text="Loading saved strategy..." />
    }

    if (!bidAnalysis) {
      return (
        <div className="rounded-2xl border border-dashed border-muted p-10 text-center text-sm text-muted-foreground">
          Strategy data unavailable. Regenerate to unlock bid guidance.
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="rounded-2xl border bg-gradient-to-br from-background to-muted/40 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Recommendation</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className={cn('text-2xl font-semibold', recommendationTone)}>{recommendationLabel}</span>
                <span className="text-sm text-muted-foreground">{bidAnalysis.reasoning || 'Summary available in editor'}</span>
              </div>
            </div>
            <div className="rounded-full bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-sm">
              {bidAnalysis.totalScore}% fit score
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <StrategyList title="Strengths" items={bidAnalysis.strengths} tone="positive" />
          <StrategyList title="Concerns" items={bidAnalysis.concerns} tone="negative" />
        </div>

        <div className="rounded-2xl border border-border/70">
          <div className="flex items-center justify-between border-b border-border/70 px-5 py-3">
            <p className="text-sm font-semibold">Assessment Criteria</p>
            <span className="text-xs text-muted-foreground">Score 0-5</span>
          </div>
          <div className="divide-y divide-border/60">
            {bidAnalysis.criteria.map((criterion) => (
              <div key={criterion.id} className="flex flex-col gap-1 px-5 py-3 md:flex-row md:items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium">{criterion.name}</p>
                  <p className="text-xs text-muted-foreground">{criterion.description}</p>
                </div>
                <div className="flex items-center gap-3 text-sm font-semibold">
                  <span className="text-primary">{criterion.score.toFixed(1)}/5</span>
                  <Badge variant="outline">{(criterion.weight * 100).toFixed(0)}% weight</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderWinThemes = () => {
    if (!contentLoaded) {
      return <LoadingSpinner size="sm" text="Loading win themes..." />
    }

    if (!winThemes.length) {
      return (
        <div className="rounded-2xl border border-dashed border-muted p-10 text-center text-sm text-muted-foreground">
          Win themes unavailable. Regenerate to populate this list.
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {winThemes.map((theme, index) => (
          <div key={index} className="rounded-2xl border border-border/70 bg-background/80 p-4">
            {editingIndex === index ? (
              <div className="flex gap-2">
                <Input value={editText} onChange={(event) => setEditText(event.target.value)} className="flex-1" />
                <Button size="sm" onClick={() => handleSaveEdit(index)}>
                  <Check className="size-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <p className="flex-1 text-sm leading-relaxed">{theme}</p>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(index)}>
                    <Edit className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
        <Button variant="outline" onClick={handleAdd} className="w-full">
          <Plus className="mr-2 size-4" />
          Add Win Theme
        </Button>
      </div>
    )
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
    setWinThemes((prev) => [...prev, 'New win theme...'])
    setEditingIndex(winThemes.length)
    setEditText('New win theme...')
  }

  const heroCta = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
      {isContentGenerated && (
        <Button variant="outline" onClick={onContinue} className="w-full sm:w-auto">
          Continue in Editor
          <ChevronRight className="ml-2 size-4" />
        </Button>
      )}
      <Button
        onClick={handleGenerateContent}
        disabled={!hasStrategyData}
        size="lg"
        className="w-full sm:w-auto"
      >
        <Sparkles className="mr-2 size-4" />
        Generate Content
      </Button>
    </div>
  )

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border bg-gradient-to-br from-muted/40 via-background to-background p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <Badge className={cn('w-fit border text-xs font-semibold', statusMeta.tone)}>
              {statusMeta.label}
            </Badge>
            <div>
              <h2 className="text-3xl font-semibold">Tender Planning</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Validate requirements, assess competitiveness, and capture win themes before generating content.
              </p>
            </div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{statusMeta.helper}</p>
          </div>
          {heroCta}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[2fr,3fr]">
        <Card className="h-full border border-border/80">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Requirements Map</CardTitle>
                <p className="text-sm text-muted-foreground">{workPackage.document_type}</p>
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">Mandatory {mandatoryCount}</Badge>
                <Badge variant="outline">Optional {optionalCount}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="max-h-[560px] space-y-6 overflow-y-auto pr-2">
            {requirementList}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border border-border/80">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Bid / No-Bid Guidance</CardTitle>
                <p className="text-sm text-muted-foreground">Evidence-based recommendation</p>
              </div>
              {hasStrategyData && (
                <Button variant="ghost" size="sm" onClick={handleGenerateStrategy}>
                  <Sparkles className="mr-2 size-4" />
                  Regenerate
                </Button>
              )}
            </CardHeader>
            <CardContent>{renderBidSection()}</CardContent>
          </Card>

          <Card className="border border-border/80">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Win Themes</CardTitle>
                <p className="text-sm text-muted-foreground">3-5 differentiators to anchor the response</p>
              </div>
              <Badge variant="secondary">{winThemes.length} themes</Badge>
            </CardHeader>
            <CardContent>{renderWinThemes()}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

interface StrategyListProps {
  title: string
  items: string[]
  tone: 'positive' | 'negative'
}

function StrategyList({ title, items, tone }: StrategyListProps) {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-muted p-6 text-center text-sm text-muted-foreground">
        No {title.toLowerCase()} captured.
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-background/60 p-5">
      <p className="text-sm font-semibold">{title}</p>
      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-3 text-sm text-foreground">
            <div
              className={cn('mt-1 size-2 rounded-full', tone === 'positive' ? 'bg-emerald-500' : 'bg-rose-500')}
            />
            <p className="flex-1 leading-relaxed text-sm text-foreground">{item}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
