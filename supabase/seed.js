// Seed script to insert default users with properly hashed passwords
// Run this with: node supabase/seed.js
// Make sure to set DATABASE_URL environment variable

import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function seedDatabase() {
  try {
    console.log('Seeding database...');

    // Hash passwords
    const managerHash = await bcrypt.hash('Manager@123', 10);
    const adminHash = await bcrypt.hash('Admin@123', 10);
    const cashierHash = await bcrypt.hash('Cashier@123', 10);

    // Insert users
    const users = [
      {
        username: 'manager',
        email: 'manager@pos.com',
        password_hash: managerHash,
        role: 'Manager',
        full_name: 'Manager User'
      },
      {
        username: 'admin',
        email: 'admin@pos.com',
        password_hash: adminHash,
        role: 'Admin',
        full_name: 'Admin User'
      },
      {
        username: 'cashier',
        email: 'cashier@pos.com',
        password_hash: cashierHash,
        role: 'Cashier',
        full_name: 'Cashier User'
      }
    ];

    for (const user of users) {
      try {
        await pool.query(
          `INSERT INTO users (username, email, password_hash, role, full_name, is_active)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (username) DO NOTHING`,
          [user.username, user.email, user.password_hash, user.role, user.full_name, true]
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

    // Insert sample products
    const products = [
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

    for (const product of products) {
      try {
        await pool.query(
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

    console.log('\n✓ Database seeding completed!');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding database:', error);
    await pool.end();
    process.exit(1);
  }
}

seedDatabase();

