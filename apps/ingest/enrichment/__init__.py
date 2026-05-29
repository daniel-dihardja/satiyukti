from enrichment import de, en, id as id_
from enrichment.models import EnrichedVerse, EnrichmentReport

# Default language is English
from enrichment.en.enricher import build_report, enrich_verses, write_enrichment

LANGUAGES = {
    "en": en,
    "de": de,
    "id": id_,
}

__all__ = [
    "EnrichedVerse",
    "EnrichmentReport",
    "enrich_verses",
    "build_report",
    "write_enrichment",
    "LANGUAGES",
]
