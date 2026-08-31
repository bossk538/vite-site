# Meridian Demo Bank — Simulated Credit Card Processing App

A sample banking application for learning/demo purposes: account creation, credit
card issuance, simulated purchase authorization, payments, statements, and a
spending dashboard.

> **This is a fully simulated demo. It is not a real bank, does not connect to any
> real payment network, and no real money ever moves.** "Meridian Demo Bank" is a
> fictional name. Card numbers are synthetic (see "How card data is handled"
> below) — don't enter real personal or financial information anywhere in this
> app.

## Architecture

A single Node/Express API backed by one MongoDB database, plus a React + Vite
frontend.

```
┌────────────┐        ┌──────────────┐        ┌─────────┐
│  frontend  │ ─HTTP─▶ │   backend    │ ─────▶ │ MongoDB │
│ React+Vite │         │ Express API  │        │         │
│ port 5173  │         │  port 4000   │        │(1 database)
└────────────┘        └──────────────┘        └─────────┘
```

| Layer | Responsibility |
|---|---|
| `frontend` | Dashboard, card management, statements — React + Vite |
| `backend` | Auth, card issuing, transaction authorization, statement generation, dashboard aggregation — Express + Mongoose |
| MongoDB | Single database, collections: `users`, `creditcards`, `transactions`, `statements` |

### Domain model

- **User** — a demo customer account (JWT auth, bcrypt-hashed password).
- **CreditCard** — issued to a user after a simulated application. Tracks credit
  limit, available credit, current balance, APR, and status (`active` /
  `frozen` / `closed`).
- **Transaction** — a `purchase` (run through the authorization rules below) or a
  `payment` against a card.
- **Statement** — a billing-cycle snapshot generated on demand (there's no cron
  scheduler in this demo — you trigger cycle close from the UI).

### Transaction authorization (rule-based, synchronous)

`POST /api/transactions` evaluates every simulated purchase against a short,
readable rule chain (`backend/src/services/transactionRules.js`):

1. Card must be `active` (declines `card_frozen` / `card_closed`).
2. Amount must be positive and ≤ $5,000 per transaction (`exceeds_single_transaction_limit`).
3. Amount must not exceed available credit (`insufficient_credit`).
4. No more than 5 approved purchases on the same card in a rolling 10-minute
   window (`velocity_limit_exceeded`) — a simplified stand-in for fraud/velocity
   checks.

This models the *shape* of real card authorization (status check → limit check →
fraud/velocity check) without pretending to be a production risk engine.

### Credit decisioning (simulated underwriting)

`POST /api/cards/apply` runs a deterministic, simplified rule
(`backend/src/services/creditDecision.js`): approved limit is roughly 15% of
stated annual income, capped between $500–$25,000, requiring at least $10,000 of
stated income. This is for demo flavor only — it is not a real underwriting
model.

### How card data is handled

- Card numbers are generated with a valid Luhn checksum but always start with
  `9999` — an IIN range ISO/IEC 7812 reserves and no real network issues from.
  These numbers can never be mistaken for, or used as, real payment
  instruments.
- The full number and CVV are returned to the frontend **once**, at the moment
  of issuance (`POST /api/cards/apply`), and are **never persisted**. The
  database only ever stores a masked display string (`9999 •••• •••• 1234`) and
  the last 4 digits — mirroring the real-world rule that a CVV is never stored
  after authorization.

### Statement generation

`POST /api/statements/generate` closes out the current cycle for a card
(`backend/src/services/statementGenerator.js`): sums purchases and payments since
the last statement, applies simplified interest on any carried balance
(`previousBalance × APR/12`), computes a minimum payment (`max($25, 2% of new
balance)`), and sets a due date 21 days out. There's no scheduler — trigger it
from the Statements page whenever you want to simulate a cycle closing.

## Running it

### With Docker Compose (recommended)

Requires Docker and Docker Compose.

```bash
cp .env.example .env    # optional, defaults work out of the box
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000 (health check at `/health`)

Register an account, apply for a card, then use "Simulate a purchase" on the
card page to generate transaction activity — there's no real merchant network,
so this button is how the demo produces realistic-looking transactions.

To stop everything: `docker compose down` (add `-v` to also delete the database
volume).

### Running without Docker

You'll need Node 20+ and a local MongoDB instance.

```bash
# backend
cd backend
npm install
MONGO_URI=mongodb://localhost:27017/bankdemo JWT_SECRET=dev_secret npm start

# frontend (separate terminal)
cd frontend
npm install
npm run dev
```

## API overview

- `POST /api/auth/register` / `POST /api/auth/login` / `GET /api/auth/me`
- `POST /api/cards/apply` `{ cardholderName, annualIncome, requestedLimit }`
- `GET /api/cards` / `GET /api/cards/:id`
- `POST /api/cards/:id/freeze` — toggles active ↔ frozen
- `POST /api/cards/:id/close`
- `POST /api/cards/:id/payment` `{ amount }`
- `POST /api/transactions` `{ cardId, merchant, category, amount }` — simulated purchase
- `GET /api/transactions?cardId=&status=&category=&from=&to=`
- `POST /api/statements/generate` `{ cardId }`
- `GET /api/statements?cardId=` / `GET /api/statements/:id`
- `GET /api/dashboard/summary` — totals, spend by category (30d), spend over time (30d), recent activity

Every request except register/login/health requires `Authorization: Bearer <token>`.

## Notes and next steps

This is a solid demo scaffold, not a production banking system. Worth knowing
before extending it:

- **No real payment rails.** There is no card network, no ACH, no real money
  movement anywhere — "payments" and "purchases" are simulated by API calls the
  UI makes on your behalf.
- **Simplified underwriting and fraud rules.** Both are deterministic,
  readable, and intentionally not real risk models — swap in real logic (or a
  vendor) before this pattern goes anywhere near production.
- **No scheduler.** Statement generation is triggered manually from the UI
  instead of running on a billing-cycle cron, to keep the demo dependency-free.
- **Single database.** Simpler to run and keeps balance/available-credit
  updates consistent (no cross-service transaction coordination), at the cost
  of the service-isolation you'd get from splitting this into microservices —
  see the companion storefront example for that pattern if you want to compare.
- **JWT secret** is a single shared value via `JWT_SECRET`, fine for a local
  demo; rotate it and use a proper secrets manager for anything real.
