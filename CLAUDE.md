@AGENTS.md

# SEL 運動共學社群網站

國立高雄師範大學南區社會情緒學習與教育創新中心「SEL 運動共學社群」的活動與成果網站（115 年度，期程至 115/12/31）。網站內容與 commit 訊息一律使用繁體中文，commit 沿用 `feat:` / `fix:` 前綴。

## 指令

- `npm run dev`：本機開發，網址是 http://localhost:3000/sel-community-claude/（路徑不可省略）
- `npm run build`：靜態輸出到 `out/`
- `npm run lint`：ESLint

專案沒有測試，修改後以 `npm run build`、`npm run lint` 加瀏覽器實際檢視來驗證。

## 部署

**推送到 `main` 會直接更新正式網站。** `.github/workflows/deploy.yml` 會建置並把 `out/` 部署到 GitHub Pages：
https://linluyang-blip.github.io/sel-community-claude/

網站在 2026-11-11 從 `sel-community-anti` repo 搬到 `sel-community-claude`（`origin`）。舊 repo 是本機的 `old` remote：`main` 分支保留搬家前的程式碼封存，Pages 改由 `redirect` 分支部署轉址頁，把 `/sel-community-anti/...` 的舊網址連同路徑與錨點轉到新網址。不要再推送到 `old`。

網站必須維持可靜態輸出（`output: "export"`），因此不能使用 Server Actions、Route Handlers 的動態功能、cookies、rewrites 等需要伺服器的功能。`cacheComponents` 也與靜態輸出不相容。

## 結構

Next.js App Router + Tailwind CSS 4 + TypeScript。

- `lib/content.ts`：**網站所有內容**（理念、活動時程、成員、成果照片），改內容通常只需要改這裡
- `lib/site.ts`：`basePath` 與 `asset()`；`basePath` 必須與 GitHub repo 名稱一致
- `app/page.tsx`、`app/outcomes/page.tsx`：首頁與成果頁
- `app/globals.css`：Tailwind 主題（色彩、動畫）
- `components/`：只有 reveal、parallax、nav、lightbox、contact-form 等需要互動的元件是 client component
- `public/`：照片與靜態檔；`public/outcomes.html` 是舊網址的轉址頁，不要刪除
- `docx_content.txt`：社群核定表的文字內容，不會出現在網站上

## 注意事項

- `next/image` 與 `<img>` 不會自動加 `basePath`，路徑要用 `asset("/xxx.jpg")`；`next/link` 會自動加。
- 所有 `<Link>` 都要設 `prefetch={false}`。靜態輸出的預載檔路徑與瀏覽器請求的路徑不一致，開啟會產生 404。
- `trailingSlash: true` 不要拿掉，否則 `outcomes.html` 與 `outcomes/` 資料夾會在 GitHub Pages 上衝突。
- 響應式斷點：導覽列在 `lg` 切換漢堡選單（7 個連結在 `md` 寬度會擠不下），時程軸在 `lg` 切換左右交錯。
- 視差用 `components/parallax.tsx` 的 `<Parallax>` / `<Orb>`，會自動尊重「減少動態效果」設定，手機上強度減半。

## 常見修改

**活動結束後補上成果**：在 `lib/content.ts` 的 `outcomes` 為該場次加上 `groups`，沒有 `groups` 的場次會顯示為「籌備中」卡片。`schedule` 的 `outcomeId` 必須對應 `outcomes` 的 `id`。

**加照片**：放進 `public/`，檔名依場次編號（例如 `615-photo4.jpg`），再把 `lib/content.ts` 的範圍改大。原始照片很大，過去也發生過破圖，放入前應先重新編碼：JPEG、最長邊 1800px、品質約 82、移除 EXIF（注意先套用 EXIF 方向）。

**聯絡表單**：透過 FormSubmit 寄送，測試送出會寄出真實信件。
