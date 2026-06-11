import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Guide — Satiyukti",
  description:
    "A short guide to navigating and practicing with the Vijñāna Bhairava Tantra verses.",
}

export default function GuidePage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 pt-8 pb-24 md:px-10 md:pt-10 md:pb-20">
      <p className="mb-6 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
        How to use this
      </p>

      <h1 className="mb-4 font-serif text-3xl leading-tight font-semibold tracking-tight md:text-4xl">
        A Guide to the Verses
      </h1>

      <p className="mb-10 text-base leading-relaxed text-muted-foreground md:leading-loose">
        The Vijñāna Bhairava Tantra contains 163 verses in total. Most of them —
        the famous 112 Dharanas — are standalone techniques. It is not meant to
        practice all 112 — but to choose one or two that suit your temperament
        and stay with them. This guide explains how to find your way in.
      </p>

      <div className="space-y-10 text-base leading-relaxed text-foreground md:leading-loose">
        {/* Structure */}
        <section>
          <h2 className="mb-4 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            The Three Parts
          </h2>
          <div className="space-y-3">
            <div className="rounded-xl bg-muted/60 px-5 py-4 md:px-6">
              <p className="mb-1 font-medium">Opening Inquiry (Verses 1–23)</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                A dialogue between Devi (the goddess) and Bhairava (a form of
                Shiva). Devi asks the great question: what is the nature of
                consciousness? These verses set the stage and are best read as
                context, not technique.
              </p>
            </div>
            <div className="rounded-xl bg-muted/60 px-5 py-4 md:px-6">
              <p className="mb-1 font-medium">
                The 112 Dharanas (Verses 24–138)
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                The heart of the text. Each verse is a self-contained technique
                — a <em>dharana</em> (a point of focus or contemplation).
                Techniques are grouped by theme: Breath, Sound, Visualization,
                Space, Body, Emotion, Dissolution, Awareness, and Nonduality.
              </p>
            </div>
            <div className="rounded-xl bg-muted/60 px-5 py-4 md:px-6">
              <p className="mb-1 font-medium">
                Closing Dialogue (Verses 139–163)
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Bhairava&apos;s closing remarks and Devi&apos;s response — a
                kind of affirmation and integration. Worth reading after you
                have spent time with the Dharanas.
              </p>
            </div>
          </div>
        </section>

        {/* Before You Begin */}
        <section>
          <h2 className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Before You Begin
          </h2>
          <p>
            Before moving into the techniques, spend time with the Opening
            Inquiry (Verses 1–23). Read it carefully. Notice how Devi&apos;s
            questions land in you — how closely they align with your own
            questions.
          </p>
          <p className="mt-4">
            This is an invitation to self-reflection before moving forward. The
            correct questions shapes whether the techniques bear fruit.
          </p>
        </section>

        {/* Navigation */}
        <section>
          <h2 className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Finding a Verse
          </h2>
          <p>
            Use the sidebar on the left (or tap the menu icon on mobile). Each
            of the three parts can be expanded. Inside the 112 Dharanas, you can
            drill into any of the nine categories — expand a category to see the
            individual verses within it.
          </p>
        </section>

        {/* Reading modes */}
        <section>
          <h2 className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Simple vs. Scholar
          </h2>
          <p>
            Each verse page has two reading modes, selectable at the top of the
            page:
          </p>
          <ul className="mt-4 space-y-3">
            <li className="flex gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-foreground" />
              <span>
                <span className="font-medium">Simple</span> — a plain-language
                explanation written for someone with no background in Kashmir
                Shaivism or Sanskrit philosophy. Start here.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-foreground" />
              <span>
                <span className="font-medium">Scholar</span> — a more detailed
                reading that engages with Sanskrit concepts, philosophical
                context, and traditional commentaries. Use this when you want to
                go deeper.
              </span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}
