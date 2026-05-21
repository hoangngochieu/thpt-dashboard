"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
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
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CheckIcon, XIcon, SearchIcon, FilterIcon, CalendarIcon, MapIcon, BookOpenIcon } from "lucide-react"

// Types
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

interface ComparisonToolProps {
  provinceData: Record<string, ProvinceYearData>
}

// Subject options
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
  khtn: "Khối KHTN (TB Lí-Hóa-Sinh)",
  khxh: "Khối KHXH (TB Sử-Địa-GDCD)",
  overall: "Tất cả môn (TB Chung)",
}

// Visual color palette for compared locations
const LOCATION_COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // emerald
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
]

export function ComparisonTool({ provinceData }: ComparisonToolProps) {
  // State for Option 1: Subject
  const [selectedSubject, setSelectedSubject] = useState<string>("toan")

  // State for Option 2: Location Type & Selections
  const [locationType, setLocationType] = useState<"province" | "region">("province")
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>(["HàNội", "HồChíMinh", "NamĐịnh"])
  const [selectedRegions, setSelectedRegions] = useState<string[]>([
    "Đồng bằng sông Hồng",
    "Đông Nam Bộ",
  ])
  const [searchQuery, setSearchQuery] = useState<string>("")

  // State for Option 3: Years
  const [selectedYears, setSelectedYears] = useState<string[]>(["2023", "2024", "2025"])

  // Extract all unique provinces with display names
  const provincesList = useMemo(() => {
    const provinceMap = new Map<string, { displayName: string; region: string }>()
    Object.keys(provinceData).forEach((year) => {
      const yearProvinces = provinceData[year] || {}
      Object.keys(yearProvinces).forEach((key) => {
        provinceMap.set(key, {
          displayName: yearProvinces[key].displayName,
          region: yearProvinces[key].region,
        })
      })
    })

    return Array.from(provinceMap.entries())
      .map(([key, value]) => ({
        key,
        displayName: value.displayName,
        region: value.region,
      }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName, "vi"))
  }, [provinceData])

  // Extract all unique regions
  const regionsList = useMemo(() => {
    const regions = new Set<string>()
    Object.keys(provinceData).forEach((year) => {
      const yearProvinces = provinceData[year] || {}
      Object.values(yearProvinces).forEach((prov) => {
        if (prov.region) regions.add(prov.region)
      })
    })
    return Array.from(regions).sort()
  }, [provinceData])

  // Filter provinces list based on search query
  const filteredProvinces = useMemo(() => {
    if (!searchQuery.trim()) return provincesList
    const query = searchQuery.toLowerCase()
    return provincesList.filter(
      (p) =>
        p.displayName.toLowerCase().includes(query) ||
        p.region.toLowerCase().includes(query)
    )
  }, [provincesList, searchQuery])

  // Toggle selection helper
  const toggleProvince = (provinceKey: string) => {
    setSelectedProvinces((prev) => {
      if (prev.includes(provinceKey)) {
        if (prev.length <= 1) return prev // keep at least one
        return prev.filter((k) => k !== provinceKey)
      } else {
        if (prev.length >= 6) return prev // limit to 6 for chart readability
        return [...prev, provinceKey]
      }
    })
  }

  const toggleRegion = (regionName: string) => {
    setSelectedRegions((prev) => {
      if (prev.includes(regionName)) {
        if (prev.length <= 1) return prev // keep at least one
        return prev.filter((r) => r !== regionName)
      } else {
        if (prev.length >= 6) return prev // limit to 6 for chart readability
        return [...prev, regionName]
      }
    })
  }

  const toggleYear = (year: string) => {
    setSelectedYears((prev) => {
      if (prev.includes(year)) {
        if (prev.length <= 1) return prev // keep at least one
        return prev.filter((y) => y !== year)
      } else {
        return [...prev, year].sort()
      }
    })
  }

  // Active locations to compare based on active location type
  const activeLocations = useMemo(() => {
    return locationType === "province" ? selectedProvinces : selectedRegions
  }, [locationType, selectedProvinces, selectedRegions])

  // Get display name for active locations
  const getLocationDisplayName = (key: string) => {
    if (locationType === "province") {
      const match = provincesList.find((p) => p.key === key)
      return match ? match.displayName : key
    }
    return key
  }

  // Calculate score value for a specific subject
  const getScoreValue = (province: ProvinceData | undefined, subjectKey: string): number => {
    if (!province) return 0
    if (subjectKey === "overall") return province.overallAverage || 0
    if (subjectKey === "khtn") {
      const l = province.averageScores?.vat_li || 0
      const h = province.averageScores?.hoa_hoc || 0
      const s = province.averageScores?.sinh_hoc || 0
      const values = [l, h, s].filter((v) => v > 0)
      return values.length > 0 ? parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)) : 0
    }
    if (subjectKey === "khxh") {
      const su = province.averageScores?.lich_su || 0
      const d = province.averageScores?.dia_li || 0
      const g = province.averageScores?.gdcd || 0
      const values = [su, d, g].filter((v) => v > 0)
      return values.length > 0 ? parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)) : 0
    }
    return province.averageScores?.[subjectKey] || 0
  }

  // Calculate region average score
  const getRegionAverage = (year: string, regionName: string, subjectKey: string): number => {
    const yearData = provinceData[year]
    if (!yearData) return 0

    let sum = 0
    let count = 0

    Object.values(yearData).forEach((prov) => {
      if (prov.region === regionName) {
        const score = getScoreValue(prov, subjectKey)
        if (score > 0) {
          sum += score
          count++
        }
      }
    })

    return count > 0 ? parseFloat((sum / count).toFixed(2)) : 0
  }

  // Format Recharts data
  // Output structure: [{ year: "2023", "Hà Nội": 6.5, "TP. HCM": 6.8 }, ...]
  const chartData = useMemo(() => {
    return selectedYears.map((year) => {
      const row: Record<string, any> = { year: `Năm ${year}` }
      activeLocations.forEach((loc) => {
        if (locationType === "province") {
          const provData = provinceData[year]?.[loc]
          row[loc] = provData ? getScoreValue(provData, selectedSubject) : 0
        } else {
          row[loc] = getRegionAverage(year, loc, selectedSubject)
        }
      })
      return row
    })
  }, [provinceData, selectedSubject, locationType, activeLocations, selectedYears])

  // Recharts Chart Config
  const chartConfig = useMemo(() => {
    const config: ChartConfig = {}
    activeLocations.forEach((loc) => {
      config[loc] = {
        label: getLocationDisplayName(loc),
      }
    })
    return config
  }, [activeLocations, locationType, provincesList])

  return (
    <Card className="w-full shadow-md border-border/80 bg-card">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <BookOpenIcon className="size-5 text-indigo-500" />
          <span>Bộ Công cụ So sánh Tùy chọn 📊</span>
        </CardTitle>
        <CardDescription>
          Tự do kết hợp môn học/khối thi, phạm vi địa lý (tỉnh thành hoặc vùng) và các năm thi để tự so sánh kết quả điểm thi.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded-xl bg-slate-50/50 dark:bg-zinc-900/30 border border-border/60">
          
          {/* OPTION 1: Subject Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <FilterIcon className="size-3.5 text-indigo-500" />
              <span>1. Chọn môn / khối thi</span>
            </label>
            <div className="h-44 overflow-y-auto border rounded-md p-2 bg-background space-y-1 custom-scrollbar">
              {Object.entries(subjectMap).map(([key, name]) => (
                <button
                  key={key}
                  onClick={() => setSelectedSubject(key)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-sm text-xs font-medium transition-all flex items-center justify-between ${
                    selectedSubject === key
                      ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <span>{name}</span>
                  {selectedSubject === key && <CheckIcon className="size-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* OPTION 2: Location Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <MapIcon className="size-3.5 text-indigo-500" />
              <span>2. Chọn địa lý so sánh</span>
            </label>
            
            {/* Toggle Location Type */}
            <div className="grid grid-cols-2 gap-1 bg-muted p-0.5 rounded-md text-xs">
              <button
                onClick={() => setLocationType("province")}
                className={`py-1 rounded-sm font-medium transition-all ${
                  locationType === "province" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
                }`}
              >
                Tỉnh thành
              </button>
              <button
                onClick={() => setLocationType("region")}
                className={`py-1 rounded-sm font-medium transition-all ${
                  locationType === "region" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
                }`}
              >
                Vùng địa lý
              </button>
            </div>

            {/* List with search for provinces */}
            {locationType === "province" ? (
              <div className="space-y-2">
                <div className="relative">
                  <SearchIcon className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Tìm tỉnh thành..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8 text-xs bg-background"
                  />
                </div>
                <div className="h-28 overflow-y-auto border rounded-md p-1.5 bg-background space-y-0.5 custom-scrollbar">
                  {filteredProvinces.map((p) => {
                    const isSelected = selectedProvinces.includes(p.key)
                    return (
                      <button
                        key={p.key}
                        onClick={() => toggleProvince(p.key)}
                        className={`w-full text-left px-2 py-1 rounded-sm text-xs transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <span className="truncate">{p.displayName}</span>
                        {isSelected && <CheckIcon className="size-3" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              /* Regions List */
              <div className="h-38 overflow-y-auto border rounded-md p-1.5 bg-background space-y-0.5 custom-scrollbar">
                {regionsList.map((r) => {
                  const isSelected = selectedRegions.includes(r)
                  return (
                    <button
                      key={r}
                      onClick={() => toggleRegion(r)}
                      className={`w-full text-left px-2 py-1 rounded-sm text-xs transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <span className="truncate text-[11px]">{r}</span>
                      {isSelected && <CheckIcon className="size-3" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* OPTION 3: Years Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <CalendarIcon className="size-3.5 text-indigo-500" />
              <span>3. Chọn năm thi</span>
            </label>
            <div className="flex flex-col gap-2 p-2 border rounded-md bg-background h-44 justify-center">
              {["2023", "2024", "2025"].map((yr) => {
                const isSelected = selectedYears.includes(yr)
                return (
                  <button
                    key={yr}
                    onClick={() => toggleYear(yr)}
                    className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-md border text-sm font-semibold transition-all ${
                      isSelected
                        ? "bg-primary border-primary text-primary-foreground shadow-sm"
                        : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <div className={`size-4 rounded-sm border flex items-center justify-center ${
                      isSelected ? "border-primary-foreground bg-primary-foreground/20" : "border-muted-foreground/30"
                    }`}>
                      {isSelected && <CheckIcon className="size-3 text-primary-foreground stroke-[3px]" />}
                    </div>
                    <span>Năm {yr}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Selected Badges display */}
        <div className="flex flex-wrap gap-1.5 items-center bg-muted/30 p-2 rounded-lg border border-border/40 text-xs">
          <span className="font-semibold text-muted-foreground mr-1.5">So sánh:</span>
          {activeLocations.map((loc, idx) => (
            <Badge
              key={loc}
              variant="secondary"
              className="px-2 py-0.5 rounded-sm flex items-center gap-1 text-[11px] font-medium"
              style={{
                borderLeft: `4px solid ${LOCATION_COLORS[idx % LOCATION_COLORS.length]}`
              }}
            >
              <span>{getLocationDisplayName(loc)}</span>
              <button
                onClick={() => locationType === "province" ? toggleProvince(loc) : toggleRegion(loc)}
                className="hover:bg-muted rounded-full p-0.5"
                disabled={activeLocations.length <= 1}
              >
                <XIcon className="size-2.5" />
              </button>
            </Badge>
          ))}
          <span className="text-[11px] text-muted-foreground ml-auto pl-2 font-medium">
            Môn: <strong className="text-foreground">{subjectMap[selectedSubject]}</strong>
          </span>
        </div>

        {/* Dynamic Chart rendering */}
        <div className="w-full">
          <ChartContainer config={chartConfig} className="h-[360px] w-full">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 10,
                left: 10,
                bottom: 5,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                fontSize={12}
                fontWeight={500}
              />
              <YAxis
                domain={[0, 10]}
                tickLine={false}
                axisLine={false}
                tickMargin={5}
                fontSize={11}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              
              {activeLocations.map((loc, idx) => (
                <Bar
                  key={loc}
                  dataKey={loc}
                  fill={LOCATION_COLORS[idx % LOCATION_COLORS.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
