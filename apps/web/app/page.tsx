import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

export default function Page() {
  return (
    <div className="flex min-h-svh items-center justify-center px-6 py-16">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 text-center">
        {/* Eyebrow */}
        <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          Kashmir Shaivism · ~8th Century CE
        </p>

        {/* Sanskrit title */}
        <div className="flex flex-col items-center gap-1">
          <p className="font-serif text-sm tracking-wide text-muted-foreground/70 italic md:text-base">
            विज्ञान भैरव तन्त्र
          </p>
          <p className="text-sm text-muted-foreground/70">
            Vijñāna Bhairava Tantra
          </p>
        </div>

        {/* Headline */}
        <h1 className="text-5xl leading-tight font-semibold tracking-tight sm:text-6xl md:text-7xl">
          <span className="text-primary">112</span> Doorways
          <br className="hidden sm:block" /> to Pure Awareness
        </h1>

        {/* Description */}
        <p className="max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
          One of humanity&apos;s oldest maps of consciousness. Explore 112
          meditation techniques spanning breath, sound, visualization, and the
          dissolution of self — with a guide who meets you wherever you are on
          the path.
        </p>

        {/* CTA */}
        <Button asChild size="lg" className="mt-2 gap-2 px-8">
          <Link href="/vbt">
            Begin Exploring
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
