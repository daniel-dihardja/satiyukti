import json
import logging
import re
from dataclasses import asdict
from pathlib import Path

from .models import Page, ValidationReport, Verse

logger = logging.getLogger(__name__)

VERSE_RE = re.compile(r"॥\s*([०-९]+)\s*[a-z]?\s*॥")
DEVI_RE = re.compile(r"देव्युवाच|देव्य्\s*उवाच|देवी\s*उवाच")
BHAIRAVA_RE = re.compile(r"भैरव\s*उवाच")

DEVA_DIGITS = {ch: i for i, ch in enumerate("०१२३४५६७८९")}


def devanagari_to_int(s: str) -> int:
    result = 0
    for ch in s:
        result = result * 10 + DEVA_DIGITS[ch]
    return result


def _is_header(line: str) -> bool:
    if not line:
        return True
    if re.match(r"^\d+$", line):
        return True
    if line == "विऻानभैरि तन्त्रम्":
        return True
    return False


def _detect_speaker(line: str) -> str | None:
    if DEVI_RE.search(line):
        return "Devi"
    if BHAIRAVA_RE.search(line):
        return "Bhairava"
    return None


def load_pages(path: Path) -> list[Page]:
    try:
        with open(path) as f:
            data = json.load(f)
    except (OSError, json.JSONDecodeError) as err:
        raise RuntimeError(f"failed to load pages from {path}") from err
    return [Page(**d) for d in data]


def extract_verses(pages: list[Page]) -> list[Verse]:
    verses: list[Verse] = []
    seen: dict[int, int] = {}  # verse_number -> index in verses
    current_speaker = "Unknown"
    current_lines: list[str] = []

    for page_data in pages:
        for line in page_data.sanskrit.split("\n"):
            line = line.strip()

            if _is_header(line):
                continue

            speaker = _detect_speaker(line)
            if speaker:
                current_speaker = speaker
                continue

            verse_match = VERSE_RE.search(line)
            if verse_match:
                current_lines.append(line)
                verse_number = devanagari_to_int(verse_match.group(1))
                if verse_number in seen:
                    # Duplicate marker in source — append to existing verse.
                    existing = verses[seen[verse_number]]
                    verses[seen[verse_number]] = Verse(
                        verse_number=existing.verse_number,
                        page=existing.page,
                        speaker=existing.speaker,
                        sanskrit=existing.sanskrit + "\n" + "\n".join(current_lines),
                    )
                else:
                    seen[verse_number] = len(verses)
                    verses.append(Verse(
                        verse_number=verse_number,
                        page=page_data.page,
                        speaker=current_speaker,
                        sanskrit="\n".join(current_lines),
                    ))
                current_lines = []
            else:
                current_lines.append(line)

    return verses


def validate_verses(verses: list[Verse]) -> ValidationReport:
    if not verses:
        return ValidationReport(total_verses=0, missing_verses=[], duplicate_verses=[], warnings=[])

    nums = [v.verse_number for v in verses]
    seen: dict[int, int] = {}
    duplicates: list[int] = []

    for n in nums:
        if n in seen:
            duplicates.append(n)
        seen[n] = seen.get(n, 0) + 1

    expected = set(range(min(nums), max(nums) + 1))
    missing = sorted(expected - set(seen.keys()))

    warnings: list[str] = []
    if missing:
        warnings.append(f"Missing verse numbers: {missing}")
    if duplicates:
        warnings.append(f"Duplicate verse numbers: {duplicates}")

    return ValidationReport(
        total_verses=len(verses),
        missing_verses=missing,
        duplicate_verses=duplicates,
        warnings=warnings,
    )


def write_output(verses: list[Verse], report: ValidationReport, output_dir: Path) -> None:
    output_dir.mkdir(exist_ok=True)
    try:
        with open(output_dir / "vbt-verses.json", "w") as f:
            json.dump([asdict(v) for v in verses], f, indent=2, ensure_ascii=False)
        with open(output_dir / "extraction-report.json", "w") as f:
            json.dump(asdict(report), f, indent=2)
    except OSError as err:
        raise RuntimeError(f"failed to write output to {output_dir}") from err

    logger.info("wrote %d verses to %s", len(verses), output_dir)
