import { notFound } from 'next/navigation'
import { getAllVerseNumbers, getVerse, getVerseDe } from '@/lib/data/verses'
import { VerseDetail } from './verse-detail'

export function generateStaticParams() {
  return getAllVerseNumbers().map(n => ({ number: String(n) }))
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

  const verseDe = getVerseDe(n)

  return <VerseDetail verseEn={verseEn} verseDe={verseDe} />
}
