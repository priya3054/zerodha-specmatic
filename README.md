# Zerodha Clone — Specmatic Contract Testing

A full-stack real-time trading dashboard (MERN stack) inspired by Zerodha, used here as the sample application for **Specmatic contract testing**: OpenAPI-driven stubs, provider/consumer tests, backward-compatibility checks, and an Arazzo end-to-end workflow.

- **Backend**: Node.js / Express, port `3002`
- **Frontend / Dashboard**: React
- **Database**: MongoDB
- **Payments**: Razorpay (stubbed via Specmatic in CI)
- **Contract**: [`contracts/openapi.yaml`](contracts/openapi.yaml), examples in `contracts/openapi_examples/`

---

# ▶️ Project Setup

```bash
git clone <this-repo-url>
cd backend && npm install
cd ../dashboard && npm install
cd ../frontend && npm install
```

Create a `.env` file inside `backend/`:

```env
MONGO_URL=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

Run each app (from its own folder): `npm start` for `backend/`, `dashboard/`, and `frontend/`.

---

# 🧪 Running Specmatic

This repo uses [Specmatic](https://specmatic.io) (open source, `specmatic/specmatic:2.49.1`) to contract-test the backend against `contracts/openapi.yaml`, stub out the Razorpay dependency, and run an Arazzo end-to-end workflow. Everything runs via `docker-compose.yml` — you do not need to install Specmatic locally, only Docker.

## What Specmatic has caught in this codebase

Not a hypothetical benefit — these are real bugs Specmatic's contract tests found in the actual backend code:

- **`/auth/login` crash risk**: non-string `username`/`password` reached `passport.authenticate` unguarded.
- **`/verify-payment` accepted invalid `amount`**: `null`/string values crashed the DB update with a 500; boolean values silently coerced to 0/1 and "succeeded" instead of being rejected.
- **`/newOrder` had no input validation at all**: the original handler saved `req.body` straight to MongoDB with zero type checks.
- **`/newOrder` accepted non-integer `qty`** (e.g. `5.5`) even though the contract types it as an integer — the handler only checked `typeof "number"`.
- **Signup wasn't idempotent**: re-running the same contract test twice failed on duplicate-user creation.
- **A breaking contract change was caught before merge**: changing `qty` from `number` to `string` was flagged by the backward-compatibility check and reverted — this is the `breaking-qty-change` branch demo working as intended.

All of these were caught by contract/negative tests, not manual QA — Specmatic generates malformed-input variations automatically (see `schemaResiliencyTests: all` in `specmatic.yaml`) and fails the build the moment the backend's real behavior drifts from what `contracts/openapi.yaml` promises.

**Exception:** the `studio` and `suite` labs use the `studio` and `run-suite` commands, which only exist in `specmatic/enterprise` — there is no open-source equivalent. Those two services alone run on `specmatic/enterprise:latest` and need a license file; every other lab in this repo is open source.

## 1. Prerequisites

- **Docker** and **Docker Compose** installed and running
- This repo cloned locally
- **Only if you plan to use the `studio` or `suite` labs**: a Specmatic Enterprise license saved as `license.txt` one directory above this repo (`../license.txt`, mounted to `/root/.specmatic/specmatic-license.txt`) — get one from [specmatic.io](https://specmatic.io). Every other lab works without it.

## 2. Quick Start — Run Your First Contract Test

```bash
# 1. Start the app + its dependencies (Mongo, real backend, Razorpay stub)
docker compose up -d mongo backend razorpay-stub

# 2. Wait for the backend healthcheck to pass, then run the contract test
docker compose --profile test up
```

This runs `contracts/openapi.yaml` against the real backend on `http://backend:3002` and exits with a pass/fail summary. Tear everything down afterwards with:

```bash
docker compose down
```

## 3. All Available Labs (docker-compose profiles)

Each profile is self-contained; start it the same way — `docker compose --profile <name> up`:

| Profile | What it does |
|---|---|
| `test` | Contract test: runs `contracts/openapi.yaml` against the real backend |
| `stub` | Starts a consumer stub (fake backend) from the contract on port 9000 |
| `coverage` | Contract test + API coverage report |
| `examples` | Validates every example JSON against the contract schema |
| `partial` | Stub + test using partial examples (auto-fills missing required fields) |
| `response-template` | Stub + test for response templating (data lookups/echo) |
| `dictionary` | Stub + test using domain-aware values from `contracts/openapi_dictionary.yaml` |
| `filters` / `filters-post` / `filters-auth` | Stub + filtered test runs (by status, method, or auth paths) |
| `adapters` / `no-adapters` | Demonstrates request/response adapters bridging PascalCase ↔ camelCase |
| `workflow` | Stub + test showing ID propagation from `/create-order` into `/verify-payment` |
| `suite` | Runs the full `specmatic.yaml` v3 suite (auto-starts mock + runs tests) — **enterprise-only, needs `license.txt`** |
| `studio` | Specmatic Studio visual UI at `http://localhost:9000/_specmatic/studio` — **enterprise-only, needs `license.txt`** |
| `ci` | Spectral lint + backward-compatibility check + example validation (used in CI) |

## 4. Walkthrough of the Core Labs

**Stub a fake backend from the contract** (no real backend needed — useful for frontend development):
```bash
docker compose --profile stub up
# Fake API now live at http://localhost:9000, backed entirely by contracts/openapi.yaml
```

**Contract test + coverage report** (same as gate 2 in CI):
```bash
docker compose up -d mongo backend razorpay-stub
docker compose --profile coverage up
```

**Visual Specmatic Studio** (explore the contract, build/replay Arazzo workflows, run mocks/tests from a UI — **enterprise-only, needs `license.txt`**):
```bash
docker compose up -d mongo backend
docker compose --profile studio up
# Open http://localhost:9000/_specmatic/studio
```

**All CI checks locally** (lint + backward-compatibility + example validation):
```bash
docker compose --profile ci up
```

Expected output on a clean run: `specmatic-lint-1 exited with code 0`, `specmatic-backward-compat-1 exited with code 0` (verdict: `COMPATIBLE`), `specmatic-examples-1 exited with code 0`.

## 5. Running Specmatic Directly (matches CI, no compose)

The GitHub Actions workflows don't use `docker-compose` — they call the image directly so the exact same commands can be run on your machine:

```bash
# Contract test against a locally running backend (http://localhost:3002)
docker run --rm --network host \
  -v "$(pwd):/usr/src/app" \
  specmatic/specmatic:2.49.1 \
  test --testBaseURL=http://localhost:3002 contracts/openapi.yaml --examples=contracts/openapi_examples
```

```bash
# Backward-compatibility check against the committed baseline
docker run --rm \
  -v "$(pwd):/usr/src/app" \
  --entrypoint sh specmatic/specmatic:2.49.1 -c '
    mkdir -p /tmp/compat-check/contracts && cd /tmp/compat-check
    git init -q && git checkout -q -b main
    git config user.email ci@ci.local && git config user.name CI
    cp /usr/src/app/baseline/contracts/openapi.yaml contracts/openapi.yaml
    git add contracts/openapi.yaml && git commit -q -m baseline
    git checkout -q -b current
    cp /usr/src/app/contracts/openapi.yaml contracts/openapi.yaml
    git add contracts/openapi.yaml && git commit -q -m current
    specmatic backward-compatibility-check --base-branch=main --target-path=contracts/openapi.yaml
  '
```

## 6. Arazzo End-to-End Workflow

`ZerodhaTradeFlow.arazzo.yaml` (with data in `ZerodhaTradeFlow.arazzo_input.json`) chains **signup → login → get-me → connect to live events → place order → create order → verify payment** into one workflow. It was built visually in Specmatic Studio and exported.

Run it against a live backend:

```bash
docker compose up -d mongo backend razorpay-stub
docker run --rm -v "$(pwd):/usr/src/app" \
  specmatic/specmatic:2.49.1 test "ZerodhaTradeFlow.arazzo.yaml"
```

The HTML report is written to `./build/reports/specmatic/html`. You can also open and replay it interactively in Specmatic Studio (see the `studio` profile above).

## 7. Troubleshooting

| Symptom | Likely cause |
|---|---|
| `test` profile fails to connect | Backend not healthy yet — check `docker compose ps` and backend healthcheck |
| Port already in use | Another lab profile using the same port (most stubs default to `9000`) — stop it with `docker compose --profile <name> down` first |
| Provider test fails on `qty` | Backend validation and the contract's `type: integer` must agree — see `backend/index.js`'s `/newOrder` handler |

## 8. CI

`.github/workflows/` runs three gates on every push, using the direct `docker run` form shown in section 5:
- `01-contract-repo-ci.yml` — Spectral lint + backward-compatibility check
- `02-provider-ci.yml` — contract tests against the real backend
- `03-consumer-ci.yml` — consumer stub tests against the frontend
