"use client"
import type * as React from "react"
import { useSession } from "next-auth/react"
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

const defaultNavItems = {
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
		// {
		// 	title: "Support",
		// 	url: "#",
		// 	icon: LifeBuoy,
		// },
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

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
	hideSidebar?: boolean
}

export function AppSidebar({ hideSidebar = false, ...props }: AppSidebarProps) {
	const { data: session, status } = useSession()
	const { isMobile, setOpenMobile } = useSidebar()

	const handleLinkClick = () => {
		if (isMobile) {
			setOpenMobile(false)
		}
	}

	// Hide sidebar if hideSidebar prop is true or user is not authenticated
	if (hideSidebar || status === "loading" || !session) {
		return null
	}

	// Use session data for user info
	const userData = {
		name: session.user?.name || "User",
		email: session.user?.email || "user@example.com",
		avatar: session.user?.image || "/placeholder-user.jpg",
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
				<NavMain items={defaultNavItems.navMain} onLinkClick={handleLinkClick} />
				<NavProjects projects={defaultNavItems.projects} onLinkClick={handleLinkClick} />
				<NavSecondary items={defaultNavItems.navSecondary} onLinkClick={handleLinkClick} className="mt-auto" />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={userData} onLinkClick={handleLinkClick} />
			</SidebarFooter>
		</Sidebar>
	)
}
