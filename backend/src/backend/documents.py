"""Loads the document catalog and templates, and derives fillable fields from them.

Every non-NDA template marks its fillable variables with `<span class="X_link">Name</span>`
spans (the `X` prefix — coverpage/orderform/keyterms/sow/businessterms — varies by
document but always means "a value defined elsewhere"). This module extracts those
variable names generically so the chat can be driven by the template itself instead of
a hand-written field list per document. The Mutual NDA keeps its own hand-written
schema in `chat.py`, since it already has a proper cover page and a tested UI.
"""

import json
import re
from pathlib import Path
from typing import NamedTuple

# Mirrors the frontend's `path.join(process.cwd(), "..", "templates")` in
# templateSource.ts: both processes run with their project directory as cwd.
CATALOG_PATH = Path("../catalog.json")
TEMPLATES_DIR = Path("../templates")

NDA_STANDARD_TERMS_FILENAME = "Mutual-NDA.md"
NDA_COVERPAGE_FILENAME = "Mutual-NDA-coverpage.md"
NDA_DOCUMENT_ID = "mutual-nda"

_LINK_PATTERN = re.compile(r'<span class="\w+_link">([^<]+)</span>')
_POSSESSIVE_SUFFIX = re.compile(r"[’']s$")
_WORD_PATTERN = re.compile(r"[A-Za-z0-9]+")


class DocumentType(NamedTuple):
    id: str
    name: str
    description: str
    template_filenames: tuple[str, ...]


def _doc_id_from_filename(filename: str) -> str:
    stem = Path(filename).stem
    return re.sub(r"[^a-z0-9]+", "-", stem.lower()).strip("-")


def load_catalog() -> list[DocumentType]:
    """Reads catalog.json, merging the NDA's two entries into one document type."""
    entries = json.loads(CATALOG_PATH.read_text())
    documents = []
    for entry in entries:
        filename = entry["filename"]
        if filename == NDA_COVERPAGE_FILENAME:
            continue  # merged into the "mutual-nda" entry below
        if filename == NDA_STANDARD_TERMS_FILENAME:
            documents.append(
                DocumentType(
                    id=NDA_DOCUMENT_ID,
                    name="Mutual Non-Disclosure Agreement",
                    description=entry["description"],
                    template_filenames=(
                        NDA_STANDARD_TERMS_FILENAME,
                        NDA_COVERPAGE_FILENAME,
                    ),
                )
            )
            continue
        documents.append(
            DocumentType(
                id=_doc_id_from_filename(filename),
                name=entry["name"],
                description=entry["description"],
                template_filenames=(filename,),
            )
        )
    return documents


def read_template(filename: str) -> str:
    return (TEMPLATES_DIR / filename).read_text()


def slugify_field_name(name: str) -> str:
    """Turns a field's display name into a camelCase key, e.g. "Effective Date" -> "effectiveDate"."""
    words = _WORD_PATTERN.findall(name)
    if not words:
        return "field"
    first, *rest = words
    return first.lower() + "".join(word.capitalize() for word in rest)


def extract_field_names(template_text: str) -> list[str]:
    """Unique field display names referenced by `_link` spans, in first-seen order.

    A trailing possessive ("Provider's") is stripped so it shares a field with the
    plain form ("Provider"); an occasional grammatical variant (e.g. singular vs.
    plural) is not merged and surfaces as its own field.
    """
    seen: dict[str, None] = {}
    for match in _LINK_PATTERN.finditer(template_text):
        canonical = _POSSESSIVE_SUFFIX.sub("", match.group(1)).strip()
        seen.setdefault(canonical, None)
    return list(seen)


def fields_for(document: DocumentType) -> list[str]:
    """Unique field display names across all of a document type's template files."""
    names: dict[str, None] = {}
    for filename in document.template_filenames:
        for name in extract_field_names(read_template(filename)):
            names.setdefault(name, None)
    return list(names)
