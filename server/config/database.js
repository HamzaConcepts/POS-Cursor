import pg from 'pg';

const { Pool } = pg;

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Execute a query and return results
 * @param {string} queryText - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>}
 */
export async function query(queryText, params = []) {
  try {
    const result = await pool.query(queryText, params);
    return result.rows;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

/**
 * Execute a query and return a single row
 * @param {string} queryText - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object|null>}
 */
export async function queryOne(queryText, params = []) {
  try {
    const result = await pool.query(queryText, params);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

/**
 * Execute an INSERT/UPDATE/DELETE query
 * @param {string} queryText - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<{lastID: number, changes: number}>}
 */
export async function run(queryText, params = []) {
  try {
    const result = await pool.query(queryText, params);
    // PostgreSQL returns the last inserted ID differently
    // For INSERT, we need to use RETURNING id
    const lastID = result.rows[0]?.id || null;
    return {
      lastID,
      changes: result.rowCount || 0
    };
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

/**
 * Close the database connection pool
 */
export async function closePool() {
  await pool.end();
}

export default pool;
