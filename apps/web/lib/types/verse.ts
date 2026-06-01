export type Category =
  | "Breath"
  | "Sound"
  | "Visualization"
  | "Space"
  | "Body"
  | "Emotion"
  | "Dissolution"
  | "Awareness"
  | "Nonduality"
  | "Dialogue"

export interface EnrichedVerse {
  verse_number: number
  speaker: string
  title: string
  category: Category
  sanskrit: string
  transliteration: string
  translation: string
  intent_summary: string
  beginner_explanation: string
  scholar_explanation: string
  concepts: string[]
  related_verses: number[]
}
