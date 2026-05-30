'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'
import type { EnrichedVerse } from '@/lib/types/verse'
import { useLanguage } from '@/lib/context/language-context'

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
          <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium md:text-sm', CATEGORY_STYLES)}>
            {verse.category}
          </span>
        </div>

        <h1 className="text-2xl font-bold leading-snug tracking-tight md:text-3xl">
          {verse.title}
        </h1>

        <p className="text-sm text-muted-foreground md:text-base">
          {verse.speaker}
        </p>
      </div>

      {/* Sanskrit */}
      <div className="mb-6 rounded-xl bg-muted/60 px-5 py-5 md:px-7 md:py-6">
        <p className="font-serif text-lg leading-relaxed whitespace-pre-line text-foreground md:text-xl md:leading-loose">
          {verse.sanskrit}
        </p>
      </div>

      {/* Translation */}
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground md:text-sm">
          Translation
        </p>
        <p className="text-sm leading-relaxed text-foreground md:text-base md:leading-loose">
          {verse.translation}
        </p>
      </div>

      {/* Intent summary */}
      <p className="mb-8 text-sm leading-relaxed text-muted-foreground md:text-base md:leading-loose">
        {verse.intent_summary}
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
          {tab === 'beginner' ? verse.beginner_explanation : verse.scholar_explanation}
        </p>
      </div>

      {/* Concepts */}
      {verse.concepts.length > 0 && (
        <div className="mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground md:text-sm">
            Concepts
          </p>
          <div className="flex flex-wrap gap-2">
            {verse.concepts.map(concept => (
              <span
                key={concept}
                className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground md:text-sm"
              >
                {concept}
              </span>
            ))}
          </div>
        </div>
      )}

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
