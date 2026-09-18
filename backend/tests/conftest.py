import importlib

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("DB_PATH", str(tmp_path / "test.db"))

    from backend import database, main

    importlib.reload(database)
    importlib.reload(main)

    with TestClient(main.app) as test_client:
        yield test_client


@pytest.fixture
def auth_client(client):
    """A client already signed up and holding a session cookie."""
    client.post(
        "/api/auth/signup",
        json={"email": "user@example.com", "password": "password123"},
    )
    return client
