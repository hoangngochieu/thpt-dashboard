"use client"

import * as React from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react"

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
  gdktpl: "GD KT&PL",
  tin_hoc: "Tin Học",
  cong_nghe_cn: "CN Công Nghiệp",
  cong_nghe_nn: "CN Nông Nghiệp",
}

interface YearData {
  averageScores: Record<string, number>
  participants: Record<string, number>
  distributions: Record<string, Record<string, number>>
  scoreRanges: Record<string, { below1: number; above5: number; above8: number; above9: number }>
  statistics: Record<string, { median: number; mode: number; stddev: number; min: number; max: number }>
}

type SortField = 'subject' | 'avg' | 'median' | 'stddev' | 'participants' | 'above5pct' | 'above9pct'
type SortDir = 'asc' | 'desc'

export function ScoreStatsTable({ data }: { data: Record<string, YearData> }) {
  const [selectedYear, setSelectedYear] = React.useState("2024")
  const [sortField, setSortField] = React.useState<SortField>('avg')
  const [sortDir, setSortDir] = React.useState<SortDir>('desc')

  const yearData = data[selectedYear]
  if (!yearData) return null

  const subjects = Object.keys(yearData.participants).filter(s => yearData.participants[s] > 0)

  const rows = subjects.map(sub => {
    const participants = yearData.participants[sub]
    const avg = yearData.averageScores[sub]
    const stats = yearData.statistics?.[sub] || { median: 0, mode: 0, stddev: 0, min: 0, max: 0 }
    const ranges = yearData.scoreRanges?.[sub] || { below1: 0, above5: 0, above8: 0, above9: 0 }

    return {
      key: sub,
      subject: subjectMap[sub] || sub,
      participants,
      avg,
      median: stats.median,
      mode: stats.mode,
      stddev: stats.stddev,
      min: stats.min,
      max: stats.max,
      above5pct: participants > 0 ? +((ranges.above5 / participants) * 100).toFixed(1) : 0,
      above8pct: participants > 0 ? +((ranges.above8 / participants) * 100).toFixed(1) : 0,
      above9pct: participants > 0 ? +((ranges.above9 / participants) * 100).toFixed(1) : 0,
      below1pct: participants > 0 ? +((ranges.below1 / participants) * 100).toFixed(2) : 0,
    }
  })

  // Sort
  rows.sort((a, b) => {
    const aVal = a[sortField as keyof typeof a]
    const bVal = b[sortField as keyof typeof b]
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }
    return sortDir === 'asc'
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number)
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDir === 'asc'
      ? <ArrowUpIcon className="inline size-3 ml-0.5" />
      : <ArrowDownIcon className="inline size-3 ml-0.5" />
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="space-y-1">
          <CardTitle>Bảng thống kê chi tiết</CardTitle>
          <CardDescription>
            Mean, Median, Mode, StdDev, tỉ lệ ≥5, ≥8, 9-10, dưới 1
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:text-foreground select-none"
                  onClick={() => handleSort('subject')}
                >
                  Môn thi <SortIcon field="subject" />
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:text-foreground select-none text-right"
                  onClick={() => handleSort('participants')}
                >
                  Số bài <SortIcon field="participants" />
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:text-foreground select-none text-right"
                  onClick={() => handleSort('avg')}
                >
                  TB <SortIcon field="avg" />
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:text-foreground select-none text-right"
                  onClick={() => handleSort('median')}
                >
                  Median <SortIcon field="median" />
                </TableHead>
                <TableHead className="text-right">Mode</TableHead>
                <TableHead
                  className="cursor-pointer hover:text-foreground select-none text-right"
                  onClick={() => handleSort('stddev')}
                >
                  StdDev <SortIcon field="stddev" />
                </TableHead>
                <TableHead className="text-right">Min</TableHead>
                <TableHead className="text-right">Max</TableHead>
                <TableHead
                  className="cursor-pointer hover:text-foreground select-none text-right"
                  onClick={() => handleSort('above5pct')}
                >
                  ≥5 <SortIcon field="above5pct" />
                </TableHead>
                <TableHead className="text-right">≥8</TableHead>
                <TableHead
                  className="cursor-pointer hover:text-foreground select-none text-right"
                  onClick={() => handleSort('above9pct')}
                >
                  9-10 <SortIcon field="above9pct" />
                </TableHead>
                <TableHead className="text-right">&lt;1</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.key}>
                  <TableCell className="font-medium">{row.subject}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.participants.toLocaleString('vi-VN')}</TableCell>
                  <TableCell className="text-right tabular-nums font-semibold">
                    <Badge variant={row.avg >= 7 ? "default" : row.avg >= 5 ? "secondary" : "destructive"} className="tabular-nums">
                      {row.avg}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{row.median}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.mode}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.stddev}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.min}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.max}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.above5pct}%</TableCell>
                  <TableCell className="text-right tabular-nums">{row.above8pct}%</TableCell>
                  <TableCell className="text-right tabular-nums">
                    <Badge variant="outline" className="tabular-nums">
                      {row.above9pct}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{row.below1pct}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
