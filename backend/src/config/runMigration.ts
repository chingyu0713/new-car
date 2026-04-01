import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pool from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  try {
    console.log('🔄 Resetting database to latest schema...');

    // Drop all tables and recreate from schema.sql
    await pool.query(`
      DROP TABLE IF EXISTS comparison_items CASCADE;
      DROP TABLE IF EXISTS comparison_lists CASCADE;
      DROP TABLE IF EXISTS favorites CASCADE;
      DROP TABLE IF EXISTS cars CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);
    console.log('🗑️  Dropped existing tables');

    const schemaSQL = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
    await pool.query(schemaSQL);
    console.log('✅ Database reset to latest schema');
    console.log('ℹ️  Use GET /api/cars/seed or npm run db:seed to populate data');

    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
