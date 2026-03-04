# Principles in Chaos

> Interactive Q1 2026 research dashboard — macro trends across Technology & AI, Finance & Markets, and Culture & Society.

---

## Quick Start

```bash
pip install -r requirements.txt
streamlit run app.py
```

Opens at `http://localhost:8501`.

---

## What's Inside

| | |
|---|---|
| **Domains** | 3 (Technology & AI · Finance & Markets · Culture & Society) |
| **Trends tracked** | 30 (10 per domain) |
| **Wildcard scenarios** | 9 (3 per domain) |
| **Sources** | 28 (institutional, academic, news) |
| **Meta-predictions** | 5 cross-domain structural forecasts |
| **Community poll** | 12-question assessment — compare your intuition to the research |

---

## Pages

| Page | What it shows | Interactive elements |
|---|---|---|
| **Overview** | All 30 trends — confidence vs. impact; top convergent signals; risk alerts | Domain filter · confidence slider · bubble scatter |
| **Technology & AI** | Agentic AI, quantum computing, physical robotics, regulation | Radar chart · Gantt timeline · confidence bar · trend accordions · wildcards |
| **Finance & Markets** | AI equity supercycle, crypto institutional era, tokenization, macro risk | Same layout as Tech |
| **Culture & Society** | Digital fatigue, authenticity premium, multigenerational shifts | Same layout as Tech |
| **Cross-Domain Synthesis** | Signal convergence matrix (10×3); 5 meta-predictions; consolidated wildcards | Heatmap · expandable predictions with progress bars |
| **Sources** | 28 clickable citations | Domain filter · grouped by type |
| **Community Poll** | 12-question assessment; community vs. research confidence gaps; emerging trend nominations | Form · 4-tab results (domain priority, confidence comparison, wildcard risk, emerging trends) |

---

## How to Read the Report

| Field | Meaning |
|---|---|
| **Confidence** (0–100) | How certain are we this trend is real and sustained? ≥80 = high, 55–79 = medium, <55 = low |
| **Impact** (0–100) | How transformative would this trend be if it plays out fully? |
| **Horizon** | Short = 6–12 months · Medium = 1–3 years · Long = 3–5 years |
| **Wildcard** | Low-probability, high-disruption scenario that could override the baseline forecast |

Sidebar controls on every page let you filter by domain, horizon, and minimum confidence score.

---

## Core Finding

**The Trust Renegotiation (2026–2028)**

The dominant signal across all three domains is a systemic renegotiation of trust — between humans and AI systems, between nations in trade, and between individuals and digital platforms. Entities that develop credible trust signals (verified provenance, transparent governance, authentic community) will command disproportionate economic and social capital.

**Top cross-domain convergence signal:** Labor Market Disruption scores above 72 in all three domains simultaneously (Tech: 88 · Finance: 72 · Culture: 82).

---

## Tech Stack

| Library | Version | Role |
|---|---|---|
| [Streamlit](https://streamlit.io) | ≥ 1.32 | Multi-page GUI, sidebar widgets, dark layout |
| [Plotly](https://plotly.com/python/) | ≥ 5.20 | Radar, Gantt timeline, bar, heatmap, bubble scatter charts |
| [Pandas](https://pandas.pydata.org) | ≥ 2.2 | DataFrames at the chart layer (data stored as Python dicts) |

---

## Project Structure

```
Principles-in-Chaos/
├── app.py                         # Entry point — landing page
├── requirements.txt
├── config.py                      # Colors, thresholds, domain constants
├── CLAUDE.md                      # Claude Code project context
├── assets/
│   └── style.css                  # Dark-theme polish
├── .claude/
│   ├── mcp.json                   # Project-level MCP server config (fetch)
│   └── settings.json              # Pre-approved MCP tool permissions
├── data/
│   ├── tech_ai.py                 # 10 trends + 3 wildcards + metrics
│   ├── finance.py                 # 10 trends + 3 wildcards + metrics
│   ├── culture.py                 # 10 trends + 3 wildcards + metrics
│   ├── cross_domain.py            # Convergence matrix (10×3) + meta-predictions
│   ├── sources.py                 # 28 curated sources
│   └── poll_results.json          # Community poll responses (append-only, max 1000)
├── components/
│   ├── charts.py                  # 5 Plotly chart factory functions
│   ├── cards.py                   # Metric rows, wildcard cards, trend accordions
│   ├── filters.py                 # Sidebar widgets
│   └── layout.py                  # Page headers, CSS injector
└── pages/
    ├── 1_Overview.py
    ├── 2_Technology_AI.py
    ├── 3_Finance_Markets.py
    ├── 4_Culture_Society.py
    ├── 5_Cross_Domain_Synthesis.py
    ├── 6_Sources.py
    └── 7_Community_Poll.py        # 12-question poll + 4-tab aggregate results
```

---

## MCP Server Setup

The project includes a pre-configured MCP server for live web research during Claude sessions.

**The fetch server** (no API key required) launches automatically via `npx`:

```bash
# No setup needed — it launches automatically when Claude Code starts in this directory.
# The first fetch call may take 5–10 seconds while npx installs the package.
```

**Brave Search** (optional, requires API key):

```bash
export BRAVE_API_KEY=BSAxxxxxxxx   # Get a free key at brave.com/search/api
# Then restart Claude Code — brave-search server will activate automatically
```

**What MCP enables in this project:**
- Validate the 28 source URLs from `data/sources.py`
- Fetch institutional reports (IMF, WEF, J.P. Morgan) to check for updated forecasts
- Research emerging trend nominations from the community poll

---

## Custom Claude Skill: `/trend-analysis`

Run `/trend-analysis` in any Claude Code session opened in this directory to:

1. Load all 30 research trends and compute sentiment gaps against community poll data
2. Validate high-divergence trend sources via the MCP fetch server
3. Cluster freetext emerging trend nominations into candidate themes
4. Output a structured report: Sentiment Gap Analysis · Domain Priority · Wildcard Risk · Emerging Trends
5. Optionally apply updates to data files (confidence scores, new wildcards)

---

## Sources

28 sources including IBM, MIT Technology Review, J.P. Morgan Global Research, IMF, World Bank, Grayscale, Coinbase Institutional, World Economic Forum, Council on Foreign Relations, Stimson Center, arXiv, Ogilvy, Capgemini, and others. Full bibliography on the Sources page.
