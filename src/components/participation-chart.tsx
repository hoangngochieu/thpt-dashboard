"use client"

import * as React from "react"
import { Pie, PieChart, Cell, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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

interface YearData {
  totalStudents: number
  participants: Record<string, number>
}

// KHTN subjects
const khtnSubjects = ['vat_li', 'hoa_hoc', 'sinh_hoc']
// KHXH subjects
const khxhSubjects = ['lich_su', 'dia_li', 'gdcd']

const COLORS = {
  khtn: "#3b82f6",
  khxh: "#f59e0b",
  both: "#8b5cf6",
}

export function ParticipationChart({ data }: { data: Record<string, YearData> }) {
  const [selectedYear, setSelectedYear] = React.useState("2024")

  const yearData = data[selectedYear]
  if (!yearData) return null

  // Estimate KHTN vs KHXH participants
  // A student who takes any KHTN subject is KHTN, same for KHXH
  const maxKHTN = Math.max(...khtnSubjects.map(s => yearData.participants[s] || 0))
  const maxKHXH = Math.max(...khxhSubjects.map(s => yearData.participants[s] || 0))

  const pieData = [
    { name: "KHTN", value: maxKHTN, fill: "var(--color-khtn)" },
    { name: "KHXH", value: maxKHXH, fill: "var(--color-khxh)" },
  ]

  const pieConfig = {
    khtn: {
      label: "Khoa học Tự nhiên",
      color: COLORS.khtn,
    },
    khxh: {
      label: "Khoa học Xã hội",
      color: COLORS.khxh,
    },
  } satisfies ChartConfig

  // Bar chart: participants per subject
  const subjectMap: Record<string, string> = {
    toan: "Toán",
    ngu_van: "Văn",
    ngoai_ngu: "Anh",
    vat_li: "Lí",
    hoa_hoc: "Hóa",
    sinh_hoc: "Sinh",
    lich_su: "Sử",
    dia_li: "Địa",
    gdcd: "GDCD",
  }

  const barData = Object.keys(subjectMap)
    .filter(s => yearData.participants[s] > 0)
    .map(s => ({
      subject: subjectMap[s],
      participants: yearData.participants[s],
      fill: khtnSubjects.includes(s) ? COLORS.khtn
        : khxhSubjects.includes(s) ? COLORS.khxh
        : COLORS.both,
    }))
    .sort((a, b) => b.participants - a.participants)

  const barConfig = {
    participants: {
      label: "Số thí sinh",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="space-y-1">
          <CardTitle>Thống kê thí sinh theo tổ hợp</CardTitle>
          <CardDescription>
            Tỉ lệ KHTN vs KHXH & số lượng bài thi theo môn
          </CardDescription>
        </div>
        <Select
          value={selectedYear}
          onValueChange={(val) => { if (val) setSelectedYear(val) }}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2023">2023</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Pie chart */}
          <div>
            <h4 className="mb-2 text-sm font-medium text-muted-foreground text-center">Tỉ lệ KHTN / KHXH</h4>
            <ChartContainer config={pieConfig} className="h-[250px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  strokeWidth={2}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          </div>

          {/* Bar chart */}
          <div>
            <h4 className="mb-2 text-sm font-medium text-muted-foreground text-center">Số bài thi theo môn</h4>
            <ChartContainer config={barConfig} className="h-[250px] w-full">
              <BarChart
                data={barData}
                layout="vertical"
                margin={{ left: 0, right: 30 }}
              >
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <YAxis
                  dataKey="subject"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={5}
                  width={40}
                  fontSize={12}
                />
                <XAxis
                  type="number"
                  tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                  hide
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                />
                <Bar dataKey="participants" radius={4}>
                  {barData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
