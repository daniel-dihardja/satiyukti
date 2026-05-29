from dataclasses import dataclass


@dataclass(frozen=True)
class Page:
    page: int
    text: str
    sanskrit: str


@dataclass(frozen=True)
class Verse:
    verse_number: int
    page: int
    speaker: str
    sanskrit: str


@dataclass(frozen=True)
class ValidationReport:
    total_verses: int
    missing_verses: list[int]
    duplicate_verses: list[int]
    warnings: list[str]
