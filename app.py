import streamlit as st
from config import APP_TITLE, PAGE_ICON
from components.layout import inject_css, render_sidebar_meta

st.set_page_config(
    page_title=APP_TITLE,
    page_icon=PAGE_ICON,
    layout="wide",
    initial_sidebar_state="expanded",
)

inject_css()
render_sidebar_meta()

st.title(f"{PAGE_ICON}  {APP_TITLE}")
st.markdown("#### A multi-domain research dashboard — Q1 2026")
st.divider()

col1, col2, col3 = st.columns(3)
col1.metric("Domains Analyzed", "3", "Tech · Finance · Culture")
col2.metric("Trends Tracked", "30", "10 per domain")
col3.metric("Sources", "28", "Academic · Institutional · News")

st.divider()

st.markdown("""
This interactive report synthesizes trending topics and predictive analysis across three domains:

| Domain | Focus | Horizon |
|---|---|---|
| 🤖 **Technology & AI** | Agentic systems, quantum computing, physical AI, regulation | 6 mo – 3 yr |
| 📈 **Finance & Markets** | AI supercycle, crypto institutional era, tokenization, macro risk | 6 mo – 3 yr |
| 🌍 **Culture & Society** | Digital fatigue, authenticity premium, demographic shifts | 6 mo – 3 yr |

**Navigate using the sidebar** to explore each domain, view the cross-domain synthesis, or browse sources.

---

### How to read this report

- **Confidence** (0–100): How certain are we this trend is real and sustained?
- **Impact** (0–100): How transformative would this trend be if it plays out?
- **Horizon**: Short (6–12 mo) · Medium (1–3 yr) · Long (3–5 yr)
- **Wildcards**: Low-probability, high-impact scenarios that could disrupt the baseline forecast.

> *Data sourced from IBM, MIT Technology Review, J.P. Morgan, IMF, World Bank, Grayscale,*
> *Coinbase, Ogilvy, WEF, CFR, Stimson Center, arXiv, and 18 additional institutional sources.*
""")
