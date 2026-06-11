import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About — Satiyukti",
  description:
    "The motivation and vision behind Satiyukti — a modern companion for the Vijñāna Bhairava Tantra.",
}

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 pt-8 pb-24 md:px-10 md:pt-10 md:pb-20">
      <p className="mb-6 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
        About Satiyukti
      </p>

      <h1 className="mb-3 font-serif text-3xl leading-tight font-semibold tracking-tight md:text-4xl">
        Why This Exists
      </h1>

      <p className="mb-10 text-sm text-muted-foreground italic">
        <span className="font-serif">सतियुक्ति</span> — Satiyukti
        —&nbsp;&quot;the right method, the true approach&quot;
      </p>

      <div className="space-y-10 text-base leading-relaxed text-foreground md:leading-loose">
        <section>
          <h2 className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            About Me
          </h2>
          <p>
            I am half Indonesian, half German — born in Germany and raised in
            Indonesia from 1982 – 1999. Indonesia is the largest Muslim country
            in the world, yet in daily life you still feel the Hindu influence
            everywhere. Not through formal practice, but through the texture of
            the culture: school lessons about the ancient Hindu kingdoms of
            Nusantara, cultural performances, a kind of living mythology woven
            into ordinary life.
          </p>
          <p className="mt-4">
            A quiet interest took root during those years — one that would
            resurface much later.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            The Beginning
          </h2>
          <p>
            Twenty-five years later, when I wanted to start meditating, I did
            what most people do — I watched YouTube videos and browsed the
            internet. But nothing I found aligned with the impression of
            spirituality I had carried since my time in Indonesia. The content
            felt shallow, repackaged, unconvincing. None of it made me want to
            actually begin.
          </p>
          <p className="mt-4">
            That sent me looking for the original scriptures. I eventually found
            the Vijñāna Bhairava Tantra — a text composed roughly 1,200 years
            ago containing 112 precise, actionable techniques for touching the
            nature of consciousness itself. Not doctrine, not belief, but direct
            experimentation. I then began using AI to work with those scriptures
            more deeply, and Satiyukti grew from that process.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            The Problem
          </h2>
          <p>
            Today, spirituality and wellness have largely merged. The dominant
            entry point has become self-optimization — better focus, less
            stress, more balance. These are real needs, but they are not what
            drew the ancient contemplatives to texts like the VBT. Those
            teachers were asking a different kind of question entirely. This app
            is an attempt to make that older current a little easier to reach.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            The Vision
          </h2>
          <p>
            Satiyukti is an attempt to build that bridge — a modern interface
            for an ancient map of consciousness. Each verse is presented with
            two layers of reading: a plain-language explanation for newcomers,
            and a scholarly reading for those who want depth.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            The Name
          </h2>
          <p>
            <span className="font-medium">Satiyukti</span> comes from Sanskrit:{" "}
            <em>sati</em> (true, correct) and <em>yukti</em> (method, device,
            technique). It felt right for a project built around the original
            technical manual of consciousness — a collection of precise inner
            methods handed down across generations.
          </p>
        </section>
      </div>
    </div>
  )
}
