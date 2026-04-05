from datetime import datetime, timezone

import pandas as pd
import plotly.graph_objects as go
import streamlit as st

from components.layout import inject_css, render_page_header, render_sidebar_meta
from config import DOMAIN_COLORS, PLOTLY_TEMPLATE, RISK_COLORS
from data import tech_ai, finance, culture
from data.poll_storage import load_poll_data, save_response

# ── Constants ─────────────────────────────────────────────────────────────────

ALL_TRENDS = (
    [(t["name"], t["confidence"], "Technology & AI") for t in tech_ai.TRENDS]
    + [(t["name"], t["confidence"], "Finance & Markets") for t in finance.TRENDS]
    + [(t["name"], t["confidence"], "Culture & Society") for t in culture.TRENDS]
)
ALL_TREND_NAMES = [t[0] for t in ALL_TRENDS]
RESEARCH_CONF = {t[0]: t[1] for t in ALL_TRENDS}
TREND_DOMAIN = {t[0]: t[2] for t in ALL_TRENDS}

WILDCARD_SCALE = ["Very unlikely", "Possible", "Likely", "Near-certain"]
SENTIMENT_OPTIONS = ["Optimistic", "Cautiously optimistic", "Neutral", "Cautiously pessimistic", "Pessimistic"]

CROSS_DOMAIN_SIGNALS = [
    "AI Automation",
    "Labor Market Disruption",
    "Geopolitical Fragmentation",
    "Synthetic Media",
    "Dollar Reserve Pressure",
    "Attention Economy Collapse",
]

# ── Page setup ────────────────────────────────────────────────────────────────

inject_css()
render_sidebar_meta()
render_page_header(
    "🗳️  Community Intelligence Poll",
    "How does collective intuition compare to the research? Rate trends, surface new signals, challenge the data.",
)

poll_data = load_poll_data()
response_count = poll_data["response_count"]

col_a, col_b, col_c = st.columns(3)
col_a.metric("Poll Responses", str(response_count), "Submit yours below")
col_b.metric("Trends Rated", "30", "Across 3 domains")
col_c.metric("Last Response", poll_data["last_updated"][:10] if poll_data["last_updated"] else "—")

st.info(
    "Your responses are anonymous and aggregated. They feed directly into the `/trend-analysis` "
    "skill, which compares community sentiment against the research confidence scores and surfaces "
    "emerging signals not yet captured in the dashboard."
)
st.divider()

# ── Poll Form ─────────────────────────────────────────────────────────────────

if "poll_submitted" not in st.session_state:
    st.session_state.poll_submitted = False

if not st.session_state.poll_submitted:
    st.subheader("Share Your Assessment")

    with st.form("community_poll", clear_on_submit=False):

        # Q1 — Domain Priority
        st.markdown("**Q1. Which domain will have the most real-world impact in the next 12 months?**")
        domain_priority = st.radio(
            "Domain priority",
            ["Technology & AI", "Finance & Markets", "Culture & Society", "Roughly equal across all"],
            label_visibility="collapsed",
        )

        st.divider()

        # Q2–Q4 — Confidence overrides (3 spotlight trends)
        st.markdown(
            "**Q2–Q4. Confidence calibration** — The research assigns confidence scores to each trend. "
            "Adjust the sliders to reflect *your* assessment."
        )
        st.caption("Research score shown in brackets. Drag to override.")

        col1, col2, col3 = st.columns(3)
        with col1:
            conf_agentic_ai = st.slider(
                "Agentic AI Systems [research: 90]",
                0, 100, 90, step=1,
            )
        with col2:
            conf_crypto_inst = st.slider(
                "Crypto Institutional Era [research: 88]",
                0, 100, 88, step=1,
            )
        with col3:
            conf_authenticity = st.slider(
                "Authenticity Premium [research: 87]",
                0, 100, 87, step=1,
            )

        st.divider()

        # Q5 — Most important trends (multiselect, max 3)
        st.markdown("**Q5. Which trends do you personally find most significant? (Select up to 3)**")
        most_important = st.multiselect(
            "Most important trends",
            ALL_TREND_NAMES,
            max_selections=3,
            label_visibility="collapsed",
        )

        # Q6 — Most underrated
        st.markdown("**Q6. Which trend do you think is most UNDERRATED by mainstream analysis?**")
        most_underrated = st.selectbox(
            "Most underrated trend",
            ["— I agree with the research rankings —"] + ALL_TREND_NAMES,
            label_visibility="collapsed",
        )

        st.divider()

        # Q7–Q8 — Wildcard probabilities
        st.markdown("**Q7–Q8. Wildcard Probability** — How likely are these tail-risk scenarios within 2 years?**")

        col4, col5 = st.columns(2)
        with col4:
            wildcard_agentic = st.radio(
                "Agentic Security Breach (research: HIGH risk)",
                WILDCARD_SCALE,
                index=2,
            )
        with col5:
            wildcard_ai_correction = st.radio(
                "AI Investment Correction — dot-com scale (research: HIGH risk)",
                WILDCARD_SCALE,
                index=1,
            )

        st.divider()

        # Q9 — Timeline challenge
        st.markdown(
            "**Q9. Quantum-Classical Hybrid Computing** is rated as a medium-term (1–3 year) trend. "
            "Do you agree?"
        )
        quantum_timeline = st.radio(
            "Quantum timeline view",
            [
                "Agree — 1–3 years is right",
                "Will take longer — 3–5+ years",
                "Already happening now — sooner than rated",
                "Overhyped — won't materialize in this timeframe",
            ],
            label_visibility="collapsed",
        )

        st.divider()

        # Q10 — Strongest convergence signal
        st.markdown(
            "**Q10. Cross-domain signals** — Which signal do you think is the strongest convergence "
            "point right now?"
        )
        strongest_signal = st.radio(
            "Strongest signal",
            CROSS_DOMAIN_SIGNALS,
            label_visibility="collapsed",
        )

        st.divider()

        # Q11 — Emerging trend freetext
        st.markdown(
            "**Q11. Missing trend** — Name one trend or development NOT covered in this report "
            "that you think should be tracked. *(Optional, max 200 chars)*"
        )
        emerging_freetext = st.text_input(
            "Emerging trend",
            max_chars=200,
            placeholder="e.g. Neuromorphic computing, longevity biotech, CBDC adoption...",
            label_visibility="collapsed",
        )

        st.divider()

        # Q12 — Overall sentiment
        st.markdown("**Q12. Overall, your outlook on the 2026–2028 macro environment is:**")
        overall_sentiment = st.radio(
            "Overall sentiment",
            SENTIMENT_OPTIONS,
            index=1,
            label_visibility="collapsed",
        )

        submitted = st.form_submit_button("Submit My Assessment", type="primary", use_container_width=True)

    if submitted:
        response = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "domain_priority": domain_priority,
            "confidence_overrides": {
                "Agentic AI Systems": conf_agentic_ai,
                "Crypto Institutional Era": conf_crypto_inst,
                "Authenticity Premium": conf_authenticity,
            },
            "most_important_trends": most_important,
            "most_underrated_trend": most_underrated
            if most_underrated != "— I agree with the research rankings —"
            else None,
            "wildcard_probabilities": {
                "Agentic Security Breach": wildcard_agentic,
                "AI Investment Correction": wildcard_ai_correction,
            },
            "quantum_timeline_view": quantum_timeline,
            "strongest_signal": strongest_signal,
            "emerging_trend_freetext": emerging_freetext.strip() if emerging_freetext.strip() else None,
            "overall_sentiment": overall_sentiment,
        }
        save_response(response)
        st.session_state.poll_submitted = True
        st.rerun()

else:
    st.success(
        "Thanks — your assessment has been recorded. "
        "Scroll down to see the aggregated community results."
    )
    if st.button("Submit another response"):
        st.session_state.poll_submitted = False
        st.rerun()

st.divider()

# ── Aggregate Results ─────────────────────────────────────────────────────────

poll_data = load_poll_data()
responses = poll_data["responses"]

if not responses:
    st.info("No responses yet. Be the first to submit your assessment above.")
    st.stop()

st.subheader(f"Community Results  ·  {len(responses)} response{'s' if len(responses) != 1 else ''}")

tab1, tab2, tab3, tab4 = st.tabs(
    ["🌐 Domain Priority", "📊 Confidence Comparison", "⚠️ Wildcard Risk", "💡 Emerging Trends"]
)

# ── Tab 1: Domain Priority ────────────────────────────────────────────────────

with tab1:
    domain_votes: dict[str, int] = {}
    for r in responses:
        d = r.get("domain_priority", "")
        domain_votes[d] = domain_votes.get(d, 0) + 1

    # Research avg confidence per domain
    research_avgs = {
        "Technology & AI": sum(t[1] for t in ALL_TRENDS if t[2] == "Technology & AI") / 10,
        "Finance & Markets": sum(t[1] for t in ALL_TRENDS if t[2] == "Finance & Markets") / 10,
        "Culture & Society": sum(t[1] for t in ALL_TRENDS if t[2] == "Culture & Society") / 10,
    }

    domains_ordered = ["Technology & AI", "Finance & Markets", "Culture & Society", "Roughly equal across all"]
    vote_pcts = [
        round(domain_votes.get(d, 0) / len(responses) * 100, 1) for d in domains_ordered
    ]
    research_scores = [research_avgs.get(d, 0) for d in domains_ordered]

    fig_domain = go.Figure()
    fig_domain.add_bar(
        name="Community Priority %",
        x=domains_ordered,
        y=vote_pcts,
        marker_color=[DOMAIN_COLORS.get(d, "#94a3b8") for d in domains_ordered],
        text=[f"{v}%" for v in vote_pcts],
        textposition="outside",
    )
    fig_domain.add_bar(
        name="Research Avg Confidence",
        x=domains_ordered,
        y=research_scores,
        marker_color="rgba(255,255,255,0.15)",
        text=[f"{s:.0f}" for s in research_scores],
        textposition="outside",
    )
    fig_domain.update_layout(
        template=PLOTLY_TEMPLATE,
        barmode="group",
        title="Community Domain Priority vs. Research Avg Confidence",
        yaxis_title="Score / Vote %",
        height=420,
        legend=dict(orientation="h", y=-0.2),
    )
    st.plotly_chart(fig_domain, use_container_width=True)

    # Priority ranking summary
    top_domain = max(domain_votes, key=lambda d: domain_votes.get(d, 0)) if domain_votes else "—"
    research_rank = sorted(research_avgs, key=research_avgs.get, reverse=True)
    community_rank_idx = domains_ordered.index(top_domain) + 1 if top_domain in domains_ordered else "—"
    research_rank_idx = (research_rank.index(top_domain) + 1) if top_domain in research_rank else "—"
    st.caption(
        f"Community #1: **{top_domain}** "
        f"(research ranks it #{research_rank_idx} by avg confidence)"
    )

# ── Tab 2: Confidence Comparison ─────────────────────────────────────────────

with tab2:
    # Only the 3 spotlight trends have community override data
    spotlight_trends = ["Agentic AI Systems", "Crypto Institutional Era", "Authenticity Premium"]
    rows = []
    for trend_name in spotlight_trends:
        vals = [
            r["confidence_overrides"].get(trend_name)
            for r in responses
            if isinstance(r.get("confidence_overrides"), dict)
            and r["confidence_overrides"].get(trend_name) is not None
        ]
        if vals:
            community_avg = round(sum(vals) / len(vals), 1)
            research_score = RESEARCH_CONF[trend_name]
            delta = round(community_avg - research_score, 1)
            rows.append(
                {
                    "Trend": trend_name,
                    "Domain": TREND_DOMAIN[trend_name],
                    "Research Score": research_score,
                    "Community Avg": community_avg,
                    "Delta (Community − Research)": delta,
                    "Direction": "▲ More confident" if delta > 0 else ("▼ Less confident" if delta < 0 else "≈ Aligned"),
                }
            )

    if rows:
        df_conf = pd.DataFrame(rows).sort_values("Delta (Community − Research)", key=abs, ascending=False)
        st.dataframe(
            df_conf,
            use_container_width=True,
            hide_index=True,
            column_config={
                "Research Score": st.column_config.ProgressColumn(
                    "Research Score", min_value=0, max_value=100, format="%d"
                ),
                "Community Avg": st.column_config.ProgressColumn(
                    "Community Avg", min_value=0, max_value=100, format="%.1f"
                ),
            },
        )

        # Sentiment gap callout
        big_gaps = [r for r in rows if abs(r["Delta (Community − Research)"]) > 15]
        if big_gaps:
            st.markdown("**Notable divergences (gap > ±15 points):**")
            for g in big_gaps:
                direction = "more" if g["Delta (Community − Research)"] > 0 else "less"
                st.markdown(
                    f"- **{g['Trend']}**: Community is {direction} confident "
                    f"({g['Community Avg']} vs research {g['Research Score']}, "
                    f"Δ {g['Delta (Community − Research)']:+.1f})"
                )
        else:
            st.success("Community confidence scores are well-aligned with the research (all gaps ≤ ±15 points).")
    else:
        st.info("No confidence override data yet.")

# ── Tab 3: Wildcard Risk ──────────────────────────────────────────────────────

with tab3:
    scale_map = {"Very unlikely": 1, "Possible": 2, "Likely": 3, "Near-certain": 4}
    research_risk_map = {"high": 3, "medium": 2, "low": 1}

    wildcards_to_show = [
        ("Agentic Security Breach", "high"),
        ("AI Investment Correction", "high"),
    ]

    wc_rows = []
    for wc_name, research_risk in wildcards_to_show:
        votes_raw = [
            r.get("wildcard_probabilities", {}).get(wc_name)
            for r in responses
            if isinstance(r.get("wildcard_probabilities"), dict)
        ]
        votes = [v for v in votes_raw if v in scale_map]
        if votes:
            vote_counts = {label: votes.count(label) for label in WILDCARD_SCALE}
            community_avg = round(sum(scale_map[v] for v in votes) / len(votes), 2)
            research_num = research_risk_map[research_risk]
            wc_rows.append(
                {
                    "Wildcard": wc_name,
                    "Research Risk": research_risk.capitalize(),
                    "Community Avg (1–4)": community_avg,
                    "Research (1–3)": research_num,
                    "Notable Disagreement": abs(community_avg - research_num) > 1,
                    "_vote_counts": vote_counts,
                }
            )

    if wc_rows:
        for row in wc_rows:
            vc = row["_vote_counts"]
            labels = list(vc.keys())
            values = list(vc.values())
            color_map = {
                "Very unlikely": RISK_COLORS["low"],
                "Possible": RISK_COLORS["medium"],
                "Likely": RISK_COLORS["high"],
                "Near-certain": "#c0392b",
            }
            fig_wc = go.Figure(
                go.Bar(
                    x=labels,
                    y=values,
                    marker_color=[color_map[l] for l in labels],
                    text=values,
                    textposition="outside",
                )
            )
            fig_wc.update_layout(
                template=PLOTLY_TEMPLATE,
                title=f"{row['Wildcard']}  —  Research risk: {row['Research Risk']}",
                yaxis_title="Votes",
                height=300,
            )
            st.plotly_chart(fig_wc, use_container_width=True)
            if row["Notable Disagreement"]:
                st.warning(
                    f"Notable disagreement: Community avg {row['Community Avg (1–4)']:.1f}/4 "
                    f"vs research {row['Research (1–3)']}/3."
                )
    else:
        st.info("No wildcard probability data yet.")

# ── Tab 4: Emerging Trends ────────────────────────────────────────────────────

with tab4:
    freetext_entries = [
        r["emerging_trend_freetext"]
        for r in responses
        if r.get("emerging_trend_freetext")
    ]

    if freetext_entries:
        st.markdown(
            f"**{len(freetext_entries)} respondent{'s' if len(freetext_entries) != 1 else ''} "
            f"named an emerging trend not in the current dashboard:**"
        )
        st.caption(
            "These are raw community submissions. Run `/trend-analysis` in a Claude session "
            "to cluster themes and validate them against institutional sources via MCP fetch."
        )
        for i, entry in enumerate(reversed(freetext_entries), 1):
            st.markdown(f"{i}. {entry}")
    else:
        st.info("No emerging trend nominations yet.")

    st.divider()

    # Sentiment breakdown
    st.markdown("**Overall 2026–2028 Outlook — Community Sentiment**")
    sentiment_counts = {}
    for r in responses:
        s = r.get("overall_sentiment", "")
        if s:
            sentiment_counts[s] = sentiment_counts.get(s, 0) + 1

    sentiment_color = {
        "Optimistic": RISK_COLORS["low"],
        "Cautiously optimistic": "#4ade80",
        "Neutral": "#94a3b8",
        "Cautiously pessimistic": RISK_COLORS["medium"],
        "Pessimistic": RISK_COLORS["high"],
    }
    ordered_sentiments = [s for s in SENTIMENT_OPTIONS if s in sentiment_counts]
    fig_sent = go.Figure(
        go.Bar(
            x=ordered_sentiments,
            y=[sentiment_counts[s] for s in ordered_sentiments],
            marker_color=[sentiment_color[s] for s in ordered_sentiments],
            text=[sentiment_counts[s] for s in ordered_sentiments],
            textposition="outside",
        )
    )
    fig_sent.update_layout(
        template=PLOTLY_TEMPLATE,
        title="Community Macro Outlook",
        yaxis_title="Responses",
        height=320,
    )
    st.plotly_chart(fig_sent, use_container_width=True)

# ── Analysis Insight Block ────────────────────────────────────────────────────

st.divider()
st.subheader("Analysis Notes")
st.markdown(
    """
**How this poll feeds the research:**

- **Confidence overrides** → The `/trend-analysis` skill computes sentiment gaps (community avg − research score).
  Gaps > ±15 points trigger live source validation via the MCP fetch server.
- **Most important trends** → Tally used to surface community-ranked priorities alongside research impact scores.
- **Emerging trend nominations** → Clustered by theme; candidates with 3+ mentions get a research backing check.
- **Wildcard probabilities** → Compared to research `risk_level`; disagreements > 1 scale point flagged for review.

To run the full analysis, start a Claude session in this project directory and type `/trend-analysis`.
"""
)
