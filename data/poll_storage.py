"""Poll storage backend.

Writes to Google Sheets when [gcp_service_account] and [google_sheets] are
present in st.secrets (i.e. on Streamlit Cloud or with a local secrets.toml).
Falls back to a local data/poll_results.json file otherwise (local dev).
"""

import json
import os
from datetime import datetime, timezone

import streamlit as st

_POLL_FILE = os.path.join(os.path.dirname(__file__), "poll_results.json")
_MAX_RESPONSES = 1000

# Flat column order used in the Google Sheet header row
_COLUMNS = [
    "timestamp",
    "domain_priority",
    "conf_agentic_ai",
    "conf_crypto_institutional",
    "conf_authenticity_premium",
    "most_important_trends",
    "most_underrated_trend",
    "wildcard_agentic_breach",
    "wildcard_ai_correction",
    "quantum_timeline_view",
    "strongest_signal",
    "emerging_trend_freetext",
    "overall_sentiment",
]


# ── Backend detection ──────────────────────────────────────────────────────

def _sheets_configured() -> bool:
    try:
        return "gcp_service_account" in st.secrets and "google_sheets" in st.secrets
    except Exception:
        return False


def _get_worksheet():
    """Return the first worksheet of the configured Google Sheet, or None."""
    try:
        import gspread
        from google.oauth2.service_account import Credentials

        creds = Credentials.from_service_account_info(
            dict(st.secrets["gcp_service_account"]),
            scopes=[
                "https://www.googleapis.com/auth/spreadsheets",
                "https://www.googleapis.com/auth/drive",
            ],
        )
        gc = gspread.authorize(creds)
        name = st.secrets["google_sheets"]["spreadsheet_name"]
        return gc.open(name).sheet1
    except Exception:
        return None


# ── Public API ─────────────────────────────────────────────────────────────

@st.cache_data(ttl=30, show_spinner=False)
def load_poll_data() -> dict:
    """Return poll data as a dict with keys: responses, response_count, last_updated."""
    if _sheets_configured():
        ws = _get_worksheet()
        if ws is not None:
            return _load_from_sheet(ws)
    return _load_from_json()


def save_response(response: dict) -> None:
    """Append one poll response dict. Writes to Sheets or JSON depending on config."""
    if _sheets_configured():
        ws = _get_worksheet()
        if ws is not None:
            _save_to_sheet(ws, response)
            load_poll_data.clear()
            return
    _save_to_json(response)
    load_poll_data.clear()


# ── Google Sheets backend ──────────────────────────────────────────────────

def _load_from_sheet(ws) -> dict:
    rows = ws.get_all_records()
    responses = []
    for row in rows:
        responses.append({
            "timestamp": row.get("timestamp", ""),
            "domain_priority": row.get("domain_priority", ""),
            "confidence_overrides": {
                "Agentic AI Systems": _int(row.get("conf_agentic_ai"), 90),
                "Crypto Institutional Era": _int(row.get("conf_crypto_institutional"), 88),
                "Authenticity Premium": _int(row.get("conf_authenticity_premium"), 87),
            },
            "most_important_trends": [
                t.strip()
                for t in str(row.get("most_important_trends", "")).split(",")
                if t.strip()
            ],
            "most_underrated_trend": row.get("most_underrated_trend") or None,
            "wildcard_probabilities": {
                "Agentic Security Breach": row.get("wildcard_agentic_breach", ""),
                "AI Investment Correction": row.get("wildcard_ai_correction", ""),
            },
            "quantum_timeline_view": row.get("quantum_timeline_view", ""),
            "strongest_signal": row.get("strongest_signal", ""),
            "emerging_trend_freetext": row.get("emerging_trend_freetext") or None,
            "overall_sentiment": row.get("overall_sentiment", ""),
        })
    return {
        "responses": responses,
        "response_count": len(responses),
        "last_updated": responses[-1]["timestamp"] if responses else None,
    }


def _save_to_sheet(ws, response: dict) -> None:
    # Write header row if the sheet is empty
    if ws.row_count < 1 or not ws.get("A1"):
        ws.append_row(_COLUMNS, value_input_option="RAW")

    co = response.get("confidence_overrides", {})
    wp = response.get("wildcard_probabilities", {})
    ws.append_row(
        [
            response.get("timestamp", ""),
            response.get("domain_priority", ""),
            co.get("Agentic AI Systems", ""),
            co.get("Crypto Institutional Era", ""),
            co.get("Authenticity Premium", ""),
            ", ".join(response.get("most_important_trends") or []),
            response.get("most_underrated_trend") or "",
            wp.get("Agentic Security Breach", ""),
            wp.get("AI Investment Correction", ""),
            response.get("quantum_timeline_view", ""),
            response.get("strongest_signal", ""),
            response.get("emerging_trend_freetext") or "",
            response.get("overall_sentiment", ""),
        ],
        value_input_option="RAW",
    )


# ── JSON fallback backend ──────────────────────────────────────────────────

def _load_from_json() -> dict:
    if not os.path.exists(_POLL_FILE):
        return {"responses": [], "last_updated": None, "response_count": 0}
    with open(_POLL_FILE) as f:
        return json.load(f)


def _save_to_json(response: dict) -> None:
    data = _load_from_json()
    data["responses"].append(response)
    if len(data["responses"]) > _MAX_RESPONSES:
        data["responses"] = data["responses"][-_MAX_RESPONSES:]
    data["response_count"] = len(data["responses"])
    data["last_updated"] = datetime.now(timezone.utc).isoformat()
    tmp = _POLL_FILE + ".tmp"
    with open(tmp, "w") as f:
        json.dump(data, f, indent=2)
    os.replace(tmp, _POLL_FILE)


# ── Helpers ────────────────────────────────────────────────────────────────

def _int(value, default: int) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default
