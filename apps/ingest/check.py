"""Check and repair Sanskrit text in output/output.json using an LLM."""

import json
import logging
import os
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
  c. Explicitly check for the four most common OCR substitutions in this document:
       ऻ → ज्ञ,  ऺ → क्ष,  ऩ → प,  ऱ → ल
  d. Check for missing/wrong diacritics (matras, visarga ः, anusvāra ं, halant ्).
  e. Check that all verse markers ॥ N ॥ (Devanagari numerals) are present and well-formed.
  f. Check speaker tags (श्री देव्युवाच ।, भैरव उवाच ।) are present where the `text` shows them.
  g. Write your findings as a short analytical note in `reasoning` — even if everything looks fine.

STEP 2 — DECIDE:
  - If no issues found after the reflection above, set is_complete=true and copy `sanskrit` unchanged.
  - If any issues found, set is_complete=false, list each issue, and write the corrected Sanskrit.

Rules:
- Preserve the exact Devanagari of verses as they appear in `text`.
- Verse markers take the form ॥ N ॥ where N is a Devanagari numeral (१, २, …).
- The page header "विज्ञानभैरव तन्त्रम्" may appear at the top — include it if present in the original.
- Speaker markers (श्री देव्युवाच ।, भैरव उवाच ।) should be preserved when present.
- Return an empty string for pages that genuinely contain no Sanskrit.
- Do NOT translate or add content not present in the source text.
"""


class _PageCheckResult(BaseModel):
    page: int
    reasoning: str  # step-by-step reflection written before the verdict
    is_complete: bool
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
        total += count
        result.append({**page, "sanskrit": sanskrit})
    logger.info(
        "deterministic pass: replaced %d OCR characters across %d pages",
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

    # Retry pass: re-run pages still flagged as incomplete, feeding the partially
    # corrected fixed_sanskrit back in so the LLM can build on prior work
    incomplete = [r for r in results if not r.is_complete]
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
            "retry done — %d pages still incomplete",
            sum(1 for r in results if not r.is_complete),
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

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(fixed_pages, f, indent=2, ensure_ascii=False)

    corrupted = [r for r in results if not r.is_complete]
    report = {
        "total_pages": len(pages),
        "pages_ok": len(results) - len(corrupted),
        "pages_with_issues": len(corrupted),
        "issues": [{"page": r.page, "issues": r.issues} for r in corrupted],
    }

    with open(REPORT_FILE, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    logger.info("wrote fixed output → %s", OUTPUT_FILE)
    logger.info("wrote report      → %s", REPORT_FILE)
    logger.info(
        "%d/%d pages had issues after retry: %s",
        len(corrupted),
        len(pages),
        [r.page for r in corrupted],
    )


if __name__ == "__main__":
    main()
