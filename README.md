# 南宫有栖 Blog

以古風視覺為主題的純靜態個人網站，主要包含首頁、題解、部落格、關於與友鏈頁面。

## 專案摘要

- 部署方式：GitHub Pages
- 技術堆疊：HTML + CSS + Vanilla JavaScript
- 內容來源：Markdown + `posts.json` 索引
- Markdown 解析：`marked.js`（CDN）
- 留言系統：giscus（可選）
- 瀏覽統計：GoatCounter（可選）

## 目前目錄

```text
blog/
├─ CNAME
├─ index.html
├─ README.md
├─ images/
├─ js/
│  ├─ about.js
│  ├─ blog.js
│  ├─ burger.js
│  ├─ engagement-config.js
│  ├─ engagement.js
│  ├─ friend.js
│  ├─ giscus-config.js
│  ├─ giscus.js
│  ├─ home.js
│  ├─ markdown-render.js
│  ├─ petal.js
│  ├─ solution-page.js
│  ├─ transition.js
│  └─ legacy/
│     └─ script.js
├─ pages/
│  ├─ about.html
│  ├─ APCS.html
│  ├─ blog.html
│  ├─ friend.html
│  ├─ index.html
│  ├─ solution.html
│  └─ Zerojudge.html
├─ posts/
│  ├─ about/
│  │  └─ about.md
│  ├─ blog/
│  │  ├─ posts.json
│  │  ├─ s1.md
│  │  └─ s2.md
│  ├─ friend/
│  │  └─ friend_page.md
│  └─ solution/
│     ├─ posts.json
│     ├─ APCS/
│     │  ├─ APCS_2026_03.md
│     │  └─ posts.json
│     └─ Zerojudge/
│        ├─ b964.md
│        ├─ b965.md
│        ├─ b966.md
│        ├─ b967.md
│        ├─ c290.md
│        ├─ e288.md
│        ├─ e313.md
│        ├─ f163.md
│        └─ posts.json
└─ styles/
  ├─ home.css
  └─ style.css
```

## 頁面與腳本對應

- `pages/blog.html` -> `js/blog.js`
- `pages/APCS.html`、`pages/Zerojudge.html` -> `js/solution-page.js`
- `pages/about.html` -> `js/about.js`
- `pages/friend.html` -> `js/friend.js`
- 全站共用互動：`js/burger.js`、`js/transition.js`、`js/markdown-render.js`

## 文章索引格式

`posts.json` 統一使用以下格式：

```json
[
  {
   "slug": "example-post",
   "title": "文章標題",
   "date": "2026-04-11",
   "description": "文章摘要",
   "tags": ["tag1", "tag2"]
  }
]
```

欄位說明：

- `slug`：Markdown 檔名（不含 `.md`），必填
- `title`：標題，必填
- `date`：日期，格式 `YYYY-MM-DD`，必填
- `description`：摘要，選填
- `tags`：標籤陣列，選填

## 內容維護流程

### 新增部落格文章

1. 在 `posts/blog/` 新增 `slug.md`。
2. 在 `posts/blog/posts.json` 加入同 `slug` 的索引資料。
3. 開啟 `pages/blog.html` 檢查列表、搜尋、標籤與內文頁。

### 新增題解文章

1. 在對應分類新增 Markdown：
  - `posts/solution/APCS/`
  - `posts/solution/Zerojudge/`
2. 更新該分類的 `posts.json`。
3. 分別檢查 `pages/APCS.html` 或 `pages/Zerojudge.html`。

### 更新關於或友鏈

- 關於：編輯 `posts/about/about.md`，到 `pages/about.html` 驗證。
- 友鏈：編輯 `posts/friend/friend_page.md`，到 `pages/friend.html` 驗證。

## 本地開發

使用任一靜態伺服器即可，範例：

```bash
npx http-server . -p 8080 --cors -c-1
```

或（Python）：

```bash
python -m http.server 8080
```

建議測試入口：

- `http://localhost:8080/`
- `http://localhost:8080/pages/index.html`

## giscus 設定（可選）

1. 在 GitHub Repository 啟用 Discussions。
2. 到 <https://giscus.app/> 取得 `repo`、`repoId`、`category`、`categoryId`。
3. 編輯 `js/giscus-config.js`：
  - `enabled: true`
  - 填入上述四個值

目前掛載位置：

- 部落格文章：`js/blog.js`
- 題解文章：`js/solution-page.js`
- 友鏈頁：`js/friend.js`

## GoatCounter 設定（可選）

1. 到 <https://www.goatcounter.com/> 建立站點。
2. 取得 endpoint（例如 `https://myblog.goatcounter.com/count`）。
3. 編輯 `js/engagement-config.js`：
  - `enabled: true`
  - `endpoint` 改為你的 endpoint

補充：

- `viewThrottleMinutes` 預設為 30 分鐘（同頁面節流）。
- 全站載入統計邏輯由 `js/burger.js` 引入 `js/engagement.js`。

## 維護建議

- 新增文章時，務必同時更新 Markdown 與對應 `posts.json`。
- 調整資料夾或檔名時，記得同步修正 HTML 的 script 路徑與 JS 的 `fetch` 路徑。
- `js/legacy/` 為舊版備份，避免在新頁面再引用。
