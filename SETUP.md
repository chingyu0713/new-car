# AutoSpec 完整專案啟動指南

這份文檔將引導您從零開始設定並運行完整的 AutoSpec 專案（前端 + 後端）。

## 架構概覽

```
new-car/
├── frontend/           # React 前端應用（現有的專案根目錄）
│   ├── App.tsx
│   ├── components/
│   ├── services/      # 現在連接後端 API
│   └── ...
└── backend/           # Node.js + Express 後端 API
    ├── src/
    │   ├── controllers/
    │   ├── routes/
    │   └── config/
    └── ...
```

## 技術棧總覽

### 前端
- React 19 + TypeScript
- Vite 6
- React Router DOM v7
- Recharts（圖表）
- Lucide React（圖示）

### 後端
- Node.js + Express
- TypeScript
- PostgreSQL
- JWT 認證
- Google Gemini API
- Swagger API 文檔

---

## 🚀 快速開始（15 分鐘設定）

### 步驟 1: 安裝 PostgreSQL

#### macOS (使用 Homebrew)
```bash
brew install postgresql@15
brew services start postgresql@15
```

#### Windows
下載安裝：https://www.postgresql.org/download/windows/

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 步驟 2: 建立資料庫

```bash
# 建立資料庫
createdb autospec_db

# 或使用 psql
psql postgres
CREATE DATABASE autospec_db;
\q
```

### 步驟 3: 設定後端

```bash
# 進入後端目錄
cd backend

# 安裝依賴（如果還沒執行過）
npm install

# 設定環境變數
# 編輯 .env 檔案，確認資料庫連線字串正確
# DATABASE_URL=postgresql://localhost:5432/autospec_db

# 執行資料庫遷移（建立資料表 + 匯入初始資料）
npm run db:migrate

# 啟動後端伺服器
npm run dev
```

後端會在 `http://localhost:5000` 啟動

### 步驟 4: 設定前端

開啟新的終端視窗：

```bash
# 回到專案根目錄
cd ..

# 安裝前端依賴（如果還沒執行過）
npm install

# 確認 .env.local 包含後端 API URL
# VITE_API_URL=http://localhost:5000/api

# 啟動前端開發伺服器
npm run dev
```

前端會在 `http://localhost:3000` 啟動

### 步驟 5: 訪問應用程式

- **前端應用**: http://localhost:3000
- **後端 API**: http://localhost:5000/api
- **Swagger 文檔**: http://localhost:5000/api-docs
- **健康檢查**: http://localhost:5000/health

---

## 📋 環境變數設定

### 前端 `.env.local`

```env
GEMINI_API_KEY=your-gemini-api-key-here
VITE_API_URL=http://localhost:5000/api
```

### 後端 `backend/.env`

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://localhost:5432/autospec_db

# JWT
JWT_SECRET=autospec-super-secret-jwt-key-2024
JWT_EXPIRES_IN=7d

# Gemini API（從前端複製或設定相同的 key）
GEMINI_API_KEY=your-gemini-api-key-here

# CORS
FRONTEND_URL=http://localhost:3000
```

**重要提示**：
- 前端的 `GEMINI_API_KEY` 現在不再使用（已改為後端代理）
- 後端的 `GEMINI_API_KEY` 需要設定為真實的 API key
- 從 https://makersuite.google.com/app/apikey 取得 Gemini API key

---

## 🔧 常用指令

### 後端

```bash
cd backend

# 開發模式（自動重啟）
npm run dev

# 建置 TypeScript
npm run build

# 生產環境執行
npm start

# 重新執行資料庫遷移
npm run db:migrate
```

### 前端

```bash
# 開發模式
npm run dev

# 建置生產版本
npm run build

# 預覽生產版本
npm run preview
```

---

## 🧪 測試 API

### 使用 Swagger UI（推薦）

訪問 http://localhost:5000/api-docs

### 使用 curl

#### 註冊使用者
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

#### 登入並取得 Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### 查詢汽車列表
```bash
curl http://localhost:5000/api/cars
```

#### AI 搜尋
```bash
curl -X POST http://localhost:5000/api/ai/search \
  -H "Content-Type: application/json" \
  -d '{"query": "省油的Toyota SUV，預算100萬內"}'
```

---

## 🎯 功能測試清單

### 前端功能
- [ ] 汽車列表顯示
- [ ] 篩選功能（品牌、車型、價格）
- [ ] AI 智能搜尋
- [ ] Google 登入（模擬）
- [ ] 汽車詳細頁面
- [ ] 汽車比較功能
- [ ] 收藏功能（需登入）

### 後端功能
- [ ] 使用者註冊 / 登入
- [ ] JWT 認證
- [ ] 汽車 CRUD API
- [ ] AI 搜尋代理
- [ ] 收藏管理
- [ ] 比較清單管理
- [ ] Swagger 文檔

---

## 🐛 常見問題排除

### 後端無法連接資料庫

**問題**：`Error: connect ECONNREFUSED`

**解決**：
```bash
# 確認 PostgreSQL 是否執行
pg_isready

# 如果沒有執行，啟動它
brew services start postgresql@15  # macOS
sudo systemctl start postgresql     # Linux

# 確認資料庫存在
psql -l | grep autospec_db
```

### 前端無法連接後端

**問題**：前端顯示 API 錯誤

**解決**：
1. 確認後端正在執行（http://localhost:5000/health）
2. 檢查 `.env.local` 的 `VITE_API_URL` 設定
3. 確認沒有 CORS 錯誤（檢查瀏覽器 Console）

### Gemini API 錯誤

**問題**：AI 搜尋功能無法使用

**解決**：
1. 確認後端 `.env` 的 `GEMINI_API_KEY` 已設定
2. 檢查 API key 是否有效：https://makersuite.google.com/app/apikey
3. 查看後端終端機的錯誤訊息

### 埠號衝突

**問題**：`EADDRINUSE: address already in use`

**解決**：
```bash
# 找出佔用埠號的程序
lsof -i :5000  # 後端
lsof -i :3000  # 前端

# 終止該程序
kill -9 <PID>

# 或修改埠號
# 後端：編輯 backend/.env 的 PORT
# 前端：編輯 vite.config.ts 的 server.port
```

---

## 📚 專案架構說明

### 資料流向

```
用戶 → 前端 React App
         ↓
     API Client (services/apiClient.ts)
         ↓
     後端 Express API (:5000)
         ↓
     PostgreSQL 資料庫
         ↓
     (選用) Gemini AI API
```

### API 認證流程

1. 使用者透過前端登入
2. 後端驗證並發放 JWT token
3. 前端儲存 token 到 localStorage
4. 後續請求在 header 帶上 `Authorization: Bearer <token>`
5. 後端中間件驗證 token

### AI 搜尋流程

1. 使用者輸入自然語言查詢
2. 前端呼叫 `POST /api/ai/search`
3. 後端使用 Gemini API 解析查詢
4. 後端根據解析結果查詢資料庫
5. 回傳推薦的汽車清單 + 推薦理由

---

## 🔐 安全性注意事項

### 開發環境
- JWT Secret 使用預設值（僅供開發）
- 資料庫沒有密碼保護（僅限本地）
- CORS 允許 localhost 連線

### 生產環境建議
- [ ] 更換強密碼的 `JWT_SECRET`
- [ ] 設定資料庫密碼
- [ ] 配置正確的 `FRONTEND_URL` CORS 白名單
- [ ] 使用 HTTPS
- [ ] 設定環境變數管理（如 Doppler、AWS Secrets Manager）
- [ ] 啟用 rate limiting
- [ ] 設定資料庫備份

---

## 🚢 部署建議

### 後端部署選項
- **Railway**: 支援 PostgreSQL 一鍵部署
- **Render**: 免費方案支援 PostgreSQL
- **Heroku**: 經典選擇
- **DigitalOcean App Platform**: 簡單易用

### 前端部署選項
- **Vercel**: 推薦，Vite 專案部署超簡單
- **Netlify**: 同樣優秀
- **Cloudflare Pages**: 速度快

### 環境變數設定
部署時記得在平台設定環境變數：
- 後端：`DATABASE_URL`, `JWT_SECRET`, `GEMINI_API_KEY`
- 前端：`VITE_API_URL`（指向後端 URL）

---

## 📞 支援

如果遇到問題，可以：

1. 檢查後端終端機的錯誤訊息
2. 檢查前端瀏覽器 Console
3. 查看 `backend/README.md` 詳細文檔
4. 參考 Swagger API 文檔：http://localhost:5000/api-docs

---

祝您使用愉快！🚗✨
