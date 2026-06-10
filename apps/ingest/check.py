"""Check and repair Sanskrit text in output/output.json using an LLM."""

import json
import logging
import os
import re
from pathlib import Path

from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from pydantic import BaseModel

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger(__name__)

OUTPUT_DIR = Path("output")
INPUT_FILE = OUTPUT_DIR / "output.json"
OUTPUT_FILE = OUTPUT_DIR / "output-checked.json"
REPORT_FILE = OUTPUT_DIR / "check-report.json"

_SYSTEM_PROMPT = """\
You are a scholar of Sanskrit and an expert on the Vijñāna Bhairava Tantra (VBT), \
a non-dual Tantric text from Kashmir Shaivism containing 112 dharanas (meditation methods) \
presented as a dialogue between Bhairava and Devi.

Text structure:
- Verses 1–6: Devi's opening questions about Bhairava's nature
- Verses 7–23: Bhairava's explanation of his non-dual nature
- Verses 24–135 (approx): The 112 dharanas — direct meditation techniques
- Verses 136–163 (approx): Concluding dialogue and blessings

You will receive a batch of pages. Each page has:
  text     — the full page content (Sanskrit verses embedded alongside English translation)
  sanskrit — the extracted Sanskrit-only text from that page

Your task for each page — work through these steps in order:

STEP 1 — REFLECT (fill the `reasoning` field first):
  a. Read the `text` field carefully and extract every Sanskrit word/phrase visible inline.
  b. Compare each token in `sanskrit` against those inline occurrences.
  c. Explicitly check for OCR substitutions in this document:
       ऻ → ज्ञ,  ऺ → क्ष,  ऩ → प,  ऱ → ल
       व → ि  (the OCR drops the consonant body of व and keeps only the ि diacritic;
                e.g. भैरव→भैरि, भवेत्→भिेत्, एव→एि, वा→िा, भावना→भािना)
  d. Check for missing/wrong diacritics (matras, visarga ः, anusvāra ं, halant ्).
  e. Check that all verse markers ॥ N ॥ (Devanagari numerals) are present and well-formed.
  f. Check speaker tags (श्री देव्युवाच ।, भैरव उवाच ।) are present where the `text` shows them.
  g. Write your findings as a short analytical note in `reasoning` — even if everything looks fine.

STEP 2 — DECIDE:
  Set two independent flags:
  - `was_corrected`: true if you made ANY change to `sanskrit` to produce `fixed_sanskrit`; false if you
    copied it unchanged. This records whether corrections were needed, regardless of outcome.
  - `is_resolved`: true if `fixed_sanskrit` is now correct Sanskrit and no remaining unfixable issues exist;
    false ONLY if you could NOT fully fix the text (e.g. a word is too garbled to reconstruct).

  IMPORTANT: a mismatch between the OCR `text` field and `fixed_sanskrit` is EXPECTED after correction —
  `text` is the raw, corrupted scan and will always differ from corrected Sanskrit. Do NOT set
  `is_resolved=false` just because `fixed_sanskrit` differs from `text`.

Rules:
- Use `sanskrit` (already partially corrected) as your base — do NOT copy corrupted forms back from `text`.
- Verse markers take the form ॥ N ॥ where N is a Devanagari numeral (१, २, …).
- The page header "विज्ञानभैरव तन्त्रम्" may appear at the top — include it if present in the original.
- Speaker markers (श्री देव्युवाच ।, भैरव उवाच ।) should be preserved when present.
- Return an empty string for pages that genuinely contain no Sanskrit.
- Do NOT translate or add content not present in the source text.
"""


class _PageCheckResult(BaseModel):
    page: int
    reasoning: str  # step-by-step reflection written before the verdict
    was_corrected: bool  # true if any change was made to produce fixed_sanskrit
    is_resolved: bool    # true if fixed_sanskrit is now correct; false only if still unfixable
    issues: list[str]
    fixed_sanskrit: str


class _BatchCheckResult(BaseModel):
    pages: list[_PageCheckResult]


def _make_chain():
    llm = ChatOpenAI(model=os.getenv("OPENAI_MODEL", "gpt-5.4"), temperature=0)
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", _SYSTEM_PROMPT),
            ("human", "{pages}"),
        ]
    )
    return prompt | llm.with_structured_output(_BatchCheckResult)


_OCR_SUBSTITUTIONS = [
    ("ऻ", "ज्ञ"),
    ("ऺ", "क्ष"),
    ("ऩ", "प"),
    ("ऱ", "ल"),
    # व→ि OCR corruption: the OCR drops the consonant body of व and keeps only ि
    ("भिेत्",   "भवेत्"),    # bhavet (21x)
    ("भािना",   "भावना"),    # bhāvanā (3x)
    ("भाियन्",  "भावयन्"),   # bhāvayan (4x)
    ("भािे",    "भावे"),     # bhāve (5x)
    ("यािस्था", "यावस्था"),  # yāvasthā (3x)
    ("एिं",     "एवं"),      # evam (2x) — before एि→एव to avoid partial match
    ("एि",      "एव"),       # eva (8x)
    ("देिी",    "देवी"),     # devī (3x)
    ("देिदेि",  "देवदेव"),   # devadeva (2x) — before देि→देव*
    ("भैरि",    "भैरव"),     # bhairava in all inflections (44x)
]

# Word-boundary–sensitive substitutions (can't be done with simple str.replace)
_OCR_REGEX_SUBSTITUTIONS: list[tuple[re.Pattern, str]] = [
    # Standalone िा is never valid Devanagari; always corrupted वा ("or")
    (re.compile(r"(?<!\S)िा(?!\S)"), "वा"),
]


def apply_ocr_substitutions(pages: list[dict]) -> list[dict]:
    """Apply deterministic character-level OCR fixes to the sanskrit field."""
    result = []
    total = 0
    for page in pages:
        sanskrit = page["sanskrit"]
        count = sum(sanskrit.count(wrong) for wrong, _ in _OCR_SUBSTITUTIONS)
        for wrong, correct in _OCR_SUBSTITUTIONS:
            sanskrit = sanskrit.replace(wrong, correct)
        for pattern, correct in _OCR_REGEX_SUBSTITUTIONS:
            count += len(pattern.findall(sanskrit))
            sanskrit = pattern.sub(correct, sanskrit)
        total += count
        result.append({**page, "sanskrit": sanskrit})
    logger.info(
        "deterministic pass: replaced %d OCR tokens across %d pages",
        total,
        len(pages),
    )
    return result


def check_pages(pages: list[dict], batch_size: int = 3) -> list[_PageCheckResult]:
    chain = _make_chain()
    results: list[_PageCheckResult] = []
    batches = [pages[i : i + batch_size] for i in range(0, len(pages), batch_size)]

    for idx, batch in enumerate(batches):
        logger.info(
            "checking batch %d/%d (pages %d–%d)",
            idx + 1,
            len(batches),
            batch[0]["page"],
            batch[-1]["page"],
        )

        pages_text = "\n\n---\n\n".join(
            f'Page {p["page"]}:\ntext: {p["text"]!r}\nsanskrit: {p["sanskrit"]!r}'
            for p in batch
        )

        result: _BatchCheckResult = chain.invoke({"pages": pages_text})

        returned = {r.page for r in result.pages}
        skipped = {p["page"] for p in batch} - returned
        if skipped:
            logger.warning(
                "LLM skipped pages in batch — no result for: %s", sorted(skipped)
            )

        results.extend(result.pages)
        logger.info(
            "batch %d done — %d/%d pages returned",
            idx + 1,
            len(result.pages),
            len(batch),
        )

    return sorted(results, key=lambda r: r.page)


def main() -> None:
    batch_size = 1

    with open(INPUT_FILE, encoding="utf-8") as f:
        pages: list[dict] = json.load(f)

    logger.info("loaded %d pages from %s", len(pages), INPUT_FILE)

    pages = apply_ocr_substitutions(pages)

    # First pass
    results = check_pages(pages, batch_size=batch_size)
    result_map = {r.page: r for r in results}

    # Retry pass: re-run pages still unresolved, feeding the partially
    # corrected fixed_sanskrit back in so the LLM can build on prior work
    incomplete = [r for r in results if not r.is_resolved]
    if incomplete:
        logger.info("retrying %d pages still flagged as incomplete", len(incomplete))
        retry_input = [
            {
                "page": p["page"],
                "text": p["text"],
                "sanskrit": result_map[p["page"]].fixed_sanskrit or p["sanskrit"],
            }
            for p in pages
            if p["page"] in {r.page for r in incomplete}
        ]
        retry_results = check_pages(retry_input, batch_size=batch_size)
        for r in retry_results:
            result_map[r.page] = r
        results = sorted(result_map.values(), key=lambda r: r.page)
        logger.info(
            "retry done — %d pages still unresolved",
            sum(1 for r in results if not r.is_resolved),
        )

    fixed_pages = []
    for page in pages:
        result = result_map.get(page["page"])
        if result is None:
            logger.warning(
                "no result for page %d — keeping original sanskrit", page["page"]
            )
        fixed_pages.append(
            {
                "page": page["page"],
                "text": page["text"],
                "sanskrit": result.fixed_sanskrit if result else page["sanskrit"],
            }
        )

    # Second deterministic pass: catch any OCR forms the LLM reintroduced from `text`.
    fixed_pages = apply_ocr_substitutions(fixed_pages)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(fixed_pages, f, indent=2, ensure_ascii=False)

    unresolved = [r for r in results if not r.is_resolved]
    corrected = [r for r in results if r.was_corrected]
    report = {
        "total_pages": len(pages),
        "pages_ok": len(results) - len(unresolved),
        "pages_corrected": len(corrected),
        "pages_unresolved": len(unresolved),
        "unresolved": [{"page": r.page, "issues": r.issues} for r in unresolved],
    }

    with open(REPORT_FILE, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    logger.info("wrote fixed output → %s", OUTPUT_FILE)
    logger.info("wrote report      → %s", REPORT_FILE)
    logger.info(
        "%d/%d pages corrected, %d still unresolved: %s",
        len(corrected),
        len(pages),
        len(unresolved),
        [r.page for r in unresolved],
    )


if __name__ == "__main__":
    main()
