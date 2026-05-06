"use client"

import * as React from "react"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts"

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
  ngu_van: "Văn",
  ngoai_ngu: "Anh",
  vat_li: "Lí",
  hoa_hoc: "Hóa",
  sinh_hoc: "Sinh",
  lich_su: "Sử",
  dia_li: "Địa",
}

const commonSubjects = ['toan', 'ngu_van', 'ngoai_ngu', 'vat_li', 'hoa_hoc', 'sinh_hoc', 'lich_su', 'dia_li']

interface YearData {
  averageScores: Record<string, number>
}

export function YearComparisonChart({ data }: { data: Record<string, YearData> }) {
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
        <CardTitle>So sánh hồ sơ điểm (Radar)</CardTitle>
        <CardDescription>
          Profile điểm trung bình 8 môn chung giữa 3 năm
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[380px] w-full">
          <RadarChart
            data={chartData}
            margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
          >
            <PolarGrid gridType="polygon" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 12 }}
            />
            <PolarRadiusAxis
              domain={[0, 10]}
              tick={{ fontSize: 10 }}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Radar
              name="2023"
              dataKey="2023"
              stroke="var(--color-2023)"
              fill="var(--color-2023)"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Radar
              name="2024"
              dataKey="2024"
              stroke="var(--color-2024)"
              fill="var(--color-2024)"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Radar
              name="2025"
              dataKey="2025"
              stroke="var(--color-2025)"
              fill="var(--color-2025)"
              fillOpacity={0.15}
              strokeWidth={2}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
