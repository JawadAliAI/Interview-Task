# Support Reply Assistant

An internal tool for generating draft customer support replies using an LLM, grounded in a playbook of policy snippets. Paste a customer message, click **Generate Draft**, and get a polite, policy-grounded reply in under a second.

> **Internal use only — all drafts require human review before sending.**

---

## What We Built

A full-stack monorepo with:

- **Backend** — Node.js + Express + TypeScript REST API, SQLite database, Groq LLM integration
- **Frontend** — React 18 + TypeScript single-page app built with Vite
- **Database** — SQLite via `better-sqlite3` with auto-schema init and idempotent seed
- **LLM** — Groq API (`llama-3.3-70b-versatile`) with 8-second timeout and structured error handling

---

## Project Structure

```
support-reply-assistant/
├── README.md
├── .env.example
├── .gitignore
├── package.json                  # root workspace scripts only
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                      # your secrets go here (not committed)
│   └── src/
│       ├── index.ts              # Express app entry, CORS, routes wiring
│       ├── logger.ts             # pino JSON logger
│       ├── db/
│       │   ├── client.ts         # better-sqlite3 singleton + auto schema init
│       │   ├── schema.sql        # CREATE TABLE snippets + draft_log
│       │   └── seed.ts           # seeds 6 playbook snippets (idempotent)
│       ├── routes/
│       │   ├── snippets.ts       # GET /api/snippets
│       │   └── drafts.ts         # POST /api/drafts
│       ├── services/
│       │   ├── retrieval.ts      # keyword extraction + LIKE query ranking
│       │   ├── promptBuilder.ts  # explicit prompt template
│       │   └── llm.ts            # Groq HTTP client with AbortController timeout
│       ├── middleware/
│       │   ├── rateLimit.ts      # in-memory per-IP: 20 req/min
│       │   ├── validate.ts       # zod schema validation
│       │   └── errorHandler.ts   # global error → safe HTTP response
│       └── types/
│           └── shared.ts         # TypeScript interfaces
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts            # proxies /api to localhost:3001
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx               # state machine: idle → loading → success/error
        ├── vite-env.d.ts
        ├── api/
        │   └── client.ts         # typed fetch wrappers
        ├── components/
        │   ├── MessageInput.tsx  # textarea + submit button
        │   ├── DraftResult.tsx   # draft text + snippets used + metadata
        │   └── SnippetList.tsx   # playbook snippet cards
        └── types/
            └── shared.ts         # mirrored from backend types
```

---

## Setup

### Prerequisites

- Node.js 18+
- A Groq API key — get one free at [console.groq.com](https://console.groq.com)

### Install & Run

> **PowerShell users:** PowerShell 5.1 does not support `&&`. Run each command on its own line.

```powershell
# 1. Install dependencies for both packages
cd support-reply-assistant\backend
npm install --include=dev

cd ..\frontend
npm install --include=dev

# 2. Set up environment
cd ..\backend
# Edit .env and confirm GROQ_API_KEY is set (it should already be there)

# 3. Seed the database
npm run seed

# Terminal 1 — start backend
cd support-reply-assistant\backend
npm run dev

# Terminal 2 — start frontend
cd support-reply-assistant\frontend
npm run dev

# Open http://localhost:5173
```

> **Note:** If your npm is globally configured with `omit=dev`, always use `npm install --include=dev`.

---

## Environment Variables

### `backend/.env`

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GROQ_API_KEY` | Yes | — | Your Groq API key |
| `GROQ_MODEL` | No | `llama-3.3-70b-versatile` | Groq model to use |
| `PORT` | No | `3001` | Backend port |
| `NODE_ENV` | No | `development` | Environment mode |

### `frontend/.env` (optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:3001` | Backend base URL |

---

## How It Works

### Request Flow

```
User types message
       ↓
POST /api/drafts
       ↓
  [validate]        ← zod: min 10, max 2000 chars
       ↓
  [rateLimit]       ← 20 req/min per IP (in-memory)
       ↓
  retrieveSnippets  ← keyword extraction + multi-LIKE SQL query → top 3 snippets
       ↓
  buildPrompt       ← explicit template: policy context + customer message
       ↓
  callLlm           ← Groq API, 8s timeout via AbortController
       ↓
  log to draft_log  ← audit trail in SQLite
       ↓
  return response   ← draftReply, snippetsUsed, model, latencyMs
```

### Retrieval Logic

Keywords are extracted from the customer message by lowercasing, stripping punctuation, removing common English stop words, and taking the top 8 meaningful tokens. Each keyword is matched against snippet `title`, `body`, and `tags` using SQL `LIKE %keyword%` queries. Results are deduplicated by snippet ID and ranked by how many keywords matched — the top 3 snippets are passed as policy context to the LLM. This is appropriate for a small playbook: zero extra infrastructure, fast, deterministic, and easy to reason about.

### Prompt Template

```
You are a helpful customer support assistant. Your job is to write a polite,
professional draft reply to a customer message.

IMPORTANT: Base your reply ONLY on the policy information provided below.
Do not invent policies or make promises not covered in the context.

POLICY CONTEXT:
[Refund - 14-day window]
Customers may request a full refund within 14 days...

---

[Double charge resolution]
If you see two identical charges...

CUSTOMER MESSAGE:
I was charged twice for order #4421

Write a draft reply. Be concise (under 120 words), warm, and professional.
Start directly with the reply — no preamble like "Here is a draft".
```

---

## API Reference

### GET /api/health

Returns server and database status.

**Response:**
```json
{ "status": "ok", "db": "ok", "timestamp": "2026-04-27T06:00:00.000Z" }
```

---

### GET /api/snippets

Returns all playbook snippets with optional filtering.

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Search term matched against title, body, and tags |
| `category` | string | Filter by category (`refunds`, `billing`, `account`, `shipping`, `tone`) |

**Response:**
```json
{
  "snippets": [
    {
      "id": 1,
      "title": "Refund - 14-day window",
      "body": "Customers may request a full refund within 14 days...",
      "category": "refunds",
      "tags": ["refund", "return", "money back"],
      "created_at": "2026-04-27T06:00:00.000Z"
    }
  ]
}
```

---

### POST /api/drafts

Generates a draft reply grounded in playbook snippets.

**Request body:**
```json
{ "customerMessage": "I was charged twice for order #4421" }
```

| Field | Type | Constraints |
|-------|------|-------------|
| `customerMessage` | string | min 10 chars, max 2000 chars |

**Success response `200`:**
```json
{
  "draftReply": "Thank you for reaching out about the double charge...",
  "snippetIdsUsed": [2, 1],
  "snippetsUsed": [
    { "id": 2, "title": "Double charge resolution" },
    { "id": 1, "title": "Refund - 14-day window" }
  ],
  "model": "llama-3.3-70b-versatile",
  "latencyMs": 658
}
```

**Error responses:**

| Status | Code | Reason |
|--------|------|--------|
| `400` | `VALIDATION_ERROR` | Message too short or too long |
| `429` | `RATE_LIMIT` | More than 20 requests/min from same IP |
| `504` | `LLM_TIMEOUT` | Groq API did not respond within 8 seconds |
| `502` | `LLM_ERROR` | Groq API returned a non-OK response |
| `500` | `INTERNAL_ERROR` | Unexpected server error |

---

## Database

### Schema

**`snippets`** — the policy playbook

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment |
| `title` | TEXT | Short snippet title |
| `body` | TEXT | Full policy text |
| `category` | TEXT | Category label |
| `tags` | TEXT | JSON array string of keywords |
| `created_at` | DATETIME | Auto timestamp |

**`draft_log`** — audit trail of every generated draft

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment |
| `customer_message` | TEXT | Original customer message |
| `draft_reply` | TEXT | Generated draft |
| `snippet_ids` | TEXT | JSON array of snippet IDs used |
| `model` | TEXT | LLM model name |
| `latency_ms` | INTEGER | Response time in ms |
| `created_at` | DATETIME | Auto timestamp |

### Seeded Snippets

| ID | Title | Category |
|----|-------|----------|
| 1 | Refund - 14-day window | refunds |
| 2 | Double charge resolution | billing |
| 3 | Password reset steps | account |
| 4 | Tone - calm and concise | tone |
| 5 | Order not received | shipping |
| 6 | Account cancellation policy | account |

### Why SQLite?

SQLite requires no server process, sets up with a single file, and handles low-concurrency single-instance workloads perfectly. For this internal tool, it is the right default.

**Migrate to PostgreSQL when:**
- You need concurrent writes from multiple processes or servers (SQLite is single-writer)
- Your snippet library grows beyond ~10,000 rows and LIKE search degrades
- You deploy multiple backend instances behind a load balancer (SQLite is a local file, not shareable)

**Migration would involve:** replacing `better-sqlite3` with `pg` or Prisma, minor schema syntax changes, converting synchronous queries to async/await, and provisioning a managed Postgres instance (Supabase, Railway, or RDS). The service layer is already isolated — the DB swap stays in `db/client.ts` and `services/retrieval.ts`.

---

## Frontend UI States

| State | Description |
|-------|-------------|
| **Idle** | Textarea and button enabled, button disabled until 10+ chars |
| **Loading** | Button disabled, spinner shown, textarea disabled |
| **Success** | Draft reply shown, snippets used listed, model + latency shown, warning note shown |
| **Error** | Red error banner with message, button re-enabled |

---

## Sample Test Messages

```
"I was charged twice for order #4421"
"I can't log into my account, the password reset isn't working"
"I'd like a refund for my purchase last week"
"My order hasn't arrived after 2 weeks"
"How do I cancel my subscription?"
```

---

## Known Limitations & Next Steps

1. **Vector search** — keyword LIKE matching misses semantic similarity. Replacing retrieval with embeddings (pgvector + text-embedding model) would improve relevance significantly for larger playbooks.
2. **Authentication** — the tool is open to anyone on the network. Session-based auth or API key auth is required before any production exposure.
3. **PII redaction** — customer messages are stored in `draft_log` in full. A pre-processing step to redact emails, phone numbers, and order IDs before logging would improve compliance posture.
4. **Eval logging UI** — `draft_log` accumulates every draft with no review interface. An admin view to rate, export, and analyze drafts would close the quality feedback loop.
5. **Streaming responses** — the app waits for the full LLM response before rendering. Streaming via server-sent events would improve perceived latency for longer replies.
6. **Snippet management UI** — snippets can only be edited via SQL. A simple CRUD interface would let support leads manage the playbook without engineering.
7. **Test coverage** — no automated tests exist. Integration tests for API endpoints and unit tests for retrieval + prompt building are needed for production readiness.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite 5 |
| Backend | Node.js, Express 4, TypeScript |
| Database | SQLite via better-sqlite3 |
| LLM | Groq API (llama-3.3-70b-versatile) |
| Validation | Zod |
| Logging | Pino (JSON structured logs) |

---

