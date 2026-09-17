def test_signup_always_succeeds(client):
    response = client.post(
        "/api/auth/signup", json={"email": "a@example.com", "password": "x"}
    )
    assert response.status_code == 201
    assert response.json() == {"email": "a@example.com", "status": "ok"}


def test_signin_always_succeeds(client):
    response = client.post(
        "/api/auth/signin", json={"email": "a@example.com", "password": "wrong"}
    )
    assert response.status_code == 200
    assert response.json() == {"email": "a@example.com", "status": "ok"}


def test_me_is_not_authenticated(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401
