from dataclasses import dataclass


@dataclass(frozen=True)
class EnrichedVerse:
    verse_number: int
    page: int
    speaker: str
    sanskrit: str
    method_name: str
    category: str
    summary: str
    difficulty: str
    practice_type: str
    focus_object: str
    primary_concepts: list[str]
    secondary_concepts: list[str]
    related_verses: list[int]
    beginner_explanation: str
    developer_explanation: str
    tags: list[str]


@dataclass
class EnrichmentReport:
    total_verses: int
    categories: dict[str, int]
    warnings: list[str]
