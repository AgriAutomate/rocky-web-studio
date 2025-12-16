#!/usr/bin/env python3
"""
Compare production and preview deployments to verify they match.

Usage:
    python scripts/compare_deploy.py
    python scripts/compare_deploy.py --preview https://preview-url.vercel.app
"""

import json
import re
import sys
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

# Default URLs (can be overridden via command-line args)
DEFAULT_PRODUCTION = "https://rockywebstudio.com.au"
DEFAULT_PREVIEW = None  # Set via --preview flag or env var

HEADER_KEYS = [
    "server",
    "x-vercel-id",
    "x-vercel-cache",
    "x-vercel-ip-country",
    "x-matched-path",
    "x-vercel-deployment-url",
    "x-vercel-powered-by",
]


def fetch(url: str):
    """Fetch URL and return final URL, status, headers, and body."""
    req = Request(url, headers={"User-Agent": "cursor-agent/1.0", "Accept": "text/html,*/*"})
    with urlopen(req, timeout=30) as resp:
        final_url = resp.geturl()
        status = getattr(resp, "status", None)
        headers = {k.lower(): v for k, v in resp.headers.items()}
        body = resp.read().decode("utf-8", errors="ignore")
    return final_url, status, headers, body


def extract_build_id(html: str):
    """Extract Next.js buildId from __NEXT_DATA__ script tag."""
    m = re.search(r'"buildId":"([^"]+)"', html)
    return m.group(1) if m else None


def main():
    # Simple CLI parsing (can be enhanced with argparse if needed)
    preview_url = None
    if len(sys.argv) > 1:
        if sys.argv[1] == "--preview" and len(sys.argv) > 2:
            preview_url = sys.argv[2]
        else:
            print("Usage: python scripts/compare_deploy.py [--preview URL]")
            sys.exit(1)

    urls = [DEFAULT_PRODUCTION]
    if preview_url:
        urls.append(preview_url)
    elif DEFAULT_PREVIEW:
        urls.append(DEFAULT_PREVIEW)
    else:
        print("⚠️  No preview URL provided. Use --preview flag or set DEFAULT_PREVIEW.")
        print(f"Checking production only: {DEFAULT_PRODUCTION}")

    results = {}
    for u in urls:
        try:
            final_url, status, headers, body = fetch(u)
            slim = {k: headers.get(k) for k in HEADER_KEYS if headers.get(k) is not None}
            results[u] = {
                "status": status,
                "final_url": final_url,
                "buildId": extract_build_id(body),
                "headers": slim,
            }
        except HTTPError as e:
            results[u] = {"error": f"HTTPError {e.code}", "final_url": getattr(e, "url", None)}
        except URLError as e:
            results[u] = {"error": f"URLError {e}"}
        except Exception as e:
            results[u] = {"error": repr(e)}

    print(json.dumps(results, indent=2))

    # Compare build IDs if we have multiple URLs
    if len(urls) > 1:
        bids = [results[u].get("buildId") for u in urls]
        if all(bids) and bids[0] == bids[1]:
            print(f"\n✅ BUILD MATCH: {bids[0]}")
        else:
            print(f"\n❌ BUILD MISMATCH OR MISSING: {bids}")


if __name__ == "__main__":
    main()


