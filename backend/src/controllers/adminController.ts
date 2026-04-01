import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import pool from '../config/database.js';

// ── GET /api/admin/cars — list all cars with pagination ───────────────────
export const listCars = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page  = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const offset = (page - 1) * limit;
    const search = req.query.search as string;

    let where = '';
    const params: any[] = [];
    if (search) {
      where = 'WHERE make ILIKE $1 OR model ILIKE $1 OR make_zh ILIKE $1';
      params.push(`%${search}%`);
    }

    const countRes = await pool.query(`SELECT COUNT(*) FROM cars ${where}`, params);
    const total = parseInt(countRes.rows[0].count);

    const p = params.length + 1;
    const dataRes = await pool.query(
      `SELECT * FROM cars ${where} ORDER BY id ASC LIMIT $${p} OFFSET $${p + 1}`,
      [...params, limit, offset]
    );

    res.json({
      cars: dataRes.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('admin listCars error:', err);
    res.status(500).json({ error: '取得車款列表失敗' });
  }
};

// ── GET /api/admin/cars/:id ───────────────────────────────────────────────
export const getCar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM cars WHERE id = $1', [req.params.id]);
    if (!result.rows.length) { res.status(404).json({ error: '找不到該車款' }); return; }
    res.json({ car: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: '取得車款失敗' });
  }
};

// ── PUT /api/admin/cars/:id — update car fields ──────────────────────────
export const updateCar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const fields = req.body;

    // Only allow updating known columns
    const ALLOWED = [
      'make', 'model', 'year', 'trim_desc',
      'fuel_type', 'fuel_type_zh', 'drive', 'drive_zh',
      'transmission', 'transmission_zh',
      'cylinders', 'displacement', 'vehicle_class', 'vehicle_class_zh',
      'city_mpg', 'highway_mpg', 'combined_mpg',
      'city_mpg_e', 'highway_mpg_e', 'combined_mpg_e',
      'range_city', 'range_highway', 'co2', 'make_zh',
      'image_url', 'image_url_banner', 'image_url_detail',
    ];

    const sets: string[] = [];
    const vals: any[] = [];
    let p = 1;

    for (const [key, value] of Object.entries(fields)) {
      if (ALLOWED.includes(key)) {
        sets.push(`${key} = $${p++}`);
        vals.push(value === '' ? null : value);
      }
    }

    if (sets.length === 0) {
      res.status(400).json({ error: '沒有可更新的欄位' });
      return;
    }

    vals.push(id);
    const result = await pool.query(
      `UPDATE cars SET ${sets.join(', ')} WHERE id = $${p} RETURNING *`,
      vals
    );

    if (!result.rows.length) { res.status(404).json({ error: '找不到該車款' }); return; }
    res.json({ car: result.rows[0], message: '更新成功' });
  } catch (err) {
    console.error('admin updateCar error:', err);
    res.status(500).json({ error: '更新車款失敗' });
  }
};

// ── DELETE /api/admin/cars/:id ────────────────────────────────────────────
export const deleteCar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query('DELETE FROM cars WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) { res.status(404).json({ error: '找不到該車款' }); return; }
    res.json({ message: '車款已刪除' });
  } catch (err) {
    res.status(500).json({ error: '刪除車款失敗' });
  }
};

// ── GET /api/admin/users — list all users ─────────────────────────────────
export const listUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, role, created_at FROM users ORDER BY id ASC'
    );
    res.json({ users: result.rows });
  } catch (err) {
    res.status(500).json({ error: '取得使用者列表失敗' });
  }
};

// ── GET /api/admin/stats — dashboard stats ────────────────────────────────
export const dashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [carsRes, usersRes, makesRes] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM cars'),
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(DISTINCT make) FROM cars'),
    ]);
    res.json({
      totalCars:  parseInt(carsRes.rows[0].count),
      totalUsers: parseInt(usersRes.rows[0].count),
      totalMakes: parseInt(makesRes.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ error: '取得統計資料失敗' });
  }
};
