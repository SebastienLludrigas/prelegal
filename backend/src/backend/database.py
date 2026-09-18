"""SQLite database setup.

The database is recreated from scratch on every application startup, so it
only ever holds data for the lifetime of the running container.
"""

import os
import sqlite3
from collections.abc import Iterator
from pathlib import Path

DB_PATH = Path(os.environ.get("DB_PATH", "backend.db"))

_SCHEMA = """
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    document_type TEXT NOT NULL,
    fields TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
"""


def init_db(db_path: Path = DB_PATH) -> None:
    """Delete any existing database file and recreate the schema."""
    db_path.unlink(missing_ok=True)
    with sqlite3.connect(db_path) as connection:
        connection.executescript(_SCHEMA)


def get_connection(db_path: Path = DB_PATH) -> sqlite3.Connection:
    connection = sqlite3.connect(db_path)
    connection.row_factory = sqlite3.Row
    return connection


def get_db() -> Iterator[sqlite3.Connection]:
    """FastAPI dependency yielding a connection, closed after the request."""
    connection = get_connection()
    try:
        yield connection
    finally:
        connection.close()
