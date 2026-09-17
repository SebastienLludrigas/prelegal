# ---- Stage 1: build the static frontend export ----
# Templates live one level above frontend/ on the host, and the build reads
# them from `../templates` relative to its cwd, so the same layout is
# recreated here.
FROM node:22-alpine AS frontend-build
WORKDIR /repo
COPY templates/ ./templates/
WORKDIR /repo/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---- Stage 2: install backend dependencies with uv ----
FROM ghcr.io/astral-sh/uv:python3.13-trixie-slim AS backend-build
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy UV_NO_DEV=1
WORKDIR /app
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=backend/uv.lock,target=uv.lock \
    --mount=type=bind,source=backend/pyproject.toml,target=pyproject.toml \
    uv sync --locked --no-install-project
COPY backend/ /app/
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked

# ---- Stage 3: runtime image, no uv, no Node ----
FROM python:3.13-slim-trixie

RUN groupadd --system --gid 999 nonroot \
 && useradd --system --gid 999 --uid 999 --create-home nonroot

WORKDIR /app
COPY --from=backend-build --chown=nonroot:nonroot /app /app
COPY --from=frontend-build --chown=nonroot:nonroot /repo/frontend/out /app/frontend_dist
RUN mkdir -p /app/data && chown nonroot:nonroot /app/data

ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1
ENV FRONTEND_DIST_DIR=/app/frontend_dist
ENV DB_PATH=/app/data/backend.db

USER nonroot

EXPOSE 8000
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
