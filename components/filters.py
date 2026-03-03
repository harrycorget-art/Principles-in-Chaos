import streamlit as st
from config import DOMAINS, TIMELINE_LABELS


def render_domain_filter() -> list:
    return st.sidebar.multiselect(
        "Filter Domains",
        options=DOMAINS,
        default=DOMAINS,
    )


def render_timeline_filter(key: str = "timeline") -> list:
    return st.sidebar.multiselect(
        "Filter Horizon",
        options=list(TIMELINE_LABELS.keys()),
        default=list(TIMELINE_LABELS.keys()),
        format_func=lambda x: TIMELINE_LABELS[x],
        key=key,
    )


def render_confidence_slider(key: str = "confidence") -> int:
    return st.sidebar.slider(
        "Min Confidence Score",
        min_value=0,
        max_value=100,
        value=0,
        step=5,
        key=key,
    )
