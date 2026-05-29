extract:
	uv run python main.py

# Enrich verses for a given language. Usage: make enrich lang=en|de|id
lang ?= en

enrich:
	uv run python enrich.py --lang $(lang)
