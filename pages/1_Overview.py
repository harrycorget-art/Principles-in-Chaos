import streamlit as st
import pandas as pd
from data import tech_ai, finance, culture
from data.cross_domain import CONVERGENT_SIGNALS_TABLE
from components.layout import inject_css, render_page_header, render_sidebar_meta
from components.charts import make_overview_scatter
from components.filters import render_domain_filter, render_confidence_slider
from config import DOMAIN_ICONS

inject_css()
render_sidebar_meta()
render_page_header(
    "Overview Dashboard",
    "Convergent signals across Technology, Finance, and Culture — Q1 2026",
)

# ── Build unified trend list ──────────────────────────────────────────────────
all_trends = (
    [dict(t, domain="Technology & AI")   for t in tech_ai.TRENDS] +
    [dict(t, domain="Finance & Markets") for t in finance.TRENDS] +
    [dict(t, domain="Culture & Society") for t in culture.TRENDS]
)

# ── Sidebar filters ───────────────────────────────────────────────────────────
selected_domains = render_domain_filter()
min_conf         = render_confidence_slider()

filtered = [
    t for t in all_trends
    if t["domain"] in selected_domains and t["confidence"] >= min_conf
]

# ── Headline metrics ──────────────────────────────────────────────────────────
c1, c2, c3, c4 = st.columns(4)
c1.metric("Total Trends Tracked",       len(all_trends))
c2.metric("High-Confidence Signals",    sum(1 for t in all_trends if t["confidence"] >= 80),
          "≥ 80 confidence")
c3.metric("Avg Confidence (all)",       f"{round(sum(t['confidence'] for t in all_trends) / len(all_trends))}%")
c4.metric("Active Wildcard Risks",      9, "3 per domain")

st.divider()

# ── Overview Scatter ──────────────────────────────────────────────────────────
st.subheader("All Trends — Confidence vs. Impact")
st.caption("Bubble size reflects forecast horizon (larger = nearer term). Hover for details.")
if filtered:
    st.plotly_chart(make_overview_scatter(filtered), use_container_width=True)
else:
    st.info("No trends match the current filters.")

st.divider()

# ── Convergent Signals Table ──────────────────────────────────────────────────
st.subheader("Top Convergent Cross-Domain Signals")
st.caption("Signals scoring above 60 across ALL three domains simultaneously.")
df_conv = pd.DataFrame(CONVERGENT_SIGNALS_TABLE)
st.dataframe(
    df_conv,
    use_container_width=True,
    hide_index=True,
    column_config={
        "Technology": st.column_config.ProgressColumn("Technology & AI", min_value=0, max_value=100),
        "Finance":    st.column_config.ProgressColumn("Finance & Markets", min_value=0, max_value=100),
        "Culture":    st.column_config.ProgressColumn("Culture & Society", min_value=0, max_value=100),
        "Avg Score":  st.column_config.NumberColumn("Avg Score", format="%d"),
    },
)

st.divider()

# ── Key Risk Alert ────────────────────────────────────────────────────────────
st.subheader("Key Risk Indicators")
st.error(
    "**HIGH CONVERGENCE ALERT — Labor Market Disruption:** "
    "This signal scores above 72 in all three domains (Tech: 88, Finance: 72, Culture: 82). "
    "It is the highest cross-domain convergence in the dataset and represents a structural "
    "risk that transcends any single sector."
)
st.warning(
    "**NARROW-BASE RISK:** Current global resilience is overly concentrated in AI investment "
    "momentum and US fiscal support. Any correction in AI expected returns combined with "
    "trade policy escalation could cascade across all domains simultaneously."
)
