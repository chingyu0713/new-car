# AWS RDS PostgreSQL 建立步驟（超詳細版）

## 步驟 1️⃣：註冊/登入 AWS 帳號

### 如果還沒有 AWS 帳號：

1. 打開瀏覽器，前往：https://aws.amazon.com/
2. 點選右上角「Create an AWS Account」（建立 AWS 帳戶）
3. 填寫資料：
   - Email 地址
   - 密碼
   - AWS 帳戶名稱
4. 選擇帳戶類型：**個人**
5. 填寫聯絡資訊（地址、電話等）
6. **輸入信用卡資訊**（必要，但我們會使用免費方案）
   - ⚠️ 不用擔心，如果在免費額度內不會扣款
7. 驗證手機號碼（會收到驗證碼）
8. 選擇支援方案：選擇「基本支援 - 免費」
9. 註冊完成！

### 如果已經有 AWS 帳號：

1. 前往：https://aws.amazon.com/
2. 點選右上角「Sign In to the Console」（登入控制台）
3. 選擇「Root user」（根使用者）
4. 輸入你的 Email
5. 輸入密碼
6. 登入成功！

---

## 步驟 2️⃣：進入 RDS 服務

登入後，你會看到 AWS Management Console（管理控制台）：

### 方法 1：使用搜尋（最快）

1. 在最上方的搜尋欄位輸入「RDS」
2. 點選搜尋結果中的「RDS」（圖示是一個圓柱形資料庫）
3. 進入 RDS Dashboard

### 方法 2：從服務列表

1. 點選左上角「Services」（服務）
2. 找到「Database」分類
3. 點選「RDS」

---

## 步驟 3️⃣：確認地區（重要！）

在進行任何操作前，先確認右上角的地區：

```
建議選擇：
- Asia Pacific (Tokyo) ap-northeast-1（日本東京，延遲較低）
- US East (N. Virginia) us-east-1（美國維吉尼亞，最便宜）
```

點選右上角地區名稱，從下拉選單選擇你要的地區。

⚠️ **重要**：之後部署 Elastic Beanstalk 也要選同一個地區！

---

## 步驟 4️⃣：建立資料庫

### 1. 點選「Create database」

在 RDS Dashboard 頁面，找到橘色按鈕「Create database」，點下去。

### 2. 選擇建立方法

```
○ Standard create（標準建立）← 選這個
○ Easy create（簡易建立）
```

選擇「Standard create」可以自訂更多設定。

### 3. 引擎選項（Engine options）

```
Engine type: PostgreSQL ← 選這個

Engine Version: PostgreSQL 15.5-R2 或更新版本（選擇最新的穩定版）
```

### 4. 模板（Templates）

如果你是第一次使用 AWS（12 個月內）：

```
○ Production（生產環境）
○ Dev/Test（開發/測試）
⦿ Free tier（免費方案）← 選這個！
```

如果超過 12 個月或不符合免費資格：

```
⦿ Dev/Test ← 選這個（最便宜）
```

### 5. 設定（Settings）

```
DB instance identifier（資料庫識別名稱）:
└─ autospec-db（可以自己取名，英文小寫加連字號）

Credentials Settings（憑證設定）:

Master username（主要使用者名稱）:
└─ postgres（保持預設即可）

☑ Auto generate a password（自動產生密碼）← 取消勾選
⦿ Self managed（自行管理）← 選這個

Master password（主要密碼）:
└─ 輸入一個強密碼，例如：AutoSpec2024!@#$
└─ 記下來！！！之後會用到

Confirm password（確認密碼）:
└─ 再輸入一次
```

⚠️ **重要**：密碼請記在安全的地方（筆記本或密碼管理器）

### 6. 實例配置（Instance configuration）

如果選了 Free tier 模板：

```
DB instance class（資料庫實例類型）:
⦿ db.t3.micro（已自動選擇，免費方案）
```

如果選了 Dev/Test 模板：

```
DB instance class:
⦿ Burstable classes (includes t classes)
└─ db.t3.micro 或 db.t4g.micro（最便宜，約 $15/月）
```

### 7. 儲存空間（Storage）

```
Storage type（儲存類型）:
⦿ General Purpose SSD (gp3)（已預選）

Allocated storage（配置儲存空間）:
└─ 20 GiB（保持預設，足夠用）

☑ Enable storage autoscaling（啟用自動擴展）← 可勾選
└─ Maximum storage threshold: 1000 GiB
```

### 8. 連線（Connectivity）

```
Compute resource（運算資源）:
⦿ Don't connect to an EC2 compute resource（不連接到 EC2）← 選這個

Virtual private cloud (VPC):
└─ Default VPC（保持預設）

DB subnet group:
└─ default（保持預設）

Public access（公開存取）:
⚠️ ⦿ Yes（是）← 重要！選 Yes 才能從外部連線

VPC security group:
⦿ Create new（建立新的）← 選這個
└─ New VPC security group name: autospec-db-sg

Availability Zone（可用區域）:
⦿ No preference（無偏好）← 保持預設
```

⚠️ **Public access 一定要選 Yes**，否則無法從本地電腦或 Elastic Beanstalk 連線！

### 9. 資料庫驗證（Database authentication）

```
⦿ Password authentication（密碼驗證）← 保持預設
```

### 10. 監控（Monitoring）

```
☑ Enable Enhanced monitoring（啟用增強監控）← 可取消勾選（省錢）
```

### 11. 其他設定（Additional configuration）- 展開此區塊

點選「Additional configuration」展開：

```
Initial database name（初始資料庫名稱）:
└─ postgres（保持預設，或留空）

⚠️ 注意：我們之後會自己建立 autospec_db 資料庫

DB parameter group: default.postgres15
DB option group: default:postgres-15

Backup（備份）:
☑ Enable automated backups（啟用自動備份）
└─ Backup retention period: 7 days

Encryption（加密）:
☑ Enable encryption（啟用加密）← 保持勾選

Log exports（日誌匯出）:
☐ PostgreSQL log（可不勾選）

Maintenance（維護）:
☑ Enable auto minor version upgrade（啟用自動小版本升級）

Deletion protection（刪除保護）:
☐ Enable deletion protection（建議測試環境不勾選）
```

### 12. 估算月費用

右側會顯示「Monthly estimated cost」：

```
Free tier: $0.00/month（前 12 個月）
或
Dev/Test: ~$15-20/month
```

### 13. 建立資料庫！

檢查所有設定後，點選最下方橘色按鈕：

```
🟧 Create database（建立資料庫）
```

---

## 步驟 5️⃣：等待建立完成

### 1. 進度顯示

你會看到：

```
✓ Successfully created database autospec-db
```

然後會跳轉到資料庫清單頁面。

### 2. 檢查狀態

找到你的資料庫「autospec-db」，狀態會顯示：

```
Status: Creating...（建立中）
```

大約等待 **3-5 分鐘**，狀態會變成：

```
Status: Available（可用）✓
```

---

## 步驟 6️⃣：取得連線資訊

### 1. 點選資料庫名稱

在資料庫列表中，點選「autospec-db」進入詳細資訊頁面。

### 2. 找到 Endpoint

在「Connectivity & security」（連線與安全）分頁下，找到：

```
Endpoint:
autospec-db.xxxxxxxxxxxxx.ap-northeast-1.rds.amazonaws.com

Port:
5432
```

**複製這個 Endpoint**，等等會用到！

### 3. 組合連線字串

格式：

```
postgresql://使用者名稱:密碼@Endpoint:Port/資料庫名稱
```

範例：

```
postgresql://postgres:AutoSpec2024!@#$@autospec-db.xxxxxxxxxxxxx.ap-northeast-1.rds.amazonaws.com:5432/postgres
```

⚠️ **注意**：如果密碼包含特殊字元（如 @, #, $），需要用 URL 編碼：
- @ → %40
- # → %23
- $ → %24

---

## 步驟 7️⃣：設定安全群組（允許連線）

### 1. 回到 RDS 資料庫詳細頁面

### 2. 點選「VPC security groups」

在「Connectivity & security」區塊下，點選安全群組名稱（例如：autospec-db-sg）

### 3. 編輯 Inbound rules

1. 切換到「Inbound rules」（輸入規則）分頁
2. 點選「Edit inbound rules」（編輯輸入規則）
3. 點選「Add rule」（新增規則）
4. 填寫：
   ```
   Type: PostgreSQL
   Protocol: TCP
   Port range: 5432
   Source: Anywhere-IPv4 (0.0.0.0/0)
   Description: Allow PostgreSQL from anywhere
   ```
5. 點選「Save rules」（儲存規則）

⚠️ **安全提醒**：0.0.0.0/0 表示允許任何 IP 連線。正式環境建議改為只允許你的 IP 或 Elastic Beanstalk 的安全群組。

---

## 步驟 8️⃣：測試連線

### 從你的電腦測試：

```bash
# 安裝 PostgreSQL client（如果還沒有）
brew install postgresql

# 連線測試（替換成你的資訊）
psql "postgresql://postgres:你的密碼@你的Endpoint:5432/postgres"

# 如果成功，你會看到：
postgres=>

# 列出資料庫
\l

# 離開
\q
```

成功！🎉

---

## 常見問題

### Q: 顯示「could not connect to server」

A: 檢查：
1. 安全群組是否允許 5432 port
2. Public access 是否設為 Yes
3. Endpoint 是否正確
4. 密碼是否正確

### Q: 忘記密碼怎麼辦？

A:
1. 回到 RDS 資料庫頁面
2. 點選資料庫名稱
3. 點選「Modify」（修改）
4. 在「Settings」區塊重設密碼
5. 點選「Continue」→「Apply immediately」→「Modify DB instance」

### Q: 怎麼刪除資料庫？

A:
1. 選取資料庫
2. 點選「Actions」→「Delete」
3. 取消勾選「Create final snapshot」
4. 勾選「I acknowledge...」
5. 輸入「delete me」確認
6. 點選「Delete」

---

## 下一步

資料庫建立好後，請繼續參考 `DEPLOY.md` 的「第二步：初始化資料庫」。
