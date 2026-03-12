import { Response } from 'express';
import pool from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

/**
 * @swagger
 * /api/comparisons:
 *   get:
 *     summary: 取得使用者的比較清單
 *     tags: [Comparisons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 比較清單
 */
export const getComparisonLists = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: '未認證' });
      return;
    }

    const result = await pool.query(
      `SELECT cl.*,
        json_agg(
          json_build_object(
            'id', c.id,
            'brand', c.brand,
            'model', c.model,
            'price', c.price,
            'imageUrl', c.image_url
          )
        ) FILTER (WHERE c.id IS NOT NULL) as cars
       FROM comparison_lists cl
       LEFT JOIN comparison_items ci ON cl.id = ci.comparison_list_id
       LEFT JOIN cars c ON ci.car_id = c.id
       WHERE cl.user_id = $1
       GROUP BY cl.id
       ORDER BY cl.updated_at DESC`,
      [req.user.id]
    );

    res.json({ comparisonLists: result.rows });
  } catch (error) {
    console.error('Get comparison lists error:', error);
    res.status(500).json({ error: '取得比較清單時發生錯誤' });
  }
};

/**
 * @swagger
 * /api/comparisons:
 *   post:
 *     summary: 建立新的比較清單
 *     tags: [Comparisons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               carIds: { type: array, items: { type: integer } }
 *     responses:
 *       201:
 *         description: 比較清單建立成功
 */
export const createComparisonList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: '未認證' });
      return;
    }

    const { name = '我的比較', carIds = [] } = req.body;

    // Create comparison list
    const listResult = await pool.query(
      'INSERT INTO comparison_lists (user_id, name) VALUES ($1, $2) RETURNING *',
      [req.user.id, name]
    );

    const list = listResult.rows[0];

    // Add cars to comparison list
    if (carIds.length > 0) {
      const values = carIds.map((carId: number, i: number) =>
        `($1, $${i + 2})`
      ).join(', ');

      await pool.query(
        `INSERT INTO comparison_items (comparison_list_id, car_id) VALUES ${values}`,
        [list.id, ...carIds]
      );
    }

    res.status(201).json({ message: '比較清單建立成功', comparisonList: list });
  } catch (error) {
    console.error('Create comparison list error:', error);
    res.status(500).json({ error: '建立比較清單時發生錯誤' });
  }
};

/**
 * @swagger
 * /api/comparisons/{id}/cars/{carId}:
 *   post:
 *     summary: 新增汽車到比較清單
 *     tags: [Comparisons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: carId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       201:
 *         description: 新增成功
 */
export const addCarToComparison = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: '未認證' });
      return;
    }

    const { id, carId } = req.params;

    // Verify ownership
    const listCheck = await pool.query(
      'SELECT id FROM comparison_lists WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (listCheck.rows.length === 0) {
      res.status(404).json({ error: '找不到比較清單' });
      return;
    }

    // Check car limit (max 4 cars)
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM comparison_items WHERE comparison_list_id = $1',
      [id]
    );

    if (parseInt(countResult.rows[0].count) >= 4) {
      res.status(400).json({ error: '比較清單已達上限（最多4台）' });
      return;
    }

    // Add car
    await pool.query(
      `INSERT INTO comparison_items (comparison_list_id, car_id)
       VALUES ($1, $2)
       ON CONFLICT (comparison_list_id, car_id) DO NOTHING`,
      [id, carId]
    );

    res.status(201).json({ message: '已加入比較清單' });
  } catch (error) {
    console.error('Add car to comparison error:', error);
    res.status(500).json({ error: '新增到比較清單時發生錯誤' });
  }
};

/**
 * @swagger
 * /api/comparisons/{id}/cars/{carId}:
 *   delete:
 *     summary: 從比較清單移除汽車
 *     tags: [Comparisons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: carId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: 移除成功
 */
export const removeCarFromComparison = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: '未認證' });
      return;
    }

    const { id, carId } = req.params;

    await pool.query(
      `DELETE FROM comparison_items
       WHERE comparison_list_id = $1 AND car_id = $2
       AND comparison_list_id IN (
         SELECT id FROM comparison_lists WHERE user_id = $3
       )`,
      [id, carId, req.user.id]
    );

    res.json({ message: '已從比較清單移除' });
  } catch (error) {
    console.error('Remove car from comparison error:', error);
    res.status(500).json({ error: '移除時發生錯誤' });
  }
};

/**
 * @swagger
 * /api/comparisons/{id}:
 *   delete:
 *     summary: 刪除比較清單
 *     tags: [Comparisons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: 刪除成功
 */
export const deleteComparisonList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: '未認證' });
      return;
    }

    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM comparison_lists WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: '找不到比較清單' });
      return;
    }

    res.json({ message: '比較清單已刪除' });
  } catch (error) {
    console.error('Delete comparison list error:', error);
    res.status(500).json({ error: '刪除比較清單時發生錯誤' });
  }
};
