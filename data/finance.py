DOMAIN = "Finance & Markets"

CURRENT_STATE_CARDS = [
    {"label": "S&P 500 Earnings Growth (est.)", "value": "13–15%", "delta": "AI supercycle"},
    {"label": "Bitcoin ATH (2026 H1 est.)",     "value": "$120K+", "delta": "Inst. era begins"},
    {"label": "Global Sovereign Debt / GDP",    "value": "~98%",   "delta": "Toward 100%"},
    {"label": "IMF Global Growth Forecast",     "value": "3.3%",   "delta": "+0.2pp revised up"},
]

TRENDS = [
    {
        "name":            "AI-Driven Equity Supercycle",
        "category":        "Equities",
        "confidence":      85,
        "impact":          92,
        "timeline":        "short",
        "short_forecast":  (
            "J.P. Morgan forecasts 13–15% S&P 500 earnings growth driven by AI CapEx. "
            "AI-sector companies deliver outsized returns as enterprise adoption accelerates."
        ),
        "medium_forecast": (
            "By 2027–28 the AI supercycle either delivers productivity proof points justifying "
            "valuations, or a sharp correction follows — the pivotal test of whether AI ROI is real."
        ),
    },
    {
        "name":            "Crypto Institutional Era",
        "category":        "Digital Assets",
        "confidence":      88,
        "impact":          85,
        "timeline":        "short",
        "short_forecast":  (
            "Bipartisan US digital asset legislation passes in 2026, unlocking institutional "
            "capital at scale. Bitcoin expected to hit a new all-time high in H1 2026."
        ),
        "medium_forecast": (
            "By 2027 crypto becomes a standard 5–10% allocation in institutional portfolios. "
            "Traditional finance and blockchain infrastructure fully converge operationally."
        ),
    },
    {
        "name":            "Stablecoin Infrastructure",
        "category":        "Digital Payments",
        "confidence":      86,
        "impact":          88,
        "timeline":        "short",
        "short_forecast":  (
            "BlackRock describes stablecoins as 'financial system plumbing'. Stablecoin volume "
            "overtakes several major payment networks in transaction count by end of 2026."
        ),
        "medium_forecast": (
            "By 2028 stablecoins become the default settlement layer for cross-border B2B "
            "payments, displacing SWIFT in corridors where speed and cost matter most."
        ),
    },
    {
        "name":            "Real-World Asset Tokenization",
        "category":        "Digital Assets",
        "confidence":      80,
        "impact":          82,
        "timeline":        "medium",
        "short_forecast":  (
            "76% of companies plan tokenized asset holdings in 2026. Tokenization expands from "
            "T-bills into private equity, real estate, and infrastructure on public blockchains."
        ),
        "medium_forecast": (
            "By 2028 tokenized real-world assets become a $10T+ market, democratizing access to "
            "previously institutional-only asset classes for retail investors globally."
        ),
    },
    {
        "name":            "AI + Crypto Convergence",
        "category":        "Digital Assets",
        "confidence":      75,
        "impact":          80,
        "timeline":        "medium",
        "short_forecast":  (
            "Autonomous AI wallets capable of self-managing digital assets move from prototypes "
            "to pilot programs. AI agents begin executing micro-transactions independently."
        ),
        "medium_forecast": (
            "By 2027 a new layer of digital commerce emerges where AI agents transact, verify, "
            "and coordinate economic activity without human involvement at scale."
        ),
    },
    {
        "name":            "K-Shaped Economic Recovery",
        "category":        "Macro",
        "confidence":      83,
        "impact":          78,
        "timeline":        "short",
        "short_forecast":  (
            "AI CapEx drives strong high-income household and tech-sector wealth while labor "
            "demand weakens and consumer spending softens for lower-income brackets."
        ),
        "medium_forecast": (
            "By 2027 the wealth divergence triggers political pressure for redistributive policy "
            "responses. Universal basic income and robot taxes enter mainstream policy debate."
        ),
    },
    {
        "name":            "Tariff-Driven Trade Fragmentation",
        "category":        "Macro & Trade",
        "confidence":      87,
        "impact":          84,
        "timeline":        "short",
        "short_forecast":  (
            "US tariffs create a supply shock (rising consumer prices) and a global demand shock "
            "(overcapacity outside the US). Compliance costs for multinational firms rise sharply."
        ),
        "medium_forecast": (
            "By 2027 global trade has restructured into 2–3 partially decoupled blocs. Supply "
            "chains are shorter, more expensive, and geopolitically aligned rather than cost-optimized."
        ),
    },
    {
        "name":            "Dollar Reserve Status Pressure",
        "category":        "Macro & Currency",
        "confidence":      68,
        "impact":          90,
        "timeline":        "medium",
        "short_forecast":  (
            "De-dollarization strategies by BRICS+ nations accelerate alongside stablecoin and "
            "CBDC alternatives scaling. US dollar share of global reserves continues slow decline."
        ),
        "medium_forecast": (
            "By 2028 the dollar remains dominant but multi-currency settlement infrastructure "
            "makes unilateral dollar weaponization via sanctions significantly less effective."
        ),
    },
    {
        "name":            "Sovereign Debt Sustainability Crisis",
        "category":        "Macro",
        "confidence":      72,
        "impact":          88,
        "timeline":        "medium",
        "short_forecast":  (
            "Global sovereign debt approaches 100% of GDP. Elevated valuations and tight credit "
            "spreads leave markets vulnerable to rate volatility and fiscal stress events."
        ),
        "medium_forecast": (
            "By 2028 one or more G20 economies faces a debt sustainability crisis, forcing "
            "structural fiscal adjustment and potential debt restructuring."
        ),
    },
    {
        "name":            "ESG & Climate Capital Re-Emergence",
        "category":        "Sustainable Finance",
        "confidence":      65,
        "impact":          74,
        "timeline":        "medium",
        "short_forecast":  (
            "After a 2024–25 political lull, ESG capital allocation re-emerges driven by "
            "insurance industry climate losses and green infrastructure buildout requirements."
        ),
        "medium_forecast": (
            "By 2027 climate-linked financial risk disclosure becomes mandatory across G7 markets, "
            "making ESG a regulatory compliance requirement rather than an investment philosophy."
        ),
    },
]

WILDCARDS = [
    {
        "title":       "AI Investment Correction",
        "description": (
            "AI productivity gains prove overstated or too slow to materialize. A reassessment "
            "of AI ROI triggers an investment pullback, equity correction larger than dot-com, "
            "and a tightening of financial conditions globally."
        ),
        "risk_level": "high",
    },
    {
        "title":       "SCOTUS Tariff Reversal",
        "description": (
            "US Supreme Court strikes down executive tariff authority. Massive positive shock "
            "to global trade in the medium term, but a short-term uncertainty spike causes "
            "equity volatility and dollar depreciation as policy framework resets."
        ),
        "risk_level": "medium",
    },
    {
        "title":       "China Semiconductor Breakthrough",
        "description": (
            "China achieves domestic advanced semiconductor self-sufficiency faster than expected, "
            "eliminating the US's primary geopolitical leverage point and triggering a complete "
            "technology decoupling with cascading supply chain consequences."
        ),
        "risk_level": "high",
    },
]
