# prelegal

A SaaS app for drafting common legal agreements: sign up, chat with an AI assistant to pick a document type and fill in its fields, then preview and download a ready-to-sign PDF. Supports 12 Common Paper document templates (Mutual NDA, Cloud Service Agreement, DPA, etc.) and keeps a per-user history of past drafts.

## Status

✅ Feature-complete (PL-2 through PL-8): AI-driven drafting for all 12 templates, real auth (bcrypt + session cookies), and autosaved document history.

## Stack

- **Backend**: FastAPI (`backend/`, [uv](https://docs.astral.sh/uv/) project), SQLite (recreated on every container start)
- **Frontend**: Next.js (`frontend/`), statically exported and served by the backend
- **AI**: LiteLLM via OpenRouter, Cerebras inference
- Packaged as a single Docker image

## Running it

1. Add an `OPENROUTER_API_KEY` and a `JWT_SECRET` to a `.env` file in the project root.
2. Start it:
   ```bash
   scripts/start-mac.sh      # or start-linux.sh / start-windows.ps1
   ```
3. Open http://localhost:8000

Stop it with the matching `scripts/stop-*` script.
