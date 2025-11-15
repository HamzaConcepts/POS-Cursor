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

## 2. Backend Deployment (Railway)

1. Push code to GitHub
2. Connect Railway to GitHub repo
3. Set environment variables:
   - `DATABASE_URL` (from Supabase)
   - `JWT_SECRET` (generate random string)
   - `JWT_EXPIRES_IN=24h`
   - `NODE_ENV=production`
   - `FRONTEND_URL` (your Vercel URL)
4. Deploy

## 3. Frontend Deployment (Vercel)

1. Connect Vercel to GitHub repo
2. Set root directory to `client`
3. Set environment variable:
   - `VITE_API_URL` (your Railway backend URL + `/api`)
4. Deploy

## Database Connection

**Where to add Supabase connection:**

1. **Environment Variable**: Set `DATABASE_URL` in your hosting platform (Railway/Render)
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

