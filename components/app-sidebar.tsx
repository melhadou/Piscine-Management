"use client"

import { Home, Settings, Users, Upload, BarChart3, FileText, Trophy } from "lucide-react"
import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Students",
    url: "/students",
    icon: Users,
  },
  {
    title: "Import Data",
    url: "/import",
    icon: Upload,
  },
  {
    title: "Notes",
    url: "/notes",
    icon: FileText,
  },
]

const disabledItems = [
  {
    title: "Analytics",
    url: "#",
    icon: BarChart3,
    disabled: true,
  },
  {
    title: "Rush Projects",
    url: "#",
    icon: Trophy,
    disabled: true,
  },
]

const adminItems = [
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Piscine Manager</h2>
            <p className="text-xs text-muted-foreground">Student Management</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Coming Soon</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {disabledItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton disabled className="opacity-50 cursor-not-allowed">
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t px-6 py-4">
        <div className="text-xs text-muted-foreground">
          <p>Piscine Management v1.0</p>
          <p>© 2024 Internal Tool</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
