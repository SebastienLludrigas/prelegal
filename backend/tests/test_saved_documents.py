def test_requires_authentication(client):
    response = client.get("/api/documents")
    assert response.status_code == 401


def test_save_document_creates_a_new_row(auth_client):
    response = auth_client.post(
        "/api/documents",
        json={"documentType": "mutual-nda", "fields": {"purpose": "Testing"}},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["documentType"] == "mutual-nda"
    assert body["fields"] == {"purpose": "Testing"}
    assert isinstance(body["id"], int)


def test_save_document_with_an_id_updates_the_existing_row(auth_client):
    created = auth_client.post(
        "/api/documents",
        json={"documentType": "mutual-nda", "fields": {"purpose": "Testing"}},
    ).json()

    updated = auth_client.post(
        "/api/documents",
        json={
            "id": created["id"],
            "documentType": "mutual-nda",
            "fields": {"purpose": "Testing", "governingLaw": "California"},
        },
    ).json()

    assert updated["id"] == created["id"]
    assert updated["fields"]["governingLaw"] == "California"

    listing = auth_client.get("/api/documents").json()
    assert len(listing) == 1


def test_save_document_rejects_an_id_belonging_to_another_user(client):
    client.post(
        "/api/auth/signup",
        json={"email": "owner@example.com", "password": "password123"},
    )
    owned = client.post(
        "/api/documents",
        json={"documentType": "mutual-nda", "fields": {}},
    ).json()
    client.post("/api/auth/logout")

    client.post(
        "/api/auth/signup",
        json={"email": "other@example.com", "password": "password123"},
    )
    response = client.post(
        "/api/documents",
        json={"id": owned["id"], "documentType": "mutual-nda", "fields": {}},
    )
    assert response.status_code == 404


def test_list_documents_only_returns_the_current_users_documents(client):
    client.post(
        "/api/auth/signup",
        json={"email": "owner@example.com", "password": "password123"},
    )
    client.post(
        "/api/documents", json={"documentType": "mutual-nda", "fields": {}}
    )
    client.post("/api/auth/logout")

    client.post(
        "/api/auth/signup",
        json={"email": "other@example.com", "password": "password123"},
    )
    response = client.get("/api/documents")

    assert response.status_code == 200
    assert response.json() == []


def test_get_document_returns_the_saved_fields(auth_client):
    created = auth_client.post(
        "/api/documents",
        json={"documentType": "baa", "fields": {"provider": "Acme Health"}},
    ).json()

    response = auth_client.get(f"/api/documents/{created['id']}")

    assert response.status_code == 200
    assert response.json()["fields"] == {"provider": "Acme Health"}


def test_get_document_404s_for_an_unknown_id(auth_client):
    response = auth_client.get("/api/documents/999")
    assert response.status_code == 404
