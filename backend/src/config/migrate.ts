import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';
import pool from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrate() {
  try {
    console.log('🔄 Running database migrations...');

    // Read and execute schema.sql (FuelEconomy.gov schema)
    const schemaSQL = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
    await pool.query(schemaSQL);

    console.log('✅ Database schema created successfully');

    // Check current car count
    const { rows } = await pool.query('SELECT COUNT(*) FROM cars');
    const carCount = parseInt(rows[0].count);

    if (carCount === 0) {
      console.log('ℹ️  No cars in database. Use one of the following to populate data:');
      console.log('   - GET /api/cars/seed  (fetches from FuelEconomy.gov, recommended)');
      console.log('   - npm run db:seed     (seeds from local script)');
    } else {
      console.log(`ℹ️  Database already has ${carCount} cars`);
    }

    // Seed default admin account from environment variables
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@autospec.dev';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const { rows: adminRows } = await pool.query('SELECT id FROM users WHERE role = $1', ['admin']);
    if (adminRows.length === 0) {
      const hash = await bcrypt.hash(adminPassword, 12);
      await pool.query(
        `INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4)`,
        [adminEmail, hash, 'Admin', 'admin']
      );
      console.log(`👤 Admin account created (${adminEmail})`);
    } else {
      console.log('ℹ️  Admin account already exists');
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
