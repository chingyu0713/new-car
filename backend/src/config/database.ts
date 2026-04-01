import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Enable SSL for AWS RDS or production environments (disable with DB_SSL=false for Docker)
const isAWSRDS = process.env.DATABASE_URL?.includes('.rds.amazonaws.com');
const requireSSL = process.env.DB_SSL === 'false' ? false : (process.env.NODE_ENV === 'production' || isAWSRDS);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: requireSSL ? { rejectUnauthorized: false } : false,
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

export default pool;
