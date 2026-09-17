"""SQLite database setup.

The database is recreated from scratch on every application startup, so it
only ever holds data for the lifetime of the running container.
"""

import os
import sqlite3
from pathlib import Path

DB_PATH = Path(os.environ.get("DB_PATH", "backend.db"))

_SCHEMA = """
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
"""


def init_db(db_path: Path = DB_PATH) -> None:
    """Delete any existing database file and recreate the schema."""
    db_path.unlink(missing_ok=True)
    with sqlite3.connect(db_path) as connection:
        connection.executescript(_SCHEMA)


def get_connection(db_path: Path = DB_PATH) -> sqlite3.Connection:
    return sqlite3.connect(db_path)
