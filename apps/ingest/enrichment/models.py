from dataclasses import dataclass


from dataclasses import dataclass


@dataclass(frozen=True)
class EnrichedVerse:
    # Canonical verse number within the scripture.
    verse_number: int

    # Speaker of the verse.
    # In the Vijnana Bhairava Tantra this is typically:
    # - Devi (questioning)
    # - Bhairava (teaching/responding)
    # Useful for dialogue navigation and contextual understanding.
    speaker: str

    # Human-readable title describing the meditation method or core teaching.
    # Example: "Meditation on Dissolving Sound"
    title: str

    # High-level category used for navigation and grouping.
    # Example: Breath, Sound, Awareness, Nonduality, Space.
    category: str

    # Original Sanskrit text of the verse.
    sanskrit: str

    # IAST romanized Sanskrit transliteration of the verse.
    # Uses diacritical marks; preserves half-verse breaks (|) and verse-end markers (||).
    transliteration: str

    # Faithful translation of the Sanskrit verse in the target language.
    # This should remain close to the source text.
    translation: str

    # Concise description of the practical intention of the verse.
    # Answers: "What is this verse trying to teach or have the practitioner do?"
    intent_summary: str

    # Beginner-friendly explanation written in simple, accessible language.
    # Serves as an entry point for users unfamiliar with the tradition.
    beginner_explanation: str

    # More advanced explanation providing philosophical, historical,
    # or doctrinal context for experienced readers.
    scholar_explanation: str

    # Reusable ontology concepts present in the verse.
    # These become graph nodes and enable search, recommendations,
    # semantic relationships, and AI retrieval.
    # Example: ["awareness", "silence", "sound"]
    concepts: list[str]

    # Verse numbers that are semantically related to this verse.
    # Used for navigation, recommendations, and graph relationships.
    related_verses: list[int]


@dataclass
class EnrichmentReport:
    total_verses: int
    categories: dict[str, int]
    warnings: list[str]
