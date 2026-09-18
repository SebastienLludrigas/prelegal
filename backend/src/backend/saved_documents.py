"""Stores a user's in-progress and finished documents so they can come back
to them later. A document is upserted: the frontend autosaves after every
field the chat extracts, passing back the `id` it got from the first save.
"""

import json
import sqlite3
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from backend.auth import User, get_current_user
from backend.database import get_db

router = APIRouter(prefix="/api/documents", tags=["documents"])


class SavedDocumentIn(BaseModel):
    id: int | None = None
    documentType: str
    fields: dict[str, Any]


class SavedDocumentSummary(BaseModel):
    id: int
    documentType: str
    createdAt: str
    updatedAt: str


class SavedDocumentOut(SavedDocumentSummary):
    fields: dict[str, Any]


def _load_document(
    db: sqlite3.Connection, document_id: int, user_id: int
) -> SavedDocumentOut | None:
    row = db.execute(
        "SELECT id, document_type, fields, created_at, updated_at "
        "FROM documents WHERE id = ? AND user_id = ?",
        (document_id, user_id),
    ).fetchone()
    if row is None:
        return None
    return SavedDocumentOut(
        id=row["id"],
        documentType=row["document_type"],
        fields=json.loads(row["fields"]),
        createdAt=row["created_at"],
        updatedAt=row["updated_at"],
    )


@router.post("")
def save_document(
    payload: SavedDocumentIn,
    user: User = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db),
) -> SavedDocumentOut:
    fields_json = json.dumps(payload.fields)

    if payload.id is not None:
        if _load_document(db, payload.id, user.id) is None:
            raise HTTPException(status_code=404, detail="Document not found.")
        db.execute(
            "UPDATE documents SET document_type = ?, fields = ?, "
            "updated_at = datetime('now') WHERE id = ?",
            (payload.documentType, fields_json, payload.id),
        )
        document_id = payload.id
    else:
        cursor = db.execute(
            "INSERT INTO documents (user_id, document_type, fields) VALUES (?, ?, ?)",
            (user.id, payload.documentType, fields_json),
        )
        document_id = cursor.lastrowid

    db.commit()
    document = _load_document(db, document_id, user.id)
    assert document is not None
    return document


@router.get("")
def list_documents(
    user: User = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db),
) -> list[SavedDocumentSummary]:
    rows = db.execute(
        "SELECT id, document_type, created_at, updated_at FROM documents "
        "WHERE user_id = ? ORDER BY updated_at DESC",
        (user.id,),
    ).fetchall()
    return [
        SavedDocumentSummary(
            id=row["id"],
            documentType=row["document_type"],
            createdAt=row["created_at"],
            updatedAt=row["updated_at"],
        )
        for row in rows
    ]


@router.get("/{document_id}")
def get_document(
    document_id: int,
    user: User = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db),
) -> SavedDocumentOut:
    document = _load_document(db, document_id, user.id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found.")
    return document
