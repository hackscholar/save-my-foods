# Save My Foods

Backend-first scaffolding for a food-sharing marketplace that relies on Supabase for authentication, data storage, and media delivery.

## Backend

The backend is built with FastAPI and the official Supabase Python client. Core features include:

- Email/password authentication via Supabase Auth (`/auth/register`, `/auth/login`).
- CRUD-style listing APIs for marketplace items (`/listings`).
- Purchase endpoint that expects a Supabase Postgres function `decrement_inventory` to manage stock.
- Optional AI expiry estimation service that receives an image URL and returns an estimated expiry date.
  - A bundled OpenCV + Grok-powered microservice now lives in `ai_estimator/`.

### Project layout

```
backend/
├── app/
│   ├── config.py          # Settings loaded from environment
│   ├── dependencies.py    # Supabase client dependency wiring
│   ├── main.py            # FastAPI app and router registration
│   ├── routes/            # Auth, listings, purchases
│   ├── schemas.py         # Pydantic request/response models
│   └── services/vision.py # AI expiry estimation client
├── requirements.txt       # Python dependencies
├── Dockerfile             # Backend container image
└── .env.example           # Sample configuration
ai_estimator/
├── app/                   # FastAPI-based AI estimator that wraps OpenCV + Grok
├── requirements.txt       # Dependencies for the estimator service
└── Dockerfile             # Container image for the estimator
```

### Environment variables

Copy `.env.example` to `backend/.env` and provide your Supabase project details:

- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Public anon key for client-side requests
- `SUPABASE_SERVICE_ROLE_KEY`: Optional service role key for elevated database operations
- `ALLOWED_ORIGINS`: JSON list of origins permitted by CORS (e.g., `["http://localhost:3000"]`)
- `AI_EXPIRY_ENDPOINT`: Optional HTTP endpoint that accepts `{ "image_url": "..." }` and returns `{ "estimated_days": 3 }`
- `AI_EXPIRY_API_KEY`: Optional bearer token for the AI endpoint

When using the bundled estimator, point `AI_EXPIRY_ENDPOINT` to `http://ai-estimator:8100/estimate` when running in Docker
Compose or `http://localhost:8100/estimate` when running locally.

### Supabase schema expectations

Create the following tables in Supabase (schema can be adjusted as needed):

- `profiles`: `id (uuid, pk)`, `email (text)`, `username (text)`
- `listings`: `id (bigint, pk)`, `title (text)`, `description (text)`, `price (numeric)`, `quantity (int4)`, `image_url (text)`, `location (text)`, `expires_on (date)`, `seller_id (uuid)`, `created_at (timestamptz, default now())`
- `purchases`: `id (bigint, pk)`, `listing_id (bigint, fk)`, `buyer_id (uuid)`, `quantity (int4)`, `purchased_at (timestamptz)`
- Postgres function `decrement_inventory(listing_id_input bigint, quantity_input int)` to atomically reduce `listings.quantity`.

### Running locally

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn backend.app.main:app --reload
```

### Docker

Build and run the backend with Docker Compose:

```bash
docker-compose up --build
```

The API will be available at http://localhost:8000 and exposes Swagger docs at `/docs`.

## AI expiry estimator microservice

The `ai_estimator` service downloads listing images, extracts text regions with OpenCV, then calls Grok (or any Grok-compatible
chat completions API) to turn visual hints into an `estimated_days` response.

### Environment variables

Copy `ai_estimator/.env.example` to `ai_estimator/.env` and fill in the optional Grok details:

- `GROK_API_URL`: Grok chat completions endpoint (e.g., `https://api.x.ai/v1/chat/completions`). If omitted, the service relies
  entirely on heuristics.
- `GROK_API_KEY`: Bearer token sent to the Grok endpoint.
- `GROK_MODEL`: Model identifier sent to Grok.
- `DEFAULT_SHELF_LIFE_DAYS`: Baseline heuristic used when no Grok response is available.
- `MAX_SHELF_LIFE_DAYS`: Upper bound for any estimated shelf life.

### Running locally

```bash
cd ai_estimator
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn ai_estimator.app.main:app --host 0.0.0.0 --port 8100 --reload
```

Send a request with:

```bash
curl -X POST http://localhost:8100/estimate \
  -H "Content-Type: application/json" \
  -d '{"image_url": "https://example.com/my-listing.jpg"}'
```

### Docker

```bash
docker-compose up --build
```

This starts both the core API and the AI estimator. The backend will call the estimator at `http://ai-estimator:8100/estimate`
by default.
