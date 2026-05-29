import json
import logging
from pathlib import Path

from dotenv import load_dotenv

from extraction.models import Verse
from enrichment import build_report, enrich_verses, write_enrichment

load_dotenv()

VERSES_INPUT = Path(__file__).parent / "output/verses.json"
OUTPUT_DIR = Path(__file__).parent / "output"


def _load_verses(path: Path) -> list[Verse]:
    with open(path) as f:
        data = json.load(f)
    return [Verse(**d) for d in data]


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

    verses = _load_verses(VERSES_INPUT)
    logging.info("loaded %d verses from %s", len(verses), VERSES_INPUT)

    enriched = enrich_verses(verses)
    report = build_report(enriched, verses)
    write_enrichment(enriched, report, OUTPUT_DIR)

    if report.warnings:
        for w in report.warnings:
            logging.warning(w)
    else:
        logging.info(
            "enrichment complete — %d verses across %d categories",
            report.total_verses,
            len(report.categories),
        )


if __name__ == "__main__":
    main()
