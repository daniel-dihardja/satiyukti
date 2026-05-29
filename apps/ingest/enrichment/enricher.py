import json
import logging
from dataclasses import asdict
from pathlib import Path

from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from pydantic import BaseModel

from extraction.models import Verse
from enrichment.models import EnrichedVerse, EnrichmentReport

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = """\
You are a scholar of Kashmir Shaivism and the Vijñāna Bhairava Tantra (VBT), a non-dual Tantric text containing 112 dharanas (meditation methods) presented as a dialogue between Bhairava and Devi.

Text structure:
- Verses 1-6: Devi's opening questions about Bhairava's nature
- Verses 7-23: Bhairava explains his non-dual nature
- Verses 24-135 (approx): The 112 dharanas — direct meditation techniques
- Verses 136-163 (approx): Concluding dialogue and blessings

The Sanskrit may contain OCR artifacts but retains its structural meaning.

For each verse produce ALL of the following fields:

method_name:
- Dharana verses: a concise English technique name (e.g., "Breath Suspension at Junction", "Inner Sound Dissolution")
- Dialogue verses: a descriptive title (e.g., "Devi Questions Bhairava's True Form")

category — use EXACTLY one of:
- "Breath" — pranayama, breath suspension, kumbhaka, prana movement, transitions between breaths
- "Sound" — nada, mantra, inner sound, shabda, AUM, resonance
- "Space" — akasha, void, emptiness, infinite space, sky, chidakasha
- "Awareness" — pure consciousness, witness, turiya, self-luminous awareness, undivided attention
- "Visualization" — form, light visualization, mandala, yantra, trataka, inner image
- "Body" — tactile sensation, touch, proprioception, physical sensation, body boundary
- "Emotion" — bhakti, devotion, joy, bliss, intense emotion, wonder, aesthetic rapture
- "Nonduality" — advaita, dissolution of subject-object duality, Bhairava-nature, unity consciousness
- "Dissolution" — laya, absorption, merging into source, dissolution of mind, samadhi
- "Dialogue" — introductory or concluding dialogue, theological question, not a dharana technique

summary: one sentence distilling the verse's core meaning or instruction.

difficulty — EXACTLY one of: "beginner", "intermediate", "advanced"
- beginner: accessible, concrete, minimal prerequisite knowledge
- intermediate: requires some meditation experience or conceptual familiarity
- advanced: subtle, non-dual, or requires sustained practice to approach

practice_type — EXACTLY one of: "contemplation", "meditation", "breathwork", "visualization"
- contemplation: intellectual or reflective inquiry
- meditation: sustained inward attention or absorption
- breathwork: explicit use of breath as the primary vehicle
- visualization: use of mental imagery or inner forms

focus_object: the single primary object of attention the practice directs the practitioner toward (e.g., "breath gap", "inner sound", "infinite space", "awareness itself").

primary_concepts: 2–5 core concepts explicitly expressed in this verse (Sanskrit terms welcome).
secondary_concepts: 1–4 supporting or implied concepts not directly stated but relevant to understanding.

related_verses: verse numbers (integers, 1–163) that are thematically or technically linked to this verse. Use an empty list if none are strongly related.

beginner_explanation: 2–4 sentences accessible to a complete newcomer — avoid jargon, use plain language and analogy.
developer_explanation: 2–4 sentences for a practitioner or scholar — include Sanskrit terms, philosophical nuance, and cross-references to doctrine where relevant.

tags: 3–8 flat, lowercase, searchable labels (e.g., ["breath", "kumbhaka", "advanced", "nondual"]).\
"""

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


class _VerseEnrichment(BaseModel):
    verse_number: int
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


class _BatchEnrichment(BaseModel):
    enrichments: list[_VerseEnrichment]


def _make_chain():
    llm = ChatOpenAI(model="gpt-5.4", temperature=0)
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", _SYSTEM_PROMPT),
            ("human", "{verses}"),
        ]
    )
    return prompt | llm.with_structured_output(_BatchEnrichment)


def enrich_verses(verses: list[Verse], batch_size: int = 10) -> list[EnrichedVerse]:
    chain = _make_chain()
    enriched: list[EnrichedVerse] = []
    batches = [verses[i : i + batch_size] for i in range(0, len(verses), batch_size)]

    for idx, batch in enumerate(batches):
        logger.info(
            "enriching batch %d/%d (verses %d-%d)",
            idx + 1,
            len(batches),
            batch[0].verse_number,
            batch[-1].verse_number,
        )

        verses_text = "\n\n".join(
            f"Verse {v.verse_number} (speaker: {v.speaker}):\n{v.sanskrit}"
            for v in batch
        )

        result: _BatchEnrichment = chain.invoke({"verses": verses_text})

        for item in result.enrichments:
            enriched.append(
                EnrichedVerse(
                    verse_number=item.verse_number,
                    method_name=item.method_name,
                    category=item.category,
                    summary=item.summary,
                    difficulty=item.difficulty,
                    practice_type=item.practice_type,
                    focus_object=item.focus_object,
                    primary_concepts=item.primary_concepts,
                    secondary_concepts=item.secondary_concepts,
                    related_verses=item.related_verses,
                    beginner_explanation=item.beginner_explanation,
                    developer_explanation=item.developer_explanation,
                    tags=item.tags,
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
    output_dir: Path,
) -> None:
    output_dir.mkdir(exist_ok=True)

    with open(output_dir / "vbt-enrichment.json", "w") as f:
        json.dump([asdict(e) for e in enriched], f, indent=2, ensure_ascii=False)

    with open(output_dir / "vbt-enrichment-report.json", "w") as f:
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
