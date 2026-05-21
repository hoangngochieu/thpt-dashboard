"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon, BookOpenIcon, SparklesIcon, FileTextIcon, MapPinIcon, BarChart3Icon, TrendingUpIcon, PieChartIcon } from "lucide-react"

// Import charts
import { SectionCards } from "@/components/section-cards"
import { AverageScoreChart } from "@/components/average-score-chart"
import { ScoreDistributionChart } from "@/components/score-distribution-chart"
import { YearComparisonChart } from "@/components/year-comparison-chart"
import { SubjectTrendChart } from "@/components/subject-trend-chart"
import { ParticipationChart } from "@/components/participation-chart"
import { VietnamMapChart } from "@/components/vietnam-map-chart"
import { ComparisonTool } from "@/components/comparison-tool"

// Import data
import rawData from "../data.json"
import provinceRawData from "../province-data.json"

const yearsData = rawData.years as Record<string, any>
const provinceData = provinceRawData.provinces as Record<string, any>

export default function StoryPage() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [storyYear, setStoryYear] = useState("2024")

  // Scroll progress tracker
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100
        setScrollProgress(currentProgress)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const storySections = [
    {
      badge: "Chương 1: Quy mô kỳ thi",
      title: "Quy mô Kỳ thi & Số lượng Thí sinh tốt nghiệp THPT",
      icon: <FileTextIcon className="size-5 text-indigo-500" />,
      content: (
        <div className="space-y-4 text-muted-foreground leading-relaxed text-sm">
          <p>
            Kỳ thi Tốt nghiệp THPT là sự kiện giáo dục có quy mô lớn nhất Việt Nam, thu hút hơn 1 triệu thí sinh mỗi năm. Dữ liệu giai đoạn 2023 - 2025 cho thấy quy mô thí sinh có xu hướng tăng nhẹ:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">Năm 2023:</strong> Hơn 1.01 triệu thí sinh đăng ký dự thi.</li>
            <li><strong className="text-foreground">Năm 2024:</strong> Hơn 1.07 triệu thí sinh (tăng khoảng 60,000 thí sinh so với 2023).</li>
            <li><strong className="text-foreground">Năm 2025:</strong> Cột mốc đặc biệt khi kỳ thi THPT lần đầu tiên áp dụng chương trình Giáo dục Phổ thông mới (GDPT 2018), thay đổi hoàn toàn cấu trúc môn thi và cách thức ra đề định hướng đánh giá năng lực.</li>
          </ul>
          <div className="mt-4 p-3.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs">
            <span className="font-semibold block mb-0.5">💡 Điểm đáng chú ý:</span>
            Sự gia tăng liên tục số lượng thí sinh tạo áp lực lớn lên công tác tuyển sinh Đại học, đòi hỏi sự phân hóa rõ nét hơn từ đề thi.
          </div>
        </div>
      )
    },
    {
      badge: "Chương 2: Phân bộ Địa lý",
      title: "Bản đồ Địa lý Điểm thi - Sự phân hóa vùng miền",
      icon: <MapPinIcon className="size-5 text-rose-500" />,
      content: (
        <div className="space-y-4 text-muted-foreground leading-relaxed text-sm">
          <p>
            Bản đồ điểm thi cả nước phác họa một bức tranh phân hóa địa lý rõ rệt về chất lượng giáo dục giữa các tỉnh thành và vùng miền:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">Nhóm dẫn đầu:</strong> Các tỉnh thuộc đồng bằng sông Hồng như Nam Định, Ninh Bình, Vĩnh Phúc luôn giữ vững vị trí dẫn đầu cả nước với điểm trung bình toàn diện vượt trội (trên 7.0 điểm).</li>
            <li><strong className="text-foreground">Các thành phố lớn:</strong> Hà Nội và TP.HCM có số lượng thí sinh đông nhất nước nhưng điểm trung bình ở mức khá (xấp xỉ 6.5 - 6.8), do sự chênh lệch lớn giữa các trường nội thành và ngoại thành.</li>
            <li><strong className="text-foreground">Vùng cao & Biên giới:</strong> Các tỉnh miền núi phía Bắc (Hà Giang, Cao Bằng) và Tây Nguyên tiếp tục nằm ở nhóm cuối bảng, phản ánh khoảng cách lớn về hạ tầng giáo dục và đội ngũ giáo viên.</li>
          </ul>
          <div className="mt-4 p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs">
            <span className="font-semibold block mb-0.5">🗺️ Insight Địa lý:</span>
            Nam Định liên tục giữ vị trí quán quân về điểm trung bình thi tốt nghiệp THPT cả nước trong nhiều năm, khẳng định truyền thống hiếu học lâu đời và sự đồng đều trong phong trào học tập.
          </div>
        </div>
      )
    },
    {
      badge: "Chương 3: Điểm trung bình",
      title: "Điểm trung bình các môn thi - Cân bằng hay Thiên lệch?",
      icon: <BarChart3Icon className="size-5 text-amber-500" />,
      content: (
        <div className="space-y-4 text-muted-foreground leading-relaxed text-sm">
          <p>
            Khi so sánh điểm trung bình giữa các môn thi chung giai đoạn 2023-2025, chúng ta nhận thấy sự chênh lệch đáng kể giữa các bộ môn, phản ánh đặc điểm thi cử của học sinh:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">Môn học dễ đạt điểm cao:</strong> Giáo dục Công dân (GDCD) luôn đứng đầu bảng với điểm trung bình dao động từ 8.0 đến 8.5. Học sinh dễ dàng đạt được điểm khá giỏi môn này.</li>
            <li><strong className="text-foreground">Môn Ngoại Ngữ:</strong> Liên tục xếp cuối bảng điểm trung bình (~5.4 - 5.6 điểm). Đây là bài toán khó kéo dài nhiều năm của ngành giáo dục.</li>
            <li><strong className="text-foreground">Toán & Ngữ văn:</strong> Giữ mức độ ổn định tốt từ 6.0 đến 6.8 điểm. Ngữ văn có xu hướng tăng nhẹ trong năm 2024 nhờ đề thi mở và thực tế.</li>
          </ul>
          <div className="mt-4 p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs">
            <span className="font-semibold block mb-0.5">🎯 Nhận xét:</span>
            Sự lệch pha điểm số giữa các môn học (ví dụ tiếng Anh so với GDCD) cho thấy đề thi chưa có sự đồng bộ về độ khó, hoặc mức độ đầu tư môn học của học sinh có sự chênh lệch lớn.
          </div>
        </div>
      )
    },
    {
      badge: "Chương 4: Phổ điểm",
      title: "Phổ điểm Môn học - Bức tranh Phân hóa của Học sinh",
      icon: <TrendingUpIcon className="size-5 text-emerald-500" />,
      content: (
        <div className="space-y-4 text-muted-foreground leading-relaxed text-sm">
          <p>
            Phổ điểm (sự phân bố số lượng thí sinh theo các mức điểm từ 0 đến 10) thể hiện bản chất phân hóa tuyển sinh của đề thi tốt nghiệp qua từng năm:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">Phổ điểm Toán:</strong> Có dạng hình chuông chuẩn đẹp, đỉnh phổ điểm nằm ở mức 6.4 - 7.2 điểm. Số lượng điểm 9-10 biến động vừa phải giữa các năm.</li>
            <li><strong className="text-foreground">Phổ điểm Tiếng Anh:</strong> Thể hiện phân phối bimodal (hai đỉnh) độc đáo qua các năm. Một đỉnh ở mức điểm thấp (3-4 điểm) đại diện cho học sinh ở các khu vực nông thôn/miền núi, và một đỉnh ở mức điểm khá (7-8 điểm) đại diện cho học sinh ở đô thị có điều kiện học ngoại ngữ tốt.</li>
          </ul>
          <div className="mt-4 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs">
            <span className="font-semibold block mb-0.5">📊 Phân tích Chuyên sâu:</span>
            Sự xuất hiện của phổ điểm Tiếng Anh hai đỉnh là minh chứng rõ nét nhất cho khoảng cách chất lượng giáo dục ngoại ngữ giữa các vùng kinh tế phát triển và phần còn lại của đất nước.
          </div>
        </div>
      )
    },
    {
      badge: "Chương 5: Tổ hợp thi",
      title: "Tỉ lệ Tổ hợp thi - Xu hướng Khoa học Xã hội chiếm ưu thế",
      icon: <PieChartIcon className="size-5 text-sky-500" />,
      content: (
        <div className="space-y-4 text-muted-foreground leading-relaxed text-sm">
          <p>
            Tỉ lệ đăng ký giữa hai tổ hợp Khoa học Tự nhiên (KHTN) và Khoa học Xã hội (KHXH) có sự chênh lệch rất lớn qua các năm:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">KHXH áp đảo:</strong> Khoảng 60% - 65% thí sinh lựa chọn tổ hợp KHXH (Lịch sử, Địa lý, GDCD).</li>
            <li><strong className="text-foreground">Lý do chính:</strong> Các môn KHXH dễ học thuộc lòng và dễ lấy điểm trung bình khá để xét tốt nghiệp THPT hơn so với các môn KHTN đòi hỏi tư duy logic và tính toán cao (Vật lý, Hóa học, Sinh học).</li>
          </ul>
          <div className="mt-4 p-3.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-300 text-xs">
            <span className="font-semibold block mb-0.5">🔄 Xu hướng tương lai:</span>
            Chương trình GDPT 2018 áp dụng từ năm 2025 cho phép học sinh tự chọn môn học thay vì bắt buộc theo khối thi cố định, hứa hẹn sẽ cân bằng lại tỉ lệ phân hóa môn học của thí sinh.
          </div>
        </div>
      )
    },
    {
      badge: "Chương 6: Biến động xu hướng",
      title: "Biến động Điểm số - Bước chuyển mình sang Chương trình mới",
      icon: <SparklesIcon className="size-5 text-purple-500" />,
      content: (
        <div className="space-y-4 text-muted-foreground leading-relaxed text-sm">
          <p>
            Nhìn lại chặng đường 3 năm (2023 - 2025), điểm trung bình các môn thi phản ánh sự nỗ lực cải cách của ngành giáo dục:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">Giai đoạn 2023 - 2024:</strong> Điểm số có xu hướng tăng nhẹ, giữ mức ổn định để đảm bảo tỷ lệ tốt nghiệp THPT cao cho học sinh theo chương trình cũ (2006).</li>
            <li><strong className="text-foreground">Cột mốc 2025:</strong> Điểm thi phản ánh rõ nét mục tiêu kiểm tra đánh giá năng lực của chương trình GDPT 2018. Đề thi giảm bớt việc ghi nhớ máy móc, tăng cường các câu hỏi liên hệ thực tiễn và giải quyết vấn đề.</li>
          </ul>
          <div className="mt-4 p-3.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs">
            <span className="font-semibold block mb-0.5">🌟 Lời kết:</span>
            Bức tranh dữ liệu thi THPT không chỉ phản ánh kết quả học tập của học sinh mà còn là tấm gương phản chiếu những thay đổi chiến lược của nền giáo dục Việt Nam trên con đường đổi mới và hội nhập quốc tế.
          </div>
        </div>
      )
    },
    {
      badge: "Chương 7: Tự do khám phá",
      title: "Bộ công cụ tự so sánh - Khám phá theo nhu cầu riêng",
      icon: <SparklesIcon className="size-5 text-indigo-500" />,
      content: (
        <div className="space-y-4 text-muted-foreground leading-relaxed text-sm">
          <p>
            Để mang lại trải nghiệm cá nhân hóa tối đa cho các giám khảo và người dùng, chúng tôi cung cấp bộ công cụ so sánh tự phục vụ 3 chiều:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">Tự chọn môn/khối thi:</strong> Dễ dàng so sánh kết quả điểm thi từ các môn đơn lẻ đến các tổ hợp tự nhiên (KHTN), xã hội (KHXH) và điểm trung bình chung.</li>
            <li><strong className="text-foreground">So sánh địa lý linh hoạt:</strong> Lựa chọn so sánh giữa các tỉnh thành cụ thể (tối đa 6 tỉnh) hoặc so sánh hiệu suất giữa các vùng kinh tế lớn.</li>
            <li><strong className="text-foreground">Đối chiếu liên năm:</strong> Xem ngay xu hướng điểm số thay đổi qua các năm học 2023, 2024, và 2025 trong cùng một biểu đồ.</li>
          </ul>
          <div className="mt-4 p-3.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs">
            <span className="font-semibold block mb-0.5">💡 Mẹo tương tác:</span>
            Hãy tích chọn các môn học, vị trí địa lý hoặc năm thi ở menu bên phải. Giao diện biểu đồ và chú thích sẽ cập nhật tức thời để hiển thị kết quả phân tích mong muốn.
          </div>
        </div>
      )
    }
  ]

  // Render specific chart for a given section index
  const renderSectionChart = (sectionIndex: number) => {
    switch (sectionIndex) {
      case 0:
        return (
          <div className="space-y-4 w-full">
            <div className="flex justify-between items-center px-4 lg:px-6">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mẫu dữ liệu năm: {storyYear}</span>
              <div className="flex gap-1.5 bg-muted p-1 rounded-md text-xs">
                {["2023", "2024", "2025"].map((yr) => (
                  <button
                    key={yr}
                    onClick={() => setStoryYear(yr)}
                    className={`px-2 py-1 rounded-sm font-medium transition-all ${storyYear === yr ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>
            <SectionCards currentYear={storyYear} data={yearsData} />
          </div>
        )
      case 1:
        return <VietnamMapChart provinceData={provinceData} />
      case 2:
        return (
          <div className="space-y-4 w-full">
            <AverageScoreChart data={yearsData} />
            <div className="pt-2">
              <YearComparisonChart data={yearsData} />
            </div>
          </div>
        )
      case 3:
        return <ScoreDistributionChart data={yearsData} />
      case 4:
        return <ParticipationChart data={yearsData} />
      case 5:
        return <SubjectTrendChart data={yearsData} />
      case 6:
        return <ComparisonTool provinceData={provinceData} />
      default:
        return null
    }
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        {/* Scroll Progress Bar */}
        <div
          className="fixed top-0 left-0 right-0 h-1 bg-primary/20 z-50 transition-all duration-100"
          style={{ width: `${scrollProgress}%` }}
        >
          <div className="h-full w-full bg-linear-to-r from-blue-600 via-indigo-500 to-purple-600 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
        </div>

        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) sticky top-0 bg-background/85 backdrop-blur-md z-40">
          <div className="flex w-full items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold flex items-center gap-1.5">
                <BookOpenIcon className="size-4 text-indigo-500" />
                <span>Câu chuyện Dữ liệu (Scrollytelling)</span>
              </h1>
            </div>

            <Link href="/dashboard">
              {/* <Button size="sm" variant="outline" className="text-xs gap-1.5 cursor-pointer">
                <ArrowLeftIcon className="size-3.5" />
                <span>Quay lại Dashboard</span>
              </Button> */}
            </Link>
          </div>
        </header>

        <div className="flex-1 bg-slate-50/30 dark:bg-zinc-950/20">
          <div className="mx-auto max-w-7xl px-4 py-8 md:py-12 lg:px-8">

            {/* Header intro */}
            <div className="mb-12 text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
                <SparklesIcon className="size-3.5" />
                <span>Trải nghiệm Khám phá Dữ liệu Cao cấp</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent sm:text-4xl pb-1">
                Hành trình Dữ liệu Thi THPT Quốc gia
              </h2>
              <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
                Khám phá câu chuyện chi tiết đằng sau dữ liệu điểm thi tốt nghiệp THPT giai đoạn 2023 - 2025. Mỗi chương phân tích đi kèm ngay với biểu đồ trực quan tương ứng, giúp bạn dễ dàng theo dõi và đối chiếu thông tin mà không gặp trở ngại về điều hướng.
              </p>
            </div>

            {/* Side-by-side Scrolling List */}
            <div className="space-y-16 lg:space-y-24">
              {storySections.map((section, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start pt-8 border-t border-border/40 first:border-0 first:pt-0"
                >
                  {/* Left Column: Narrative Card */}
                  <div className="lg:col-span-5 p-6 rounded-2xl border border-border/80 bg-card/65 backdrop-blur-md shadow-xs hover:border-primary/40 hover:shadow-md transition-all duration-300 relative">
                    {/* Number Badge */}
                    <div className="absolute -left-3 -top-3 lg:-left-4 lg:-top-4 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs shadow-md">
                      {index + 1}
                    </div>

                    <div className="mb-3 pl-2">
                      <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {section.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold tracking-tight mb-4 flex items-center gap-2 pl-2">
                      {section.icon}
                      <span>{section.title}</span>
                    </h3>

                    <div className="pl-2">{section.content}</div>
                  </div>

                  {/* Right Column: Chart */}
                  <div className="lg:col-span-7 w-full bg-card rounded-2xl border border-border/80 p-5 shadow-xs">
                    {renderSectionChart(index)}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Outro */}
            <div className="mt-20 border-t pt-8 text-center text-xs text-muted-foreground">
              <p>Được thiết kế cho đợt báo cáo & đánh giá của Hội đồng Giám khảo.</p>
              <p className="mt-1">© 2026 Hệ thống Trực quan hóa Dữ liệu THPT Quốc gia.</p>
            </div>

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
