import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import routes from './routes/index.js';
import pool from './config/database.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://0.0.0.0:3000', FRONTEND_URL],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', async (req, res) => {
  let dbStatus = 'unknown';
  let dbError = null;
  try {
    const result = await pool.query('SELECT 1 as test');
    dbStatus = result.rows[0]?.test === 1 ? 'connected' : 'error';
  } catch (err: any) {
    dbStatus = 'error';
    dbError = err.message;
  }
  res.json({
    status: dbStatus === 'connected' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: dbStatus,
      error: dbError,
      configured: !!process.env.DATABASE_URL,
      host: process.env.DATABASE_URL?.match(/@([^:\/]+)/)?.[1] || 'unknown'
    }
  });
});

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'AutoSpec API Documentation'
}));

// API routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: '找不到請求的路徑',
    path: req.path
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || '伺服器發生錯誤',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║   🚗 AutoSpec API Server                      ║
║                                               ║
║   Server:  http://localhost:${PORT}          ║
║   API:     http://localhost:${PORT}/api      ║
║   Docs:    http://localhost:${PORT}/api-docs ║
║   Health:  http://localhost:${PORT}/health   ║
║                                               ║
║   Database: ${process.env.DATABASE_URL ? '✅ Connected' : '❌ Not configured'}                      ║
║   Gemini:   ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Not configured'}                    ║
╚═══════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
});

export default app;
