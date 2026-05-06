"use client"

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { UsersIcon, BookOpenIcon, Edit3Icon, GlobeIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react"

interface YearData {
  totalStudents: number
  averageScores: Record<string, number>
  participants: Record<string, number>
}

function TrendBadge({ current, previous, suffix = "" }: { current: number; previous?: number; suffix?: string }) {
  if (!previous) return null
  const diff = current - previous
  const pct = ((diff / previous) * 100).toFixed(1)
  const isUp = diff > 0

  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isUp ? 'text-emerald-600' : 'text-red-500'}`}>
      {isUp ? <TrendingUpIcon className="size-3" /> : <TrendingDownIcon className="size-3" />}
      {isUp ? '+' : ''}{suffix === 'điểm' ? diff.toFixed(2) : pct + '%'}
    </span>
  )
}

export function SectionCards({
  currentYear,
  data
}: {
  currentYear: string
  data: Record<string, YearData>
}) {
  const current = data[currentYear]
  const prevYear = (parseInt(currentYear) - 1).toString()
  const prev = data[prevYear]

  if (!current) return null

  const cards = [
    {
      label: "Tổng số thí sinh",
      value: current.totalStudents.toLocaleString('vi-VN'),
      icon: UsersIcon,
      detail: `Kỳ thi THPT ${currentYear}`,
      subtext: "Dữ liệu thống kê toàn quốc",
      trend: prev ? <TrendBadge current={current.totalStudents} previous={prev.totalStudents} /> : null,
    },
    {
      label: "Điểm trung bình Toán",
      value: current.averageScores.toan,
      icon: BookOpenIcon,
      detail: `${current.participants.toan?.toLocaleString('vi-VN') || 0} bài thi`,
      subtext: "Môn thi bắt buộc",
      trend: prev ? <TrendBadge current={current.averageScores.toan} previous={prev.averageScores.toan} suffix="điểm" /> : null,
    },
    {
      label: "Điểm trung bình Ngữ Văn",
      value: current.averageScores.ngu_van,
      icon: Edit3Icon,
      detail: `${current.participants.ngu_van?.toLocaleString('vi-VN') || 0} bài thi`,
      subtext: "Môn thi bắt buộc",
      trend: prev ? <TrendBadge current={current.averageScores.ngu_van} previous={prev.averageScores.ngu_van} suffix="điểm" /> : null,
    },
    {
      label: "Điểm trung bình Ngoại Ngữ",
      value: current.averageScores.ngoai_ngu,
      icon: GlobeIcon,
      detail: `${current.participants.ngoai_ngu?.toLocaleString('vi-VN') || 0} bài thi`,
      subtext: "Đa số là tiếng Anh (N1)",
      trend: prev ? <TrendBadge current={current.averageScores.ngoai_ngu} previous={prev.averageScores.ngoai_ngu} suffix="điểm" /> : null,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {cards.map((card, i) => (
        <Card key={i} className="@container/card">
          <CardHeader>
            <CardDescription>{card.label}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center gap-2">
              {card.value}
              {card.trend}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {card.detail} <card.icon className="size-4" />
            </div>
            <div className="text-muted-foreground">
              {card.subtext}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
