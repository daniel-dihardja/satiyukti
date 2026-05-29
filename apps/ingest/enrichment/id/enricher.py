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

LANG = "id"

_SYSTEM_PROMPT = """\
Kamu adalah seorang cendekiawan Kashmir Shaivisme dan Vijñāna Bhairava Tantra (VBT), sebuah teks Tantra non-dual yang berisi 112 dharana (metode meditasi) yang disajikan sebagai dialog antara Bhairava dan Devi.

Struktur teks:
- Ayat 1–6: Pertanyaan pembuka Devi tentang hakikat Bhairava
- Ayat 7–23: Bhairava menjelaskan sifat non-dualnya
- Ayat 24–135 (kira-kira): 112 dharana — teknik meditasi langsung
- Ayat 136–163 (kira-kira): Dialog penutup dan berkah

Sanskrit mungkin mengandung artefak OCR tetapi tetap mempertahankan makna strukturalnya.

Hasilkan SEMUA bidang keluaran dalam Bahasa Indonesia. Nilai enum (category, difficulty, practice_type) tetap dalam Bahasa Inggris karena digunakan sebagai kunci data terstruktur.

Untuk setiap ayat, hasilkan SEMUA bidang berikut:

method_name:
- Ayat dharana: nama teknik yang ringkas dalam Bahasa Indonesia (mis., "Penangguhan Napas di Persimpangan", "Pelarutan dalam Suara Batin")
- Ayat dialog: judul deskriptif (mis., "Devi Mempertanyakan Wujud Sejati Bhairava")

category — gunakan TEPAT salah satu nilai berikut (dalam Bahasa Inggris):
- "Breath" — pranayama, penangguhan napas, kumbhaka, pergerakan prana
- "Sound" — nada, mantra, suara batin, shabda, AUM, resonansi
- "Space" — akasha, kekosongan, ruang tak terbatas, langit, chidakasha
- "Awareness" — kesadaran murni, saksi, turiya, kesadaran diri-bercahaya
- "Visualization" — bentuk, visualisasi cahaya, mandala, yantra, trataka
- "Body" — sensasi sentuhan, propriosepsi, sensasi fisik, batas tubuh
- "Emotion" — bhakti, pengabdian, kegembiraan, kebahagiaan, emosi intens, kekaguman
- "Nonduality" — advaita, pelarutan dualitas subjek-objek, sifat Bhairava
- "Dissolution" — laya, penyerapan, melebur ke dalam sumber, samadhi
- "Dialogue" — dialog pembuka atau penutup, pertanyaan teologis

summary: satu kalimat yang menyarikan makna inti atau instruksi ayat dalam Bahasa Indonesia.

difficulty — TEPAT salah satu nilai berikut (dalam Bahasa Inggris): "beginner", "intermediate", "advanced"

practice_type — TEPAT salah satu nilai berikut (dalam Bahasa Inggris): "contemplation", "meditation", "breathwork", "visualization"

focus_object: satu objek perhatian utama yang diarahkan oleh praktik ini dalam Bahasa Indonesia (mis., "jeda napas", "suara batin", "ruang tak terbatas", "kesadaran itu sendiri").

primary_concepts: 2–5 konsep inti yang secara eksplisit diekspresikan dalam ayat ini (istilah Sanskrit diperbolehkan, disertai penjelasan singkat dalam Bahasa Indonesia).
secondary_concepts: 1–4 konsep pendukung atau tersirat yang tidak disebutkan langsung tetapi relevan untuk pemahaman.

related_verses: nomor ayat (bilangan bulat, 1–163) yang terkait secara tematik atau teknis dengan ayat ini. Gunakan daftar kosong jika tidak ada yang sangat terkait.

beginner_explanation: 2–4 kalimat dalam Bahasa Indonesia yang mudah dipahami oleh pemula — hindari jargon, gunakan bahasa sederhana dan analogi.
developer_explanation: 2–4 kalimat dalam Bahasa Indonesia untuk praktisi atau cendekiawan — sertakan istilah Sanskrit, nuansa filosofis, dan referensi silang ke doktrin yang relevan.

tags: 3–8 label datar, huruf kecil, dapat dicari dalam Bahasa Indonesia (mis., ["napas", "kumbhaka", "lanjutan", "non-dual"]).\
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
            "memperkaya batch %d/%d (ayat %d-%d)",
            idx + 1,
            len(batches),
            batch[0].verse_number,
            batch[-1].verse_number,
        )

        verses_text = "\n\n".join(
            f"Ayat {v.verse_number} (pembicara: {v.speaker}):\n{v.sanskrit}"
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
            "batch %d selesai — %d pengayaan dikembalikan", idx + 1, len(result.enrichments)
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
        warnings.append(f"Pengayaan tidak ada untuk nomor ayat: {missing}")
    if extra:
        warnings.append(f"Pengayaan merujuk nomor ayat yang tidak dikenal: {extra}")
    if invalid:
        warnings.append(f"Kategori tidak valid pada nomor ayat: {invalid}")

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

    logger.info("menulis %d ayat yang diperkaya ke %s", len(enriched), output_dir)
