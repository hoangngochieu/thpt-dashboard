# 📊 Vietnam THPT Exam Dashboard (2023–2025)

A high-performance, interactive data visualization dashboard for analyzing Vietnam's National High School Graduation Examination (THPT) results across three consecutive years (2023, 2024, and 2025).

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15+-black?logo=next.js)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-blue?logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)

---

## 🌟 English Version

### Key Features
- **Interactive Choropleth Map**: Visualize exam performance across all 63 provinces using D3.js with quantile-based color scaling.
- **Multi-Year Comparison**: Dynamic charts (Bar, Area, Radar, Line) to compare subject scores and trends from 2023 to 2025.
- **Advanced Statistics**: Detailed breakdown of Mean, Median, Mode, Standard Deviation, and performance tiers.
- **Offline Data Processing**: High-speed Node.js scripts to process millions of raw records into optimized JSON payloads.
- **Responsive UI/UX**: Built with Shadcn UI and Tailwind CSS 4, supporting both Light and Dark modes.

### 🛠 Tech Stack
| Category | Technology |
|---|---|
| **Core Framework** | [Next.js 15+](https://nextjs.org/) (App Router) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/) |
| **Visualization** | [Recharts](https://recharts.org/), [D3.js](https://d3js.org/) |
| **Data Processing** | Node.js, `csv-parser`, `xlsx` |

### 🚀 Getting Started
1. **Clone & Install**:
   ```bash
   git clone https://github.com/hoangngochieu/thpt-dashboard.git
   cd thpt-dashboard
   npm install
   ```
2. **Data Pre-processing**:
   Ensure raw data files (`diem_thi_thpt_2023.csv`, etc.) are in the parent directory, then run:
   ```bash
   node scripts/process-data.js
   node scripts/process-province-data.js
   ```
3. **Run**:
   ```bash
   npm run dev
   ```

---

## 🇻🇳 Bản Tiếng Việt (Chi tiết)

### 🗂 Cấu trúc thư mục
```
thpt-dashboard/
├── scripts/                          ← [TỰ VIẾT] Script xử lý dữ liệu offline
│   ├── process-data.js               ← Xử lý CSV/XLSX → data.json
│   └── process-province-data.js      ← Xử lý CSV/XLSX → province-data.json
├── src/
│   ├── app/
│   │   ├── layout.tsx                ← Layout, metadata, font
│   │   └── dashboard/
│   │       └── page.tsx              ← Trang chính, ghép tất cả component
│   ├── components/
│   │   ├── ui/                       ← [SHADCN] Component UI nguyên bản
│   │   ├── app-sidebar.tsx           ← Sidebar điều hướng
│   │   ├── vietnam-map-chart.tsx     ← Bản đồ choropleth SVG (D3.js)
│   │   └── stats-table/charts...     ← Các component biểu đồ Recharts
```

### ⚙️ Các bước xây dựng (Quy trình thực hiện)

#### Bước 1: Tiền xử lý dữ liệu (Node.js)
Do dữ liệu gốc lên tới hàng trăm MB (~2 triệu dòng), ứng dụng sử dụng script Node.js để:
- Đọc stream (không tốn RAM) bằng `csv-parser`.
- Tính toán các chỉ số thống kê (Median, StdDev, Mode) offline.
- Map mã tỉnh từ SBD để phân loại địa lý.
- Xuất file JSON tinh gọn (~20-70KB) để web load tức thì.

#### Bước 2: Xây dựng UI với Shadcn & Tailwind v4
- Sử dụng **Shadcn UI** làm nền tảng cho Sidebar, Card, Table để có giao diện premium.
- Tùy chỉnh màu sắc bằng hệ màu **OKLCH** trong Tailwind v4 để đảm bảo độ tương phản tốt nhất giữa Dark/Light mode.

#### Bước 3: Trực quan hóa dữ liệu
- **Bản đồ (D3.js)**: Sử dụng phép chiếu Mercator và thang màu Quantile để phân bổ màu sắc đồng đều theo thứ hạng các tỉnh.
- **Biểu đồ (Recharts)**: Sử dụng Area Chart để vẽ phổ điểm, Radar Chart để so sánh profile các năm và Bar Chart cho điểm trung bình.

### 💡 Giải thích các quyết định kỹ thuật
1. **Tại sao tiền xử lý dữ liệu?**: Tránh load file CSV cực lớn trực tiếp trên trình duyệt, giúp app chạy mượt mà trên cả điện thoại.
2. **Tại sao dùng màu Quantile cho bản đồ?**: Nếu dùng scale tuyến tính, các tỉnh có điểm sát nhau sẽ trùng màu. Scale quantile giúp phân biệt rõ thứ hạng.
3. **Tại sao dùng OKLCH?**: Đây là không gian màu hiện đại, giúp màu sắc trông tự nhiên và đồng nhất về độ sáng khi chuyển đổi giao diện.

---

## 👤 Author
**Hoàng Ngọc Hiếu**
- GitHub: [@hoangngochieu](https://github.com/hoangngochieu)

## 📄 License
This project is licensed under the MIT License.
