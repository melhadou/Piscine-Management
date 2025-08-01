"use client"

import type * as React from "react"
import {
  BarChart3,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Users,
  FileText,
  Trophy,
  Upload,
  Settings,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
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
  useSidebar,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Staff Member",
    email: "staff@42school.fr",
    avatar: "/placeholder-user.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
      isActive: true,
    },
    {
      title: "Students",
      url: "/students",
      icon: Users,
    },
    {
      title: "Notes",
      url: "/notes",
      icon: FileText,
    },
    {
      title: "Rush Evaluation",
      url: "/rush-evaluation",
      icon: Trophy,
    },
  ],
  navSecondary: [
    {
      title: "Import Data",
      url: "/import",
      icon: Upload,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
  ],
  projects: [
    {
      name: "C Piscine",
      url: "#",
      icon: Frame,
    },
    {
      name: "Rush Projects",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Evaluations",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isMobile, setOpenMobile } = useSidebar()

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#" onClick={handleLinkClick}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Piscine Management</span>
                  <span className="truncate text-xs">42 School Dashboard</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} onLinkClick={handleLinkClick} />
        <NavProjects projects={data.projects} onLinkClick={handleLinkClick} />
        <NavSecondary items={data.navSecondary} onLinkClick={handleLinkClick} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} onLinkClick={handleLinkClick} />
      </SidebarFooter>
    </Sidebar>
  )
}
