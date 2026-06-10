"""Re-extract verses from output-checked.json and write vbt-verses.json."""

import logging
from pathlib import Path

from extraction import extract_verses, load_pages, validate_verses, write_output

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

INPUT_FILE = Path(__file__).parent / "output/output-checked.json"
OUTPUT_DIR = Path(__file__).parent / "output"


def main() -> None:
    pages = load_pages(INPUT_FILE)
    logging.info("loaded %d pages from %s", len(pages), INPUT_FILE)

    verses = extract_verses(pages)
    report = validate_verses(verses)
    write_output(verses, report, OUTPUT_DIR)

    if report.warnings:
        for w in report.warnings:
            logging.warning(w)
    else:
        logging.info("extracted %d verses, validation passed", report.total_verses)


if __name__ == "__main__":
    main()
