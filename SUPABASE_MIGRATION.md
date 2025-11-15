# Supabase Migration Guide

## Quick Summary

All SQL queries need to be converted from SQLite syntax (`?`) to PostgreSQL syntax (`$1, $2, $3...`).

## Files That Need Updates

The following files have been updated to use PostgreSQL:
- ✅ `server/config/database.js` - Now uses `pg` library
- ✅ `server/controllers/dashboardController.js` - Date functions updated
- ⚠️ `server/controllers/salesController.js` - Partially updated (needs all `?` to `$1, $2...`)
- ⚠️ `server/controllers/productController.js` - Needs all `?` to `$1, $2...`
- ⚠️ `server/controllers/authController.js` - Needs all `?` to `$1, $2...`
- ⚠️ `server/middleware/authMiddleware.js` - Needs all `?` to `$1, $2...`

## Conversion Pattern

**SQLite (old):**
```javascript
await query('SELECT * FROM users WHERE id = ?', [id]);
```

**PostgreSQL (new):**
```javascript
await query('SELECT * FROM users WHERE id = $1', [id]);
```

## Where to Add Supabase Connection

1. **Environment Variable**: Set `DATABASE_URL` in your hosting platform
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

2. **Database Config**: `server/config/database.js` (already updated)

3. **Connection is automatic**: The app reads `DATABASE_URL` from environment variables

## Database Setup Steps

1. **Create Supabase Project** at supabase.com
2. **Get Connection String** from Settings → Database
3. **Run Schema**: Copy `supabase/schema.sql` to Supabase SQL Editor and run it
4. **Seed Data**: Run `node server/scripts/initSupabase.js` locally with DATABASE_URL set

## Important Notes

- All `?` placeholders must be converted to `$1, $2, $3...`
- SQLite `date('now', '-7 days')` becomes PostgreSQL `CURRENT_DATE - INTERVAL '7 days'`
- SQLite `AUTOINCREMENT` becomes PostgreSQL `SERIAL`
- SQLite `DATETIME` becomes PostgreSQL `TIMESTAMP`

