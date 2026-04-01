# 南宮有栖 — 古風雅閣部落格

一個以古典中國風（古風）為設計主題的純靜態個人部落格。

---

## 專案結構

```
blog/
├── pages/              # 網頁頁面
│   ├── index.html      # 首頁（Home）
│   ├── solution.html   # 題解入口頁（顯示題解分類：APCS、Zerojudge等）
│   ├── APCS.html       # APCS 題解列表與文章閱讀頁
│   ├── Zerojudge.html  # Zerojudge 題解列表與文章閱讀頁
│   ├── blog.html       # 部落格首頁（支援標籤過濾與搜尋功能）
│   ├── files.html      # 文檔頁
│   ├── about.html      # 關於頁
│   ├── freind.html     # 友鏈頁
│   └── home.html       # 備用首頁
│
├── styles/
│   └── style.css       # 全站樣式表（古風設計系統）
│
├── js/
│   ├── solution-page.js# 分類題解頁核心邏輯（共用邏輯：讀取標籤動態載入分類）
│   ├── blog.js         # 部落格專屬核心邏輯（支援動態標籤雲與搜尋功能）
│   ├── script.js       # 舊題解頁邏輯（保留備用）
│   └── petal.js        # 花瓣飄落動畫效果
│
├── posts/
│   └── solution/       # 題解 Markdown 文章根目錄
│       ├── APCS/       # APCS 文章目錄
│       │   ├── posts.json
│       │   └── APCS_1.md
│       ├── Zerojudge/  # Zerojudge 文章目錄
│       │   ├── posts.json
│       │   └── a00.md
│       └── ...         # 其他舊的測試文章
│   └── blog/           # 部落格 Markdown 文章根目錄
│       ├── posts.json  # 部落格文章索引（標籤與標題等過濾來源）
│       └── s1.md       # 部落格範例文章
│
└── README.md           # 本檔案
```

---

## 各檔案功用說明

### 📄 HTML 頁面 (`pages/`)

| 檔案 | 功用 |
|------|------|
| `index.html` | 網站首頁，包含古風導航欄 |
| `solution.html` | 題解入口頁，提供以題庫分類（APCS、Zerojudge 等）的精美卡片導覽 |
| `APCS.html` | APCS 專屬題解頁，動態讀取 `/posts/solution/APCS` 內的文章列表與內容 |
| `Zerojudge.html` | Zerojudge 專屬題解頁，動態讀取 `/posts/solution/Zerojudge` 內的文章 |
| `blog.html` | 部落格專用頁面，雙欄式佈局，左側提供關鍵字搜尋與標籤雲（Tags Cloud），讀取 `/posts/blog` 內的內容 |
| `files.html` | 文檔歸檔頁（待開發） |
| `about.html` | 關於我頁面（待開發） |
| `freind.html` | 友情鏈接頁面（待開發） |
| `home.html` | 備用首頁（含 hello world 測試內容） |

### 🎨 樣式 (`styles/`)

| 檔案 | 功用 |
|------|------|
| `style.css` | 全站唯一的 CSS 檔案，包含：古風配色令牌（硃紅、古金、宣紙色等）、導航欄樣式、回紋裝飾、品牌印章效果、花瓣動畫、文章卡片列表樣式、文章內文排版、程式碼區塊、響應式設計、滾動條美化 |

### ⚙️ JavaScript (`js/`)

| 檔案 | 功用 |
|------|------|
| `solution-page.js` | 分類題解頁的核心邏輯。設計為共用模組，透過對應 HTML 中 `#solution-category` 的 `data-category` 參數，動態從不同子目錄載入文章列表或對應 Markdown 文章 |
| `blog.js` | 部落格頁面的核心腳本。動態載入左側「搜尋欄」與「標籤雲」，並負責文章關鍵字搜尋與關聯標籤的過濾功能 |
| `script.js` | 舊版統一文章列表邏輯（保留作其他用途） |
| `petal.js` | 花瓣飄落動畫。每 1.5 秒隨機產生 🌸🍂🍃 花瓣，從畫面頂部飄落，12 秒後自動移除 |

### 📝 文章 (`posts/`)

| 檔案 | 功用 |
|------|------|
| `*/posts.json` | 該分類（如 `solution/APCS/` 或 `blog/`）的**文章索引清單**。新增文章時必須編輯此檔案 |
| `*/*.md` | 對應板塊的 Markdown 文章內容 |

---

## 如何新增一篇題解文章

### 步驟 1：建立 Markdown 檔案

在你想新增題目的分類資料夾中（例如 `posts/solution/APCS/`）建立 `.md` 檔案，例如 `APCS_1.md`：

```markdown
# APCS 第一題

## 題目描述
...

## 解題思路
...
```

### 步驟 2：更新對應分類的 posts.json

在你要新增文章的分類資料夾中（例如 `posts/solution/APCS/posts.json` 或 `posts/blog/posts.json`）新增一筆記錄：

```json
[
    {
        "slug": "APCS_1",
        "title": "APCS 第一題",
        "date": "2026-04-01",
        "description": "APCS 第一題題解。",
        "tags": ["APCS"]
    }
]
```

**欄位說明：**

| 欄位 | 必填 | 說明 |
|------|:----:|------|
| `slug` | ✅ | `.md` 檔案名稱（不含 `.md` 副檔名） |
| `title` | ✅ | 文章標題，顯示在卡片和文章頁 |
| `date` | ✅ | 發布日期，格式 `YYYY-MM-DD` |
| `description` | ❌ | 文章摘要，顯示在卡片上 |
| `tags` | ❌ | 標籤陣列，顯示為小圓角標籤 |

### 步驟 3：完成！

訪問相關的分類頁面（例如 `APCS.html`）即可看到新文章出現在列表中。
點擊卡片即可進入閱讀（例如 `APCS.html?post=APCS_1`）。

---

## 使用的外部資源

| 資源 | 用途 |
|------|------|
| [Google Fonts](https://fonts.google.com/) | 馬山正楷(Ma Shan Zheng)、站酷小薇(ZCOOL XiaoWei)、思源宋體(Noto Serif TC) |
| [marked.js](https://cdn.jsdelivr.net/npm/marked/marked.min.js) | 客戶端 Markdown → HTML 渲染引擎 |

---

## 本地開發

可使用任意靜態伺服器預覽，例如：

```bash
npx http-server . -p 8080 --cors -c-1
```

然後在瀏覽器打開 `http://localhost:8080/pages/index.html`
