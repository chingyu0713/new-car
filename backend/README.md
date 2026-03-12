# AutoSpec Backend API

AutoSpec 智慧汽車資料庫的後端 API 服務

## 技術棧

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **AI**: Google Gemini API
- **Documentation**: Swagger / OpenAPI 3.0

## 快速開始

### 1. 安裝依賴

```bash
cd backend
npm install
```

### 2. 設定環境變數

複製 `.env.example` 並建立 `.env` 檔案：

```bash
cp .env.example .env
```

編輯 `.env` 填入您的設定：

```env
# Server
PORT=5000
NODE_ENV=development

# Database (替換成您的 PostgreSQL 連線字串)
DATABASE_URL=postgresql://username:password@localhost:5432/autospec_db

# JWT Secret (請更換成強密碼)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Gemini API (從前端 .env.local 複製)
GEMINI_API_KEY=your-gemini-api-key-here

# CORS
FRONTEND_URL=http://localhost:3000
```

### 3. 設定 PostgreSQL 資料庫

確保 PostgreSQL 已安裝並執行，然後建立資料庫：

```bash
# macOS (使用 Homebrew)
brew install postgresql@15
brew services start postgresql@15

# 建立資料庫
createdb autospec_db

# 或使用 psql
psql postgres
CREATE DATABASE autospec_db;
\q
```

### 4. 執行資料庫遷移

```bash
npm run db:migrate
```

這會建立所有必要的資料表並匯入初始汽車資料。

### 5. 啟動開發伺服器

```bash
npm run dev
```

伺服器會在 `http://localhost:5000` 啟動

## API 文檔

啟動伺服器後，訪問 Swagger 文檔：

**http://localhost:5000/api-docs**

## API Endpoints

### 認證 (Auth)

- `POST /api/auth/register` - 註冊新使用者
- `POST /api/auth/login` - 使用者登入
- `POST /api/auth/google` - Google OAuth 登入

### 汽車資料 (Cars)

- `GET /api/cars` - 取得汽車列表（支援篩選）
- `GET /api/cars/:id` - 取得單一汽車詳細資料
- `POST /api/cars` - 新增汽車 (需認證)
- `PUT /api/cars/:id` - 更新汽車 (需認證)
- `DELETE /api/cars/:id` - 刪除汽車 (需認證)

### AI 搜尋 (AI)

- `POST /api/ai/search` - AI 智能搜尋汽車

### 收藏 (Favorites)

- `GET /api/favorites` - 取得收藏清單 (需認證)
- `POST /api/favorites/:carId` - 新增收藏 (需認證)
- `DELETE /api/favorites/:carId` - 移除收藏 (需認證)

### 比較 (Comparisons)

- `GET /api/comparisons` - 取得比較清單 (需認證)
- `POST /api/comparisons` - 建立比較清單 (需認證)
- `POST /api/comparisons/:id/cars/:carId` - 新增汽車到比較 (需認證)
- `DELETE /api/comparisons/:id/cars/:carId` - 從比較移除汽車 (需認證)
- `DELETE /api/comparisons/:id` - 刪除比較清單 (需認證)

## 認證方式

API 使用 JWT Bearer Token 認證。

### 取得 Token

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### 使用 Token

```bash
curl -X GET http://localhost:5000/api/favorites \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 開發指令

```bash
# 開發模式（自動重啟）
npm run dev

# 建置 TypeScript
npm run build

# 生產環境執行
npm start

# 資料庫遷移
npm run db:migrate
```

## 資料庫結構

### Tables

- **users** - 使用者帳號
- **cars** - 汽車資料
- **favorites** - 使用者收藏
- **comparison_lists** - 比較清單
- **comparison_items** - 比較項目

詳細 schema 請參考 `src/config/schema.sql`

## 專案結構

```
backend/
├── src/
│   ├── config/          # 配置檔案
│   │   ├── database.ts  # 資料庫連線
│   │   ├── schema.sql   # 資料庫 Schema
│   │   ├── migrate.ts   # 遷移腳本
│   │   └── swagger.ts   # Swagger 設定
│   ├── controllers/     # 控制器
│   │   ├── authController.ts
│   │   ├── carController.ts
│   │   ├── aiController.ts
│   │   ├── favoriteController.ts
│   │   └── comparisonController.ts
│   ├── middleware/      # 中間件
│   │   ├── auth.ts      # JWT 認證
│   │   └── validation.ts # 輸入驗證
│   ├── routes/          # 路由
│   │   └── index.ts
│   ├── types/           # TypeScript 型別
│   │   └── index.ts
│   └── server.ts        # 主伺服器檔案
├── .env.example         # 環境變數範例
├── package.json
├── tsconfig.json
└── README.md
```

## 注意事項

1. **安全性**: 生產環境請務必更換 `JWT_SECRET` 為強密碼
2. **API Key**: Gemini API Key 現在安全地保存在後端，不會暴露給前端
3. **CORS**: 預設只允許 `http://localhost:3000` 的請求，生產環境請修改 `FRONTEND_URL`
4. **資料庫**: 確保 PostgreSQL 連線字串正確，包含正確的使用者名稱、密碼和資料庫名稱

## 除錯

### 資料庫連線問題

```bash
# 檢查 PostgreSQL 是否執行
pg_isready

# 測試連線
psql $DATABASE_URL
```

### 查看日誌

開發模式會在終端機顯示所有請求和錯誤訊息。

## 授權

MIT License
