"use client"

import * as React from "react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
}

const subjectColors: Record<string, string> = {
  toan: "#ef4444",
  ngu_van: "#3b82f6",
  ngoai_ngu: "#10b981",
  vat_li: "#f59e0b",
  hoa_hoc: "#8b5cf6",
  sinh_hoc: "#ec4899",
  lich_su: "#06b6d4",
  dia_li: "#f97316",
}

const commonSubjects = ['toan', 'ngu_van', 'ngoai_ngu', 'vat_li', 'hoa_hoc', 'sinh_hoc', 'lich_su', 'dia_li']

interface YearData {
  averageScores: Record<string, number>
}

export function SubjectTrendChart({ data }: { data: Record<string, YearData> }) {
  // Transform: each row is a year, each column is a subject
  const chartData = ['2023', '2024', '2025'].map((year) => {
    const row: Record<string, any> = { year }
    commonSubjects.forEach(sub => {
      row[sub] = data[year]?.averageScores[sub] || 0
    })
    return row
  })

  const chartConfig: ChartConfig = {}
  commonSubjects.forEach(sub => {
    chartConfig[sub] = {
      label: subjectMap[sub],
      color: subjectColors[sub],
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Xu hướng điểm qua các năm</CardTitle>
        <CardDescription>
          Biến động điểm trung bình từng môn: 2023 → 2024 → 2025
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[380px] w-full">
          <LineChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 10,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <YAxis
              domain={[3, 9]}
              tickLine={false}
              axisLine={false}
              tickMargin={5}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {commonSubjects.map((sub) => (
              <Line
                key={sub}
                type="monotone"
                dataKey={sub}
                stroke={`var(--color-${sub})`}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
