import logging
from pathlib import Path

from extraction import extract_pages, extract_verses, validate_verses, write_output, write_pages

PDF_PATH = Path(__file__).parent.parent.parent / "packages/scriptures/Vijnana-Bhairava-Tantra-Sanskrit-Text-English-Translation.pdf"
PAGES_OUTPUT = Path(__file__).parent / "output.json"
VERSES_OUTPUT_DIR = Path(__file__).parent / "output"


def main() -> None:
    logging.basicConfig(level=logging.INFO)

    pages = extract_pages(PDF_PATH)
    write_pages(pages, PAGES_OUTPUT)

    verses = extract_verses(pages)
    report = validate_verses(verses)
    write_output(verses, report, VERSES_OUTPUT_DIR)

    if report.missing_verses:
        logging.warning("missing verses: %s", report.missing_verses)
    if report.duplicate_verses:
        logging.warning("duplicate verses: %s", report.duplicate_verses)
    if not report.warnings:
        logging.info("validation passed")


if __name__ == "__main__":
    main()
