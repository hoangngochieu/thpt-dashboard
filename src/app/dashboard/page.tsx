"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SectionCards } from "@/components/section-cards"
import { AverageScoreChart } from "@/components/average-score-chart"
import { ScoreDistributionChart } from "@/components/score-distribution-chart"
import { YearComparisonChart } from "@/components/year-comparison-chart"
import { SubjectTrendChart } from "@/components/subject-trend-chart"
import { ParticipationChart } from "@/components/participation-chart"
import { ScoreStatsTable } from "@/components/score-stats-table"
import { VietnamMapChart } from "@/components/vietnam-map-chart"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

import rawData from "./data.json"
import provinceRawData from "./province-data.json"

// Extract the years data
const yearsData = rawData.years as Record<string, any>
const provinceData = provinceRawData.provinces as Record<string, any>

export default function Page() {
  const [currentYear, setCurrentYear] = useState("2024")

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
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Year Tabs */}
              <div className="px-4 lg:px-6">
                <Tabs value={currentYear} onValueChange={setCurrentYear}>
                  <TabsList className="grid w-full max-w-md grid-cols-3">
                    <TabsTrigger value="2023">📅 2023</TabsTrigger>
                    <TabsTrigger value="2024">📅 2024</TabsTrigger>
                    <TabsTrigger value="2025">📅 2025</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Section 1: KPI Cards */}
              <div id="overview" className="scroll-mt-16">
                <SectionCards currentYear={currentYear} data={yearsData} />
              </div>

              {/* Section 2: Average Scores (Grouped Bar) + Score Distribution (Area Overlay) */}
              <div id="average" className="grid gap-4 px-4 lg:grid-cols-2 lg:px-6 scroll-mt-16">
                <AverageScoreChart data={yearsData} />
                <ScoreDistributionChart data={yearsData} />
              </div>

              {/* Section 3: Radar + Line Trend */}
              <div id="comparison" className="grid gap-4 px-4 lg:grid-cols-2 lg:px-6 scroll-mt-16">
                <YearComparisonChart data={yearsData} />
                <SubjectTrendChart data={yearsData} />
              </div>

              {/* Section 4: Participation Chart */}
              <div id="distribution" className="px-4 lg:px-6 scroll-mt-16">
                <ParticipationChart data={yearsData} />
              </div>

              {/* Section 5: Vietnam Map - Province Comparison */}
              <div id="map" className="px-4 lg:px-6 scroll-mt-16">
                <VietnamMapChart provinceData={provinceData} />
              </div>

              {/* Section 6: Stats Table */}
              <div id="stats" className="px-4 lg:px-6 scroll-mt-16">
                <ScoreStatsTable data={yearsData} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
