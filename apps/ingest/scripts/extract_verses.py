import json
import re
from pathlib import Path

INPUT_PATH = Path(__file__).parent.parent / "output.json"
OUTPUT_DIR = Path(__file__).parent.parent / "output"

VERSE_RE = re.compile(r"॥\s*([०-९]+)\s*[a-z]?\s*॥")
DEVI_RE = re.compile(r"देव्युिाच|देव्य्\s*उिाच|देिी\s*उिाच")
BHAIRAVA_RE = re.compile(r"भैरि\s*उिाच")

DEVA_DIGITS = {ch: i for i, ch in enumerate("०१२३४५६७८९")}


def devanagari_to_int(s: str) -> int:
    result = 0
    for ch in s:
        result = result * 10 + DEVA_DIGITS[ch]
    return result


def is_header(line: str) -> bool:
    if not line:
        return True
    if re.match(r"^\d+$", line):
        return True
    if line == "विऻानभैरि तन्त्रम्":
        return True
    return False


def detect_speaker(line: str) -> str | None:
    if DEVI_RE.search(line):
        return "Devi"
    if BHAIRAVA_RE.search(line):
        return "Bhairava"
    return None


def load_pages(path: Path) -> list:
    with open(path) as f:
        return json.load(f)


def extract_verses(pages: list) -> list:
    verses = []
    current_speaker = "Unknown"
    current_lines: list[str] = []

    for page_data in pages:
        page_num = page_data["page"]

        for line in page_data.get("sanskrit", "").split("\n"):
            line = line.strip()

            if is_header(line):
                continue

            speaker = detect_speaker(line)
            if speaker:
                current_speaker = speaker
                continue

            verse_match = VERSE_RE.search(line)
            if verse_match:
                current_lines.append(line)
                verses.append({
                    "verse_number": devanagari_to_int(verse_match.group(1)),
                    "page": page_num,
                    "speaker": current_speaker,
                    "sanskrit": "\n".join(current_lines),
                })
                current_lines = []
            else:
                current_lines.append(line)

    return verses


def validate_verses(verses: list) -> dict:
    nums = [v["verse_number"] for v in verses]
    seen: dict[int, int] = {}
    duplicates: list[int] = []

    for n in nums:
        if n in seen:
            duplicates.append(n)
        seen[n] = seen.get(n, 0) + 1

    expected = set(range(min(nums), max(nums) + 1)) if nums else set()
    missing = sorted(expected - set(seen.keys()))

    warnings = []
    if missing:
        warnings.append(f"Missing verse numbers: {missing}")
    if duplicates:
        warnings.append(f"Duplicate verse numbers: {duplicates}")

    return {
        "total_verses": len(verses),
        "missing_verses": missing,
        "duplicate_verses": duplicates,
        "warnings": warnings,
    }


def write_output(verses: list, report: dict, output_dir: Path) -> None:
    output_dir.mkdir(exist_ok=True)
    with open(output_dir / "verses.json", "w") as f:
        json.dump(verses, f, indent=2, ensure_ascii=False)
    with open(output_dir / "extraction-report.json", "w") as f:
        json.dump(report, f, indent=2)


def main() -> None:
    pages = load_pages(INPUT_PATH)
    verses = extract_verses(pages)
    report = validate_verses(verses)
    write_output(verses, report, OUTPUT_DIR)

    print(f"Extracted {report['total_verses']} verses")
    if report["missing_verses"]:
        print(f"Missing: {report['missing_verses']}")
    if report["duplicate_verses"]:
        print(f"Duplicates: {report['duplicate_verses']}")
    if not report["warnings"]:
        print("Validation passed")


if __name__ == "__main__":
    main()
