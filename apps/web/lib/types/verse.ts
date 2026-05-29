export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export type Category =
  | 'Breath'
  | 'Sound'
  | 'Visualization'
  | 'Space'
  | 'Body'
  | 'Emotion'
  | 'Dissolution'
  | 'Awareness'
  | 'Nonduality'
  | 'Dialogue'

export type PracticeType = 'contemplation' | 'meditation' | 'breathwork' | 'visualization'

export interface EnrichedVerse {
  verse_number: number
  page: number
  speaker: string
  sanskrit: string
  method_name: string
  category: Category
  summary: string
  difficulty: Difficulty
  practice_type: PracticeType
  focus_object: string
  primary_concepts: string[]
  secondary_concepts: string[]
  related_verses: number[]
  beginner_explanation: string
  developer_explanation: string
  tags: string[]
}
