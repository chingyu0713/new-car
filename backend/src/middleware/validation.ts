import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: '輸入驗證失敗',
          details: error.errors
        });
      } else {
        res.status(500).json({ error: '驗證時發生錯誤' });
      }
    }
  };
};

// Common validation schemas
export const schemas = {
  register: z.object({
    email: z.string().email('無效的電子郵件格式'),
    password: z.string()
      .min(8, '密碼至少需要 8 個字元')
      .regex(/[A-Za-z]/, '密碼需包含英文字母')
      .regex(/[0-9]/, '密碼需包含數字'),
    name: z.string().min(1, '姓名不能為空').max(50, '姓名過長')
  }),

  login: z.object({
    email: z.string().email('無效的電子郵件格式'),
    password: z.string().min(1, '密碼不能為空')
  }),

  createCar: z.object({
    brand: z.string(),
    model: z.string(),
    year: z.number().int().min(1900).max(2100),
    type: z.string(),
    price: z.number().int().positive(),
    description: z.string().optional(),
    engine: z.string(),
    horsepower: z.number().int().positive(),
    torque: z.number().int().positive(),
    acceleration: z.number().positive(),
    topSpeed: z.number().int().positive(),
    fuelEfficiency: z.number().positive(),
    transmission: z.string(),
    drivetrain: z.string(),
    seatingCapacity: z.number().int().positive(),
    cargoSpace: z.number().int().positive(),
    length: z.number().int().positive(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    weight: z.number().int().positive(),
    features: z.array(z.string())
  }),

};
