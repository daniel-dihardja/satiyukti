import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

const TOPICS = [
  "Breath",
  "Sound",
  "Visualization",
  "Space",
  "Body",
  "Emotion",
  "Dissolution",
  "Awareness",
  "Non-duality",
]

export default function Page() {
  return (
    <div className="flex min-h-svh items-center justify-center px-6 py-16">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 text-center">

        {/* Eyebrow */}
        <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          Kashmir Shaivism · ~8th Century CE
        </p>

        {/* Sanskrit title */}
        <p className="font-serif text-sm italic tracking-wide text-muted-foreground/70 md:text-base">
          विज्ञान भैरव तन्त्र
        </p>

        {/* Headline */}
        <h1 className="text-5xl font-semibold leading-tight tracking-tight sm:text-6xl md:text-7xl">
          <span className="text-primary">112</span> Doorways
          <br className="hidden sm:block" />
          {" "}to Pure Awareness
        </h1>

        {/* Description */}
        <p className="max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
          One of humanity&apos;s oldest maps of consciousness. Explore 112
          meditation techniques spanning breath, sound, visualization, and the
          dissolution of self — with a guide who meets you wherever you are on
          the path.
        </p>

        {/* Topic chips */}
        <div className="flex flex-wrap justify-center gap-2">
          {TOPICS.map((topic) => (
            <span
              key={topic}
              className="rounded-full border border-border bg-secondary px-3.5 py-1 text-xs font-medium text-secondary-foreground"
            >
              {topic}
            </span>
          ))}
        </div>

        {/* CTA */}
        <Link href="/vidya">
          <Button size="lg" className="mt-2 gap-2 px-8">
            Begin Exploring
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>

      </div>
    </div>
  )
}
