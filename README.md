# 📊 Dashboard Điểm Thi THPT Quốc Gia 2023–2025

Dashboard trực quan hóa và phân tích dữ liệu điểm thi THPT Quốc gia qua 3 năm (2023, 2024, 2025), bao gồm bản đồ choropleth theo tỉnh/thành, biểu đồ so sánh, và bảng thống kê chi tiết.

---

## 🗂 Cấu trúc thư mục

```
thpt-dashboard/
├── scripts/                          ← [TỰ VIẾT] Script xử lý dữ liệu offline
│   ├── process-data.js               ← Xử lý CSV/XLSX → data.json (tổng hợp)
│   └── process-province-data.js      ← Xử lý CSV/XLSX → province-data.json (theo tỉnh)
│
├── public/
│   ├── vietnam-simplified.geojson    ← [TẢI VỀ] Bản đồ địa lý Việt Nam (GeoJSON)
│   └── data/                         ← (trống – data được nhúng vào src/app)
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                ← [FRAMEWORK + SỬA] Root layout, metadata, font
│   │   ├── page.tsx                  ← [FRAMEWORK] Redirect về /dashboard
│   │   ├── globals.css               ← [FRAMEWORK + SỬA] CSS biến màu, dark mode, year colors
│   │   └── dashboard/
│   │       ├── page.tsx              ← [TỰ VIẾT] Trang dashboard chính, ghép tất cả component
│   │       ├── data.json             ← [TỰ SINH] Output của process-data.js
│   │       └── province-data.json    ← [TỰ SINH] Output của process-province-data.js
│   │
│   ├── components/
│   │   ├── ui/                       ← [SHADCN - CODE CÓ SẴN] 22 component UI nguyên bản
│   │   │   ├── sidebar.tsx           ← Sidebar co/giãn được (700+ dòng)
│   │   │   ├── chart.tsx             ← Wrapper Recharts (ChartContainer, Tooltip...)
│   │   │   ├── card.tsx, table.tsx, badge.tsx, button.tsx, select.tsx, tabs.tsx, ...
│   │   │
│   │   ├── app-sidebar.tsx           ← [TỰ VIẾT] Sidebar với menu điều hướng dashboard
│   │   ├── nav-main.tsx              ← [SỬA] Thêm smooth-scroll khi click menu
│   │   ├── nav-secondary.tsx         ← [SHADCN] Menu phụ (Cài đặt, Trợ giúp)
│   │   ├── nav-user.tsx              ← [SHADCN] Hiển thị user avatar + dropdown
│   │   ├── site-header.tsx           ← [SHADCN] Header top bar
│   │   ├── section-cards.tsx         ← [TỰ VIẾT] 4 thẻ KPI (tổng TS, TB Toán, Văn, Anh)
│   │   ├── average-score-chart.tsx   ← [TỰ VIẾT] Grouped Bar Chart – điểm TB 3 năm
│   │   ├── score-distribution-chart.tsx ← [TỰ VIẾT] Area Overlay – phổ điểm 3 năm
│   │   ├── year-comparison-chart.tsx ← [TỰ VIẾT] Radar Chart – so sánh profile điểm
│   │   ├── subject-trend-chart.tsx   ← [TỰ VIẾT] Line Chart – xu hướng theo môn
│   │   ├── participation-chart.tsx   ← [TỰ VIẾT] Pie + Bar – tỉ lệ KHTN/KHXH
│   │   ├── score-stats-table.tsx     ← [TỰ VIẾT] Bảng thống kê (Mean/Median/Mode/StdDev)
│   │   └── vietnam-map-chart.tsx     ← [TỰ VIẾT] Bản đồ choropleth SVG theo tỉnh/thành
│   │
│   └── lib/
│       └── utils.ts                  ← [SHADCN] Hàm cn() merge Tailwind class
│
├── package.json                      ← Dependencies
├── next.config.ts                    ← [FRAMEWORK] Cấu hình Next.js
├── tsconfig.json                     ← [FRAMEWORK] Cấu hình TypeScript
└── components.json                   ← [SHADCN] Cấu hình CLI Shadcn UI
```

---

## 🛠 Công nghệ sử dụng

| Công nghệ | Vai trò | Phiên bản |
|-----------|---------|-----------|
| **Next.js** | Framework React – App Router, SSR/CSR | 16.2.4 |
| **React** | UI library | 19.2.4 |
| **TypeScript** | Kiểu tĩnh cho toàn bộ component | ^5 |
| **Tailwind CSS v4** | Styling – utility-first CSS | ^4 |
| **Shadcn UI** | Bộ component UI có sẵn (Sidebar, Card, Table...) | ^4.4.0 |
| **Recharts** | Vẽ biểu đồ (Bar, Area, Radar, Pie, Line) | ^3.8.0 |
| **d3-geo** | Chiếu địa lý Mercator – vẽ SVG bản đồ | ^3.1.1 |
| **d3-scale** | Thang màu quantile cho bản đồ | ^4.0.2 |
| **topojson-client** | Đọc định dạng TopoJSON (nếu dùng) | ^3.1.0 |
| **csv-parser** | Đọc file CSV dòng theo dòng (Node.js) | ^3.2.0 |
| **xlsx** | Đọc file Excel .xlsx (Node.js) | ^0.18.5 |
| **lucide-react** | Icon SVG | ^1.8.0 |
| **next-themes** | Dark/Light mode | ^0.4.6 |
| **@tanstack/react-table** | Bảng dữ liệu có sort | ^8.21.3 |
| **sonner** | Toast notification | ^2.0.7 |

---

## ⚙️ Các bước xây dựng dự án (theo thứ tự)

### Bước 1 – Khởi tạo dự án Next.js

```bash
npx create-next-app@latest thpt-dashboard --typescript --tailwind --app
```

Lệnh này tạo ra **toàn bộ cấu trúc skeleton** của framework:
- `src/app/layout.tsx` – Root layout
- `src/app/page.tsx` – Trang chủ mặc định
- `src/app/globals.css` – CSS mặc định của Next.js + Tailwind
- `next.config.ts`, `tsconfig.json`, `package.json`, `postcss.config.mjs`, `.gitignore`

> 🟡 **Đây là code của framework, chưa có gì của dự án.**

---

### Bước 2 – Cài đặt Shadcn UI (dashboard-01 template)

```bash
npx shadcn@latest init
npx shadcn@latest add sidebar card chart table badge button select tabs ...
```

Shadcn UI **không phải là một thư viện npm thông thường** — nó **copy source code** trực tiếp vào dự án. Sau lệnh này, thư mục `src/components/ui/` được tạo ra với 22 file:

- `sidebar.tsx` (~700 dòng) – Component sidebar co/giãn hoàn chỉnh
- `chart.tsx` (~350 dòng) – Wrapper tích hợp Recharts với CSS variable màu sắc
- `card.tsx`, `table.tsx`, `badge.tsx`, `select.tsx`, `tabs.tsx`, `button.tsx`, `tooltip.tsx`...

Đồng thời Shadcn tạo thêm `src/lib/utils.ts` với hàm `cn()`:
```ts
// cn() merge Tailwind class, ưu tiên class sau nếu trùng
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

File `components.json` được tạo để lưu cấu hình CLI Shadcn (thư mục component, style, alias...).

> 🟡 **Toàn bộ `src/components/ui/` là code Shadcn — KHÔNG phải tự viết.**

---

### Bước 3 – Viết script xử lý dữ liệu (Node.js offline)

Dữ liệu thô gồm 3 file rất lớn trong thư mục cha:
- `diem_thi_thpt_2023.csv` (~40 MB, ~1 triệu dòng)
- `diem_thi_thpt_2024.csv` (~42 MB, ~1 triệu dòng)
- `20250715-ketquathi-ct2018a.xlsx` (~79 MB)

**Vấn đề:** Không thể load file 40 MB trong trình duyệt mỗi lần render.  
**Giải pháp:** Tiền xử lý offline → xuất ra 2 file JSON nhỏ gọn.

#### `scripts/process-data.js` – Thống kê tổng hợp toàn quốc

Script này tự viết hoàn toàn, thực hiện:

1. **Đọc CSV** bằng `csv-parser` (streaming, không load toàn bộ vào RAM)
2. **Đọc XLSX** bằng thư viện `xlsx`, map tiêu đề tiếng Việt → key chuẩn
3. Với mỗi thí sinh, mỗi môn thi → gọi `processScore()`:
   - Tính `sum` và `count` để ra điểm trung bình
   - Tích lũy histogram (phân phối theo khoảng 0–10)
   - Đếm: dưới 1 điểm (liệt), ≥ 5, ≥ 8, 9–10
   - Lưu toàn bộ điểm vào mảng `allScores` để tính Median/Mode/StdDev
4. Sau khi đọc xong → `finalizeStats()` tính:
   - **Median** (trung vị): sort mảng, lấy phần tử giữa
   - **Mode** (yếu vị): làm tròn đến 0.25, tìm tần số cao nhất
   - **StdDev** (độ lệch chuẩn): `sqrt(Σ(x - mean)² / n)`
   - Xóa `allScores` (tiết kiệm RAM)
5. Xuất `data.json` với cấu trúc:
```json
{
  "years": {
    "2023": { "totalStudents", "averageScores", "participants", "distributions", "scoreRanges", "statistics" },
    "2024": { ... },
    "2025": { ... }
  },
  "subjectLabels": { "toan": "Toán", ... },
  "metadata": { "processedAt", "csvSubjects", ... }
}
```

#### `scripts/process-province-data.js` – Thống kê theo tỉnh/thành

Script này giải quyết bài toán: **xác định thí sinh thuộc tỉnh nào từ mã SBD**.

- Mã SBD 2 ký tự đầu → mã tỉnh (VD: `"01"` → Hà Nội, `"02"` → TP.HCM...)
- Map đầy đủ 64 tỉnh/thành + vùng kinh tế (Đồng bằng sông Hồng, Tây Nguyên...)
- Tính điểm trung bình từng môn và **overall average** cho mỗi tỉnh mỗi năm
- Xuất `province-data.json`:
```json
{
  "provinces": {
    "2023": {
      "HàNội": { "displayName", "region", "totalStudents", "averageScores", "overallAverage" },
      ...
    }
  }
}
```

**Chạy scripts:**
```bash
node scripts/process-data.js
node scripts/process-province-data.js
```

> 🟢 **Đây là code tự viết hoàn toàn** – 291 và 401 dòng.

---

### Bước 4 – Xây dựng trang Dashboard (`src/app/dashboard/page.tsx`)

File này là **trang chính**, tự viết hoàn toàn. Nó:

- Import 2 file JSON đã xử lý: `data.json` và `province-data.json`
- Dùng `useState` để quản lý năm đang chọn (`currentYear`)
- Render bố cục tổng thể: `SidebarProvider` → `AppSidebar` + `SidebarInset`
- Bên trong có **6 section** được đánh `id` để sidebar scroll đến:
  - `#overview` – Thẻ KPI
  - `#average` – Biểu đồ điểm TB + Phổ điểm
  - `#comparison` – Radar + Line Trend
  - `#distribution` – Tỉ lệ KHTN/KHXH
  - `#map` – Bản đồ Việt Nam
  - `#stats` – Bảng thống kê

Mỗi section nhận data từ file JSON và truyền xuống component con qua `props`.

---

### Bước 5 – Viết các component biểu đồ (tự viết)

#### `section-cards.tsx` – 4 thẻ KPI

Hiển thị: Tổng thí sinh, Điểm TB Toán, Điểm TB Văn, Điểm TB Ngoại Ngữ.  
Có `TrendBadge` so sánh với năm trước (mũi tên lên/xuống + % thay đổi).

#### `average-score-chart.tsx` – Grouped Bar Chart

So sánh điểm trung bình 8 môn chung (2023 vs 2024 vs 2025) trên cùng một chart.  
Dùng `BarChart` của Recharts với 3 `<Bar>` đặt cạnh nhau.

#### `score-distribution-chart.tsx` – Area Overlay Chart

Hiển thị phổ điểm (histogram) của một môn qua 3 năm, overlay lên nhau.  
- Có dropdown chọn môn thi
- Dùng `AreaChart` với gradient fill mờ dần theo chiều dọc
- Tự động ẩn năm không có dữ liệu môn đó

#### `year-comparison-chart.tsx` – Radar Chart

Hiển thị "profile điểm" dạng mạng nhện: 8 môn là 8 trục, 3 năm là 3 đường.  
Dùng `RadarChart` + `PolarGrid` + `PolarAngleAxis` của Recharts.

#### `subject-trend-chart.tsx` – Line Chart

Xu hướng điểm trung bình một môn từ 2023 → 2025 (trục X là năm, Y là điểm).  
Có dropdown chọn môn.

#### `participation-chart.tsx` – Pie + Bar Chart

Gồm 2 biểu đồ con:
- **Pie Chart (Donut):** Tỉ lệ thí sinh thi KHTN vs KHXH (ước tính từ số người thi môn)
- **Horizontal Bar Chart:** Số bài thi từng môn, tô màu theo nhóm KHTN (xanh) / KHXH (vàng) / bắt buộc (tím)

#### `score-stats-table.tsx` – Bảng thống kê có sort

Bảng đầy đủ nhất: Mean, Median, Mode, StdDev, Min, Max, %≥5, %≥8, %9–10, %<1.  
Click vào tiêu đề cột để sort tăng/giảm (toggle).  
Dùng `Badge` màu để hiển thị điểm trung bình (xanh ≥7, xám ≥5, đỏ <5).

---

### Bước 6 – Bản đồ Choropleth (`vietnam-map-chart.tsx`)

Đây là component phức tạp nhất, tự viết hoàn toàn (~365 dòng).

#### Cách hoạt động:

1. **Load GeoJSON:** Fetch `/vietnam-simplified.geojson` (lưu trong `public/`) khi component mount
2. **D3 Projection:** Dùng `d3-geo.geoMercator()` chiếu tọa độ địa lý → tọa độ SVG
   ```ts
   const projection = d3Geo.geoMercator()
     .center([108, 16])   // tâm bản đồ Việt Nam
     .scale(1800)          // zoom
     .translate([200, 300]) // dịch về giữa SVG 400×600
   ```
3. **Vẽ SVG:** Mỗi tỉnh là một `<path>` SVG, `d` attribute tính bằng `geoPath()(feature)`
4. **Tô màu quantile:** Thay vì scale tuyến tính, dùng **xếp hạng** để tô màu:
   - Sort tất cả tỉnh theo điểm → gán rank 0 (thấp nhất) đến N-1 (cao nhất)
   - Hàm `getColorByRank(rank, total)` nội suy giữa 9 màu trong `PALETTE` (đỏ → tím)
   - **Lợi ích:** Màu sắc phân bổ đều, không bị dồn về một phía khi điểm các tỉnh gần nhau
5. **Tooltip:** Khi hover → hiển thị tên tỉnh, vùng, điểm TB, xếp hạng, số thí sinh
6. **Bảng xếp hạng:** Bên phải bản đồ là bảng scroll, hover bảng ↔ highlight bản đồ (và ngược lại)
7. **Dropdown:** Chọn năm (2023/2024/2025) và môn thi (hoặc "Tất cả")

---

### Bước 7 – Sidebar điều hướng (`app-sidebar.tsx`, `nav-main.tsx`)

#### `app-sidebar.tsx` – Tự viết
Dùng các component `Sidebar*` từ Shadcn, cấu hình menu:
- Logo "THPT Dashboard" + icon GraduationCap
- 6 mục menu chính (mỗi mục là anchor `#section-id`)
- Menu phụ (Cài đặt, Trợ giúp)
- Footer hiển thị thông tin user

#### `nav-main.tsx` – Shadcn + Sửa
Shadcn tạo ra phiên bản có sub-menu. Ta **sửa lại** để dùng smooth scroll:
```ts
// Code tự thêm vào nav-main.tsx
const handleClick = (url: string) => {
  if (url.startsWith("#")) {
    const el = document.getElementById(url.slice(1))
    el?.scrollIntoView({ behavior: "smooth", block: "start" })
  }
}
```
Mỗi `SidebarMenuButton` gọi `onClick={() => handleClick(item.url)}` thay vì `href`.

---

### Bước 8 – Styling (`globals.css`)

File `globals.css` do Shadcn CLI sinh ra phần lớn, nhưng ta **thêm vào**:

```css
/* Thêm màu riêng cho từng năm (light mode) */
--year-2023: oklch(0.637 0.237 25.331);  /* đỏ cam */
--year-2024: oklch(0.588 0.185 248.3);   /* xanh dương */
--year-2025: oklch(0.696 0.17 162.48);   /* xanh lá */

/* Dark mode tương ứng */
--year-2023: oklch(0.645 0.246 16.439);
--year-2024: oklch(0.488 0.243 264.376);
--year-2025: oklch(0.696 0.17 162.48);
```

Dùng không gian màu **OKLCH** (Oklab Lightness Chroma Hue) – chuẩn màu hiện đại hơn HEX/RGB, đảm bảo độ tương phản nhất quán giữa light/dark mode.

---

## 📐 Luồng dữ liệu tổng thể

```
File CSV/XLSX thô (~1 triệu dòng)
        │
        ▼ (chạy script Node.js một lần)
scripts/process-data.js
scripts/process-province-data.js
        │
        ▼ (xuất ra)
src/app/dashboard/data.json          ← ~20 KB
src/app/dashboard/province-data.json ← ~70 KB
        │
        ▼ (import tĩnh lúc build Next.js)
src/app/dashboard/page.tsx           ← parse JSON, quản lý state
        │
        ├──► SectionCards            ← KPI từ data[year]
        ├──► AverageScoreChart       ← averageScores
        ├──► ScoreDistributionChart  ← distributions
        ├──► YearComparisonChart     ← averageScores (radar)
        ├──► SubjectTrendChart       ← averageScores (line)
        ├──► ParticipationChart      ← participants
        ├──► VietnamMapChart         ← provinceData + GeoJSON fetch
        └──► ScoreStatsTable         ← statistics + scoreRanges
```

---

## 🟢 Code tự viết vs 🟡 Code framework/thư viện

| File/Thư mục | Nguồn gốc | Mô tả |
|---|---|---|
| `src/components/ui/*.tsx` (22 file) | 🟡 **Shadcn CLI** | Copy nguyên bản, không sửa |
| `src/lib/utils.ts` | 🟡 **Shadcn CLI** | Hàm `cn()` nguyên bản |
| `next.config.ts` | 🟡 **Next.js** | Nguyên bản |
| `tsconfig.json` | 🟡 **Next.js** | Nguyên bản |
| `eslint.config.mjs`, `postcss.config.mjs` | 🟡 **Next.js** | Nguyên bản |
| `components.json` | 🟡 **Shadcn CLI** | Config CLI |
| `src/app/layout.tsx` | 🟠 **Sửa** | Đổi title, description, lang="vi" |
| `src/app/globals.css` | 🟠 **Sửa** | Thêm `--year-2023/2024/2025` colors |
| `src/components/nav-main.tsx` | 🟠 **Sửa** | Thêm smooth-scroll logic |
| `src/components/nav-secondary.tsx` | 🟠 **Nhỏ** | Đổi nội dung menu |
| `src/components/nav-user.tsx` | 🟠 **Sửa** | Đổi thông tin user |
| `src/components/site-header.tsx` | 🟡 **Shadcn** | Giữ nguyên |
| `scripts/process-data.js` | 🟢 **Tự viết** | 291 dòng – xử lý thống kê |
| `scripts/process-province-data.js` | 🟢 **Tự viết** | 401 dòng – xử lý tỉnh/thành |
| `src/app/dashboard/page.tsx` | 🟢 **Tự viết** | Trang chính, layout, state |
| `src/components/app-sidebar.tsx` | 🟢 **Tự viết** | Menu sidebar dự án |
| `src/components/section-cards.tsx` | 🟢 **Tự viết** | 4 thẻ KPI |
| `src/components/average-score-chart.tsx` | 🟢 **Tự viết** | Grouped Bar Chart |
| `src/components/score-distribution-chart.tsx` | 🟢 **Tự viết** | Area Overlay Chart |
| `src/components/year-comparison-chart.tsx` | 🟢 **Tự viết** | Radar Chart |
| `src/components/subject-trend-chart.tsx` | 🟢 **Tự viết** | Line Chart |
| `src/components/participation-chart.tsx` | 🟢 **Tự viết** | Pie + Horizontal Bar |
| `src/components/score-stats-table.tsx` | 🟢 **Tự viết** | Bảng thống kê có sort |
| `src/components/vietnam-map-chart.tsx` | 🟢 **Tự viết** | Bản đồ choropleth (365 dòng) |
| `public/vietnam-simplified.geojson` | 🟡 **Tải về** | Dữ liệu địa lý Việt Nam |
| `src/app/dashboard/data.json` | 🟢 **Tự sinh** | Output của script xử lý |
| `src/app/dashboard/province-data.json` | 🟢 **Tự sinh** | Output của script tỉnh |

---

## 🚀 Hướng dẫn chạy

### 1. Cài dependencies
```bash
cd thpt-dashboard
npm install
# Thêm csv-parser và xlsx cho scripts
npm install csv-parser xlsx
```

### 2. Xử lý dữ liệu (chạy một lần)
Đặt 3 file dữ liệu thô vào thư mục cha (`../`):
- `diem_thi_thpt_2023.csv`
- `diem_thi_thpt_2024.csv`
- `20250715-ketquathi-ct2018a.xlsx`

```bash
node scripts/process-data.js
node scripts/process-province-data.js
```

### 3. Khởi động dev server
```bash
npm run dev
# Mở http://localhost:3000
```

---

## 💡 Giải thích các quyết định thiết kế

### Tại sao tiền xử lý dữ liệu?
File CSV 40 MB không thể tải trong trình duyệt (tốn thời gian, tốn RAM client). Scripts Node.js chạy một lần, rút gọn thành JSON ~20 KB – nhanh hơn hàng nghìn lần.

### Tại sao dùng màu quantile cho bản đồ?
Nếu dùng scale tuyến tính (min–max), các tỉnh có điểm gần nhau sẽ cùng màu, bản đồ trông đơn điệu. Scale quantile đảm bảo màu phân bổ đều dù điểm các tỉnh chênh lệch nhỏ.

### Tại sao dùng OKLCH cho màu sắc?
OKLCH là không gian màu nhận thức đồng nhất – màu có cùng lightness trông sáng như nhau với mắt người, ngay cả khi hue khác nhau. Đảm bảo chart dễ đọc ở cả light lẫn dark mode.

### Tại sao import JSON tĩnh thay vì fetch?
Next.js hỗ trợ `import data from './data.json'` – JSON được bundle vào JS tại build time, không cần network request lúc runtime → không có loading state, không lỗi CORS.

### Tại sao không dùng D3 toàn phần?
D3 toàn phần (d3-select + DOM manipulation) xung đột với React (React quản lý DOM). Dự án chỉ dùng `d3-geo` cho phép chiếu toán học (không đụng DOM), còn Recharts xử lý render biểu đồ theo cách declarative của React.
