#!/usr/bin/env python3
"""Build helper for the massage-zeleninas standalone page.

Reads `site-src/massage-zeleninas/.env` and renders
`index.template.html` -> `public/massage-zeleninas/index.html`,
substituting placeholders ({{KEY}}) with real values.

Why this exists:
  The page must be fully self-contained (works standalone / can move off-site),
  but sensitive data (WhatsApp phone) must NOT be hardcoded or committed.
  Sensitive values live in `.env` (gitignored) and are injected at build time.

Usage:
  python site-src/massage-zeleninas/build.py
"""
from __future__ import annotations

import os
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent
TEMPLATE = ROOT / "index.template.html"
ENV_FILE = ROOT / ".env"
OUTPUT = ROOT.parent.parent / "public" / "massage-zeleninas" / "index.html"

PLACEHOLDER_RE = re.compile(r"\{\{\s*(\w+)\s*\}\}")


def load_env(path: pathlib.Path) -> dict[str, str]:
    """Parse a simple KEY=VALUE .env file into a dict (ignore comments/blanks)."""
    result: dict[str, str] = {}
    if not path.exists():
        return result
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key:
            result[key] = value
    return result


def build_whatsapp_url(env: dict[str, str]) -> str:
    """Resolve the WhatsApp URL from either WA_URL directly or WA_PHONE."""
    if env.get("WA_URL"):
        return env["WA_URL"]
    phone = env.get("WA_PHONE", "").strip()
    if phone:
        digits = re.sub(r"[^0-9]", "", phone)
        return f"https://wa.me/{digits}"
    return "https://wa.me/"


def main() -> None:
    if not TEMPLATE.exists():
        raise SystemExit(f"Template not found: {TEMPLATE}")

    env = load_env(ENV_FILE)
    if not env:
        print("WARNING: .env not found or empty. Using defaults from .env.example.")
        env = load_env(ROOT / ".env.example")

    values = {k: v for k, v in env.items()}
    values["WA_URL"] = build_whatsapp_url(env)
    values.setdefault("FB_URL", "https://www.facebook.com/massage.zeleninas/")
    values.setdefault("IG_URL", "https://www.instagram.com/massage_zeleninas/")
    values.setdefault("YT_URL", "https://www.youtube.com/@massage_zeleninas")
    values.setdefault("TG_URL", "https://t.me/massage_zeleninas")
    values.setdefault("SITE_URL", "https://dizel0110.github.io/massage-zeleninas/")

    template = TEMPLATE.read_text(encoding="utf-8")

    def substitute(match: re.Match) -> str:
        key = match.group(1)
        return values.get(key, match.group(0))

    rendered = PLACEHOLDER_RE.sub(substitute, template)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(rendered, encoding="utf-8")
    print(f"OK -> {OUTPUT}")


if __name__ == "__main__":
    main()
