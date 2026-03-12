import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pool from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  try {
    console.log('🔄 Running migration 001_cars_new_schema...');
    const sql = readFileSync(join(__dirname, '../migrations/001_cars_new_schema.sql'), 'utf-8');
    await pool.query(sql);
    console.log('✅ Migration complete');
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
