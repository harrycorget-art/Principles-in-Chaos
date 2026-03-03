import streamlit as st
from config import RISK_COLORS


def render_metric_row(cards: list) -> None:
    cols = st.columns(len(cards))
    for col, card in zip(cols, cards):
        col.metric(label=card["label"], value=card["value"], delta=card["delta"])


def render_wildcard_cards(wildcards: list) -> None:
    st.subheader("Wildcard Scenarios")
    for wc in wildcards:
        color = RISK_COLORS.get(wc["risk_level"], "#888888")
        st.markdown(
            f"""
            <div style="
                border-left: 5px solid {color};
                background: rgba(255,255,255,0.04);
                padding: 0.9rem 1.1rem;
                border-radius: 6px;
                margin-bottom: 0.75rem;
            ">
                <span style="color:{color}; font-size:0.72rem; font-weight:700;
                             text-transform:uppercase; letter-spacing:0.1em;">
                    {wc['risk_level'].upper()} RISK
                </span><br/>
                <strong style="color:#f1f5f9; font-size:1rem;">{wc['title']}</strong><br/>
                <span style="color:#94a3b8; font-size:0.88rem;">{wc['description']}</span>
            </div>
            """,
            unsafe_allow_html=True,
        )


def render_trend_accordion(trends: list) -> None:
    timeline_label = {
        "short":  "6–12 months",
        "medium": "1–3 years",
        "long":   "3–5 years",
    }
    for trend in trends:
        label = f"**{trend['name']}**  —  _{trend['category']}_"
        with st.expander(label):
            c1, c2, c3 = st.columns(3)
            c1.metric("Confidence", f"{trend['confidence']}/100")
            c2.metric("Impact",     f"{trend['impact']}/100")
            c3.metric("Horizon",    timeline_label.get(trend["timeline"], trend["timeline"]))
            st.markdown("**Short-Term Forecast (6–12 months)**")
            st.info(trend["short_forecast"])
            st.markdown("**Medium-Term Forecast (1–3 years)**")
            st.info(trend["medium_forecast"])
