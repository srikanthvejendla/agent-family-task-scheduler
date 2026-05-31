# Capabilities reference for this task

## Pre-allocated for you
- Port: `PORT=8003` (use this — already free, written to `.env`, **reserved for this task forever** in the orchestrator registry)
- Workspace: `/Users/macmane/projects/20260530-200426-i-want-to-build-a-full-stack-family-task`
- Tailscale base: `100.118.254.91`
- Public URL (after you bind PORT): `http://100.118.254.91:8003`

## Runtimes installed on this Mac Studio
- Node 22.x (`node`, `npm`, `pnpm`, `npx`)
- Python 3.11+ (`python3`, `pip3`)
- Rust toolchain (`cargo`, `rustc`)
- Docker + docker-compose
- Git, `gh` (GitHub CLI — already authenticated as `srikanthvejendla`)
- `ffmpeg`, `jq`, `sqlite3`, `tailscale`, `curl`

## MCP servers configured
- filesystem, playwright, github, context7, tavily, qdrant, sequential-thinking

## Helpers in `~/orchestrator/helpers/`
- `allocate_port.py`     — already called for you; PORT is in `.env`
- `expose_url.sh <port>` — prints the Tailscale URL for the given port
- `github_repo.sh <slug>` — creates a private repo `agent-<slug>` and pushes
- `serve_static.sh <dir> <port>` — fast static server via Python http.server

## Required final outputs
- Bind your server to `PORT` from `.env` (or `process.env.PORT`)
- Write `artifacts/deploy_url.txt` with the public URL
- End your response with: `STATUS: SHIPPED url=<deploy_url> gh=<repo_url> reason=<one-liner>`

## Autonomy rules — DO NOT ASK THE USER
- If a package is missing, install it (`pnpm add X`, `pip install X`, etc) — never ask
- If a port conflicts, the pre-allocated PORT is already free — use that one
- If `gh` config is missing for git push, run `git config user.email "agent@macstudio"` and proceed
- If you hit a permission issue, try a workspace-local install — never use sudo
- If you genuinely cannot proceed (missing API key, external service down), emit `STATUS: BLOCKED reason=<why>` and stop
- Never wait for human input — always make a decision and proceed
