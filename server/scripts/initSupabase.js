// Initialize Supabase database with tables and seed data
// Run this with: node scripts/initSupabase.js
// Make sure to set DATABASE_URL environment variable

import { query, run } from '../config/database.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Create all database tables
 */
async function createTables() {
  console.log('Creating tables...');

  // Users table
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL CHECK (role IN ('Manager', 'Admin', 'Cashier')),
      full_name VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT TRUE
    )
  `);

  // Products table
  await run(`
    CREATE TABLE IF NOT EXISTS products (
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
    )
  `);

  // Sales table
  await run(`
    CREATE TABLE IF NOT EXISTS sales (
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
    )
  `);

  // Sale items table
  await run(`
    CREATE TABLE IF NOT EXISTS sale_items (
      id SERIAL PRIMARY KEY,
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
      id SERIAL PRIMARY KEY,
      description VARCHAR(255) NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      category VARCHAR(50),
      expense_date DATE NOT NULL,
      recorded_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Payments table
  await run(`
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      sale_id INTEGER REFERENCES sales(id),
      amount DECIMAL(10, 2) NOT NULL,
      payment_method VARCHAR(20),
      payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      recorded_by INTEGER REFERENCES users(id)
    )
  `);

  // Create function to update updated_at timestamp
  await run(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  // Create trigger for products updated_at
  await run(`
    DROP TRIGGER IF EXISTS update_products_updated_at ON products;
    CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `);

  console.log('✓ Tables created successfully');
}

/**
 * Insert default users
 */
async function insertDefaultUsers() {
  console.log('Inserting default users...');
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
        `INSERT INTO users (username, email, password_hash, role, full_name, is_active) 
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (username) DO NOTHING`,
        [user.username, user.email, passwordHash, user.role, user.full_name, true]
      );
      console.log(`✓ Created user: ${user.username}`);
    } catch (error) {
      if (error.code === '23505') {
        console.log(`- User ${user.username} already exists, skipping...`);
      } else {
        console.error(`✗ Error creating user ${user.username}:`, error.message);
      }
    }
  }
}

/**
 * Insert sample products
 */
async function insertSampleProducts() {
  console.log('Inserting sample products...');
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
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (sku) DO NOTHING`,
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
      console.log(`✓ Created product: ${product.name}`);
    } catch (error) {
      if (error.code === '23505') {
        console.log(`- Product ${product.sku} already exists, skipping...`);
      } else {
        console.error(`✗ Error creating product ${product.sku}:`, error.message);
      }
    }
  }
}

/**
 * Initialize database
 */
async function initDatabase() {
  try {
    console.log('Initializing Supabase database...');
    await createTables();
    await insertDefaultUsers();
    await insertSampleProducts();
    console.log('\n✓ Database initialization completed!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();

