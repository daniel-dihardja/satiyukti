import type { Category, EnrichedVerse } from "@/lib/types/verse"
import rawData from "./vbt-enrichment.json"
import rawDataDe from "./vbt-enrichment-de.json"
import rawDataId from "./vbt-enrichment-id.json"

export const allVerses: EnrichedVerse[] = rawData as unknown as EnrichedVerse[]
export const allVersesDe: EnrichedVerse[] =
  rawDataDe as unknown as EnrichedVerse[]
export const allVersesId: EnrichedVerse[] =
  rawDataId as unknown as EnrichedVerse[]

export const DHARANA_CATEGORIES: Category[] = [
  "Breath",
  "Sound",
  "Visualization",
  "Space",
  "Body",
  "Emotion",
  "Dissolution",
  "Awareness",
  "Nonduality",
]

export interface VerseGroups {
  opening: EnrichedVerse[]
  dharanas: Partial<Record<Category, EnrichedVerse[]>>
  closing: EnrichedVerse[]
}

export function getVerseGroups(
  verses: EnrichedVerse[] = allVerses
): VerseGroups {
  const opening = verses.filter((v) => v.verse_number <= 23)
  const closing = verses.filter((v) => v.verse_number >= 139)
  const dharanaVerses = verses.filter(
    (v) => v.verse_number >= 24 && v.verse_number <= 138
  )

  const dharanas: Partial<Record<Category, EnrichedVerse[]>> = {}
  for (const cat of DHARANA_CATEGORIES) {
    const filtered = dharanaVerses.filter((v) => v.category === cat)
    if (filtered.length > 0) dharanas[cat] = filtered
  }

  return { opening, dharanas, closing }
}

export function getVerse(number: number): EnrichedVerse | undefined {
  return allVerses.find((v) => v.verse_number === number)
}

export function getVerseDe(number: number): EnrichedVerse | undefined {
  return allVersesDe.find((v) => v.verse_number === number)
}

export function getVerseId(number: number): EnrichedVerse | undefined {
  return allVersesId.find((v) => v.verse_number === number)
}

export function getAllVerseNumbers(): number[] {
  return allVerses.map((v) => v.verse_number)
}
