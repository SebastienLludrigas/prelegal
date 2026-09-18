"""Real auth: signup/signin hash passwords with bcrypt and issue a JWT held in
an httponly cookie. The cookie is not marked `secure` since the app is served
over plain HTTP on localhost / a Docker host with no TLS in front of it.
"""

import os
import sqlite3
from datetime import UTC, datetime, timedelta

import bcrypt
import jwt
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, Field

from backend.database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])

JWT_SECRET = os.environ.get(
    "JWT_SECRET", "dev-secret-change-me-please-32-bytes-min"
)
JWT_ALGORITHM = "HS256"
JWT_TTL = timedelta(days=7)
SESSION_COOKIE = "session"


class Credentials(BaseModel):
    email: str
    password: str = Field(min_length=8)


class User(BaseModel):
    id: int
    email: str


def _issue_session_cookie(response: Response, user_id: int, email: str) -> None:
    expires_at = datetime.now(UTC) + JWT_TTL
    token = jwt.encode(
        {"sub": str(user_id), "email": email, "exp": expires_at},
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )
    response.set_cookie(
        SESSION_COOKIE,
        token,
        httponly=True,
        samesite="lax",
        max_age=int(JWT_TTL.total_seconds()),
    )


def get_current_user(
    request: Request, db: sqlite3.Connection = Depends(get_db)
) -> User:
    token = request.cookies.get(SESSION_COOKIE)
    if token is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.InvalidTokenError as error:
        raise HTTPException(status_code=401, detail="Not authenticated") from error

    row = db.execute(
        "SELECT id, email FROM users WHERE id = ?", (payload["sub"],)
    ).fetchone()
    if row is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return User(id=row["id"], email=row["email"])


@router.post("/signup", status_code=201)
def signup(
    credentials: Credentials,
    response: Response,
    db: sqlite3.Connection = Depends(get_db),
) -> User:
    password_hash = bcrypt.hashpw(
        credentials.password.encode(), bcrypt.gensalt()
    ).decode()
    try:
        cursor = db.execute(
            "INSERT INTO users (email, password_hash) VALUES (?, ?)",
            (credentials.email, password_hash),
        )
        db.commit()
    except sqlite3.IntegrityError as error:
        raise HTTPException(
            status_code=409, detail="An account with this email already exists."
        ) from error

    _issue_session_cookie(response, cursor.lastrowid, credentials.email)
    return User(id=cursor.lastrowid, email=credentials.email)


@router.post("/signin")
def signin(
    credentials: Credentials,
    response: Response,
    db: sqlite3.Connection = Depends(get_db),
) -> User:
    row = db.execute(
        "SELECT id, email, password_hash FROM users WHERE email = ?",
        (credentials.email,),
    ).fetchone()
    if row is None or not bcrypt.checkpw(
        credentials.password.encode(), row["password_hash"].encode()
    ):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    _issue_session_cookie(response, row["id"], row["email"])
    return User(id=row["id"], email=row["email"])


@router.post("/logout", status_code=204)
def logout(response: Response) -> None:
    response.delete_cookie(SESSION_COOKIE)


@router.get("/me")
def me(user: User = Depends(get_current_user)) -> User:
    return user
