def test_signup_creates_a_user_and_sets_a_session_cookie(client):
    response = client.post(
        "/api/auth/signup",
        json={"email": "a@example.com", "password": "password123"},
    )
    assert response.status_code == 201
    assert response.json()["email"] == "a@example.com"
    assert "session" in response.cookies


def test_signup_rejects_a_duplicate_email(client):
    client.post(
        "/api/auth/signup",
        json={"email": "a@example.com", "password": "password123"},
    )
    response = client.post(
        "/api/auth/signup",
        json={"email": "a@example.com", "password": "different123"},
    )
    assert response.status_code == 409


def test_signup_rejects_a_short_password(client):
    response = client.post(
        "/api/auth/signup", json={"email": "a@example.com", "password": "short"}
    )
    assert response.status_code == 422


def test_signin_succeeds_with_the_right_password(client):
    client.post(
        "/api/auth/signup",
        json={"email": "a@example.com", "password": "password123"},
    )
    response = client.post(
        "/api/auth/signin",
        json={"email": "a@example.com", "password": "password123"},
    )
    assert response.status_code == 200
    assert "session" in response.cookies


def test_signin_rejects_the_wrong_password(client):
    client.post(
        "/api/auth/signup",
        json={"email": "a@example.com", "password": "password123"},
    )
    response = client.post(
        "/api/auth/signin",
        json={"email": "a@example.com", "password": "wrong-password"},
    )
    assert response.status_code == 401


def test_signin_rejects_an_unknown_email(client):
    response = client.post(
        "/api/auth/signin",
        json={"email": "nobody@example.com", "password": "password123"},
    )
    assert response.status_code == 401


def test_me_is_not_authenticated_without_a_session(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_me_returns_the_signed_up_user(client):
    client.post(
        "/api/auth/signup",
        json={"email": "a@example.com", "password": "password123"},
    )
    response = client.get("/api/auth/me")
    assert response.status_code == 200
    assert response.json()["email"] == "a@example.com"


def test_logout_clears_the_session(client):
    client.post(
        "/api/auth/signup",
        json={"email": "a@example.com", "password": "password123"},
    )
    client.post("/api/auth/logout")
    response = client.get("/api/auth/me")
    assert response.status_code == 401
