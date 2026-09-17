#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IMAGE_NAME="prelegal"
CONTAINER_NAME="prelegal"

docker build -t "$IMAGE_NAME" "$ROOT_DIR"

docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true

ENV_ARGS=()
if [ -f "$ROOT_DIR/.env" ]; then
  ENV_ARGS=(--env-file "$ROOT_DIR/.env")
fi

docker run -d --rm --name "$CONTAINER_NAME" -p 8000:8000 "${ENV_ARGS[@]}" "$IMAGE_NAME"

echo "Prelegal is running at http://localhost:8000"
