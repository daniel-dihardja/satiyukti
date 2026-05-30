import json
import logging
from dataclasses import asdict, dataclass
from pathlib import Path

from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from pydantic import BaseModel

from extraction.models import Verse
from enrichment.models import EnrichedVerse, EnrichmentReport

logger = logging.getLogger(__name__)

_VALID_CATEGORIES = frozenset(
    {
        "Breath",
        "Sound",
        "Space",
        "Awareness",
        "Visualization",
        "Body",
        "Emotion",
        "Nonduality",
        "Dissolution",
        "Dialogue",
    }
)


@dataclass
class LanguageConfig:
    code: str
    system_prompt: str
    verse_label: str
    speaker_label: str


class _VerseEnrichment(BaseModel):
    verse_number: int
    title: str
    category: str
    translation: str
    intent_summary: str
    beginner_explanation: str
    scholar_explanation: str
    concepts: list[str]
    related_verses: list[int]


class _BatchEnrichment(BaseModel):
    enrichments: list[_VerseEnrichment]


def _make_chain(config: LanguageConfig):
    llm = ChatOpenAI(model="gpt-5.4", temperature=0)
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", config.system_prompt),
            ("human", "{verses}"),
        ]
    )
    return prompt | llm.with_structured_output(_BatchEnrichment)


def enrich_verses(
    verses: list[Verse],
    config: LanguageConfig,
    batch_size: int = 10,
) -> list[EnrichedVerse]:
    chain = _make_chain(config)
    enriched: list[EnrichedVerse] = []
    batches = [verses[i : i + batch_size] for i in range(0, len(verses), batch_size)]

    for idx, batch in enumerate(batches):
        logger.info(
            "enriching batch %d/%d (verses %d-%d) [%s]",
            idx + 1,
            len(batches),
            batch[0].verse_number,
            batch[-1].verse_number,
            config.code,
        )

        verses_text = "\n\n".join(
            f"{config.verse_label} {v.verse_number} ({config.speaker_label}: {v.speaker}):\n{v.sanskrit}"
            for v in batch
        )

        result: _BatchEnrichment = chain.invoke({"verses": verses_text})

        source_map = {v.verse_number: v for v in batch}
        for item in result.enrichments:
            source = source_map.get(item.verse_number)
            enriched.append(
                EnrichedVerse(
                    verse_number=item.verse_number,
                    speaker=source.speaker if source else "",
                    title=item.title,
                    category=item.category,
                    sanskrit=source.sanskrit if source else "",
                    translation=item.translation,
                    intent_summary=item.intent_summary,
                    beginner_explanation=item.beginner_explanation,
                    scholar_explanation=item.scholar_explanation,
                    concepts=item.concepts,
                    related_verses=item.related_verses,
                )
            )

        logger.info(
            "batch %d done — %d enrichments returned", idx + 1, len(result.enrichments)
        )

    return sorted(enriched, key=lambda v: v.verse_number)


def build_report(
    enriched: list[EnrichedVerse], source_verses: list[Verse]
) -> EnrichmentReport:
    source_nums = {v.verse_number for v in source_verses}
    enriched_nums = {e.verse_number for e in enriched}

    categories: dict[str, int] = {}
    for e in enriched:
        categories[e.category] = categories.get(e.category, 0) + 1

    warnings: list[str] = []
    missing = sorted(source_nums - enriched_nums)
    extra = sorted(enriched_nums - source_nums)
    invalid = sorted(
        e.verse_number for e in enriched if e.category not in _VALID_CATEGORIES
    )

    if missing:
        warnings.append(f"Missing enrichment for verse numbers: {missing}")
    if extra:
        warnings.append(f"Enrichments reference unknown verse numbers: {extra}")
    if invalid:
        warnings.append(f"Invalid categories on verse numbers: {invalid}")

    return EnrichmentReport(
        total_verses=len(enriched),
        categories=dict(sorted(categories.items())),
        warnings=warnings,
    )


def write_enrichment(
    enriched: list[EnrichedVerse],
    report: EnrichmentReport,
    config: LanguageConfig,
    output_dir: Path,
) -> None:
    output_dir.mkdir(exist_ok=True)

    with open(output_dir / f"vbt-enrichment-{config.code}.json", "w") as f:
        json.dump([asdict(e) for e in enriched], f, indent=2, ensure_ascii=False)

    with open(output_dir / f"vbt-enrichment-{config.code}-report.json", "w") as f:
        json.dump(
            {
                "total_verses": report.total_verses,
                "categories": report.categories,
                "warnings": report.warnings,
            },
            f,
            indent=2,
        )

    logger.info("wrote %d enriched verses to %s", len(enriched), output_dir)
