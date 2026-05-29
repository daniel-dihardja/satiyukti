import json
import re
import pymupdf

PDF_PATH = "../../packages/scriptures/Vijnana-Bhairava-Tantra-Sanskrit-Text-English-Translation.pdf"
OUTPUT_PATH = "output.json"

# Devanagari block + dandas (। ॥) + spaces between words
_SANSKRIT_RE = re.compile(r"[ऀ-ॿ।॥ ]+")


def _extract_sanskrit(text: str) -> str:
    matches = _SANSKRIT_RE.findall(text)
    return "\n".join(m.strip() for m in matches if m.strip())


def extract():
    doc = pymupdf.open(PDF_PATH)

    pages = [
        {"page": i + 1, "text": page.get_text(), "sanskrit": _extract_sanskrit(page.get_text())}
        for i, page in enumerate(doc)
    ]

    doc.close()

    with open(OUTPUT_PATH, "w") as f:
        json.dump(pages, f, indent=2, ensure_ascii=False)

    print(f"Extracted {len(pages)} pages to {OUTPUT_PATH}")


if __name__ == "__main__":
    extract()
