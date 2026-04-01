import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as string;

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: 註冊新使用者
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *               name: { type: string }
 *     responses:
 *       201:
 *         description: 註冊成功
 *       400:
 *         description: 電子郵件已被使用
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      res.status(400).json({ error: '此電子郵件已被使用' });
      return;
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, 'user')
       RETURNING id, email, name, role, created_at`,
      [email, password_hash, name]
    );

    const user = result.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    res.status(201).json({
      message: '註冊成功',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: '註冊時發生錯誤' });
  }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 使用者登入
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: 登入成功
 *       401:
 *         description: 帳號或密碼錯誤
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await pool.query(
      'SELECT id, email, name, password_hash, role FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: '帳號或密碼錯誤' });
      return;
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      res.status(401).json({ error: '帳號或密碼錯誤' });
      return;
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    res.json({
      message: '登入成功',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '登入時發生錯誤' });
  }
};

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Google OAuth 登入（模擬）
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               name: { type: string }
 *               picture: { type: string }
 *     responses:
 *       200:
 *         description: Google 登入成功
 */
export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, picture } = req.body;

    // Check if user exists
    let user = await pool.query(
      'SELECT id, email, name, avatar_url FROM users WHERE email = $1',
      [email]
    );

    if (user.rows.length === 0) {
      // Create new user for Google auth
      const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);
      const result = await pool.query(
        `INSERT INTO users (email, password_hash, name, avatar_url)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, name, avatar_url`,
        [email, randomPassword, name, picture]
      );
      user = result;
    }

    const userData = user.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { id: userData.id, email: userData.email, name: userData.name, role: userData.role || 'user' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    res.json({
      message: 'Google 登入成功',
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role || 'user',
        avatar: userData.avatar_url
      },
      token
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Google 登入時發生錯誤' });
  }
};
