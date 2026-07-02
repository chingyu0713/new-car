# AutoSpec — 智慧汽車資料庫

一個從真實政府資料源建置的汽車查詢平台。使用者可以查詢、篩選、比較在台灣有販售的車款，並將常用車款加入收藏或比較清單。

## 為什麼做這個專案

市面上多數車輛規格網站的資料是靜態、手動維護的，資料量少且容易過時。這個專案想解決的問題是：**能不能用一套自動化的資料管線，直接從官方資料源抓取、清洗、在地化，再穩定提供給前端查詢？**

因此後端的核心不是「CRUD 表單」，而是一個背景資料擷取任務（seed job）：向美國能源部 [FuelEconomy.gov](https://www.fueleconomy.gov/) 的公開 API 查詢車款清單，逐一比對車型與年份，將原始英文規格（燃料類型、驅動方式、車輛級距等）轉換成中文，並寫入 PostgreSQL 供前端查詢使用。

## 功能

- **車款查詢與篩選**：依品牌、車輛級距、年份、燃料類型、驅動方式篩選，支援分頁與排序
- **真實資料擷取管線**：後端背景任務向 FuelEconomy.gov 抓取指定品牌／車型／年份組合，非同步執行並回報進度（`/api/cars/seed/status`）
- **資料在地化**：燃料類型、驅動方式、車輛級距、變速箱、品牌名稱皆有對照表轉換為繁體中文
- **單位轉換**：油耗（mpg → km/L、L/100km）、里程（miles → km）、CO2 排放量，讓習慣公制的使用者容易理解
- **收藏清單 / 比較清單**：登入後可收藏車款，或建立多組比較清單、加入 / 移除車款
- **會員系統**：Email + 密碼註冊登入（bcrypt 雜湊 + JWT），並保留 Google 登入的串接骨架
- **後台管理**：管理員可查看儀表板統計、管理車款與使用者、上傳／排序／刪除車款圖片（Multer 處理上傳）
- **API 文件**：Swagger / OpenAPI 3.0，啟動後於 `/api-docs` 查看

> 目前**沒有使用 AI 相關功能**。專案初始化時 AI Studio 有生成一支 `services/geminiService.ts`（自然語言搜尋），但整個前端沒有任何地方 import 或呼叫它，是完全沒串接的死碼。如果要讓 repo 更乾淨，可以直接刪除這支檔案與 `@google/genai` 依賴。

## 技術架構

| 層級 | 技術 |
|---|---|
| 前端 | React 19、TypeScript、Vite、React Router |
| 後端 | Node.js、Express、TypeScript |
| 資料庫 | PostgreSQL |
| 認證 | JWT（bcrypt 雜湊密碼） |
| 檔案上傳 | Multer |
| API 文件 | Swagger / OpenAPI 3.0 |
| 容器化 | Docker、Docker Compose |
| 部署 | 前端 Vercel／Nginx；後端 AWS Elastic Beanstalk + RDS（PostgreSQL） |

## 專案結構

```
new-car/
├─ App.tsx, pages/, components/, contexts/   # 前端（Vite + React）
├─ services/                                 # API client、車輛資料 service
└─ backend/
   ├─ src/controllers/                       # auth / cars / favorites / comparisons / admin / images
   ├─ src/routes/index.ts                    # 路由定義
   ├─ src/config/                            # DB 連線、migration、Swagger 設定
   └─ src/migrations/                        # 資料表結構演進
```

## 本地啟動

最簡單的方式是用 Docker Compose 一次啟動資料庫、後端、前端、pgAdmin：

```bash
docker compose up
```

- 前端：http://localhost:3000
- 後端 API：http://localhost:5001
- Swagger 文件：http://localhost:5001/api-docs
- pgAdmin：http://localhost:5050

### 手動啟動（不用 Docker）

```bash
# 後端
cd backend
cp .env.example .env   # 填入 DATABASE_URL、JWT_SECRET
npm install
npm run db:migrate
npm run dev             # http://localhost:5001

# 前端（另開一個終端機）
npm install
npm run dev              # http://localhost:5173
```

抓取真實車輛資料（首次需要跑一次，會在背景執行）：

```bash
curl http://localhost:5001/api/cars/seed
curl http://localhost:5001/api/cars/seed/status   # 查看進度
```

## 已知限制

- Google 登入目前是模擬流程（拿假的使用者資料呼叫後端），還沒接上真正的 Google OAuth
- 車款資料完全依賴 FuelEconomy.gov 的資料涵蓋範圍，部分冷門車型/年份可能查不到
