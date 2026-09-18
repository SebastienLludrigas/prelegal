import sqlite3

from backend.database import init_db


def test_init_db_creates_empty_users_table(tmp_path):
    db_path = tmp_path / "test.db"

    init_db(db_path)

    with sqlite3.connect(db_path) as connection:
        columns = {row[1] for row in connection.execute("PRAGMA table_info(users)")}
        rows = connection.execute("SELECT COUNT(*) FROM users").fetchone()[0]

    assert columns == {"id", "email", "password_hash", "created_at"}
    assert rows == 0


def test_init_db_creates_empty_documents_table(tmp_path):
    db_path = tmp_path / "test.db"

    init_db(db_path)

    with sqlite3.connect(db_path) as connection:
        columns = {
            row[1] for row in connection.execute("PRAGMA table_info(documents)")
        }
        rows = connection.execute("SELECT COUNT(*) FROM documents").fetchone()[0]

    assert columns == {
        "id",
        "user_id",
        "document_type",
        "fields",
        "created_at",
        "updated_at",
    }
    assert rows == 0


def test_init_db_recreates_a_fresh_database(tmp_path):
    db_path = tmp_path / "test.db"
    init_db(db_path)
    with sqlite3.connect(db_path) as connection:
        connection.execute(
            "INSERT INTO users (email, password_hash) VALUES ('a@example.com', 'h')"
        )
        connection.commit()

    init_db(db_path)

    with sqlite3.connect(db_path) as connection:
        rows = connection.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    assert rows == 0
