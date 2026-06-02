extract:
	uv run python main.py

check:
	uv run python check.py

# Enrich verses for a given language. Usage: make enrich lang=en|de|id
lang ?= en

enrich:
	uv run python enrich.py --lang $(lang)
	@if [ "$(lang)" = "en" ]; then \
		cp output/vbt-enrichment-en.json ../web/lib/data/vbt-enrichment.json; \
	else \
		cp output/vbt-enrichment-$(lang).json ../web/lib/data/vbt-enrichment-$(lang).json; \
	fi
	@echo "Copied vbt-enrichment-$(lang) → web/lib/data"
