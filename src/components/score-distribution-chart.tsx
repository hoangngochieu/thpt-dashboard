"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

interface YearData {
  distributions: Record<string, Record<string, number>>
}

export function ScoreDistributionChart({ data }: { data: Record<string, YearData> }) {
  const [selectedSubject, setSelectedSubject] = React.useState("toan")

  // Build overlaid data: score 0-10, with count for each year
  const chartData = Array.from({ length: 11 }, (_, i) => {
    const score = i.toString()
    return {
      score: `${i} điểm`,
      "2023": data["2023"]?.distributions?.[selectedSubject]?.[score] || 0,
      "2024": data["2024"]?.distributions?.[selectedSubject]?.[score] || 0,
      "2025": data["2025"]?.distributions?.[selectedSubject]?.[score] || 0,
    }
  })

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

  // Check which years have data for this subject
  const availableYears = ['2023', '2024', '2025'].filter(y =>
    data[y]?.distributions?.[selectedSubject]
  )

  // Available subjects (union of all years)
  const allSubjects = new Set<string>()
  Object.values(data).forEach(yearData => {
    if (yearData?.distributions) {
      Object.keys(yearData.distributions).forEach(s => allSubjects.add(s))
    }
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="space-y-1">
          <CardTitle>Phổ điểm so sánh 3 năm</CardTitle>
          <CardDescription>
            Overlay phân bố điểm cùng môn qua các năm
          </CardDescription>
        </div>
        <Select
          value={selectedSubject}
          onValueChange={(val) => { if (val) setSelectedSubject(val) }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Chọn môn thi" />
          </SelectTrigger>
          <SelectContent>
            {Array.from(allSubjects).map((key) => (
              <SelectItem key={key} value={key}>
                {subjectMap[key] || key}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              left: 10,
              right: 10,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="fill2023" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-2023)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-2023)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="fill2024" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-2024)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-2024)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="fill2025" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-2025)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-2025)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="score"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <YAxis
              tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            {availableYears.includes('2023') && (
              <Area
                dataKey="2023"
                type="monotone"
                fill="url(#fill2023)"
                stroke="var(--color-2023)"
                strokeWidth={2}
              />
            )}
            {availableYears.includes('2024') && (
              <Area
                dataKey="2024"
                type="monotone"
                fill="url(#fill2024)"
                stroke="var(--color-2024)"
                strokeWidth={2}
              />
            )}
            {availableYears.includes('2025') && (
              <Area
                dataKey="2025"
                type="monotone"
                fill="url(#fill2025)"
                stroke="var(--color-2025)"
                strokeWidth={2}
              />
            )}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
