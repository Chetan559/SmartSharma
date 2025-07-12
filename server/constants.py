"""
Centralised, project‑wide constants.

Usage
-----
from constants import WORK_DIR_NAME, WORK_DIR, MODIFICATIONS_TAG_NAME, ALLOWED_HTML_ELEMENTS
"""

WORK_DIR_NAME: str = "project"
WORK_DIR: str = f"/home/{WORK_DIR_NAME}"

MODIFICATIONS_TAG_NAME: str = "bolt_file_modifications"

# Whitelisted HTML elements (kept lowercase to match actual tags)
ALLOWED_HTML_ELEMENTS: list[str] = [
    "a",
    "b",
    "blockquote",
    "br",
    "code",
    "dd",
    "del",
    "details",
    "div",
    "dl",
    "dt",
    "em",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "hr",
    "i",
    "ins",
    "kbd",
    "li",
    "ol",
    "p",
    "pre",
    "q",
    "rp",
    "rt",
    "ruby",
    "s",
    "samp",
    "source",
    "span",
    "strike",
    "strong",
    "sub",
    "summary",
    "sup",
    "table",
    "tbody",
    "td",
    "tfoot",
    "th",
    "thead",
    "tr",
    "ul",
    "var",
]
