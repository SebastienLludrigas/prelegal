#!/usr/bin/env bash
set -euo pipefail

CONTAINER_NAME="prelegal"

docker stop "$CONTAINER_NAME"
