import type { Metadata } from "next"
import Link from "next/link"
import { BookOpen, Info, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Vijñāna Bhairava Tantra — Satiyukti",
  description:
    "A modern companion for the Vijñāna Bhairava Tantra — 163 verses, 112 meditation techniques from the Kashmir Shaivite tradition.",
}

export default function VbtStartPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 pt-10 pb-24 md:px-10 md:pt-16 md:pb-28">
      <p className="mb-6 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
        विज्ञान भैरव तंत्र
      </p>

      <h1 className="mb-4 font-serif text-3xl leading-tight font-semibold tracking-tight md:text-4xl">
        Vijñāna Bhairava Tantra
      </h1>

      <p className="mb-12 text-base leading-relaxed text-muted-foreground md:leading-loose">
        A text composed roughly 1,200 years ago within the Kashmir Shaivite
        tradition. It contains 163 verses — including 112 precise,
        self-contained techniques called <em>dharanas</em>. Not doctrine or
        belief, but direct methods for touching the nature of consciousness
        itself.
      </p>

      {/* About & Guide cards */}
      <div className="mb-12 grid gap-3 sm:grid-cols-2">
        <Link
          href="/vbt/about"
          className="group flex flex-col gap-2 rounded-xl border bg-muted/40 px-5 py-4 transition-colors hover:bg-muted/70 md:px-6"
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <Info
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            About
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The motivation and vision behind Satiyukti — why this app exists.
          </p>
        </Link>

        <Link
          href="/vbt/guide"
          className="group flex flex-col gap-2 rounded-xl border bg-muted/40 px-5 py-4 transition-colors hover:bg-muted/70 md:px-6"
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <BookOpen
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            Guide
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            How to navigate the three parts of the text and work with the verses
            in practice.
          </p>
        </Link>
      </div>

      {/* CTA */}
      <div className="flex justify-center sm:justify-start">
        <Link
          href="/vbt/verse/1"
          className="inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-80"
        >
          Begin at Verse 1
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
