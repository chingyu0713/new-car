import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import pool from '../config/database.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, '../../uploads/cars');

// Ensure upload dir exists
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Multer config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const carId = (_req as AuthRequest).params.id;
    const dir = path.join(UPLOAD_DIR, carId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('只允許上傳圖片檔案'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ── POST /api/admin/cars/:id/images — upload images ──────────────────────
export const uploadImages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const carId = req.params.id;
    const slot = (req.body.slot || 'main') as string;

    if (!['main', 'banner', 'detail'].includes(slot)) {
      res.status(400).json({ error: 'slot 必須是 main, banner, 或 detail' });
      return;
    }

    // Check car exists
    const carCheck = await pool.query('SELECT id FROM cars WHERE id = $1', [carId]);
    if (!carCheck.rows.length) {
      res.status(404).json({ error: '找不到該車款' });
      return;
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ error: '沒有上傳任何檔案' });
      return;
    }

    // Get current max sort_order for this car+slot
    const maxRes = await pool.query(
      'SELECT COALESCE(MAX(sort_order), -1) as max_order FROM car_images WHERE car_id = $1 AND slot = $2',
      [carId, slot]
    );
    let sortOrder = parseInt(maxRes.rows[0].max_order) + 1;

    const inserted = [];
    for (const file of files) {
      const url = `/uploads/cars/${carId}/${file.filename}`;
      const result = await pool.query(
        'INSERT INTO car_images (car_id, slot, url, sort_order) VALUES ($1, $2, $3, $4) RETURNING *',
        [carId, slot, url, sortOrder++]
      );
      inserted.push(result.rows[0]);
    }

    // Update cars table: set the first image of each slot as the primary
    await syncCarImages(Number(carId));

    res.json({ images: inserted, message: `上傳了 ${inserted.length} 張圖片` });
  } catch (err) {
    console.error('uploadImages error:', err);
    res.status(500).json({ error: '上傳圖片失敗' });
  }
};

// ── GET /api/admin/cars/:id/images — list all images for a car ───────────
export const getImages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT * FROM car_images WHERE car_id = $1 ORDER BY slot, sort_order',
      [req.params.id]
    );
    res.json({ images: result.rows });
  } catch (err) {
    res.status(500).json({ error: '取得圖片失敗' });
  }
};

// ── DELETE /api/admin/cars/:id/images/:imageId — delete an image ─────────
export const deleteImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id: carId, imageId } = req.params;

    const result = await pool.query(
      'DELETE FROM car_images WHERE id = $1 AND car_id = $2 RETURNING *',
      [imageId, carId]
    );

    if (!result.rows.length) {
      res.status(404).json({ error: '找不到該圖片' });
      return;
    }

    // Delete file from disk
    const imgRow = result.rows[0];
    const filePath = path.join(__dirname, '../..', imgRow.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Sync primary images
    await syncCarImages(Number(carId));

    res.json({ message: '圖片已刪除' });
  } catch (err) {
    console.error('deleteImage error:', err);
    res.status(500).json({ error: '刪除圖片失敗' });
  }
};

// ── PUT /api/admin/cars/:id/images/:imageId/order — reorder ──────────────
export const reorderImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id: carId, imageId } = req.params;
    const { sort_order } = req.body;

    await pool.query(
      'UPDATE car_images SET sort_order = $1 WHERE id = $2 AND car_id = $3',
      [sort_order, imageId, carId]
    );

    await syncCarImages(Number(carId));
    res.json({ message: '排序已更新' });
  } catch (err) {
    res.status(500).json({ error: '更新排序失敗' });
  }
};

// Sync: set cars.image_url/banner/detail to the first image in each slot
async function syncCarImages(carId: number) {
  const result = await pool.query(
    `SELECT DISTINCT ON (slot) slot, url
     FROM car_images
     WHERE car_id = $1
     ORDER BY slot, sort_order ASC`,
    [carId]
  );

  const urls: Record<string, string | null> = { main: null, banner: null, detail: null };
  for (const row of result.rows) {
    urls[row.slot] = row.url;
  }

  await pool.query(
    `UPDATE cars SET
       image_url = COALESCE($1, image_url),
       image_url_banner = COALESCE($2, image_url_banner),
       image_url_detail = COALESCE($3, image_url_detail)
     WHERE id = $4`,
    [urls.main, urls.banner, urls.detail, carId]
  );
}
