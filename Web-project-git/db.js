// db.js - Centralized database connection management
const { Pool } = require('pg');
require('dotenv').config();

// Create a connection pool instead of a single client
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Return error after 5s if connection not established
});

// Handle pool errors so they don't crash the application
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  // Don't throw an error here to prevent app from crashing
});

// Export a query function to use throughout the application
module.exports = {
  query: (text, params) => pool.query(text, params),
  
  // Function to fetch tours - example of how to use the pool
  getTours: async () => {
    try {
      const result = await pool.query('SELECT * FROM Tour');
      return result.rows;
    } catch (err) {
      console.error('Error fetching tours:', err);
      return [];
    }
  },
  
  // For one-off queries that need a dedicated connection
  getClient: () => {
    return pool.connect();
  }
};