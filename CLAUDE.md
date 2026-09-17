# Prelegal Project

## Overview

This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory.
The user can carry out AI chat in order to establish what document they want and how to fill in the fields.
The available documents are covered in the catalog.json file in the project root, included here:

@catalog.json

Before we start : the initial implementation is a frontend-only prototype that only supports the Mutual NDA document with no AI chat.

## Development process

When instructed to build a feature:
1. Use your Atlassian tools to read the feature instructions from Jira
2. Develop the feature - do not skip any step from the feature-dev 8 step process
3. Thoroughly test the feature with unit tests and integration tests and fix any issues
4. Submit a PR using your github tools

## AI design

When writing code to make calls to LLMs, use your Cerebras skill to use LiteLLM via OpenRouter to the `openrouter/openai/gpt-oss-120b` model with Cerebras as the inference provider. You should use Structured Outputs so that you can interpret the results and populate fields in the legal document.

There is an OPENROUTER_API_KEY in the .env file in the project root.

## Technical design

The entire project should be packaged into a Docker container.  
The backend should be in backend/ and be a uv project, using FastAPI.    
The frontend should be in frontend/. 
The database should use SQLLite and be created from scratch each time the Docker container is brought up, allowing for a users table with sign up and sign in.  
Consider statically building the frontend and serving it via FastAPI, if that will work.    
There should be scripts in scripts/ for:    
```bash
# Mac
scripts/start-mac.sh    # Start
scripts/stop-mac.sh     # Stop

# Linux
scripts/start-linux.sh
scripts/stop-linux.sh

# Windows
scripts/start-windows.ps1
scripts/stop-windows.ps1
```
Backend available at http://localhost:8000

## Color Scheme
- Accent Yellow: `#ecad0a`
- Blue Primary: `#209dd7`
- Purple Secondary: `#753991` (submit buttons)
- Dark Navy: `#032147` (headings)
- Gray Text: `#888888`

## Implementation Status

Note: "the initial implementation is a frontend-only prototype" above is now historical (PL-4) — a backend exists since PL-5.

### Completed (PL-2)
- Legal document templates dataset in `templates/`, indexed by `catalog.json` (12 document types)

### Completed (PL-4)
- Mutual NDA form with live document preview and PDF-style print/download
- Frontend-only, no backend, no AI chat

### Completed (PL-5)
- FastAPI backend (`backend/`, uv project) with SQLite `users` table, recreated from scratch on every container start
- Next.js frontend statically exported and served by FastAPI at localhost:8000
- Auth routes: `POST /api/auth/signup`, `POST /api/auth/signin`, `GET /api/auth/me` — placeholders that accept any credentials, no password hashing, no session, no DB writes yet
- `AppGate` / `LoginScreen`: fake login gate on the frontend, no real session held
- Whole project packaged into a single Dockerfile; start/stop scripts in `scripts/` for Mac, Linux, Windows

### Completed (PL-6)
- Freeform AI chat replaces the manual Mutual NDA form: `ChatPanel` (frontend) talks to `POST /api/chat` (backend), which calls Cerebras via OpenRouter (LiteLLM, Structured Outputs) and returns a reply plus the subset of fields it extracted
- Backend is stateless: the frontend resends the full message history each turn; extracted fields are merged client-side into the document state field-by-field, so earlier answers are never overwritten by an unrelated turn
- Chat history and filled-in fields are not persisted — lost on refresh, same as the rest of the app pre-PL-8

### Not started
- **PL-7** — support for the remaining document types in `catalog.json`
- **PL-8** — real multi-user auth (password hashing, sessions) and final polish

