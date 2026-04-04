# 南宫有栖 Blog

以古風視覺為主題的純靜態個人網站，包含首頁、題解、部落格、關於、友鏈五個主要頁面。

## 專案現況

- 部署型態：GitHub Pages 靜態網站
- 內容來源：Markdown + 對應的 posts.json 索引
- 前端技術：HTML + CSS + 原生 JavaScript
- Markdown 渲染：marked.js（CDN）

## 目錄結構（已整理）

```text
blog/
├─ CNAME
├─ index.html
├─ README.md
├─ images/
├─ styles/
│  ├─ style.css
│  └─ home.css
├─ js/
│  ├─ about.js
│  ├─ blog.js
│  ├─ burger.js
│  ├─ engagement-config.js
│  ├─ engagement.js
│  ├─ giscus-config.js
│  ├─ giscus.js
│  ├─ friend.js
│  ├─ home.js
│  ├─ petal.js
│  ├─ solution-page.js
│  ├─ transition.js
│  └─ legacy/
│     └─ script.js
├─ pages/
│  ├─ index.html
│  ├─ solution.html
│  ├─ APCS.html
│  ├─ Zerojudge.html
│  ├─ blog.html
│  ├─ about.html
│  └─ friend.html
└─ posts/
    ├─ about/
    │  └─ about.md
    ├─ blog/
    │  ├─ posts.json
    │  ├─ s1.md
    │  └─ s2.md
    ├─ friend/
    │  └─ friend_page.md
    └─ solution/
        ├─ posts.json
        ├─ APCS/
        │  ├─ posts.json
        │  └─ APCS_2026_03.md
        └─ Zerojudge/
            ├─ posts.json
            └─ c290.md
```

## 命名與路徑規範

- 友鏈頁面統一使用 friend 命名：
  - pages/friend.html
  - js/friend.js
  - posts/friend/friend_page.md
- 新增頁面/腳本時，檔名使用小寫英文與連字號（例如 example-page.html）。
- 正式使用的程式碼放在 js/ 根目錄；淘汰或備援腳本放在 js/legacy/。

## 各模組說明

### pages/

- index.html：首頁（pages 版本）
- solution.html：題解分類入口
- APCS.html：APCS 題解列表與內文頁
- Zerojudge.html：Zerojudge 題解列表與內文頁
- blog.html：部落格列表與內文頁（含搜尋與標籤）
- about.html：關於頁
- friend.html：友鏈頁

### js/

- solution-page.js：APCS/Zerojudge 共用題解列表與文章渲染
- blog.js：部落格列表、文章、搜尋、標籤
- about.js：about.md 載入與渲染
- friend.js：friend_page.md 載入與渲染
- engagement-config.js：瀏覽次數系統設定（GoatCounter）
- engagement.js：瀏覽次數共用邏輯（GoatCounter）
- giscus-config.js：giscus 留言設定
- giscus.js：giscus 留言掛載邏輯
- burger.js：行動版導覽選單
- transition.js：頁面轉場
- home.js：首頁互動
- petal.js：花瓣動畫
- legacy/script.js：舊版題解邏輯（目前未掛載）

### posts/

- posts/blog/posts.json：部落格文章索引
- posts/solution/APCS/posts.json：APCS 文章索引
- posts/solution/Zerojudge/posts.json：Zerojudge 文章索引
- posts/solution/posts.json：舊版索引（保留，不影響現行頁面）

## 文章資料格式

所有文章索引都使用同一格式：

```json
[
  {
     "slug": "example-post",
     "title": "文章標題",
     "date": "2026-04-04",
     "description": "文章摘要",
     "tags": ["tag1", "tag2"]
  }
]
```

欄位說明：

- slug：Markdown 檔名（不含 .md），必填
- title：標題，必填
- date：日期，格式 YYYY-MM-DD，必填
- description：摘要，選填
- tags：標籤陣列，選填

## 新增內容流程

### 新增一篇部落格文章

1. 在 posts/blog/ 新增 slug.md。
2. 在 posts/blog/posts.json 新增一筆對應資料。
3. 進入 pages/blog.html 確認列表與文章可正常顯示。

### 新增一篇題解（APCS 或 Zerojudge）

1. 在對應分類資料夾新增 Markdown：
    - posts/solution/APCS/
    - posts/solution/Zerojudge/
2. 更新該分類的 posts.json。
3. 進入對應頁面驗證：
    - pages/APCS.html
    - pages/Zerojudge.html

### 更新友鏈

1. 編輯 posts/friend/friend_page.md。
2. 進入 pages/friend.html 檢查卡片渲染與圖片路徑。

## 本地開發

可用任意靜態伺服器預覽，範例：

```bash
npx http-server . -p 8080 --cors -c-1
```

建議測試入口：

- http://localhost:8080/
- http://localhost:8080/pages/index.html

## 留言系統（giscus）

專案目前使用 giscus 作為留言系統（GitHub Discussions 驅動）。

### 1. 啟用 GitHub Discussions

1. 到你的 GitHub repo：Settings -> General。
2. 啟用 Discussions。

### 2. 在 giscus 產生設定

1. 打開 https://giscus.app/。
2. 選你的 repo 與分類（category）。
3. 取得這些值：
   - repo
   - repoId
   - category
   - categoryId

### 3. 填入本專案設定

編輯 js/giscus-config.js：

- 將 enabled 改成 true
- 填入 repo / repoId / category / categoryId

### 4. 目前掛載位置

- 部落格文章留言：js/blog.js
- 題解文章留言：js/solution-page.js
- 友鏈頁留言：js/friend.js

## 瀏覽次數系統（GoatCounter）

瀏覽次數改用 GoatCounter，不需要 Firebase。

### 1. 建立 GoatCounter 站點

1. 到 https://www.goatcounter.com/ 註冊登入。
2. 建立一個站點，取得你的 code（例如 myblog）。
3. 你的 endpoint 會是：
   - https://myblog.goatcounter.com/count

### 2. 填入設定

編輯 js/engagement-config.js：

- 將 enabled 改成 true
- 將 endpoint 改成你的 GoatCounter endpoint
- 保持 scriptSrc 為 https://gc.zgo.at/count.js

### 3. 計數方式

- 同一瀏覽器、同一頁面會依 viewThrottleMinutes（預設 30 分鐘）做節流
- 文章頁的「👁」欄位會顯示「已記錄」
- 詳細流量統計請在 GoatCounter dashboard 查看

### 4. 目前掛載位置

- 全站瀏覽次數記錄：js/burger.js 會載入 js/engagement.js
- 文章瀏覽數狀態顯示：js/blog.js、js/solution-page.js

## 維護建議

- 每次新增文章只改兩處：Markdown + 對應 posts.json。
- 若搬動檔案，務必同步更新 HTML 的 script/src 與 JS 的 fetch 路徑。
- legacy 資料夾中的檔案不應再被新頁面引用。
