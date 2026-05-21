"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  BarChart3Icon,
  TrendingUpIcon,
  PieChartIcon,
  TableIcon,
  MapPinIcon,
  GraduationCapIcon,
  BookOpenIcon,
  SlidersIcon,
  LineChartIcon,
} from "lucide-react"

const data = {
  user: {
    name: "Hoàng Ngọc Hiệu",
    email: "hoangngochieutin92018@gmail.com",
    avatar: "",
  },
  navMain: [
    {
      title: "Tổng quan Kỳ thi",
      url: "#overview",
      icon: (
        <LayoutDashboardIcon />
      ),
    },
    {
      title: "Hành trình Dữ liệu 📖",
      url: "/dashboard/story",
      icon: (
        <BookOpenIcon />
      ),
    },
    {
      title: "Điểm số theo Môn học",
      url: "#average-scores",
      icon: (
        <BarChart3Icon />
      ),
    },
    {
      title: "Phổ điểm & Phân hóa",
      url: "#score-distribution",
      icon: (
        <TrendingUpIcon />
      ),
    },
    {
      title: "Cơ cấu & Tổ hợp thi",
      url: "#participation-stats",
      icon: (
        <PieChartIcon />
      ),
    },
    {
      title: "Biến động & Xu hướng",
      url: "#year-trends",
      icon: (
        <LineChartIcon />
      ),
    },
    {
      title: "Phân bố Địa lý",
      url: "#geographic-map",
      icon: (
        <MapPinIcon />
      ),
    },
    {
      title: "Thống kê Địa phương",
      url: "#stats-table",
      icon: (
        <TableIcon />
      ),
    },
    {
      title: "Công cụ So sánh 📊",
      url: "#self-comparison",
      icon: (
        <SlidersIcon />
      ),
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="#" />}
            >
              <GraduationCapIcon className="size-5!" />
              <span className="text-base font-semibold">THPT Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}

