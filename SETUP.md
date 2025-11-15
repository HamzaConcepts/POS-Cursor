# POS System - Setup Guide

## Quick Start

### 1. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h
DB_PATH=./database/pos.db
NODE_ENV=development
```

Initialize the database:

```bash
npm run init-db
```

Start the server:

```bash
npm start
# or for development:
npm run dev
```

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Default Login Credentials

After running `npm run init-db`, you can login with:

- **Manager**: `manager` / `Manager@123`
- **Admin**: `admin` / `Admin@123`
- **Cashier**: `cashier` / `Cashier@123`

## Phase 1 Features Implemented

✅ Complete project structure (frontend + backend)
✅ Database schema with all tables
✅ SQLite database configuration
✅ JWT authentication system
✅ User registration (Manager only)
✅ User login
✅ Protected routes middleware
✅ Role-based access control
✅ React frontend with TypeScript
✅ Tailwind CSS with black/white theme
✅ Sidebar navigation
✅ Login page
✅ Authentication context
✅ Protected route wrapper
✅ API client with token management

## Next Steps (Phase 2)

- Inventory management (CRUD)
- POS system
- Dashboard with statistics
- Sales listing page

