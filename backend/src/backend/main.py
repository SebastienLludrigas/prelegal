import os
from contextlib import asynccontextmanager

from fastapi import FastAPI

from backend.auth import router as auth_router
from backend.database import init_db

FRONTEND_DIST_DIR = os.environ.get("FRONTEND_DIST_DIR", "frontend_dist")


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)
app.include_router(auth_router)
app.frontend("/", directory=FRONTEND_DIST_DIR, check_dir=False)
