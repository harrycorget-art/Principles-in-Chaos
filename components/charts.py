import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
from config import PLOTLY_TEMPLATE, DOMAIN_COLORS


def make_radar_chart(trends: list, domain: str) -> go.Figure:
    names = [t["name"] for t in trends]
    confidence = [t["confidence"] for t in trends]
    impact = [t["impact"] for t in trends]

    # Close the polygon
    names_closed = names + [names[0]]
    conf_closed = confidence + [confidence[0]]
    imp_closed = impact + [impact[0]]

    color = DOMAIN_COLORS.get(domain, "#00B4D8")

    fig = go.Figure()
    fig.add_trace(go.Scatterpolar(
        r=conf_closed,
        theta=names_closed,
        fill="toself",
        name="Confidence",
        line_color=color,
        fillcolor=color,
        opacity=0.45,
    ))
    fig.add_trace(go.Scatterpolar(
        r=imp_closed,
        theta=names_closed,
        fill="toself",
        name="Impact",
        line_color="#FFD166",
        fillcolor="#FFD166",
        opacity=0.25,
    ))
    fig.update_layout(
        polar=dict(radialaxis=dict(visible=True, range=[0, 100])),
        template=PLOTLY_TEMPLATE,
        title=f"{domain} — Confidence & Impact",
        height=480,
        paper_bgcolor="rgba(0,0,0,0)",
        showlegend=True,
        legend=dict(orientation="h", yanchor="bottom", y=-0.15),
    )
    return fig


def make_gantt_timeline(trends: list, domain: str) -> go.Figure:
    RANGES = {
        "short":  ("2026-01-01", "2026-12-31"),
        "medium": ("2026-06-01", "2028-12-31"),
        "long":   ("2028-01-01", "2031-01-01"),
    }
    rows = []
    for t in trends:
        start, end = RANGES[t["timeline"]]
        rows.append({
            "Trend":    t["name"],
            "Start":    start,
            "Finish":   end,
            "Category": t["category"],
            "Timeline": t["timeline"].title(),
            "Confidence": t["confidence"],
        })
    df = pd.DataFrame(rows)
    color_map = {"Short": "#06D6A0", "Medium": "#00B4D8", "Long": "#C084FC"}
    fig = px.timeline(
        df,
        x_start="Start",
        x_end="Finish",
        y="Trend",
        color="Timeline",
        color_discrete_map=color_map,
        hover_data={"Confidence": True, "Category": True},
        title=f"{domain} — Forecast Horizons",
        template=PLOTLY_TEMPLATE,
        height=max(380, len(trends) * 38),
    )
    fig.update_yaxes(autorange="reversed")
    fig.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        legend_title_text="Horizon",
    )
    return fig


def make_confidence_bar(trends: list, domain: str) -> go.Figure:
    sorted_trends = sorted(trends, key=lambda t: t["confidence"])
    names = [t["name"] for t in sorted_trends]
    scores = [t["confidence"] for t in sorted_trends]
    colors = []
    for s in scores:
        if s >= 80:
            colors.append("#06D6A0")
        elif s >= 55:
            colors.append("#FFD166")
        else:
            colors.append("#EF476F")

    fig = go.Figure(go.Bar(
        x=scores,
        y=names,
        orientation="h",
        marker_color=colors,
        text=scores,
        textposition="outside",
    ))
    fig.update_layout(
        title=f"{domain} — Confidence Scores",
        template=PLOTLY_TEMPLATE,
        xaxis=dict(range=[0, 110], title="Score (0–100)"),
        height=max(380, len(trends) * 38),
        paper_bgcolor="rgba(0,0,0,0)",
    )
    return fig


def make_convergence_heatmap(matrix: dict) -> go.Figure:
    fig = go.Figure(data=go.Heatmap(
        z=matrix["values"],
        x=matrix["domains"],
        y=matrix["signals"],
        colorscale="Viridis",
        text=matrix["values"],
        texttemplate="%{text}",
        hovertemplate="Signal: %{y}<br>Domain: %{x}<br>Convergence: %{z}<extra></extra>",
        colorbar=dict(title="Strength"),
    ))
    fig.update_layout(
        title="Cross-Domain Signal Convergence Matrix",
        template=PLOTLY_TEMPLATE,
        height=560,
        paper_bgcolor="rgba(0,0,0,0)",
        xaxis_title="Domain",
        yaxis_title="Signal",
    )
    return fig


def make_overview_scatter(all_trends: list) -> go.Figure:
    timeline_size = {"short": 22, "medium": 16, "long": 12}
    df = pd.DataFrame([{
        **t,
        "bubble_size": timeline_size.get(t["timeline"], 16),
    } for t in all_trends])

    fig = px.scatter(
        df,
        x="confidence",
        y="impact",
        size="bubble_size",
        color="domain",
        hover_name="name",
        hover_data={"category": True, "timeline": True, "bubble_size": False},
        color_discrete_map=DOMAIN_COLORS,
        title="All 30 Trends — Confidence vs. Impact",
        labels={"confidence": "Confidence Score", "impact": "Impact Score"},
        template=PLOTLY_TEMPLATE,
        height=520,
    )
    fig.update_traces(textposition="top center")
    fig.update_layout(paper_bgcolor="rgba(0,0,0,0)")
    return fig
