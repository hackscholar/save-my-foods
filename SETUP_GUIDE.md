# Local Development Setup Guide

This guide will help you set up and run the Save My Foods full stack website locally.

## Prerequisites

1. **Node.js** (version 20.9.0 or higher)

   - Check your version: `node --version`
   - Download from: https://nodejs.org/
   - Or use nvm: `nvm install 20` then `nvm use 20`

2. **npm** (comes with Node.js)

   - Check your version: `npm --version`

3. **Supabase Account** (for database and authentication)

   - Sign up at: https://supabase.com
   - Create a new project
   - Get your project URL and API keys

4. **Resend Account** (for email notifications)
   - Sign up at: https://resend.com
   - Get your API key from the dashboard

## Step-by-Step Setup

### 1. Install Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

This will install all required packages including:

- Next.js (React framework)
- Supabase client
- Resend (email service)
- Other dependencies

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory of the project:

```bash
# Windows (PowerShell)
New-Item -Path .env.local -ItemType File

# Mac/Linux
touch .env.local
```

Add the following environment variables to `.env.local`:

```env
# Supabase Configuration (Required)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Resend Email Configuration (Required for email notifications)
RESEND_API_KEY=re_your-resend-api-key
RESEND_FROM_EMAIL=onboarding@resend.dev

# Optional: Gemini AI Configuration (for item enrichment)
# GEMINI_API_KEY=your-gemini-api-key
# GEMINI_MODEL=gemini-1.5-flash
```

#### Where to Find These Values:

**Supabase:**

1. Go to your Supabase project dashboard
2. Click on "Settings" → "API"
3. Copy:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` key → `SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

**Resend:**

1. Go to https://resend.com and sign in
2. Navigate to "API Keys" in the dashboard
3. Create a new API key or use an existing one
4. Copy the key → `RESEND_API_KEY`
5. For development, use `onboarding@resend.dev` as `RESEND_FROM_EMAIL` (no verification needed)

### 3. Set Up Supabase Database

Make sure your Supabase database has the `items` table. Run this SQL in your Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'inventory',
  name text NOT NULL,
  expiry_date date,
  date_of_purchase date,
  price numeric,
  quantity integer NOT NULL DEFAULT 0,
  image_path text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 4. Start the Development Server

Run the following command:

```bash
npm run dev
```

You should see output like:

```
▲ Next.js 16.0.3 (Turbopack)
- Local:        http://localhost:3000
- Network:      http://your-ip:3000

✓ Ready in 4.8s
```

### 5. Access the Application

Open your browser and navigate to:

```
http://localhost:3000
```

## Available Scripts

- `npm run dev` - Start development server (with hot reload)
- `npm run build` - Build for production
- `npm run start` - Start production server (after building)
- `npm run lint` - Run ESLint

## Testing the Application

### 1. Test User Registration

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 2. Test Fetching Users

```bash
node fetch-users.js
```

### 3. Test Creating an Item

```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "sellerId": "your-user-id",
    "name": "Fresh Tomatoes",
    "price": 4.99,
    "quantity": 3,
    "type": "marketplace"
  }'
```

### 4. Test Buy Endpoint

Use the Contact Seller Modal component in your frontend, or test directly:

```bash
curl -X POST http://localhost:3000/api/items/buy \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "item-id",
    "buyerId": "buyer-id",
    "message": "Hi! I am interested in buying this item."
  }'
```

## Troubleshooting

### Port 3000 Already in Use

If port 3000 is already in use, you can change it:

```bash
# Windows
set PORT=3001 && npm run dev

# Mac/Linux
PORT=3001 npm run dev
```

### Environment Variables Not Loading

- Make sure `.env.local` is in the root directory (same level as `package.json`)
- Restart the development server after changing environment variables
- Check for typos in variable names (they're case-sensitive)

### Node.js Version Error

If you see "Node.js version >=20.9.0 is required":

- Upgrade Node.js to version 20 or higher
- Or use nvm to switch versions: `nvm use 20`

### Supabase Connection Errors

- Verify your `SUPABASE_URL` and keys are correct
- Check that your Supabase project is active
- Ensure the `items` table exists in your database

### Email Not Sending

- Verify `RESEND_API_KEY` is set correctly
- Check Resend dashboard for any errors
- For development, use `onboarding@resend.dev` as the sender email

## Project Structure

```
save-my-foods/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── api/          # API routes
│   │   │   ├── auth/     # Authentication endpoints
│   │   │   ├── items/    # Item management endpoints
│   │   │   └── users/    # User endpoints
│   │   ├── page.js       # Home page
│   │   └── globals.css   # Global styles
│   ├── components/       # React components
│   │   └── ContactSellerModal.js
│   └── lib/              # Utility functions
│       ├── email.js      # Email service
│       ├── items.js      # Item operations
│       ├── supabase.js   # Supabase client
│       └── users.js      # User operations
├── .env.local            # Environment variables (create this)
├── package.json          # Dependencies
└── README.md             # Project documentation
```

## Next Steps

1. Create user accounts via `/api/auth/register`
2. Create items via `/api/items`
3. Test the buy/contact seller functionality
4. Integrate the `ContactSellerModal` component into your frontend

## Need Help?

- Check the console for error messages
- Review the API responses in the Network tab
- Verify all environment variables are set correctly
- Make sure your Supabase project is properly configured
