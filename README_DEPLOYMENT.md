# Quick Deployment Checklist

## 1. Supabase Setup

### Create Tables
1. Go to Supabase → SQL Editor
2. Run `supabase/schema.sql`
3. Verify tables in Table Editor

### Seed Data
```bash
cd server
# Set DATABASE_URL in .env
node scripts/initSupabase.js
```

## 2. Vercel Deployment (Frontend + API)

The repository is now configured to deploy both the Vite client and the Express API on a single Vercel project using `vercel.json`.

1. Push code to GitHub if you have not already.
2. In the Vercel dashboard choose **Add New Project** → **Import Git Repository** and pick this repo.
3. For **Framework Preset** choose **Other** (Vercel will read `vercel.json`). Keep the root directory as the repo root.
4. Add the following **Environment Variables** (Preview and Production):
   - `DATABASE_URL` – Supabase connection string
   - `JWT_SECRET` – strong random value
   - `JWT_EXPIRES_IN` – e.g. `24h`
   - `FRONTEND_URL` – `https://<your-vercel-domain>` (used for CORS)
   - `VITE_API_URL` – `https://<your-vercel-domain>/api`
5. Click **Deploy**. Vercel will run `npm install` followed by `npm run build` (which builds the client) and bundle the API function under `api/index.js`.
6. After the first deployment, capture the production domain (e.g. `https://pos-cursor.vercel.app`) and update `FRONTEND_URL` / `VITE_API_URL` if you used a placeholder during setup. Redeploy so the API picks up the final domain.

## Database Connection

**Where to add Supabase connection:**

1. **Environment Variable**: Set `DATABASE_URL` in your hosting platform (Vercel)
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

2. **Database Config File**: `server/config/database.js` (already updated to use PostgreSQL)

3. **Connection is automatic**: The app will use `DATABASE_URL` from environment variables

## Files to Run in Supabase

1. **`supabase/schema.sql`** - Run this in Supabase SQL Editor to create all tables
2. **`supabase/seed.js`** - Run this locally (or use `server/scripts/initSupabase.js`) to seed initial data

## Default Login Credentials

- Manager: `manager` / `Manager@123`
- Admin: `admin` / `Admin@123`
- Cashier: `cashier` / `Cashier@123`

