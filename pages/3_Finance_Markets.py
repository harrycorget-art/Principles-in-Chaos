import streamlit as st
from data import finance
from components.layout import inject_css, render_page_header, render_sidebar_meta
from components.charts import make_radar_chart, make_gantt_timeline, make_confidence_bar
from components.cards import render_metric_row, render_wildcard_cards, render_trend_accordion
from components.filters import render_timeline_filter, render_confidence_slider

inject_css()
render_sidebar_meta()
render_page_header(
    "📈  Finance & Markets",
    "AI equity supercycle, crypto institutional era, tokenization, macro risk — forecasts",
)

# ── Sidebar filters ───────────────────────────────────────────────────────────
selected_timelines = render_timeline_filter(key="fin_timeline")
min_conf           = render_confidence_slider(key="fin_conf")

filtered = [
    t for t in finance.TRENDS
    if t["timeline"] in selected_timelines and t["confidence"] >= min_conf
]

# ── Current State Metrics ─────────────────────────────────────────────────────
st.subheader("Current State")
render_metric_row(finance.CURRENT_STATE_CARDS)
st.divider()

# ── Charts ────────────────────────────────────────────────────────────────────
if not filtered:
    st.info("No trends match the current filters. Adjust the sidebar controls.")
else:
    col_left, col_right = st.columns(2)
    with col_left:
        st.plotly_chart(
            make_radar_chart(filtered, finance.DOMAIN),
            use_container_width=True,
        )
    with col_right:
        st.plotly_chart(
            make_confidence_bar(filtered, finance.DOMAIN),
            use_container_width=True,
        )

    st.subheader("Forecast Horizon Timeline")
    st.plotly_chart(
        make_gantt_timeline(filtered, finance.DOMAIN),
        use_container_width=True,
    )

    st.divider()

    # ── Trend Accordions ──────────────────────────────────────────────────────
    st.subheader("Trend Deep Dives")
    render_trend_accordion(filtered)

    st.divider()

# ── Wildcard Risks ────────────────────────────────────────────────────────────
render_wildcard_cards(finance.WILDCARDS)
