import streamlit as st
from data.sources import SOURCES
from components.layout import inject_css, render_page_header, render_sidebar_meta
from config import DOMAINS

inject_css()
render_sidebar_meta()
render_page_header(
    "Sources & Bibliography",
    "All 28 institutional, academic, and news sources used in this report",
)

# ── Filter ────────────────────────────────────────────────────────────────────
domain_options = ["All"] + DOMAINS
selected = st.selectbox("Filter by Domain", options=domain_options, index=0)

filtered = (
    SOURCES
    if selected == "All"
    else [s for s in SOURCES if s["domain"] == selected]
)

st.caption(f"Showing {len(filtered)} of {len(SOURCES)} sources.")
st.divider()

# ── Sources by Type ───────────────────────────────────────────────────────────
type_order = ["Report", "Academic Paper", "Article"]
for stype in type_order:
    group = [s for s in filtered if s["type"] == stype]
    if not group:
        continue
    st.subheader(f"{stype}s" if not stype.endswith("s") else stype)
    for s in sorted(group, key=lambda x: x["domain"]):
        st.markdown(
            f"- [{s['title']}]({s['url']})  \n"
            f"  *{s['author']}* · {s['domain']} · {s['year']}"
        )

# Handle types not in our ordered list
remaining = [s for s in filtered if s["type"] not in type_order]
if remaining:
    st.subheader("Other")
    for s in remaining:
        st.markdown(
            f"- [{s['title']}]({s['url']})  \n"
            f"  *{s['author']}* · {s['domain']} · {s['year']}"
        )
