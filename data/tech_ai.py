DOMAIN = "Technology & AI"

CURRENT_STATE_CARDS = [
    {"label": "AI Models in Active Deployment", "value": "142+",  "delta": "+38% YoY"},
    {"label": "Global AI Investment (2025)",     "value": "$320B", "delta": "+61% vs 2024"},
    {"label": "Avg Inference Cost /1M tokens",   "value": "$0.11", "delta": "-74% in 18 mo"},
    {"label": "Open-Source Model Releases",      "value": "890+",  "delta": "+112% YoY"},
]

TRENDS = [
    {
        "name":            "Agentic AI Systems",
        "category":        "AI Infrastructure",
        "confidence":      90,
        "impact":          97,
        "timeline":        "short",
        "short_forecast":  (
            "Multi-agent orchestration frameworks (ROMA, Agyn) reach enterprise production "
            "maturity within 12 months. Major cloud vendors ship managed agent runtime services."
        ),
        "medium_forecast": (
            "An open 'agent interoperability protocol' (analogous to HTTP for APIs) emerges "
            "by 2027, enabling cross-platform autonomous agent coordination at scale."
        ),
    },
    {
        "name":            "AI-Powered Software Development",
        "category":        "Developer Tooling",
        "confidence":      88,
        "impact":          85,
        "timeline":        "short",
        "short_forecast":  (
            "AI coding tools eliminate syntax as the bottleneck; product vision and architecture "
            "judgment become the scarce premium skill. 10x more people can ship software."
        ),
        "medium_forecast": (
            "By 2027–28 autonomous software engineering agents handle feature implementation "
            "end-to-end, shifting developer role to reviewer and requirements author."
        ),
    },
    {
        "name":            "Efficient & On-Device AI",
        "category":        "Hardware & Inference",
        "confidence":      85,
        "impact":          78,
        "timeline":        "short",
        "short_forecast":  (
            "2026 is the year of frontier vs. efficient model classes. Hardware-aware models "
            "running on edge devices reach near-parity with cloud models for common tasks."
        ),
        "medium_forecast": (
            "By 2028, most consumer devices run capable local AI models with no cloud dependency "
            "for personal tasks, creating a privacy-first AI paradigm shift."
        ),
    },
    {
        "name":            "AI for Scientific Discovery",
        "category":        "Research & Biotech",
        "confidence":      82,
        "impact":          95,
        "timeline":        "short",
        "short_forecast":  (
            "First AI-discovered drug candidates enter Phase 3 clinical trials. AI systems "
            "autonomously generate hypotheses and design experiments in oncology and rare diseases."
        ),
        "medium_forecast": (
            "AI lab assistants become standard at every research institution by 2028, "
            "compressing typical drug discovery timelines from 10 years to under 3."
        ),
    },
    {
        "name":            "Quantum-Classical Hybrid Computing",
        "category":        "Hardware & Infrastructure",
        "confidence":      72,
        "impact":          90,
        "timeline":        "medium",
        "short_forecast":  (
            "IBM projects 2026 as the first year a quantum processor outperforms classical "
            "computers on select optimization benchmarks. Hybrid systems enter finance and logistics."
        ),
        "medium_forecast": (
            "By 2028, quantum-classical hybrids unlock breakthrough applications in materials "
            "science, cryptography, and drug simulation that are intractable on classical hardware."
        ),
    },
    {
        "name":            "Physical AI & Robotics",
        "category":        "Embodied Intelligence",
        "confidence":      75,
        "impact":          88,
        "timeline":        "medium",
        "short_forecast":  (
            "As LLM scaling yields diminishing returns, research priority shifts toward embodied "
            "agents. Humanoid robot commercial deployments begin in manufacturing and logistics."
        ),
        "medium_forecast": (
            "Physical AI becomes a trillion-dollar investment category by 2028. Robots capable "
            "of general-purpose manipulation tasks enter consumer and healthcare markets."
        ),
    },
    {
        "name":            "Open-Source AI & Model Diversification",
        "category":        "Ecosystem & Governance",
        "confidence":      87,
        "impact":          80,
        "timeline":        "short",
        "short_forecast":  (
            "Chinese multilingual reasoning models close capability gaps with Western frontier "
            "models. Open-weights releases from multiple geopolitical blocs fragment the ecosystem."
        ),
        "medium_forecast": (
            "A fully divergent global AI landscape emerges by 2027: distinct US, EU, China, and "
            "Global South AI stacks with incompatible safety standards and alignment approaches."
        ),
    },
    {
        "name":            "AI Regulation & Governance Wars",
        "category":        "Policy & Law",
        "confidence":      80,
        "impact":          75,
        "timeline":        "short",
        "short_forecast":  (
            "US federal vs. state AI governance war intensifies (Trump executive order vs. "
            "California). EU AI Act enforcement begins, creating compliance overhead for deployers."
        ),
        "medium_forecast": (
            "By 2027 a fragmented global AI regulatory landscape forces enterprises to maintain "
            "parallel compliance stacks across jurisdictions — a new major operational cost."
        ),
    },
    {
        "name":            "AI + Synthetic Media Proliferation",
        "category":        "Content & Society",
        "confidence":      93,
        "impact":          82,
        "timeline":        "short",
        "short_forecast":  (
            "AI-generated content already surpassed human-written content online in 2025. "
            "2026 sees first major AI-driven disinformation crisis with documented geopolitical impact."
        ),
        "medium_forecast": (
            "Content provenance and digital authenticity infrastructure (C2PA, cryptographic "
            "signing) becomes regulatory requirement in EU and then globally by 2028."
        ),
    },
    {
        "name":            "AI Enterprise Backbone Adoption",
        "category":        "Enterprise & Operations",
        "confidence":      84,
        "impact":          79,
        "timeline":        "short",
        "short_forecast":  (
            "AI moves from experimentation to core enterprise architecture. Intelligent operations, "
            "automated compliance, and AI-first software delivery lifecycles become standard."
        ),
        "medium_forecast": (
            "By 2028 over 60% of Fortune 500 core business processes run through AI-mediated "
            "systems, making AI reliability a board-level risk management priority."
        ),
    },
]

WILDCARDS = [
    {
        "title":       "Agentic Security Breach",
        "description": (
            "A major agentic AI system is exploited via prompt injection — the 'Lethal Trifecta' "
            "(untrusted inputs + privileged data access + external actions) causes a catastrophic "
            "enterprise breach, triggering emergency regulatory shutdown of agentic deployments."
        ),
        "risk_level": "high",
    },
    {
        "title":       "China AI Self-Sufficiency Surge",
        "description": (
            "US semiconductor export controls backfire: China achieves domestic AI chip "
            "self-sufficiency 2–3 years ahead of schedule, eliminating the key US geopolitical "
            "leverage point and triggering a global AI technology decoupling."
        ),
        "risk_level": "medium",
    },
    {
        "title":       "Open-Source Capability Explosion",
        "description": (
            "A fully open-weights frontier model is publicly released, making capability controls "
            "and safety guardrails obsolete overnight. Democratic access to extreme AI capability "
            "arrives before governance frameworks are ready."
        ),
        "risk_level": "medium",
    },
]
