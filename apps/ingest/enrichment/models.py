from dataclasses import dataclass


@dataclass(frozen=True)
class EnrichedVerse:
    verse_number: int
    method_name: str
    category: str
    summary: str
    concepts: list[str]


@dataclass
class EnrichmentReport:
    total_verses: int
    categories: dict[str, int]
    warnings: list[str]
