# AWS 部署指南

這是後端部署到 AWS 的步驟說明，使用 **AWS Elastic Beanstalk** + **PostgreSQL RDS**。

---

## 第一步：建立 PostgreSQL 資料庫

### 1. 進入 AWS Console

登入 AWS → 搜尋「RDS」

### 2. 建立資料庫

點選「Create database」，填寫以下資訊：

```
- Engine: PostgreSQL
- Version: PostgreSQL 15.x（最新穩定版）
- Templates: Free tier（測試用）或 Production（正式環境）
- DB instance identifier: autospec-db
- Master username: postgres
- Master password: 設定一個強密碼（記下來！）
- DB instance class: db.t3.micro（Free tier 可選）
- Storage: 20 GB
- Public access: Yes（暫時開啟，方便初始化）
- VPC security group: 新建一個，名稱如 autospec-db-sg
```

### 3. 設定安全群組

資料庫建立後，進入「Security Groups」：

```
- 找到剛建立的安全群組（autospec-db-sg）
- 編輯 Inbound rules
- 新增規則：Type: PostgreSQL, Port: 5432, Source: 0.0.0.0/0（暫時允許所有 IP）
- 儲存
```

⚠️ **注意**：正式環境應該限制只允許 Elastic Beanstalk 的安全群組連線

### 4. 取得資料庫連線字串

資料庫建立完成後，點進去查看 Endpoint：

```
範例：autospec-db.xxxxx.us-east-1.rds.amazonaws.com
```

完整連線字串：

```
postgresql://postgres:你的密碼@autospec-db.xxxxx.us-east-1.rds.amazonaws.com:5432/postgres
```

---

## 第二步：初始化資料庫

在你的電腦上連線到 RDS，執行 migration：

### 1. 安裝 PostgreSQL client（如果還沒有）

```bash
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql-client
```

### 2. 連線到 RDS 建立資料庫

```bash
# 使用你的 RDS endpoint 和密碼
psql "postgresql://postgres:你的密碼@你的RDS_ENDPOINT:5432/postgres"

# 在 psql 裡執行：
CREATE DATABASE autospec_db;
\q
```

### 3. 更新後端 .env 檔案

編輯 `backend/.env`，更新 DATABASE_URL：

```env
DATABASE_URL=postgresql://postgres:你的密碼@你的RDS_ENDPOINT:5432/autospec_db
```

### 4. 執行 migration 和 seed

```bash
cd backend
npm run db:migrate
npm run db:seed
```

如果成功，你會看到資料表建立完成，並匯入了初始車輛資料。

---

## 第三步：部署後端到 Elastic Beanstalk

### 1. 安裝 EB CLI

```bash
# macOS
brew install awsebcli

# Windows
pip install awsebcli

# 驗證安裝
eb --version
```

### 2. 初始化 Elastic Beanstalk

在 `backend/` 目錄下執行：

```bash
cd backend
eb init
```

回答問題：

```
- Select a default region: 選擇你 RDS 所在的區域（如 us-east-1）
- Enter Application Name: autospec-backend
- It appears you are using Node.js. Is this correct? (Y/n): Y
- Select a platform branch: Node.js 18 或 20（最新版本）
- Do you wish to continue with CodeCommit? (y/N): N
- Do you want to set up SSH for your instances? (Y/n): Y
```

### 3. 創建環境並部署

```bash
eb create autospec-production
```

這會：
- 建立 Elastic Beanstalk 環境
- 自動上傳並部署你的程式碼
- 配置 Load Balancer 和 Auto Scaling

等待約 5-10 分鐘。

### 4. 設定環境變數

部署完成後，設定環境變數：

```bash
eb setenv \
  NODE_ENV=production \
  PORT=8080 \
  DATABASE_URL="postgresql://postgres:你的密碼@你的RDS_ENDPOINT:5432/autospec_db" \
  JWT_SECRET="你的超級強密碼至少32字元" \
  JWT_EXPIRES_IN=7d \
  GEMINI_API_KEY="你的Gemini_API_KEY" \
  FRONTEND_URL="https://你的前端網址.vercel.app"
```

### 5. 重新部署

```bash
eb deploy
```

### 6. 檢查狀態

```bash
eb status
eb health
eb logs
```

### 7. 開啟網站

```bash
eb open
```

你會看到類似：`http://autospec-production.us-east-1.elasticbeanstalk.com`

測試 API：

```
http://你的EB網址/health
http://你的EB網址/api/cars
http://你的EB網址/api-docs
```

---

## 第四步：更新前端 API URL

前端需要連線到新的後端 URL。

### 1. 找到前端程式碼中的 API base URL

通常在 `services/` 或配置檔案中。

### 2. 更新為 AWS URL

將 `http://localhost:5000` 改成：

```javascript
const API_BASE_URL = import.meta.env.PROD
  ? 'https://你的EB網址.elasticbeanstalk.com/api'
  : 'http://localhost:5000/api';
```

### 3. 重新部署前端

如果是 Vercel：

```bash
git add .
git commit -m "Update API URL for production"
git push
```

Vercel 會自動重新部署。

---

## 常用指令

### 查看環境狀態

```bash
eb status
eb health
```

### 查看日誌

```bash
eb logs
```

### 重新部署

```bash
eb deploy
```

### SSH 連線到伺服器

```bash
eb ssh
```

### 刪除環境（省錢）

```bash
eb terminate autospec-production
```

---

## 成本估算（AWS Free Tier）

如果在 Free Tier 範圍內：

```
- RDS db.t3.micro: $0（前 12 個月免費 750 小時/月）
- Elastic Beanstalk: $0（環境本身免費）
- EC2 t3.micro: $0（前 12 個月免費 750 小時/月）
- 流量: 15 GB/月免費

總計：第一年基本免費
```

超過 Free Tier 後：

```
- RDS db.t3.micro: ~$15/月
- EC2 t3.micro: ~$7.5/月
- 其他費用: ~$5/月

總計：約 $25-30/月
```

---

## 問題排查

### 資料庫連線失敗

1. 檢查安全群組是否開放 5432 port
2. 檢查 DATABASE_URL 是否正確
3. 檢查 RDS 是否設定為 Public access

### 部署失敗

```bash
# 查看詳細錯誤
eb logs

# 檢查環境變數
eb printenv
```

### 應用無法啟動

1. 確認 `npm run build` 在本地可以成功
2. 確認 `dist/server.js` 有被建立
3. 檢查 `.ebextensions/nodecommand.config` 是否存在

---

## 需要協助？

如果遇到問題，提供以下資訊：

```bash
eb status
eb health
eb logs --all
```
