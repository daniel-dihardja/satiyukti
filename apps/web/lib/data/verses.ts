import type { Category, EnrichedVerse } from '@/lib/types/verse'
import rawData from './vbt-enrichment.json'

export const allVerses: EnrichedVerse[] = rawData as EnrichedVerse[]

export const DHARANA_CATEGORIES: Category[] = [
  'Breath',
  'Sound',
  'Visualization',
  'Space',
  'Body',
  'Emotion',
  'Dissolution',
  'Awareness',
  'Nonduality',
]

export interface VerseGroups {
  opening: EnrichedVerse[]
  dharanas: Partial<Record<Category, EnrichedVerse[]>>
  closing: EnrichedVerse[]
}

export function getVerseGroups(): VerseGroups {
  const opening = allVerses.filter((v) => v.verse_number <= 23)
  const closing = allVerses.filter((v) => v.verse_number >= 139)
  const dharanaVerses = allVerses.filter(
    (v) => v.verse_number >= 24 && v.verse_number <= 138
  )

  const dharanas: Partial<Record<Category, EnrichedVerse[]>> = {}
  for (const cat of DHARANA_CATEGORIES) {
    const verses = dharanaVerses.filter((v) => v.category === cat)
    if (verses.length > 0) dharanas[cat] = verses
  }

  return { opening, dharanas, closing }
}

export function getVerse(number: number): EnrichedVerse | undefined {
  return allVerses.find((v) => v.verse_number === number)
}

export function getAllVerseNumbers(): number[] {
  return allVerses.map((v) => v.verse_number)
}
