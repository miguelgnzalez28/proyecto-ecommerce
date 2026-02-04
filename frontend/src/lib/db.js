// Database adapter to support both SQLite (local) and Vercel Postgres (production)
// This allows the app to work locally with SQLite and in production with Vercel Postgres

let dbAdapter = null;

// Check if we're in Vercel and have Postgres configured
const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;
const hasPostgres = process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;

if (isVercel && hasPostgres) {
  // Use Vercel Postgres in production
  try {
    const { sql } = require('@vercel/postgres');
    dbAdapter = {
      type: 'postgres',
      query: sql,
      // Helper methods for common operations
      async run(query, params = []) {
        return await sql.query(query, params);
      },
      async get(query, params = []) {
        const result = await sql.query(query, params);
        return result.rows[0] || null;
      },
      async all(query, params = []) {
        const result = await sql.query(query, params);
        return result.rows || [];
      },
    };
    console.log('Using Vercel Postgres database');
  } catch (error) {
    console.error('Error initializing Vercel Postgres:', error);
    console.log('Falling back to SQLite');
  }
}

// Fallback to SQLite for local development
if (!dbAdapter) {
  const sqlite3 = require('sqlite3').verbose();
  const dbPath = './emails.db';
  
  dbAdapter = {
    type: 'sqlite',
    db: new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening SQLite database:', err.message);
      } else {
        console.log('Using SQLite database at:', dbPath);
      }
    }),
    // Helper methods for SQLite
    run(query, params = []) {
      return new Promise((resolve, reject) => {
        this.db.run(query, params, function(err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID, changes: this.changes });
        });
      });
    },
    get(query, params = []) {
      return new Promise((resolve, reject) => {
        this.db.get(query, params, (err, row) => {
          if (err) reject(err);
          else resolve(row || null);
        });
      });
    },
    all(query, params = []) {
      return new Promise((resolve, reject) => {
        this.db.all(query, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    },
  };
}

module.exports = dbAdapter;
