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
  verseId,
  prev,
  next,
}: {
  verseEn: EnrichedVerse
  verseId?: EnrichedVerse
  prev?: NavVerse | null
  next?: NavVerse | null
}) {
  const [tab, setTab] = useState<"beginner" | "scholar">("beginner")
  const { language } = useLanguage()
  const verse = language === "id" && verseId ? verseId : verseEn

  return (
    <div className="mx-auto w-full max-w-2xl px-6 pt-4 pb-28 md:px-10 md:pt-6 md:pb-16">
      {/* Header */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm text-muted-foreground">
            Verse {verse.verse_number}
          </span>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-sm font-medium",
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

      {/* Explanation tabs */}
      <div className="mb-8">
        <div
          role="tablist"
          className="mb-4 flex w-fit gap-1 rounded-lg bg-muted p-1"
        >
          <button
            id="tab-beginner"
            role="tab"
            aria-selected={tab === "beginner"}
            aria-controls="panel-beginner"
            onClick={() => setTab("beginner")}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none md:px-5 md:py-2",
              tab === "beginner"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Simple
          </button>
          <button
            id="tab-scholar"
            role="tab"
            aria-selected={tab === "scholar"}
            aria-controls="panel-scholar"
            onClick={() => setTab("scholar")}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none md:px-5 md:py-2",
              tab === "scholar"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Scholar
          </button>
        </div>

        <div
          id={tab === "beginner" ? "panel-beginner" : "panel-scholar"}
          role="tabpanel"
          aria-labelledby={tab === "beginner" ? "tab-beginner" : "tab-scholar"}
          tabIndex={0}
          className="focus-visible:outline-none"
        >
          <p className="text-base leading-relaxed text-foreground md:leading-loose">
            {tab === "beginner"
              ? verse.beginner_explanation
              : verse.scholar_explanation}
          </p>
        </div>
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
          <p className="font-mono text-sm leading-relaxed whitespace-pre-line text-muted-foreground italic md:leading-loose">
            {verse.transliteration}
          </p>
        </div>
      )}

      {/* Translation */}
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase md:text-sm">
          Translation
        </p>
        <p className="text-base leading-relaxed text-foreground md:leading-loose">
          {verse.translation}
        </p>
      </div>

      {/* Intent summary */}
      <p className="mb-8 text-base leading-relaxed text-muted-foreground md:leading-loose">
        {verse.intent_summary}
      </p>

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
                href={`/vbt/verse/${n}`}
                aria-label={`Verse ${n}`}
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
        <nav
          aria-label="Verse navigation"
          className="-mx-6 mt-12 hidden md:-mx-10 md:block"
        >
          <div className="h-px bg-border" />
          <div className="grid grid-cols-2">
            {/* Prev */}
            {prev ? (
              <Link
                href={`/vbt/verse/${prev.number}`}
                className="group flex items-center gap-3 px-6 py-4.5 transition-colors hover:bg-muted/50 md:px-8 md:py-5.5"
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
                href={`/vbt/verse/${next.number}`}
                className="group flex items-center justify-end gap-3 border-l border-border px-6 py-4.5 text-right transition-colors hover:bg-muted/50 md:px-8 md:py-5.5"
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
        </nav>
      )}
      {/* Prev / Next navigation — mobile tab bar */}
      {(prev || next) && (
        <nav
          aria-label="Verse navigation"
          className="fixed right-0 bottom-0 left-0 z-10 border-t border-border bg-background shadow-[0_-4px_16px_rgba(0,0,0,0.08)] md:hidden"
        >
          <div className="grid grid-cols-2">
            {prev ? (
              <Link
                href={`/vbt/verse/${prev.number}`}
                className="flex items-start gap-2.5 px-4 pt-3.5 transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-inset active:bg-muted/50"
                style={{
                  paddingBottom: "calc(2.25rem + env(safe-area-inset-bottom))",
                }}
              >
                <ChevronLeft className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                    Previous
                  </p>
                  <p className="truncate text-xs font-medium text-foreground">
                    {prev.title}
                  </p>
                </div>
              </Link>
            ) : (
              <div
                style={{
                  paddingBottom: "calc(2.25rem + env(safe-area-inset-bottom))",
                }}
              />
            )}

            {next ? (
              <Link
                href={`/vbt/verse/${next.number}`}
                className="flex items-start justify-end gap-2.5 border-l border-border px-4 pt-3.5 text-right transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-inset active:bg-muted/50"
                style={{
                  paddingBottom: "calc(2.25rem + env(safe-area-inset-bottom))",
                }}
              >
                <div className="min-w-0">
                  <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                    Next
                  </p>
                  <p className="truncate text-xs font-medium text-foreground">
                    {next.title}
                  </p>
                </div>
                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            ) : (
              <div
                className="border-l border-border"
                style={{
                  paddingBottom: "calc(2.25rem + env(safe-area-inset-bottom))",
                }}
              />
            )}
          </div>
        </nav>
      )}
    </div>
  )
}
