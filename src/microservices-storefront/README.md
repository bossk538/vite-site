# Microservices Storefront

A small e-commerce storefront built as separate microservices, fronted by an API
gateway and a React + Vite single-page app.

## Architecture

```
                         ┌─────────────┐
                         │  frontend   │  React + Vite  (port 5173)
                         └──────┬──────┘
                                │  HTTP (VITE_API_URL)
                                ▼
                         ┌─────────────┐
                         │ api-gateway │  Express reverse proxy (port 4000)
                         └──┬───┬───┬──┘
             ┌──────────────┘   │   └──────────────┐
             ▼                  ▼                  ▼
      ┌─────────────┐   ┌─────────────┐    ┌──────┴──────┐
      │user-service │   │cart-service │    │order-service│
      │  port 4001  │   │  port 4003  │    │  port 4004  │
      └──────┬──────┘   └──────┬──────┘    └──────┬──────┘
             │                 │  calls           │  calls
             │                 ▼                  ▼
             │          ┌─────────────┐    (cart-service,
             │          │product-svc  │◄────product-service)
             │          │  port 4002  │
             │          └──────┬──────┘
             ▼                 ▼                  ▼
      ┌───────────┐    ┌───────────┐       ┌───────────┐
      │mongo-user │    │mongo-     │       │mongo-order│
      │           │    │product/   │       │           │
      │           │    │cart (each │       │           │
      │           │    │ own DB)   │       │           │
      └───────────┘    └───────────┘       └───────────┘
```

Each backend service:
- is an independent Express app with its **own MongoDB database** (database-per-service),
- is only reachable from other containers on the Docker network (the gateway is the
  single public entry point for API traffic),
- validates JWTs itself where it needs an authenticated user, using a secret shared
  via the `JWT_SECRET` environment variable.

| Service | Responsibility | Port | Database |
|---|---|---|---|
| `api-gateway` | Routes `/api/*` requests to the right service, handles CORS | 4000 | — |
| `user-service` | Registration, login, JWT issuance, profile | 4001 | `userdb` |
| `product-service` | Product catalog (CRUD, search, categories) | 4002 | `productdb` |
| `cart-service` | Per-user shopping cart | 4003 | `cartdb` |
| `order-service` | Checkout — turns a cart into an order | 4004 | `orderdb` |
| `frontend` | React + Vite storefront UI | 5173 | — |

### Request flow: checkout

1. Frontend calls `POST /api/orders` with a bearer token.
2. `order-service` verifies the token, then calls `cart-service` (with the same
   token) to fetch the caller's cart.
3. `order-service` calls `product-service` to re-validate current prices for every
   item in the cart.
4. `order-service` creates the `Order` document, then asks `cart-service` to clear
   the cart.

This mirrors a realistic microservices pattern: services own their data and talk to
each other over HTTP rather than sharing a database.

## Running it

### With Docker Compose (recommended)

Requires Docker and Docker Compose.

```bash
cp .env.example .env    # optional, defaults work out of the box
docker compose up --build
```

This starts 4 MongoDB instances, the 4 backend services, the API gateway, and the
frontend dev server. Once everything is up:

- Storefront: http://localhost:5173
- API gateway: http://localhost:4000
- Individual services (for debugging): 4001 (users), 4002 (products), 4003 (cart),
  4004 (orders)

Seed the product catalog (only needs to be done once, or whenever you reset the
`mongo-product` volume):

```bash
docker compose exec product-service npm run seed
```

Then open http://localhost:5173, create an account, and start shopping.

To stop everything: `docker compose down` (add `-v` to also delete the database
volumes).

### Running services individually (without Docker)

Each service is a normal Node.js app. You'll need a local MongoDB instance (or one
Mongo container per service) and Node 20+.

```bash
# In each of: services/user-service, services/product-service,
# services/cart-service, services/order-service, api-gateway, frontend
npm install
```

Then set the environment variables each service expects (see each `Dockerfile` /
`docker-compose.yml` for the full list — mainly `MONGO_URI`, `JWT_SECRET`, and the
`*_SERVICE_URL` variables that tell services how to reach each other) and run
`npm start` (or `npm run dev` for the frontend/backend watch mode). Start the Mongo
instances and backend services before the gateway, and the gateway before the
frontend.

## API overview

All frontend traffic goes through the gateway at `/api/*`:

- `POST /api/auth/register` `{ name, email, password }`
- `POST /api/auth/login` `{ email, password }`
- `GET /api/auth/me` (auth required)
- `GET /api/products?category=&search=&page=`
- `GET /api/products/:id`
- `GET /api/products/categories`
- `POST /api/products` / `PUT /api/products/:id` / `DELETE /api/products/:id`
- `GET /api/cart` (auth required)
- `POST /api/cart/items` `{ productId, quantity }` (auth required)
- `PUT /api/cart/items/:productId` `{ quantity }` (auth required)
- `DELETE /api/cart/items/:productId` (auth required)
- `POST /api/orders` `{ shippingAddress }` (auth required) — checkout
- `GET /api/orders` (auth required)
- `GET /api/orders/:id` (auth required)

Every service also exposes `GET /health` for basic liveness checks.

## Notes and next steps

This is a solid demo scaffold, not a production deployment. A few things worth
knowing / adding before going further:

- **Payments are mocked.** Checkout confirms the order immediately; there's no
  payment provider integration.
- **No admin UI.** Product CRUD endpoints exist but the frontend only reads the
  catalog — use `curl`/Postman (or build an admin page) to add/edit products beyond
  the seed data.
- **JWT secret is shared** across services via `JWT_SECRET` for simplicity. In a
  real deployment you'd likely use asymmetric keys (JWKS) so only `user-service`
  needs the private key.
- **The frontend runs in Vite dev mode inside Docker** to keep the scaffold simple.
  For a production build, run `npm run build` in `frontend/` and serve the `dist/`
  folder with nginx (swap the frontend `Dockerfile` for a multi-stage build).
- **No message queue / event bus.** Services talk synchronously over HTTP. A more
  production-grade version might use events (e.g. "order placed") for things like
  inventory updates or emails.
- **No API gateway auth enforcement.** The gateway just proxies; each service
  enforces its own auth. A production gateway might centralize rate limiting and
  auth checks.
