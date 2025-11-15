import { getDatabase, run } from '../config/database.js';
import bcrypt from 'bcrypt';

/**
 * Create all database tables
 */
async function createTables() {
  const db = await getDatabase();

  // Users table
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL CHECK (role IN ('Manager', 'Admin', 'Cashier')),
      full_name VARCHAR(100) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT 1
    )
  `);

  // Products table
  await run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      sku VARCHAR(50) UNIQUE NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      cost_price DECIMAL(10, 2) NOT NULL,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      low_stock_threshold INTEGER DEFAULT 10,
      category VARCHAR(50),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Sales table
  await run(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_number VARCHAR(50) UNIQUE NOT NULL,
      cashier_id INTEGER REFERENCES users(id),
      total_amount DECIMAL(10, 2) NOT NULL,
      payment_method VARCHAR(20) CHECK (payment_method IN ('Cash', 'Digital')),
      payment_status VARCHAR(20) CHECK (payment_status IN ('Paid', 'Partial', 'Pending')),
      amount_paid DECIMAL(10, 2) DEFAULT 0,
      amount_due DECIMAL(10, 2) DEFAULT 0,
      sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      notes TEXT
    )
  `);

  // Sale items table
  await run(`
    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id),
      quantity INTEGER NOT NULL,
      unit_price DECIMAL(10, 2) NOT NULL,
      subtotal DECIMAL(10, 2) NOT NULL
    )
  `);

  // Expenses table
  await run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description VARCHAR(255) NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      category VARCHAR(50),
      expense_date DATE NOT NULL,
      recorded_by INTEGER REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Payments table
  await run(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER REFERENCES sales(id),
      amount DECIMAL(10, 2) NOT NULL,
      payment_method VARCHAR(20),
      payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      recorded_by INTEGER REFERENCES users(id)
    )
  `);

  console.log('Database tables created successfully');
}

/**
 * Insert default users
 */
async function insertDefaultUsers() {
  const defaultUsers = [
    {
      username: 'manager',
      email: 'manager@pos.com',
      password: 'Manager@123',
      role: 'Manager',
      full_name: 'Manager User'
    },
    {
      username: 'admin',
      email: 'admin@pos.com',
      password: 'Admin@123',
      role: 'Admin',
      full_name: 'Admin User'
    },
    {
      username: 'cashier',
      email: 'cashier@pos.com',
      password: 'Cashier@123',
      role: 'Cashier',
      full_name: 'Cashier User'
    }
  ];

  for (const user of defaultUsers) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    try {
      await run(
        `INSERT INTO users (username, email, password_hash, role, full_name) 
         VALUES (?, ?, ?, ?, ?)`,
        [user.username, user.email, passwordHash, user.role, user.full_name]
      );
      console.log(`Created user: ${user.username}`);
    } catch (error) {
      if (error.message.includes('UNIQUE constraint')) {
        console.log(`User ${user.username} already exists, skipping...`);
      } else {
        console.error(`Error creating user ${user.username}:`, error);
      }
    }
  }
}

/**
 * Insert sample products
 */
async function insertSampleProducts() {
  const sampleProducts = [
    {
      name: 'Product A',
      sku: 'PRD-001',
      price: 29.99,
      cost_price: 15.0,
      stock_quantity: 100,
      low_stock_threshold: 10,
      category: 'Category 1',
      description: 'Sample product A'
    },
    {
      name: 'Product B',
      sku: 'PRD-002',
      price: 49.99,
      cost_price: 25.0,
      stock_quantity: 5,
      low_stock_threshold: 10,
      category: 'Category 1',
      description: 'Sample product B'
    },
    {
      name: 'Product C',
      sku: 'PRD-003',
      price: 19.99,
      cost_price: 10.0,
      stock_quantity: 50,
      low_stock_threshold: 15,
      category: 'Category 2',
      description: 'Sample product C'
    }
  ];

  for (const product of sampleProducts) {
    try {
      await run(
        `INSERT INTO products (name, sku, price, cost_price, stock_quantity, low_stock_threshold, category, description) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          product.name,
          product.sku,
          product.price,
          product.cost_price,
          product.stock_quantity,
          product.low_stock_threshold,
          product.category,
          product.description
        ]
      );
      console.log(`Created product: ${product.name}`);
    } catch (error) {
      if (error.message.includes('UNIQUE constraint')) {
        console.log(`Product ${product.sku} already exists, skipping...`);
      } else {
        console.error(`Error creating product ${product.sku}:`, error);
      }
    }
  }
}

/**
 * Initialize database
 */
async function initDatabase() {
  try {
    console.log('Initializing database...');
    await createTables();
    await insertDefaultUsers();
    await insertSampleProducts();
    console.log('Database initialization completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();

