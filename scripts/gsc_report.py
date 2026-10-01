#!/usr/bin/env python3
"""Read-only Google Search Console report for TemplateHub.

Uses a service account JSON. Never commit that file.
  GSC_CREDENTIALS  path to the JSON key
  GSC_SITE_URL     default https://templatehub.co.in/
"""
from __future__ import annotations

import os
import urllib.parse
from datetime import date, timedelta

import requests
from google.auth.transport.requests import Request
from google.oauth2 import service_account

SITE = os.environ.get("GSC_SITE_URL", "https://templatehub.co.in/")
KEY = os.environ.get(
    "GSC_CREDENTIALS",
    "/Users/arshadansari/Downloads/property-management-489809-b4b484303368.json",
)
SCOPE = "https://www.googleapis.com/auth/webmasters.readonly"


def token() -> str:
    creds = service_account.Credentials.from_service_account_file(KEY, scopes=[SCOPE])
    creds.refresh(Request())
    return creds.token


def window(lag_days: int = 3, length: int = 7) -> tuple[date, date, date, date]:
    end = date.today() - timedelta(days=lag_days)
    cur_start = end - timedelta(days=length - 1)
    prev_end = cur_start - timedelta(days=1)
    prev_start = prev_end - timedelta(days=length - 1)
    return cur_start, end, prev_start, prev_end


def query(headers: dict, start: date, end: date, dimensions: list[str] | None = None, row_limit: int = 25, **extra) -> list[dict]:
    encoded = urllib.parse.quote(SITE, safe="")
    url = f"https://searchconsole.googleapis.com/webmasters/v3/sites/{encoded}/searchAnalytics/query"
    body = {"startDate": str(start), "endDate": str(end), "rowLimit": row_limit, **extra}
    if dimensions:
        body["dimensions"] = dimensions
    response = requests.post(url, headers=headers, json=body, timeout=60)
    if response.status_code != 200:
        raise SystemExit(f"GSC error {response.status_code}: {response.text[:800]}")
    return response.json().get("rows") or []


def totals(headers: dict, start: date, end: date) -> dict:
    rows = query(headers, start, end)
    if not rows:
        return {"clicks": 0, "impressions": 0, "ctr": 0.0, "position": 0.0}
    row = rows[0]
    return {
        "clicks": row["clicks"],
        "impressions": row["impressions"],
        "ctr": row["ctr"],
        "position": row["position"],
    }


def print_table(title: str, cur: dict[tuple, dict], prev: dict[tuple, dict], n: int) -> None:
    keys = list(dict.fromkeys([*cur, *prev]))[:n]
    print(f"\n{title}")
    print(f"{'key':<72} {'clk':>4} {'impr':>6} {'ctr':>6} {'pos':>5}  vs impr")
    for key in keys:
        a, b = cur.get(key, {}), prev.get(key, {})
        name = key[0] if key else ""
        impr = a.get("impressions", 0)
        print(
            f"{name[:72]:<72} {a.get('clicks', 0):>4.0f} {impr:>6.0f} "
            f"{a.get('ctr', 0) * 100:>5.1f}% {a.get('position', 0):>5.1f}  "
            f"{impr - b.get('impressions', 0):+.0f}"
        )


def index_rows(rows: list[dict]) -> dict[tuple, dict]:
    return {tuple(row.get("keys") or []): row for row in rows}


def main() -> None:
    if not os.path.isfile(KEY):
        raise SystemExit(f"Missing credentials file: {KEY}")
    cur_start, end, prev_start, prev_end = window()
    headers = {"Authorization": f"Bearer {token()}", "Content-Type": "application/json"}
    t1, t0 = totals(headers, cur_start, end), totals(headers, prev_start, prev_end)
    print(f"Site {SITE}")
    print(f"Current {cur_start} .. {end}")
    print(f"Previous {prev_start} .. {prev_end}")
    print("\nSITE TOTALS")
    print(f"  clicks      {t1['clicks']:.0f}  (was {t0['clicks']:.0f})")
    print(f"  impressions {t1['impressions']:.0f}  (was {t0['impressions']:.0f})")
    print(f"  ctr         {t1['ctr'] * 100:.2f}%  (was {t0['ctr'] * 100:.2f}%)")
    print(f"  position    {t1['position']:.2f}  (was {t0['position']:.2f})")
    for dim, title, n in (
        ("query", "TOP QUERY", 20),
        ("page", "TOP PAGE", 15),
        ("country", "TOP COUNTRY", 15),
        ("device", "TOP DEVICE", 5),
    ):
        print_table(
            title,
            index_rows(query(headers, cur_start, end, [dim], n)),
            index_rows(query(headers, prev_start, prev_end, [dim], n)),
            n,
        )


if __name__ == "__main__":
    main()
