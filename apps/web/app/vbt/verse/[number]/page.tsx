import { notFound } from "next/navigation"
import {
  getAllVerseNumbers,
  getVerse,
  getVerseId,
} from "@/lib/data/verses"
import { VerseDetail } from "./verse-detail"

export function generateStaticParams() {
  return getAllVerseNumbers().map((n) => ({ number: String(n) }))
}

export default async function VersePage({
  params,
}: {
  params: Promise<{ number: string }>
}) {
  const { number } = await params
  const n = parseInt(number, 10)
  const verseEn = getVerse(n)
  if (!verseEn) notFound()

  const verseId = getVerseId(n)

  const all = getAllVerseNumbers()
  const idx = all.indexOf(n)
  const prevNumber = idx > 0 ? all[idx - 1] : null
  const nextNumber = idx < all.length - 1 ? all[idx + 1] : null

  const prevVerse = prevNumber != null ? getVerse(prevNumber) : null
  const nextVerse = nextNumber != null ? getVerse(nextNumber) : null

  return (
    <VerseDetail
      verseEn={verseEn}
      verseId={verseId}
      prev={
        prevVerse
          ? { number: prevVerse.verse_number, title: prevVerse.title }
          : null
      }
      next={
        nextVerse
          ? { number: nextVerse.verse_number, title: nextVerse.title }
          : null
      }
    />
  )
}
