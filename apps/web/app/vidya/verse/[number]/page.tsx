import { notFound } from 'next/navigation'
import { getAllVerseNumbers, getVerse } from '@/lib/data/verses'
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
  const verse = getVerse(parseInt(number, 10))
  if (!verse) notFound()

  return <VerseDetail verse={verse} />
}
