#!/usr/bin/env python3
"""Fixed future demo contract for the notes home card.

This intentionally checks one exact attribute on the existing anchor. The
future demo Builder may change index.html only; the broker and this script are
trusted controller inputs.
"""
from __future__ import annotations

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path


class NotesCardParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.matches: list[dict[str, str | None]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.casefold() != "a":
            return
        values = dict(attrs)
        if values.get("data-home-card") == "notes":
            self.matches.append(values)


def main() -> int:
    index = Path("index.html")
    parser = NotesCardParser()
    parser.feed(index.read_text(encoding="utf-8"))
    passed = (
        len(parser.matches) == 1
        and parser.matches[0].get("href") == "#notes"
        and parser.matches[0].get("aria-label") == "打开笔记工作台"
    )
    result = {
        "checks": [
            {
                "id": "notes-home-card-contract",
                "status": "PASS" if passed else "FAIL",
                "evidence": (
                    "Exactly one a[data-home-card=notes] retains href=#notes and "
                    "has aria-label=打开笔记工作台."
                    if passed
                    else "Expected exactly one notes anchor with href=#notes and aria-label=打开笔记工作台."
                ),
            }
        ]
    }
    print(json.dumps(result, ensure_ascii=True, sort_keys=True))
    return 0 if passed else 1


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    raise SystemExit(main())
