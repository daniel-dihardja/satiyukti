import argparse
import json
import logging
from pathlib import Path

from dotenv import load_dotenv

from extraction.models import Verse
from enrichment import LANGUAGES

load_dotenv()

VERSES_INPUT = Path(__file__).parent / "output/vbt-verses.json"
OUTPUT_DIR = Path(__file__).parent / "output"


def _load_verses(path: Path) -> list[Verse]:
    with open(path) as f:
        data = json.load(f)
    return [Verse(**d) for d in data]


def main() -> None:
    parser = argparse.ArgumentParser(description="Enrich VBT verses for a given language.")
    parser.add_argument(
        "--lang",
        choices=list(LANGUAGES),
        default="en",
        help="Language to enrich (default: en)",
    )
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

    verses = _load_verses(VERSES_INPUT)
    logging.info("loaded %d verses from %s", len(verses), VERSES_INPUT)

    lang_module = LANGUAGES[args.lang]
    enriched = lang_module.enrich_verses(verses)
    report = lang_module.build_report(enriched, verses)
    lang_module.write_enrichment(enriched, report, OUTPUT_DIR)

    if report.warnings:
        for w in report.warnings:
            logging.warning(w)
    else:
        logging.info(
            "enrichment complete [%s] — %d verses across %d categories",
            args.lang,
            report.total_verses,
            len(report.categories),
        )


if __name__ == "__main__":
    main()
