# Point-of-Sale (POS) Software - Development Specification

## Project Overview
Build a basic Point-of-Sale system with inventory management, sales processing, accounting, and reporting capabilities. The application should use a black and white theme with minimal but modern styling.

## Technology Stack Recommendations
- **Frontend**: React.js with TypeScript
- **Styling**: Tailwind CSS (black/white/gray color scheme only)
- **Backend**: Node.js with Express
- **Database**: PostgreSQL or SQLite
- **Authentication**: JWT (JSON Web Tokens)
- **PDF Generation**: jsPDF or PDFKit
- **CSV Export**: Papa Parse or Fast-CSV

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('Manager', 'Admin', 'Cashier')),
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);
```

### Products Table
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2) NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Sales Table
```sql
CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    sale_number VARCHAR(50) UNIQUE NOT NULL,
    cashier_id INTEGER REFERENCES users(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(20) CHECK (payment_method IN ('Cash', 'Digital')),
    payment_status VARCHAR(20) CHECK (payment_status IN ('Paid', 'Partial', 'Pending')),
    amount_paid DECIMAL(10, 2) DEFAULT 0,
    amount_due DECIMAL(10, 2) DEFAULT 0,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);
```

### Sale Items Table
```sql
CREATE TABLE sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL
);
```

### Expenses Table
```sql
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50),
    expense_date DATE NOT NULL,
    recorded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Payments Table (for partial payments)
```sql
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES sales(id),
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(20),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recorded_by INTEGER REFERENCES users(id)
);
```

## Feature Specifications

### 1. Authentication & User Management

#### Login/Signup System
- **POST /api/auth/register**
  - Body: `{ username, email, password, full_name, role }`
  - Only Manager can create new users
  - Hash passwords using bcrypt
  - Return JWT token on success

- **POST /api/auth/login**
  - Body: `{ username/email, password }`
  - Validate credentials
  - Return JWT token and user role

- **GET /api/auth/me**
  - Protected route (requires JWT)
  - Return current user information

#### User Role Permissions
```javascript
const permissions = {
  Manager: [
    'create_user', 'edit_user', 'delete_user',
    'create_product', 'edit_product', 'delete_product',
    'process_sale', 'view_sales', 'delete_sale',
    'add_expense', 'edit_expense', 'delete_expense',
    'view_reports', 'export_reports',
    'view_dashboard'
  ],
  Admin: [
    'create_product', 'edit_product', 'delete_product',
    'process_sale', 'view_sales',
    'add_expense', 'edit_expense', 'view_reports',
    'export_reports', 'view_dashboard'
  ],
  Cashier: [
    'process_sale', 'view_sales', 'view_dashboard'
  ]
};
```

### 2. Inventory Management System

#### API Endpoints
- **GET /api/products**
  - Query params: `?search=&category=&low_stock=true`
  - Return list of products with stock levels
  - Highlight low stock items (quantity <= low_stock_threshold)

- **POST /api/products**
  - Body: `{ name, sku, price, cost_price, stock_quantity, low_stock_threshold, category, description }`
  - Permission: Admin, Manager

- **PUT /api/products/:id**
  - Update product details
  - Permission: Admin, Manager

- **DELETE /api/products/:id**
  - Soft delete or hard delete product
  - Permission: Manager only

#### UI Components
- **Product List View**
  - Table with columns: SKU, Name, Price, Stock, Category, Actions
  - Search bar and category filter
  - Low stock indicator (red badge/icon when stock <= threshold)
  - Add Product button (visible to Admin/Manager)

- **Product Form Modal**
  - Fields: Name, SKU, Description, Price, Cost Price, Stock Quantity, Low Stock Threshold, Category
  - Validation: Required fields, positive numbers for prices

- **Low Stock Alert Dashboard Widget**
  - List of products with stock <= threshold
  - Click to navigate to product edit

### 3. Point-of-Sale System

#### API Endpoints
- **POST /api/sales**
  - Body: `{ items: [{ product_id, quantity }], payment_method, amount_paid, notes }`
  - Calculate total automatically
  - Reduce stock quantities for each product
  - Create sale record and sale_items
  - Calculate amount_due if partial payment
  - Return sale receipt data

- **GET /api/sales**
  - Query params: `?start_date=&end_date=&cashier_id=`
  - Return list of sales

- **GET /api/sales/:id**
  - Return detailed sale information with items

- **POST /api/sales/:id/payment**
  - Add partial payment
  - Update sale payment_status when fully paid

#### UI Components
- **POS Screen**
  - Product search/selection dropdown
  - Cart table: Product, Quantity, Unit Price, Subtotal
  - Remove item from cart button
  - Total display (large, prominent)
  - Payment method selection (Cash/Digital)
  - Amount paid input
  - Amount due display (if partial)
  - Process Sale button
  - Clear cart button

- **Receipt View**
  - Sale number, date/time
  - Cashier name
  - List of items purchased
  - Total amount
  - Payment method
  - Amount paid/due
  - Print receipt button (browser print dialog)

### 4. Accounting System

#### API Endpoints
- **GET /api/accounting/summary**
  - Query params: `?start_date=&end_date=`
  - Calculate and return:
    - Total revenue (sum of all sales)
    - Total expenses
    - Gross profit (revenue - cost of goods sold)
    - Net profit (gross profit - expenses)
    - Outstanding payments (partial payment sales)

- **POST /api/expenses**
  - Body: `{ description, amount, category, expense_date }`
  - Permission: Admin, Manager

- **GET /api/expenses**
  - Query params: `?start_date=&end_date=&category=`
  - Return list of expenses

- **PUT /api/expenses/:id**
  - Update expense
  - Permission: Admin, Manager

- **DELETE /api/expenses/:id**
  - Delete expense
  - Permission: Manager only

#### UI Components
- **Accounting Dashboard**
  - Summary cards: Revenue, Expenses, Net Profit, Outstanding Payments
  - Period selector (Today, This Week, This Month, This Year, Custom)
  - Expense list table
  - Add Expense button

- **Expense Form Modal**
  - Fields: Description, Amount, Category, Date
  - Validation: Required fields, positive amount

### 5. Dashboard

#### API Endpoints
- **GET /api/dashboard/stats**
  - Return:
    - Today's sales count and revenue
    - This month's sales count and revenue
    - Low stock products count
    - Recent sales (last 10)
    - Top selling products
    - Sales trend (last 7 days)
    - Expense summary for current month

#### UI Components
- **Dashboard Grid Layout**
  - **Summary Cards (Top Row)**
    - Today's Sales: Count and Amount
    - Monthly Sales: Count and Amount
    - Monthly Expenses
    - Net Profit (Monthly)
    - Low Stock Alert: Count with warning icon

  - **Charts/Graphs (Middle Section)**
    - Sales trend line chart (last 7 days)
    - Bar chart: Top 5 products by revenue

  - **Quick Lists (Bottom Section)**
    - Recent Sales table (last 10)
    - Low Stock Products list (5 items)

### 6. Reports System

#### API Endpoints
- **GET /api/reports/sales**
  - Query params: `?start_date=&end_date=&period=daily|monthly|yearly&format=json|csv|pdf&employee_id=`
  - Generate sales report
  - Group by period (daily/monthly/yearly)
  - Optional: Filter by employee (cashier)
  - Return JSON or trigger download for CSV/PDF

- **GET /api/reports/payment-methods**
  - Query params: `?start_date=&end_date=&format=json|csv|pdf`
  - Summary of cash vs digital payments
  - Return totals and counts for each method

- **GET /api/reports/employee-sales**
  - Query params: `?start_date=&end_date=&format=json|csv|pdf`
  - Sales breakdown by employee
  - Return employee name, sale count, total revenue

#### Report Formats

**CSV Structure:**
```csv
Report Type, Period, Generated Date
Sale Number, Date, Cashier, Items Count, Total, Payment Method, Status

Daily Sales Summary
Date, Sales Count, Total Revenue, Cash Amount, Digital Amount

Employee Sales Report
Employee Name, Sales Count, Total Revenue, Average Sale
```

**PDF Structure:**
- Header: Company name, report type, date range
- Summary section with key metrics
- Detailed table of transactions
- Footer: Generated date, generated by user

#### UI Components
- **Reports Page**
  - Report type selector dropdown
  - Date range picker (start and end date)
  - Period selector (Daily/Monthly/Yearly) for sales reports
  - Employee filter dropdown (for employee sales)
  - Export format buttons (View, Export CSV, Export PDF)
  - Preview area for report data

### 7. UI/UX Design Guidelines

#### Color Scheme
```css
/* Primary Colors */
--bg-primary: #FFFFFF;
--bg-secondary: #F5F5F5;
--bg-dark: #000000;

/* Text Colors */
--text-primary: #000000;
--text-secondary: #666666;
--text-inverse: #FFFFFF;

/* Border Colors */
--border-light: #E0E0E0;
--border-dark: #000000;

/* Status Colors (Monochrome) */
--status-success: #000000;
--status-warning: #666666;
--status-error: #333333;
--status-info: #999999;
```

#### Layout Structure
- **Sidebar Navigation** (Left)
  - Logo/App name at top
  - Navigation links: Dashboard, POS, Inventory, Sales, Accounting, Reports, Users (Manager only)
  - User profile section at bottom (name, role, logout)

- **Main Content Area** (Right)
  - Page header with title and action buttons
  - Content cards with subtle shadows
  - Tables with alternating row colors (white/light gray)

#### Component Styling
- **Buttons**: Black background, white text, hover: gray background
- **Input Fields**: White background, black border, focus: thicker border
- **Tables**: Header with black background, white text; body with alternating rows
- **Modals**: White background, black border, centered overlay
- **Cards**: White background, subtle gray border, 4px border-radius
- **Icons**: Use simple, line-based icons (Lucide or Heroicons)

#### Responsive Design
- Mobile: Stack cards vertically, hamburger menu for sidebar
- Tablet: 2-column grid for cards
- Desktop: Full sidebar, multi-column layouts

## Implementation Guidelines

### Backend Structure
```
/server
  /config
    database.js
    auth.js
  /controllers
    authController.js
    productController.js
    salesController.js
    expenseController.js
    reportController.js
    dashboardController.js
  /middleware
    authMiddleware.js
    roleMiddleware.js
  /models
    User.js
    Product.js
    Sale.js
    Expense.js
  /routes
    auth.js
    products.js
    sales.js
    expenses.js
    reports.js
    dashboard.js
  /utils
    pdfGenerator.js
    csvGenerator.js
  server.js
```

### Frontend Structure
```
/client
  /src
    /components
      /common
        Button.jsx
        Input.jsx
        Modal.jsx
        Table.jsx
      /layout
        Sidebar.jsx
        Header.jsx
        Layout.jsx
      /dashboard
        DashboardCard.jsx
        SalesChart.jsx
        LowStockAlert.jsx
      /pos
        POSScreen.jsx
        Cart.jsx
        Receipt.jsx
      /inventory
        ProductList.jsx
        ProductForm.jsx
      /sales
        SalesList.jsx
        SaleDetail.jsx
      /accounting
        AccountingSummary.jsx
        ExpenseList.jsx
        ExpenseForm.jsx
      /reports
        ReportGenerator.jsx
      /users
        UserList.jsx
        UserForm.jsx
    /pages
      Dashboard.jsx
      POS.jsx
      Inventory.jsx
      Sales.jsx
      Accounting.jsx
      Reports.jsx
      Users.jsx
      Login.jsx
    /hooks
      useAuth.js
      useApi.js
    /utils
      api.js
      formatters.js
    /context
      AuthContext.jsx
    App.jsx
    index.jsx
```

### Security Considerations
1. Hash all passwords using bcrypt (minimum 10 rounds)
2. Use JWT with expiration (e.g., 24 hours)
3. Implement refresh tokens for extended sessions
4. Validate all user inputs on backend
5. Use parameterized queries to prevent SQL injection
6. Implement rate limiting on authentication endpoints
7. Use HTTPS in production
8. Store sensitive config in environment variables
9. Implement role-based middleware for protected routes

### Validation Rules
- **Username**: 3-50 characters, alphanumeric and underscore only
- **Email**: Valid email format
- **Password**: Minimum 8 characters, at least one uppercase, one lowercase, one number
- **Prices**: Positive decimal numbers, max 2 decimal places
- **Quantities**: Positive integers
- **SKU**: Unique, alphanumeric with hyphens allowed
- **Dates**: Valid date format, not future dates for sales/expenses

### Error Handling
- Use try-catch blocks for all async operations
- Return consistent error response format:
  ```json
  {
    "success": false,
    "error": "Error message here",
    "code": "ERROR_CODE"
  }
  ```
- Log all errors to console (use logging library in production)
- Display user-friendly error messages in UI
- Handle network errors gracefully with retry options

### Testing Checklist
- [ ] User registration and login
- [ ] Role-based access control
- [ ] Product CRUD operations
- [ ] Low stock alerts display correctly
- [ ] POS sale processing reduces stock
- [ ] Partial payment calculations
- [ ] Dashboard statistics are accurate
- [ ] Reports generate correct data
- [ ] CSV export downloads properly
- [ ] PDF export generates readable files
- [ ] Responsive design on mobile/tablet/desktop

## Initial Setup Data

### Default Users (for testing)
```javascript
{
  username: "manager",
  password: "Manager@123",
  role: "Manager",
  email: "manager@pos.com"
}
{
  username: "admin",
  password: "Admin@123",
  role: "Admin",
  email: "admin@pos.com"
}
{
  username: "cashier",
  password: "Cashier@123",
  role: "Cashier",
  email: "cashier@pos.com"
}
```

### Sample Products
```javascript
[
  { name: "Product A", sku: "PRD-001", price: 29.99, cost_price: 15.00, stock_quantity: 100, low_stock_threshold: 10 },
  { name: "Product B", sku: "PRD-002", price: 49.99, cost_price: 25.00, stock_quantity: 5, low_stock_threshold: 10 },
  { name: "Product C", sku: "PRD-003", price: 19.99, cost_price: 10.00, stock_quantity: 50, low_stock_threshold: 15 }
]
```

## Development Phases

### Phase 1: Foundation (Week 1)
- Set up project structure (frontend + backend)
- Configure database and create tables
- Implement authentication system
- Create basic layout with sidebar navigation

### Phase 2: Core Features (Week 2-3)
- Build inventory management (CRUD)
- Implement POS system
- Create dashboard with basic stats
- Build sales listing page

### Phase 3: Advanced Features (Week 4)
- Implement accounting system
- Build report generation
- Add CSV/PDF export functionality
- Implement user management (for Manager role)

### Phase 4: Polish & Testing (Week 5)
- Refine UI/UX
- Add loading states and error handling
- Test all user roles and permissions
- Fix bugs and optimize performance

## API Response Formats

### Success Response
```json
{
  "success": true,
  "data": { },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## Notes for Cursor

This specification provides complete database schemas, API endpoints, UI components, and implementation structure. When generating code:

1. Use TypeScript for type safety
2. Follow RESTful API conventions
3. Implement proper error handling in all functions
4. Add JSDoc comments for functions
5. Use async/await for asynchronous operations
6. Implement input validation on both frontend and backend
7. Use environment variables for configuration
8. Follow the file structure provided
9. Implement middleware for authentication and authorization
10. Use the exact database schema provided
11. Stick to black and white color scheme
12. Ensure all permissions are enforced on backend routes

Generate production-ready code with proper error handling, validation, and security measures.