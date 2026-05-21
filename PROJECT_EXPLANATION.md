# 📖 HƯỚNG DẪN CHI TIẾT & GIẢI THÍCH MÃ NGUỒN DỰ ÁN
## HỆ THỐNG TRỰC QUAN HÓA DỮ LIỆU ĐIỂM THI THPT QUỐC GIA (2023 - 2025)

Tài liệu này được biên soạn chi tiết nhằm giúp bạn hiểu rõ cấu trúc thư mục, chức năng, luồng dữ liệu, vai trò của từng tệp tin và cách thức vận hành/build của dự án **THPT Dashboard**.

---

## 1. Tổng Quan Dự Án (Project Overview)
Dự án là một ứng dụng Web (Dashboard) hiệu năng cao, trực quan và tương tác chuyên sâu, được thiết kế để phân tích kết quả kỳ thi tốt nghiệp THPT Quốc gia của Việt Nam trong 3 năm liên tiếp (**2023, 2024, và 2025**). 

Hệ thống cho phép các nhà quản lý giáo dục, giám khảo, và người dùng thông thường:
* Đánh giá quy mô kỳ thi toàn quốc qua các năm.
* Nhận diện sự phân hóa chất lượng giáo dục giữa các tỉnh thành/vùng địa lý thông qua bản đồ nhiệt tương tác (Choropleth Map).
* So sánh điểm số trung bình, phổ điểm (phân bố điểm), xu hướng chọn tổ hợp (KHTN vs KHXH) và biến động điểm số liên năm.
* Tự do chọn và so sánh đối chiếu điểm số theo tổ hợp 3 chiều: **Môn học/Khối thi** × **Tỉnh thành/Vùng miền** × **Năm học**.

---

## 2. Các Chức Năng Chính (Key Features)

1. **Dashboard Tổng Quan**:
   - Hiển thị các thẻ chỉ số chính (KPIs): Tổng số thí sinh tốt nghiệp, Điểm trung bình toàn quốc, Tỉnh thành có điểm trung bình cao nhất, và Tỷ lệ đỗ tốt nghiệp ước tính.
   - Cung cấp các biểu đồ phân tích trực quan: Cột nhóm (Grouped Bar), Phổ điểm diện tích (Area), Radar đối chiếu, Đường xu hướng (Line), và Cơ cấu tổ hợp (Pie + Bar).
   
2. **Bản Đồ Địa Lý Tương Tác (Choropleth Map)**:
   - Sử dụng dữ liệu GeoJSON vẽ bản đồ 63 tỉnh thành Việt Nam thông qua D3.js.
   - Áp dụng thang màu phân nhóm (Quantile Color Scale) để biểu thị mức độ điểm trung bình từ cao (xanh đậm) đến thấp (đỏ/cam).
   - Di chuột (hover) hiển thị chi tiết thông tin của từng tỉnh và cho phép click chọn để xem chi tiết hoặc so sánh.

3. **Bảng Số Liệu Chi Tiết (Score Stats Table)**:
   - Liệt kê toàn bộ 63 tỉnh thành với các thống kê: Điểm trung bình, số lượng thí sinh, điểm trung vị, độ lệch chuẩn, tỉ lệ điểm giỏi (>= 8.0) và tỉ lệ điểm liệt (<= 1.0).
   - Hỗ trợ tìm kiếm nhanh theo tên tỉnh và sắp xếp (sorting) đa tiêu chí.

4. **Bộ Công Cụ So Sánh Tự Chọn 3 Chiều**:
   - Cho phép người dùng tự chọn lên tới 6 tỉnh/vùng để so sánh điểm số trung bình của các môn/khối thi (Toán, Văn, Anh, Lý, Hóa, Sinh, Sử, Địa, GDCD, Khối KHTN, Khối KHXH, Trung bình chung) qua các năm 2023, 2024, 2025.

5. **Hành Trình Dữ Liệu (Scrollytelling)**:
   - Một trang kể chuyện dữ liệu theo từng chương (từ Chương 1 đến Chương 7).
   - Khi cuộn trang, nội dung phân tích & insight xuất hiện ở bên trái, đồng thời biểu đồ tương tác tương ứng sẽ hiển thị tương thích ở bên phải giúp người xem nắm bắt thông tin theo mạch kể chuyện hợp lý.

---

## 3. Cách Hoạt Động & Luồng Dữ Liệu (Data Flow)

Do dữ liệu thi THPT gốc rất khổng lồ (khoảng hơn 1 triệu thí sinh mỗi năm, dung lượng file thô CSV/XLSX lên tới hơn 150 MB), trình duyệt không thể tải và xử lý trực tiếp thời gian thực. Vì vậy dự án sử dụng mô hình **Tiền xử lý dữ liệu offline (Offline Data Pipeline)**.

### Sơ đồ Luồng Dữ Liệu:
```
Dữ liệu thô CSV/XLSX từ Bộ GD&ĐT (1 triệu dòng/năm) [~150MB]
                       │
                       ▼ (Chạy các kịch bản xử lý offline một lần)
          scripts/process-data.js 
          scripts/process-province-data.js
                       │
                       ▼ (Xuất ra các file JSON gọn nhẹ)
   src/app/dashboard/data.json          (~20 KB)
   src/app/dashboard/province-data.json (~90 KB)
                       │
                       ▼ (Được Import trực tiếp lúc Build Time của Next.js)
          src/app/dashboard/page.tsx  &  src/app/dashboard/story/page.tsx
                       │
                       ├─► SectionCards (KPIs)
                       ├─► AverageScoreChart (Biểu đồ Điểm TB các môn)
                       ├─► ScoreDistributionChart (Phổ điểm)
                       ├─► ParticipationChart (Cơ cấu tổ hợp)
                       ├─► VietnamMapChart (Bản đồ D3.js)
                       └─► ComparisonTool (Bộ so sánh tự chọn)
```

1. **Giai đoạn xử lý dữ liệu (Offline)**:
   - Các kịch bản Node.js đọc luồng dữ liệu (stream) để tránh tràn bộ nhớ RAM.
   - Nhận diện mã tỉnh từ Số báo danh (2 chữ số đầu của SBD).
   - Tính toán các giá trị thống kê nâng cao như: Trung bình (Mean), Trung vị (Median), Yếu vị (Mode), Độ lệch chuẩn (StdDev).
   - Gom nhóm và xuất ra các cấu trúc JSON tĩnh tối ưu.
2. **Giai đoạn hiển thị (Frontend)**:
   - Next.js nạp dữ liệu từ các file JSON tĩnh ngay lúc khởi tạo build.
   - Giao diện người dùng render ngay lập tức (0ms delay), không cần chờ gọi API lên máy chủ và không cần vòng xoay tải dữ liệu (loading spinner).

---

## 4. Giải Thích Vai Trò Từng File Trong Dự Án (File Reference)

### A. Thư mục Scripts (Tiền xử lý dữ liệu)
* [`scripts/process-data.js`](file:///d:/AD22017_Subject/term_8/datavisualize/hieu/thpt-dashboard/scripts/process-data.js): Đọc file dữ liệu thô của 3 năm để tổng hợp các chỉ số cấp quốc gia (điểm trung bình môn, phổ điểm phân bố từ 0-10 của từng môn, số lượng thí sinh đăng ký từng môn). Kết quả xuất ra `src/app/dashboard/data.json`.
* [`scripts/process-province-data.js`](file:///d:/AD22017_Subject/term_8/datavisualize/hieu/thpt-dashboard/scripts/process-province-data.js): Xử lý dữ liệu thô chia theo từng tỉnh thành trong 63 tỉnh/thành phố để tính điểm trung bình môn, số lượng thí sinh, phổ điểm riêng cho từng địa phương. Kết quả xuất ra `src/app/dashboard/province-data.json`.
* [`scripts/rebuild_2025_data.py` & `build_34provinces.py`](file:///d:/AD22017_Subject/term_8/datavisualize/hieu/thpt-dashboard/scripts/rebuild_2025_data.py): Các tập lệnh Python bổ trợ được tác giả dùng để kiểm chứng hoặc tái cấu trúc dữ liệu thi năm 2025 theo chương trình GDPT mới.

### B. Thư mục Cấu hình & Giao diện Gốc
* [`src/app/globals.css`](file:///d:/AD22017_Subject/term_8/datavisualize/hieu/thpt-dashboard/src/app/globals.css): Định nghĩa các token thiết kế CSS của **Tailwind CSS v4** và các biến màu CSS dùng chung (ví dụ: các biến màu sắc đại diện cho năm `--year-2023`, `--year-2024`, `--year-2025` và hệ màu OKLCH hỗ trợ Light/Dark mode).
* [`src/app/layout.tsx`](file:///d:/AD22017_Subject/term_8/datavisualize/hieu/thpt-dashboard/src/app/layout.tsx): Bố cục gốc của ứng dụng Next.js, cấu hình font chữ (Geist), metadata cho chuẩn SEO và bọc ứng dụng trong các nhà cung cấp theme.

### C. Trang hiển thị (App Routes)
* [`src/app/dashboard/page.tsx`](file:///d:/AD22017_Subject/term_8/datavisualize/hieu/thpt-dashboard/src/app/dashboard/page.tsx): Trang Dashboard chính của hệ thống. Tệp này nạp dữ liệu tĩnh và sắp xếp các component hiển thị theo từng phần (Section) tương ứng với các ID điều hướng.
* [`src/app/dashboard/story/page.tsx`](file:///d:/AD22017_Subject/term_8/datavisualize/hieu/thpt-dashboard/src/app/dashboard/story/page.tsx): Trang kể chuyện dữ liệu (Scrollytelling). Chứa cấu trúc mảng các chương câu chuyện (`storySections`) và hàm hiển thị biểu đồ tương ứng theo từng chương (`renderSectionChart`).

### D. Các Component Trực Quan Hóa (src/components/)
* [`app-sidebar.tsx`](file:///d:/AD22017_Subject/term_8/datavisualize/hieu/thpt-dashboard/src/components/app-sidebar.tsx): Cấu trúc thanh Sidebar điều hướng bên trái. Chứa danh sách các liên kết nhảy (anchor links `#...`) trỏ tới các phần tương ứng trên trang Dashboard.
* [`nav-main.tsx`](file:///d:/AD22017_Subject/term_8/datavisualize/hieu/thpt-dashboard/src/components/nav-main.tsx): Logic bắt sự kiện click trên Sidebar. Nếu người dùng đang ở trang Story, nó sẽ chuyển hướng về `/dashboard` kèm theo hash ID và tự động cuộn trang mượt mà (smooth scroll).
* [`section-cards.tsx`](file:///d:/AD22017_Subject/term_8/datavisualize/hieu/thpt-dashboard/src/components/section-cards.tsx): Hiển thị 4 thẻ chỉ số KPI ở đầu trang kèm theo tính năng so sánh tăng/giảm phần trăm so với năm học trước đó.
* [`average-score-chart.tsx`](file:///d:/AD22017_Subject/term_8/datavisualize/hieu/thpt-dashboard/src/components/average-score-chart.tsx): Biểu đồ cột nhóm (Grouped Bar Chart) của Recharts, so sánh điểm trung bình của 8 môn thi chung qua 3 năm.
* [`score-distribution-chart.tsx`](file:///d:/AD22017_Subject/term_8/datavisualize/hieu/thpt-dashboard/src/components/score-distribution-chart.tsx): Biểu đồ phổ điểm dạng vùng phủ nhau (Area Chart Overlay). Người dùng có thể chọn môn học để xem phân bố số lượng thí sinh từ 0 đến 10 điểm thay đổi thế nào qua 3 năm.
* [`participation-chart.tsx`](file:///d:/AD22017_Subject/term_8/datavisualize/hieu/thpt-dashboard/src/components/participation-chart.tsx): Gồm biểu đồ hình tròn (Pie Chart) thể hiện tỉ lệ chọn tổ hợp KHTN/KHXH và biểu đồ cột ngang thể hiện tổng số thí sinh đăng ký của từng môn thi cụ thể.
* [`year-comparison-chart.tsx`](file:///d:/AD22017_Subject/term_8/datavisualize/hieu/thpt-dashboard/src/components/year-comparison-chart.tsx): Biểu đồ mạng nhện (Radar Chart) biểu thị "hồ sơ điểm số" của cả nước, giúp nhìn nhanh môn nào lệch, môn nào cân bằng giữa các năm.
* [`subject-trend-chart.tsx`](file:///d:/AD22017_Subject/term_8/datavisualize/hieu/thpt-dashboard/src/components/subject-trend-chart.tsx): Biểu đồ đường (Line Chart) mô tả chiều biến động tăng/giảm điểm thi của từng bộ môn qua 3 cột mốc năm học.
* [`vietnam-map-chart.tsx`](file:///d:/AD22017_Subject/term_8/datavisualize/hieu/thpt-dashboard/src/components/vietnam-map-chart.tsx): Sử dụng D3.js kết hợp SVG để vẽ bản đồ địa lý Việt Nam từ file GeoJSON đơn giản hóa (`vietnam-simplified.geojson`). Thang màu Quantile tự động phân loại màu sắc các tỉnh để phản ánh khách quan thứ hạng điểm số của họ mà không bị nhiễu do mật độ số liệu.
* [`score-stats-table.tsx`](file:///d:/AD22017_Subject/term_8/datavisualize/hieu/thpt-dashboard/src/components/score-stats-table.tsx): Bảng dữ liệu chi tiết của 63 tỉnh thành tích hợp ô tìm kiếm và chức năng sắp xếp nâng cao.
* [`comparison-tool.tsx`](file:///d:/AD22017_Subject/term_8/datavisualize/hieu/thpt-dashboard/src/components/comparison-tool.tsx): Component bộ công cụ so sánh tự chọn. Quản lý các trạng thái lựa chọn môn, lựa chọn tỉnh (tối đa 6 tỉnh hoặc vùng miền lớn) và vẽ ra biểu đồ cột nhóm động so sánh các năm cực kỳ trực quan.

---

## 5. Cách Xây Dựng & Chạy Dự Án (Build & Run)

### A. Chuẩn bị Môi trường
Yêu cầu máy tính cài đặt sẵn **Node.js** phiên bản `>= 18.0`.

### B. Cài đặt Thư viện
Mở Terminal tại thư mục dự án và chạy:
```bash
npm install
```

### C. Chạy Chế độ Phát triển (Development Mode)
Để chạy thử giao diện cục bộ có hỗ trợ Hot-Reload (sửa code hiển thị ngay):
```bash
npm run dev
```
Sau đó truy cập đường dẫn: `http://localhost:3000` trên trình duyệt.

### D. Biên dịch Dự án (Production Build)
Để biên dịch tối ưu hóa và xuất bản trang web tĩnh hoàn chỉnh:
```bash
npm run build
```
Next.js sẽ kiểm tra lỗi cú pháp TypeScript, tối ưu hóa CSS, đóng gói các file JSON dữ liệu tĩnh vào bundle và tạo ra mã nguồn HTML/JS sẵn sàng deploy lên môi trường Hosting (Vercel, Netlify, v.v.).

---

## 6. Các Quyết Định Kỹ Thuật Đáng Lưu Ý

1. **Sử dụng D3.js kết hợp React thay vì D3 thuần**:
   - D3.js có hệ thống thao tác DOM riêng dễ xung đột với Virtual DOM của React. Dự án đã giải quyết bằng cách chỉ sử dụng thư viện địa lý `d3-geo` để tính toán tọa độ bản vẽ (path SVG), còn việc vẽ thẻ `<path>` và xử lý sự kiện click/hover được giao hoàn toàn cho React quản lý. Điều này giúp mã nguồn hoạt động an toàn và hiệu năng cực cao.
2. **Khắc phục lỗi Tiếng Việt trong biểu đồ**:
   - Recharts sử dụng các biến CSS động để thiết lập màu. Khi xử lý tiếng Việt có dấu (như tên các tỉnh thành/vùng miền), trình duyệt không thể parse được tên biến chứa dấu và khoảng trắng. Dự án đã giải quyết bằng cách truyền trực tiếp mã màu dạng HEX tĩnh thông qua mảng `LOCATION_COLORS` vào thuộc tính `fill` của thẻ Recharts.
3. **Thang màu Quantile (Phân nhóm đều)**:
   - Bản đồ điểm thi dùng thang màu Quantile chia dữ liệu làm 5 nhóm bằng nhau về số lượng thành viên thay vì chia tuyến tính (Linear). Điều này giải quyết hiện tượng điểm trung bình các tỉnh tập trung quá nhiều ở mức 6.2 - 6.8 khiến bản đồ bị nhuộm đồng nhất một màu khó quan sát. Với Quantile, sự tương phản địa lý giữa các tỉnh dẫn đầu và cuối bảng hiện lên rõ rệt.
