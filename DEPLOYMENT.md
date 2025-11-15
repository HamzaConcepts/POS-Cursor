# Deployment Guide - POS System

This guide will help you deploy the POS system to free hosting services and set up Supabase as the database.

## Prerequisites

1. **Supabase Account** - Sign up at [supabase.com](https://supabase.com)
2. **GitHub Account** - For version control and deployment
3. **Vercel Account** - For frontend hosting (free tier)
4. **Railway/Render Account** - For backend hosting (free tier)

## Step 1: Set Up Supabase Database

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Name**: pos-system (or your preferred name)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait for the project to be created (takes 1-2 minutes)

### 1.2 Get Database Connection String

1. In your Supabase project, go to **Settings** → **Database**
2. Scroll down to **Connection string**
3. Select **URI** tab
4. Copy the connection string (it looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)
5. Replace `[YOUR-PASSWORD]` with your actual database password
6. Save this - you'll need it for environment variables

### 1.3 Create Database Tables

1. In Supabase, go to **SQL Editor**
2. Click **New query**
3. Copy and paste the contents of `supabase/schema.sql`
4. Click **Run** (or press Ctrl+Enter)
5. Verify tables were created by going to **Table Editor**

### 1.4 Seed Initial Data

**Option A: Using SQL Editor (Quick)**
1. In Supabase SQL Editor, run the seed script
2. Note: You'll need to generate password hashes first (see Option B)

**Option B: Using Node.js Script (Recommended)**
1. In your local project, create a `.env` file in the `server` directory:
   ```env
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
2. Run the seed script:
   ```bash
   cd server
   npm install
   node scripts/initSupabase.js
   ```

## Step 2: Deploy Backend to Railway

### 2.1 Prepare Backend for Deployment

1. Create a `railway.json` or `Procfile` in the `server` directory:
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "node server.js",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

2. Update `server/package.json` to ensure start script exists:
   ```json
   {
     "scripts": {
       "start": "node server.js"
     }
   }
   ```

### 2.2 Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repository
4. Railway will detect the Node.js app
5. Add environment variables:
   - `DATABASE_URL` - Your Supabase connection string
   - `JWT_SECRET` - A random secret string (generate with: `openssl rand -base64 32`)
   - `JWT_EXPIRES_IN` - `24h`
   - `NODE_ENV` - `production`
   - `PORT` - Railway will set this automatically
6. Railway will automatically deploy
7. Copy the deployment URL (e.g., `https://your-app.railway.app`)

### Alternative: Deploy to Render

1. Go to [render.com](https://render.com) and sign in
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: pos-backend
   - **Root Directory**: server
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Add environment variables (same as Railway)
6. Click **Create Web Service**

## Step 3: Deploy Frontend to Vercel

### 3.1 Update Frontend API URL

1. In `client` directory, create `.env.production`:
   ```env
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```

2. Or update `client/src/utils/api.ts` to use environment variable:
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
   ```

### 3.2 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variable:
   - `VITE_API_URL` - Your backend URL (e.g., `https://your-backend.railway.app/api`)
6. Click **Deploy**
7. Vercel will provide a URL (e.g., `https://your-app.vercel.app`)

## Step 4: Update CORS Settings

1. In your backend code (`server/server.js`), update CORS to allow your frontend domain:
   ```javascript
   app.use(cors({
     origin: [
       'http://localhost:3000',
       'https://your-app.vercel.app'
     ],
     credentials: true
   }));
   ```

2. Redeploy the backend

## Step 5: Update Supabase Row Level Security (Optional but Recommended)

For production, you should set up Row Level Security (RLS) in Supabase:

1. Go to **Authentication** → **Policies** in Supabase
2. For each table, create policies as needed
3. For now, you can disable RLS for development:
   ```sql
   ALTER TABLE users DISABLE ROW LEVEL SECURITY;
   ALTER TABLE products DISABLE ROW LEVEL SECURITY;
   ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
   -- etc.
   ```

## Environment Variables Summary

### Backend (Railway/Render)
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
NODE_ENV=production
PORT=5000 (auto-set by hosting)
```

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend.railway.app/api
```

## Testing the Deployment

1. Visit your Vercel frontend URL
2. Try logging in with:
   - Username: `manager` / Password: `Manager@123`
   - Username: `admin` / Password: `Admin@123`
   - Username: `cashier` / Password: `Cashier@123`
3. Test creating a product, making a sale, etc.

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check Supabase project is active
- Ensure password is URL-encoded if it contains special characters

### CORS Errors
- Update CORS settings in backend to include frontend URL
- Check that frontend is using correct API URL

### Build Errors
- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Check build logs in hosting platform

## Free Hosting Limits

### Vercel (Frontend)
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Perfect for static sites

### Railway (Backend)
- ⚠️ $5 free credit/month (usually enough for small apps)
- ⚠️ Sleeps after inactivity (wakes on request)

### Render (Backend Alternative)
- ⚠️ Free tier sleeps after 15 minutes of inactivity
- ⚠️ Slower cold starts

### Supabase (Database)
- ✅ 500MB database
- ✅ 2GB bandwidth
- ✅ Perfect for small to medium apps

## Next Steps

1. Set up custom domain (optional)
2. Configure SSL certificates (automatic with Vercel/Railway)
3. Set up monitoring and error tracking
4. Configure backups for Supabase database

