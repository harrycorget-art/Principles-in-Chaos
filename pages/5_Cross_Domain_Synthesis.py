import streamlit as st
from data.cross_domain import CONVERGENCE_MATRIX, META_PREDICTIONS
from data import tech_ai, finance, culture
from components.layout import inject_css, render_page_header, render_sidebar_meta
from components.charts import make_convergence_heatmap

inject_css()
render_sidebar_meta()
render_page_header(
    "Cross-Domain Synthesis",
    "Where signals from Technology, Finance, and Culture converge — and what it means",
)

# ── Signal Convergence Heatmap ────────────────────────────────────────────────
st.subheader("Signal Convergence Matrix")
st.caption(
    "Each cell shows the convergence strength (0–100) of a meta-signal within each domain. "
    "Higher scores indicate the domain is strongly affected by that signal."
)
st.plotly_chart(make_convergence_heatmap(CONVERGENCE_MATRIX), use_container_width=True)

st.divider()

# ── Meta-Predictions ──────────────────────────────────────────────────────────
st.subheader("Meta-Predictions (2026–2030)")
st.caption("Structural forecasts that span all three domains simultaneously.")

for pred in META_PREDICTIONS:
    with st.expander(
        f"**{pred['title']}**  ·  {pred['horizon']}  ·  Confidence: {pred['confidence']}%"
    ):
        st.progress(pred["confidence"] / 100, text=f"Confidence: {pred['confidence']}%")
        st.write(pred["summary"])

st.divider()

# ── Consolidated Wildcard Table ───────────────────────────────────────────────
st.subheader("All Wildcard Scenarios — Consolidated")
st.caption("Low-probability, high-disruption events across all three domains.")

risk_icon = {"high": "🔴", "medium": "🟡", "low": "🟢"}

for module, label in [
    (tech_ai, "Technology & AI"),
    (finance, "Finance & Markets"),
    (culture, "Culture & Society"),
]:
    st.markdown(f"**{label}**")
    for wc in module.WILDCARDS:
        icon = risk_icon.get(wc["risk_level"], "⚪")
        st.markdown(
            f"- {icon} **{wc['title']}**: {wc['description']}"
        )
    st.markdown("")

st.divider()

# ── The Trust Renegotiation Summary ──────────────────────────────────────────
st.subheader("Core Finding: The Trust Renegotiation")
st.markdown("""
The dominant signal across all three domains in 2026 is a **systemic renegotiation of trust**:

| Layer | What's Eroding | What's Being Built |
|---|---|---|
| **Human ↔ AI** | Trust in AI-generated content | Provenance standards, audit trails |
| **Nations ↔ Trade** | WTO-era multilateral framework | Bilateral deals, geopolitical blocs |
| **People ↔ Platforms** | Social media attention model | Authenticity premium, analog revival |
| **Capital ↔ Assets** | Fiat monetary system hegemony | Crypto infrastructure, tokenization |

> *Entities that develop credible trust signals will command disproportionate economic and social
> capital in the 2026–2028 window. Those that fail to do so will face accelerating erosion.*
""")
