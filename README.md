# Point-of-Sale (POS) System

A modern Point-of-Sale system with inventory management, sales processing, accounting, and reporting capabilities.

## Technology Stack

- **Frontend**: React.js with TypeScript, Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: SQLite (can be easily switched to PostgreSQL)
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure

```
POS-Cursor/
├── server/          # Backend application
├── client/          # Frontend application
└── pos_software_spec.md  # Complete specification
```

## Phase 1: Foundation (Completed)

✅ Project structure setup
✅ Database configuration and schema
✅ Authentication system (JWT)
✅ Basic layout with sidebar navigation
✅ Login page

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h
DB_PATH=./database/pos.db
NODE_ENV=development
```

4. Initialize the database:
```bash
npm run init-db
```

This will create all tables and insert default users:
- Manager: `manager` / `Manager@123`
- Admin: `admin` / `Admin@123`
- Cashier: `cashier` / `Cashier@123`

5. Start the server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user (Manager only)
- `GET /api/auth/me` - Get current user info (Protected)

### Health Check

- `GET /api/health` - Check API status

## Default Users

For testing purposes, the following users are created:

| Username | Password    | Role    |
|----------|-------------|---------|
| manager  | Manager@123 | Manager |
| admin    | Admin@123   | Admin   |
| cashier  | Cashier@123 | Cashier |

## Development Phases

- **Phase 1**: Foundation ✅ (Completed)
- **Phase 2**: Core Features (Inventory, POS, Dashboard, Sales)
- **Phase 3**: Advanced Features (Accounting, Reports, User Management)
- **Phase 4**: Polish & Testing

## License

ISC

