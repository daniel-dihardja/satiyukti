"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import type { EnrichedVerse } from "@/lib/types/verse"
import { useLanguage } from "@/lib/context/language-context"

const CATEGORY_STYLES = "bg-secondary text-secondary-foreground"

type NavVerse = { number: number; title: string }

export function VerseDetail({
  verseEn,
  verseDe,
  verseId,
  prev,
  next,
}: {
  verseEn: EnrichedVerse
  verseDe?: EnrichedVerse
  verseId?: EnrichedVerse
  prev?: NavVerse | null
  next?: NavVerse | null
}) {
  const [tab, setTab] = useState<"beginner" | "scholar">("beginner")
  const { language } = useLanguage()
  const verse =
    language === "de" && verseDe
      ? verseDe
      : language === "id" && verseId
        ? verseId
        : verseEn

  return (
    <div className="mx-auto w-full max-w-2xl px-6 pt-4 pb-28 md:px-10 md:pt-6 md:pb-16">
      {/* Header */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground md:text-sm">
            Verse {verse.verse_number}
          </span>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium md:text-sm",
              CATEGORY_STYLES
            )}
          >
            {verse.category}
          </span>
        </div>

        <h1 className="text-2xl leading-snug font-bold tracking-tight md:text-3xl">
          {verse.title}
        </h1>

        <p className="text-sm text-muted-foreground md:text-base">
          {verse.speaker}
        </p>
      </div>

      {/* Sanskrit */}
      <div className="mb-4 rounded-xl bg-muted/60 px-5 py-5 md:px-7 md:py-6">
        <p className="font-serif text-lg leading-relaxed whitespace-pre-line text-foreground md:text-xl md:leading-loose">
          {verse.sanskrit}
        </p>
      </div>

      {/* Transliteration */}
      {verse.transliteration && (
        <div className="mb-6 px-1">
          <p className="font-mono text-xs leading-relaxed whitespace-pre-line text-muted-foreground italic md:text-sm md:leading-loose">
            {verse.transliteration}
          </p>
        </div>
      )}

      {/* Translation */}
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase md:text-sm">
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
        <div className="mb-4 flex w-fit gap-1 rounded-lg bg-muted p-1">
          <button
            onClick={() => setTab("beginner")}
            className={cn(
              "rounded-md px-4 py-1.5 text-xs font-medium transition-colors md:px-5 md:py-2 md:text-sm",
              tab === "beginner"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Simple
          </button>
          <button
            onClick={() => setTab("scholar")}
            className={cn(
              "rounded-md px-4 py-1.5 text-xs font-medium transition-colors md:px-5 md:py-2 md:text-sm",
              tab === "scholar"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Scholar
          </button>
        </div>

        <p className="text-sm leading-relaxed text-foreground md:text-base md:leading-loose">
          {tab === "beginner"
            ? verse.beginner_explanation
            : verse.scholar_explanation}
        </p>
      </div>

      {/* Related verses */}
      {verse.related_verses.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase md:text-sm">
            Related Verses
          </p>
          <div className="flex flex-wrap gap-2.5">
            {verse.related_verses.map((n) => (
              <Link
                key={n}
                href={`/vidya/verse/${n}`}
                className="flex h-10 w-12 items-center justify-center rounded-md border border-border bg-background font-mono text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground md:h-11 md:w-14 md:text-sm"
              >
                {n}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Prev / Next navigation — desktop only (mobile uses fixed bar below) */}
      {(prev || next) && (
        <div className="-mx-6 mt-12 hidden md:-mx-10 md:block">
          <div className="h-px bg-border" />
          <div className="grid grid-cols-2">
            {/* Prev */}
            {prev ? (
              <Link
                href={`/vidya/verse/${prev.number}`}
                className="group flex items-center gap-3 px-6 py-5 transition-colors hover:bg-muted/50 md:px-8 md:py-6"
              >
                <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                <div className="min-w-0">
                  <p className="mb-0.5 text-xs text-muted-foreground">
                    Verse {prev.number}
                  </p>
                  <p className="truncate text-sm leading-snug font-medium text-foreground">
                    {prev.title}
                  </p>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {/* Next */}
            {next ? (
              <Link
                href={`/vidya/verse/${next.number}`}
                className="group flex items-center justify-end gap-3 border-l border-border px-6 py-5 text-right transition-colors hover:bg-muted/50 md:px-8 md:py-6"
              >
                <div className="min-w-0">
                  <p className="mb-0.5 text-xs text-muted-foreground">
                    Verse {next.number}
                  </p>
                  <p className="truncate text-sm leading-snug font-medium text-foreground">
                    {next.title}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
              </Link>
            ) : (
              <div className="border-l border-border" />
            )}
          </div>
        </div>
      )}
      {/* Prev / Next navigation — mobile fixed bottom bar */}
      {(prev || next) && (
        <div className="fixed right-0 bottom-0 left-0 z-10 border-t border-border bg-background md:hidden">
          <div className="grid grid-cols-2">
            {prev ? (
              <Link
                href={`/vidya/verse/${prev.number}`}
                className="group flex items-center gap-2.5 px-4 py-3.5 active:bg-muted/50"
              >
                <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-active:text-foreground" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground">
                    Verse {prev.number}
                  </p>
                  <p className="truncate text-xs leading-snug font-medium text-foreground">
                    {prev.title}
                  </p>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {next ? (
              <Link
                href={`/vidya/verse/${next.number}`}
                className="group flex items-center justify-end gap-2.5 border-l border-border px-4 py-3.5 text-right active:bg-muted/50"
              >
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground">
                    Verse {next.number}
                  </p>
                  <p className="truncate text-xs leading-snug font-medium text-foreground">
                    {next.title}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-active:text-foreground" />
              </Link>
            ) : (
              <div className="border-l border-border" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
