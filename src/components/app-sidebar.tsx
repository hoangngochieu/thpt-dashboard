"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
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
  Settings2Icon,
  CircleHelpIcon,
  GraduationCapIcon,
} from "lucide-react"

const data = {
  user: {
    name: "Hoàng Ngọc Hiếu",
    email: "hieu@student.edu.vn",
    avatar: "",
  },
  navMain: [
    {
      title: "Tổng quan",
      url: "#overview",
      icon: (
        <LayoutDashboardIcon />
      ),
    },
    {
      title: "Điểm TB theo môn",
      url: "#average",
      icon: (
        <BarChart3Icon />
      ),
    },
    {
      title: "Phổ điểm",
      url: "#distribution",
      icon: (
        <TrendingUpIcon />
      ),
    },
    {
      title: "So sánh năm",
      url: "#comparison",
      icon: (
        <PieChartIcon />
      ),
    },
    {
      title: "Bản đồ tỉnh/thành",
      url: "#map",
      icon: (
        <MapPinIcon />
      ),
    },
    {
      title: "Bảng thống kê",
      url: "#stats",
      icon: (
        <TableIcon />
      ),
    },
  ],
  navSecondary: [
    {
      title: "Cài đặt",
      url: "#",
      icon: (
        <Settings2Icon />
      ),
    },
    {
      title: "Trợ giúp",
      url: "#",
      icon: (
        <CircleHelpIcon />
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
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
