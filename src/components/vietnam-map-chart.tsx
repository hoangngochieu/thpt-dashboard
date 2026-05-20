"use client"

import * as React from "react"
import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import * as d3Geo from "d3-geo"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

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
  overall: "Tất cả môn (TB)",
}

interface ProvinceData {
  displayName: string
  region: string
  totalStudents: number
  averageScores: Record<string, number>
  overallAverage: number
}

interface ProvinceYearData {
  [province: string]: ProvinceData
}

interface GeoFeature {
  type: string
  properties: { name: string }
  geometry: any
}

interface GeoJSON {
  type: string
  features: GeoFeature[]
}

// 9-class sequential color palette (inspired by ColorBrewer YlGnBu)
// Gives a much richer visual spread than 5 stops
const PALETTE = [
  [165, 0, 38],     // deep red
  [215, 48, 39],    // red
  [244, 109, 67],   // orange-red
  [253, 174, 97],   // light orange
  [254, 224, 139],  // yellow
  [171, 221, 164],  // light green
  [102, 194, 165],  // teal
  [50, 136, 189],   // blue
  [94, 79, 162],    // indigo (highest)
]

// Quantile-based color: ensures even distribution of colors across provinces
function getColorByRank(rank: number, total: number): string {
  if (total <= 0) return "#e5e7eb"
  // rank is 0-indexed, 0 = lowest score
  const t = Math.max(0, Math.min(1, rank / Math.max(1, total - 1)))
  const idx = t * (PALETTE.length - 1)
  const i = Math.floor(idx)
  const f = idx - i
  const c1 = PALETTE[Math.min(i, PALETTE.length - 1)]
  const c2 = PALETTE[Math.min(i + 1, PALETTE.length - 1)]

  const r = Math.round(c1[0] + (c2[0] - c1[0]) * f)
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * f)
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * f)

  return `rgb(${r},${g},${b})`
}

export function VietnamMapChart({
  provinceData,
}: {
  provinceData: Record<string, ProvinceYearData>
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [geoData, setGeoData] = useState<GeoJSON | null>(null)
  const [selectedYear, setSelectedYear] = useState("2024")
  const [selectedSubject, setSelectedSubject] = useState("overall")
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  // Fetch GeoJSON — 34-province map for 2025, 63-province for 2023/2024
  useEffect(() => {
    const geoFile = selectedYear === "2025"
      ? "/vietnam-34provinces.geojson"
      : "/vietnam-simplified.geojson"
    setGeoData(null) // clear while loading
    fetch(geoFile)
      .then(r => r.json())
      .then(data => setGeoData(data))
      .catch(err => console.error("Failed to load GeoJSON:", err))
  }, [selectedYear])

  const yearData = provinceData[selectedYear] || {}

  // Get score for a province
  const getScore = useCallback((provinceName: string): number => {
    const data = yearData[provinceName]
    if (!data) return 0
    if (selectedSubject === "overall") return data.overallAverage
    return data.averageScores[selectedSubject] || 0
  }, [yearData, selectedSubject])

  // Build a sorted ranking of provinces (ascending by score) for quantile coloring
  const sortedProvinces = useMemo(() => {
    return Object.entries(yearData)
      .map(([name, data]) => ({
        name,
        score: selectedSubject === "overall" ? data.overallAverage : (data.averageScores[selectedSubject] || 0),
      }))
      .filter(p => p.score > 0)
      .sort((a, b) => a.score - b.score) // ascending: 0 = lowest
  }, [yearData, selectedSubject])

  // Create a rank lookup: province name → rank index
  const rankMap = useMemo(() => {
    const map: Record<string, number> = {}
    sortedProvinces.forEach((p, i) => { map[p.name] = i })
    return map
  }, [sortedProvinces])

  const totalRanked = sortedProvinces.length
  const minScore = sortedProvinces.length > 0 ? sortedProvinces[0].score : 0
  const maxScore = sortedProvinces.length > 0 ? sortedProvinces[sortedProvinces.length - 1].score : 10

  // D3 projection for Vietnam – fitSize auto-adapts to whichever GeoJSON is loaded
  const width = 400
  const height = 600

  // Compute projection from current geoData bounds so both 63- and 34-province maps render correctly
  const projection = useMemo(() => {
    const proj = d3Geo.geoMercator()
    if (geoData && geoData.features.length > 0) {
      proj.fitSize([width, height], geoData as any)
    } else {
      // Fallback: approximate Vietnam center
      proj.center([106.0, 15.9]).scale(1600).translate([width / 2, height / 2])
    }
    return proj
  }, [geoData, width, height])

  const pathGenerator = useMemo(() => d3Geo.geoPath().projection(projection), [projection])

  // Handle mouse events
  const handleMouseMove = (e: React.MouseEvent, provinceName: string) => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (rect) {
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
    setHoveredProvince(provinceName)
  }

  const handleMouseLeave = () => {
    setHoveredProvince(null)
  }

  // Get hovered province data
  const hoveredData = hoveredProvince ? yearData[hoveredProvince] : null
  const hoveredScore = hoveredProvince ? getScore(hoveredProvince) : 0
  const hoveredRank = hoveredProvince && rankMap[hoveredProvince] !== undefined
    ? totalRanked - rankMap[hoveredProvince]
    : null

  // Ranking table (sorted by score descending)
  const rankedProvinces = useMemo(() =>
    [...sortedProvinces].reverse().map((p, i) => ({
      ...p,
      displayName: yearData[p.name]?.displayName || p.name,
      region: yearData[p.name]?.region || '',
      students: yearData[p.name]?.totalStudents || 0,
      rank: i,
    }))
  , [sortedProvinces, yearData])

  // Available subjects for selected year
  const availableSubjects = new Set<string>()
  Object.values(yearData).forEach(d => {
    Object.keys(d.averageScores).forEach(s => availableSubjects.add(s))
  })

  // Build legend stops
  const legendStops = PALETTE.map((c, i) => {
    const t = i / (PALETTE.length - 1)
    const score = minScore + t * (maxScore - minScore)
    return { color: `rgb(${c[0]},${c[1]},${c[2]})`, score }
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between flex-wrap gap-2">
        <div className="space-y-1">
          <CardTitle>🗺️ Bản đồ điểm thi theo tỉnh/thành</CardTitle>
          <CardDescription>
            Tô đậm theo thứ hạng — đỏ (thấp nhất) → tím (cao nhất)
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Select value={selectedSubject} onValueChange={(val) => { if (val) setSelectedSubject(val) }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overall">Tất cả (TB)</SelectItem>
              {Array.from(availableSubjects).map(s => (
                <SelectItem key={s} value={s}>{subjectMap[s] || s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={(val) => { if (val) setSelectedYear(val) }}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Map */}
          <div className="relative flex items-center justify-center">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${width} ${height}`}
              className="w-full max-w-[400px] h-auto"
              style={{ maxHeight: "600px" }}
            >
              {geoData?.features.map((feature, i) => {
                const provinceName = feature.properties.name
                const rank = rankMap[provinceName]
                const hasData = rank !== undefined
                const fill = hasData
                  ? getColorByRank(rank, totalRanked)
                  : "#e5e7eb"
                const isHovered = hoveredProvince === provinceName
                const d = pathGenerator(feature as any) || ""

                return (
                  <path
                    key={i}
                    d={d}
                    fill={fill}
                    stroke={isHovered ? "#1e293b" : "#ffffff"}
                    strokeWidth={isHovered ? 2 : 0.5}
                    opacity={isHovered ? 1 : 0.9}
                    className="transition-all duration-150 cursor-pointer"
                    onMouseMove={(e) => handleMouseMove(e, provinceName)}
                    onMouseLeave={handleMouseLeave}
                  />
                )
              })}
            </svg>

            {/* Tooltip */}
            {hoveredProvince && hoveredData && (
              <div
                className="pointer-events-none absolute z-50 rounded-lg border bg-popover p-3 shadow-lg text-sm"
                style={{
                  left: Math.min(tooltipPos.x + 15, 280),
                  top: tooltipPos.y - 10,
                  minWidth: 200,
                }}
              >
                <div className="font-semibold text-base">{hoveredData.displayName}</div>
                <div className="text-muted-foreground text-xs mb-2">{hoveredData.region}</div>
                <div className="flex justify-between gap-4">
                  <span>Điểm TB:</span>
                  <Badge variant={hoveredScore >= 7 ? "default" : hoveredScore >= 5 ? "secondary" : "destructive"}>
                    {hoveredScore}
                  </Badge>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Xếp hạng:</span>
                  <span className="font-medium text-foreground">{hoveredRank}/{totalRanked}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Số thí sinh:</span>
                  <span>{hoveredData.totalStudents.toLocaleString('vi-VN')}</span>
                </div>
              </div>
            )}

            {/* Color Legend */}
            <div className="absolute bottom-2 left-2 flex flex-col gap-1 bg-background/90 p-2.5 rounded-md text-xs backdrop-blur-sm border shadow-sm">
              <span className="font-medium mb-1">Thang điểm (theo hạng)</span>
              <div className="flex items-center gap-0.5">
                {PALETTE.map((c, i) => (
                  <div
                    key={i}
                    className="h-3 flex-1 first:rounded-l-sm last:rounded-r-sm"
                    style={{ backgroundColor: `rgb(${c[0]},${c[1]},${c[2]})`, minWidth: 12 }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{minScore.toFixed(1)}</span>
                <span className="text-[10px]">trung vị</span>
                <span>{maxScore.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Ranking Table */}
          <div className="max-h-[580px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-background border-b z-10">
                <tr>
                  <th className="text-left py-2 px-1 font-medium">#</th>
                  <th className="text-left py-2 px-1 font-medium">Tỉnh/Thành</th>
                  <th className="text-right py-2 px-1 font-medium">Điểm TB</th>
                  <th className="text-right py-2 px-1 font-medium">Số TS</th>
                </tr>
              </thead>
              <tbody>
                {rankedProvinces.map((p, i) => {
                  const pRank = rankMap[p.name]
                  const color = pRank !== undefined ? getColorByRank(pRank, totalRanked) : "#e5e7eb"
                  return (
                    <tr
                      key={p.name}
                      className={`border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer ${
                        hoveredProvince === p.name ? 'bg-muted' : ''
                      }`}
                      onMouseEnter={() => setHoveredProvince(p.name)}
                      onMouseLeave={() => setHoveredProvince(null)}
                    >
                      <td className="py-1.5 px-1 tabular-nums text-muted-foreground">{i + 1}</td>
                      <td className="py-1.5 px-1">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-3 h-3 rounded-sm flex-shrink-0 border border-border/30"
                            style={{ backgroundColor: color }}
                          />
                          <span className="truncate">{p.displayName}</span>
                        </div>
                      </td>
                      <td className="py-1.5 px-1 text-right tabular-nums font-medium">{p.score}</td>
                      <td className="py-1.5 px-1 text-right tabular-nums text-muted-foreground text-xs">{p.students.toLocaleString('vi-VN')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
