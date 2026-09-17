"""Placeholder auth routes.

PL-5 only needs a fake login screen: any signup/signin succeeds, and there
is no real session yet. Real authentication is a later ticket.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/auth", tags=["auth"])


class Credentials(BaseModel):
    email: str
    password: str


@router.post("/signup", status_code=201)
def signup(credentials: Credentials) -> dict[str, str]:
    return {"email": credentials.email, "status": "ok"}


@router.post("/signin")
def signin(credentials: Credentials) -> dict[str, str]:
    return {"email": credentials.email, "status": "ok"}


@router.get("/me")
def me() -> None:
    raise HTTPException(status_code=401, detail="Not authenticated")
