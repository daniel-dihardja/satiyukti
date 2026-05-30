'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'
import type { Difficulty, EnrichedVerse } from '@/lib/types/verse'
import { useLanguage } from '@/lib/context/language-context'

const DIFFICULTY_LEVEL: Record<Difficulty, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
}

function DifficultyDots({ difficulty }: { difficulty: Difficulty }) {
  const level = DIFFICULTY_LEVEL[difficulty]
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3].map(i => (
        <span
          key={i}
          className={cn('size-1 rounded-full', i <= level ? 'bg-foreground/35' : 'bg-foreground/10')}
        />
      ))}
    </span>
  )
}

const CATEGORY_STYLES = 'bg-secondary text-secondary-foreground'

export function VerseDetail({ verseEn, verseDe, verseId }: { verseEn: EnrichedVerse; verseDe?: EnrichedVerse; verseId?: EnrichedVerse }) {
  const [tab, setTab] = useState<'beginner' | 'scholar'>('beginner')
  const { language } = useLanguage()
  const verse = language === 'de' && verseDe ? verseDe : language === 'id' && verseId ? verseId : verseEn

  return (
    <div className="mx-auto w-full max-w-2xl px-6 pb-14 pt-4 md:px-10 md:pb-16 md:pt-6">
      {/* Header */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground md:text-sm">
            Verse {verse.verse_number}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium capitalize text-muted-foreground md:text-sm">
            <DifficultyDots difficulty={verse.difficulty} />
            {verse.difficulty}
          </span>
          <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium md:text-sm', CATEGORY_STYLES)}>
            {verse.category}
          </span>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground capitalize md:text-sm">
            {verse.practice_type}
          </span>
        </div>

        <h1 className="text-2xl font-bold leading-snug tracking-tight md:text-3xl">
          {verse.method_name}
        </h1>

        <p className="text-sm text-muted-foreground md:text-base">
          {verse.speaker} · p.{verse.page}
        </p>
      </div>

      {/* Sanskrit */}
      <div className="mb-8 rounded-xl bg-muted/60 px-5 py-5 md:px-7 md:py-6">
        <p className="font-serif text-lg leading-relaxed whitespace-pre-line text-foreground md:text-xl md:leading-loose">
          {verse.sanskrit}
        </p>
      </div>

      {/* Summary */}
      <p className="mb-8 text-sm leading-relaxed text-muted-foreground md:text-base md:leading-loose">
        {verse.summary}
      </p>

      {/* Explanation tabs */}
      <div className="mb-8">
        <div className="mb-4 flex gap-1 rounded-lg bg-muted p-1 w-fit">
          <button
            onClick={() => setTab('beginner')}
            className={cn(
              'rounded-md px-4 py-1.5 text-xs font-medium transition-colors md:px-5 md:py-2 md:text-sm',
              tab === 'beginner'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Beginner
          </button>
          <button
            onClick={() => setTab('scholar')}
            className={cn(
              'rounded-md px-4 py-1.5 text-xs font-medium transition-colors md:px-5 md:py-2 md:text-sm',
              tab === 'scholar'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Scholar
          </button>
        </div>

        <p className="text-sm leading-relaxed text-foreground md:text-base md:leading-loose">
          {tab === 'beginner' ? verse.beginner_explanation : verse.developer_explanation}
        </p>
      </div>

      {/* Focus object */}
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground md:text-sm">
          Focus Object
        </p>
        <p className="text-sm text-foreground md:text-base">{verse.focus_object}</p>
      </div>

      {/* Related verses */}
      {verse.related_verses.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground md:text-sm">
            Related Verses
          </p>
          <div className="flex flex-wrap gap-2.5">
            {verse.related_verses.map(n => (
              <Link
                key={n}
                href={`/vidya/verse/${n}`}
                className="flex h-10 w-12 items-center justify-center rounded-md border border-border bg-background text-xs font-mono text-muted-foreground transition-colors hover:border-foreground hover:text-foreground md:h-11 md:w-14 md:text-sm"
              >
                {n}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
