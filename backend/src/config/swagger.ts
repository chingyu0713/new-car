import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AutoSpec API',
      version: '1.0.0',
      description: 'AutoSpec 智慧汽車資料庫 API 文檔',
      contact: {
        name: 'AutoSpec Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: '開發環境',
      },
      {
        url: 'https://api.autospec.com',
        description: '正式環境',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: '在此輸入 JWT token (不需要加上 Bearer 前綴)',
        },
      },
      schemas: {
        Car: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            brand: { type: 'string', example: 'Toyota' },
            model: { type: 'string', example: 'Camry' },
            year: { type: 'integer', example: 2024 },
            type: { type: 'string', example: 'Sedan' },
            price: { type: 'integer', example: 1200000 },
            description: { type: 'string' },
            imageUrl: { type: 'string' },
            specs: {
              type: 'object',
              properties: {
                engine: { type: 'string' },
                horsepower: { type: 'integer' },
                torque: { type: 'integer' },
                acceleration: { type: 'number' },
                topSpeed: { type: 'integer' },
                fuelEfficiency: { type: 'number' },
                transmission: { type: 'string' },
                drivetrain: { type: 'string' },
                seatingCapacity: { type: 'integer' },
                cargoSpace: { type: 'integer' },
                dimensions: {
                  type: 'object',
                  properties: {
                    length: { type: 'integer' },
                    width: { type: 'integer' },
                    height: { type: 'integer' },
                    weight: { type: 'integer' },
                  },
                },
              },
            },
            features: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: '認證相關 API' },
      { name: 'Cars', description: '汽車資料 CRUD API' },
      { name: 'AI', description: 'AI 智能搜尋 API' },
      { name: 'Favorites', description: '收藏功能 API' },
      { name: 'Comparisons', description: '汽車比較功能 API' },
    ],
  },
  apis: ['./src/controllers/*.ts', './src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
