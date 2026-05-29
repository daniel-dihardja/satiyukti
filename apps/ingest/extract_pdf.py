import json
import logging
import re
from dataclasses import asdict, dataclass
from pathlib import Path

import pymupdf

logger = logging.getLogger(__name__)

PDF_PATH = Path(__file__).parent.parent.parent / "packages/scriptures/Vijnana-Bhairava-Tantra-Sanskrit-Text-English-Translation.pdf"
OUTPUT_PATH = Path(__file__).parent / "output.json"

# Devanagari block + dandas (। ॥) + spaces between words
_SANSKRIT_RE = re.compile(r"[ऀ-ॿ।॥ ]+")


@dataclass(frozen=True)
class Page:
    page: int
    text: str
    sanskrit: str


def _extract_sanskrit(text: str) -> str:
    matches = _SANSKRIT_RE.findall(text)
    return "\n".join(m.strip() for m in matches if m.strip())


def extract() -> None:
    try:
        doc = pymupdf.open(PDF_PATH)
    except Exception as err:
        raise RuntimeError(f"failed to open PDF: {PDF_PATH}") from err

    pages = [
        Page(page=i + 1, text=page.get_text(), sanskrit=_extract_sanskrit(page.get_text()))
        for i, page in enumerate(doc)
    ]
    doc.close()

    try:
        with open(OUTPUT_PATH, "w") as f:
            json.dump([asdict(p) for p in pages], f, indent=2, ensure_ascii=False)
    except OSError as err:
        raise RuntimeError(f"failed to write output: {OUTPUT_PATH}") from err

    logger.info("extracted %d pages to %s", len(pages), OUTPUT_PATH)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    extract()
