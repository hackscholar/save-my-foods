# Save My Foods

Backend-first scaffolding for a food-sharing marketplace that relies on Supabase for authentication, data storage, and media delivery.

## Backend

The backend is built with FastAPI and the official Supabase Python client. Core features include:

- Email/password authentication via Supabase Auth (`/auth/register`, `/auth/login`).
- CRUD-style listing APIs for marketplace items (`/listings`).
- Purchase endpoint that expects a Supabase Postgres function `decrement_inventory` to manage stock.
- Optional AI expiry estimation service that receives an image URL and returns an estimated expiry date.
- AI chatbot endpoint powered by Grok that can reason over text prompts and optionally an uploaded/hosted image.

### Project layout

```
backend/
├── app/
│   ├── config.py          # Settings loaded from environment
│   ├── dependencies.py    # Supabase client dependency wiring
│   ├── main.py            # FastAPI app and router registration
│   ├── routes/            # Auth, listings, purchases, AI chat
│   ├── schemas.py         # Pydantic request/response models
│   ├── services/grok.py   # Grok chatbot client (optional)
│   └── services/vision.py # AI expiry estimation client
├── requirements.txt       # Python dependencies
├── Dockerfile             # Backend container image
└── .env.example           # Sample configuration
```

### Environment variables

Copy `.env.example` to `backend/.env` and provide your Supabase project details:

- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Public anon key for client-side requests
- `SUPABASE_SERVICE_ROLE_KEY`: Optional service role key for elevated database operations
- `ALLOWED_ORIGINS`: JSON list of origins permitted by CORS (e.g., `["http://localhost:3000"]`)
- `AI_EXPIRY_ENDPOINT`: Optional HTTP endpoint that accepts `{ "image_url": "..." }` and returns `{ "estimated_days": 3 }`
- `AI_EXPIRY_API_KEY`: Optional bearer token for the AI endpoint
- `GROK_API_KEY`: API key for Grok chat completions
- `GROK_MODEL`: Grok model name (defaults to `grok-beta`)

### Supabase schema expectations

Create the following tables in Supabase (schema can be adjusted as needed):

- `profiles`: `id (uuid, pk)`, `email (text)`, `username (text)`
- `listings`: `id (bigint, pk)`, `title (text)`, `description (text)`, `price (numeric)`, `quantity (int4)`, `image_url (text)`, `location (text)`, `expires_on (date)`, `seller_id (uuid)`, `created_at (timestamptz, default now())`
- `purchases`: `id (bigint, pk)`, `listing_id (bigint, fk)`, `buyer_id (uuid)`, `quantity (int4)`, `purchased_at (timestamptz)`
- Postgres function `decrement_inventory(listing_id_input bigint, quantity_input int)` to atomically reduce `listings.quantity`.

### Grok chatbot endpoint

If `GROK_API_KEY` is configured the `/ai/chat` endpoint will forward prompts to Grok. Optional `image_url` values are fetched,
validated with OpenCV, and base64-encoded for multimodal prompts.

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
