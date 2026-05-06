"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"

const subjectMap: Record<string, string> = {
  toan: "Toán",
  ngu_van: "Ngữ Văn",
  ngoai_ngu: "Ngoại Ngữ",
  vat_li: "Vật Lí",
  hoa_hoc: "Hóa Học",
  sinh_hoc: "Sinh Học",
  lich_su: "Lịch Sử",
  dia_li: "Địa Lí",
  gdcd: "GDCD",
}

// Common subjects between 2023/2024 and 2025
const commonSubjects = ['toan', 'ngu_van', 'ngoai_ngu', 'vat_li', 'hoa_hoc', 'sinh_hoc', 'lich_su', 'dia_li']

interface YearData {
  totalStudents: number
  averageScores: Record<string, number>
  participants: Record<string, number>
}

export function AverageScoreChart({ data }: { data: Record<string, YearData> }) {
  const chartData = commonSubjects.map((key) => ({
    subject: subjectMap[key] || key,
    "2023": data["2023"]?.averageScores[key] || 0,
    "2024": data["2024"]?.averageScores[key] || 0,
    "2025": data["2025"]?.averageScores[key] || 0,
  }))

  const chartConfig = {
    "2023": {
      label: "2023",
      color: "var(--year-2023)",
    },
    "2024": {
      label: "2024",
      color: "var(--year-2024)",
    },
    "2025": {
      label: "2025",
      color: "var(--year-2025)",
    },
  } satisfies ChartConfig

  return (
    <Card>
      <CardHeader>
        <CardTitle>Điểm trung bình các môn thi (2023–2025)</CardTitle>
        <CardDescription>
          So sánh điểm trung bình 8 môn chung giữa 3 năm (Grouped Bar)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 10,
              left: 10,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="subject"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              fontSize={12}
            />
            <YAxis
              domain={[0, 10]}
              tickLine={false}
              axisLine={false}
              tickMargin={5}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="2023" fill="var(--color-2023)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="2024" fill="var(--color-2024)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="2025" fill="var(--color-2025)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
