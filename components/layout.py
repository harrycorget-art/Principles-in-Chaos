import streamlit as st
from config import APP_TITLE, REPORT_DATE
import os


def inject_css() -> None:
    css_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets", "style.css")
    if os.path.exists(css_path):
        with open(css_path) as f:
            st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)


def render_page_header(title: str, subtitle: str = "") -> None:
    st.title(title)
    if subtitle:
        st.markdown(f"*{subtitle}*")
    st.divider()


def render_sidebar_meta() -> None:
    st.sidebar.markdown(f"**{APP_TITLE}**")
    st.sidebar.caption(f"Report Date: {REPORT_DATE}")
    st.sidebar.divider()
