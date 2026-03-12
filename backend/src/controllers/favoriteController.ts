import { Response } from 'express';
import pool from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: 取得使用者的收藏清單
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 收藏清單
 */
export const getFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: '未認證' });
      return;
    }

    const result = await pool.query(
      `SELECT c.* FROM cars c
       INNER JOIN favorites f ON c.id = f.car_id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );

    const favorites = result.rows.map(row => formatCarResponse(row));

    res.json({ favorites, total: favorites.length });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: '取得收藏清單時發生錯誤' });
  }
};

/**
 * @swagger
 * /api/favorites/{carId}:
 *   post:
 *     summary: 新增收藏
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: carId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       201:
 *         description: 收藏成功
 */
export const addFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: '未認證' });
      return;
    }

    const { carId } = req.params;

    // Check if car exists
    const carCheck = await pool.query('SELECT id FROM cars WHERE id = $1', [carId]);
    if (carCheck.rows.length === 0) {
      res.status(404).json({ error: '找不到該汽車' });
      return;
    }

    // Add to favorites (ignore if already exists due to UNIQUE constraint)
    await pool.query(
      `INSERT INTO favorites (user_id, car_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, car_id) DO NOTHING`,
      [req.user.id, carId]
    );

    res.status(201).json({ message: '已加入收藏' });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: '加入收藏時發生錯誤' });
  }
};

/**
 * @swagger
 * /api/favorites/{carId}:
 *   delete:
 *     summary: 移除收藏
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: carId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: 移除成功
 */
export const removeFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: '未認證' });
      return;
    }

    const { carId } = req.params;

    await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND car_id = $2',
      [req.user.id, carId]
    );

    res.json({ message: '已移除收藏' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: '移除收藏時發生錯誤' });
  }
};

// Helper function
function formatCarResponse(row: any) {
  return {
    id: row.id,
    brand: row.brand,
    model: row.model,
    year: row.year,
    type: row.type,
    price: row.price,
    description: row.description,
    imageUrl: row.image_url,
    specs: {
      engine: row.engine,
      horsepower: row.horsepower,
      torque: row.torque,
      acceleration: parseFloat(row.acceleration),
      topSpeed: row.top_speed,
      fuelEfficiency: parseFloat(row.fuel_efficiency),
      transmission: row.transmission,
      drivetrain: row.drivetrain,
      seatingCapacity: row.seating_capacity,
      cargoSpace: row.cargo_space,
      dimensions: {
        length: row.length,
        width: row.width,
        height: row.height,
        weight: row.weight
      }
    },
    features: typeof row.features === 'string' ? JSON.parse(row.features) : row.features
  };
}
