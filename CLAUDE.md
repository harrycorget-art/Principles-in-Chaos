# CLAUDE.md — Principles in Chaos

## Project Overview
Multi-page Streamlit research dashboard tracking 30 macro trends across
Technology & AI, Finance & Markets, and Culture & Society for Q1 2026.

**Run the app:** `streamlit run app.py`
**No test suite** — validate changes by running the app locally.
**No linter configured** — use standard Python style.

---

## Architecture

All research data lives as Python dicts in `data/`. Community poll data lives in
`data/poll_results.json`. There is no database. Never add a database dependency.

### Data Files (source of truth)
- `data/tech_ai.py` — 10 trends + 3 wildcards + 4 metric cards
- `data/finance.py` — 10 trends + 3 wildcards + 4 metric cards
- `data/culture.py` — 10 trends + 3 wildcards + 4 metric cards
- `data/cross_domain.py` — convergence matrix (10×3) + 5 meta-predictions
- `data/sources.py` — 28 curated sources (dict list)
- `data/poll_results.json` — live community poll responses (JSON, append-only, max 1000)

### TREND data structure (all three domain files)
```python
{
    "name": str,           # Display name
    "category": str,       # Sub-category label
    "confidence": int,     # 0–100, research confidence score
    "impact": int,         # 0–100, impact if trend plays out
    "timeline": str,       # "short" | "medium" | "long"
    "short_forecast": str, # 6–12 month forecast text
    "medium_forecast": str # 1–3 year forecast text
}
```

### Page pattern — follow exactly for new pages
```python
inject_css()
render_sidebar_meta()
render_page_header("Page Title", "subtitle")
# sidebar filters
# content sections with st.divider() between major sections
```

---

## Constants (`config.py`)
- `DOMAIN_COLORS` — dict mapping domain name to hex color
- `CONFIDENCE_THRESHOLDS` — high ≥ 80, medium ≥ 55, low < 55
- `PLOTLY_TEMPLATE` — `"plotly_dark"` — use on all charts
- `RISK_COLORS` — high="#EF476F", medium="#FFD166", low="#06D6A0"

## Components
- `components/cards.py` — `render_metric_row()`, `render_wildcard_cards()`, `render_trend_accordion()`
- `components/charts.py` — `make_radar_chart()`, `make_gantt_timeline()`, `make_confidence_bar()`, `make_convergence_heatmap()`, `make_overview_scatter()`
- `components/filters.py` — `render_domain_filter()`, `render_timeline_filter()`, `render_confidence_slider()`
- `components/layout.py` — `inject_css()`, `render_page_header()`, `render_sidebar_meta()`

---

## MCP Setup
- Global config: `~/.claude/mcp_config.json`
- Project config: `.claude/mcp.json`
- Active servers:
  - `fetch` — URL fetching, no API key required; first call has ~5–10s install delay via npx
  - `brave-search` — requires `BRAVE_API_KEY` env var (`export BRAVE_API_KEY=BSA...`)
- Use the fetch MCP tool to validate source URLs from `data/sources.py` or research new forecasts

## Custom Skills
- `/trend-analysis` — compares community poll results against research confidence scores,
  validates sources via MCP fetch, surfaces emerging trends from freetext responses

---

## Poll Data Flow
```
User submits poll (page 7)  →  appended to data/poll_results.json (atomic write)
Page 7 re-renders           →  reads JSON → renders 4-tab aggregate results
/trend-analysis skill       →  reads poll_results.json + data/*.py
                            →  computes sentiment gaps per trend
                            →  validates sources via MCP fetch
                            →  outputs structured report + optional data file updates
```

---

## Adding a New Domain Page
1. Create `data/new_domain.py` with `DOMAIN`, `CURRENT_STATE_CARDS`, `TRENDS`, `WILDCARDS`
   — follow the exact structure from `data/tech_ai.py`
2. Create `pages/8_NewDomain.py` following the pattern from `pages/2_Technology_AI.py`
3. Add domain to `config.py`: `DOMAINS` list, `DOMAIN_COLORS`, `DOMAIN_ICONS`
4. Import the new module in `data/__init__.py`
5. Update `app.py` metrics row if counts changed

---

## Dependencies
```
streamlit>=1.32.0
plotly>=5.20.0
pandas>=2.2.0
```
No additional dependencies required. Poll page uses stdlib `json`, `os`, `datetime`.
MCP servers launch via `npx -y` (npm, not pip).
