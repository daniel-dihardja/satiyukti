import logging
import re
from dataclasses import asdict
from pathlib import Path

import pymupdf

from .models import Page

logger = logging.getLogger(__name__)

_SANSKRIT_RE = re.compile(r"[ऀ-ॿ।॥ ]+")


def _extract_sanskrit(text: str) -> str:
    matches = _SANSKRIT_RE.findall(text)
    return "\n".join(m.strip() for m in matches if m.strip())


def extract_pages(pdf_path: Path) -> list[Page]:
    try:
        doc = pymupdf.open(pdf_path)
    except Exception as err:
        raise RuntimeError(f"failed to open PDF: {pdf_path}") from err

    pages = [
        Page(page=i + 1, text=page.get_text(), sanskrit=_extract_sanskrit(page.get_text()))
        for i, page in enumerate(doc)
    ]
    doc.close()
    logger.info("extracted %d pages from %s", len(pages), pdf_path)
    return pages


def write_pages(pages: list[Page], output_path: Path) -> None:
    import json

    try:
        with open(output_path, "w") as f:
            json.dump([asdict(p) for p in pages], f, indent=2, ensure_ascii=False)
    except OSError as err:
        raise RuntimeError(f"failed to write output: {output_path}") from err

    logger.info("wrote %d pages to %s", len(pages), output_path)
