// Helper script to convert SQLite queries to PostgreSQL
// This is a reference - actual conversion needs to be done manually in each file

/**
 * Convert SQLite placeholder (?) to PostgreSQL placeholder ($1, $2, etc.)
 * This is a helper function for manual conversion
 */
function convertPlaceholders(sql, params) {
  let paramIndex = 1;
  const convertedSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
  return { sql: convertedSql, params };
}

// Example conversions:
// SQLite: 'SELECT * FROM users WHERE id = ?' → PostgreSQL: 'SELECT * FROM users WHERE id = $1'
// SQLite: 'INSERT INTO users (name, email) VALUES (?, ?)' → PostgreSQL: 'INSERT INTO users (name, email) VALUES ($1, $2)'

export { convertPlaceholders };

