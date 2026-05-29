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

LANG = "de"

_SYSTEM_PROMPT = """\
Du bist ein Gelehrter des Kaschmirischen Shaivismus und des Vijñāna Bhairava Tantra (VBT), einem nicht-dualen Tantra-Text mit 112 Dharanas (Meditationsmethoden), dargestellt als Dialog zwischen Bhairava und Devi.

Textstruktur:
- Verse 1–6: Devis einleitende Fragen über Bhairavaas Wesen
- Verse 7–23: Bhairava erklärt seine nicht-duale Natur
- Verse 24–135 (ca.): Die 112 Dharanas — direkte Meditationstechniken
- Verse 136–163 (ca.): Abschließender Dialog und Segnungen

Das Sanskrit kann OCR-Artefakte enthalten, behält aber seine strukturelle Bedeutung.

Erstelle ALLE Ausgabefelder auf Deutsch. Enum-Werte (category, difficulty, practice_type) bleiben auf Englisch, da sie als strukturierte Datenschlüssel verwendet werden.

Für jeden Vers erstelle ALLE der folgenden Felder:

method_name:
- Dharana-Verse: ein prägnanter deutscher Technikname (z. B. „Atemhaltung im Übergang", „Auflösung im inneren Klang")
- Dialog-Verse: ein beschreibender Titel (z. B. „Devi befragt Bhairavaas wahre Gestalt")

category — verwende GENAU einen der folgenden Werte (auf Englisch):
- "Breath" — Pranayama, Atemhaltung, Kumbhaka, Prana-Bewegung
- "Sound" — Nada, Mantra, innerer Klang, Shabda, AUM
- "Space" — Akasha, Leere, unendlicher Raum, Himmel, Chidakasha
- "Awareness" — reines Bewusstsein, Zeuge, Turiya, selbst-leuchtendes Gewahrsein
- "Visualization" — Form, Lichtvisualisierung, Mandala, Yantra
- "Body" — taktile Empfindung, Berührung, Propriozeption, Körpergrenze
- "Emotion" — Bhakti, Hingabe, Freude, Seligkeit, intensive Emotion, Ehrfurcht
- "Nonduality" — Advaita, Auflösung von Subjekt-Objekt-Dualität, Bhairava-Natur
- "Dissolution" — Laya, Absorption, Verschmelzung mit der Quelle, Samadhi
- "Dialogue" — einleitender oder abschließender Dialog, theologische Frage

summary: ein Satz, der den Kerngehalt oder die Kernaussage des Verses auf Deutsch zusammenfasst.

difficulty — GENAU einer der folgenden Werte (auf Englisch): "beginner", "intermediate", "advanced"

practice_type — GENAU einer der folgenden Werte (auf Englisch): "contemplation", "meditation", "breathwork", "visualization"

focus_object: das einzelne primäre Aufmerksamkeitsobjekt der Praxis auf Deutsch (z. B. „Atempause", „innerer Klang", „unendlicher Raum", „reines Gewahrsein").

primary_concepts: 2–5 Kernkonzepte, die in diesem Vers explizit ausgedrückt werden (Sanskrit-Begriffe willkommen, mit kurzer deutscher Erläuterung).
secondary_concepts: 1–4 unterstützende oder implizite Konzepte, die nicht direkt genannt werden, aber zum Verständnis relevant sind.

related_verses: Versnummern (ganze Zahlen, 1–163), die thematisch oder technisch mit diesem Vers verbunden sind. Leere Liste, falls keine stark verwandt sind.

beginner_explanation: 2–4 Sätze auf Deutsch, zugänglich für völlige Neueinsteiger — kein Fachjargon, klare Sprache und Analogien.
developer_explanation: 2–4 Sätze auf Deutsch für Praktizierende oder Gelehrte — Sanskrit-Begriffe, philosophische Nuancen und Querverweise zur Lehre.

tags: 3–8 flache, kleingeschriebene, durchsuchbare Schlagwörter auf Deutsch (z. B. ["atem", "kumbhaka", "fortgeschritten", "nicht-dual"]).\
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
            f"Vers {v.verse_number} (Sprecher: {v.speaker}):\n{v.sanskrit}"
            for v in batch
        )

        result: _BatchEnrichment = chain.invoke({"verses": verses_text})

        source_map = {v.verse_number: v for v in batch}
        for item in result.enrichments:
            source = source_map.get(item.verse_number)
            enriched.append(
                EnrichedVerse(
                    verse_number=item.verse_number,
                    page=source.page if source else 0,
                    speaker=source.speaker if source else "",
                    sanskrit=source.sanskrit if source else "",
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
            "batch %d fertig — %d Anreicherungen zurückgegeben", idx + 1, len(result.enrichments)
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
        warnings.append(f"Fehlende Anreicherung für Versnummern: {missing}")
    if extra:
        warnings.append(f"Anreicherungen referenzieren unbekannte Versnummern: {extra}")
    if invalid:
        warnings.append(f"Ungültige Kategorien bei Versnummern: {invalid}")

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

    with open(output_dir / f"vbt-enrichment-{LANG}.json", "w") as f:
        json.dump([asdict(e) for e in enriched], f, indent=2, ensure_ascii=False)

    with open(output_dir / f"vbt-enrichment-{LANG}-report.json", "w") as f:
        json.dump(
            {
                "total_verses": report.total_verses,
                "categories": report.categories,
                "warnings": report.warnings,
            },
            f,
            indent=2,
        )

    logger.info("schrieb %d angereicherte Verse nach %s", len(enriched), output_dir)
