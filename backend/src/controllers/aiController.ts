import { Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * @swagger
 * /api/ai/search:
 *   post:
 *     summary: AI 智能搜尋汽車
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [query]
 *             properties:
 *               query: { type: string, example: "省油的Toyota SUV，預算100萬內" }
 *     responses:
 *       200:
 *         description: AI 搜尋結果
 */
export const aiSearch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { query } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({ error: 'Gemini API Key 未設定' });
      return;
    }

    // Get all available cars
    const carsResult = await pool.query('SELECT * FROM cars ORDER BY created_at DESC');
    const allCars = carsResult.rows;

    // Prepare car data for AI
    const carSummaries = allCars.map(car => ({
      id: car.id,
      brand: car.brand,
      model: car.model,
      type: car.type,
      price: car.price,
      horsepower: car.horsepower,
      fuelEfficiency: car.fuel_efficiency,
      description: car.description
    }));

    // Create AI prompt
    const prompt = `你是一位專業的汽車顧問。使用者查詢：「${query}」

可用的汽車列表：
${JSON.stringify(carSummaries, null, 2)}

請根據使用者的需求，推薦最合適的汽車。回應必須使用以下 JSON 格式：

{
  "reasoning": "推薦理由的詳細說明（繁體中文）",
  "recommendedCarIds": [推薦的汽車ID陣列，最多3台],
  "filters": {
    "brand": "品牌名稱（如果使用者有指定）",
    "type": "車型（如果使用者有指定）",
    "maxPrice": 最高價格數字（如果使用者有預算限制）,
    "minFuelEfficiency": 最低油耗（如果使用者重視省油）
  }
}

請只回傳 JSON，不要包含其他文字。`;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse AI response
    let aiResponse;
    try {
      // Remove markdown code blocks if present
      const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      aiResponse = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      res.status(500).json({ error: 'AI 回應格式錯誤' });
      return;
    }

    // Get recommended cars
    const recommendedCars = allCars
      .filter(car => aiResponse.recommendedCarIds.includes(car.id))
      .map(car => formatCarResponse(car));

    res.json({
      query,
      reasoning: aiResponse.reasoning,
      filters: aiResponse.filters,
      recommendations: recommendedCars,
      totalMatches: recommendedCars.length
    });

  } catch (error) {
    console.error('AI search error:', error);
    res.status(500).json({ error: 'AI 搜尋時發生錯誤' });
  }
};

// Helper function to format car response (same as in carController)
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
    features: typeof row.features === 'string' ? JSON.parse(row.features) : row.features,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
