import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: '未提供認證令牌' });
    return;
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
      name: string;
      role: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: '無效的認證令牌' });
  }
};

// Optional auth - doesn't fail if no token
export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: number;
        email: string;
        name: string;
        role: string;
      };
      req.user = decoded;
    } catch (error) {
      // Token invalid but continue anyway
    }
  }

  next();
};

// Admin-only middleware
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: '需要管理員權限' });
    return;
  }
  next();
};
