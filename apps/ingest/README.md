# ingest

Data ingestion pipeline for Satiyukti. Extracts and processes Sanskrit text from PDF sources.

## Prerequisites

- [uv](https://docs.astral.sh/uv/) — Python package manager
- Python 3.12+

## Extract PDF

Extracts raw text from the source PDF into `output.json`:

```bash
make extract
```

Or directly:

```bash
uv run python extract_pdf.py
```

## Extract Verses

Parses `output.json` and extracts individual Sanskrit verses into `output/verses.json`, along with a validation report at `output/extraction-report.json`:

```bash
make verses
```

### Output

- `output/verses.json` — array of verse objects with fields:
  - `verse_number` — integer verse number (converted from Devanagari)
  - `page` — source page number
  - `speaker` — `"Devi"`, `"Bhairava"`, or `"Unknown"`
  - `sanskrit` — full Sanskrit text of the verse
- `output/extraction-report.json` — validation summary with total count, missing verse numbers, and duplicates
