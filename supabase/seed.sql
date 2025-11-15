-- Seed data for Supabase
-- Run this AFTER schema.sql to insert default users and sample products
-- Note: Passwords will be hashed by the application, but you can also insert hashed passwords here

-- Insert default users (passwords are: Manager@123, Admin@123, Cashier@123)
-- These passwords are already hashed with bcrypt (10 rounds)
-- You can generate new hashes using: node -e "const bcrypt = require('bcrypt'); bcrypt.hash('password', 10).then(h => console.log(h));"

-- Manager user (password: Manager@123)
INSERT INTO users (username, email, password_hash, role, full_name, is_active)
VALUES (
    'manager',
    'manager@pos.com',
    '$2b$10$qE5Uvj0IASNWFTlLTmJu/.KAXH8GBY7yMbGE9huCzklb0XhApLigK', -- Replace with actual hash
    'Manager',
    'Manager User',
    TRUE
) ON CONFLICT (username) DO NOTHING;

-- Admin user (password: Admin@123)
INSERT INTO users (username, email, password_hash, role, full_name, is_active)
VALUES (
    'admin',
    'admin@pos.com',
    '$2b$10$X0RfZvg.uwsj9/uGcoL9reObRE/jgcZlbtOn8g2I9rGZ0wtCY2Zwy', -- Replace with actual hash
    'Admin',
    'Admin User',
    TRUE
) ON CONFLICT (username) DO NOTHING;

-- Cashier user (password: Cashier@123)
INSERT INTO users (username, email, password_hash, role, full_name, is_active)
VALUES (
    'cashier',
    'cashier@pos.com',
    '$2b$10$ua483PCfujgz0bs38NX5neerXE4as1oM/iaja/uIQOMD.xSZxh0we', -- Replace with actual hash
    'Cashier',
    'Cashier User',
    TRUE
) ON CONFLICT (username) DO NOTHING;

-- Sample Products
INSERT INTO products (name, sku, price, cost_price, stock_quantity, low_stock_threshold, category, description)
VALUES
    ('Product A', 'PRD-001', 29.99, 15.00, 100, 10, 'Category 1', 'Sample product A'),
    ('Product B', 'PRD-002', 49.99, 25.00, 5, 10, 'Category 1', 'Sample product B'),
    ('Product C', 'PRD-003', 19.99, 10.00, 50, 15, 'Category 2', 'Sample product C')
ON CONFLICT (sku) DO NOTHING;

-- Note: The password hashes above are placeholders. 
-- You should run the seed script from Node.js (see supabase/seed.js) to properly hash passwords,
-- OR generate hashes and replace the placeholders above.

